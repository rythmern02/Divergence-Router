import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

/**
 * DEMO SCRIPT: Chaos Mode / Thin-Book Revert Simulation ("The Money Shot")
 * Demonstrates on-chain how DivergenceRouter's EVM transaction atomicity
 * completely eliminates legging-in risk when Leg B lacks liquidity or fails.
 */
async function main() {
  console.log("==================================================================");
  console.log(" CHAOS MODE: SIMULATING STARVED-BOOK ATOMIC REVERT");
  console.log("==================================================================");

  const [signer] = await ethers.getSigners();
  console.log("Executing Account:", signer.address);

  // Deploy fresh isolated sandbox contracts
  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const collateral = await MockERC20.deploy("Somnia Testnet USDC", "tUSDC", 6);
  await collateral.waitForDeployment();

  const MockERC6909 = await ethers.getContractFactory("MockERC6909");
  const outcomeToken = await MockERC6909.deploy();
  await outcomeToken.waitForDeployment();

  const MockModule = await ethers.getContractFactory("MockBinaryMarketsModule");
  const binaryModule = await MockModule.deploy(
    await collateral.getAddress(),
    await outcomeToken.getAddress()
  );
  await binaryModule.waitForDeployment();

  const MockSettlement = await ethers.getContractFactory("MockBinarySettlement");
  const settlement = await MockSettlement.deploy(
    await collateral.getAddress(),
    await outcomeToken.getAddress(),
    await binaryModule.getAddress()
  );
  await settlement.waitForDeployment();

  const DivergenceRouter = await ethers.getContractFactory("DivergenceRouter");
  const router = await DivergenceRouter.deploy(
    await binaryModule.getAddress(),
    await settlement.getAddress(),
    await outcomeToken.getAddress(),
    await collateral.getAddress()
  );
  await router.waitForDeployment();

  // Setup Markets
  const LIQUID_MARKET_A = ethers.encodeBytes32String("BTC-15M-LIQUID");
  const STARVED_MARKET_B = ethers.encodeBytes32String("ETH-15M-STARVED");

  // Market A is liquid (Trading)
  await binaryModule.setMarket(
    LIQUID_MARKET_A,
    ethers.ZeroAddress,
    ethers.ZeroAddress,
    1, // Trading
    101n,
    102n,
    BigInt(Math.floor(Date.now() / 1000) + 3600),
    false
  );

  // Market B is deliberately starved / failing mint execution on-chain
  await binaryModule.setMarket(
    STARVED_MARKET_B,
    ethers.ZeroAddress,
    ethers.ZeroAddress,
    1, // Trading
    201n,
    202n,
    BigInt(Math.floor(Date.now() / 1000) + 3600),
    true // shouldFailMint = true (Simulates 0 liquidity / pool reject)
  );

  // Fund User
  const initialBalance = 1_000n * 10n ** 6n; // 1,000 tUSDC
  await collateral.mint(signer.address, initialBalance);
  await collateral.approve(await router.getAddress(), ethers.MaxUint256);

  console.log("\n[STEP 1] Initial State:");
  console.log(` - User Collateral Balance: ${ethers.formatUnits(initialBalance, 6)} tUSDC`);
  console.log(` - Market A Status: Live / Liquid`);
  console.log(` - Market B Status: THIN / STARVED ORDER BOOK (0 counterparty liquidity)`);

  const collateralPerLeg = 250n * 10n ** 6n; // 250 tUSDC per leg (500 tUSDC total)
  const deadline = BigInt(Math.floor(Date.now() / 1000) + 300);

  const legA = { marketId: LIQUID_MARKET_A, choice: 0, minFillAmount: collateralPerLeg };
  const legB = { marketId: STARVED_MARKET_B, choice: 1, minFillAmount: collateralPerLeg };

  console.log("\n[STEP 2] Dispatching 1-Click Atomic Split (BTC-15m ↑ / ETH-15m ↓)...");
  console.log(` - Target Collateral: ${ethers.formatUnits(collateralPerLeg * 2n, 6)} tUSDC`);

  try {
    const tx = await router.openSplit(legA, legB, collateralPerLeg, deadline);
    await tx.wait();
    console.error("❌ ERROR: Transaction should have reverted but succeeded!");
  } catch (err: any) {
    console.log("\n[STEP 3] Transaction Revert Caught as Engineered! 🛡️");
    console.log(` - Revert Reason: "${err.message.includes("Mint execution failed on-chain") ? "Mint execution failed on-chain" : err.message}"`);
  }

  console.log("\n[STEP 4] On-Chain Post-Execution Verification:");
  const balanceAfter = await collateral.balanceOf(signer.address);
  console.log(` - User Collateral Balance: ${ethers.formatUnits(balanceAfter, 6)} tUSDC`);
  console.log(` - Balance Delta: ${ethers.formatUnits(balanceAfter - initialBalance, 6)} tUSDC`);

  const orphanLegAOutcome = await outcomeToken.balanceOf(await router.getAddress(), 101n);
  console.log(` - Orphan Outcome Tokens held by Router: ${orphanLegAOutcome.toString()}`);

  if (balanceAfter === initialBalance && orphanLegAOutcome === 0n) {
    console.log("\n==================================================================");
    console.log(" ✅ VERIFICATION PASSED: ZERO NAKED DIRECTIONAL EXPOSURE");
    console.log(" Because both legs executed sequentially within one EVM function body,");
    console.log(" the failure of Leg B triggered an automatic state rollback of Leg A.");
    console.log(" User funds remained 100% untouched. Legging-in is impossible.");
    console.log("==================================================================");
  } else {
    console.error("❌ VERIFICATION FAILED!");
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
