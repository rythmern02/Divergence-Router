"use client";

import React from "react";
import { SplitStrategy } from "../lib/constants";
import { AlertTriangle, CheckCircle2, XCircle, ShieldCheck, X, Sparkles, Zap } from "lucide-react";
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
  const maxWinPayout = totalCollateral * 2; // 2x payout if both legs win

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#0b101d]/95 border border-indigo-500/40 rounded-3xl max-w-lg w-full p-6 shadow-2xl shadow-indigo-950/80 relative overflow-hidden">
        {/* Background ambient lighting */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          disabled={isLoading}
          className="absolute top-5 right-5 text-gray-400 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-md">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white tracking-tight">
              Pre-Flight 4-Quadrant Payoff Matrix
            </h3>
            <p className="text-xs font-mono text-gray-400">
              Discrete payout distribution before 1-click execution
            </p>
          </div>
        </div>

        {/* Decorrelation Notice */}
        <div className="bg-amber-950/30 border border-amber-500/30 rounded-2xl p-3.5 my-4 text-xs font-mono text-amber-200 flex items-start space-x-2.5">
          <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-300">Decorrelation Notice: </span>
            You are betting these two legs move in opposite directions this window — NOT that one beats the other by a continuous percentage margin.
          </div>
        </div>

        {/* The 4-Quadrant Payoff Matrix */}
        <div className="rounded-2xl border border-white/10 overflow-hidden mb-4 shadow-inner">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#070b16] text-gray-400 uppercase text-[10px] font-mono border-b border-white/10">
              <tr>
                <th className="px-3.5 py-2.5">{strategy.legA.asset} Leg</th>
                <th className="px-3.5 py-2.5">{strategy.legB.asset} Leg</th>
                <th className="px-3.5 py-2.5 text-right">Net Payout</th>
                <th className="px-3.5 py-2.5 text-right">Return</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-xs">
              {/* Row 1: Target Win */}
              <tr className="bg-emerald-950/30">
                <td className="px-3.5 py-3 font-bold text-emerald-400">UP (Win)</td>
                <td className="px-3.5 py-3 font-bold text-emerald-400">DOWN (Win)</td>
                <td className="px-3.5 py-3 text-right font-extrabold text-emerald-400">
                  {maxWinPayout} tUSDC
                </td>
                <td className="px-3.5 py-3 text-right text-emerald-400 font-bold">
                  +100% (2x Win)
                </td>
              </tr>

              {/* Row 2: Reverse Fail */}
              <tr className="bg-rose-950/20">
                <td className="px-3.5 py-2.5 text-rose-400">DOWN (Loss)</td>
                <td className="px-3.5 py-2.5 text-rose-400">UP (Loss)</td>
                <td className="px-3.5 py-2.5 text-right text-rose-400">0 tUSDC</td>
                <td className="px-3.5 py-2.5 text-right text-rose-400">-100% (0x)</td>
              </tr>

              {/* Row 3: Macro Co-Pump */}
              <tr className="bg-[#090e1c]/70">
                <td className="px-3.5 py-2.5 text-gray-300">UP (Win)</td>
                <td className="px-3.5 py-2.5 text-gray-500">UP (Loss)</td>
                <td className="px-3.5 py-2.5 text-right text-gray-300">{collateralPerLeg} tUSDC</td>
                <td className="px-3.5 py-2.5 text-right text-gray-400">Flat (1x)</td>
              </tr>

              {/* Row 4: Macro Co-Dump */}
              <tr className="bg-[#090e1c]/70">
                <td className="px-3.5 py-2.5 text-gray-500">DOWN (Loss)</td>
                <td className="px-3.5 py-2.5 text-gray-300">DOWN (Win)</td>
                <td className="px-3.5 py-2.5 text-right text-gray-300">{collateralPerLeg} tUSDC</td>
                <td className="px-3.5 py-2.5 text-right text-gray-400">Flat (1x)</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Sizing & Atomic Guard Specs */}
        <div className="bg-[#070b16] p-3.5 rounded-2xl border border-white/10 text-xs space-y-1.5 mb-5 font-mono">
          <div className="flex justify-between text-gray-400">
            <span>Total Principal Required:</span>
            <span className="text-white font-bold">{totalCollateral} tUSDC</span>
          </div>
          <div className="flex justify-between text-gray-400">
            <span>Execution Invariant:</span>
            <span className="text-cyan-400 font-semibold">Single-Block Dual-Leg Mint</span>
          </div>
          <div className="flex justify-between text-gray-400">
            <span>Max Slippage Guard:</span>
            <span className="text-emerald-400">
              {(slippageTolerance * 100).toFixed(1)}% (Revert on breach)
            </span>
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
            className="w-1/3 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-gray-300 text-xs font-mono font-bold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              sound.playExecute();
              onConfirm();
            }}
            disabled={isLoading}
            className="w-2/3 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-cyan-600 to-emerald-500 hover:from-indigo-500 hover:via-cyan-500 hover:to-emerald-400 text-white text-xs font-mono font-bold shadow-xl shadow-cyan-500/25 transition-all duration-200 active:scale-98 flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Executing Atomic Split...</span>
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 fill-white" />
                <span>Confirm & Execute On-Chain</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
