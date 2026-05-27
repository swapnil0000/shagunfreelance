import { useState, useEffect, useRef, useCallback } from 'react';
import { NavLink, Outlet, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Ticket,
  Settings,
  ClipboardList,
  MessageSquare,
  CreditCard,
  FileText,
  BookOpen,
  Mail,
  BarChart3,
  HeadphonesIcon,
  Menu,
  X,
} from 'lucide-react';
import useAuthStore from '../../stores/authStore';
import NotificationBell from './NotificationBell';

const IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

function useIdleTimeout(onIdle) {
  const timerRef = useRef(null);

  const reset = useCallback(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(onIdle, IDLE_TIMEOUT_MS);
  }, [onIdle]);

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => {
      clearTimeout(timerRef.current);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [reset]);
}

const navItems = [
  { to: '/admin',            label: 'Dashboard',  icon: LayoutDashboard, end: true },
  { to: '/admin/products',   label: 'Products',   icon: Package },
  { to: '/admin/orders',     label: 'Orders',     icon: ShoppingCart },
  { to: '/admin/customers',  label: 'Customers',  icon: Users },
  { to: '/admin/coupons',      label: 'Coupons',       icon: Ticket },
  { to: '/admin/transactions', label: 'Transactions',  icon: CreditCard },
  { to: '/admin/contacts',     label: 'Messages',      icon: MessageSquare },
  { to: '/admin/cms',              label: 'CMS Pages',       icon: FileText },
  { to: '/admin/blog',             label: 'Blog',            icon: BookOpen },
  { to: '/admin/reports',          label: 'Reports',         icon: BarChart3 },
  { to: '/admin/tickets',          label: 'Support',         icon: HeadphonesIcon },
  { to: '/admin/email-templates',  label: 'Email Templates', icon: Mail },
  { to: '/admin/audit-logs',       label: 'Audit Logs',      icon: ClipboardList },
  { to: '/admin/settings',     label: 'Settings',      icon: Settings },
];

export default function AdminLayout() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleIdle = useCallback(() => {
    logout();
    toast.info('You were logged out due to inactivity');
    navigate('/login', { replace: true });
  }, [logout, navigate]);

  useIdleTimeout(handleIdle);

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-neutral-200 bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Brand header */}
          <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
            <span className="font-heading text-lg font-semibold text-brand-700">
              Zimor Admin
            </span>
            <div className="flex items-center gap-1">
              <div className="hidden lg:block">
                <NotificationBell />
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="rounded-md p-1 text-neutral-500 hover:bg-neutral-100 lg:hidden"
                aria-label="Close sidebar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Admin navigation">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                  }`
                }
              >
                <Icon className="h-5 w-5" />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Mobile header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 lg:hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-md p-1.5 text-neutral-600 hover:bg-neutral-100"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="font-heading text-sm font-semibold text-brand-700">
              Zimor Admin
            </span>
          </div>
          <NotificationBell />
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
