import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const settlementAddress = "0xbF4a49e0Dfd092e5FBE8E5761064C49533e6Ed23";
  const [signer] = await ethers.getSigners();

  const settlementAbi = [
    "function isFinalized(uint256 outcomeId) view returns (bool)",
    "function outcomeToken() view returns (address)",
  ];

  const settlement = new ethers.Contract(settlementAddress, settlementAbi, signer);
  const ot = await settlement.outcomeToken();
  console.log("Settlement outcomeToken:", ot);

  const testId = 2855033597023017394086645994901947871283101817075785047918994757015040n;
  const isFin = await settlement.isFinalized(testId);
  console.log("isFinalized(testId):", isFin);
}

main().catch(console.error);
