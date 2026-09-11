"use client";

import React from "react";
import { Clock, ArrowUpRight, Check, Coins, ExternalLink } from "lucide-react";
import { EXPLORER_URL, PositionRecord } from "../lib/constants";
import { sound } from "../lib/soundFx";

export type { PositionRecord };

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
    <div className="pt-6 border-t border-white/[0.08] space-y-4">
      {/* Frameless Section Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
        <div className="flex items-center space-x-3">
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
            05 // SETTLEMENT LEDGER
          </span>
          <span className="text-zinc-700">&bull;</span>
          <h3 className="text-sm font-semibold text-white tracking-tight">
            Atomic Netting Blotter
          </h3>
        </div>
        <span className="text-[10px] font-mono text-zinc-400 bg-white/[0.04] border border-white/[0.08] px-2.5 py-0.5 rounded">
          {positions.length} Recorded
        </span>
      </div>

      {positions.length === 0 ? (
        <div className="py-12 text-center text-xs font-mono text-zinc-600 border-b border-white/[0.06]">
          No active positions on ledger. Open a structured split above to execute on Somnia testnet.
        </div>
      ) : (
        <div className="divide-y divide-white/[0.06]">
          {positions.map((pos) => {
            const isRedeemable = pos.status === "RESOLVED_WIN" || pos.status === "RESOLVED_FLAT";

            return (
              <div
                key={pos.id}
                className="py-4.5 px-2 hover:bg-white/[0.02] transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
                    <span className="font-mono text-zinc-500 font-medium">
                      #{pos.id.toString().padStart(2, "0")}
                    </span>
                    <span className="font-medium text-white">{pos.title}</span>

                    {pos.status === "ACTIVE" && (
                      <span className="flex items-center space-x-1 text-[10px] font-mono text-amber-300 bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded">
                        <Clock className="h-3 w-3" />
                        <span>Trading</span>
                      </span>
                    )}
                    {pos.status === "RESOLVED_WIN" && (
                      <span className="text-[10px] font-mono text-white bg-white/10 px-2 py-0.5 rounded font-medium">
                        2x Win Resolved
                      </span>
                    )}
                    {pos.status === "RESOLVED_FLAT" && (
                      <span className="text-[10px] font-mono text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded">
                        Flat Payout (1x)
                      </span>
                    )}
                    {pos.status === "REDEEMED" && (
                      <span className="text-[10px] font-mono text-zinc-400 bg-white/[0.04] px-2 py-0.5 rounded flex items-center space-x-1">
                        <Check className="h-3 w-3 text-zinc-400" />
                        <span>Settled &bull; Collateral Disbursed</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-3 text-[11px] text-zinc-400 font-mono flex-wrap gap-y-1">
                    <span>Leg A: {pos.legAOutcome}</span>
                    <span className="text-zinc-700">&bull;</span>
                    <span>Leg B: {pos.legBOutcome}</span>
                    <span className="text-zinc-700">&bull;</span>
                    <span>Collateral: {pos.collateralTotal} tUSDC</span>
                    {pos.txHash && (
                      <>
                        <span className="text-zinc-700">&bull;</span>
                        <a
                          href={`${EXPLORER_URL}/tx/${pos.txHash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-zinc-400 hover:text-white underline flex items-center gap-1"
                        >
                          <span>Somnia Shannon Proof</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-6 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-right font-mono">
                    <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Settlement Payout</div>
                    <div
                      className={`text-sm font-semibold tabular-nums ${
                        pos.payout > pos.collateralTotal
                          ? "text-white"
                          : pos.payout === pos.collateralTotal
                          ? "text-zinc-300"
                          : "text-zinc-400"
                      }`}
                    >
                      {pos.payout > 0 ? `+${pos.payout} tUSDC` : "In Progress"}
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
                      className="px-4 py-1.5 rounded bg-white hover:bg-zinc-200 text-black font-semibold font-mono text-xs flex items-center space-x-1 transition active:scale-98 whitespace-nowrap shadow-sm"
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
