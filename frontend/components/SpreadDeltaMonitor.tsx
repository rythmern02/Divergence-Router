"use client";

import React from "react";
import { SplitStrategy } from "../lib/constants";
import { Gauge, Sparkles, Zap, ArrowUpRight } from "lucide-react";
import { LiveSpreadChart } from "./LiveSpreadChart";

interface SpreadDeltaMonitorProps {
  strategy: SplitStrategy;
}

export const SpreadDeltaMonitor: React.FC<SpreadDeltaMonitorProps> = ({ strategy }) => {
  const delta = (strategy.legA.impliedProb - strategy.legB.impliedProb) * 100;
  const absDelta = Math.abs(delta);

  return (
    <div className="glass-panel rounded-2xl p-6 shadow-2xl space-y-5 relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Gauge className="h-4 w-4 animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white tracking-tight">
              Live Probability & Decorrelation Monitor
            </h3>
            <p className="text-[11px] font-mono text-gray-400">
              Sub-second pricing on DreamDEX CLOB orderbooks
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 text-[11px] font-mono text-cyan-300 bg-cyan-950/40 px-3 py-1 rounded-full border border-cyan-500/30 shadow-sm">
          <Sparkles className="h-3 w-3 text-cyan-400" />
          <span>Real-Time Divergence Δ</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#080d1a]/80 p-3.5 rounded-xl border border-white/5 text-center">
          <div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
            Leg A Implied P(Up)
          </div>
          <div className="text-xl font-extrabold font-mono text-emerald-400 mt-1">
            {(strategy.legA.impliedProb * 100).toFixed(1)}%
          </div>
          <div className="text-[11px] font-mono text-gray-500 mt-0.5">{strategy.legA.name}</div>
        </div>

        <div className="bg-[#080d1a]/80 p-3.5 rounded-xl border border-white/5 text-center">
          <div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
            Leg B Implied P(Down)
          </div>
          <div className="text-xl font-extrabold font-mono text-indigo-400 mt-1">
            {(strategy.legB.impliedProb * 100).toFixed(1)}%
          </div>
          <div className="text-[11px] font-mono text-gray-500 mt-0.5">{strategy.legB.name}</div>
        </div>

        <div className="bg-[#080d1a]/80 p-3.5 rounded-xl border border-cyan-500/20 text-center relative overflow-hidden">
          <div className="text-[10px] font-mono text-cyan-300 uppercase tracking-wider">
            Decorrelation Spread (Δ)
          </div>
          <div className="text-xl font-extrabold font-mono text-cyan-400 mt-1 flex items-center justify-center gap-0.5">
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            <span>+{absDelta.toFixed(1)}%</span>
          </div>
          <div className="text-[11px] font-mono text-emerald-400 mt-0.5 font-semibold">
            Alpha Capture Zone
          </div>
        </div>
      </div>

      {/* Embedded Live Chart */}
      <LiveSpreadChart strategy={strategy} />

      {/* Visual Spread Bar */}
      <div className="pt-2 border-t border-white/5">
        <div className="flex justify-between text-[11px] text-gray-400 mb-2 font-mono">
          <span className="text-emerald-400 font-semibold">
            Leg A Weight: {(strategy.legA.impliedProb * 100).toFixed(0)}%
          </span>
          <span className="text-cyan-300 font-bold">
            Disparity Spread: {absDelta.toFixed(1)}%
          </span>
          <span className="text-indigo-400 font-semibold">
            Leg B Weight: {(strategy.legB.impliedProb * 100).toFixed(0)}%
          </span>
        </div>

        <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden flex p-0.5 border border-white/10">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-l-full transition-all duration-500"
            style={{ width: `${strategy.legA.impliedProb * 50}%` }}
          />
          <div
            className="bg-gradient-to-r from-cyan-400 to-indigo-500 h-full transition-all duration-500 animate-pulse shadow-[0_0_12px_rgba(6,182,212,0.8)]"
            style={{ width: `${absDelta}%` }}
          />
          <div
            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-r-full transition-all duration-500 ml-auto"
            style={{ width: `${strategy.legB.impliedProb * 50}%` }}
          />
        </div>

        <div className="flex items-center space-x-2 text-[11px] font-mono text-gray-400 mt-3 bg-white/5 px-3 py-2 rounded-xl">
          <Zap className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
          <span>
            On Somnia, spread mispricings between 15m and 1h windows resolve in milliseconds. Sub-second execution captures this decorrelation premium before orderbooks normalize.
          </span>
        </div>
      </div>
    </div>
  );
};
