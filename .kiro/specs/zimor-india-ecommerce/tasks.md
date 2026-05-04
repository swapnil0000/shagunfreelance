# Implementation Plan: Zimor India Ecommerce Platform

## Overview

Full-stack ecommerce platform for Zimor India — a women's premium workbag brand. Backend built with Node.js/Express/MongoDB, frontend with React/Vite/Tailwind. Implementation proceeds backend-first (server/) then frontend (client/), with each task building incrementally on previous work.

## Tasks

- [x] 1. Backend project setup and core infrastructure
  - [x] 1.1 Initialize server project with package.json, install all dependencies (express, mongoose, bcryptjs, jsonwebtoken, passport, razorpay, cloudinary, multer, nodemailer, cors, helmet, express-rate-limit, hpp, express-validator, pdfkit, dotenv), and create .env.example with all required environment variables
    - Create `server/package.json` with `"type": "module"` and scripts (start, dev, seed)
    - Create `server/.env.example` with placeholders for MONGODB_URI, JWT_SECRET, CLIENT_URL, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, EMAIL_HOST, EMAIL_USER, EMAIL_PASS, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
    - _Requirements: 20.6_

  - [x] 1.2 Create Express app setup with security middleware (helmet, cors, hpp, rate limiting, JSON body parser) and global error handler
    - Create `server/src/app.js` with helmet, cors (CLIENT_URL origin), hpp, express.json (10mb limit), rate limiters (100/15min general, 20/15min auth)
    - Create `server/src/utils/AppError.js` custom error class with statusCode and isOperational
    - Create `server/src/middleware/errorHandler.js` — operational errors return status+message, non-operational return 500 "Internal server error", stack trace only in development
    - _Requirements: 15.4, 15.5, 15.6, 20.1, 20.2, 20.3, 20.4, 21.1, 21.2, 21.3, 21.4_

  - [x] 1.3 Create MongoDB connection config and server entry point
    - Create `server/src/config/db.js` with mongoose.connect using MONGODB_URI
    - Create `server/server.js` entry point that connects DB then starts Express on PORT
    - _Requirements: 20.6_

  - [x] 1.4 Create Cloudinary, Razorpay, and Passport config modules
    - Create `server/src/config/cloudinary.js` — configure with env vars
    - Create `server/src/config/razorpay.js` — initialize Razorpay instance with key_id and key_secret
    - Create `server/src/config/passport.js` — Google OAuth 2.0 strategy with findOrCreate logic
    - _Requirements: 3.1, 20.6_

- [x] 2. Mongoose data models
  - [x] 2.1 Create User model with password hashing, indexes, and comparePassword method
    - Create `server/src/models/User.js` with all fields from design (name, email, password, phone, avatar, role, googleId, addresses, resetPasswordToken, resetPasswordExpires)
    - Pre-save hook: hash password with bcrypt (12 rounds) if modified
    - Instance method: `comparePassword(candidatePassword)` using bcrypt.compare
    - Indexes: email (unique), googleId
    - _Requirements: 1.3, 2.1_

  - [x] 2.2 Create Product model with text search index and all catalog fields
    - Create `server/src/models/Product.js` with all fields from design (name, slug, description, price, compareAtPrice, category enum, images, sizes, colors, stock, isFeatured, isActive, averageRating, numReviews, material, dimensions, weight, careInstructions)
    - Indexes: slug (unique), category, isFeatured, price, text search on name+description
    - _Requirements: 4.1, 14.1_

  - [x] 2.3 Create Order, Review, Coupon, Wishlist, Newsletter, and ContactMessage models
    - Create `server/src/models/Order.js` with all fields (user, orderNumber, items, shippingAddress, paymentMethod, paymentResult, subtotal, discount, shippingCost, total, couponCode, status enum, statusHistory, isPaid, paidAt, isDelivered, deliveredAt)
    - Create `server/src/models/Review.js` with unique compound index on user+product
    - Create `server/src/models/Coupon.js` with code (unique, uppercase), discountType enum, discountValue, minOrderAmount, maxDiscount, usageLimit, usedCount, expiresAt, isActive
    - Create `server/src/models/Wishlist.js` with user (unique) and products array
    - Create `server/src/models/Newsletter.js` with email (unique) and isSubscribed
    - Create `server/src/models/ContactMessage.js` with name, email, phone, subject, message, isRead
    - _Requirements: 8.4, 8.5, 11.1, 12.1, 13.1, 16.1, 17.1_

