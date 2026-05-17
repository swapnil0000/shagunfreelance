import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

const messages = [
  '🚚 Free Shipping on All Orders',
  '💎 Premium Quality Workbags',
  '🇮🇳 Made in India with Love',
];

export default function AnnouncementBar() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-neutral-950 text-center text-xs py-2.5 px-4">
      <p className="flex items-center justify-center gap-2 text-neutral-300 font-medium tracking-wide transition-opacity duration-500">
        {messages[index]}
      </p>
    </div>
  );
}
