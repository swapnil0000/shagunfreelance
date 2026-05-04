import { useState, useEffect } from 'react';

const messages = [
  'Free Shipping on Orders Over ₹999',
  'Premium Handcrafted Workbags',
  'Made in Varanasi, India',
];

export default function AnnouncementBar() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-brand-900 text-white text-center text-xs sm:text-sm py-2 px-4">
      <p className="transition-opacity duration-500">{messages[index]}</p>
    </div>
  );
}
