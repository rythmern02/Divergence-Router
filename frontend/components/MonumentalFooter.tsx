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

      {/* Monumental Typographic Architectural Signature */}
      <div className="relative w-full h-[32vh] sm:h-[38vh] md:h-[42vh] flex items-center justify-center overflow-hidden pointer-events-none">
        {/* Subtle radial glow from behind text */}
        <div className="absolute inset-0 bg-radial-vignette opacity-90" />

        {/* Monumental Beveled Titanium Headline */}
        <div className="w-full flex items-center justify-center px-4 sm:px-6 overflow-hidden">
          <span className="text-[12vw] sm:text-[13.8vw] md:text-[14.6vw] lg:text-[15vw] font-black tracking-[-0.05em] uppercase leading-none inline-block whitespace-nowrap font-sans bg-gradient-to-b from-white/[0.38] via-white/[0.12] to-transparent bg-clip-text text-transparent select-none drop-shadow-lg">
            DIVERGENCE
          </span>
        </div>

        {/* Subtle center hairline dividing line */}
        <div className="absolute bottom-5 w-full max-w-7xl mx-auto px-6 flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-zinc-500">
          <span>LATENCY: &lt; 380MS</span>
          <span>EVM ALL-OR-NONE ATOMICITY</span>
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
