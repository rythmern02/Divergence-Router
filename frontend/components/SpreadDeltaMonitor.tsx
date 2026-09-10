"use client";

import React from "react";
import { SplitStrategy } from "../lib/constants";
import { Gauge, ArrowUpRight, Info } from "lucide-react";
import { LiveSpreadChart } from "./LiveSpreadChart";

interface SpreadDeltaMonitorProps {
  strategy: SplitStrategy;
}

export const SpreadDeltaMonitor: React.FC<SpreadDeltaMonitorProps> = ({ strategy }) => {
  const delta = (strategy.legA.impliedProb - strategy.legB.impliedProb) * 100;
  const absDelta = Math.abs(delta);

  return (
    <div className="surface-panel rounded-2xl p-6 space-y-5 relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-zinc-300">
            <Gauge className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight">
              Probability &amp; Decorrelation Monitor
            </h3>
            <p className="text-[11px] font-mono text-zinc-400">
              Live probability disparity derived from DreamDEX orderbook depth
            </p>
          </div>
        </div>

        <div className="text-[11px] font-mono text-zinc-400 bg-white/[0.04] px-2.5 py-1 rounded border border-white/[0.08]">
          Spread &Delta;
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-black/30 p-3.5 rounded-xl border border-white/[0.05] text-center">
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
            Leg A Implied P(Up)
          </div>
          <div className="text-lg font-semibold font-mono text-zinc-100 mt-1 tabular-nums">
            {(strategy.legA.impliedProb * 100).toFixed(1)}%
          </div>
          <div className="text-[11px] font-mono text-zinc-400 mt-0.5">{strategy.legA.name}</div>
        </div>

        <div className="bg-black/30 p-3.5 rounded-xl border border-white/[0.05] text-center">
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
            Leg B Implied P(Down)
          </div>
          <div className="text-lg font-semibold font-mono text-zinc-100 mt-1 tabular-nums">
            {(strategy.legB.impliedProb * 100).toFixed(1)}%
          </div>
          <div className="text-[11px] font-mono text-zinc-400 mt-0.5">{strategy.legB.name}</div>
        </div>

        <div className="bg-black/30 p-3.5 rounded-xl border border-white/[0.08] text-center">
          <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
            Net Divergence (&Delta;)
          </div>
          <div className="text-lg font-semibold font-mono text-white mt-1 flex items-center justify-center gap-0.5 tabular-nums">
            <ArrowUpRight className="w-3.5 h-3.5 text-zinc-300" />
            <span>+{absDelta.toFixed(1)}%</span>
          </div>
          <div className="text-[11px] font-mono text-zinc-400 mt-0.5">
            Capture Premium
          </div>
        </div>
      </div>

      {/* Embedded Chart */}
      <LiveSpreadChart strategy={strategy} />

      {/* Visual Weight Bar */}
      <div className="pt-2 border-t border-white/[0.05]">
        <div className="flex justify-between text-[11px] text-zinc-400 mb-2 font-mono">
          <span className="text-zinc-300">
            Leg A Weight: {(strategy.legA.impliedProb * 100).toFixed(0)}%
          </span>
          <span className="text-white font-medium">
            Disparity: {absDelta.toFixed(1)}%
          </span>
          <span className="text-zinc-300">
            Leg B Weight: {(strategy.legB.impliedProb * 100).toFixed(0)}%
          </span>
        </div>

        <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden flex border border-white/[0.06]">
          <div
            className="bg-zinc-400 h-full transition-all duration-300"
            style={{ width: `${strategy.legA.impliedProb * 50}%` }}
          />
          <div
            className="bg-white h-full transition-all duration-300"
            style={{ width: `${absDelta}%` }}
          />
          <div
            className="bg-zinc-600 h-full transition-all duration-300 ml-auto"
            style={{ width: `${strategy.legB.impliedProb * 50}%` }}
          />
        </div>

        <div className="flex items-start space-x-2 text-[11px] font-mono text-zinc-400 mt-3 bg-white/[0.02] border border-white/[0.04] px-3 py-2 rounded-lg">
          <Info className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0 mt-0.5" />
          <span>
            On Somnia, spread mispricings between 15m and 1h windows resolve in milliseconds. Sub-second block finality captures this decorrelation premium before orderbooks normalize.
          </span>
        </div>
      </div>
    </div>
  );
};
