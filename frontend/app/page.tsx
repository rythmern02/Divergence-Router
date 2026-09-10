"use client";

import React, { useState } from "react";
import { Navbar } from "../components/Navbar";
import { MarketMatrixSelector } from "../components/MarketMatrixSelector";
import { SpreadDeltaMonitor } from "../components/SpreadDeltaMonitor";
import { ExecutionConsole } from "../components/ExecutionConsole";
import { PayoffMatrixModal } from "../components/PayoffMatrixModal";
import { ActivePositions, PositionRecord } from "../components/ActivePositions";
import { ChaosTrigger } from "../components/ChaosTrigger";
import { PRESET_STRATEGIES, SplitStrategy } from "../lib/constants";

export default function Home() {
  const [userAddress, setUserAddress] = useState<string | null>("0x71C...49b2");
  const [collateralBalance, setCollateralBalance] = useState<number>(2500);
  const [selectedStrategy, setSelectedStrategy] = useState<SplitStrategy>(PRESET_STRATEGIES[0]);
  const [collateralPerLeg, setCollateralPerLeg] = useState<number>(50);
  const [slippageTolerance, setSlippageTolerance] = useState<number>(0.02);
  const [isReviewOpen, setIsReviewOpen] = useState<boolean>(false);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [isRedeeming, setIsRedeeming] = useState<boolean>(false);

  const [positions, setPositions] = useState<PositionRecord[]>([
    {
      id: 1,
      title: "BTC-15m↑ / ETH-15m↓ Split",
      legAOutcome: "BTC-15m UP",
      legBOutcome: "ETH-15m DOWN",
      collateralTotal: 100,
      status: "RESOLVED_WIN",
      payout: 200,
      createdAt: "10 mins ago",
    },
  ]);

  const handleConnect = () => {
    setUserAddress("0x71C0...49b2");
  };

  const handleExecuteSplit = () => {
    setIsExecuting(true);
    const totalRequired = collateralPerLeg * 2;

    setTimeout(() => {
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
        createdAt: "Just now",
      };

      setPositions([newPos, ...positions]);
    }, 1200);
  };

  const handleRedeem = (id: number) => {
    setIsRedeeming(true);

    setTimeout(() => {
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
    <div className="min-h-screen flex flex-col bg-[#090c10] text-slate-100">
      {/* Navigation */}
      <Navbar
        userAddress={userAddress}
        onConnect={handleConnect}
        collateralBalance={collateralBalance}
      />

      {/* Main Terminal Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-6">
        {/* Top Hero Banner */}
        <div className="bg-gradient-to-r from-indigo-950/40 via-[#121722] to-purple-950/30 border border-cardBorder rounded-2xl p-6 relative overflow-hidden shadow-xl">
          <div className="max-w-3xl relative z-10">
            <div className="inline-flex items-center space-x-2 text-xs font-mono font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full mb-3">
              <span>Somnia × DreamDEX Hackathon</span>
              <span>•</span>
              <span>Sub-Second Relative-Value</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Trade The Spread. Not The Coin Flip.
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-2 leading-relaxed">
              Divergence Router takes structured two-leg positions across live DreamDEX Event Contracts. 
              Bet on cross-asset decorrelation or calendar term-structure inversion with 100% EVM atomic fill guarantees.
            </p>
          </div>
        </div>

        {/* Strategy Matrix & Spread Monitor */}
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
              onOpenReview={() => setIsReviewOpen(true)}
              disabled={!userAddress}
            />
          </div>
        </div>

        {/* Chaos Mode Demo Card (Money Shot) */}
        <ChaosTrigger />

        {/* Active Positions & Settlement Claims */}
        <ActivePositions
          positions={positions}
          onRedeem={handleRedeem}
          isRedeeming={isRedeeming}
        />
      </main>

      {/* Payoff Matrix Modal */}
      <PayoffMatrixModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        onConfirm={handleExecuteSplit}
        strategy={selectedStrategy}
        collateralPerLeg={collateralPerLeg}
        slippageTolerance={slippageTolerance}
        isLoading={isExecuting}
      />

      {/* Footer */}
      <footer className="border-t border-cardBorder py-6 px-6 text-center text-xs text-gray-500 font-mono">
        Divergence Router • Powered by Somnia Shannon Testnet & DreamDEX Event Contracts CLOB • Zero Protocol Fees
      </footer>
    </div>
  );
}
