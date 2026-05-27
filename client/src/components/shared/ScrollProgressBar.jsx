import { useState, useEffect } from 'react';

export default function ScrollProgressBar() {
  // progress is a 0..1 fraction driving a composited transform (no layout reads on scroll)
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let ticking = false;
    // Cache the layout-dependent height; only recompute on resize, not on every scroll.
    let docHeight = document.documentElement.scrollHeight - window.innerHeight;

    const recompute = () => {
      docHeight = document.documentElement.scrollHeight - window.innerHeight;
    };

    const update = () => {
      ticking = false;
      if (docHeight > 0) {
        setProgress(Math.min(window.scrollY / docHeight, 1));
      }
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', recompute);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', recompute);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-0.5">
      <div
        className="h-full w-full origin-left bg-brand-600 transition-transform duration-150"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
}
