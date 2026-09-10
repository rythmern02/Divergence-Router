"use client";

import React from "react";
import { SplitStrategy } from "../lib/constants";
import { AlertTriangle, CheckCircle2, XCircle, ShieldCheck, X } from "lucide-react";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#121722] border border-indigo-500/50 rounded-2xl max-w-lg w-full p-6 shadow-2xl shadow-indigo-950/50 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-2.5 mb-2">
          <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Pre-Flight Payoff Matrix</h3>
            <p className="text-xs text-gray-400">Review discrete outcomes before atomic execution</p>
          </div>
        </div>

        {/* Important Disclaimer Alert (Flag 1 Resolution) */}
        <div className="bg-amber-950/30 border border-amber-500/30 rounded-lg p-3 my-4 text-xs text-amber-200 flex items-start space-x-2.5">
          <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-amber-300">Decorrelation Notice: </span>
            You are betting these two legs move in opposite directions this window — NOT that one beats the other by a continuous percentage margin.
          </div>
        </div>

        {/* The 4-Quadrant Payoff Matrix */}
        <div className="rounded-lg border border-slate-800 overflow-hidden mb-4">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900/90 text-gray-400 uppercase text-[10px] font-mono border-b border-slate-800">
              <tr>
                <th className="px-3 py-2">{strategy.legA.asset} Outcome</th>
                <th className="px-3 py-2">{strategy.legB.asset} Outcome</th>
                <th className="px-3 py-2 text-right">Payout</th>
                <th className="px-3 py-2 text-right">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {/* Row 1: Target Win */}
              <tr className="bg-emerald-950/20">
                <td className="px-3 py-2.5 font-bold text-emerald-400">UP (Win)</td>
                <td className="px-3 py-2.5 font-bold text-emerald-400">DOWN (Win)</td>
                <td className="px-3 py-2.5 text-right font-bold text-emerald-400">
                  {maxWinPayout} tUSDC
                </td>
                <td className="px-3 py-2.5 text-right text-emerald-400 font-sans font-semibold">
                  +100% (2x Win)
                </td>
              </tr>

              {/* Row 2: Reverse Fail */}
              <tr className="bg-red-950/10">
                <td className="px-3 py-2 text-red-400">DOWN (Loss)</td>
                <td className="px-3 py-2 text-red-400">UP (Loss)</td>
                <td className="px-3 py-2 text-right text-red-400">0 tUSDC</td>
                <td className="px-3 py-2 text-right text-red-400 font-sans font-semibold">
                  -100% (Full Loss)
                </td>
              </tr>

              {/* Row 3: Macro Co-Pump */}
              <tr className="bg-slate-900/40">
                <td className="px-3 py-2 text-gray-300">UP (Win)</td>
                <td className="px-3 py-2 text-gray-400">UP (Loss)</td>
                <td className="px-3 py-2 text-right text-gray-300">{collateralPerLeg} tUSDC</td>
                <td className="px-3 py-2 text-right text-gray-400 font-sans">
                  Flat (Canceled)
                </td>
              </tr>

              {/* Row 4: Macro Co-Dump */}
              <tr className="bg-slate-900/40">
                <td className="px-3 py-2 text-gray-400">DOWN (Loss)</td>
                <td className="px-3 py-2 text-gray-300">DOWN (Win)</td>
                <td className="px-3 py-2 text-right text-gray-300">{collateralPerLeg} tUSDC</td>
                <td className="px-3 py-2 text-right text-gray-400 font-sans">
                  Flat (Canceled)
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Sizing & Atomic Guard Specs */}
        <div className="bg-[#0b0e14] p-3 rounded-lg border border-slate-800 text-xs space-y-1.5 mb-5 font-mono">
          <div className="flex justify-between text-gray-400">
            <span>Total Collateral:</span>
            <span className="text-white font-bold">{totalCollateral} tUSDC</span>
          </div>
          <div className="flex justify-between text-gray-400">
            <span>Execution Model:</span>
            <span className="text-indigo-400">EVM Atomic Dual-Leg Mint</span>
          </div>
          <div className="flex justify-between text-gray-400">
            <span>Max Slippage Guard:</span>
            <span className="text-emerald-400">{(slippageTolerance * 100).toFixed(1)}% (Revert on breach)</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-1/3 py-2.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="w-2/3 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all active:scale-98 flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Submitting Atomic Route...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" />
                <span>Confirm & Execute Split</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
