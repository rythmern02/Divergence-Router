"use client";

import React from "react";
import { SplitStrategy, PRESET_STRATEGIES } from "../lib/constants";
import { ArrowRightLeft, CalendarClock, TrendingUp, TrendingDown, Check } from "lucide-react";
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
    <div className="surface-panel rounded-2xl p-6 relative overflow-hidden">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold text-white tracking-tight flex items-center space-x-2">
            <span>Structured Strategy Matrix</span>
            <span className="text-[10px] font-mono text-zinc-400 bg-white/[0.05] border border-white/[0.08] px-2 py-0.5 rounded">
              2D Orderbook Routing
            </span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Simultaneously trade the spread across Asset (BTC/ETH) and Cadence Window (15m/1h) dimensions.
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
              className={`relative cursor-pointer rounded-xl p-4.5 transition-all duration-200 ${
                isSelected
                  ? "surface-panel-active"
                  : "surface-panel-interactive"
              }`}
            >
              {/* Selected badge */}
              {isSelected && (
                <div className="absolute top-4 right-4 flex items-center gap-1 text-[11px] font-mono text-zinc-200">
                  <div className="w-4 h-4 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                </div>
              )}

              {/* Category & Tag */}
              <div className="flex items-center space-x-2.5 mb-3">
                <div className="p-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-zinc-300">
                  {isCrossAsset ? (
                    <ArrowRightLeft className="h-3.5 w-3.5" />
                  ) : (
                    <CalendarClock className="h-3.5 w-3.5" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-mono font-medium uppercase tracking-wider text-zinc-300">
                    {isCrossAsset ? "Cross-Asset Spread" : "Calendar Term Structure"}
                  </div>
                  <div className="text-[11px] font-mono text-zinc-300 font-medium">
                    {strat.decorrelationFactor}
                  </div>
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="text-sm font-semibold text-white mb-1 tracking-tight">{strat.title}</h3>
              <p className="text-xs text-zinc-400 mb-4 leading-relaxed">{strat.subtitle}</p>

              {/* Two Legs Breakdown */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-white/[0.06]">
                <div className="bg-black/30 p-2.5 rounded-lg border border-white/[0.04]">
                  <div className="text-[10px] font-mono text-zinc-500 flex items-center justify-between">
                    <span>LEG A ({strat.legA.cadence})</span>
                    <TrendingUp className="h-3 w-3 text-zinc-300" />
                  </div>
                  <div className="font-medium text-zinc-200 mt-1 text-xs">{strat.legA.name}</div>
                  <div className="text-[11px] font-mono text-zinc-300 mt-0.5 tabular-nums">
                    P(Up): {(strat.legA.impliedProb * 100).toFixed(0)}%
                  </div>
                </div>

                <div className="bg-black/30 p-2.5 rounded-lg border border-white/[0.04]">
                  <div className="text-[10px] font-mono text-zinc-500 flex items-center justify-between">
                    <span>LEG B ({strat.legB.cadence})</span>
                    <TrendingDown className="h-3 w-3 text-zinc-400" />
                  </div>
                  <div className="font-medium text-zinc-200 mt-1 text-xs">{strat.legB.name}</div>
                  <div className="text-[11px] font-mono text-zinc-400 mt-0.5 tabular-nums">
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
