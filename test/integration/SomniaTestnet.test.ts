import { expect } from "chai";
import { ethers, network } from "hardhat";
import { DivergenceRouter, IERC20, IERC6909 } from "../../typechain-types";
import * as dotenv from "dotenv";

dotenv.config();

describe("Somnia Shannon Testnet — Live On-Chain Integration Tests", function () {
  this.timeout(120000); // 120s for real testnet RPC & block times

  let router: DivergenceRouter;
  let collateral: IERC20;
  let outcomeToken: IERC6909;
  let signer: any;

  // Newly deployed DivergenceRouter on Somnia Shannon Testnet
  const ROUTER_ADDRESS = "0xdAf78533193043107dC802E67696E4aB7EB2875F";
  const EXPECTED_SETTLEMENT = "0xbF4a49e0Dfd092e5FBE8E5761064C49533e6Ed23";
  const EXPECTED_OUTCOME_TOKEN = "0xB52c5934113Af5c0Bb20eb3C72290C8215f755b9";
  const EXPECTED_COLLATERAL = "0x70a86D8842FB63C4Ad2b7cdddF530eBf1BB25d8E";

  before(async function () {
    if (network.name !== "somniaTestnet") {
      this.skip();
    }

    [signer] = await ethers.getSigners();
    console.log("Running Live Integration Tests with Signer:", signer.address);

    router = await ethers.getContractAt("DivergenceRouter", ROUTER_ADDRESS, signer);
    collateral = await ethers.getContractAt(
      "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20",
      EXPECTED_COLLATERAL,
      signer
    );
    outcomeToken = await ethers.getContractAt("IERC6909", EXPECTED_OUTCOME_TOKEN, signer);
  });

  it("1. Should verify live on-chain contract code at deployed Router address", async function () {
    const code = await ethers.provider.getCode(ROUTER_ADDRESS);
    expect(code.length).to.be.greaterThan(100, "Router must be deployed with bytecode");
    console.log(`Verified Router bytecode length: ${code.length} chars`);
  });

  it("2. Should verify immutable protocol references on Somnia testnet", async function () {
    const settlementAddr = await router.settlement();
    const outcomeAddr = await router.outcomeToken();
    const collateralAddr = await router.collateralToken();

    expect(settlementAddr.toLowerCase()).to.equal(EXPECTED_SETTLEMENT.toLowerCase());
    expect(outcomeAddr.toLowerCase()).to.equal(EXPECTED_OUTCOME_TOKEN.toLowerCase());
    expect(collateralAddr.toLowerCase()).to.equal(EXPECTED_COLLATERAL.toLowerCase());
  });

  it("3. Should verify on-chain authorizations initialized during deployment", async function () {
    // Router should have granted operator permissions to BinarySettlement on OutcomeToken6909
    const isOp = await outcomeToken.isOperator(ROUTER_ADDRESS, EXPECTED_SETTLEMENT);
    expect(isOp).to.be.true;
    console.log("Verified OutcomeToken6909 isOperator(Router, Settlement) == true");
  });

  it("4. Should verify user has positive STT and tUSDC balances on testnet", async function () {
    const nativeBal = await ethers.provider.getBalance(signer.address);
    const tokenBal = await collateral.balanceOf(signer.address);

    console.log(`Live Signer STT: ${ethers.formatEther(nativeBal)} STT`);
    console.log(`Live Signer tUSDC: ${ethers.formatUnits(tokenBal, 6)} tUSDC`);

    expect(nativeBal).to.be.greaterThan(0n, "Signer needs gas for testnet execution");
    expect(tokenBal).to.be.greaterThan(0n, "Signer needs tUSDC for testnet collateral");
  });

  it("5. Should execute real approve transaction on testnet tUSDC for DivergenceRouter", async function () {
    const currentAllowance = await collateral.allowance(signer.address, ROUTER_ADDRESS);
    if (currentAllowance < 1000n * 10n ** 6n) {
      console.log("Submitting approve transaction on Somnia testnet...");
      const tx = await collateral.approve(ROUTER_ADDRESS, ethers.MaxUint256);
      console.log("Approve tx submitted:", tx.hash);
      const receipt = await tx.wait();
      expect(receipt?.status).to.equal(1, "Approve tx must succeed on-chain");
    }

    const updatedAllowance = await collateral.allowance(signer.address, ROUTER_ADDRESS);
    expect(updatedAllowance).to.be.greaterThan(0n);
    console.log(`Verified Router allowance: ${ethers.formatUnits(updatedAllowance, 6)} tUSDC`);
  });

  it("6. Live Atomic Safety: Should revert on testnet when attempting to trade an invalid or non-trading market leg", async function () {
    const initialBalance = await collateral.balanceOf(signer.address);
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 300);

    const nonExistentMarketA = ethers.ZeroAddress;
    const nonExistentMarketB = ethers.ZeroAddress;

    const legA = {
      market: nonExistentMarketA,
      choice: 0,
      minFillAmount: 1n * 10n ** 6n,
    };

    const legB = {
      market: nonExistentMarketB,
      choice: 1,
      minFillAmount: 1n * 10n ** 6n,
    };

    // The router must cleanly revert when market is invalid / non-trading, protecting user funds.
    await expect(
      router.openSplit(legA, legB, 1n * 10n ** 6n, deadline)
    ).to.be.reverted;

    // Verify 100% of collateral remained in user's wallet
    const balanceAfter = await collateral.balanceOf(signer.address);
    expect(balanceAfter).to.equal(initialBalance, "Collateral must be untouched on revert");
    console.log("Verified: Atomic revert triggered on invalid market; 0 collateral lost");
  });

  it("7. Live Atomic Safety: Should revert on testnet when deadline is in the past", async function () {
    const pastDeadline = BigInt(Math.floor(Date.now() / 1000) - 100);

    const legA = {
      market: ethers.ZeroAddress,
      choice: 0,
      minFillAmount: 1n * 10n ** 6n,
    };

    const legB = {
      market: ethers.ZeroAddress,
      choice: 1,
      minFillAmount: 1n * 10n ** 6n,
    };

    await expect(
      router.openSplit(legA, legB, 1n * 10n ** 6n, pastDeadline)
    ).to.be.revertedWithCustomError(router, "TransactionExpired");
    console.log("Verified: TransactionExpired custom error received on past deadline");
  });

  it("8. Live Position Verification: Should read the on-chain executed position 1 and confirm its settled state", async function () {
    const nextPosId = await router.nextPositionId();
    expect(nextPosId).to.be.greaterThanOrEqual(1n, "At least position 1 must exist");

    const pos = await router.getPosition(1);
    expect(pos.user.toLowerCase()).to.equal(signer.address.toLowerCase());
    expect(pos.amountA).to.equal(1_000_000n);
    expect(pos.amountB).to.equal(1_000_000n);
    expect(pos.redeemed).to.be.true;
    console.log(`Verified on-chain Position 1: User ${pos.user}, Redeemed = ${pos.redeemed}`);
  });

  it("9. Live Redemption Protection: Should revert on testnet if attempting to redeem an already-redeemed position", async function () {
    await expect(
      router.redeemSplit(1)
    ).to.be.revertedWithCustomError(router, "AlreadyRedeemed");
    console.log("Verified: AlreadyRedeemed custom error received when calling redeemSplit on settled position");
  });
});
