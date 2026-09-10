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

export const PRESET_STRATEGIES: SplitStrategy[] = [
  {
    id: "cross-asset-btc-eth",
    title: "BTC↑ / ETH↓ Cross-Asset Split",
    subtitle: "Divergence play: BTC pumps while ETH decouples downward in the same 15m window.",
    type: "CROSS_ASSET",
    legA: {
      marketId: "0x6274632d31356d2d746573746e65740000000000000000000000000000000000",
      name: "BTC 15m UP",
      asset: "BTC",
      cadence: "15m",
      choice: 0,
      impliedProb: 0.62,
    },
    legB: {
      marketId: "0x6574682d31356d2d746573746e65740000000000000000000000000000000000",
      name: "ETH 15m DOWN",
      asset: "ETH",
      cadence: "15m",
      choice: 1,
      impliedProb: 0.56,
    },
    historicalWinRate: "38%",
    decorrelationFactor: "High (+18% delta)",
  },
  {
    id: "calendar-btc-15m-1h",
    title: "BTC-15m↑ / BTC-1h↓ Term-Structure Split",
    subtitle: "Term inversion play: Short-term 15m momentum squeeze against a 1h downward macro trend.",
    type: "CALENDAR_SPREAD",
    legA: {
      marketId: "0x6274632d31356d2d746573746e65740000000000000000000000000000000000",
      name: "BTC 15m UP",
      asset: "BTC",
      cadence: "15m",
      choice: 0,
      impliedProb: 0.62,
    },
    legB: {
      marketId: "0x6274632d31682d746573746e6574000000000000000000000000000000000000",
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
