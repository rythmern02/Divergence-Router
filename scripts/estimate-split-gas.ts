import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const [signer] = await ethers.getSigners();
  const routerAddress = "0xdAf78533193043107dC802E67696E4aB7EB2875F";
  const router = await ethers.getContractAt("DivergenceRouter", routerAddress, signer);

  const marketA = "0x095bC7fe97bDC8154091C5bFd95DB5fc619eD516";
  const marketB = "0x2D84e883E2748501EF2Ecd70735e9753B2543e40";

  const legA = { market: marketA, choice: 0, minFillAmount: 1_000_000n };
  const legB = { market: marketB, choice: 1, minFillAmount: 1_000_000n };
  const deadline = BigInt(Math.floor(Date.now() / 1000) + 600);

  try {
    const est = await router.openSplit.estimateGas(legA, legB, 1_000_000n, deadline);
    console.log("Estimated Gas for openSplit:", est.toString());
  } catch (e: any) {
    console.log("EstimateGas error / revert message:", e.message);
  }
}

main().catch(console.error);
