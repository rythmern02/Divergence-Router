"use client";

import React from "react";
import { CheckCircle, Clock, ArrowUpRight, Check, Coins } from "lucide-react";

export interface PositionRecord {
  id: number;
  title: string;
  legAOutcome: string;
  legBOutcome: string;
  collateralTotal: number;
  status: "ACTIVE" | "RESOLVED_WIN" | "RESOLVED_FLAT" | "REDEEMED";
  payout: number;
  createdAt: string;
}

interface ActivePositionsProps {
  positions: PositionRecord[];
  onRedeem: (id: number) => void;
  isRedeeming: boolean;
}

export const ActivePositions: React.FC<ActivePositionsProps> = ({
  positions,
  onRedeem,
  isRedeeming,
}) => {
  return (
    <div className="bg-[#121722] border border-cardBorder rounded-xl p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Coins className="h-4 w-4 text-emerald-400" />
            <span>Active Splits & Settlement Claims</span>
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Real-time on-chain position tracking and 1-click settlement netting.
          </p>
        </div>
        <span className="text-xs font-mono text-gray-400">
          Total Positions: {positions.length}
        </span>
      </div>

      {positions.length === 0 ? (
        <div className="py-8 text-center border border-dashed border-slate-800 rounded-lg text-xs text-gray-500">
          No active split positions. Open a structured split above to see it tracked here.
        </div>
      ) : (
        <div className="space-y-3">
          {positions.map((pos) => {
            const isRedeemable = pos.status === "RESOLVED_WIN" || pos.status === "RESOLVED_FLAT";
            const isRedeemed = pos.status === "REDEEMED";

            return (
              <div
                key={pos.id}
                className="bg-slate-900/60 border border-slate-800 rounded-lg p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-gray-500 font-bold">#{pos.id}</span>
                    <span className="font-bold text-white">{pos.title}</span>
                    {pos.status === "ACTIVE" && (
                      <span className="flex items-center space-x-1 text-[10px] text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded">
                        <Clock className="h-3 w-3" />
                        <span>Trading</span>
                      </span>
                    )}
                    {pos.status === "RESOLVED_WIN" && (
                      <span className="text-[10px] text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded font-bold">
                        2x Win Resolved
                      </span>
                    )}
                    {pos.status === "RESOLVED_FLAT" && (
                      <span className="text-[10px] text-gray-300 bg-slate-800 px-2 py-0.5 rounded">
                        Flat Net
                      </span>
                    )}
                    {pos.status === "REDEEMED" && (
                      <span className="text-[10px] text-indigo-400 bg-indigo-950/40 border border-indigo-800/40 px-2 py-0.5 rounded flex items-center space-x-1">
                        <Check className="h-3 w-3" />
                        <span>Redeemed</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-3 text-[11px] text-gray-400 mt-1 font-mono">
                    <span>Leg A: {pos.legAOutcome}</span>
                    <span>•</span>
                    <span>Leg B: {pos.legBOutcome}</span>
                    <span>•</span>
                    <span>Collateral: {pos.collateralTotal} tUSDC</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-right">
                    <div className="text-[10px] text-gray-400">Net Return</div>
                    <div
                      className={`font-mono font-bold ${
                        pos.payout > pos.collateralTotal
                          ? "text-emerald-400"
                          : pos.payout === pos.collateralTotal
                          ? "text-gray-300"
                          : "text-red-400"
                      }`}
                    >
                      {pos.payout > 0 ? `${pos.payout} tUSDC` : "Evaluating..."}
                    </div>
                  </div>

                  {isRedeemable && (
                    <button
                      onClick={() => onRedeem(pos.id)}
                      disabled={isRedeeming}
                      className="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center space-x-1 transition-all active:scale-95"
                    >
                      <span>Claim Settlement</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