- [x] 3. Authentication middleware and utility functions
  - [x] 3.1 Create JWT auth middleware and role-based authorization middleware
    - Create `server/src/middleware/auth.js` with `authenticate` (verify JWT from Authorization header, attach user to req) and `authorize(...roles)` (check req.user.role, return 403 if not allowed)
    - _Requirements: 15.1, 15.2, 15.3_

  - [x] 3.2 Create validation middleware using express-validator
    - Create `server/src/middleware/validate.js` — runs validation chain, returns 400 with field-level errors if invalid
    - _Requirements: 1.5, 17.2_

  - [x] 3.3 Create file upload middleware with Multer and Cloudinary
    - Create `server/src/middleware/upload.js` — Multer memory storage, file filter for jpeg/png/webp only, 5MB limit
    - _Requirements: 14.2_

  - [x] 3.4 Create utility modules: AppError, JWT helpers, email service, order number generator, PDF invoice generator
    - Create `server/src/utils/jwt.js` — signToken(userId, role) with 7-day expiry
    - Create `server/src/utils/email.js` — sendOrderConfirmationEmail, sendOrderStatusEmail, sendPasswordResetEmail using Nodemailer
    - Create `server/src/utils/generateOrderNumber.js` — generates ZIM-XXXXXX format with uniqueness check
    - Create `server/src/utils/generateInvoice.js` — PDFKit-based invoice with company details, items table, totals, payment info
    - _Requirements: 1.1, 8.4, 9.7, 11.5, 18.1_

- [x] 4. Checkpoint — Verify backend infrastructure
  - Ensure all models compile, middleware exports correctly, and utility functions are wired. Ask the user if questions arise.

- [x] 5. Auth routes and controllers
  - [x] 5.1 Implement registration endpoint (POST /api/auth/register)
    - Create `server/src/services/authService.js` with `registerUser(name, email, password)` — check duplicate email (409), hash password, create User, return JWT + sanitized user
    - Create `server/src/controllers/authController.js` register handler
    - Create `server/src/routes/authRoutes.js` with POST /register and validation rules (name required, email valid, password min 6)
    - _Requirements: 1.1, 1.2, 1.3, 1.5_

  - [x] 5.2 Implement login endpoint (POST /api/auth/login)
    - Add `authenticateUser(email, password)` to authService — find user, compare password, return JWT + sanitized user, generic "Invalid credentials" on failure
    - Add login handler to authController and POST /login route
    - _Requirements: 2.1, 2.2_

  - [x] 5.3 Implement Google OAuth endpoints (GET /api/auth/google, GET /api/auth/google/callback)
    - Wire Passport Google strategy in auth routes — redirect to consent screen, handle callback, findOrCreate user, link Google ID to existing email account, return JWT
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 5.4 Implement forgot password (POST /api/auth/forgot-password) and reset password (POST /api/auth/reset-password/:token) endpoints
    - Generate crypto.randomBytes(32) token, store hashed token + 1hr expiry on User, send reset email
    - Reset: validate token, update password, clear reset fields
    - _Requirements: 2.1_

  - [x] 5.5 Implement get profile (GET /api/auth/me) and update profile (PUT /api/auth/me) endpoints
    - Protected routes using authenticate middleware — return/update user data (name, phone, addresses)
    - _Requirements: 15.1_

  - [ ]* 5.6 Write property tests for authentication
    - **Property 1: Authentication Round-Trip** — register then login produces valid JWT with userId/role, user object has no password field
    - **Property 2: Password Storage Security** — stored password is bcrypt hash, bcrypt.compare with original returns true
    - **Property 3: Invalid Registration Rejection** — empty name, invalid email, or short password returns 400 with no User created
    - **Validates: Requirements 1.1, 1.3, 1.5, 2.1**

