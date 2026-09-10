"use client";

import React, { useState, useEffect } from "react";
import { Activity, ShieldCheck, ExternalLink, Wallet } from "lucide-react";
import { SOMNIA_CHAIN_ID, EXPLORER_URL } from "../lib/constants";

interface NavbarProps {
  userAddress: string | null;
  onConnect: () => void;
  collateralBalance: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  userAddress,
  onConnect,
  collateralBalance,
}) => {
  const [latency, setLatency] = useState(380);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate Somnia sub-second latency ping variations
      setLatency(Math.floor(340 + Math.random() * 90));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="border-b border-cardBorder bg-[#0b0f17]/90 backdrop-blur-md sticky top-0 z-40 px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-indigo-500/20">
            ⚡
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight text-white">
                Divergence<span className="text-indigo-400">Router</span>
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                DreamDEX Core
              </span>
            </div>
            <p className="text-[11px] text-gray-400">Atomic Multi-Leg Relative Value Engine</p>
          </div>
        </div>

        {/* Center Stats: Somnia Sub-Second Metric */}
        <div className="hidden md:flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="h-2 w-2 rounded-full bg-emerald-400 -ml-3.5" />
            <span className="font-mono font-medium">Somnia Testnet (50312)</span>
          </div>

          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-indigo-950/40 border border-indigo-800/40 text-indigo-300 font-mono">
            <Activity className="h-3.5 w-3.5 text-indigo-400" />
            <span>⚡ {latency}ms Reactivity</span>
          </div>
        </div>

        {/* Right: Wallet & Explorer */}
        <div className="flex items-center space-x-3">
          <a
            href={EXPLORER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center space-x-1 text-xs text-gray-400 hover:text-gray-200 transition-colors px-2.5 py-1.5 rounded border border-transparent hover:border-slate-800"
          >
            <span>Explorer</span>
            <ExternalLink className="h-3 w-3" />
          </a>

          {userAddress ? (
            <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5">
              <div className="text-right">
                <div className="text-[11px] text-gray-400">Balance</div>
                <div className="text-xs font-semibold text-emerald-400 font-mono">
                  {collateralBalance.toLocaleString()} tUSDC
                </div>
              </div>
              <div className="h-6 w-px bg-slate-800 mx-1" />
              <div className="text-xs font-mono text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded">
                {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
              </div>
            </div>
          ) : (
            <button
              onClick={onConnect}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all active:scale-95"
            >
              <Wallet className="h-3.5 w-3.5" />
              <span>Connect Wallet</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
