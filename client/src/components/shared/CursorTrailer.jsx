import { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

// Resolve once, synchronously: don't render the trailer at all on touch devices
// or when the user prefers reduced motion.
function trailerEnabled() {
  if (typeof window === 'undefined') return false;
  return (
    !window.matchMedia('(pointer: coarse)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export default function CursorTrailer() {
  const [enabled] = useState(trailerEnabled);
  const [visible, setVisible] = useState(false);
  const visibleRef = useRef(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springX = useSpring(cursorX, { damping: 25, stiffness: 200 });
  const springY = useSpring(cursorY, { damping: 25, stiffness: 200 });

  useEffect(() => {
    if (!enabled) return;

    let frame = null;
    let lastX = 0;
    let lastY = 0;

    const flush = () => {
      frame = null;
      cursorX.set(lastX);
      cursorY.set(lastY);
    };

    const handleMove = (e) => {
      lastX = e.clientX;
      lastY = e.clientY;
      if (!visibleRef.current) {
        visibleRef.current = true;
        setVisible(true);
      }
      // Coalesce many mousemove events into one update per animation frame.
      if (frame == null) frame = requestAnimationFrame(flush);
    };

    const handleLeave = () => {
      visibleRef.current = false;
      setVisible(false);
    };
    const handleEnter = () => {
      visibleRef.current = true;
      setVisible(true);
    };

    window.addEventListener('mousemove', handleMove, { passive: true });
    document.addEventListener('mouseleave', handleLeave);
    document.addEventListener('mouseenter', handleEnter);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseleave', handleLeave);
      document.removeEventListener('mouseenter', handleEnter);
    };
    // cursorX/cursorY are stable motion values; visibility is tracked via ref so
    // the listener is attached exactly once.
  }, [enabled, cursorX, cursorY]);

  if (!enabled) return null;

  return (
    <motion.div
      className="pointer-events-none fixed top-0 left-0 z-9999 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/20 mix-blend-darken"
      style={{ x: springX, y: springY }}
      animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.5 }}
      transition={{ opacity: { duration: 0.2 }, scale: { duration: 0.2 } }}
    />
  );
}
