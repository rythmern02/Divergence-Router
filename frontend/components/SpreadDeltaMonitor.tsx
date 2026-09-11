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
    <div className="space-y-4 pt-2">
      {/* Frameless Section Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
        <div className="flex items-center space-x-3">
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
            02 // SPREAD MONITOR
          </span>
          <span className="text-zinc-700">&bull;</span>
          <h3 className="text-sm font-semibold text-white tracking-tight">
            Orderbook Decorrelation Dynamics
          </h3>
        </div>

        <div className="text-[10px] font-mono text-zinc-400 bg-white/[0.04] px-2.5 py-0.5 rounded border border-white/[0.08]">
          Real-Time Delta
        </div>
      </div>

      {/* Terminal Ticker Tape (Seamless Strip with Hairline Dividers, ZERO BOX CARDS) */}
      <div className="grid grid-cols-3 divide-x divide-white/[0.08] py-3.5 border-b border-white/[0.08]">
        <div className="px-3 first:pl-0">
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
            Leg A Implied P(Up)
          </div>
          <div className="text-xl font-semibold font-mono text-white mt-1 tabular-nums">
            {(strategy.legA.impliedProb * 100).toFixed(1)}%
          </div>
          <div className="text-[11px] font-mono text-zinc-400 mt-0.5">{strategy.legA.name}</div>
        </div>

        <div className="px-4">
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
            Leg B Implied P(Down)
          </div>
          <div className="text-xl font-semibold font-mono text-white mt-1 tabular-nums">
            {(strategy.legB.impliedProb * 100).toFixed(1)}%
          </div>
          <div className="text-[11px] font-mono text-zinc-400 mt-0.5">{strategy.legB.name}</div>
        </div>

        <div className="px-4 last:pr-0">
          <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
            Net Divergence (&Delta;)
          </div>
          <div className="text-xl font-semibold font-mono text-white mt-1 flex items-center gap-1 tabular-nums">
            <ArrowUpRight className="w-4 h-4 text-zinc-300" />
            <span>+{absDelta.toFixed(1)}%</span>
          </div>
          <div className="text-[11px] font-mono text-zinc-400 mt-0.5">
            Capture Premium
          </div>
        </div>
      </div>

      {/* Frameless Live Chart */}
      <LiveSpreadChart strategy={strategy} />

      {/* Visual Weight Bar */}
      <div className="pt-2">
        <div className="flex justify-between text-[11px] text-zinc-400 mb-2 font-mono">
          <span>
            Leg A: <strong className="text-zinc-200">{(strategy.legA.impliedProb * 100).toFixed(0)}%</strong>
          </span>
          <span className="text-white font-medium">
            Spread Disparity: +{absDelta.toFixed(1)}%
          </span>
          <span>
            Leg B: <strong className="text-zinc-200">{(strategy.legB.impliedProb * 100).toFixed(0)}%</strong>
          </span>
        </div>

        <div className="w-full bg-zinc-900 h-1.5 overflow-hidden flex">
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

        <div className="mt-3 text-[11px] font-mono text-zinc-400 border-l-2 border-zinc-700 pl-3 py-1">
          Somnia Shannon sub-second finality captures decorrelation anomalies before external arbitrage bots normalize orderbooks.
        </div>
      </div>
    </div>
  );
};
