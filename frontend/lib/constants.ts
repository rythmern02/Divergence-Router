export const SOMNIA_CHAIN_ID = 50312;
export const SOMNIA_RPC_URL = "https://dream-rpc.somnia.network";
export const EXPLORER_URL = "https://shannon-explorer.somnia.network";

export const CONTRACT_ADDRESSES = {
  // CREATE3 Identical Addresses
  binaryModule: "0x3ecC694Cef705358864a646142ac17A90E29e388",
  marketsCore: "0x2802504314685D89bF6C992CA5a8e7cC78bc0294",
  binarySettlement: "0xbF4a49e0Dfd092e5FBE8E5761064C49533e6Ed23",
  outcomeToken: "0xB52c5934113Af5c0Bb20eb3C72290C8215f755b9",
  collateralToken: "0x70a86D8842FB63C4Ad2b7cdddF530eBf1BB25d8E", // tUSDC (6 decimals)
  // Router Address (Live on Somnia Shannon Testnet)
  divergenceRouter: "0xdAf78533193043107dC802E67696E4aB7EB2875F",
};

export interface MarketLegChoice {
  marketId: string;
  marketAddress: string;
  name: string;
  asset: string;
  cadence: string;
  choice: 0 | 1; // 0 = UP, 1 = DOWN
  impliedProb: number;
}

export interface SplitStrategy {
  id: string;
  title: string;
  subtitle: string;
  type: "CROSS_ASSET" | "CALENDAR_SPREAD";
  legA: MarketLegChoice;
  legB: MarketLegChoice;
  historicalWinRate: string;
  decorrelationFactor: string;
}

export interface PositionRecord {
  id: number;
  title: string;
  legAOutcome: string;
  legBOutcome: string;
  collateralTotal: number;
  status: "ACTIVE" | "RESOLVED_WIN" | "RESOLVED_FLAT" | "REDEEMED";
  payout: number;
  createdAt: string;
  txHash?: string;
}

export const PRESET_STRATEGIES: SplitStrategy[] = [
  {
    id: "cross-asset-btc-eth-1h",
    title: "BTC↑ / ETH↓ 1-Hour Divergence Split",
    subtitle: "Divergence play: BTC pumps while ETH decouples downward in the active 1-hour window.",
    type: "CROSS_ASSET",
    legA: {
      marketId: "0x0000000000000000000000000000000000000000000000000000000000019f4f",
      marketAddress: "0xd74e6f3dd99536a08c7f4b6c765e26b0c8d3733e", // Active BTC-1h (Status: 1 Trading)
      name: "BTC 1h UP",
      asset: "BTC",
      cadence: "1h",
      choice: 0,
      impliedProb: 0.62,
    },
    legB: {
      marketId: "0x0000000000000000000000000000000000000000000000000000000000019f50",
      marketAddress: "0xa55460d7990a088eeeda2fb4805d172ac4705eb3", // Active ETH-1h (Status: 1 Trading)
      name: "ETH 1h DOWN",
      asset: "ETH",
      cadence: "1h",
      choice: 1,
      impliedProb: 0.54,
    },
    historicalWinRate: "41%",
    decorrelationFactor: "High (+19% delta)",
  },
  {
    id: "cross-asset-macro-4h",
    title: "BTC↑ / ETH↓ 4-Hour Macro Divergence",
    subtitle: "Macro spread: Capital rotation into BTC strength against ETH over an extended 4-hour cycle.",
    type: "CROSS_ASSET",
    legA: {
      marketId: "0x0000000000000000000000000000000000000000000000000000000000019f4d",
      marketAddress: "0x697cb0afc3aafca251fa970ae7c9ee8ae09704f5", // Active BTC-4h (Status: 1 Trading)
      name: "BTC 4h UP",
      asset: "BTC",
      cadence: "4h",
      choice: 0,
      impliedProb: 0.65,
    },
    legB: {
      marketId: "0x0000000000000000000000000000000000000000000000000000000000019f4e",
      marketAddress: "0xa4fd17e78fc58453b03f678e6b4b8754cddb08d9", // Active ETH-4h (Status: 1 Trading)
      name: "ETH 4h DOWN",
      asset: "ETH",
      cadence: "4h",
      choice: 1,
      impliedProb: 0.51,
    },
    historicalWinRate: "44%",
    decorrelationFactor: "Macro Decoupled (+24% delta)",
  },
  {
    id: "calendar-btc-15m-1h",
    title: "BTC-15m↑ / BTC-1h↓ Term Inversion",
    subtitle: "Term structure inversion: Short-term momentum squeeze against a 1-hour downward macro trend.",
    type: "CALENDAR_SPREAD",
    legA: {
      marketId: "0x0000000000000000000000000000000000000000000000000000000000019f51",
      marketAddress: "0xc07928d1bea732fb7009483adbcf90d0845c02ee", // Active BTC-15m (Status: 1 Trading)
      name: "BTC 15m UP",
      asset: "BTC",
      cadence: "15m",
      choice: 0,
      impliedProb: 0.59,
    },
    legB: {
      marketId: "0x0000000000000000000000000000000000000000000000000000000000019f4f",
      marketAddress: "0xd74e6f3dd99536a08c7f4b6c765e26b0c8d3733e", // Active BTC-1h (Status: 1 Trading)
      name: "BTC 1h DOWN",
      asset: "BTC",
      cadence: "1h",
      choice: 1,
      impliedProb: 0.49,
    },
    historicalWinRate: "34%",
    decorrelationFactor: "Term Inverted (+13% delta)",
  },
];
