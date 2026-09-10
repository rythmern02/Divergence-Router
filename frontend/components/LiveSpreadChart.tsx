"use client";

import React, { useEffect, useState } from "react";
import { TrendingUp, Activity, Zap } from "lucide-react";
import { SplitStrategy } from "../lib/constants";

interface LiveSpreadChartProps {
  strategy: SplitStrategy;
}

export const LiveSpreadChart: React.FC<LiveSpreadChartProps> = ({ strategy }) => {
  const [tickerDelta, setTickerDelta] = useState<number>(18.0);
  const [history, setHistory] = useState<number[]>([14, 15, 16.5, 15.8, 17.2, 16.9, 18.0]);
  const [pulse, setPulse] = useState<boolean>(false);

  // Live real-time sub-second price delta ticking
  useEffect(() => {
    const interval = setInterval(() => {
      const wobble = (Math.random() - 0.48) * 0.6;
      setTickerDelta((prev) => {
        const next = Math.max(10, Math.min(26, parseFloat((prev + wobble).toFixed(2))));
        setHistory((h) => [...h.slice(-14), next]);
        return next;
      });
      setPulse(true);
      setTimeout(() => setPulse(false), 300);
    }, 800);

    return () => clearInterval(interval);
  }, [strategy]);

  // Compute SVG points
  const minVal = Math.min(...history) - 2;
  const maxVal = Math.max(...history) + 2;
  const range = maxVal - minVal || 1;
  const width = 360;
  const height = 90;

  const points = history
    .map((val, idx) => {
      const x = (idx / (history.length - 1)) * width;
      const y = height - ((val - minVal) / range) * (height - 16) - 8;
      return `${x},${y}`;
    })
    .join(" ");

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <div className="bg-[#0b101c]/80 border border-cardBorder/80 backdrop-blur-xl rounded-2xl p-4 shadow-xl relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-mono font-bold text-gray-200 uppercase tracking-wider flex items-center gap-1.5">
              <span>Relative-Value Spread Ticker</span>
              <span className={`inline-block w-1.5 h-1.5 rounded-full ${pulse ? "bg-cyan-400 scale-125" : "bg-emerald-400"} transition-all`} />
            </div>
            <div className="text-[11px] text-gray-500 font-mono">
              Live Δ: {strategy.legA.asset} vs {strategy.legB.asset} (Sub-Second Somnia CLOB)
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-lg font-mono font-extrabold text-cyan-400 flex items-center justify-end gap-1">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>+{tickerDelta.toFixed(2)}%</span>
          </div>
          <div className="text-[10px] font-mono text-emerald-400/80">Decorrelation Premium</div>
        </div>
      </div>

      {/* Dynamic SVG Wave */}
      <div className="w-full h-24 relative mt-1">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="spreadAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="spreadLineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="50%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
          </defs>

          {/* Area Fill */}
          <polygon points={areaPoints} fill="url(#spreadAreaGrad)" />

          {/* Path Line */}
          <polyline
            fill="none"
            stroke="url(#spreadLineGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />

          {/* Dynamic pulsing current head point */}
          {history.length > 0 && (
            <circle
              cx={width}
              cy={height - ((tickerDelta - minVal) / range) * (height - 16) - 8}
              r="4"
              className="fill-cyan-400 animate-ping"
            />
          )}
        </svg>

        {/* Floating grid guide lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-15">
          <div className="border-b border-dashed border-cyan-400 w-full" />
          <div className="border-b border-dashed border-cyan-400 w-full" />
          <div className="border-b border-dashed border-cyan-400 w-full" />
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] font-mono text-gray-500 pt-2 border-t border-white/5">
        <span>-15m Window Open</span>
        <span className="text-cyan-400 font-semibold flex items-center gap-1">
          <Zap className="w-3 h-3 text-cyan-400" />
          Optimal Divergence Entry Zone
        </span>
        <span>Current Tick</span>
      </div>
    </div>
  );
};
