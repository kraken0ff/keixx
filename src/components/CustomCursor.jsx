import React, { useEffect, useRef, useState } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

export default function CustomCursor() {
  // Используем прямой доступ к DOM для максимальной производительности (без React Render Loop)
  const cursorRef = useRef(null);
  
  // Для трейла используем motion values, но с очень легкой пружиной
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  
  const springConfig = { damping: 20, stiffness: 300, mass: 0.5 };
  const trailX = useSpring(mouseX, springConfig);
  const trailY = useSpring(mouseY, springConfig);

  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    const handleMove = (e) => {
      const { clientX, clientY } = e;
      
      // 1. МГНОВЕННОЕ перемещение основной стрелки (Raw JS)
      // React state здесь был бы слишком медленным для 240Гц
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${clientX}px, ${clientY}px, 0) scale(${clicked ? 0.9 : 1})`;
      }

      // 2. Передаем координаты трейлу
      mouseX.set(clientX - 16); // -16 для центровки кольца 32px
      mouseY.set(clientY - 16);
    };

    const handleDown = () => setClicked(true);
    const handleUp = () => setClicked(false);

    window.addEventListener("mousemove", handleMove, { passive: true });
    window.addEventListener("mousedown", handleDown);
    window.addEventListener("mouseup", handleUp);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mousedown", handleDown);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [mouseX, mouseY, clicked]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-visible hidden md:block">
      {/* Трейл (framer motion обрабатывает это отдельно от потока рендера React) */}
      <motion.div
        className="absolute w-8 h-8 rounded-full border border-indigo-500/40 will-change-transform"
        style={{ x: trailX, y: trailY }}
      />

      {/* Основная стрелка (Hardware Accelerated Direct DOM) */}
      <div
        ref={cursorRef}
        className="absolute top-0 left-0 will-change-transform"
        style={{ transform: "translate3d(-100px, -100px, 0)" }} // Спрятать по умолчанию
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          // Тень в SVG дешевле чем drop-shadow в CSS
          className="filter drop-shadow-[0_0_4px_rgba(99,102,241,0.6)]" 
          style={{ transform: "translate(-2px, -2px)" }}
        >
          <path
            d="M3 3L10.07 19.97L12.58 12.58L19.97 10.07L3 3Z"
            fill="#6366f1"
            stroke="#a5b4fc"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}