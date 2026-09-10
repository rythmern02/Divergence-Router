import { ethers } from "hardhat";
import { SomniaMarkets, SOMNIA_TESTNET_ADDRESSES } from "@somnia-chain/markets-sdk";
import { somniaTestnet } from "viem/chains";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const [signer] = await ethers.getSigners();
  const routerAddress = "0xdAf78533193043107dC802E67696E4aB7EB2875F";
  const collateralAddress = "0x70a86D8842FB63C4Ad2b7cdddF530eBf1BB25d8E";

  console.log("==================================================================");
  console.log(" EXECUTING LIVE ATOMIC DIVERGENCE SPLIT ON SOMNIA SHANNON TESTNET");
  console.log(" Signer:", signer.address);
  console.log(" Router:", routerAddress);
  console.log("==================================================================");

  // 1. Connect SDK to discover live active markets
  const ex = new SomniaMarkets({
    chain: somniaTestnet,
    addresses: SOMNIA_TESTNET_ADDRESSES,
    privateKey: process.env.PRIVATE_KEY!,
    wsRpcUrl: "wss://api.infra.testnet.somnia.network/ws",
    indexerUrl: "https://dev.smk.somnia.host/v1/graphql",
  });

  const live = await ex.client.listLiveBinaryMarkets({ limit: 50 });
  const btcMarkets = live.filter((m) => m.asset === "BTC");
  const ethMarkets = live.filter((m) => m.asset === "ETH");

  console.log(`Discovered ${btcMarkets.length} BTC markets and ${ethMarkets.length} ETH markets.`);

  // Find two active markets
  let marketAInfo: any = null;
  let marketBInfo: any = null;

  for (const m of btcMarkets) {
    const oc = await ex.client.getMarketOnchain(m.marketId as `0x${string}`);
    if (oc.status === 1 && !oc.finalized) {
      marketAInfo = oc;
      console.log(`Found live Leg A (BTC): Market ${oc.marketAddress} | Pool ${oc.pool} | YES ID ${oc.yesId}`);
      break;
    }
  }

  for (const m of ethMarkets) {
    const oc = await ex.client.getMarketOnchain(m.marketId as `0x${string}`);
    if (oc.status === 1 && !oc.finalized) {
      marketBInfo = oc;
      console.log(`Found live Leg B (ETH): Market ${oc.marketAddress} | Pool ${oc.pool} | NO ID ${oc.noId}`);
      break;
    }
  }

  if (!marketAInfo || !marketBInfo) {
    throw new Error("Could not find 2 live active markets on testnet right now.");
  }

  // 2. Prepare atomic parameters
  const router = await ethers.getContractAt("DivergenceRouter", routerAddress, signer);
  const collateral = await ethers.getContractAt(
    "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20",
    collateralAddress,
    signer
  );

  const collateralPerLeg = 1_000_000n; // 1 tUSDC (6 decimals)
  const totalCollateral = collateralPerLeg * 2n;

  // Ensure router approval
  const allowance = await collateral.allowance(signer.address, routerAddress);
  if (allowance < totalCollateral) {
    console.log("Approving router for collateral...");
    const appTx = await collateral.approve(routerAddress, ethers.MaxUint256);
    await appTx.wait();
    console.log("Router approved!");
  }

  const deadline = BigInt(Math.floor(Date.now() / 1000) + 600); // 10 minutes

  const legA = {
    market: marketAInfo.marketAddress,
    choice: 0, // 0 = YES / UP
    minFillAmount: collateralPerLeg,
  };

  const legB = {
    market: marketBInfo.marketAddress,
    choice: 1, // 1 = NO / DOWN
    minFillAmount: collateralPerLeg,
  };

  const balBefore = await collateral.balanceOf(signer.address);
  console.log(`Signer balance before: ${ethers.formatUnits(balBefore, 6)} tUSDC`);

  console.log("\n[CALLING openSplit ON-CHAIN]");
  console.log("Leg A Market:", legA.market, "(UP)");
  console.log("Leg B Market:", legB.market, "(DOWN)");
  console.log("Collateral Per Leg:", ethers.formatUnits(collateralPerLeg, 6), "tUSDC");

  const tx = await router.openSplit(legA, legB, collateralPerLeg, deadline, {
    gasLimit: 8000000,
  });

  console.log("Transaction dispatched! Hash:", tx.hash);
  console.log("Waiting for block confirmation on Somnia...");
  const receipt = await tx.wait();
  console.log(`Confirmed in Block: ${receipt?.blockNumber}! Status: ${receipt?.status === 1 ? "SUCCESS (1)" : "REVERT (0)"}`);

  const balAfter = await collateral.balanceOf(signer.address);
  console.log(`Signer balance after: ${ethers.formatUnits(balAfter, 6)} tUSDC`);

  const nextPosId = await router.nextPositionId();
  console.log(`Total Positions Recorded on Router: ${nextPosId.toString()}`);

  const pos = await router.getPosition(nextPosId);
  console.log("Created Position Record on Somnia Testnet:", {
    positionId: nextPosId.toString(),
    user: pos.user,
    marketA: pos.marketA,
    marketB: pos.marketB,
    amountA: ethers.formatUnits(pos.amountA, 6) + " tUSDC",
    amountB: ethers.formatUnits(pos.amountB, 6) + " tUSDC",
    outcomeIdxA: pos.outcomeIdxA === 0 ? "UP" : "DOWN",
    outcomeIdxB: pos.outcomeIdxB === 0 ? "UP" : "DOWN",
    redeemed: pos.redeemed,
  });

  console.log("==================================================================");
  console.log(" LIVE ATOMIC DIVERGENCE SPLIT EXECUTED SUCCESSFULLY ON SOMNIA!");
  console.log(` View Tx: https://shannon-explorer.somnia.network/tx/${tx.hash}`);
  console.log("==================================================================");

  process.exit(0);
}

main().catch(console.error);
