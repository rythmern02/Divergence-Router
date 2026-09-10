"use client";

import React, { useEffect, useState } from "react";
import { Activity, TrendingUp } from "lucide-react";
import { SplitStrategy } from "../lib/constants";

interface LiveSpreadChartProps {
  strategy: SplitStrategy;
}

export const LiveSpreadChart: React.FC<LiveSpreadChartProps> = ({ strategy }) => {
  const [mounted, setMounted] = useState(false);
  const [tickerDelta, setTickerDelta] = useState<number>(18.0);
  const [history, setHistory] = useState<number[]>([15.2, 16.0, 16.8, 16.2, 17.5, 17.1, 18.0]);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      const wobble = (Math.random() - 0.48) * 0.5;
      setTickerDelta((prev) => {
        const next = Math.max(12, Math.min(24, parseFloat((prev + wobble).toFixed(2))));
        setHistory((h) => [...h.slice(-14), next]);
        return next;
      });
    }, 900);

    return () => clearInterval(interval);
  }, [strategy]);

  const minVal = Math.min(...history) - 1.5;
  const maxVal = Math.max(...history) + 1.5;
  const range = maxVal - minVal || 1;
  const width = 360;
  const height = 80;

  const points = history
    .map((val, idx) => {
      const x = (idx / (history.length - 1)) * width;
      const y = height - ((val - minVal) / range) * (height - 16) - 8;
      return `${x},${y}`;
    })
    .join(" ");

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <div className="bg-black/25 border border-white/[0.06] rounded-xl p-4 relative overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Activity className="w-3.5 h-3.5 text-zinc-300" />
          <span className="text-xs font-mono font-medium text-zinc-300 uppercase tracking-wider">
            Decorrelation Spread &bull; 15m Cadence
          </span>
        </div>

        <div className="text-right">
          <div className="text-sm font-mono font-semibold text-white flex items-center justify-end gap-1 tabular-nums">
            <TrendingUp className="w-3.5 h-3.5 text-white" />
            <span>+{mounted ? tickerDelta.toFixed(2) : "18.00"}%</span>
          </div>
        </div>
      </div>

      {/* Clean Minimalist Line Graph */}
      <div className="w-full h-20 relative">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="spreadAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Fill */}
          <polygon points={areaPoints} fill="url(#spreadAreaGrad)" />

          {/* Stroke */}
          <polyline
            fill="none"
            stroke="#f1f5f9"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />

          {/* Current tick point */}
          {history.length > 0 && (
            <circle
              cx={width}
              cy={height - ((tickerDelta - minVal) / range) * (height - 16) - 8}
              r="3"
              fill="#ffffff"
            />
          )}
        </svg>

        {/* Subtle reference lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
          <div className="border-b border-zinc-400 w-full" />
          <div className="border-b border-zinc-400 w-full" />
          <div className="border-b border-zinc-400 w-full" />
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-2 border-t border-white/[0.04]">
        <span>Window Open</span>
        <span className="text-zinc-400 font-medium">Optimal Relative Value Zone</span>
        <span>Current Tick</span>
      </div>
    </div>
  );
};
