"use client";

import React from "react";
import { SplitStrategy, PRESET_STRATEGIES } from "../lib/constants";
import { ArrowRightLeft, CalendarClock, TrendingUp, TrendingDown, Sparkles, CheckCircle2 } from "lucide-react";
import { sound } from "../lib/soundFx";

interface MarketMatrixSelectorProps {
  selectedStrategy: SplitStrategy;
  onSelectStrategy: (strategy: SplitStrategy) => void;
}

export const MarketMatrixSelector: React.FC<MarketMatrixSelectorProps> = ({
  selectedStrategy,
  onSelectStrategy,
}) => {
  return (
    <div className="glass-panel rounded-2xl p-6 shadow-2xl relative overflow-hidden">
      {/* Subtle glowing ambient gradient */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-extrabold text-white flex items-center space-x-2">
            <span>Structured Strategy Matrix</span>
            <span className="text-[10px] font-mono bg-cyan-500/10 text-cyan-300 px-2.5 py-0.5 rounded-full border border-cyan-500/30 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              2D Multi-Leg Core
            </span>
          </h2>
          <p className="text-xs text-gray-400 mt-1 font-mono">
            Bridge DreamDEX Event Contracts across <span className="text-cyan-400">Asset</span> (BTC/ETH) and <span className="text-indigo-400">Cadence</span> (15m/1h) axes.
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
              onClick={() => {
                sound.playClick();
                onSelectStrategy(strat);
              }}
              onMouseEnter={() => sound.playHover()}
              className={`relative cursor-pointer rounded-2xl p-4.5 transition-all duration-300 ${
                isSelected
                  ? "glass-panel-glow neon-border-pulse shadow-xl shadow-indigo-950/60 scale-[1.01]"
                  : "bg-[#0b101c]/60 border border-white/5 hover:border-white/20 hover:bg-[#0e1526]/80"
              }`}
            >
              {/* Selected indicator corner */}
              {isSelected && (
                <div className="absolute top-3 right-3 text-cyan-400 flex items-center gap-1 text-[11px] font-mono font-bold">
                  <CheckCircle2 className="w-4 h-4 fill-cyan-400/20" />
                </div>
              )}

              {/* Badge & Icon */}
              <div className="flex items-center space-x-2 mb-2.5">
                <div
                  className={`p-2 rounded-xl ${
                    isCrossAsset
                      ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                      : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/30"
                  }`}
                >
                  {isCrossAsset ? (
                    <ArrowRightLeft className="h-4 w-4" />
                  ) : (
                    <CalendarClock className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-gray-200">
                    {isCrossAsset ? "Cross-Asset Axis" : "Calendar Term Axis"}
                  </span>
                  <div className="text-[10px] font-mono text-emerald-400">
                    {strat.decorrelationFactor}
                  </div>
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="text-sm font-bold text-white mb-1 tracking-tight">{strat.title}</h3>
              <p className="text-xs text-gray-400 mb-3.5 leading-relaxed">{strat.subtitle}</p>

              {/* Two Legs Breakdown */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-2.5 border-t border-white/10">
                <div className="bg-[#070a12]/80 p-2.5 rounded-xl border border-white/5">
                  <div className="text-[10px] font-mono text-gray-400 flex items-center justify-between">
                    <span>LEG A ({strat.legA.cadence})</span>
                    <TrendingUp className="h-3 w-3 text-emerald-400" />
                  </div>
                  <div className="font-bold text-white mt-1">{strat.legA.name}</div>
                  <div className="text-[11px] font-mono text-emerald-400 mt-0.5">
                    P(Up): {(strat.legA.impliedProb * 100).toFixed(0)}%
                  </div>
                </div>

                <div className="bg-[#070a12]/80 p-2.5 rounded-xl border border-white/5">
                  <div className="text-[10px] font-mono text-gray-400 flex items-center justify-between">
                    <span>LEG B ({strat.legB.cadence})</span>
                    <TrendingDown className="h-3 w-3 text-rose-400" />
                  </div>
                  <div className="font-bold text-white mt-1">{strat.legB.name}</div>
                  <div className="text-[11px] font-mono text-rose-400 mt-0.5">
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
