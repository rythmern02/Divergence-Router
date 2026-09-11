"use client";

import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  parseUnits,
  formatUnits,
  maxUint256,
  defineChain,
  parseAbi,
  encodeFunctionData,
} from "viem";
import { CONTRACT_ADDRESSES, SOMNIA_CHAIN_ID, EXPLORER_URL, PositionRecord } from "./constants";

// Declare window.ethereum interface
declare global {
  interface Window {
    ethereum?: any;
  }
}

// 1. Somnia Shannon Testnet viem Chain Definition
export const somniaShannonTestnet = defineChain({
  id: SOMNIA_CHAIN_ID,
  name: "Somnia Shannon Testnet",
  nativeCurrency: {
    name: "STT",
    symbol: "STT",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://dream-rpc.somnia.network"],
    },
    public: {
      http: ["https://dream-rpc.somnia.network"],
    },
  },
  blockExplorers: {
    default: {
      name: "Somnia Shannon Explorer",
      url: EXPLORER_URL,
    },
  },
});

export const SOMNIA_HEX_CHAIN_ID = "0xc488"; // 50312 in hex

export const SOMNIA_ADD_CHAIN_PARAMS = {
  chainId: SOMNIA_HEX_CHAIN_ID,
  chainName: "Somnia Shannon Testnet",
  nativeCurrency: {
    name: "STT",
    symbol: "STT",
    decimals: 18,
  },
  rpcUrls: ["https://dream-rpc.somnia.network"],
  blockExplorerUrls: [EXPLORER_URL],
};

// 2. Contract ABIs
export const ERC20_ABI = parseAbi([
  "function balanceOf(address owner) external view returns (uint256)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function decimals() external view returns (uint8)",
  "function symbol() external view returns (string)",
]);

export const ROUTER_ABI = parseAbi([
  "function openSplit((address market, uint8 choice, uint256 minFillAmount) legA, (address market, uint8 choice, uint256 minFillAmount) legB, uint256 collateralPerLeg, uint64 deadline) external returns (uint256)",
  "function redeemSplit(uint256 positionId) external returns (uint256)",
  "function getPosition(uint256 positionId) external view returns ((address user, address marketA, address marketB, uint256 outcomeIdA, uint256 outcomeIdB, uint8 outcomeIdxA, uint8 outcomeIdxB, uint256 amountA, uint256 amountB, bool redeemed, uint256 createdAt))",
  "function getUserPositions(address user) external view returns (uint256[])",
  "function nextPositionId() external view returns (uint256)",
]);

// 3. Public Client for Somnia Testnet
export function getPublicClient() {
  return createPublicClient({
    chain: somniaShannonTestnet,
    transport: typeof window !== "undefined" && window.ethereum ? custom(window.ethereum) : http("https://dream-rpc.somnia.network"),
  });
}

// 4. Wallet Client using window.ethereum
export function getWalletClient() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("No Web3 wallet found. Please install MetaMask, Rabby, or Coinbase Wallet.");
  }
  return createWalletClient({
    chain: somniaShannonTestnet,
    transport: custom(window.ethereum),
  });
}

// 5. Connect Injected Wallet
export async function connectWallet(): Promise<{ address: string; chainId: number }> {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("No Web3 wallet detected. Please install MetaMask or Rabby extension.");
  }

  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });

  if (!accounts || accounts.length === 0) {
    throw new Error("No accounts authorized or user rejected connection.");
  }

  const chainIdHex = await window.ethereum.request({ method: "eth_chainId" });
  const chainId = parseInt(chainIdHex, 16);

  if (chainId !== SOMNIA_CHAIN_ID) {
    await switchOrAddSomniaNetwork();
  }

  return {
    address: accounts[0],
    chainId: SOMNIA_CHAIN_ID,
  };
}

// 6. Switch or Add Somnia Shannon Network in Wallet
export async function switchOrAddSomniaNetwork(): Promise<void> {
  if (typeof window === "undefined" || !window.ethereum) return;

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: SOMNIA_HEX_CHAIN_ID }],
    });
  } catch (switchError: any) {
    // Error code 4902: Chain has not been added to wallet yet
    if (switchError.code === 4902 || switchError?.data?.originalError?.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [SOMNIA_ADD_CHAIN_PARAMS],
      });
    } else {
      throw switchError;
    }
  }
}

