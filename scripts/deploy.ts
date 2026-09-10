import { ethers, network } from "hardhat";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config();

const PROTOCOL_ADDRESSES = {
  somniaTestnet: {
    settlement: "0xbF4a49e0Dfd092e5FBE8E5761064C49533e6Ed23",
    outcomeToken: "0xB52c5934113Af5c0Bb20eb3C72290C8215f755b9",
    collateral: "0x70a86D8842FB63C4Ad2b7cdddF530eBf1BB25d8E", // tUSDC (6 decimals)
  },
};

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("=================================================");
  console.log(" Deploying DivergenceRouter to Somnia Testnet");
  console.log("=================================================");
  console.log("Deployer:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Native STT Balance:", ethers.formatEther(balance));

  let settlementAddr: string;
  let outcomeTokenAddr: string;
  let collateralAddr: string;

  if (network.name === "somniaTestnet") {
    settlementAddr = process.env.BINARY_SETTLEMENT || PROTOCOL_ADDRESSES.somniaTestnet.settlement;
    outcomeTokenAddr = process.env.OUTCOME_TOKEN_6909 || PROTOCOL_ADDRESSES.somniaTestnet.outcomeToken;
    collateralAddr = process.env.COLLATERAL_TOKEN || PROTOCOL_ADDRESSES.somniaTestnet.collateral;
  } else {
    console.log("Local/Dev network detected. Deploying mock contracts...");
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const mockCollateral = await MockERC20.deploy("Test USD", "tUSDC", 6);
    await mockCollateral.waitForDeployment();
    collateralAddr = await mockCollateral.getAddress();

    const MockERC6909 = await ethers.getContractFactory("MockERC6909");
    const mockOutcome = await MockERC6909.deploy();
    await mockOutcome.waitForDeployment();
    outcomeTokenAddr = await mockOutcome.getAddress();

    const MockSettlement = await ethers.getContractFactory("MockBinarySettlement");
    const mockSettlement = await MockSettlement.deploy(collateralAddr, outcomeTokenAddr);
    await mockSettlement.waitForDeployment();
    settlementAddr = await mockSettlement.getAddress();
  }

  console.log("Configured Parameters:");
  console.log(" - BinarySettlement:   ", settlementAddr);
  console.log(" - OutcomeToken6909:   ", outcomeTokenAddr);
  console.log(" - CollateralToken:    ", collateralAddr);

  console.log("\nDeploying DivergenceRouter...");
  const DivergenceRouter = await ethers.getContractFactory("DivergenceRouter");
  const router = await DivergenceRouter.deploy(
    settlementAddr,
    outcomeTokenAddr,
    collateralAddr
  );
  await router.waitForDeployment();

  const routerAddress = await router.getAddress();
  console.log(">>> DivergenceRouter deployed successfully at:", routerAddress);

  const deploymentInfo = {
    network: network.name,
    chainId: network.config.chainId,
    routerAddress,
    settlement: settlementAddr,
    outcomeToken: outcomeTokenAddr,
    collateralToken: collateralAddr,
    deployedAt: new Date().toISOString(),
  };

  const outputPath = path.join(__dirname, "../deployment.json");
  fs.writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("Deployment manifest saved to:", outputPath);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
