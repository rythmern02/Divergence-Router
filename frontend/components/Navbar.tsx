"use client";

import React, { useState, useEffect } from "react";
import { Activity, ShieldCheck, ExternalLink, Wallet, Volume2, VolumeX, Flame } from "lucide-react";
import { SOMNIA_CHAIN_ID, EXPLORER_URL, CONTRACT_ADDRESSES } from "../lib/constants";
import { sound } from "../lib/soundFx";

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
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(Math.floor(340 + Math.random() * 85));
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const toggleSound = () => {
    sound.enabled = !sound.enabled;
    setIsMuted(!sound.enabled);
    if (sound.enabled) {
      sound.playClick();
    }
  };

  return (
    <header className="border-b border-indigo-500/15 bg-[#070b14]/80 backdrop-blur-2xl sticky top-0 z-40 px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3.5">
          <div className="relative group cursor-pointer">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-indigo-600 rounded-xl blur-sm opacity-70 group-hover:opacity-100 transition duration-500" />
            <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-[#0c1222] to-[#161f38] border border-white/20 flex items-center justify-center font-bold text-xl text-cyan-300 shadow-xl">
              ⚡
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-tight text-white flex items-center">
                DIVERGENCE<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">ROUTER</span>
              </span>
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                Somnia × DreamDEX
              </span>
            </div>
            <p className="text-[11px] font-mono text-gray-400 flex items-center gap-1.5">
              <span>Institutional Relative-Value Engine</span>
              <span className="text-cyan-500">•</span>
              <span className="text-emerald-400">EVM Atomic</span>
            </p>
          </div>
        </div>

        {/* Center Stats: Somnia Sub-Second Metric */}
        <div className="hidden lg:flex items-center space-x-3 text-xs font-mono">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#0e1424]/90 border border-indigo-500/20 text-gray-300 shadow-inner">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="h-2 w-2 rounded-full bg-emerald-400 -ml-4" />
            <span className="text-gray-200 font-semibold">Somnia Shannon</span>
            <span className="text-indigo-400">({SOMNIA_CHAIN_ID})</span>
          </div>

          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-cyan-300">
            <Activity className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
            <span className="font-bold">⚡ {latency}ms</span>
            <span className="text-[10px] text-cyan-400/70">Sub-Second Finality</span>
          </div>
        </div>

        {/* Right: Audio Toggle, Wallet & Explorer */}
        <div className="flex items-center space-x-3">
          {/* Futuristic Audio Synthesizer Toggle */}
          <button
            onClick={toggleSound}
            onMouseEnter={() => sound.playHover()}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition active:scale-95"
            title={isMuted ? "Sound Effects: Muted" : "Sound Effects: Active"}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-gray-500" />
            ) : (
              <Volume2 className="w-4 h-4 text-cyan-400" />
            )}
          </button>

          <a
            href={`${EXPLORER_URL}/address/${CONTRACT_ADDRESSES.divergenceRouter}`}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => sound.playHover()}
            className="hidden sm:flex items-center space-x-1 text-xs text-gray-400 hover:text-cyan-300 transition-colors px-3 py-2 rounded-xl border border-white/10 hover:border-cyan-500/30 bg-white/5 font-mono"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Router Contract</span>
            <ExternalLink className="h-3 w-3 ml-0.5" />
          </a>

          {userAddress ? (
            <div className="flex items-center space-x-2.5 bg-[#0e1424]/90 border border-indigo-500/30 rounded-xl px-3 py-1.5 shadow-lg">
              <div className="text-right font-mono">
                <div className="text-[10px] uppercase text-gray-400 tracking-wider">Collateral</div>
                <div className="text-xs font-bold text-emerald-400">
                  {collateralBalance.toLocaleString()} tUSDC
                </div>
              </div>
              <div className="h-6 w-px bg-white/10 mx-0.5" />
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <div className="text-xs font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-lg">
                  {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                sound.playClick();
                onConnect();
              }}
              onMouseEnter={() => sound.playHover()}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold font-mono shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
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