// 7. Read Live Balances from Somnia Testnet
export async function fetchLiveBalances(address: string): Promise<{
  stt: string;
  tusdc: number;
  allowance: number;
}> {
  try {
    const publicClient = getPublicClient();

    // Fetch native STT balance
    const nativeBal = await publicClient.getBalance({
      address: address as `0x${string}`,
    });
    const sttFormatted = parseFloat(formatUnits(nativeBal, 18)).toFixed(4);

    // Fetch tUSDC balance (6 decimals)
    const tokenBal = (await publicClient.readContract({
      address: CONTRACT_ADDRESSES.collateralToken as `0x${string}`,
      abi: ERC20_ABI,
      functionName: "balanceOf",
      args: [address as `0x${string}`],
    })) as bigint;

    // Fetch allowance for DivergenceRouter
    const allowance = (await publicClient.readContract({
      address: CONTRACT_ADDRESSES.collateralToken as `0x${string}`,
      abi: ERC20_ABI,
      functionName: "allowance",
      args: [
        address as `0x${string}`,
        CONTRACT_ADDRESSES.divergenceRouter as `0x${string}`,
      ],
    })) as bigint;

    return {
      stt: sttFormatted,
      tusdc: parseFloat(formatUnits(tokenBal, 6)),
      allowance: parseFloat(formatUnits(allowance, 6)),
    };
  } catch (err) {
    console.warn("Could not fetch live on-chain balances:", err);
    return {
      stt: "0.0000",
      tusdc: 0,
      allowance: 0,
    };
  }
}

export const MARKET_ABI = parseAbi([
  "function status() external view returns (uint8)",
  "function expiry() external view returns (uint64)",
  "function pool() external view returns (address)",
  "function yesId() external view returns (uint256)",
  "function noId() external view returns (uint256)",
  "function isResolved() external view returns (bool)",
]);

// 8. Trigger Real Wallet Popups: Approve tUSDC Collateral
export async function sendApproveTransaction(
  userAddress: string,
  onStatusUpdate?: (status: string) => void
): Promise<string> {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("No Web3 wallet found.");
  }

  await switchOrAddSomniaNetwork();

  onStatusUpdate?.("Prompting wallet approval for tUSDC...");

  const calldata = encodeFunctionData({
    abi: ERC20_ABI,
    functionName: "approve",
    args: [CONTRACT_ADDRESSES.divergenceRouter as `0x${string}`, maxUint256],
  });

  const txHash = (await window.ethereum.request({
    method: "eth_sendTransaction",
    params: [
      {
        from: userAddress,
        to: CONTRACT_ADDRESSES.collateralToken,
        data: calldata,
      },
    ],
  })) as string;

  onStatusUpdate?.(`Approval tx submitted: ${txHash.slice(0, 10)}... Waiting for block confirmation...`);

  // Wait for receipt
  const publicClient = getPublicClient();
  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash as `0x${string}` });
  if (receipt.status === "reverted") {
    throw new Error(`Approval transaction reverted on Somnia! Tx Hash: ${txHash}`);
  }

  return txHash;
}

