import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Menu, Heart } from 'lucide-react';
import useCartStore from '../../stores/cartStore';
import useAuthStore from '../../stores/authStore';

export default function Navbar({ onOpenMobileNav }) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const totalItems = useCartStore((s) => s.totalItems);
  const toggleDrawer = useCartStore((s) => s.toggleDrawer);
  const { isAuthenticated, user, logout } = useAuthStore();

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/shop', label: 'Shop' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ];

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-neutral-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          {/* Left: Mobile hamburger (mobile only) + Desktop logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenMobileNav}
              className="lg:hidden p-2 -ml-2 text-neutral-700 hover:text-brand-600 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Desktop logo — left aligned */}
            <Link to="/" className="hidden lg:block shrink-0">
              <img src="/logo.png" alt="Zimor India" className="w-30" />
            </Link>
          </div>

          {/* Mobile logo — absolutely centered */}
          <Link to="/" className="lg:hidden absolute left-1/2 -translate-x-1/2 shrink-0">
            <img src="/logo.png" alt="Zimor India" className="w-28" />
          </Link>

          {/* Center: Desktop nav links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="px-4 py-2 rounded-full text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-all"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1">
            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="hidden sm:flex p-2.5 rounded-full text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-all"
              aria-label="Wishlist"
            >
              <Heart className="h-[18px] w-[18px]" />
            </Link>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="p-2.5 rounded-full text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-all"
                aria-label="User menu"
              >
                <User className="h-[18px] w-[18px]" />
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-neutral-100 py-2 z-50 overflow-hidden">
                    {isAuthenticated ? (
                      <>
                        <div className="px-4 py-3 border-b border-neutral-100">
                          <p className="text-sm font-semibold text-neutral-900 truncate">{user?.name}</p>
                          <p className="text-xs text-neutral-500 truncate">{user?.email}</p>
                        </div>
                        <Link
                          to="/account"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                        >
                          My Account
                        </Link>
                        <Link
                          to="/account/orders"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                        >
                          My Orders
                        </Link>
                        <Link
                          to="/wishlist"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                        >
                          Wishlist
                        </Link>
                        <div className="border-t border-neutral-100 mt-1 pt-1">
                          <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            Logout
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/login"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                        >
                          Sign In
                        </Link>
                        <Link
                          to="/register"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2.5 text-sm font-medium text-brand-600 hover:bg-brand-50 transition-colors"
                        >
                          Create Account
                        </Link>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Cart */}
            <button
              onClick={toggleDrawer}
              className="relative p-2.5 rounded-full text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-all"
              aria-label="Open cart"
            >
              <ShoppingBag className="h-[18px] w-[18px]" />
              {totalItems > 0 && (
                <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-[9px] font-bold text-white ring-2 ring-white">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

    </nav>
  );
}
