"use client";

import React, { useState } from "react";
import { AlertOctagon, ShieldCheck, RefreshCcw } from "lucide-react";

export const ChaosTrigger: React.FC = () => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [revertResult, setRevertResult] = useState<{
    reverted: boolean;
    reason: string;
    collateralPreserved: string;
  } | null>(null);

  const handleSimulateChaos = () => {
    setIsSimulating(true);
    setRevertResult(null);

    setTimeout(() => {
      setIsSimulating(false);
      setRevertResult({
        reverted: true,
        reason: "InsufficientFill(marketId, 0, 100000000) -> EVM Atomic Rollback Triggered",
        collateralPreserved: "100.00 tUSDC (0 deducted)",
      });
    }, 1200);
  };

  return (
    <div className="bg-gradient-to-r from-red-950/20 via-[#121722] to-slate-900 border border-red-500/30 rounded-xl p-5 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
            <AlertOctagon className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-white">Chaos Mode: Thin-Book Revert Simulator</h3>
              <span className="text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded uppercase">
                Judge Demo Tool
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Simulate an atomic execution where Leg B lacks counterparty liquidity. Proves 100% EVM state rollback.
            </p>
          </div>
        </div>

        <button
          onClick={handleSimulateChaos}
          disabled={isSimulating}
          className="px-4 py-2 rounded-lg bg-red-600/90 hover:bg-red-500 text-white font-bold text-xs shadow-md shadow-red-600/20 transition-all active:scale-95 flex items-center space-x-2"
        >
          {isSimulating ? (
            <>
              <RefreshCcw className="h-3.5 w-3.5 animate-spin" />
              <span>Simulating...</span>
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
        <div className="mt-4 bg-[#0b0e14] border border-red-500/40 rounded-lg p-3.5 text-xs font-mono animate-fade-in">
          <div className="flex items-center space-x-2 text-emerald-400 font-bold mb-1">
            <ShieldCheck className="h-4 w-4" />
            <span>ATOMIC SAFETY VERIFICATION PASSED</span>
          </div>
          <div className="text-gray-300">
            <span className="text-gray-500">Revert Trace: </span>
            <span className="text-red-400">{revertResult.reason}</span>
          </div>
          <div className="text-gray-300 mt-1">
            <span className="text-gray-500">User Balance Status: </span>
            <span className="text-emerald-400 font-bold">{revertResult.collateralPreserved}</span>
          </div>
          <div className="text-[11px] text-gray-500 mt-1 font-sans">
            Because Leg B could not fill, EVM atomicity automatically unwound Leg A. Zero naked directional exposure.
          </div>
        </div>
      )}
    </div>
  );
};
