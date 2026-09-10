import { ethers } from "hardhat";
import { SomniaMarkets, SOMNIA_TESTNET_ADDRESSES } from "@somnia-chain/markets-sdk";
import { somniaTestnet } from "viem/chains";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("Searching for live trading markets via SDK on Somnia testnet...");
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) throw new Error("No private key");

  const ex = new SomniaMarkets({
    chain: somniaTestnet,
    addresses: SOMNIA_TESTNET_ADDRESSES,
    privateKey,
    wsRpcUrl: "wss://api.infra.testnet.somnia.network/ws",
    indexerUrl: "https://dev.smk.somnia.host/v1/graphql",
  });

  try {
    const liveMarkets = await ex.client.listLiveBinaryMarkets({ limit: 50 });
    console.log(`SDK found ${liveMarkets.length} live binary markets.`);
    for (const m of liveMarkets) {
      console.log(`Market: ${m.asset} | Interval: ${Number(m.intervalSec) / 60}m | MarketId: ${m.marketId} | Pool: ${m.pool}`);
      try {
        const onchain = await ex.client.getMarketOnchain(m.marketId as `0x${string}`);
        console.log(` -> On-chain Status: ${onchain.status} (1=Trading), Finalized: ${onchain.finalized}`);
      } catch (e: any) {
        console.log(` -> Error fetching onchain: ${e.message}`);
      }
    }
  } catch (err: any) {
    console.log("Error querying live binary markets via SDK:", err.message);
  }
}

main().catch(console.error);