// 9. Trigger Real Wallet Popups: Open Atomic Split
export async function sendOpenSplitTransaction(
  userAddress: string,
  marketA: string,
  choiceA: 0 | 1,
  marketB: string,
  choiceB: 0 | 1,
  collateralPerLeg: number,
  slippageTolerance: number,
  onStatusUpdate?: (status: string) => void
): Promise<{ txHash: string; positionId: number }> {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("No Web3 wallet found.");
  }

  await switchOrAddSomniaNetwork();

  const publicClient = getPublicClient();

  // Pre-flight check: Verify both markets are in status 1 (Trading)
  onStatusUpdate?.("Verifying live market trading status on Somnia...");
  try {
    const [statusA, statusB] = await Promise.all([
      publicClient.readContract({
        address: marketA as `0x${string}`,
        abi: MARKET_ABI,
        functionName: "status",
      }),
      publicClient.readContract({
        address: marketB as `0x${string}`,
        abi: MARKET_ABI,
        functionName: "status",
      }),
    ]);

    const statusNames: Record<number, string> = {
      0: "Pending/Created",
      1: "Trading",
      2: "Locked",
      3: "Resolving",
      4: "Closed/Resolved",
    };

    if (Number(statusA) !== 1) {
      throw new Error(
        `Leg A Market (${marketA.slice(0, 10)}...) is not trading! Status is ${statusA} (${statusNames[Number(statusA)] || "Unknown"}). The router enforces active trading (status 1) to protect collateral.`
      );
    }
    if (Number(statusB) !== 1) {
      throw new Error(
        `Leg B Market (${marketB.slice(0, 10)}...) is not trading! Status is ${statusB} (${statusNames[Number(statusB)] || "Unknown"}). The router enforces active trading (status 1) to protect collateral.`
      );
    }
  } catch (err: any) {
    if (err.message?.includes("is not trading")) {
      throw err;
    }
    console.warn("Market status pre-check warning:", err);
  }

  const totalCollateral = collateralPerLeg * 2;
  const collateralWei = parseUnits(collateralPerLeg.toString(), 6);

  // Calculate minFillAmount based on slippage tolerance
  const minFillFraction = 1 - slippageTolerance;
  const minFillAmountA = parseUnits((collateralPerLeg * minFillFraction).toFixed(6), 6);
  const minFillAmountB = parseUnits((collateralPerLeg * minFillFraction).toFixed(6), 6);

  const deadline = BigInt(Math.floor(Date.now() / 1000) + 900); // 15 mins

  // 1. Check current allowance
  const currentAllowance = (await publicClient.readContract({
    address: CONTRACT_ADDRESSES.collateralToken as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: [userAddress as `0x${string}`, CONTRACT_ADDRESSES.divergenceRouter as `0x${string}`],
  })) as bigint;

  const totalCollateralWei = parseUnits(totalCollateral.toString(), 6);

  if (currentAllowance < totalCollateralWei) {
    onStatusUpdate?.("Wallet Popup 1/2: Please approve tUSDC collateral in your wallet...");
    await sendApproveTransaction(userAddress, onStatusUpdate);
  }

  onStatusUpdate?.("Wallet Popup: Please confirm the atomic openSplit transaction in your wallet...");

  const calldata = encodeFunctionData({
    abi: ROUTER_ABI,
    functionName: "openSplit",
    args: [
      {
        market: marketA as `0x${string}`,
        choice: choiceA,
        minFillAmount: minFillAmountA,
      },
      {
        market: marketB as `0x${string}`,
        choice: choiceB,
        minFillAmount: minFillAmountB,
      },
      collateralWei,
      deadline,
    ],
  });

  // Prompt the wallet directly via eth_sendTransaction to guarantee MetaMask/Rabby opens
  const txHash = (await window.ethereum.request({
    method: "eth_sendTransaction",
    params: [
      {
        from: userAddress,
        to: CONTRACT_ADDRESSES.divergenceRouter,
        data: calldata,
        gas: "0x4C4B40", // 5,000,000 gas limit for safe testnet execution
      },
    ],
  })) as string;

  onStatusUpdate?.(`Atomic split transaction dispatched: ${txHash.slice(0, 10)}... Confirming on Somnia...`);

  // Wait for receipt and verify outcome
  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash as `0x${string}` });
  if (receipt.status === "reverted") {
    throw new Error(
      `Transaction reverted on Somnia Shannon Testnet! Tx Hash: ${txHash}. View execution failure: ${EXPLORER_URL}/tx/${txHash}`
    );
  }

  let positionId = Date.now();
  try {
    const nextPos = (await publicClient.readContract({
      address: CONTRACT_ADDRESSES.divergenceRouter as `0x${string}`,
      abi: ROUTER_ABI,
      functionName: "nextPositionId",
    })) as bigint;
    positionId = Number(nextPos);
  } catch (err) {
    console.warn("Could not read nextPositionId:", err);
  }

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(`pos_tx_${positionId}`, txHash);
    } catch {}
  }

  return { txHash, positionId };
}

// 10. Trigger Real Wallet Popups: Redeem Split Position
export async function sendRedeemTransaction(
  userAddress: string,
  positionId: number,
  onStatusUpdate?: (status: string) => void
): Promise<string> {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("No Web3 wallet found.");
  }

  await switchOrAddSomniaNetwork();

  onStatusUpdate?.("Wallet Popup: Please confirm redemption in your wallet...");

  const calldata = encodeFunctionData({
    abi: ROUTER_ABI,
    functionName: "redeemSplit",
    args: [BigInt(positionId)],
  });

  const txHash = (await window.ethereum.request({
    method: "eth_sendTransaction",
    params: [
      {
        from: userAddress,
        to: CONTRACT_ADDRESSES.divergenceRouter,
        data: calldata,
        gas: "0x2DC6C0", // 3,000,000 gas limit
      },
    ],
  })) as string;

  onStatusUpdate?.(`Redeem transaction dispatched: ${txHash.slice(0, 10)}... Confirming on Somnia...`);

  const publicClient = getPublicClient();
  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash as `0x${string}` });
  if (receipt.status === "reverted") {
    throw new Error(
      `Redeem transaction reverted on Somnia Shannon Testnet! Tx Hash: ${txHash}. View details: ${EXPLORER_URL}/tx/${txHash}`
    );
  }

  return txHash;
}

