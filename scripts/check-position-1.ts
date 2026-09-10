import { ethers } from "hardhat";

async function main() {
  const routerAddress = "0xdAf78533193043107dC802E67696E4aB7EB2875F";
  const [signer] = await ethers.getSigners();
  const router = await ethers.getContractAt("DivergenceRouter", routerAddress, signer);

  const nextPosId = await router.nextPositionId();
  console.log("Next Position ID:", nextPosId.toString());

  if (nextPosId === 0n) {
    console.log("No positions yet.");
    return;
  }

  for (let i = 1n; i <= nextPosId; i++) {
    const pos = await router.getPosition(i);
    console.log(`\n--- Position ${i} ---`);
    console.log("User:", pos.user);
    console.log("Market A:", pos.marketA);
    console.log("Market B:", pos.marketB);
    console.log("Amount A:", ethers.formatUnits(pos.amountA, 6), "tUSDC");
    console.log("Amount B:", ethers.formatUnits(pos.amountB, 6), "tUSDC");
    console.log("Outcome A ID:", pos.outcomeIdA.toString(), "Choice:", pos.outcomeIdxA === 0 ? "YES" : "NO");
    console.log("Outcome B ID:", pos.outcomeIdB.toString(), "Choice:", pos.outcomeIdxB === 0 ? "YES" : "NO");
    console.log("Redeemed:", pos.redeemed);

    // Check Market A status
    const marketA = await ethers.getContractAt("contracts/DivergenceRouter.sol:IBinaryMarket", pos.marketA, signer);
    const statusA = await marketA.status();
    const expiryA = await marketA.expiry();
    const resolvedA = await marketA.isResolved();
    console.log(`Market A Status: ${statusA}, Expiry: ${expiryA} (${new Date(Number(expiryA) * 1000).toISOString()}), Resolved: ${resolvedA}`);

    // Check Market B status
    const marketB = await ethers.getContractAt("contracts/DivergenceRouter.sol:IBinaryMarket", pos.marketB, signer);
    const statusB = await marketB.status();
    const expiryB = await marketB.expiry();
    const resolvedB = await marketB.isResolved();
    console.log(`Market B Status: ${statusB}, Expiry: ${expiryB} (${new Date(Number(expiryB) * 1000).toISOString()}), Resolved: ${resolvedB}`);
  }
}

main().catch(console.error);
