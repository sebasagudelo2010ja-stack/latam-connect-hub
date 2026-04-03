import { useRef, useEffect, useCallback } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  hue: number;
  life: number;
  maxLife: number;
}

const MAX_PARTICLES = 120;
const SPAWN_RATE = 3; // particles per frame when moving

export function useParticleTracer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });
  const rafRef = useRef(0);

  const spawnParticles = useCallback((x: number, y: number) => {
    const particles = particlesRef.current;
    const count = Math.min(SPAWN_RATE, MAX_PARTICLES - particles.length);

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * 2;
      const maxLife = 60 + Math.random() * 60; // 1-2s at 60fps
      // Azure (217°) or Gold (48°)
      const hue = Math.random() > 0.4 ? 217 + (Math.random() - 0.5) * 20 : 48 + (Math.random() - 0.5) * 15;

      particles.push({
        x: x + (Math.random() - 0.5) * 4,
        y: y + (Math.random() - 0.5) * 4,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 1.5 + Math.random() * 3,
        opacity: 0.6 + Math.random() * 0.4,
        hue,
        life: 0,
        maxLife,
      });
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const parent = canvas.parentElement;
      if (!parent) return;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const point = "touches" in e ? e.touches[0] : e;
      if (!point) return;
      mouseRef.current = {
        x: point.clientX - rect.left,
        y: point.clientY - rect.top,
        active: true,
      };
    };

    const onPointerLeave = () => {
      mouseRef.current.active = false;
    };

    canvas.addEventListener("mousemove", onPointerMove);
    canvas.addEventListener("touchmove", onPointerMove, { passive: true });
    canvas.addEventListener("mouseleave", onPointerLeave);

    const animate = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const mouse = mouseRef.current;
      const particles = particlesRef.current;

      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      // Spawn when cursor active
      if (mouse.active) {
        spawnParticles(mouse.x, mouse.y);
      }

      // Update & draw
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;

        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
          continue;
        }

        const progress = p.life / p.maxLife;
        const fadeOut = 1 - progress;
        const currentOpacity = p.opacity * fadeOut;
        const currentSize = p.size * (1 - progress * 0.5);

        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.98;
        p.vy *= 0.98;

        // Glow circle
        ctx.beginPath();
        ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 85%, 65%, ${currentOpacity})`;
        ctx.shadowColor = `hsla(${p.hue}, 90%, 70%, ${currentOpacity * 0.6})`;
        ctx.shadowBlur = 12;
        ctx.fill();
      }

      // Reset shadow for perf
      ctx.shadowBlur = 0;
      ctx.globalCompositeOperation = "source-over";

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onPointerMove);
      canvas.removeEventListener("touchmove", onPointerMove);
      canvas.removeEventListener("mouseleave", onPointerLeave);
    };
  }, [spawnParticles]);

  return canvasRef;
}
