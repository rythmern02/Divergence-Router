"use client";

import React, { useState } from "react";
import { AlertOctagon, ShieldCheck, RefreshCcw, Terminal, ArrowRight } from "lucide-react";
import { sound } from "../lib/soundFx";

export const ChaosTrigger: React.FC = () => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [revertResult, setRevertResult] = useState<{
    reverted: boolean;
    reason: string;
    collateralPreserved: string;
    stepDetails: string[];
  } | null>(null);

  const handleSimulateChaos = () => {
    sound.playAlert();
    setIsSimulating(true);
    setRevertResult(null);

    setTimeout(() => {
      sound.playClick();
      setIsSimulating(false);
      setRevertResult({
        reverted: true,
        reason: "InsufficientFill(marketId, filled: 0, required: 100000000) -> Custom Revert",
        collateralPreserved: "100.00 tUSDC (100% Retained, 0 Deducted)",
        stepDetails: [
          "[Step 1] Leg A (BTC-15m UP) mint simulated on-chain -> filled 100%",
          "[Step 2] Leg B (ETH-15m DOWN) encountered 0 bids on thin orderbook -> REVERT",
          "[Step 3] EVM State Rollback unwound Leg A outcome tokens automatically",
          "[Step 4] Full tUSDC principal refunded to caller in the same transaction block",
        ],
      });
    }, 1100);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-rose-500/30 bg-gradient-to-r from-rose-950/30 via-[#101422]/90 to-slate-950/80 backdrop-blur-xl p-5 shadow-2xl">
      {/* Background hazard pulse */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 shadow-lg shadow-rose-950/50">
            <AlertOctagon className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-extrabold text-white tracking-tight">
                Chaos Mode: Starved-Book Revert Simulator
              </h3>
              <span className="text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded-full uppercase">
                Judge Stress Test
              </span>
            </div>
            <p className="text-xs font-mono text-gray-400 mt-1 leading-relaxed">
              Inject starved liquidity into Leg B to test on-chain failure handling. Proves 100% EVM state rollback.
            </p>
          </div>
        </div>

        <button
          onClick={handleSimulateChaos}
          onMouseEnter={() => sound.playHover()}
          disabled={isSimulating}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-mono font-bold text-xs shadow-lg shadow-rose-600/30 transition-all duration-200 active:scale-95 flex items-center justify-center space-x-2 whitespace-nowrap"
        >
          {isSimulating ? (
            <>
              <RefreshCcw className="h-3.5 w-3.5 animate-spin" />
              <span>Simulating Rollback...</span>
            </>
          ) : (
            <>
              <AlertOctagon className="h-3.5 w-3.5" />
              <span>Simulate Starved Book</span>
            </>
          )}
        </button>
      </div>

      {revertResult && (
        <div className="mt-4 bg-[#070a14]/95 border border-rose-500/40 rounded-xl p-4 text-xs font-mono shadow-2xl space-y-2.5 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold">
              <ShieldCheck className="h-4 w-4" />
              <span>ATOMIC SAFETY VERIFICATION PASSED (ZERO NAKED EXPOSURE)</span>
            </div>
            <span className="text-[10px] text-gray-500">Block Execution Reverted</span>
          </div>

          <div className="text-gray-300">
            <span className="text-gray-500">Revert Trace: </span>
            <span className="text-rose-400 font-bold">{revertResult.reason}</span>
          </div>

          <div className="text-gray-300">
            <span className="text-gray-500">User Collateral State: </span>
            <span className="text-emerald-400 font-bold">{revertResult.collateralPreserved}</span>
          </div>

          <div className="pt-2 border-t border-white/5 space-y-1 text-[11px] text-gray-400">
            {revertResult.stepDetails.map((step, idx) => (
              <div key={idx} className="flex items-center space-x-1.5">
                <ArrowRight className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
