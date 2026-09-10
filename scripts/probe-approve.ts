import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const [signer] = await ethers.getSigners();
  const collateralAddress = "0x70a86D8842FB63C4Ad2b7cdddF530eBf1BB25d8E";
  const binaryModuleAddress = "0x3ecC694Cef705358864a646142ac17A90E29e388";

  const erc20Abi = [
    "function approve(address spender, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
  ];
  const token = new ethers.Contract(collateralAddress, erc20Abi, signer);
  const gas = await token.approve.estimateGas(binaryModuleAddress, ethers.MaxUint256);
  console.log("Approve estimateGas:", gas.toString());
}

main().catch(console.error);