- [x] 6. Product routes and controllers
  - [x] 6.1 Implement product listing with filtering, sorting, and pagination (GET /api/products)
    - Create `server/src/services/productService.js` with `getProducts(filters)` — build query (isActive:true, category, price range, text search), sort mapping (price-asc, price-desc, newest, rating, popular), pagination with skip/limit (default 12, max 50), return products + pagination metadata
    - Create `server/src/controllers/productController.js` getProducts handler
    - Create `server/src/routes/productRoutes.js`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [x] 6.2 Implement featured products (GET /api/products/featured) and product by slug (GET /api/products/:slug)
    - getFeaturedProducts — query isFeatured:true, isActive:true
    - getProductBySlug — find by slug, return full product document
    - _Requirements: 5.1_

  - [x] 6.3 Implement admin product CRUD (POST, PUT /api/products/:id, DELETE /api/products/:id)
    - Create: generate slug from name, validate required fields, store product
    - Update: update fields, regenerate slug if name changed
    - Delete: soft delete — set isActive to false
    - All protected with authenticate + authorize('admin')
    - _Requirements: 14.1, 14.3, 14.4_

  - [ ]* 6.4 Write property tests for product catalog
    - **Property 4: Product Filter Correctness** — all returned products are active and match every applied filter
    - **Property 5: Product Sort Correctness** — returned products are ordered by selected sort field/direction
    - **Property 6: Pagination Integrity** — pages === ceil(total/limit), products.length <= limit, page >= 1
    - **Property 26: URL-Safe Slug Generation** — slug contains only lowercase alphanumeric and hyphens, no leading/trailing hyphens
    - **Property 27: Soft Delete Preservation** — deleted product still exists with isActive:false
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.5, 4.6, 14.1, 14.3**

- [x] 7. Order routes and controllers (Razorpay + COD)
  - [x] 7.1 Implement Razorpay order creation (POST /api/orders/razorpay/create)
    - Create `server/src/services/orderService.js` with `createRazorpayOrder(userId, cartItems, shippingAddress, couponCode)` — validate stock, calculate totals server-side (ignore client prices), apply coupon, free shipping >= ₹999 else ₹99, create Razorpay order (amount in paise), create pending Order document, do NOT decrement stock
    - Create `server/src/controllers/orderController.js` and `server/src/routes/orderRoutes.js`
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

  - [x] 7.2 Implement Razorpay payment verification (POST /api/orders/razorpay/verify)
    - `verifyRazorpayPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature)` — HMAC-SHA256 signature verification with timing-safe comparison, update order to confirmed/isPaid, decrement stock, increment coupon usedCount, send confirmation email
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

  - [x] 7.3 Implement COD order creation (POST /api/orders/cod)
    - `createCODOrder` — same validation and total calculation as Razorpay, create Order with paymentMethod "cod" and status "confirmed"
    - _Requirements: 10.1, 10.2_

  - [x] 7.4 Implement order queries: my orders (GET /api/orders/my-orders), order by ID (GET /api/orders/:id), all orders admin (GET /api/orders), and invoice download (GET /api/orders/:id/invoice)
    - My orders: filtered by req.user, sorted by createdAt desc
    - Order by ID: verify ownership or admin
    - Invoice: generate PDF, restrict to order owner or admin
    - _Requirements: 18.1, 18.2_

  - [x] 7.5 Implement admin order status update (PUT /api/orders/:id/status)
    - Enforce valid status transitions (pending→confirmed/cancelled, confirmed→processing/cancelled, processing→shipped/cancelled, shipped→delivered, delivered/cancelled are terminal)
    - Append to statusHistory, set isDelivered/deliveredAt on delivered, send status email
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

  - [ ]* 7.6 Write property tests for orders and payments
    - **Property 12: Server-Side Price Authority** — totals computed from DB prices, client prices ignored
    - **Property 13: Free Shipping Threshold** — subtotal >= 999 → shipping 0, else 99
    - **Property 14: Razorpay Amount Conversion** — amount === Math.round(total * 100), receipt matches ZIM-XXXXXX
    - **Property 15: Stock Unchanged at Order Creation** — stock unchanged after order creation before payment
    - **Property 16: Order Validation is Payment-Method Agnostic** — same totals for Razorpay and COD
    - **Property 17: Payment Signature Verification** — valid HMAC passes, invalid returns 400 with no mutations
    - **Property 18: Stock Decrement After Payment** — each product stock decreases by ordered quantity
    - **Property 19: Coupon Usage Increment** — coupon usedCount increases by exactly 1 after verified payment
    - **Property 20: Order State Machine** — only valid transitions allowed, delivered/cancelled are terminal
    - **Property 21: Status History Append-Only Growth** — statusHistory grows by exactly 1 entry per transition
    - **Validates: Requirements 8.2, 8.3, 8.4, 8.6, 9.1, 9.4, 9.5, 9.6, 10.2, 11.1, 11.4**

