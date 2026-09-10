import { ethers } from "hardhat";

async function main() {
  const routerAddress = "0xdAf78533193043107dC802E67696E4aB7EB2875F";
  const collateralAddress = "0x70a86D8842FB63C4Ad2b7cdddF530eBf1BB25d8E";
  const [signer] = await ethers.getSigners();

  console.log("==================================================================");
  console.log(" EXECUTING LIVE REDEEM ON SOMNIA SHANNON TESTNET");
  console.log(" Caller / Position Owner:", signer.address);
  console.log(" Router:", routerAddress);
  console.log("==================================================================");

  const router = await ethers.getContractAt("DivergenceRouter", routerAddress, signer);
  const collateral = await ethers.getContractAt(
    "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20",
    collateralAddress,
    signer
  );

  const posId = 1n;
  const posBefore = await router.getPosition(posId);
  console.log(`Position ${posId} redeemed status before: ${posBefore.redeemed}`);
  if (posBefore.redeemed) {
    console.log("Position already redeemed!");
    return;
  }

  const balBefore = await collateral.balanceOf(signer.address);
  console.log(`User collateral balance before: ${ethers.formatUnits(balBefore, 6)} tUSDC`);

  console.log(`\nDispatching router.redeemSplit(${posId}) on Somnia...`);
  const tx = await router.redeemSplit(posId, {
    gasLimit: 3500000,
  });

  console.log("Redeem Tx Hash:", tx.hash);
  console.log("Waiting for confirmation on Somnia block...");
  const receipt = await tx.wait();
  console.log(`Confirmed in Block: ${receipt?.blockNumber}! Status: ${receipt?.status === 1 ? "SUCCESS (1)" : "REVERT (0)"}`);

  const balAfter = await collateral.balanceOf(signer.address);
  console.log(`User collateral balance after: ${ethers.formatUnits(balAfter, 6)} tUSDC`);
  const payout = balAfter - balBefore;
  console.log(`Net Collateral Received: ${ethers.formatUnits(payout, 6)} tUSDC`);

  const posAfter = await router.getPosition(posId);
  console.log(`Position ${posId} redeemed status after: ${posAfter.redeemed}`);

  console.log("==================================================================");
  console.log(" LIVE REDEEM TESTNET EXECUTION COMPLETED SUCCESSFULLY!");
  console.log(` View Tx on Explorer: https://shannon-explorer.somnia.network/tx/${tx.hash}`);
  console.log("==================================================================");
}

main().catch(console.error);
