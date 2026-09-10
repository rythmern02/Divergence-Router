import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const marketAddress = "0x095bC7fe97bDC8154091C5bFd95DB5fc619eD516";
  const poolAddress = "0x69E62A394Ee036FfDc867E2C7d689D5B65144a80";
  const collateralAddress = "0x70a86D8842FB63C4Ad2b7cdddF530eBf1BB25d8E";
  const [signer] = await ethers.getSigners();

  const marketAbi = [
    "function yesId() view returns (uint256)",
    "function noId() view returns (uint256)",
    "function pool() view returns (address)",
    "function status() view returns (uint8)",
  ];

  const market = new ethers.Contract(marketAddress, marketAbi, signer);
  const yesId = await market.yesId();
  const noId = await market.noId();
  const status = await market.status();
  const pool = await market.pool();

  console.log("Market on-chain reads:");
  console.log(" - status:", status.toString());
  console.log(" - yesId:", yesId.toString());
  console.log(" - noId:", noId.toString());
  console.log(" - pool:", pool);

  // Probe mintSet on pool
  const poolAbi = [
    "function mintSet(address yesTo, address noTo, uint256 amount)",
  ];
  const poolContract = new ethers.Contract(poolAddress, poolAbi, signer);
  const erc20Abi = [
    "function approve(address spender, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
  ];
  const token = new ethers.Contract(collateralAddress, erc20Abi, signer);

  // Approve pool for 1 tUSDC (1e6)
  console.log("Approving pool...");
  const appTx = await token.approve(poolAddress, 1_000_000n);
  await appTx.wait();
  console.log("Pool approved!");

  // Call mintSet directly on pool
  console.log("Calling mintSet for 1 tUSDC on pool...");
  const mintTx = await poolContract.mintSet(signer.address, signer.address, 1_000_000n);
  console.log("mintSet tx hash:", mintTx.hash);
  const receipt = await mintTx.wait();
  console.log("mintSet confirmed in block:", receipt?.blockNumber);

  // Check outcome balances
  const outcomeTokenAbi = [
    "function balanceOf(address owner, uint256 id) view returns (uint256)",
  ];
  const outcomeToken = new ethers.Contract("0xB52c5934113Af5c0Bb20eb3C72290C8215f755b9", outcomeTokenAbi, signer);
  const yesBal = await outcomeToken.balanceOf(signer.address, yesId);
  const noBal = await outcomeToken.balanceOf(signer.address, noId);
  console.log(`YES Balance: ${yesBal.toString()} | NO Balance: ${noBal.toString()}`);
}

main().catch(console.error);
