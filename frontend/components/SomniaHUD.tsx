"use client";

import React, { useEffect, useState } from "react";
import { Zap, ShieldCheck, ExternalLink, Cpu, Database } from "lucide-react";
import { CONTRACT_ADDRESSES, EXPLORER_URL } from "../lib/constants";

export const SomniaHUD: React.FC = () => {
  const [blockHeight, setBlockHeight] = useState<number>(484847250);
  const [tps, setTps] = useState<number>(104890);

  useEffect(() => {
    const interval = setInterval(() => {
      setBlockHeight((b) => b + 1);
      setTps(104500 + Math.floor(Math.random() * 850));
    }, 380); // ~380ms Somnia sub-second block cadence

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-[#050811]/90 border-b border-indigo-500/20 backdrop-blur-md px-4 py-1.5 text-[11px] font-mono text-gray-400 overflow-x-auto whitespace-nowrap scrollbar-none z-30 relative">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
        {/* Network & Block Stream */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5 text-indigo-400">
            <Zap className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400 animate-pulse" />
            <span className="font-bold text-gray-200">SOMNIA SHANNON</span>
            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/30">
              50312
            </span>
          </div>

          <div className="flex items-center space-x-1 text-gray-400">
            <Database className="w-3 h-3 text-cyan-400" />
            <span>Block:</span>
            <span className="text-white font-bold tracking-wider">
              #{blockHeight.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center space-x-1 text-emerald-400">
            <Cpu className="w-3 h-3 text-emerald-400" />
            <span>Throughput:</span>
            <span className="font-bold">{tps.toLocaleString()} TPS</span>
            <span className="text-[10px] text-emerald-500/70">(~380ms finality)</span>
          </div>
        </div>

        {/* Live Verified Protocol Router */}
        <div className="flex items-center space-x-4 text-[11px]">
          <div className="flex items-center space-x-1 text-gray-400">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Router:</span>
            <a
              href={`${EXPLORER_URL}/address/${CONTRACT_ADDRESSES.divergenceRouter}`}
              target="_blank"
              rel="noreferrer"
              className="text-cyan-400 hover:text-cyan-300 font-bold underline flex items-center gap-0.5"
            >
              <span>{CONTRACT_ADDRESSES.divergenceRouter.slice(0, 6)}...{CONTRACT_ADDRESSES.divergenceRouter.slice(-4)}</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>

          <div className="hidden md:flex items-center space-x-2 text-indigo-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-gray-300">EVM Atomic Invariant:</span>
            <span className="text-emerald-400 font-semibold">Leg B Slippage Reverts Leg A</span>
          </div>
        </div>
      </div>
    </div>
  );
};
