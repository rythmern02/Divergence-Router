"use client";

import React, { useEffect, useRef, useState } from "react";
import { Sliders, Check } from "lucide-react";
import { sound } from "../lib/soundFx";

const BG_SCENES = [
  {
    id: "titanium-core",
    name: "Titanium Monoliths",
    src: "/assets/bg-titanium-core.jpg",
    desc: "Brushed Titanium Architectural Geometry",
  },
  {
    id: "chrome-vectors",
    name: "Liquid Chrome Vectors",
    src: "/assets/bg-chrome-vectors.jpg",
    desc: "Polished Silver Divergence Streams",
  },
  {
    id: "monochrome-stream",
    name: "Steel Slipstream",
    src: "/assets/bg-monochrome-stream.jpg",
    desc: "Sub-Second Infinite Vanishing Point",
  },
];

export const BackgroundExperience: React.FC = () => {
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [autoLoop, setAutoLoop] = useState<boolean>(true);
  const [particlesEnabled, setParticlesEnabled] = useState<boolean>(true);
  const [showControls, setShowControls] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mousePos = useRef<{ x: number; y: number }>({ x: -1000, y: -1000 });

  // Cinematic slow scene transition
  useEffect(() => {
    if (!autoLoop) return;
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % BG_SCENES.length);
    }, 18000);
    return () => clearInterval(interval);
  }, [autoLoop]);

  // Track cursor for subtle ambient specular lighting
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Pure Monochrome Stardust Canvas
  useEffect(() => {
    if (!particlesEnabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const count = Math.min(45, Math.floor(width / 36));
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      baseAlpha: number;
    }> = [];

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        size: Math.random() * 1.0 + 0.5,
        baseAlpha: Math.random() * 0.2 + 0.08,
      });
    }

    let frame = 0;

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      const mx = mousePos.current.x;
      const my = mousePos.current.y;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.hypot(dx, dy);
        if (dist < 130) {
          const force = (130 - dist) / 130;
          p.x += (dx / (dist || 1)) * force * 0.7;
          p.y += (dy / (dist || 1)) * force * 0.7;
        }

        ctx.fillStyle = `rgba(255, 255, 255, ${p.baseAlpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const distNodes = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (distNodes < 90) {
            const lineAlpha = (1 - distNodes / 90) * 0.06;
            ctx.strokeStyle = `rgba(255, 255, 255, ${lineAlpha})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // Pure white/silver specular lighting reflecting off cursor
      if (mx > 0 && my > 0) {
        const grad = ctx.createRadialGradient(mx, my, 0, mx, my, 260);
        grad.addColorStop(0, "rgba(255, 255, 255, 0.035)");
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = grad;
        ctx.fillRect(mx - 260, my - 260, 520, 520);
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, [particlesEnabled]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-black">
      {/* 3D Visual Asset Layer — Matching Exact Logo Titanium & Chrome Palette */}
      <div className="absolute inset-0 w-full h-full">
        {BG_SCENES.map((scene, idx) => {
          const isActive = idx === activeIdx;
          return (
            <div
              key={scene.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? "opacity-25" : "opacity-0"
              }`}
            >
              <div
                className={`w-full h-full bg-cover bg-center ${
                  isActive ? "animate-ken-burns" : ""
                }`}
                style={{
                  backgroundImage: `url('${scene.src}')`,
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Pure Obsidian Black Vignette Mask */}
      <div className="absolute inset-0 bg-black/75" />
      <div className="absolute inset-0 bg-radial-vignette opacity-95" />

      {/* Fine Monochrome Micro-Constellation Canvas */}
      {particlesEnabled && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />
      )}

      {/* Floating 3D Background Controller — Brushed Titanium Dock Style */}
      <div className="absolute bottom-6 right-6 pointer-events-auto z-40">
        <div className="relative">
          {showControls ? (
            <div className="bg-[#0a0a0c]/95 border border-white/[0.12] backdrop-blur-2xl rounded-2xl p-4 shadow-2xl space-y-3 w-64 text-xs font-mono animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
                <span className="text-zinc-200 font-medium text-xs">
                  Titanium 3D Environment
                </span>
                <button
                  onClick={() => setShowControls(false)}
                  className="text-zinc-500 hover:text-white px-1"
                >
                  &times;
                </button>
              </div>

              <div className="space-y-1">
                {BG_SCENES.map((scene, idx) => (
                  <button
                    key={scene.id}
                    onClick={() => {
                      sound.playClick();
                      setActiveIdx(idx);
                      setAutoLoop(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-lg transition-all flex items-center justify-between ${
                      activeIdx === idx
                        ? "bg-white/[0.12] text-white border border-white/[0.18]"
                        : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
                    }`}
                  >
                    <div>
                      <div className="font-medium text-xs">{scene.name}</div>
                      <div className="text-[10px] text-zinc-500">{scene.desc}</div>
                    </div>
                    {activeIdx === idx && (
                      <Check className="w-3.5 h-3.5 text-zinc-300" />
                    )}
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-[11px] font-mono">
                <button
                  onClick={() => {
                    sound.playClick();
                    setAutoLoop((prev) => !prev);
                  }}
                  className={`px-2 py-1 rounded border transition ${
                    autoLoop
                      ? "bg-white/[0.1] text-zinc-200 border-white/[0.16]"
                      : "text-zinc-500 border-transparent hover:text-zinc-300"
                  }`}
                >
                  Loop: {autoLoop ? "Auto" : "Manual"}
                </button>

                <button
                  onClick={() => {
                    sound.playClick();
                    setParticlesEnabled((prev) => !prev);
                  }}
                  className={`px-2 py-1 rounded border transition ${
                    particlesEnabled
                      ? "bg-white/[0.1] text-zinc-200 border-white/[0.16]"
                      : "text-zinc-500 border-transparent hover:text-zinc-300"
                  }`}
                >
                  Particles: {particlesEnabled ? "On" : "Off"}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                sound.playClick();
                setShowControls(true);
              }}
              onMouseEnter={() => sound.playHover()}
              className="bg-[#0a0a0c]/85 hover:bg-[#141418] border border-white/[0.1] hover:border-white/[0.2] backdrop-blur-xl text-xs text-zinc-300 hover:text-white px-3.5 py-1.5 rounded-full shadow-lg transition-all duration-200 flex items-center space-x-2 font-mono"
            >
              <Sliders className="w-3 h-3 text-zinc-400" />
              <span>Scene: {BG_SCENES[activeIdx].name}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
