"use client";

import React from "react";
import { CheckCircle, Clock, ArrowUpRight, Check, Coins, ExternalLink, Sparkles } from "lucide-react";
import { EXPLORER_URL } from "../lib/constants";
import { sound } from "../lib/soundFx";

export interface PositionRecord {
  id: number;
  title: string;
  legAOutcome: string;
  legBOutcome: string;
  collateralTotal: number;
  status: "ACTIVE" | "RESOLVED_WIN" | "RESOLVED_FLAT" | "REDEEMED";
  payout: number;
  createdAt: string;
  txHash?: string;
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
    <div className="glass-panel rounded-2xl p-6 shadow-2xl space-y-4 relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-extrabold text-white flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Coins className="h-4 w-4" />
            </div>
            <span>On-Chain Splits & Settlement Claims</span>
          </h3>
          <p className="text-xs font-mono text-gray-400 mt-0.5">
            Real-time Somnia Shannon position tracking and 1-click settlement netting.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 px-2.5 py-1 rounded-full">
            Active Records: {positions.length}
          </span>
        </div>
      </div>

      {positions.length === 0 ? (
        <div className="py-12 text-center border border-dashed border-white/10 rounded-2xl text-xs font-mono text-gray-500">
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
                className="bg-[#080d1a]/80 border border-white/10 hover:border-white/20 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs transition-all duration-200"
              >
                <div>
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <span className="font-mono text-cyan-400 font-bold bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/30">
                      POS #{pos.id}
                    </span>
                    <span className="font-bold text-white tracking-tight">{pos.title}</span>

                    {pos.status === "ACTIVE" && (
                      <span className="flex items-center space-x-1 text-[10px] font-mono text-amber-300 bg-amber-950/50 border border-amber-500/40 px-2.5 py-0.5 rounded-full">
                        <Clock className="h-3 w-3 animate-spin-slow" />
                        <span>Trading Live</span>
                      </span>
                    )}
                    {pos.status === "RESOLVED_WIN" && (
                      <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/50 border border-emerald-500/40 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 shadow-sm">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>2x Divergence Win</span>
                      </span>
                    )}
                    {pos.status === "RESOLVED_FLAT" && (
                      <span className="text-[10px] font-mono text-gray-300 bg-slate-800 px-2.5 py-0.5 rounded-full">
                        Flat Payout (1x)
                      </span>
                    )}
                    {pos.status === "REDEEMED" && (
                      <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/50 border border-cyan-500/40 px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                        <Check className="h-3 w-3 text-cyan-400" />
                        <span>Redeemed & Paid</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-3 text-[11px] text-gray-400 mt-2 font-mono flex-wrap gap-y-1">
                    <span>Leg A: {pos.legAOutcome}</span>
                    <span className="text-gray-600">•</span>
                    <span>Leg B: {pos.legBOutcome}</span>
                    <span className="text-gray-600">•</span>
                    <span>Collateral: {pos.collateralTotal} tUSDC</span>
                    {pos.txHash && (
                      <>
                        <span className="text-gray-600">•</span>
                        <a
                          href={`${EXPLORER_URL}/tx/${pos.txHash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-cyan-400 hover:text-cyan-300 underline flex items-center gap-0.5"
                        >
                          <span>Explorer Tx</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-right">
                    <div className="text-[10px] font-mono uppercase text-gray-400">Net Return</div>
                    <div
                      className={`font-mono text-sm font-extrabold ${
                        pos.payout > pos.collateralTotal
                          ? "text-emerald-400"
                          : pos.payout === pos.collateralTotal
                          ? "text-gray-300"
                          : "text-rose-400"
                      }`}
                    >
                      {pos.payout > 0 ? `+${pos.payout} tUSDC` : "Active On-Chain"}
                    </div>
                  </div>

                  {isRedeemable && (
                    <button
                      onClick={() => {
                        sound.playRedeem();
                        onRedeem(pos.id);
                      }}
                      onMouseEnter={() => sound.playHover()}
                      disabled={isRedeeming}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold font-mono text-xs shadow-lg shadow-emerald-600/30 flex items-center space-x-1.5 transition-all duration-200 active:scale-95 whitespace-nowrap"
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
