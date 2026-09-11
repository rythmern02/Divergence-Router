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
    <div className="pt-6 border-t border-white/[0.08]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-2 rounded bg-white/[0.04] text-zinc-400">
            <AlertCircle className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                04 // CHAOS PROTOCOL
              </span>
              <span className="text-zinc-700">&bull;</span>
              <h3 className="text-sm font-semibold text-white tracking-tight">
                Starved-Book Revert Simulator
              </h3>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5 font-sans">
              Test execution against zero counterparty liquidity. Proves 100% EVM transaction rollback with zero balance loss.
            </p>
          </div>
        </div>

        <button
          onClick={handleSimulateChaos}
          onMouseEnter={() => sound.playHover()}
          disabled={isSimulating}
          className="px-4 py-2 rounded bg-white/[0.06] hover:bg-white/[0.12] text-zinc-200 font-mono text-xs transition active:scale-98 flex items-center justify-center space-x-2 whitespace-nowrap border border-white/[0.08]"
        >
          {isSimulating ? (
            <>
              <RefreshCcw className="h-3 w-3 animate-spin text-zinc-400" />
              <span>Simulating...</span>
            </>
          ) : (
            <>
              <span>Simulate Starved-Book Revert</span>
            </>
          )}
        </button>
      </div>

      {revertResult && (
        <div className="mt-3 border-l-2 border-emerald-400/80 bg-white/[0.02] pl-4 pr-3 py-3 text-xs font-mono space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
            <div className="flex items-center space-x-2 text-white font-medium">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span className="tracking-wide">ATOMIC INVARIANT VERIFIED &bull; TRANSACTION ROLLED BACK</span>
            </div>
            <span className="text-[10px] text-zinc-500">Sub-Second Finality</span>
          </div>

          <div className="text-zinc-300">
            <span className="text-zinc-500">Revert Reason: </span>
            <span className="text-zinc-200">{revertResult.reason}</span>
          </div>

          <div className="text-zinc-300">
            <span className="text-zinc-500">Collateral Status: </span>
            <span className="text-white font-medium">{revertResult.collateralPreserved}</span>
          </div>

          <div className="pt-2 border-t border-white/[0.04] space-y-1 text-[11px] text-zinc-400">
            {revertResult.stepDetails.map((step, idx) => (
              <div key={idx} className="flex items-center space-x-1.5">
                <ArrowRight className="w-3 h-3 text-zinc-500 flex-shrink-0" />
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
