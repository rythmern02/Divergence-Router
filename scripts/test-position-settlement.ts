import { ethers } from "hardhat";

async function main() {
  const routerAddress = "0xdAf78533193043107dC802E67696E4aB7EB2875F";
  const settlementAddress = "0xbF4a49e0Dfd092e5FBE8E5761064C49533e6Ed23";
  const outcomeTokenAddress = "0xB52c5934113Af5c0Bb20eb3C72290C8215f755b9";
  const collateralAddress = "0x70a86D8842FB63C4Ad2b7cdddF530eBf1BB25d8E";

  const [signer] = await ethers.getSigners();
  const router = await ethers.getContractAt("DivergenceRouter", routerAddress, signer);
  const settlement = new ethers.Contract(
    settlementAddress,
    [
      "function isFinalized(uint256 outcomeId) view returns (bool)",
      "function redeem(uint256 outcomeId, uint256 amount, address to) returns (uint256 collateralOut)",
    ],
    signer
  );
  const outcomeToken = await ethers.getContractAt("IERC6909", outcomeTokenAddress, signer);
  const collateral = await ethers.getContractAt(
    "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20",
    collateralAddress,
    signer
  );

  const pos = await router.getPosition(1);
  console.log("Checking Position 1:");
  console.log("Outcome A ID:", pos.outcomeIdA.toString());
  console.log("Outcome B ID:", pos.outcomeIdB.toString());
  console.log("Amount A:", pos.amountA.toString());
  console.log("Amount B:", pos.amountB.toString());

  const marketA = await ethers.getContractAt("contracts/DivergenceRouter.sol:IBinaryMarket", pos.marketA, signer);
  const marketB = await ethers.getContractAt("contracts/DivergenceRouter.sol:IBinaryMarket", pos.marketB, signer);

  const mABi = [
    "function payoutNumerators() view returns (uint256[])",
    "function isResolved() view returns (bool)",
  ];
  const mAExt = new ethers.Contract(pos.marketA, mABi, signer);
  const mBExt = new ethers.Contract(pos.marketB, mABi, signer);

  const pnA = await mAExt.payoutNumerators();
  const pnB = await mBExt.payoutNumerators();
  console.log("Market A payoutNumerators:", pnA.map((x: any) => x.toString()));
  console.log("Market B payoutNumerators:", pnB.map((x: any) => x.toString()));

  const finA = await settlement.isFinalized(pos.outcomeIdA);
  const finB = await settlement.isFinalized(pos.outcomeIdB);
  console.log("Settlement isFinalized(A):", finA);
  console.log("Settlement isFinalized(B):", finB);

  const routerBalA = await outcomeToken.balanceOf(routerAddress, pos.outcomeIdA);
  const routerBalB = await outcomeToken.balanceOf(routerAddress, pos.outcomeIdB);
  console.log("Router outcomeToken balance A:", routerBalA.toString());
  console.log("Router outcomeToken balance B:", routerBalB.toString());

  const isOperator = await outcomeToken.isOperator(routerAddress, settlementAddress);
  console.log("Settlement is operator for Router on 6909:", isOperator);

  console.log("\nSimulating router.redeemSplit(1)...");
  try {
    const estGas = await router.redeemSplit.estimateGas(1);
    console.log("redeemSplit estimateGas successful:", estGas.toString());
  } catch (err: any) {
    console.error("Gas estimation failed:", err.message || err);
  }
}

main().catch(console.error);
