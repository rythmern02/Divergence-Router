import { expect } from "chai";
import { ethers } from "hardhat";
import {
  DivergenceRouter,
  MockERC20,
  MockERC6909,
  MockBinaryPool,
  MockBinaryMarket,
  MockBinarySettlement,
} from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("DivergenceRouter — Atomic Multi-Leg Execution & Payout Netting", function () {
  let router: DivergenceRouter;
  let collateral: MockERC20;
  let outcomeToken: MockERC6909;
  let settlement: MockBinarySettlement;

  let poolA: MockBinaryPool;
  let marketA: MockBinaryMarket;
  let poolB: MockBinaryPool;
  let marketB: MockBinaryMarket;

  let owner: SignerWithAddress;
  let user: SignerWithAddress;
  let attacker: SignerWithAddress;

  const YES_ID_A = 101n;
  const NO_ID_A = 102n;
  const YES_ID_B = 201n;
  const NO_ID_B = 202n;

  const COLLATERAL_PER_LEG = 100n * 10n ** 6n; // 100 tUSDC (6 decimals)
  const TOTAL_COLLATERAL = COLLATERAL_PER_LEG * 2n;

  beforeEach(async function () {
    [owner, user, attacker] = await ethers.getSigners();

    // 1. Deploy Core Mocks
    const MockERC20Factory = await ethers.getContractFactory("MockERC20");
    collateral = await MockERC20Factory.deploy("Somnia Testnet USDC", "tUSDC", 6);
    await collateral.waitForDeployment();

    const MockERC6909Factory = await ethers.getContractFactory("MockERC6909");
    outcomeToken = await MockERC6909Factory.deploy();
    await outcomeToken.waitForDeployment();

    const MockBinarySettlementFactory = await ethers.getContractFactory("MockBinarySettlement");
    settlement = await MockBinarySettlementFactory.deploy(
      await collateral.getAddress(),
      await outcomeToken.getAddress()
    );
    await settlement.waitForDeployment();

    // 2. Deploy Pools & Markets
    const currentBlock = await ethers.provider.getBlock("latest");
    const expiry = BigInt(currentBlock ? currentBlock.timestamp + 3600 : 9999999999);

    const MockPoolFactory = await ethers.getContractFactory("MockBinaryPool");
    poolA = await MockPoolFactory.deploy(
      await collateral.getAddress(),
      await outcomeToken.getAddress(),
      YES_ID_A,
      NO_ID_A
    );
    await poolA.waitForDeployment();

    poolB = await MockPoolFactory.deploy(
      await collateral.getAddress(),
      await outcomeToken.getAddress(),
      YES_ID_B,
      NO_ID_B
    );
    await poolB.waitForDeployment();

    const MockMarketFactory = await ethers.getContractFactory("MockBinaryMarket");
    marketA = await MockMarketFactory.deploy(
      await poolA.getAddress(),
      YES_ID_A,
      NO_ID_A,
      1, // Trading
      expiry
    );
    await marketA.waitForDeployment();

    marketB = await MockMarketFactory.deploy(
      await poolB.getAddress(),
      YES_ID_B,
      NO_ID_B,
      1, // Trading
      expiry
    );
    await marketB.waitForDeployment();

    // 3. Deploy DivergenceRouter
    const DivergenceRouterFactory = await ethers.getContractFactory("DivergenceRouter");
    router = await DivergenceRouterFactory.deploy(
      await settlement.getAddress(),
      await outcomeToken.getAddress(),
      await collateral.getAddress()
    );
    await router.waitForDeployment();

    // 4. Fund User with collateral and approve router
    await collateral.mint(user.address, 10_000n * 10n ** 6n);
    await collateral.connect(user).approve(await router.getAddress(), ethers.MaxUint256);

    // 5. Pre-fund settlement contract for payouts
    await collateral.mint(await settlement.getAddress(), 100_000n * 10n ** 6n);
  });

  describe("Initialization & Approvals", function () {
    it("should initialize with correct immutable contract references", async function () {
      expect(await router.settlement()).to.equal(await settlement.getAddress());
      expect(await router.outcomeToken()).to.equal(await outcomeToken.getAddress());
      expect(await router.collateralToken()).to.equal(await collateral.getAddress());
    });

    it("should authorize settlement as operator on outcomeToken", async function () {
      expect(await outcomeToken.isOperator(await router.getAddress(), await settlement.getAddress())).to.be.true;
    });
  });

  describe("Red Flag 2: Atomic Execution & Rollback Guarantees", function () {
    it("CRITICAL: should revert entire transaction and refund collateral if Leg B fails (Zero Legging-In Risk)", async function () {
      // Set Pool B to fail mint on-chain
      await poolB.setShouldFailMint(true);

      const userBalanceBefore = await collateral.balanceOf(user.address);
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 600);

      const legA = {
        market: await marketA.getAddress(),
        choice: 0, // YES (UP)
        minFillAmount: COLLATERAL_PER_LEG,
      };

      const legB = {
        market: await marketB.getAddress(),
        choice: 1, // NO (DOWN)
        minFillAmount: COLLATERAL_PER_LEG,
      };

      // Transaction MUST revert because Leg B failed
      await expect(
        router.connect(user).openSplit(legA, legB, COLLATERAL_PER_LEG, deadline)
      ).to.be.revertedWith("Mint execution failed on-chain");

      // Verify User's collateral was completely protected (100% refunded by EVM rollback)
      const userBalanceAfter = await collateral.balanceOf(user.address);
      expect(userBalanceAfter).to.equal(userBalanceBefore);

      // Verify Router holds zero orphan outcome tokens from Leg A
      expect(await outcomeToken.balanceOf(await router.getAddress(), YES_ID_A)).to.equal(0n);
      expect(await outcomeToken.balanceOf(await router.getAddress(), NO_ID_A)).to.equal(0n);
    });

    it("should revert if Leg B is not in Trading state (e.g. Locked or Expired)", async function () {
      await marketB.setStatus(2); // Locked

      const deadline = BigInt(Math.floor(Date.now() / 1000) + 600);
      const legA = { market: await marketA.getAddress(), choice: 0, minFillAmount: COLLATERAL_PER_LEG };
      const legB = { market: await marketB.getAddress(), choice: 1, minFillAmount: COLLATERAL_PER_LEG };

      await expect(
        router.connect(user).openSplit(legA, legB, COLLATERAL_PER_LEG, deadline)
      ).to.be.revertedWithCustomError(router, "MarketNotTrading");
    });

    it("should revert if deadline has passed", async function () {
      const pastDeadline = BigInt(Math.floor(Date.now() / 1000) - 10);
      const legA = { market: await marketA.getAddress(), choice: 0, minFillAmount: COLLATERAL_PER_LEG };
      const legB = { market: await marketB.getAddress(), choice: 1, minFillAmount: COLLATERAL_PER_LEG };

      await expect(
        router.connect(user).openSplit(legA, legB, COLLATERAL_PER_LEG, pastDeadline)
      ).to.be.revertedWithCustomError(router, "TransactionExpired");
    });
  });

  describe("Red Flag 1 & 3: Structured Netting & Payout Matrix", function () {
    it("should successfully open a split when both legs are valid", async function () {
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 600);
      const legA = { market: await marketA.getAddress(), choice: 0, minFillAmount: COLLATERAL_PER_LEG }; // Leg A UP
      const legB = { market: await marketB.getAddress(), choice: 1, minFillAmount: COLLATERAL_PER_LEG }; // Leg B DOWN

      const tx = await router.connect(user).openSplit(legA, legB, COLLATERAL_PER_LEG, deadline);
      await expect(tx)
        .to.emit(router, "SplitOpened")
        .withArgs(1n, user.address, await marketA.getAddress(), await marketB.getAddress(), COLLATERAL_PER_LEG, COLLATERAL_PER_LEG);

      const pos = await router.getPosition(1n);
      expect(pos.user).to.equal(user.address);
      expect(pos.marketA).to.equal(await marketA.getAddress());
      expect(pos.marketB).to.equal(await marketB.getAddress());
      expect(pos.outcomeIdxA).to.equal(0);
      expect(pos.outcomeIdxB).to.equal(1);
      expect(pos.amountA).to.equal(COLLATERAL_PER_LEG);
      expect(pos.amountB).to.equal(COLLATERAL_PER_LEG);
      expect(pos.redeemed).to.be.false;

      const userPositions = await router.getUserPositions(user.address);
      expect(userPositions.length).to.equal(1);
      expect(userPositions[0]).to.equal(1n);
    });

    it("Payoff Scenario 1 (Full Decorrelation Win): Leg A UP + Leg B DOWN -> 2x Payout", async function () {
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 600);
      const legA = { market: await marketA.getAddress(), choice: 0, minFillAmount: COLLATERAL_PER_LEG };
      const legB = { market: await marketB.getAddress(), choice: 1, minFillAmount: COLLATERAL_PER_LEG };

      await router.connect(user).openSplit(legA, legB, COLLATERAL_PER_LEG, deadline);

      // Set winning outcomes: YES on A, NO on B
      await settlement.setWinningOutcome(YES_ID_A, true);
      await settlement.setWinningOutcome(NO_ID_B, true);

      const userBalanceBefore = await collateral.balanceOf(user.address);

      const redeemTx = await router.connect(user).redeemSplit(1n);
      await expect(redeemTx)
        .to.emit(router, "SplitRedeemed")
        .withArgs(1n, user.address, TOTAL_COLLATERAL);

      const userBalanceAfter = await collateral.balanceOf(user.address);
      expect(userBalanceAfter - userBalanceBefore).to.equal(TOTAL_COLLATERAL);

      const pos = await router.getPosition(1n);
      expect(pos.redeemed).to.be.true;
    });

    it("Payoff Scenario 2 (Correlation Trap Avoided): Both UP -> 1x Payout (Flat/Net Loss)", async function () {
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 600);
      const legA = { market: await marketA.getAddress(), choice: 0, minFillAmount: COLLATERAL_PER_LEG }; // UP
      const legB = { market: await marketB.getAddress(), choice: 1, minFillAmount: COLLATERAL_PER_LEG }; // DOWN

      await router.connect(user).openSplit(legA, legB, COLLATERAL_PER_LEG, deadline);

      // Both pumped: YES on A, YES on B (User held NO on B, so B pays 0)
      await settlement.setWinningOutcome(YES_ID_A, true);
      await settlement.setWinningOutcome(NO_ID_B, false);

      const userBalanceBefore = await collateral.balanceOf(user.address);

      await router.connect(user).redeemSplit(1n);

      const userBalanceAfter = await collateral.balanceOf(user.address);
      expect(userBalanceAfter - userBalanceBefore).to.equal(COLLATERAL_PER_LEG);
    });

    it("Payoff Scenario 3 (Full Loss): Both Legs Opposite of User Choices -> 0 Payout", async function () {
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 600);
      const legA = { market: await marketA.getAddress(), choice: 0, minFillAmount: COLLATERAL_PER_LEG };
      const legB = { market: await marketB.getAddress(), choice: 1, minFillAmount: COLLATERAL_PER_LEG };

      await router.connect(user).openSplit(legA, legB, COLLATERAL_PER_LEG, deadline);

      // Both wrong
      await settlement.setWinningOutcome(YES_ID_A, false);
      await settlement.setWinningOutcome(NO_ID_B, false);

      const userBalanceBefore = await collateral.balanceOf(user.address);

      await router.connect(user).redeemSplit(1n);

      const userBalanceAfter = await collateral.balanceOf(user.address);
      expect(userBalanceAfter - userBalanceBefore).to.equal(0n);
    });

    it("Security: Reverts if attempting to redeem the same position twice", async function () {
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 600);
      const legA = { market: await marketA.getAddress(), choice: 0, minFillAmount: COLLATERAL_PER_LEG };
      const legB = { market: await marketB.getAddress(), choice: 1, minFillAmount: COLLATERAL_PER_LEG };

      await router.connect(user).openSplit(legA, legB, COLLATERAL_PER_LEG, deadline);
      await settlement.setWinningOutcome(YES_ID_A, true);
      await settlement.setWinningOutcome(NO_ID_B, true);

      await router.connect(user).redeemSplit(1n);

      await expect(router.connect(user).redeemSplit(1n)).to.be.revertedWithCustomError(
        router,
        "AlreadyRedeemed"
      );
    });
  });
});
