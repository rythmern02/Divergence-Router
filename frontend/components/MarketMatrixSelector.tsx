"use client";

import React from "react";
import { SplitStrategy, PRESET_STRATEGIES } from "../lib/constants";
import { ArrowRightLeft, CalendarClock, TrendingUp, TrendingDown } from "lucide-react";

interface MarketMatrixSelectorProps {
  selectedStrategy: SplitStrategy;
  onSelectStrategy: (strategy: SplitStrategy) => void;
}

export const MarketMatrixSelector: React.FC<MarketMatrixSelectorProps> = ({
  selectedStrategy,
  onSelectStrategy,
}) => {
  return (
    <div className="bg-[#121722] border border-cardBorder rounded-xl p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <span>Structured Strategy Matrix</span>
            <span className="text-[10px] font-mono bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/30">
              2D Event Contracts
            </span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Select a structured multi-leg combination across Asset or Cadence Window dimensions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PRESET_STRATEGIES.map((strat) => {
          const isSelected = strat.id === selectedStrategy.id;
          const isCrossAsset = strat.type === "CROSS_ASSET";

          return (
            <div
              key={strat.id}
              onClick={() => onSelectStrategy(strat)}
              className={`relative cursor-pointer rounded-lg border p-4 transition-all ${
                isSelected
                  ? "bg-indigo-950/30 border-indigo-500 ring-1 ring-indigo-500 shadow-lg shadow-indigo-950/40"
                  : "bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
              }`}
            >
              {/* Badge & Icon */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div
                    className={`p-1.5 rounded-md ${
                      isCrossAsset
                        ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}
                  >
                    {isCrossAsset ? (
                      <ArrowRightLeft className="h-4 w-4" />
                    ) : (
                      <CalendarClock className="h-4 w-4" />
                    )}
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    {isCrossAsset ? "Cross-Asset Axis" : "Calendar Window Axis"}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded">
                  {strat.decorrelationFactor}
                </span>
              </div>

              {/* Title & Description */}
              <h3 className="text-sm font-bold text-white mb-1">{strat.title}</h3>
              <p className="text-xs text-gray-400 mb-3">{strat.subtitle}</p>

              {/* Two Legs Breakdown */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800/80">
                <div className="bg-[#0b0e14] p-2 rounded border border-slate-800">
                  <div className="text-[10px] text-gray-400 flex items-center justify-between">
                    <span>LEG A ({strat.legA.cadence})</span>
                    <TrendingUp className="h-3 w-3 text-emerald-400" />
                  </div>
                  <div className="font-semibold text-white mt-0.5">{strat.legA.name}</div>
                  <div className="text-[11px] font-mono text-emerald-400">
                    P(Up): {(strat.legA.impliedProb * 100).toFixed(0)}%
                  </div>
                </div>

                <div className="bg-[#0b0e14] p-2 rounded border border-slate-800">
                  <div className="text-[10px] text-gray-400 flex items-center justify-between">
                    <span>LEG B ({strat.legB.cadence})</span>
                    <TrendingDown className="h-3 w-3 text-red-400" />
                  </div>
                  <div className="font-semibold text-white mt-0.5">{strat.legB.name}</div>
                  <div className="text-[11px] font-mono text-red-400">
                    P(Down): {(strat.legB.impliedProb * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
