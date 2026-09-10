import { createPublicClient, http, parseAbiItem } from "viem";
import { somniaTestnet } from "viem/chains";
import * as dotenv from "dotenv";

dotenv.config();

const RPC_URL = process.env.SOMNIA_TESTNET_RPC || "https://dream-rpc.somnia.network";
const COLLATERAL_TUSDC = "0x70a86D8842FB63C4Ad2b7cdddF530eBf1BB25d8E";

const marketCreatedEvent = parseAbiItem(
  "event MarketCreated(bytes32 indexed marketId, address pool, address market, string asset, uint256 intervalSec, uint256 expiry, address collateral)"
);

/**
 * Discovers live binary markets by scanning `MarketCreated` logs directly from the chain.
 * Adopted and enhanced from IronicDeGawd/ec-dreamdex-hackathon-template.
 */
async function main() {
  console.log("==================================================================");
  console.log(" DREAMDEX ON-CHAIN DISCOVERY (Hackathon Template Log Scanner)");
  console.log(" RPC:", RPC_URL);
  console.log("==================================================================");

  const client = createPublicClient({
    chain: somniaTestnet,
    transport: http(RPC_URL),
  });

  const now = Math.floor(Date.now() / 1000);
  const head = await client.getBlockNumber();
  console.log("Current Somnia block height:", head.toString());

  const found: any[] = [];
  const WINDOW_SIZE = 1000n;
  const BATCHES = 10;

  console.log(`Scanning backwards ${BATCHES * Number(WINDOW_SIZE)} blocks for MarketCreated events...`);

  for (let i = 0; i < BATCHES; i++) {
    const toBlock = head - BigInt(i) * WINDOW_SIZE;
    const fromBlock = toBlock - WINDOW_SIZE + 1n;
    if (fromBlock < 0n) break;

    try {
      const logs = await client.getLogs({
        event: marketCreatedEvent,
        fromBlock,
        toBlock,
      });
      found.push(...logs.map((l) => l.args));
    } catch {
      // Best-effort scan across blocks
    }
  }

  console.log(`Discovered ${found.length} total MarketCreated events on testnet.`);

  const live = found
    .filter(
      (m) =>
        Number(m.expiry) > now &&
        m.collateral?.toLowerCase() === COLLATERAL_TUSDC.toLowerCase()
    )
    .sort((a, b) => Number(a.expiry) - Number(b.expiry));

  console.log(`\nFiltered to ${live.length} live markets settling in tUSDC:\n`);

  for (const m of live) {
    const minsLeft = Math.round((Number(m.expiry) - now) / 60);
    console.log(
      ` • ${m.asset.padEnd(4)} | Window: ${(Number(m.intervalSec) / 60).toString().padStart(2)}m | Expires in: ${minsLeft.toString().padStart(2)}m | Pool: ${m.pool} | MarketId: ${m.marketId}`
    );
  }

  console.log("==================================================================");
  console.log("Discovery complete. These live marketIds can be routed through DivergenceRouter.openSplit.");
}

main().catch(console.error);
