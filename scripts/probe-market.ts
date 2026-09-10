import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const binaryModuleAddress = "0x3ecC694Cef705358864a646142ac17A90E29e388";
  const marketId = "0x0000000000000000000000000000000000000000000000000000000000019445";

  const moduleAbi = [
    "function markets(bytes32 marketId) view returns (address pool, address market, uint8 status, uint256 yesId, uint256 noId, uint256 expiry)",
  ];

  const [signer] = await ethers.getSigners();
  const module = new ethers.Contract(binaryModuleAddress, moduleAbi, signer);

  try {
    console.log("Querying markets(marketId) for BTC-15m...");
    const res = await module.markets(marketId);
    console.log("Result:", {
      pool: res.pool,
      market: res.market,
      status: Number(res.status),
      yesId: res.yesId.toString(),
      noId: res.noId.toString(),
      expiry: res.expiry.toString(),
    });
  } catch (err: any) {
    console.log("Error querying markets:", err.message);
  }
}

main().catch(console.error);
