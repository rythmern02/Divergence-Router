import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Wallet Address:", signer.address);

  const balance = await ethers.provider.getBalance(signer.address);
  console.log("Native STT Balance:", ethers.formatEther(balance), "STT");

  const collateralAddress = process.env.COLLATERAL_TOKEN || "0x70a86D8842FB63C4Ad2b7cdddF530eBf1BB25d8E";
  const erc20Abi = [
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)",
  ];

  try {
    const token = new ethers.Contract(collateralAddress, erc20Abi, signer);
    const symbol = await token.symbol();
    const decimals = await token.decimals();
    const tokenBalance = await token.balanceOf(signer.address);
    console.log(`Collateral Balance: ${ethers.formatUnits(tokenBalance, decimals)} ${symbol}`);
  } catch (err: any) {
    console.log("Could not query collateral token:", err.message);
  }
}

main().catch(console.error);
