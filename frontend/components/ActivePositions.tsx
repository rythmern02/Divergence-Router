"use client";

import React from "react";
import { Clock, ArrowUpRight, Check, Coins, ExternalLink } from "lucide-react";
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
    <div className="surface-panel rounded-2xl p-6 space-y-4 relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
            <span>On-Chain Positions &amp; Settlement Claims</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Real-time Somnia Shannon position records and 1-click settlement netting.
          </p>
        </div>
        <span className="text-xs font-mono text-zinc-400 bg-white/[0.04] border border-white/[0.08] px-2.5 py-1 rounded">
          {positions.length} Total
        </span>
      </div>

      {positions.length === 0 ? (
        <div className="py-12 text-center border border-dashed border-white/[0.06] rounded-xl text-xs font-mono text-zinc-500">
          No active split positions. Open a structured split above to see it tracked here.
        </div>
      ) : (
        <div className="space-y-2.5">
          {positions.map((pos) => {
            const isRedeemable = pos.status === "RESOLVED_WIN" || pos.status === "RESOLVED_FLAT";

            return (
              <div
                key={pos.id}
                className="bg-black/25 border border-white/[0.05] hover:border-white/[0.1] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs transition-all"
              >
                <div>
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <span className="font-mono text-zinc-500 font-medium">
                      #{pos.id}
                    </span>
                    <span className="font-medium text-white">{pos.title}</span>

                    {pos.status === "ACTIVE" && (
                      <span className="flex items-center space-x-1 text-[10px] font-mono text-amber-300 bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded">
                        <Clock className="h-3 w-3" />
                        <span>Trading</span>
                      </span>
                    )}
                    {pos.status === "RESOLVED_WIN" && (
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded font-medium">
                        2x Win Resolved
                      </span>
                    )}
                    {pos.status === "RESOLVED_FLAT" && (
                      <span className="text-[10px] font-mono text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded">
                        Flat Payout (1x)
                      </span>
                    )}
                    {pos.status === "REDEEMED" && (
                      <span className="text-[10px] font-mono text-zinc-400 bg-white/[0.04] border border-white/[0.08] px-2 py-0.5 rounded flex items-center space-x-1">
                        <Check className="h-3 w-3 text-zinc-400" />
                        <span>Redeemed &bull; Payout Disbursed</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-3 text-[11px] text-zinc-400 mt-2 font-mono flex-wrap gap-y-1">
                    <span>Leg A: {pos.legAOutcome}</span>
                    <span className="text-zinc-600">&bull;</span>
                    <span>Leg B: {pos.legBOutcome}</span>
                    <span className="text-zinc-600">&bull;</span>
                    <span>Collateral: {pos.collateralTotal} tUSDC</span>
                    {pos.txHash && (
                      <>
                        <span className="text-zinc-600">&bull;</span>
                        <a
                          href={`${EXPLORER_URL}/tx/${pos.txHash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-zinc-400 hover:text-white underline flex items-center gap-0.5"
                        >
                          <span>Explorer Proof</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-right font-mono">
                    <div className="text-[10px] text-zinc-500 uppercase">Payout</div>
                    <div
                      className={`text-sm font-semibold tabular-nums ${
                        pos.payout > pos.collateralTotal
                          ? "text-emerald-400"
                          : pos.payout === pos.collateralTotal
                          ? "text-zinc-300"
                          : "text-zinc-400"
                      }`}
                    >
                      {pos.payout > 0 ? `+${pos.payout} tUSDC` : "Active"}
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
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-medium font-mono text-xs flex items-center space-x-1 transition active:scale-98 whitespace-nowrap"
                    >
                      <span>Claim</span>
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