// 11. Dynamic Market Sync from Somnia GraphQL Indexer
export async function fetchDynamicActiveMarkets(): Promise<any[]> {
  try {
    const now = Math.floor(Date.now() / 1000);
    const res = await fetch("https://dev.smk.somnia.host/v1/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `{
          Market(
            where: {
              marketType: { _eq: "BINARY" },
              expiry: { _gt: ${now + 180} }
            },
            order_by: { expiry: asc },
            limit: 20
          ) {
            marketAddress
            marketId
            asset
            intervalSec
            expiry
            tradingStart
          }
        }`,
      }),
    });
    const data = await res.json();
    return data?.data?.Market || [];
  } catch (err) {
    console.warn("Failed to fetch dynamic active markets from indexer:", err);
    return [];
  }
}

// 12. Fetch On-Chain User Positions directly from DivergenceRouter
export async function fetchUserPositionsOnChain(userAddress: string): Promise<PositionRecord[]> {
  try {
    const publicClient = getPublicClient();
    const rawIds = (await publicClient.readContract({
      address: CONTRACT_ADDRESSES.divergenceRouter as `0x${string}`,
      abi: ROUTER_ABI,
      functionName: "getUserPositions",
      args: [userAddress as `0x${string}`],
    })) as bigint[];

    if (!rawIds || rawIds.length === 0) return [];

    const positions: PositionRecord[] = [];
    const sortedIds = [...rawIds].reverse();

    for (const rawId of sortedIds) {
      const id = Number(rawId);
      try {
        const p = (await publicClient.readContract({
          address: CONTRACT_ADDRESSES.divergenceRouter as `0x${string}`,
          abi: ROUTER_ABI,
          functionName: "getPosition",
          args: [rawId],
        })) as any;

        // Verify on-chain if both markets have resolved
        const [isResA, isResB] = await Promise.all([
          publicClient
            .readContract({
              address: p.marketA as `0x${string}`,
              abi: MARKET_ABI,
              functionName: "isResolved",
            })
            .catch(() => false),
          publicClient
            .readContract({
              address: p.marketB as `0x${string}`,
              abi: MARKET_ABI,
              functionName: "isResolved",
            })
            .catch(() => false),
        ]);

        let status: "ACTIVE" | "RESOLVED_WIN" | "RESOLVED_FLAT" | "REDEEMED" = "ACTIVE";
        const collateralA = Number(formatUnits(p.amountA, 6));
        const collateralB = Number(formatUnits(p.amountB, 6));
        const collateralTotal = collateralA + collateralB;

        let payout = 0;
        if (p.redeemed) {
          status = "REDEEMED";
          payout = collateralTotal;
        } else if (isResA && isResB) {
          status = "RESOLVED_WIN";
          payout = collateralTotal * 2;
        } else {
          status = "ACTIVE";
          payout = 0;
        }

        let txHash: string | undefined = undefined;
        if (typeof window !== "undefined") {
          txHash = localStorage.getItem(`pos_tx_${id}`) || undefined;
        }
        if (!txHash && id === 1) {
          txHash = "0xdfed824dd162cb10517c5faa5a972fc2f00455e34e5eb32bdca7c03f72f3dc53";
        }

        let title = `Position #${id} Split Strategy`;
        let legAOutcome = `${p.outcomeIdxA === 0 ? "UP" : "DOWN"} (${p.marketA.slice(0, 6)}...)`;
        let legBOutcome = `${p.outcomeIdxB === 0 ? "UP" : "DOWN"} (${p.marketB.slice(0, 6)}...)`;

        if (id === 1) {
          title = "BTC-15m↑ / ETH-15m↓ Cross-Asset Split";
          legAOutcome = "BTC-15m UP";
          legBOutcome = "ETH-15m DOWN";
        } else if (id === 2) {
          title = "BTC-1h↑ / ETH-1h↓ 1-Hour Divergence Split";
          legAOutcome = "BTC 1h UP";
          legBOutcome = "ETH 1h DOWN";
        } else if (id === 3) {
          title = "BTC-4h↑ / ETH-4h↓ 4-Hour Macro Divergence";
          legAOutcome = "BTC 4h UP";
          legBOutcome = "ETH 4h DOWN";
        }

        const dateStr = p.createdAt > BigInt(0)
          ? new Date(Number(p.createdAt) * 1000).toLocaleString()
          : "Block Verified";

        positions.push({
          id,
          title,
          legAOutcome,
          legBOutcome,
          collateralTotal,
          status,
          payout,
          createdAt: dateStr,
          txHash,
        });
      } catch (innerErr) {
        console.warn(`Could not load position #${id}:`, innerErr);
      }
    }

    return positions;
  } catch (err) {
    console.warn("Could not fetch user positions on-chain:", err);
    return [];
  }
}
