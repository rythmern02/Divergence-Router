import { SomniaMarkets, SOMNIA_TESTNET_ADDRESSES } from "@somnia-chain/markets-sdk";
import { somniaTestnet } from "viem/chains";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const ex = new SomniaMarkets({
    chain: somniaTestnet,
    addresses: SOMNIA_TESTNET_ADDRESSES,
    privateKey: process.env.PRIVATE_KEY!,
    wsRpcUrl: "wss://api.infra.testnet.somnia.network/ws",
    indexerUrl: "https://dev.smk.somnia.host/v1/graphql",
  });

  const marketId = "0x0000000000000000000000000000000000000000000000000000000000019445";
  const mo = await ex.client.getMarketOnchain(marketId as `0x${string}`);
  console.log("getMarketOnchain result:", mo);
  process.exit(0);
}

main().catch(console.error);