- [x] 8. Coupon, review, wishlist, newsletter, contact, and upload routes
  - [x] 8.1 Implement coupon validation endpoint (POST /api/coupons/validate) and admin CRUD (GET, POST, PUT, DELETE /api/coupons)
    - Create `server/src/services/couponService.js` with `applyCoupon(code, subtotal)` — validate active/not expired/usage limit/min order, calculate discount (percentage capped by maxDiscount, or fixed), discount <= subtotal, round to 2 decimals
    - Admin CRUD protected with authorize('admin')
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_

  - [x] 8.2 Implement review endpoints (GET /api/reviews/:productId, POST /api/reviews, DELETE /api/reviews/:id)
    - Enforce unique user+product constraint, validate rating 1-5, recalculate product averageRating and numReviews on create/delete
    - _Requirements: 13.1, 13.2, 13.3_

  - [x] 8.3 Implement wishlist endpoints (GET /api/wishlist, PUT /api/wishlist, DELETE /api/wishlist/:productId)
    - GET: return user's wishlist products
    - PUT: replace wishlist products array (for sync)
    - DELETE: remove single product from wishlist
    - All protected with authenticate
    - _Requirements: 7.2_

  - [x] 8.4 Implement newsletter (POST /api/newsletter/subscribe, GET /api/newsletter admin), contact (POST /api/contact, GET /api/contact admin, PUT /api/contact/:id/read), and upload (POST /api/upload) endpoints
    - Newsletter: create subscriber, handle duplicate email gracefully
    - Contact: create message with isRead:false, admin can list and mark read
    - Upload: Multer + Cloudinary upload, return URL and publicId
    - _Requirements: 16.1, 16.2, 17.1, 17.2, 14.2_

  - [ ]* 8.5 Write property tests for coupons and reviews
    - **Property 22: Coupon Discount Calculation** — percentage: min(subtotal*value/100, maxDiscount), fixed: discountValue, never exceeds subtotal, rounded to 2 decimals
    - **Property 23: Coupon Validation** — inactive/expired/over-limit coupons fail with 400, subtotal below min fails with 400
    - **Property 24: Review Uniqueness** — at most one review per user+product pair
    - **Property 25: Product Rating Consistency** — averageRating equals mean of all ratings, numReviews equals count
    - **Validates: Requirements 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 13.1, 13.3**

- [x] 9. Wire all routes into Express app and create seed data
  - Register all route modules in `server/src/app.js`
  - Create `server/src/seed/seedData.js` with sample products (5-8 bags across categories), admin user, sample coupons, and sample reviews
  - _Requirements: 4.1, 14.1_

- [ ] 10. Checkpoint — Verify complete backend API
  - Ensure all routes are registered, models are correct, middleware chain works. Ask the user if questions arise.

