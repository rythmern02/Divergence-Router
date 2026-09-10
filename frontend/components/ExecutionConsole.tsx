"use client";

import React from "react";
import { SplitStrategy } from "../lib/constants";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { sound } from "../lib/soundFx";

interface ExecutionConsoleProps {
  strategy: SplitStrategy;
  collateralPerLeg: number;
  setCollateralPerLeg: (val: number) => void;
  slippageTolerance: number;
  setSlippageTolerance: (val: number) => void;
  onOpenReview: () => void;
  disabled: boolean;
}

export const ExecutionConsole: React.FC<ExecutionConsoleProps> = ({
  strategy,
  collateralPerLeg,
  setCollateralPerLeg,
  slippageTolerance,
  setSlippageTolerance,
  onOpenReview,
  disabled,
}) => {
  const quickSizes = [25, 50, 100, 250];
  const slippagePresets = [0.01, 0.02, 0.03];
  const totalCollateral = collateralPerLeg * 2;

  return (
    <div className="surface-panel rounded-2xl p-6 relative overflow-hidden space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white tracking-tight flex items-center space-x-2">
          <span>Execution Console</span>
        </h3>
        <span className="text-[10px] font-mono text-zinc-400 bg-white/[0.04] border border-white/[0.08] px-2.5 py-0.5 rounded flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          Pre-Flight Verified
        </span>
      </div>

      {/* Collateral Input */}
      <div>
        <div className="flex justify-between text-xs text-zinc-400 mb-2 font-mono">
          <span>Collateral Per Leg</span>
          <span className="text-zinc-200 font-medium">Total: {totalCollateral} tUSDC</span>
        </div>
        <div className="relative">
          <input
            type="number"
            min="1"
            max="5000"
            value={collateralPerLeg}
            onChange={(e) => setCollateralPerLeg(Math.max(1, Number(e.target.value)))}
            className="w-full bg-black/40 border border-white/[0.08] focus:border-indigo-400/60 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400/30 tabular-nums"
          />
          <span className="absolute right-4 top-3 text-xs text-zinc-500 font-mono">
            tUSDC
          </span>
        </div>

        {/* Quick Size Presets */}
        <div className="grid grid-cols-4 gap-2 mt-2">
          {quickSizes.map((size) => (
            <button
              key={size}
              onClick={() => {
                sound.playClick();
                setCollateralPerLeg(size);
              }}
              onMouseEnter={() => sound.playHover()}
              className={`py-1.5 rounded-lg text-xs font-mono transition-all ${
                collateralPerLeg === size
                  ? "bg-white/[0.12] text-white font-medium border border-white/[0.16]"
                  : "bg-white/[0.03] text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-200 border border-white/[0.04]"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Slippage Settings */}
      <div>
        <div className="flex justify-between text-xs text-zinc-400 mb-2 font-mono">
          <span>Slippage Tolerance</span>
          <span className="text-zinc-300">
            {(slippageTolerance * 100).toFixed(0)}% Revert Limit
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {slippagePresets.map((slip) => (
            <button
              key={slip}
              onClick={() => {
                sound.playClick();
                setSlippageTolerance(slip);
              }}
              onMouseEnter={() => sound.playHover()}
              className={`py-1.5 rounded-lg text-xs font-mono transition-all ${
                slippageTolerance === slip
                  ? "bg-white/[0.12] text-white font-medium border border-white/[0.16]"
                  : "bg-white/[0.03] text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-200 border border-white/[0.04]"
              }`}
            >
              {(slip * 100).toFixed(0)}%
            </button>
          ))}
        </div>
      </div>

      {/* Execution Guarantee Box */}
      <div className="bg-black/30 border border-white/[0.05] rounded-xl p-3.5 text-xs space-y-1.5">
        <div className="flex items-center justify-between text-zinc-300 font-mono text-[11px]">
          <div className="flex items-center space-x-1.5 font-medium">
            <span>EVM Atomic Guarantee</span>
          </div>
          <span className="text-zinc-500">Gas &lt; 0.0001 STT</span>
        </div>
        <p className="text-[11px] font-mono text-zinc-400 leading-relaxed">
          Both legs mint sequentially inside one EVM transaction. If Leg B exceeds slippage tolerance, the entire call reverts, refunding collateral.
        </p>
      </div>

      {/* Trigger Button */}
      <button
        onClick={() => {
          sound.playClick();
          onOpenReview();
        }}
        onMouseEnter={() => sound.playHover()}
        disabled={disabled}
        className="w-full py-3.5 rounded-xl bg-zinc-100 hover:bg-white disabled:opacity-40 text-zinc-950 font-medium text-xs shadow-md transition-all active:scale-98 flex items-center justify-center space-x-2"
      >
        <span>Review Payoff &amp; Open Split</span>
        <ArrowRight className="h-3.5 w-3.5 text-zinc-900" />
      </button>
    </div>
  );
};
