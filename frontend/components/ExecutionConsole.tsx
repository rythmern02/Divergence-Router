"use client";

import React from "react";
import { SplitStrategy } from "../lib/constants";
import { Zap, Layers, Sparkles, ShieldCheck, Fuel } from "lucide-react";
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
    <div className="glass-panel rounded-2xl p-6 shadow-2xl relative overflow-hidden space-y-5">
      {/* Background ambient light */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-white flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 text-cyan-400 border border-indigo-500/30">
            <Zap className="h-4 w-4 fill-cyan-400" />
          </div>
          <span>1-Click Atomic Console</span>
        </h3>
        <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          Depth: 100% Pre-Flight
        </span>
      </div>

      {/* Collateral Input */}
      <div>
        <div className="flex justify-between text-xs text-gray-300 mb-2 font-mono">
          <span className="font-semibold text-gray-400">Collateral Per Leg</span>
          <span className="text-cyan-400 font-bold">Total: {totalCollateral} tUSDC</span>
        </div>
        <div className="relative">
          <input
            type="number"
            min="1"
            max="5000"
            value={collateralPerLeg}
            onChange={(e) => setCollateralPerLeg(Math.max(1, Number(e.target.value)))}
            className="w-full bg-[#080d1a] border border-white/10 focus:border-cyan-400 rounded-xl px-4 py-3 text-white font-mono text-base focus:outline-none focus:ring-2 focus:ring-cyan-500/30 shadow-inner"
          />
          <span className="absolute right-4 top-3 text-xs text-cyan-400/80 font-mono font-bold">
            tUSDC
          </span>
        </div>

        {/* Quick Size Presets */}
        <div className="grid grid-cols-4 gap-2 mt-2.5">
          {quickSizes.map((size) => (
            <button
              key={size}
              onClick={() => {
                sound.playClick();
                setCollateralPerLeg(size);
              }}
              onMouseEnter={() => sound.playHover()}
              className={`py-1.5 rounded-xl text-xs font-mono transition-all duration-200 ${
                collateralPerLeg === size
                  ? "bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-bold shadow-md shadow-indigo-600/30 border border-cyan-400/40 scale-[1.02]"
                  : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Slippage Settings */}
      <div>
        <div className="flex justify-between text-xs text-gray-300 mb-2 font-mono">
          <span className="font-semibold text-gray-400">Slippage Tolerance</span>
          <span className="text-indigo-400 font-bold">
            {(slippageTolerance * 100).toFixed(0)}% Revert Threshold
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
              className={`py-1.5 rounded-xl text-xs font-mono transition-all duration-200 ${
                slippageTolerance === slip
                  ? "bg-indigo-950/60 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm"
                  : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5"
              }`}
            >
              {(slip * 100).toFixed(0)}%
            </button>
          ))}
        </div>
      </div>

      {/* Execution Guarantee Box */}
      <div className="bg-[#070b16]/90 border border-indigo-500/20 rounded-xl p-3.5 text-xs space-y-1.5 shadow-inner">
        <div className="flex items-center justify-between text-indigo-300 font-mono font-bold">
          <div className="flex items-center space-x-1.5">
            <Layers className="h-3.5 w-3.5 text-cyan-400" />
            <span>EVM All-Or-None Guarantee</span>
          </div>
          <div className="flex items-center space-x-1 text-emerald-400 text-[10px]">
            <Fuel className="w-3 h-3" />
            <span>Gas: &lt; 0.0001 STT</span>
          </div>
        </div>
        <p className="text-[11px] font-mono text-gray-400 leading-relaxed">
          Both legs mint in sequence inside one EVM transaction. If Leg B encounters insufficient depth or exceeds slippage tolerance, state rolls back automatically. Zero unhedged exposure.
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
        className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 via-cyan-600 to-emerald-500 hover:from-indigo-500 hover:via-cyan-500 hover:to-emerald-400 disabled:opacity-50 text-white font-extrabold font-mono text-xs shadow-xl shadow-cyan-500/25 transition-all duration-300 active:scale-98 flex items-center justify-center space-x-2 uppercase tracking-wider relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />
        <Zap className="h-4 w-4 fill-white" />
        <span>Review Payoff Matrix & Execute Split</span>
      </button>
    </div>
  );
};
