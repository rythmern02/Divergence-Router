"use client";

import React, { useEffect, useRef, useState } from "react";
import { Sparkles, Eye, Radio, Orbit } from "lucide-react";
import { sound } from "../lib/soundFx";

interface BackgroundExperienceProps {
  intensity?: "ambient" | "high";
}

const BG_PRESETS = [
  {
    id: "quantum-core",
    name: "Quantum Core",
    src: "/assets/bg-quantum-core.jpg",
    accent: "#6366f1", // indigo / purple
    desc: "3D Torus Execution Engine",
  },
  {
    id: "divergence-mesh",
    name: "Divergence Mesh",
    src: "/assets/bg-divergence-mesh.jpg",
    accent: "#10b981", // emerald / cyan
    desc: "3D Probability Manifold",
  },
  {
    id: "speed-tunnel",
    name: "Speed Tunnel",
    src: "/assets/bg-speed-tunnel.jpg",
    accent: "#06b6d4", // cyan / neon blue
    desc: "Somnia Sub-Second Stream",
  },
];

export const BackgroundExperience: React.FC<BackgroundExperienceProps> = () => {
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [autoLoop, setAutoLoop] = useState<boolean>(true);
  const [particlesEnabled, setParticlesEnabled] = useState<boolean>(true);
  const [showControls, setShowControls] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mousePos = useRef<{ x: number; y: number }>({ x: -1000, y: -1000 });

  // Auto-cycle through the 3D assets like a cinematic video loop
  useEffect(() => {
    if (!autoLoop) return;
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % BG_PRESETS.length);
    }, 12000); // 12 seconds per cinematic loop
    return () => clearInterval(interval);
  }, [autoLoop]);

  // Track mouse coordinates for reactive lighting and particle repulsion
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // WebGL / Canvas Cybernetic Particles & Quantum Grid Wave
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

    // Particle nodes
    const particleCount = Math.min(65, Math.floor(width / 24));
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      baseAlpha: number;
      pulseSpeed: number;
      pulseOffset: number;
    }> = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2.2 + 1,
        baseAlpha: Math.random() * 0.45 + 0.25,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        pulseOffset: Math.random() * Math.PI * 2,
      });
    }

    let frame = 0;

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      const mx = mousePos.current.x;
      const my = mousePos.current.y;

      // Draw subtle dynamic perspective floor grid
      ctx.strokeStyle = "rgba(99, 102, 241, 0.04)";
      ctx.lineWidth = 1;
      const gridSpacing = 64;
      const gridOffset = (frame * 0.4) % gridSpacing;

      // Draw horizontal scrolling grid lines
      for (let y = gridOffset; y < height; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Render connected particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Wrap boundaries
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Mouse avoidance/aura
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140) {
          const force = (140 - dist) / 140;
          p.x += (dx / (dist || 1)) * force * 1.5;
          p.y += (dy / (dist || 1)) * force * 1.5;
        }

        // Pulse alpha
        const alpha = p.baseAlpha + Math.sin(frame * p.pulseSpeed + p.pulseOffset) * 0.2;

        // Particle circle
        ctx.fillStyle = `rgba(167, 139, 250, ${Math.max(0.1, alpha)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Connect nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const distNodes = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (distNodes < 110) {
            const lineAlpha = (1 - distNodes / 110) * 0.18;
            ctx.strokeStyle = `rgba(56, 189, 248, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // Cursor subtle glow
      if (mx > 0 && my > 0) {
        const radGrad = ctx.createRadialGradient(mx, my, 0, mx, my, 220);
        radGrad.addColorStop(0, "rgba(99, 102, 241, 0.12)");
        radGrad.addColorStop(0.5, "rgba(56, 189, 248, 0.04)");
        radGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = radGrad;
        ctx.fillRect(mx - 220, my - 220, 440, 440);
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
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* 3D Visual Asset Loops (Cinematic Ken Burns Continuous Pan & Zoom) */}
      <div className="absolute inset-0 w-full h-full">
        {BG_PRESETS.map((preset, idx) => {
          const isActive = idx === activeIdx;
          return (
            <div
              key={preset.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? "opacity-35" : "opacity-0"
              }`}
            >
              <div
                className={`w-full h-full bg-cover bg-center ${
                  isActive ? "animate-ken-burns" : ""
                }`}
                style={{
                  backgroundImage: `url('${preset.src}')`,
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Deep Cybernetic Radial Vignette & Atmospheric Gradients */}
      <div className="absolute inset-0 bg-radial-vignette mix-blend-multiply opacity-90" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#06080e]/90 via-[#090d16]/75 to-[#06080e]/95" />

      {/* Cybernetic Particle and Network Mesh Canvas */}
      {particlesEnabled && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none opacity-80"
        />
      )}

      {/* Futuristic CRT Scanline & HUD Grain Overlay */}
      <div className="absolute inset-0 bg-scanlines pointer-events-none opacity-40 mix-blend-overlay" />

      {/* Tech HUD Corner Accents */}
      <div className="absolute top-3 left-4 text-[10px] font-mono text-cyan-500/40 uppercase tracking-widest hidden md:flex items-center space-x-2">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
        <span>STREAM: SOMNIA 3D ENGINE • LATENCY 0.38s • 105k TPS</span>
      </div>

      <div className="absolute top-3 right-4 text-[10px] font-mono text-indigo-400/40 uppercase tracking-widest hidden md:flex items-center space-x-2">
        <span>CURRENT SCENE: {BG_PRESETS[activeIdx].name.toUpperCase()}</span>
        <span className="text-emerald-400">● LIVE</span>
      </div>

      {/* Floating 3D Background Controller Pill (Interactive) */}
      <div className="absolute bottom-6 right-6 pointer-events-auto z-40">
        <div className="relative">
          {showControls ? (
            <div className="bg-[#0e1424]/95 border border-indigo-500/30 backdrop-blur-xl rounded-2xl p-4 shadow-2xl space-y-3 w-72 text-xs font-mono animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-indigo-300 font-bold flex items-center gap-1.5">
                  <Orbit className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                  3D Background Engine
                </span>
                <button
                  onClick={() => setShowControls(false)}
                  className="text-gray-400 hover:text-white px-1"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-1.5">
                {BG_PRESETS.map((p, idx) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      sound.playClick();
                      setActiveIdx(idx);
                      setAutoLoop(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl transition flex items-center justify-between ${
                      activeIdx === idx
                        ? "bg-indigo-600/30 text-white border border-indigo-500/50 shadow-sm"
                        : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200"
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{p.name}</div>
                      <div className="text-[10px] text-gray-500">{p.desc}</div>
                    </div>
                    {activeIdx === idx && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    )}
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                <button
                  onClick={() => {
                    sound.playClick();
                    setAutoLoop((prev) => !prev);
                  }}
                  className={`px-2.5 py-1 rounded-lg border transition ${
                    autoLoop
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      : "bg-white/5 text-gray-400 border-white/10"
                  }`}
                >
                  Auto-Loop: {autoLoop ? "ON" : "PAUSED"}
                </button>

                <button
                  onClick={() => {
                    sound.playClick();
                    setParticlesEnabled((prev) => !prev);
                  }}
                  className={`px-2.5 py-1 rounded-lg border transition ${
                    particlesEnabled
                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                      : "bg-white/5 text-gray-400 border-white/10"
                  }`}
                >
                  Particles: {particlesEnabled ? "ON" : "OFF"}
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
              className="group bg-[#0e1424]/80 hover:bg-indigo-950/90 border border-indigo-500/30 hover:border-cyan-400/60 backdrop-blur-md text-xs font-mono text-gray-300 hover:text-white px-3.5 py-2 rounded-full shadow-lg transition-all duration-300 flex items-center space-x-2"
              title="Change 3D Asset Loop"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-12 transition-transform" />
              <span>3D Motion: {BG_PRESETS[activeIdx].name}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
