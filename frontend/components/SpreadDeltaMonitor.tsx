"use client";

import React from "react";
import { SplitStrategy } from "../lib/constants";
import { Gauge, Sparkles } from "lucide-react";

interface SpreadDeltaMonitorProps {
  strategy: SplitStrategy;
}

export const SpreadDeltaMonitor: React.FC<SpreadDeltaMonitorProps> = ({ strategy }) => {
  const delta = (strategy.legA.impliedProb - strategy.legB.impliedProb) * 100;
  const absDelta = Math.abs(delta);

  return (
    <div className="bg-[#121722] border border-cardBorder rounded-xl p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Gauge className="h-4 w-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-white">Live Probability Delta Monitor</h3>
        </div>
        <div className="flex items-center space-x-1 text-[11px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
          <Sparkles className="h-3 w-3" />
          <span>Real-time CLOB Spread</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 text-center">
          <div className="text-[10px] text-gray-400 uppercase">Leg A Implied</div>
          <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
            {(strategy.legA.impliedProb * 100).toFixed(1)}%
          </div>
          <div className="text-[10px] text-gray-500">{strategy.legA.name}</div>
        </div>

        <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 text-center">
          <div className="text-[10px] text-gray-400 uppercase">Leg B Implied</div>
          <div className="text-lg font-bold font-mono text-indigo-400 mt-0.5">
            {(strategy.legB.impliedProb * 100).toFixed(1)}%
          </div>
          <div className="text-[10px] text-gray-500">{strategy.legB.name}</div>
        </div>

        <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 text-center">
          <div className="text-[10px] text-gray-400 uppercase">Net Spread Delta (Δ)</div>
          <div
            className={`text-lg font-bold font-mono mt-0.5 ${
              delta >= 0 ? "text-amber-400" : "text-purple-400"
            }`}
          >
            {delta >= 0 ? "+" : ""}
            {delta.toFixed(1)}%
          </div>
          <div className="text-[10px] text-gray-500">Divergence Disparity</div>
        </div>
      </div>

      {/* Visual Spread Bar */}
      <div>
        <div className="flex justify-between text-[11px] text-gray-400 mb-1.5 font-mono">
          <span>Leg A Weight: {(strategy.legA.impliedProb * 100).toFixed(0)}%</span>
          <span>Divergence Spread: {absDelta.toFixed(1)}%</span>
          <span>Leg B Weight: {(strategy.legB.impliedProb * 100).toFixed(0)}%</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden flex">
          <div
            className="bg-emerald-500 h-2.5 transition-all duration-500"
            style={{ width: `${strategy.legA.impliedProb * 50}%` }}
          />
          <div
            className="bg-amber-400 h-2.5 transition-all duration-500 animate-pulse"
            style={{ width: `${absDelta}%` }}
          />
          <div
            className="bg-indigo-500 h-2.5 transition-all duration-500 ml-auto"
            style={{ width: `${strategy.legB.impliedProb * 50}%` }}
          />
        </div>
        <p className="text-[11px] text-gray-400 mt-2.5 italic">
          💡 On Somnia, spread mispricings between 15m and 1h windows resolve in seconds. Sub-second execution captures this arbitrage before orderbooks normalize.
        </p>
      </div>
    </div>
  );
};
