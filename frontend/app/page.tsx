"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "../components/Navbar";
import { SomniaHUD } from "../components/SomniaHUD";
import { BackgroundExperience } from "../components/BackgroundExperience";
import { MarketMatrixSelector } from "../components/MarketMatrixSelector";
import { SpreadDeltaMonitor } from "../components/SpreadDeltaMonitor";
import { ExecutionConsole } from "../components/ExecutionConsole";
import { PayoffMatrixModal } from "../components/PayoffMatrixModal";
import { ActivePositions, PositionRecord } from "../components/ActivePositions";
import { ChaosTrigger } from "../components/ChaosTrigger";
import { MonumentalFooter } from "../components/MonumentalFooter";
import { PRESET_STRATEGIES, SplitStrategy, CONTRACT_ADDRESSES, EXPLORER_URL, SOMNIA_CHAIN_ID } from "../lib/constants";
import { sound } from "../lib/soundFx";
import { DivergenceLogo } from "../components/DivergenceLogo";
import { ExternalLink, ShieldCheck, AlertCircle, Activity, X } from "lucide-react";
import {
  connectWallet,
  switchOrAddSomniaNetwork,
  fetchLiveBalances,
  sendOpenSplitTransaction,
  sendRedeemTransaction,
  fetchDynamicActiveMarkets,
  fetchUserPositionsOnChain,
} from "../lib/web3";

