"use client";

import { useEffect, useRef } from "react";

interface Petal {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  color: string;
  isJasmine: boolean;
}

export default function PetalShower() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", onResize);

    // Minimalist soft pink rose petal colors and jasmine whites
    const petalColors = [
      "rgba(251, 146, 172, ", // soft rose pink
      "rgba(244, 114, 182, ", // vibrant blush
      "rgba(253, 164, 175, ", // coral pink
      "rgba(254, 205, 211, ", // petal cream pink
      "rgba(255, 240, 243, ", // jasmine pink-white
    ];

    const petalCount = 22; // Minimalist, clean, not overwhelming
    const petals: Petal[] = Array.from({ length: petalCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 8 + 6,
      speedY: Math.random() * 0.7 + 0.4, // gentle fall
      speedX: (Math.random() - 0.5) * 0.4,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 0.8,
      opacity: Math.random() * 0.45 + 0.35,
      color: petalColors[Math.floor(Math.random() * petalColors.length)],
      isJasmine: Math.random() > 0.75, // some white/cream jasmine petals
    }));

    let isVisible = true;
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    });
    observer.observe(canvas);

    const loop = () => {
      if (!isVisible) {
        animId = requestAnimationFrame(loop);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < petals.length; i++) {
        const p = petals[i];
        p.y += p.speedY;
        p.x += Math.sin(p.y * 0.012) * 0.6 + p.speedX;
        p.rotation += p.rotationSpeed;

        if (p.y > height + 20) {
          p.y = -20;
          p.x = Math.random() * width;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.beginPath();

        if (p.isJasmine) {
          // Small elongated teardrop jasmine petal
          ctx.ellipse(0, 0, p.size * 0.45, p.size * 0.85, 0, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 253, 248, ${p.opacity})`;
        } else {
          // Soft heart/oval rose petal
          ctx.ellipse(0, 0, p.size * 0.65, p.size, 0, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color}${p.opacity})`;
        }

        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-hidden"
    />
  );
}

