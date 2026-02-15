"use client";
import { useEffect, useRef } from "react";

export default function Cursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const glowRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!mq.matches) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    const glow = glowRef.current;
    if (!dot || !ring || !glow) return;

    let posX = -100,
      posY = -100;
    let smoothX = -100,
      smoothY = -100;
    let hue = 220;
    let isHovered = false;
    let isClicking = false;
    let isVisible = false;
    let animFrame;

    const show = () => {
      if (!isVisible) {
        isVisible = true;
        dot.style.display = "block";
        ring.style.display = "block";
        glow.style.display = "block";
      }
    };

    const hide = () => {
      isVisible = false;
      dot.style.display = "none";
      ring.style.display = "none";
      glow.style.display = "none";
    };

    hide(); // start hidden

    const onMove = (e) => {
      posX = e.clientX;
      posY = e.clientY;
      show();

      const t = e.target;
      const interactive =
        t.tagName === "A" ||
        t.tagName === "BUTTON" ||
        t.closest?.("a") ||
        t.closest?.("button") ||
        t.tagName === "INPUT" ||
        t.tagName === "TEXTAREA" ||
        t.tagName === "SELECT" ||
        getComputedStyle(t).cursor === "pointer";

      if (interactive !== isHovered) {
        isHovered = interactive;
        ring.style.borderRadius = interactive ? "30%" : "50%";
        ring.style.background = interactive
          ? `hsla(${hue}, 80%, 60%, 0.08)`
          : "transparent";
        dot.style.opacity = interactive ? "0" : "1";
      }
    };

    const onDown = () => {
      isClicking = true;
      dot.style.transform = "translate(-50%, -50%) scale(0.5)";
      ring.style.transform = `translate(-50%, -50%) scale(0.7) rotate(${hue * 2}deg)`;
      glow.style.transform = "translate(-50%, -50%) scale(3)";
    };

    const onUp = () => {
      isClicking = false;
    };

    const tick = () => {
      smoothX += (posX - smoothX) * 0.12;
      smoothY += (posY - smoothY) * 0.12;
      hue = (hue + 0.2) % 360;

      // Direct DOM updates — no React re-render
      const dotColor = `hsl(${hue}, 85%, 75%)`;
      const ringColor = isHovered
        ? `hsla(${hue}, 90%, 70%, 0.7)`
        : `hsla(${hue}, 70%, 65%, 0.35)`;

      dot.style.left = posX + "px";
      dot.style.top = posY + "px";
      dot.style.background = dotColor;
      dot.style.boxShadow = `0 0 12px ${dotColor}, 0 0 24px hsla(${hue}, 85%, 75%, 0.3)`;
      if (!isClicking) {
        dot.style.transform = `translate(-50%, -50%) scale(${isHovered ? 0 : 1})`;
      }

      ring.style.left = smoothX + "px";
      ring.style.top = smoothY + "px";
      ring.style.borderColor = ringColor;
      if (!isClicking) {
        ring.style.transform = `translate(-50%, -50%) scale(${isHovered ? 1.6 : 1}) rotate(${hue * 2}deg)`;
      }

      glow.style.left = posX + "px";
      glow.style.top = posY + "px";
      glow.style.background = `radial-gradient(circle, hsla(${hue}, 90%, 70%, ${isHovered ? 0.12 : 0.06}) 0%, transparent 70%)`;
      if (!isClicking) {
        glow.style.transform = `translate(-50%, -50%) scale(${isHovered ? 2.5 : 1})`;
      }

      animFrame = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.addEventListener("mouseleave", hide);
    document.addEventListener("mouseenter", show);

    animFrame = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.removeEventListener("mouseleave", hide);
      document.removeEventListener("mouseenter", show);
      cancelAnimationFrame(animFrame);
    };
  }, []);

  const common = {
    position: "fixed",
    pointerEvents: "none",
    display: "none",
    willChange: "transform",
  };

  return (
    <>
      <div
        ref={glowRef}
        style={{
          ...common,
          width: 80,
          height: 80,
          borderRadius: "50%",
          zIndex: 99997,
          transition: "transform 0.3s ease-out",
          transform: "translate(-50%, -50%)",
        }}
      />
      <div
        ref={ringRef}
        style={{
          ...common,
          width: 36,
          height: 36,
          border: "1.5px solid transparent",
          borderRadius: "50%",
          zIndex: 99999,
          transition:
            "border-color 0.3s, border-radius 0.4s ease, transform 0.15s ease-out, background 0.3s",
          transform: "translate(-50%, -50%)",
        }}
      />
      <div
        ref={dotRef}
        style={{
          ...common,
          width: 8,
          height: 8,
          borderRadius: "50%",
          zIndex: 100000,
          transition: "transform 0.12s ease-out",
          transform: "translate(-50%, -50%)",
        }}
      />
    </>
  );
}
