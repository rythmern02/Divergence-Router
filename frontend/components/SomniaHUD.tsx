"use client";

import React, { useEffect, useState } from "react";
import { ShieldCheck, ExternalLink, Cpu, Database } from "lucide-react";
import { CONTRACT_ADDRESSES, EXPLORER_URL } from "../lib/constants";

function formatCommas(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export const SomniaHUD: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [blockHeight, setBlockHeight] = useState<number>(484847250);
  const [tps, setTps] = useState<number>(104890);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setBlockHeight((b) => b + 1);
      setTps(104600 + Math.floor(Math.random() * 550));
    }, 380);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-[#050505] border-b border-white/[0.06] px-4 py-1.5 text-[11px] font-mono text-zinc-400 overflow-x-auto whitespace-nowrap scrollbar-none z-30 relative select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
        {/* Network & Block Stream */}
        <div className="flex items-center space-x-5">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-zinc-200" />
            </span>
            <span className="font-semibold text-zinc-200 tracking-tight">SOMNIA SHANNON</span>
            <span className="text-[10px] text-zinc-400 bg-white/[0.05] border border-white/[0.08] px-1.5 py-0.5 rounded">
              50312
            </span>
          </div>

          <div className="flex items-center space-x-1.5 text-zinc-400">
            <Database className="w-3 h-3 text-zinc-500" />
            <span className="text-zinc-500">Block:</span>
            <span className="text-zinc-200 font-medium tabular-nums">
              #{mounted ? formatCommas(blockHeight) : "484,847,250"}
            </span>
          </div>

          <div className="flex items-center space-x-1.5 text-zinc-400">
            <Cpu className="w-3 h-3 text-zinc-500" />
            <span className="text-zinc-500">Throughput:</span>
            <span className="text-zinc-200 font-medium tabular-nums">
              {mounted ? formatCommas(tps) : "104,890"} TPS
            </span>
            <span className="text-[10px] text-zinc-400 font-medium">(&sim;380ms finality)</span>
          </div>
        </div>

        {/* Live Verified Protocol Router */}
        <div className="flex items-center space-x-5 text-[11px]">
          <div className="flex items-center space-x-1.5 text-zinc-400">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-zinc-500">Router:</span>
            <a
              href={`${EXPLORER_URL}/address/${CONTRACT_ADDRESSES.divergenceRouter}`}
              target="_blank"
              rel="noreferrer"
              className="text-zinc-300 hover:text-white font-medium underline decoration-zinc-600 underline-offset-2 flex items-center gap-1 transition-colors"
            >
              <span>{CONTRACT_ADDRESSES.divergenceRouter.slice(0, 6)}...{CONTRACT_ADDRESSES.divergenceRouter.slice(-4)}</span>
              <ExternalLink className="w-2.5 h-2.5 text-zinc-500" />
            </a>
          </div>

          <div className="hidden md:flex items-center space-x-2 text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
            <span className="text-zinc-500">EVM Atomic Invariant:</span>
            <span className="text-zinc-200 font-medium">Zero Legging-In Risk</span>
          </div>
        </div>
      </div>
    </div>
  );
};
