import { useRef, useEffect, useCallback } from "react";

interface Tube {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  length: number;
  angle: number;
  speed: number;
  hue: number;
  opacity: number;
}

const TUBE_COUNT = 40;
const MAX_SPEED = 1.2;

function createTube(w: number, h: number): Tube {
  const angle = Math.random() * Math.PI * 2;
  const speed = 0.3 + Math.random() * MAX_SPEED;
  // Use primary (217°) and secondary (48°) hues from theme
  const hue = Math.random() > 0.5 ? 217 + (Math.random() - 0.5) * 30 : 48 + (Math.random() - 0.5) * 20;
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    radius: 2 + Math.random() * 4,
    length: 80 + Math.random() * 180,
    angle,
    speed,
    hue,
    opacity: 0.08 + Math.random() * 0.15,
  };
}

const TubesHero = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const tubesRef = useRef<Tube[]>([]);
  const rafRef = useRef<number>(0);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
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

      // Re-init tubes on resize
      tubesRef.current = Array.from({ length: TUBE_COUNT }, () => createTube(w, h));
    };

    resize();
    window.addEventListener("resize", resize);
    canvas.addEventListener("mousemove", handleMouseMove);

    const animate = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const mouse = mouseRef.current;

      ctx.clearRect(0, 0, w, h);

      for (const tube of tubesRef.current) {
        // Mouse repulsion
        const dx = tube.x - mouse.x;
        const dy = tube.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200 && dist > 0) {
          const force = (200 - dist) / 200;
          tube.vx += (dx / dist) * force * 0.3;
          tube.vy += (dy / dist) * force * 0.3;
        }

        // Damping
        tube.vx *= 0.99;
        tube.vy *= 0.99;

        // Maintain minimum speed
        const currentSpeed = Math.sqrt(tube.vx * tube.vx + tube.vy * tube.vy);
        if (currentSpeed < tube.speed * 0.5) {
          tube.vx = (tube.vx / (currentSpeed || 1)) * tube.speed * 0.5;
          tube.vy = (tube.vy / (currentSpeed || 1)) * tube.speed * 0.5;
        }

        tube.x += tube.vx;
        tube.y += tube.vy;
        tube.angle = Math.atan2(tube.vy, tube.vx);

        // Wrap around edges
        if (tube.x < -tube.length) tube.x = w + tube.length;
        if (tube.x > w + tube.length) tube.x = -tube.length;
        if (tube.y < -tube.length) tube.y = h + tube.length;
        if (tube.y > h + tube.length) tube.y = -tube.length;

        // Draw tube
        const endX = tube.x + Math.cos(tube.angle) * tube.length;
        const endY = tube.y + Math.sin(tube.angle) * tube.length;

        const gradient = ctx.createLinearGradient(tube.x, tube.y, endX, endY);
        gradient.addColorStop(0, `hsla(${tube.hue}, 80%, 60%, 0)`);
        gradient.addColorStop(0.3, `hsla(${tube.hue}, 80%, 60%, ${tube.opacity})`);
        gradient.addColorStop(0.7, `hsla(${tube.hue}, 80%, 60%, ${tube.opacity})`);
        gradient.addColorStop(1, `hsla(${tube.hue}, 80%, 60%, 0)`);

        ctx.beginPath();
        ctx.moveTo(tube.x, tube.y);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = tube.radius;
        ctx.lineCap = "round";
        ctx.stroke();

        // Glow
        ctx.beginPath();
        ctx.moveTo(tube.x, tube.y);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = `hsla(${tube.hue}, 90%, 70%, ${tube.opacity * 0.3})`;
        ctx.lineWidth = tube.radius * 3;
        ctx.lineCap = "round";
        ctx.stroke();
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMouseMove);
    };
  }, [handleMouseMove]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-auto"
      aria-hidden="true"
    />
  );
};

export default TubesHero;
