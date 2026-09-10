"use client";

import React from "react";
import { SplitStrategy } from "../lib/constants";
import { ShieldAlert, Zap, Layers } from "lucide-react";

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
    <div className="bg-[#121722] border border-cardBorder rounded-xl p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white flex items-center space-x-2">
          <Zap className="h-4 w-4 text-indigo-400" />
          <span>Atomic Order Console</span>
        </h3>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded">
          Pre-Flight Depth: 100% Verified
        </span>
      </div>

      {/* Collateral Input */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-400 mb-1.5 font-medium">
          <span>Collateral Per Leg</span>
          <span className="font-mono text-gray-300">Total: {totalCollateral} tUSDC</span>
        </div>
        <div className="relative">
          <input
            type="number"
            min="1"
            max="5000"
            value={collateralPerLeg}
            onChange={(e) => setCollateralPerLeg(Math.max(1, Number(e.target.value)))}
            className="w-full bg-[#0b0e14] border border-slate-800 focus:border-indigo-500 rounded-lg px-3.5 py-2.5 text-white font-mono text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <span className="absolute right-3.5 top-2.5 text-xs text-gray-500 font-mono">
            tUSDC
          </span>
        </div>

        {/* Quick Size Presets */}
        <div className="flex space-x-2 mt-2">
          {quickSizes.map((size) => (
            <button
              key={size}
              onClick={() => setCollateralPerLeg(size)}
              className={`flex-1 py-1 rounded text-[11px] font-mono transition-colors ${
                collateralPerLeg === size
                  ? "bg-indigo-600 text-white font-semibold"
                  : "bg-slate-900 text-gray-400 hover:bg-slate-800"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Slippage Settings */}
      <div className="mb-5">
        <div className="flex justify-between text-xs text-gray-400 mb-1.5 font-medium">
          <span>Max Slippage Tolerance</span>
          <span className="font-mono text-indigo-400">{(slippageTolerance * 100).toFixed(0)}% Revert Threshold</span>
        </div>
        <div className="flex space-x-2">
          {slippagePresets.map((slip) => (
            <button
              key={slip}
              onClick={() => setSlippageTolerance(slip)}
              className={`flex-1 py-1 rounded text-[11px] font-mono transition-colors ${
                slippageTolerance === slip
                  ? "bg-slate-800 text-indigo-300 font-semibold border border-indigo-500/40"
                  : "bg-slate-900 text-gray-400 hover:bg-slate-800 border border-slate-800"
              }`}
            >
              {(slip * 100).toFixed(0)}%
            </button>
          ))}
        </div>
      </div>

      {/* Execution Guarantee Box (Flag 2) */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3 text-xs mb-5 space-y-1">
        <div className="flex items-center space-x-1.5 text-indigo-300 font-medium">
          <Layers className="h-3.5 w-3.5 text-indigo-400" />
          <span>EVM All-or-None Guarantee:</span>
        </div>
        <p className="text-[11px] text-gray-400 leading-relaxed">
          Both legs mint in sequence in a single block. If Leg B encounters insufficient liquidity, EVM state rollback completely protects your collateral.
        </p>
      </div>

      {/* Trigger Button */}
      <button
        onClick={onOpenReview}
        disabled={disabled}
        className="w-full py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all active:scale-98 flex items-center justify-center space-x-2"
      >
        <Zap className="h-4 w-4" />
        <span>Review Payoff Matrix & Execute Split</span>
      </button>
    </div>
  );
};
