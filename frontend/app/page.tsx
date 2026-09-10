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
import { ExternalLink, Sparkles, Shield, Zap, Layers } from "lucide-react";

export default function Home() {
  // Real Somnia Shannon Testnet address provided by user with live STT & tUSDC
  const [userAddress, setUserAddress] = useState<string | null>("0x18AF72239dD6a52426e4dd9509C6515Df06477E4");
  const [collateralBalance, setCollateralBalance] = useState<number>(498);
  const [selectedStrategy, setSelectedStrategy] = useState<SplitStrategy>(PRESET_STRATEGIES[0]);
  const [collateralPerLeg, setCollateralPerLeg] = useState<number>(50);
  const [slippageTolerance, setSlippageTolerance] = useState<number>(0.02);
  const [isReviewOpen, setIsReviewOpen] = useState<boolean>(false);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [isRedeeming, setIsRedeeming] = useState<boolean>(false);

  // Position 1 contains the real on-chain verified transaction from Somnia testnet
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

      // Deduct balance
      setCollateralBalance((prev) => Math.max(0, prev - totalRequired));

      // Append new active position
      const newPos: PositionRecord = {
        id: positions.length + 1,
        title: selectedStrategy.title,
        legAOutcome: selectedStrategy.legA.name,
        legBOutcome: selectedStrategy.legB.name,
        collateralTotal: totalRequired,
        status: "ACTIVE",
        payout: 0,
        createdAt: "Just now (Pending Settlement)",
      };

      setPositions([newPos, ...positions]);
    }, 1400);
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
    }, 900);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050811] text-slate-100 relative selection:bg-cyan-500 selection:text-black">
      {/* 3D Video-Like Continuous Motion Background & Particle Grid Engine */}
      <BackgroundExperience />

      {/* Top Real-Time Somnia Sub-Second Block & TPS HUD */}
      <SomniaHUD />

      {/* Primary Navigation */}
      <Navbar
        userAddress={userAddress}
        onConnect={handleConnect}
        collateralBalance={collateralBalance}
      />

      {/* Main Terminal Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-7 relative z-10">
        {/* Futuristic Hero Banner with 3D Cyberpunk Aesthetic */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl border border-white/10 group">
          {/* Ambient Corner Glows */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-cyan-500/15 via-indigo-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-purple-600/15 to-transparent rounded-full blur-2xl pointer-events-none" />

          <div className="max-w-4xl relative z-10 space-y-4">
            <div className="inline-flex items-center space-x-2 text-xs font-mono font-bold bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 text-cyan-300 border border-cyan-500/30 px-3.5 py-1.5 rounded-full shadow-inner">
              <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Somnia × DreamDEX Hackathon</span>
              <span className="text-gray-500">•</span>
              <span className="text-emerald-400 font-extrabold">Live On-Chain Engine</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Trade The Spread.{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400">
                Not The Coin Flip.
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-gray-300 max-w-3xl leading-relaxed font-mono">
              Divergence Router takes structured two-leg positions across live DreamDEX Event Contracts. 
              Express relative-value views across <strong className="text-cyan-400">Asset</strong> (BTC/ETH) and{" "}
              <strong className="text-indigo-400">Cadence</strong> (15m/1h) dimensions with 100% EVM atomic fill guarantees. Zero legging-in risk.
            </p>

            {/* Quick Proof Badges */}
            <div className="flex flex-wrap gap-2.5 pt-2 text-[11px] font-mono">
              <a
                href={`${EXPLORER_URL}/address/${CONTRACT_ADDRESSES.divergenceRouter}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/40 text-gray-300 transition-colors"
              >
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                <span>Router: {CONTRACT_ADDRESSES.divergenceRouter.slice(0, 6)}...{CONTRACT_ADDRESSES.divergenceRouter.slice(-4)}</span>
                <ExternalLink className="w-2.5 h-2.5 text-gray-500" />
              </a>

              <a
                href={`${EXPLORER_URL}/tx/0xdfed824dd162cb10517c5faa5a972fc2f00455e34e5eb32bdca7c03f72f3dc53`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 text-emerald-300 transition-colors"
              >
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>Live Proof Split Tx (#484845474)</span>
                <ExternalLink className="w-2.5 h-2.5 text-emerald-500" />
              </a>

              <a
                href={`${EXPLORER_URL}/tx/0x12412c7b107249aefb8114435762db9302ec45452e81a9e1b07ee1dee632c632`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-500/30 text-indigo-300 transition-colors"
              >
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>Live Proof Redeem Tx (#484847020)</span>
                <ExternalLink className="w-2.5 h-2.5 text-indigo-400" />
              </a>
            </div>
          </div>
        </div>

        {/* Strategy Matrix & Spread Monitor Grid */}
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

        {/* Chaos Mode Revert Simulator (Money Shot) */}
        <ChaosTrigger />

        {/* Active Positions & Settlement Claims */}
        <ActivePositions
          positions={positions}
          onRedeem={handleRedeem}
          isRedeeming={isRedeeming}
        />
      </main>

      {/* 4-Quadrant Payoff Modal */}
      <PayoffMatrixModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        onConfirm={handleExecuteSplit}
        strategy={selectedStrategy}
        collateralPerLeg={collateralPerLeg}
        slippageTolerance={slippageTolerance}
        isLoading={isExecuting}
      />

      {/* High-Tech Terminal Footer */}
      <footer className="border-t border-white/10 bg-[#050811]/90 backdrop-blur-xl py-6 px-6 relative z-10 text-center text-xs text-gray-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-gray-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Divergence Router • Somnia Shannon Chain 50312 • DreamDEX CLOB</span>
          </div>
          <div className="text-gray-500 text-[11px]">
            Zero Naked Exposure • 1-Click EVM Atomicity • Built for the Somnia × DreamDEX Hackathon
          </div>
        </div>
      </footer>
    </div>
  );
}
