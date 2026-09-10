import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const [signer] = await ethers.getSigners();
  const outcomeTokenAddress = "0xB52c5934113Af5c0Bb20eb3C72290C8215f755b9";
  const settlementAddress = "0xbF4a49e0Dfd092e5FBE8E5761064C49533e6Ed23";
  const binaryModuleAddress = "0x3ecC694Cef705358864a646142ac17A90E29e388";
  const collateralAddress = "0x70a86D8842FB63C4Ad2b7cdddF530eBf1BB25d8E";

  console.log("Checking contract code on testnet...");

  for (const [name, addr] of [
    ["OutcomeToken6909", outcomeTokenAddress],
    ["BinarySettlement", settlementAddress],
    ["BinaryMarketsModule", binaryModuleAddress],
    ["CollateralToken", collateralAddress],
  ]) {
    const code = await ethers.provider.getCode(addr);
    console.log(`${name} (${addr}): code length = ${code.length}`);
  }

  // Probe setOperator on OutcomeToken6909
  const abi = [
    "function isOperator(address owner, address spender) view returns (bool)",
    "function setOperator(address spender, bool approved) returns (bool)",
  ];
  const token = new ethers.Contract(outcomeTokenAddress, abi, signer);
  try {
    const isOp = await token.isOperator(signer.address, settlementAddress);
    console.log("isOperator check:", isOp);
    
    // Estimate gas for setOperator
    const gas = await token.setOperator.estimateGas(settlementAddress, true);
    console.log("setOperator estimateGas:", gas.toString());
  } catch (err: any) {
    console.log("setOperator error:", err.message);
  }
}

main().catch(console.error);
