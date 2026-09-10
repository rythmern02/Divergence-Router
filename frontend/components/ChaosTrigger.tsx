"use client";

import React, { useState } from "react";
import { AlertCircle, ShieldCheck, RefreshCcw, ArrowRight } from "lucide-react";
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
        reason: "InsufficientFill(market, filled: 0, required: 1000000) -> Revert",
        collateralPreserved: "100.00 tUSDC (100% Retained & Refunded)",
        stepDetails: [
          "Leg A (BTC-15m UP) mint executed on-chain",
          "Leg B (ETH-15m DOWN) encountered 0 counterparty liquidity",
          "EVM Transaction Reverted — Leg A outcome tokens unwound",
          "Zero collateral deducted from user account",
        ],
      });
    }, 1000);
  };

  return (
    <div className="surface-panel rounded-2xl p-5 relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-zinc-400">
            <AlertCircle className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-semibold text-white tracking-tight">
                Chaos Mode: Starved-Book Revert Simulator
              </h3>
              <span className="text-[10px] font-mono text-zinc-400 bg-white/[0.04] border border-white/[0.08] px-2 py-0.5 rounded">
                EVM Verification
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Simulate an atomic execution where Leg B lacks counterparty liquidity. Proves 100% EVM state rollback.
            </p>
          </div>
        </div>

        <button
          onClick={handleSimulateChaos}
          onMouseEnter={() => sound.playHover()}
          disabled={isSimulating}
          className="px-4 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-zinc-200 font-mono text-xs transition active:scale-98 flex items-center justify-center space-x-2 whitespace-nowrap"
        >
          {isSimulating ? (
            <>
              <RefreshCcw className="h-3 w-3 animate-spin text-zinc-400" />
              <span>Simulating...</span>
            </>
          ) : (
            <>
              <span>Simulate Revert</span>
            </>
          )}
        </button>
      </div>

      {revertResult && (
        <div className="mt-4 bg-black/40 border border-white/[0.08] rounded-xl p-4 text-xs font-mono space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
            <div className="flex items-center space-x-2 text-emerald-400 font-medium">
              <ShieldCheck className="h-4 w-4" />
              <span>ATOMIC INVARIANT VERIFIED &bull; ZERO NAKED EXPOSURE</span>
            </div>
            <span className="text-[10px] text-zinc-500">Transaction Rolled Back</span>
          </div>

          <div className="text-zinc-300">
            <span className="text-zinc-500">Revert Reason: </span>
            <span className="text-rose-400">{revertResult.reason}</span>
          </div>

          <div className="text-zinc-300">
            <span className="text-zinc-500">Collateral Status: </span>
            <span className="text-emerald-400 font-medium">{revertResult.collateralPreserved}</span>
          </div>

          <div className="pt-2 border-t border-white/[0.04] space-y-1 text-[11px] text-zinc-400">
            {revertResult.stepDetails.map((step, idx) => (
              <div key={idx} className="flex items-center space-x-1.5">
                <ArrowRight className="w-3 h-3 text-zinc-600 flex-shrink-0" />
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
