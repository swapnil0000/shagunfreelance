import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Layout (loaded eagerly since it wraps everything)
const Layout = lazy(() => import('./components/layout/Layout'));

// Public pages
const HomePage = lazy(() => import('./pages/HomePage'));
const ShopPage = lazy(() => import('./pages/ShopPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const PolicyPage = lazy(() => import('./pages/PolicyPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Auth pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));

// Protected pages
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const OrderConfirmationPage = lazy(() => import('./pages/OrderConfirmationPage'));

// Account pages
const AccountDashboard = lazy(() => import('./pages/account/AccountDashboard'));
const OrdersPage = lazy(() => import('./pages/account/OrdersPage'));
const OrderDetailPage = lazy(() => import('./pages/account/OrderDetailPage'));
const ProfilePage = lazy(() => import('./pages/account/ProfilePage'));

// Admin panel (separate chunk)
const AdminLayout = lazy(() => import(/* webpackChunkName: "admin" */ './components/admin/AdminLayout'));
const AdminDashboard = lazy(() => import(/* webpackChunkName: "admin" */ './pages/admin/AdminDashboard'));
const AdminProducts = lazy(() => import(/* webpackChunkName: "admin" */ './pages/admin/AdminProducts'));
const AdminOrders = lazy(() => import(/* webpackChunkName: "admin" */ './pages/admin/AdminOrders'));
const AdminCustomers = lazy(() => import(/* webpackChunkName: "admin" */ './pages/admin/AdminCustomers'));
const AdminCoupons = lazy(() => import(/* webpackChunkName: "admin" */ './pages/admin/AdminCoupons'));
const AdminSettings = lazy(() => import(/* webpackChunkName: "admin" */ './pages/admin/AdminSettings'));

function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route element={<Layout />}>
            {/* Public */}
            <Route index element={<HomePage />} />
            <Route path="shop" element={<ShopPage />} />
            <Route path="product/:slug" element={<ProductDetailPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="wishlist" element={<WishlistPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="policies/:slug" element={<PolicyPage />} />

            {/* Auth */}
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="reset-password/:token" element={<ResetPasswordPage />} />

            {/* Protected */}
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="order-confirmation/:id" element={<OrderConfirmationPage />} />

            {/* Account */}
            <Route path="account" element={<AccountDashboard />} />
            <Route path="account/orders" element={<OrdersPage />} />
            <Route path="account/orders/:id" element={<OrderDetailPage />} />
            <Route path="account/profile" element={<ProfilePage />} />

            {/* Admin */}
            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="customers" element={<AdminCustomers />} />
              <Route path="coupons" element={<AdminCoupons />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
