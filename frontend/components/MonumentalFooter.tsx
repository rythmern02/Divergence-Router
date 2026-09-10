"use client";

import React from "react";
import { ExternalLink, ShieldCheck } from "lucide-react";
import { CONTRACT_ADDRESSES, EXPLORER_URL } from "../lib/constants";
import { DivergenceLogo } from "./DivergenceLogo";
import { sound } from "../lib/soundFx";

export const MonumentalFooter: React.FC = () => {
  return (
    <footer className="w-full border-t border-white/[0.08] bg-[#050608] relative z-20 overflow-hidden select-none">
      {/* Top Metadata Row */}
      <div className="max-w-7xl mx-auto px-6 pt-12 pb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-white/[0.05]">
        <div className="flex items-center space-x-3.5">
          <DivergenceLogo size={34} useImage={true} />
          <div>
            <div className="font-mono text-xs font-semibold text-white uppercase tracking-wider">
              Divergence Router Protocol
            </div>
            <div className="text-[11px] font-mono text-zinc-500">
              Institutional Relative-Value Engine on Somnia DreamDEX
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="flex flex-wrap items-center gap-5 text-xs font-mono text-zinc-400">
          <a
            href={`${EXPLORER_URL}/address/${CONTRACT_ADDRESSES.divergenceRouter}`}
            target="_blank"
            rel="noreferrer"
            onMouseEnter={() => sound.playHover()}
            className="hover:text-white transition-colors flex items-center gap-1"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
            <span>Router Contract</span>
            <ExternalLink className="w-2.5 h-2.5 text-zinc-600" />
          </a>

          <a
            href={`${EXPLORER_URL}/address/${CONTRACT_ADDRESSES.binarySettlement}`}
            target="_blank"
            rel="noreferrer"
            onMouseEnter={() => sound.playHover()}
            className="hover:text-white transition-colors flex items-center gap-1"
          >
            <span>Settlement Module</span>
            <ExternalLink className="w-2.5 h-2.5 text-zinc-600" />
          </a>

          <a
            href={`${EXPLORER_URL}/address/${CONTRACT_ADDRESSES.collateralToken}`}
            target="_blank"
            rel="noreferrer"
            onMouseEnter={() => sound.playHover()}
            className="hover:text-white transition-colors flex items-center gap-1"
          >
            <span>Collateral Token (tUSDC)</span>
            <ExternalLink className="w-2.5 h-2.5 text-zinc-600" />
          </a>
        </div>
      </div>

      {/* Massive 35vh Typographic Architectural Signature */}
      <div className="relative w-full h-[32vh] sm:h-[35vh] flex items-center justify-center overflow-hidden pointer-events-none">
        {/* Subtle radial glow from behind text */}
        <div className="absolute inset-0 bg-radial-vignette opacity-80" />

        {/* Massive Beveled Titanium Headline */}
        <div className="w-full text-center px-2">
          <span className="text-[13.5vw] sm:text-[14.5vw] font-black tracking-tighter uppercase leading-none block font-sans bg-gradient-to-b from-white/[0.25] via-white/[0.08] to-transparent bg-clip-text text-transparent select-none drop-shadow-sm">
            DIVERGENCE
          </span>
        </div>

        {/* Subtle center hairline dividing line */}
        <div className="absolute bottom-6 w-full max-w-7xl mx-auto px-6 flex items-center justify-between text-[10px] font-mono text-zinc-600">
          <span>LATENCY: &lt; 380MS</span>
          <span>EVM ALL-OR-NONE EXECUTION</span>
          <span>SOMNIA SHANNON TESTNET &bull; CHAIN 50312</span>
        </div>
      </div>

      {/* Bottom Copyright & Guarantee */}
      <div className="border-t border-white/[0.04] py-4 px-6 text-center text-[11px] font-mono text-zinc-600">
        &copy; 2026 Divergence Protocol &bull; Engineered for the Somnia &times; DreamDEX Hackathon &bull; Built with Pure Titanium Precision
      </div>
    </footer>
  );
};
