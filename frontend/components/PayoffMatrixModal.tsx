"use client";

import React from "react";
import { SplitStrategy } from "../lib/constants";
import { AlertCircle, ShieldCheck, X } from "lucide-react";
import { sound } from "../lib/soundFx";

interface PayoffMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  strategy: SplitStrategy;
  collateralPerLeg: number;
  slippageTolerance: number;
  isLoading: boolean;
}

export const PayoffMatrixModal: React.FC<PayoffMatrixModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  strategy,
  collateralPerLeg,
  slippageTolerance,
  isLoading,
}) => {
  if (!isOpen) return null;

  const totalCollateral = collateralPerLeg * 2;
  const maxWinPayout = totalCollateral * 2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#0e121a] border border-white/[0.1] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          disabled={isLoading}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/[0.05] transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-zinc-300">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white tracking-tight">
              Pre-Flight Payoff Matrix
            </h3>
            <p className="text-xs font-mono text-zinc-400">
              Discrete 4-quadrant payout distribution before execution
            </p>
          </div>
        </div>

        {/* Decorrelation Notice */}
        <div className="bg-amber-500/[0.06] border border-amber-500/20 rounded-xl p-3 my-4 text-xs font-mono text-amber-200/90 flex items-start space-x-2.5">
          <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-medium text-amber-300">Decorrelation Trade Notice: </span>
            You are betting these two legs move in opposite directions this window — NOT that one beats the other by a continuous percentage margin.
          </div>
        </div>

        {/* The 4-Quadrant Payoff Matrix */}
        <div className="rounded-xl border border-white/[0.08] overflow-hidden mb-4">
          <table className="w-full text-xs text-left">
            <thead className="bg-black/40 text-zinc-400 uppercase text-[10px] font-mono border-b border-white/[0.06]">
              <tr>
                <th className="px-3.5 py-2">{strategy.legA.asset} Leg</th>
                <th className="px-3.5 py-2">{strategy.legB.asset} Leg</th>
                <th className="px-3.5 py-2 text-right">Payout</th>
                <th className="px-3.5 py-2 text-right">Return</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] font-mono text-xs">
              {/* Row 1: Target Win */}
              <tr className="bg-emerald-950/25">
                <td className="px-3.5 py-2.5 font-medium text-emerald-400">UP (Win)</td>
                <td className="px-3.5 py-2.5 font-medium text-emerald-400">DOWN (Win)</td>
                <td className="px-3.5 py-2.5 text-right font-medium text-emerald-400 tabular-nums">
                  {maxWinPayout} tUSDC
                </td>
                <td className="px-3.5 py-2.5 text-right text-emerald-400 font-medium">
                  +100% (2x)
                </td>
              </tr>

              {/* Row 2: Reverse Fail */}
              <tr className="bg-rose-950/20">
                <td className="px-3.5 py-2.5 text-rose-400">DOWN (Loss)</td>
                <td className="px-3.5 py-2.5 text-rose-400">UP (Loss)</td>
                <td className="px-3.5 py-2.5 text-right text-rose-400 tabular-nums">0 tUSDC</td>
                <td className="px-3.5 py-2.5 text-right text-rose-400">-100% (0x)</td>
              </tr>

              {/* Row 3: Macro Co-Pump */}
              <tr className="bg-black/20">
                <td className="px-3.5 py-2 text-zinc-300">UP (Win)</td>
                <td className="px-3.5 py-2 text-zinc-500">UP (Loss)</td>
                <td className="px-3.5 py-2 text-right text-zinc-300 tabular-nums">{collateralPerLeg} tUSDC</td>
                <td className="px-3.5 py-2 text-right text-zinc-500">Flat (1x)</td>
              </tr>

              {/* Row 4: Macro Co-Dump */}
              <tr className="bg-black/20">
                <td className="px-3.5 py-2 text-zinc-500">DOWN (Loss)</td>
                <td className="px-3.5 py-2 text-zinc-300">DOWN (Win)</td>
                <td className="px-3.5 py-2 text-right text-zinc-300 tabular-nums">{collateralPerLeg} tUSDC</td>
                <td className="px-3.5 py-2 text-right text-zinc-500">Flat (1x)</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Sizing & Atomic Guard Specs */}
        <div className="bg-black/30 p-3 rounded-xl border border-white/[0.06] text-xs space-y-1.5 mb-5 font-mono">
          <div className="flex justify-between text-zinc-400">
            <span>Total Principal:</span>
            <span className="text-zinc-200 font-medium tabular-nums">{totalCollateral} tUSDC</span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>Atomic Fill Invariant:</span>
            <span className="text-zinc-200">Both Legs Fill or Revert</span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>Slippage Limit:</span>
            <span className="text-zinc-200 tabular-nums">{(slippageTolerance * 100).toFixed(0)}%</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            disabled={isLoading}
            className="w-1/3 py-2.5 rounded-xl border border-white/[0.08] hover:bg-white/[0.04] text-zinc-300 text-xs font-medium transition"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              sound.playExecute();
              onConfirm();
            }}
            disabled={isLoading}
            className="w-2/3 py-2.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold shadow-sm transition active:scale-98 flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <span className="h-3.5 w-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                <span>Executing On-Chain...</span>
              </>
            ) : (
              <span>Confirm &amp; Execute Split</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
