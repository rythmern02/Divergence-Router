"use client";

import React, { useState, useEffect } from "react";
import { Activity, ShieldCheck, ExternalLink, Wallet, Volume2, VolumeX } from "lucide-react";
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
  const [mounted, setMounted] = useState(false);
  const [latency, setLatency] = useState(380);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setLatency(Math.floor(350 + Math.random() * 50));
    }, 3500);
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
    <header className="border-b border-white/[0.06] bg-[#080a0f]/80 backdrop-blur-2xl sticky top-0 z-40 px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3.5">
          <div className="h-9 w-9 rounded-xl bg-white/[0.06] border border-white/[0.1] flex items-center justify-center font-mono font-bold text-sm text-zinc-100 shadow-sm">
            &Delta;
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-base tracking-tight text-white">
                Divergence<span className="text-zinc-400 font-normal">Router</span>
              </span>
              <span className="text-[10px] font-mono text-zinc-400 bg-white/[0.05] border border-white/[0.08] px-2 py-0.5 rounded">
                Somnia &times; DreamDEX
              </span>
            </div>
            <p className="text-[11px] font-mono text-zinc-500">
              Institutional Relative-Value Engine &bull; EVM Atomic
            </p>
          </div>
        </div>

        {/* Center Telemetry */}
        <div className="hidden md:flex items-center space-x-3 text-xs font-mono">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-zinc-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="text-zinc-300 font-medium">Chain {SOMNIA_CHAIN_ID}</span>
          </div>

          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-zinc-400">
            <Activity className="h-3 w-3 text-zinc-400" />
            <span className="text-zinc-200 font-medium tabular-nums">
              {mounted ? latency : 380}ms
            </span>
            <span className="text-zinc-500">Reactivity</span>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-3">
          {/* Audio Toggle */}
          <button
            onClick={toggleSound}
            onMouseEnter={() => sound.playHover()}
            className="p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-zinc-400 hover:text-white transition"
            title={isMuted ? "Sound: Muted" : "Sound: Active"}
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-zinc-500" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-zinc-300" />
            )}
          </button>

          {/* Router Verified Link */}
          <a
            href={`${EXPLORER_URL}/address/${CONTRACT_ADDRESSES.divergenceRouter}`}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => sound.playHover()}
            className="hidden sm:flex items-center space-x-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors px-3 py-2 rounded-lg border border-white/[0.06] hover:border-white/[0.12] bg-white/[0.02] font-mono"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-zinc-400" />
            <span>Router Code</span>
            <ExternalLink className="h-2.5 w-2.5 text-zinc-500" />
          </a>

          {userAddress ? (
            <div className="flex items-center space-x-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-1.5">
              <div className="text-right font-mono">
                <div className="text-[10px] text-zinc-500 uppercase">Collateral</div>
                <div className="text-xs font-semibold text-emerald-400 tabular-nums">
                  {collateralBalance.toLocaleString()} tUSDC
                </div>
              </div>
              <div className="h-5 w-px bg-white/[0.08] mx-0.5" />
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <div className="text-xs font-mono text-zinc-300 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06]">
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
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-900 text-xs font-semibold shadow-sm transition active:scale-98"
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