- [x] 11. Frontend project setup and design system
  - [x] 11.1 Install all frontend dependencies and configure Tailwind CSS
    - Install: react-router-dom, tailwindcss @tailwindcss/vite, framer-motion, zustand, @tanstack/react-query, axios, react-hook-form, @hookform/resolvers, zod, lucide-react, sonner, canvas-confetti, swiper
    - Configure Tailwind with custom colors (brand palette from design), fonts, and CSS variables in `client/src/index.css`
    - Update `client/vite.config.js` to add Tailwind plugin and API proxy for development
    - _Requirements: 19.5_

  - [x] 11.2 Create Zustand stores: authStore, cartStore, wishlistStore
    - `client/src/stores/authStore.js` — user, token, isAuthenticated, setAuth, logout (clear localStorage), updateUser
    - `client/src/stores/cartStore.js` — items, coupon, isDrawerOpen, addItem (increment existing or add new, cap at stock), removeItem, updateQuantity (remove if <= 0), applyCoupon, removeCoupon, clearCart, toggleDrawer, computed: totalItems, subtotal, discount, total. Persist to localStorage.
    - `client/src/stores/wishlistStore.js` — items, addItem, removeItem, isInWishlist, syncWithBackend (merge union on login), loadFromStorage
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 7.1, 7.3, 7.4_

  - [ ]* 11.3 Write property tests for Zustand stores
    - **Property 7: Cart Mutation Correctness** — add increments existing, zero/negative removes, exceeding stock caps, new item with qty<=0 is no-op
    - **Property 8: Cart Total Integrity** — subtotal === sum(price*qty), 0 <= discount <= subtotal, total === subtotal - discount + shipping
    - **Property 9: Cart Persistence Round-Trip** — localStorage state equals in-memory state after mutation
    - **Property 10: Wishlist Merge Produces Union** — merged result equals set union, no duplicates
    - **Property 11: Wishlist Uniqueness Invariant** — no duplicate product IDs after any operation
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 7.3, 7.4**

  - [x] 11.4 Create Axios instance with JWT interceptors and TanStack Query provider
    - `client/src/lib/axios.js` — baseURL from VITE_API_URL, request interceptor attaches Bearer token from authStore, response interceptor handles 401 (clear auth, redirect to /login)
    - Wrap App with QueryClientProvider, configure default staleTime
    - _Requirements: 2.4, 19.3_

  - [x] 11.5 Create React Router setup with all routes and lazy-loaded route components
    - `client/src/App.jsx` — React Router v6 with Layout wrapper, React.lazy for all page components, admin panel as separate chunk
    - Routes: /, /shop, /product/:slug, /cart, /wishlist, /checkout, /login, /register, /forgot-password, /reset-password/:token, /account, /account/orders, /account/orders/:id, /account/profile, /admin/*, /about, /contact, /policies/:slug, /order-confirmation/:id, /* (404)
    - _Requirements: 19.1_

- [x] 12. Layout and shared UI components
  - [x] 12.1 Create Layout component with Navbar, Footer, AnnouncementBar, MobileNav, and CartDrawer
    - `client/src/components/layout/Layout.jsx` — wraps Outlet with header, footer, cart drawer, scroll progress, WhatsApp float
    - `client/src/components/layout/Navbar.jsx` — logo, nav links, search, cart icon with badge, user menu, mobile hamburger
    - `client/src/components/layout/Footer.jsx` — brand info, links, social icons, copyright
    - `client/src/components/layout/AnnouncementBar.jsx` — rotating promo messages
    - `client/src/components/layout/MobileNav.jsx` — slide-out mobile navigation
    - `client/src/components/cart/CartDrawer.jsx` — slide-out cart panel with items, subtotal, checkout button
    - _Requirements: 19.5_

  - [x] 12.2 Create reusable UI components: Button, Input, Modal, Skeleton, Badge, Accordion, StarRating`
    - `client/src/components/ui/Button.jsx` — variants (primary, secondary, outline, ghost), sizes, loading state
    - `client/src/components/ui/Input.jsx` — label, error message, react-hook-form compatible
    - `client/src/components/ui/Modal.jsx` — overlay, close button, accessible focus trap
    - `client/src/components/ui/Skeleton.jsx` — shimmer loading placeholder
    - `client/src/components/ui/Badge.jsx` — status badges with color variants
    - `client/src/components/ui/Accordion.jsx` — expandable sections for FAQ
    - `client/src/components/ui/StarRating.jsx` — display and interactive star rating
    - _Requirements: 19.4, 19.5_

- [x] 13. Home page sections
  - [x] 13.1 Create HomePage with Hero section, FeaturedProducts, and USPBar
    - `client/src/pages/HomePage.jsx` — assembles all home sections
    - `client/src/components/home/HeroSection.jsx` — full-width hero with CTA, framer-motion entrance animation
    - `client/src/components/home/FeaturedProducts.jsx` — TanStack Query hook for featured products, ProductCard grid
    - `client/src/components/home/USPBar.jsx` — icons with value propositions (free shipping, quality, etc.)
    - `client/src/components/product/ProductCard.jsx` — image, name, price, wishlist toggle, add-to-cart
    - _Requirements: 5.2, 19.2, 19.4_

  - [x] 13.2 Create PerfectlySized, SeeItStyled, ReviewsCarousel, FAQ, and Newsletter sections
    - `client/src/components/home/PerfectlySized.jsx` — size comparison visual section
    - `client/src/components/home/SeeItStyled.jsx` — lifestyle imagery section
    - `client/src/components/home/ReviewsCarousel.jsx` — Swiper carousel of customer reviews
    - `client/src/components/home/FAQAccordion.jsx` — uses Accordion component
    - `client/src/components/home/Newsletter.jsx` — email subscription form, calls POST /api/newsletter/subscribe
    - _Requirements: 16.1, 19.5_

- [x] 14. Shop page with filtering, sorting, and pagination
  - [x] 14.1 Create ShopPage with FilterSidebar, ProductGrid, SortDropdown, and pagination
    - `client/src/pages/ShopPage.jsx` — manages filter/sort/page state via URL search params
    - `client/src/components/product/FilterSidebar.jsx` — category checkboxes, price range slider, mobile collapsible
    - `client/src/components/product/ProductGrid.jsx` — responsive grid of ProductCards with skeleton loading
    - `client/src/components/product/SortDropdown.jsx` — price-asc, price-desc, newest, rating, popular
    - `client/src/components/product/Pagination.jsx` — page navigation with prev/next and page numbers
    - TanStack Query hook `useProducts(filters)` with 5-min stale time
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 19.3, 19.4_

- [x] 15. Product detail page
  - [x] 15.1 Create ProductDetailPage with ImageGallery, ProductInfo, size/color selectors, and add-to-cart
    - `client/src/pages/ProductDetailPage.jsx` — fetches product by slug via TanStack Query
    - `client/src/components/product/ImageGallery.jsx` — main image + thumbnails, Swiper for mobile
    - `client/src/components/product/ProductInfo.jsx` — name, price (with compareAtPrice strikethrough), description, material, dimensions, size/color selectors, stock indicator, add-to-cart button (disabled when out of stock)
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 15.2 Create ReviewSection and RelatedProducts for product detail page
    - `client/src/components/product/ReviewSection.jsx` — list reviews, star rating display, review form (authenticated users only), one review per user per product
    - `client/src/components/product/RelatedProducts.jsx` — products from same category
    - _Requirements: 13.1, 13.2_

- [ ] 16. Checkpoint — Verify catalog browsing flow
  - Ensure home page, shop page, and product detail page render correctly with data from backend API. Ask the user if questions arise.

- [x] 17. Cart and wishlist pages
  - [x] 17.1 Create CartPage with CartItem list, CartSummary, and CouponInput
    - `client/src/pages/CartPage.jsx` — reads from cartStore, empty cart state
    - `client/src/components/cart/CartItem.jsx` — product image, name, size/color, quantity +/- controls, remove button, line total
    - `client/src/components/cart/CartSummary.jsx` — subtotal, discount, shipping, total, proceed to checkout button
    - `client/src/components/cart/CouponInput.jsx` — input + apply button, calls POST /api/coupons/validate, shows applied coupon with remove option
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 12.1_

  - [x] 17.2 Create WishlistPage
    - `client/src/pages/WishlistPage.jsx` — grid of wishlisted products with remove and add-to-cart actions, empty state, sync on login
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 18. Auth pages
  - [x] 18.1 Create Login, Register, ForgotPassword, and ResetPassword pages
    - `client/src/pages/auth/LoginPage.jsx` — email/password form with Zod validation, Google OAuth button, link to register/forgot password
    - `client/src/pages/auth/RegisterPage.jsx` — name/email/password form with Zod validation, Google OAuth button
    - `client/src=/pages/auth/ForgotPasswordPage.jsx` — email form, success message
    - `client/src/pages/auth/ResetPasswordPage.jsx` — new password form with token from URL
    - `client/src/schemas/authSchemas.js` — Zod schemas for all auth forms
    - All forms use react-hook-form with @hookform/resolvers/zod
    - _Requirements: 1.1, 1.4, 1.5, 2.1, 2.3, 3.1_

- [x] 19. Checkout page with 3-step flow
  - [x] 19.1 Create CheckoutPage with ShippingStep, PaymentStep, and ConfirmationStep
    - `client/src/pages/CheckoutPage.jsx` — step indicator (Shipping → Payment → Confirmation), protected route
    - `client/src/components/checkout/ShippingForm.jsx` — address form with Zod validation (Indian phone regex, 6-digit pincode), saved addresses selection
    - `client/src/components/checkout/PaymentStep.jsx` — Razorpay and COD options, order summary, Razorpay checkout modal integration
    - `client/src/components/checkout/ConfirmationStep.jsx` — order success with confetti animation, order details, continue shopping CTA
    - `client/src/schemas/checkoutSchemas.js` — Zod schema for shipping address
    - _Requirements: 8.1, 8.2, 8.3, 9.3, 10.1_

- [x] 20. Account pages
  - [x] 20.1 Create account Dashboard, Orders list, OrderDetail, and Profile pages
    - `client/src/pages/account/AccountDashboard.jsx` — overview with recent orders, profile summary
    - `client/src/pages/account/OrdersPage.jsx` — list of user's orders with status badges, pagination
    - `client/src/pages/account/OrderDetailPage.jsx` — full order details, status timeline, invoice download button
    - `client/src/pages/account/ProfilePage.jsx` — edit name, phone, manage addresses
    - All protected routes requiring authentication
    - _Requirements: 18.1, 18.2_

- [x] 21. Admin panel
  - [x] 21.1 Create AdminLayout with sidebar navigation and admin Dashboard
    - `client/src/components/admin/AdminLayout.jsx` — sidebar with nav links (Dashboard, Products, Orders, Customers, Coupons), protected with admin role check
    - `client/src/pages/admin/AdminDashboard.jsx` — stats cards (total orders, revenue, customers, products), recent orders table
    - _Requirements: 14.4, 15.3_

  - [x] 21.2 Create admin Products management page
    - `client/src/pages/admin/AdminProducts.jsx` — products table with search, add/edit product modal/form with image upload (Cloudinary), delete (soft delete) confirmation
    - _Requirements: 14.1, 14.2, 14.3, 14.4_

  - [x] 21.3 Create admin Orders, Customers, and Coupons management pages
    - `client/src/pages/admin/AdminOrders.jsx` — orders table with status filter, status update dropdown, order detail view
    - `client/src/pages/admin/AdminCustomers.jsx` — customers table with search
    - `client/src/pages/admin/AdminCoupons.jsx` — coupons table, create/edit coupon form with all fields (code, type, value, min order, max discount, usage limit, expiry)
    - _Requirements: 11.1, 11.2, 12.1_

- [x] 22. Static pages and micro-interactions
  - [x] 22.1 Create About, Contact, PolicyPage, and NotFound pages
    - `client/src/pages/AboutPage.jsx` — brand story, values, team
    - `client/src/pages/ContactPage.jsx` — contact form (react-hook-form + Zod), calls POST /api/contact
    - `client/src/pages/PolicyPage.jsx` — dynamic policy content based on route slug (shipping, returns, privacy, terms)
    - `client/src/pages/NotFoundPage.jsx` — 404 with illustration and back-to-home CTA
    - _Requirements: 17.1, 17.2_

  - [x] 22.2 Create micro-interaction components: ScrollProgressBar, CursorTrailer, WhatsAppFloat, and page transitions
    - `client/src/components/shared/ScrollProgressBar.jsx` — fixed top progress bar on scroll
    - `client/src/components/shared/CursorTrailer.jsx` — subtle cursor follow effect (desktop only)
    - `client/src/components/shared/WhatsAppFloat.jsx` — floating WhatsApp chat button
    - Add framer-motion AnimatePresence page transitions in App.jsx
    - _Requirements: 19.1, 19.5_

- [ ] 23. Checkpoint — Verify frontend auth middleware and role-based access
  - [ ]* 23.1 Write property tests for auth middleware and access control
    - **Property 28: Role-Based Access Control** — customer role on admin endpoint returns 403, admin role is allowed
    - **Property 29: JWT Middleware Correctness** — valid JWT attaches user, expired/malformed/missing returns 401
    - **Property 30: Invoice Access Control** — only order owner or admin gets access, others get 403
    - **Property 31: Error Handler Response Format** — operational errors return correct status+message, non-operational return 500 "Internal server error"
    - **Validates: Requirements 14.4, 15.1, 15.2, 15.3, 18.2, 21.1, 21.2**
  - Ensure all pages render, protected routes redirect unauthenticated users, admin panel is restricted to admin role. Ask the user if questions arise.

- [ ] 24. Final checkpoint — Full integration verification
  - Ensure all tests pass, all routes work end-to-end, cart→checkout→payment flow is complete, admin CRUD operations function correctly. Ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Backend tasks (1–10) come first since the frontend depends on the API
- Each task references specific requirements for traceability
- Checkpoints at tasks 4, 10, 16, 23, and 24 ensure incremental validation
- Property tests validate the 31 correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The design uses JavaScript throughout — all code examples use JS/JSX
