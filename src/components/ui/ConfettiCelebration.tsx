"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Sparkles, PartyPopper } from "lucide-react";

interface ConfettiPiece {
  x: number;
  y: number;
  size: number;
  color: string;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
  tilt: number;
  tiltSpeed: number;
  shape: "rect" | "heart" | "circle";
  opacity: number;
}

const CONFETTI_COLORS = [
  "#DE8865", // Rose Gold
  "#F07446", // Radiant Peach
  "#C45743", // Warm Coral / Burgundy
  "#F5D0C0", // Champagne
  "#FFD700", // Bright 24k Gold
  "#FFFFFF", // Pearl Sparkle
];

export default function ConfettiCelebration() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isFiring, setIsFiring] = useState(false);
  const piecesRef = useRef<ConfettiPiece[]>([]);
  const animationRef = useRef<number | null>(null);

  const fire = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    setIsFiring(true);

    const newPieces: ConfettiPiece[] = [];
    const count = 180;

    for (let i = 0; i < count; i++) {
      // Launch from bottom corners and bottom center upwards
      const originX = Math.random() < 0.5 ? window.innerWidth * 0.2 : window.innerWidth * 0.8;
      const angle = originX < window.innerWidth * 0.5
        ? (Math.random() * 45 + 30) * (Math.PI / 180)
        : (Math.random() * 45 + 105) * (Math.PI / 180);
      const velocity = Math.random() * 22 + 16;

      newPieces.push({
        x: originX,
        y: window.innerHeight * 0.85,
        size: Math.random() * 10 + 6,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        speedX: Math.cos(angle) * velocity * (originX < window.innerWidth * 0.5 ? 1 : -1),
        speedY: -Math.sin(angle) * velocity,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        tilt: Math.random() * 10,
        tiltSpeed: Math.random() * 0.15 + 0.05,
        shape: Math.random() > 0.4 ? "rect" : Math.random() > 0.5 ? "heart" : "circle",
        opacity: 1,
      });
    }

    piecesRef.current = [...piecesRef.current, ...newPieces];
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const loop = () => {
      if (piecesRef.current.length === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setIsFiring(false);
        animationRef.current = null;
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = piecesRef.current.length - 1; i >= 0; i--) {
        const p = piecesRef.current[i];
        p.x += p.speedX;
        p.y += p.speedY;
        p.speedY += 0.42; // Gravity
        p.speedX *= 0.985; // Air resistance
        p.rotation += p.rotationSpeed;
        p.tilt += p.tiltSpeed;

        if (p.y > canvas.height - 50) {
          p.opacity -= 0.025;
        }

        if (p.y > canvas.height || p.opacity <= 0) {
          piecesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;

        if (p.shape === "rect") {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size * 0.6);
        } else if (p.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 3, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Heart shape
          ctx.beginPath();
          const topCurveHeight = p.size * 0.3;
          ctx.moveTo(0, topCurveHeight);
          ctx.bezierCurveTo(0, 0, -p.size / 2, 0, -p.size / 2, topCurveHeight);
          ctx.bezierCurveTo(-p.size / 2, p.size * 0.6, 0, p.size * 0.8, 0, p.size);
          ctx.bezierCurveTo(0, p.size * 0.8, p.size / 2, p.size * 0.6, p.size / 2, topCurveHeight);
          ctx.bezierCurveTo(p.size / 2, 0, 0, 0, 0, topCurveHeight);
          ctx.fill();
        }

        ctx.restore();
      }

      animationRef.current = requestAnimationFrame(loop);
    };

    if (isFiring && !animationRef.current) {
      animationRef.current = requestAnimationFrame(loop);
    }
  }, [isFiring]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-50 h-full w-full"
      />
      <button
        onClick={fire}
        className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-gradient-to-r from-peach-500 via-burgundy to-peach-600 px-6 py-3 font-body text-sm font-semibold text-warm-white shadow-[0_10px_25px_-5px_rgba(196,87,67,0.4)] transition-all duration-300 hover:scale-105 hover:shadow-[0_15px_30px_-5px_rgba(196,87,67,0.6)] active:scale-95 cursor-pointer"
      >
        <span className="absolute inset-0 bg-gradient-to-r from-warm-white/0 via-warm-white/25 to-warm-white/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <PartyPopper className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
        <span>Celebrate 25 Years 🎉</span>
        <Sparkles className="h-3.5 w-3.5 text-peach-200" />
      </button>
    </>
  );
}

