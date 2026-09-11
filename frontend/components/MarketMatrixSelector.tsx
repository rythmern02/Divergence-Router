"use client";

import React from "react";
import { SplitStrategy, PRESET_STRATEGIES } from "../lib/constants";
import { ArrowRightLeft, CalendarClock, TrendingUp, TrendingDown, Check } from "lucide-react";
import { sound } from "../lib/soundFx";

interface MarketMatrixSelectorProps {
  selectedStrategy: SplitStrategy;
  onSelectStrategy: (strategy: SplitStrategy) => void;
  strategies?: SplitStrategy[];
}

export const MarketMatrixSelector: React.FC<MarketMatrixSelectorProps> = ({
  selectedStrategy,
  onSelectStrategy,
  strategies,
}) => {
  const strategyList = strategies && strategies.length > 0 ? strategies : PRESET_STRATEGIES;

  return (
    <div className="space-y-4">
      {/* Frameless Section Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
        <div className="flex items-center space-x-3">
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
            01 // STRATEGY MATRIX
          </span>
          <span className="text-zinc-700">&bull;</span>
          <h2 className="text-sm font-semibold text-white tracking-tight">
            2D Relative-Value Architecture
          </h2>
        </div>
        <div className="text-[10px] font-mono text-zinc-400 bg-white/[0.04] border border-white/[0.08] px-2.5 py-0.5 rounded">
          Dual-Leg Atomic Routing
        </div>
      </div>

      {/* Strategies Grid - Frameless with Left Titanium Accent */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {strategyList.map((strat) => {
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
              className={`strategy-row cursor-pointer p-5 rounded-r-lg transition-all duration-200 ${
                isSelected ? "strategy-row-active" : "strategy-row-idle"
              }`}
            >
              {/* Header row inside strategy */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2 text-xs font-mono text-zinc-400">
                  {isCrossAsset ? (
                    <ArrowRightLeft className="h-3.5 w-3.5 text-zinc-300" />
                  ) : (
                    <CalendarClock className="h-3.5 w-3.5 text-zinc-300" />
                  )}
                  <span className="uppercase tracking-wider font-medium text-zinc-300">
                    {isCrossAsset ? "Cross-Asset Spread" : "Calendar Term Structure"}
                  </span>
                </div>

                {isSelected ? (
                  <span className="inline-flex items-center space-x-1 text-[10px] font-mono text-white bg-white/10 px-2 py-0.5 rounded">
                    <Check className="w-3 h-3 text-white" />
                    <span>ACTIVE</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-zinc-500">SELECT</span>
                )}
              </div>

              {/* Title & Description */}
              <h3 className="text-base font-medium text-white mb-1 tracking-tight">
                {strat.title}
              </h3>
              <p className="text-xs text-zinc-400 mb-4 leading-relaxed font-sans">
                {strat.subtitle}
              </p>

              {/* Two Legs Display - Clean Tabular Hairline Grid (ZERO BOX CARDS) */}
              <div className="grid grid-cols-2 pt-3 border-t border-white/[0.06] divide-x divide-white/[0.06]">
                <div className="pr-3">
                  <div className="text-[10px] font-mono text-zinc-500 flex items-center justify-between">
                    <span>LEG A &bull; {strat.legA.cadence}</span>
                    <TrendingUp className="h-3 w-3 text-zinc-400" />
                  </div>
                  <div className="font-mono font-medium text-zinc-200 mt-1 text-xs">
                    {strat.legA.name}
                  </div>
                  <div className="text-[11px] font-mono text-zinc-400 mt-0.5 tabular-nums">
                    P(Up): <span className="text-white font-medium">{(strat.legA.impliedProb * 100).toFixed(0)}%</span>
                  </div>
                </div>

                <div className="pl-3">
                  <div className="text-[10px] font-mono text-zinc-500 flex items-center justify-between">
                    <span>LEG B &bull; {strat.legB.cadence}</span>
                    <TrendingDown className="h-3 w-3 text-zinc-400" />
                  </div>
                  <div className="font-mono font-medium text-zinc-200 mt-1 text-xs">
                    {strat.legB.name}
                  </div>
                  <div className="text-[11px] font-mono text-zinc-400 mt-0.5 tabular-nums">
                    P(Down): <span className="text-white font-medium">{(strat.legB.impliedProb * 100).toFixed(0)}%</span>
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
