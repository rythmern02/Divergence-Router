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
  isConnected?: boolean;
  onConnectWallet?: () => void;
}

export const ExecutionConsole: React.FC<ExecutionConsoleProps> = ({
  strategy,
  collateralPerLeg,
  setCollateralPerLeg,
  slippageTolerance,
  setSlippageTolerance,
  onOpenReview,
  disabled,
  isConnected = true,
  onConnectWallet,
}) => {
  const quickSizes = [25, 50, 100, 250];
  const slippagePresets = [0.01, 0.02, 0.03];
  const totalCollateral = collateralPerLeg * 2;

  return (
    <div className="space-y-6">
      {/* Frameless Section Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
        <div className="flex items-center space-x-3">
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
            03 // EXECUTION RAIL
          </span>
          <span className="text-zinc-700">&bull;</span>
          <h3 className="text-sm font-semibold text-white tracking-tight">
            Order Parameters
          </h3>
        </div>
        <span className="text-[10px] font-mono text-zinc-400 bg-white/[0.04] border border-white/[0.08] px-2 py-0.5 rounded flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-zinc-300" />
          Pre-Flight Ready
        </span>
      </div>

      {/* Frameless Sizing Input */}
      <div className="space-y-3">
        <div className="flex justify-between text-xs text-zinc-400 font-mono">
          <span className="uppercase tracking-wider text-[11px] text-zinc-500">Collateral Per Leg</span>
          <span className="text-zinc-300 font-medium">Total: {totalCollateral} tUSDC</span>
        </div>

        <div className="flex items-baseline justify-between border-b border-white/20 focus-within:border-white transition-colors pb-2">
          <input
            type="number"
            min="1"
            max="5000"
            value={collateralPerLeg}
            onChange={(e) => setCollateralPerLeg(Math.max(1, Number(e.target.value)))}
            className="bg-transparent text-3xl font-mono font-medium text-white focus:outline-none w-2/3 tabular-nums placeholder-zinc-700"
            placeholder="50"
          />
          <span className="text-sm font-mono text-zinc-400 uppercase tracking-widest">
            tUSDC
          </span>
        </div>

        {/* Quick Size Presets (Borderless Hairline Pills) */}
        <div className="grid grid-cols-4 gap-2 pt-1">
          {quickSizes.map((size) => (
            <button
              key={size}
              onClick={() => {
                sound.playClick();
                setCollateralPerLeg(size);
              }}
              onMouseEnter={() => sound.playHover()}
              className={`py-1.5 text-xs font-mono rounded transition-all ${
                collateralPerLeg === size
                  ? "bg-white text-black font-semibold"
                  : "bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Slippage Settings */}
      <div className="space-y-2 pt-2 border-t border-white/[0.06]">
        <div className="flex justify-between text-xs text-zinc-400 font-mono">
          <span className="uppercase tracking-wider text-[11px] text-zinc-500">Slippage Limit</span>
          <span className="text-zinc-300">
            {(slippageTolerance * 100).toFixed(0)}% Max Deviation
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
              className={`py-1.5 text-xs font-mono rounded transition-all ${
                slippageTolerance === slip
                  ? "bg-white text-black font-semibold"
                  : "bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white"
              }`}
            >
              {(slip * 100).toFixed(0)}%
            </button>
          ))}
        </div>
      </div>

      {/* Atomic Guarantee Spec */}
      <div className="border-l-2 border-zinc-700 pl-3.5 py-1 text-xs space-y-1">
        <div className="flex items-center justify-between text-zinc-300 font-mono text-[11px]">
          <span className="font-medium text-white uppercase tracking-wider">EVM Atomic Invariant</span>
          <span className="text-zinc-500">&lt; 0.0001 STT Gas</span>
        </div>
        <p className="text-[11px] font-mono text-zinc-400 leading-relaxed">
          Both legs mint sequentially in 1 EVM transaction. If counterparty liquidity fails, execution reverts with 0 collateral loss.
        </p>
      </div>

      {/* Monolithic Titanium Trigger Button */}
      {isConnected ? (
        <button
          onClick={() => {
            sound.playClick();
            onOpenReview();
          }}
          onMouseEnter={() => sound.playHover()}
          disabled={disabled}
          className="w-full py-4 rounded-lg bg-white hover:bg-zinc-200 disabled:opacity-40 text-black font-semibold text-xs uppercase tracking-wider transition-all active:scale-[0.99] flex items-center justify-center space-x-2 shadow-lg cursor-pointer"
        >
          <span>Review Payoff &amp; Open Split</span>
          <ArrowRight className="h-3.5 w-3.5 text-black" />
        </button>
      ) : (
        <button
          onClick={() => {
            sound.playClick();
            onConnectWallet?.();
          }}
          onMouseEnter={() => sound.playHover()}
          className="w-full py-4 rounded-lg bg-white hover:bg-zinc-200 text-black font-semibold text-xs uppercase tracking-wider transition-all active:scale-[0.99] flex items-center justify-center space-x-2 shadow-lg cursor-pointer animate-pulse"
        >
          <span>Connect Wallet to Trade</span>
          <ArrowRight className="h-3.5 w-3.5 text-black" />
        </button>
      )}
    </div>
  );
};
