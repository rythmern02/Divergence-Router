"use client";

import React, { useState } from "react";
import { Navbar } from "../components/Navbar";
import { SomniaHUD } from "../components/SomniaHUD";
import { BackgroundExperience } from "../components/BackgroundExperience";
import { MarketMatrixSelector } from "../components/MarketMatrixSelector";
import { SpreadDeltaMonitor } from "../components/SpreadDeltaMonitor";
import { ExecutionConsole } from "../components/ExecutionConsole";
import { PayoffMatrixModal } from "../components/PayoffMatrixModal";
import { ActivePositions, PositionRecord } from "../components/ActivePositions";
import { ChaosTrigger } from "../components/ChaosTrigger";
import { PRESET_STRATEGIES, SplitStrategy, CONTRACT_ADDRESSES, EXPLORER_URL } from "../lib/constants";
import { sound } from "../lib/soundFx";
import { ExternalLink, ShieldCheck } from "lucide-react";

export default function Home() {
  const [userAddress, setUserAddress] = useState<string | null>("0x18AF72239dD6a52426e4dd9509C6515Df06477E4");
  const [collateralBalance, setCollateralBalance] = useState<number>(498);
  const [selectedStrategy, setSelectedStrategy] = useState<SplitStrategy>(PRESET_STRATEGIES[0]);
  const [collateralPerLeg, setCollateralPerLeg] = useState<number>(50);
  const [slippageTolerance, setSlippageTolerance] = useState<number>(0.02);
  const [isReviewOpen, setIsReviewOpen] = useState<boolean>(false);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [isRedeeming, setIsRedeeming] = useState<boolean>(false);

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

  const handleConnect = () => {
    setUserAddress("0x18AF72239dD6a52426e4dd9509C6515Df06477E4");
  };

  const handleExecuteSplit = () => {
    setIsExecuting(true);
    const totalRequired = collateralPerLeg * 2;

    setTimeout(() => {
      sound.playExecute();
      setIsExecuting(false);
      setIsReviewOpen(false);

      setCollateralBalance((prev) => Math.max(0, prev - totalRequired));

      const newPos: PositionRecord = {
        id: positions.length + 1,
        title: selectedStrategy.title,
        legAOutcome: selectedStrategy.legA.name,
        legBOutcome: selectedStrategy.legB.name,
        collateralTotal: totalRequired,
        status: "ACTIVE",
        payout: 0,
        createdAt: "Pending Settlement",
      };

      setPositions([newPos, ...positions]);
    }, 1200);
  };

  const handleRedeem = (id: number) => {
    setIsRedeeming(true);

    setTimeout(() => {
      sound.playRedeem();
      setIsRedeeming(false);
      setPositions((prev) =>
        prev.map((p) => {
          if (p.id === id) {
            setCollateralBalance((b) => b + p.payout);
            return { ...p, status: "REDEEMED" as const };
          }
          return p;
        })
      );
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#07090e] text-zinc-100 relative selection:bg-zinc-700 selection:text-white">
      {/* 3D Atmospheric Background Layer */}
      <BackgroundExperience />

      {/* Top Telemetry Header */}
      <SomniaHUD />

      {/* Navigation */}
      <Navbar
        userAddress={userAddress}
        onConnect={handleConnect}
        collateralBalance={collateralBalance}
      />

      {/* Main Terminal Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6 relative z-10">
        {/* Minimalist Hero Section */}
        <div className="surface-panel rounded-3xl p-6 sm:p-8 relative overflow-hidden">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center space-x-2 text-xs font-mono text-zinc-400 bg-white/[0.04] border border-white/[0.08] px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Somnia Shannon Testnet &bull; Chain 50312</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight leading-tight">
              Trade The Spread. <span className="text-zinc-400 font-normal">Not The Coin Flip.</span>
            </h1>

            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-2xl font-sans">
              Divergence Router executes structured two-leg positions across live DreamDEX Event Contracts. 
              Express relative-value views across Asset (BTC/ETH) and Cadence (15m/1h) dimensions with EVM atomic guarantees. Zero naked exposure.
            </p>

            {/* Verifiable On-Chain Proof References */}
            <div className="flex flex-wrap gap-2 pt-2 text-[11px] font-mono">
              <a
                href={`${EXPLORER_URL}/address/${CONTRACT_ADDRESSES.divergenceRouter}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] text-zinc-300 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
                <span>Router: {CONTRACT_ADDRESSES.divergenceRouter.slice(0, 6)}...{CONTRACT_ADDRESSES.divergenceRouter.slice(-4)}</span>
                <ExternalLink className="w-2.5 h-2.5 text-zinc-500" />
              </a>

              <a
                href={`${EXPLORER_URL}/tx/0xdfed824dd162cb10517c5faa5a972fc2f00455e34e5eb32bdca7c03f72f3dc53`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] text-zinc-300 transition-colors"
              >
                <span>Proof Split Tx (#484845474)</span>
                <ExternalLink className="w-2.5 h-2.5 text-zinc-500" />
              </a>

              <a
                href={`${EXPLORER_URL}/tx/0x12412c7b107249aefb8114435762db9302ec45452e81a9e1b07ee1dee632c632`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] text-zinc-300 transition-colors"
              >
                <span>Proof Redeem Tx (#484847020)</span>
                <ExternalLink className="w-2.5 h-2.5 text-zinc-500" />
              </a>
            </div>
          </div>
        </div>

        {/* Core Strategy Selector & Real-Time Spread Monitor */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <MarketMatrixSelector
              selectedStrategy={selectedStrategy}
              onSelectStrategy={setSelectedStrategy}
            />
            <SpreadDeltaMonitor strategy={selectedStrategy} />
          </div>

          <div className="space-y-6">
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
            />
          </div>
        </div>

        {/* Chaos Mode Revert Simulation Card */}
        <ChaosTrigger />

        {/* Active Positions Ledger & Redemption Claims */}
        <ActivePositions
          positions={positions}
          onRedeem={handleRedeem}
          isRedeeming={isRedeeming}
        />
      </main>

      {/* Pre-Flight Payoff Matrix Modal */}
      <PayoffMatrixModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        onConfirm={handleExecuteSplit}
        strategy={selectedStrategy}
        collateralPerLeg={collateralPerLeg}
        slippageTolerance={slippageTolerance}
        isLoading={isExecuting}
      />

      {/* Terminal Footer */}
      <footer className="border-t border-white/[0.06] bg-[#07090e] py-6 px-6 relative z-10 text-xs text-zinc-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Divergence Router &bull; Somnia Shannon Testnet &bull; DreamDEX CLOB</span>
          </div>
          <div className="text-zinc-500 text-[11px]">
            1-Click EVM Atomicity &bull; Built for Somnia &times; DreamDEX Hackathon
          </div>
        </div>
      </footer>
    </div>
  );
}