export default function Home() {
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [sttBalance, setSttBalance] = useState<string>("0.00");
  const [collateralBalance, setCollateralBalance] = useState<number>(0);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [strategies, setStrategies] = useState<SplitStrategy[]>(PRESET_STRATEGIES);
  const [selectedStrategy, setSelectedStrategy] = useState<SplitStrategy>(PRESET_STRATEGIES[0]);
  const [collateralPerLeg, setCollateralPerLeg] = useState<number>(50);
  const [slippageTolerance, setSlippageTolerance] = useState<number>(0.02);
  const [isReviewOpen, setIsReviewOpen] = useState<boolean>(false);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executionStatus, setExecutionStatus] = useState<string>("");
  const [executionError, setExecutionError] = useState<string | null>(null);
  const [isRedeeming, setIsRedeeming] = useState<boolean>(false);
  const [toastNotification, setToastNotification] = useState<{
    type: "success" | "error" | "info";
    title: string;
    message: string;
    txHash?: string;
  } | null>(null);

  const [positions, setPositions] = useState<PositionRecord[]>([
    {
      id: 1,
      title: "BTC-15m↑ / ETH-15m↓ Cross-Asset Split",
      legAOutcome: "BTC-15m UP",
      legBOutcome: "ETH-15m DOWN",
      collateralTotal: 2,
      status: "REDEEMED",
      payout: 2,
      createdAt: "Block #484845474",
      txHash: "0xdfed824dd162cb10517c5faa5a972fc2f00455e34e5eb32bdca7c03f72f3dc53",
    },
  ]);

  const refreshPositions = async (addr: string) => {
    try {
      const onChain = await fetchUserPositionsOnChain(addr);
      if (onChain && onChain.length > 0) {
        setPositions(onChain);
      }
    } catch (err) {
      console.warn("Could not load on-chain positions:", err);
    }
  };

  // Check for already connected wallet on mount and setup listeners
  useEffect(() => {
    async function initWallet() {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          const accounts = (await window.ethereum.request({
            method: "eth_accounts",
          })) as string[];

          if (accounts && accounts.length > 0) {
            const addr = accounts[0];
            setUserAddress(addr);

            const chainHex = (await window.ethereum.request({
              method: "eth_chainId",
            })) as string;
            setChainId(parseInt(chainHex, 16));

            const bal = await fetchLiveBalances(addr);
            setSttBalance(bal.stt);
            setCollateralBalance(bal.tusdc);

            await refreshPositions(addr);
          }

          // Listen for account changes
          window.ethereum.on("accountsChanged", async (newAccounts: string[]) => {
            if (newAccounts && newAccounts.length > 0) {
              setUserAddress(newAccounts[0]);
              const bal = await fetchLiveBalances(newAccounts[0]);
              setSttBalance(bal.stt);
              setCollateralBalance(bal.tusdc);
              await refreshPositions(newAccounts[0]);
            } else {
              setUserAddress(null);
              setSttBalance("0.00");
              setCollateralBalance(0);
            }
          });

          // Listen for chain changes
          window.ethereum.on("chainChanged", (newChainHex: string) => {
            setChainId(parseInt(newChainHex, 16));
          });
        } catch (err) {
          console.warn("Wallet initialization skipped:", err);
        }
      }
    }
    initWallet();
  }, []);

  // Periodic refresh for user positions
  useEffect(() => {
    if (!userAddress) return;
    refreshPositions(userAddress);
    const interval = setInterval(() => {
      refreshPositions(userAddress);
    }, 15000);
    return () => clearInterval(interval);
  }, [userAddress]);

  // Dynamically sync freshest active markets from Somnia GraphQL Indexer
  useEffect(() => {
    async function syncMarkets() {
      try {
        const activeMarkets = await fetchDynamicActiveMarkets();
        if (!activeMarkets || activeMarkets.length === 0) return;

        const btc1h = activeMarkets.find((m: any) => m.asset === "BTC" && (m.intervalSec === "3600" || m.intervalSec === 3600));
        const eth1h = activeMarkets.find((m: any) => m.asset === "ETH" && (m.intervalSec === "3600" || m.intervalSec === 3600));
        const btc4h = activeMarkets.find((m: any) => m.asset === "BTC" && (m.intervalSec === "14400" || m.intervalSec === 14400));
        const eth4h = activeMarkets.find((m: any) => m.asset === "ETH" && (m.intervalSec === "14400" || m.intervalSec === 14400));
        const btc15m = activeMarkets.find((m: any) => m.asset === "BTC" && (m.intervalSec === "900" || m.intervalSec === 900 || m.intervalSec === "898"));

        setStrategies((prev) =>
          prev.map((strat) => {
            if (strat.id === "cross-asset-btc-eth-1h" && btc1h && eth1h) {
              return {
                ...strat,
                legA: { ...strat.legA, marketAddress: btc1h.marketAddress, marketId: btc1h.marketId },
                legB: { ...strat.legB, marketAddress: eth1h.marketAddress, marketId: eth1h.marketId },
              };
            }
            if (strat.id === "cross-asset-macro-4h" && btc4h && eth4h) {
              return {
                ...strat,
                legA: { ...strat.legA, marketAddress: btc4h.marketAddress, marketId: btc4h.marketId },
                legB: { ...strat.legB, marketAddress: eth4h.marketAddress, marketId: eth4h.marketId },
              };
            }
            if (strat.id === "calendar-btc-15m-1h" && btc15m && btc1h) {
              return {
                ...strat,
                legA: { ...strat.legA, marketAddress: btc15m.marketAddress, marketId: btc15m.marketId },
                legB: { ...strat.legB, marketAddress: btc1h.marketAddress, marketId: btc1h.marketId },
              };
            }
            return strat;
          })
        );
      } catch (err) {
        console.warn("Market sync warning:", err);
      }
    }

    syncMarkets();
    const interval = setInterval(syncMarkets, 30000);
    return () => clearInterval(interval);
  }, []);

  // Update selectedStrategy if live addresses change
  useEffect(() => {
    const updated = strategies.find((s) => s.id === selectedStrategy.id);
    if (
      updated &&
      (updated.legA.marketAddress !== selectedStrategy.legA.marketAddress ||
        updated.legB.marketAddress !== selectedStrategy.legB.marketAddress)
    ) {
      setSelectedStrategy(updated);
    }
  }, [strategies, selectedStrategy.id, selectedStrategy.legA.marketAddress, selectedStrategy.legB.marketAddress]);

  // Connect Injected Web3 Wallet (MetaMask, Rabby, Phantom, etc.)
  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      sound.playClick();
      const res = await connectWallet();
      setUserAddress(res.address);
      setChainId(res.chainId);

      const bal = await fetchLiveBalances(res.address);
      setSttBalance(bal.stt);
      setCollateralBalance(bal.tusdc);
      await refreshPositions(res.address);

      setToastNotification({
        type: "success",
        title: "Wallet Connected",
        message: `Connected ${res.address.slice(0, 6)}...${res.address.slice(-4)} to Somnia Shannon Testnet.`,
      });
    } catch (err: any) {
      console.error("Wallet connection failed:", err);
      sound.playAlert();
      setToastNotification({
        type: "error",
        title: "Connection Failed",
        message: err?.message || "Could not connect to Web3 wallet. Please make sure MetaMask is installed and unlocked.",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    sound.playClick();
    setUserAddress(null);
    setSttBalance("0.00");
    setCollateralBalance(0);
    setToastNotification({
      type: "info",
      title: "Disconnected",
      message: "Wallet session disconnected.",
    });
  };

  const handleSwitchNetwork = async () => {
    try {
      await switchOrAddSomniaNetwork();
      setChainId(SOMNIA_CHAIN_ID);
      if (userAddress) {
        const bal = await fetchLiveBalances(userAddress);
        setSttBalance(bal.stt);
        setCollateralBalance(bal.tusdc);
      }
    } catch (err: any) {
      console.error("Network switch error:", err);
      setToastNotification({
        type: "error",
        title: "Network Switch Failed",
        message: err?.message || "Could not switch to Somnia Shannon Testnet.",
      });
    }
  };

  // Real Web3 Execute Split with Wallet Popups
  const handleExecuteSplit = async () => {
    if (!userAddress) {
      handleConnect();
      return;
    }

    setIsExecuting(true);
    setExecutionError(null);
    setExecutionStatus("Prompting wallet transaction...");

    try {
      const result = await sendOpenSplitTransaction(
        userAddress,
        selectedStrategy.legA.marketAddress,
        selectedStrategy.legA.choice,
        selectedStrategy.legB.marketAddress,
        selectedStrategy.legB.choice,
        collateralPerLeg,
        slippageTolerance,
        (statusMsg) => setExecutionStatus(statusMsg)
      );

      sound.playExecute();
      setIsExecuting(false);
      setIsReviewOpen(false);

      const totalRequired = collateralPerLeg * 2;
      setCollateralBalance((prev) => Math.max(0, prev - totalRequired));

      const newPos: PositionRecord = {
        id: result.positionId,
        title: selectedStrategy.title,
        legAOutcome: selectedStrategy.legA.name,
        legBOutcome: selectedStrategy.legB.name,
        collateralTotal: totalRequired,
        status: "ACTIVE",
        payout: 0,
        createdAt: "Pending Settlement",
        txHash: result.txHash,
      };

      setPositions([newPos, ...positions]);

      // Refresh on-chain balances
      const bal = await fetchLiveBalances(userAddress);
      setSttBalance(bal.stt);
      setCollateralBalance(bal.tusdc);
      await refreshPositions(userAddress);

      setToastNotification({
        type: "success",
        title: "Atomic Split Dispatched!",
        message: `Transaction confirmed on Somnia Shannon! Position #${result.positionId} opened.`,
        txHash: result.txHash,
      });
    } catch (err: any) {
      console.error("Execution error:", err);
      sound.playAlert();
      setIsExecuting(false);

      const rawMsg = err?.message || "Transaction cancelled or failed.";
      const cleanMsg = rawMsg.includes("User rejected") || rawMsg.includes("user rejected")
        ? "Transaction signature was cancelled in your wallet."
        : rawMsg;

      setExecutionError(cleanMsg);
      setToastNotification({
        type: "error",
        title: "Execution Cancelled",
        message: cleanMsg,
      });
    }
  };

  // Real Web3 Redeem Split with Wallet Popup
  const handleRedeem = async (id: number) => {
    if (!userAddress) {
      handleConnect();
      return;
    }

    setIsRedeeming(true);
    setToastNotification({
      type: "info",
      title: "Claiming Settlement",
      message: "Please confirm the redemption transaction in your wallet...",
    });

    try {
      const txHash = await sendRedeemTransaction(userAddress, id, (statusMsg) => {
        setToastNotification({
          type: "info",
          title: "Claiming Settlement",
          message: statusMsg,
        });
      });

      sound.playRedeem();
      setIsRedeeming(false);

      // Refresh balances and positions from chain
      const bal = await fetchLiveBalances(userAddress);
      setSttBalance(bal.stt);
      setCollateralBalance(bal.tusdc);
      await refreshPositions(userAddress);

      setToastNotification({
        type: "success",
        title: "Redemption Confirmed!",
        message: `Position #${id} payout settled directly to your wallet!`,
        txHash,
      });
    } catch (err: any) {
      console.error("Redeem error:", err);
      sound.playAlert();
      setIsRedeeming(false);

      const cleanMsg = err?.message?.includes("User rejected")
        ? "Redemption signature was cancelled in your wallet."
        : err?.message || "Redemption call failed.";

      setToastNotification({
        type: "error",
        title: "Redemption Cancelled",
        message: cleanMsg,
      });
    }
  };

  const isCorrectNetwork = !chainId || chainId === SOMNIA_CHAIN_ID;

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-zinc-100 relative selection:bg-zinc-700 selection:text-white">
      {/* 3D Atmospheric Background Layer */}
      <BackgroundExperience />

      {/* Top Telemetry Header */}
      <SomniaHUD />

      {/* Navigation */}
      <Navbar
        userAddress={userAddress}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
        collateralBalance={collateralBalance}
        sttBalance={sttBalance}
        isCorrectNetwork={isCorrectNetwork}
        onSwitchNetwork={handleSwitchNetwork}
        isConnecting={isConnecting}
      />

      {/* Main Terminal Grid - Frameless Monolithic Architecture */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8 relative z-10">
        {/* Open Minimalist Hero Section (ZERO CARD BOXES) */}
        <div className="pb-8 border-b border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center space-x-2 text-xs font-mono text-zinc-400 bg-white/[0.04] border border-white/[0.08] px-3 py-1 rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Somnia Shannon Testnet &bull; Chain 50312</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-semibold text-white tracking-tight leading-tight">
              Trade The Spread. <span className="text-zinc-500 font-normal">Not The Coin Flip.</span>
            </h1>

            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-2xl font-sans">
              Divergence Router executes structured two-leg positions across live DreamDEX Event Contracts. 
              Express relative-value views across Asset (BTC/ETH) and Cadence (15m/1h) dimensions with EVM atomic guarantees. Zero naked exposure.
            </p>

            {/* Verifiable On-Chain Proof References */}
            <div className="flex flex-wrap gap-2 pt-1 text-[11px] font-mono">
              <a
                href={`${EXPLORER_URL}/address/${CONTRACT_ADDRESSES.divergenceRouter}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-white/[0.03] hover:bg-white/[0.08] text-zinc-300 transition-colors border border-white/[0.06]"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
                <span>Router: {CONTRACT_ADDRESSES.divergenceRouter.slice(0, 6)}...{CONTRACT_ADDRESSES.divergenceRouter.slice(-4)}</span>
                <ExternalLink className="w-2.5 h-2.5 text-zinc-500" />
              </a>

              <a
                href={`${EXPLORER_URL}/tx/0xdfed824dd162cb10517c5faa5a972fc2f00455e34e5eb32bdca7c03f72f3dc53`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-white/[0.03] hover:bg-white/[0.08] text-zinc-300 transition-colors border border-white/[0.06]"
              >
                <span>Proof Split Tx (#484845474)</span>
                <ExternalLink className="w-2.5 h-2.5 text-zinc-500" />
              </a>

              <a
                href={`${EXPLORER_URL}/tx/0x12412c7b107249aefb8114435762db9302ec45452e81a9e1b07ee1dee632c632`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-white/[0.03] hover:bg-white/[0.08] text-zinc-300 transition-colors border border-white/[0.06]"
              >
                <span>Proof Redeem Tx (#484847020)</span>
                <ExternalLink className="w-2.5 h-2.5 text-zinc-500" />
              </a>
            </div>
          </div>

          {/* Floating Titanium Divergence Brand Mark (No Box Enclosure) */}
          <div className="hidden md:flex flex-col items-center justify-center p-2 flex-shrink-0">
            <DivergenceLogo size={88} useImage={true} className="drop-shadow-2xl" />
            <div className="text-[10px] font-mono text-zinc-400 mt-3 tracking-widest uppercase">
              Divergence Mark
            </div>
            <div className="text-[9px] font-mono text-zinc-600">
              Protocol Primitive
            </div>
          </div>
        </div>

        {/* Integrated Terminal Workbench (Split Left/Right with Single Hairline Divider) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8 pr-0 lg:pr-2">
            <MarketMatrixSelector
              selectedStrategy={selectedStrategy}
              onSelectStrategy={setSelectedStrategy}
              strategies={strategies}
            />
            <SpreadDeltaMonitor strategy={selectedStrategy} />
          </div>

          <div className="lg:col-span-1 lg:border-l lg:border-white/[0.08] lg:pl-8">
            <ExecutionConsole
              strategy={selectedStrategy}
              collateralPerLeg={collateralPerLeg}
              setCollateralPerLeg={setCollateralPerLeg}
              slippageTolerance={slippageTolerance}
              setSlippageTolerance={setSlippageTolerance}
              onOpenReview={() => {
                sound.playClick();
                setIsReviewOpen(true);
              }}
              disabled={!userAddress}
              isConnected={!!userAddress}
              onConnectWallet={handleConnect}
            />
          </div>
        </div>

        {/* Chaos Mode Revert Simulation */}
        <ChaosTrigger />

        {/* Active Positions Settlement Ledger */}
        <ActivePositions
          positions={positions}
          onRedeem={handleRedeem}
          isRedeeming={isRedeeming}
        />
      </main>

      {/* Pre-Flight Payoff Matrix Modal */}
      <PayoffMatrixModal
        isOpen={isReviewOpen}
        onClose={() => {
          setIsReviewOpen(false);
          setExecutionError(null);
        }}
        onConfirm={handleExecuteSplit}
        strategy={selectedStrategy}
        collateralPerLeg={collateralPerLeg}
        slippageTolerance={slippageTolerance}
        isLoading={isExecuting}
        statusMessage={executionStatus}
        errorMessage={executionError}
      />

      {/* Real Web3 Transaction Toast Banner */}
      {toastNotification && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-in slide-in-from-bottom-5 fade-in duration-200">
          <div className="p-4 rounded-xl bg-[#0e0e0e] border border-white/20 shadow-2xl backdrop-blur-xl text-xs font-mono relative">
            <button
              onClick={() => setToastNotification(null)}
              className="absolute top-3 right-3 text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <div className="flex items-start space-x-3 pr-4">
              <div className="mt-0.5">
                {toastNotification.type === "success" && (
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                )}
                {toastNotification.type === "error" && (
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                )}
                {toastNotification.type === "info" && (
                  <Activity className="w-4 h-4 text-zinc-300" />
                )}
              </div>
              <div className="space-y-1">
                <div className="font-semibold text-white tracking-wide">
                  {toastNotification.title}
                </div>
                <div className="text-zinc-400 leading-relaxed break-words">
                  {toastNotification.message}
                </div>
                {toastNotification.txHash && (
                  <a
                    href={`${EXPLORER_URL}/tx/${toastNotification.txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1 text-white hover:underline pt-1 text-[11px]"
                  >
                    <span>View on Somnia Explorer</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Monumental 35vh Architectural Footer */}
      <MonumentalFooter />
    </div>
  );
}
