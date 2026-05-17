import { useState } from 'react';
import { X, Share2 } from 'lucide-react';

const socials = [
  {
    label: 'WhatsApp',
    href: 'https://wa.me/918953696928',
    color: 'bg-green-500 hover:bg-green-600',
    shadow: 'hover:shadow-green-500/40',
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.532 5.859L.057 23.448a.5.5 0 00.495.552.498.498 0 00.136-.019l5.7-1.494A11.942 11.942 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.693-.501-5.243-1.377l-.374-.215-3.883 1.018 1.036-3.773-.234-.386A9.944 9.944 0 012 12c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10z" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/zimorindia?igsh=cXY3d2NndzV6ZDJx',
    color: 'bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 hover:opacity-90',
    shadow: 'hover:shadow-pink-500/40',
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/share/14bLzKkkW8Z/',
    color: 'bg-blue-600 hover:bg-blue-700',
    shadow: 'hover:shadow-blue-500/40',
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    label: 'Pinterest',
    href: 'https://pin.it/mkjTzYeZt',
    color: 'bg-red-600 hover:bg-red-700',
    shadow: 'hover:shadow-red-500/40',
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
      </svg>
    ),
  },
  {
    label: 'YouTube',
    href: 'https://youtube.com/@zimorindia-z3p4i?si=hnCIC6MWVIkTxX0v',
    color: 'bg-red-500 hover:bg-red-600',
    shadow: 'hover:shadow-red-400/40',
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
];

export default function SocialFloat() {
  const [open, setOpen] = useState(false);

  return (
    /*
     * bottom-24 on mobile clears the fixed "Add to Cart" bar on product pages (≈72px).
     * bottom-6 on sm+ uses standard spacing.
     * The container is sized only to the toggle button — social icons are absolutely
     * positioned above it so they never push the button up when hidden.
     */
    <div className="fixed bottom-7 sm:bottom-6 right-6 z-40 w-14 h-14">
      {/* Social icons — absolutely stacked above the toggle button */}
      <div className="absolute bottom-16 right-0 flex flex-col items-end gap-3">
        {socials.map((s, i) => (
          <a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={s.label}
            title={s.label}
            style={{
              transitionDelay: open
                ? `${i * 45}ms`
                : `${(socials.length - 1 - i) * 30}ms`,
              transform: open ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.75)',
              opacity: open ? 1 : 0,
              pointerEvents: open ? 'auto' : 'none',
            }}
            className="flex items-center gap-2 group transition-all duration-300 ease-out"
          >
            <span className="hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs font-medium text-white bg-neutral-800 rounded-md px-2 py-1 whitespace-nowrap shadow-md">
              {s.label}
            </span>
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-full text-white shadow-lg transition-all duration-200 ${s.color} ${s.shadow} hover:shadow-xl hover:scale-110`}
            >
              {s.icon}
            </div>
          </a>
        ))}
      </div>

      {/* Toggle button — always anchored at bottom-24 sm:bottom-6 */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close social links' : 'Open social links'}
        className={`h-14 w-14 flex items-center justify-center rounded-full text-white shadow-xl transition-all duration-300 ${
          open
            ? 'bg-neutral-800 hover:bg-neutral-700 rotate-90'
            : 'bg-neutral-900 hover:bg-neutral-700 rotate-0'
        }`}
      >
        {open ? <X className="h-6 w-6" /> : <Share2 className="h-6 w-6" />}
      </button>
    </div>
  );
}
