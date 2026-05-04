# Requirements Document

## Introduction

This document defines the requirements for the Zimor India Ecommerce Platform — a full-stack web application for a women's premium workbag brand based in Varanasi, UP. The platform consists of a React + Vite SPA frontend and a Node.js + Express REST API backend with MongoDB, supporting product browsing, cart management, Razorpay/COD payments, user authentication, wishlists, reviews, and a full admin panel. Requirements are derived from the approved design document and follow EARS patterns with INCOSE quality standards.

## Glossary

- **Client**: The React + Vite single-page application running in the user's browser
- **Server**: The Node.js + Express REST API backend
- **Auth_Service**: The server-side authentication service handling registration, login, Google OAuth, and JWT issuance
- **Product_Service**: The server-side service managing product catalog queries, filtering, and CRUD operations
- **Order_Service**: The server-side service managing order creation, payment verification, and status transitions
- **Coupon_Service**: The server-side service managing coupon validation and discount calculation
- **Cart_Store**: The Zustand-based client-side cart state manager persisted to localStorage
- **Wishlist_Store**: The Zustand-based client-side wishlist state manager with backend sync for authenticated users
- **Auth_Store**: The Zustand-based client-side authentication state manager holding JWT token and user data
- **Admin_Panel**: The protected admin section of the Client for managing products, orders, customers, coupons, and reviews
- **Razorpay_Gateway**: The Razorpay payment integration for online payments in INR
- **Cloudinary_CDN**: The Cloudinary service used for image upload, storage, and optimized delivery
- **Email_Service**: The Nodemailer/Resend-based service for sending transactional emails
- **Validator**: The server-side input validation middleware using express-validator
- **Error_Handler**: The global Express error handling middleware

## Requirements

### Requirement 1: User Registration

**User Story:** As a new visitor, I want to register an account with my name, email, and password, so that I can access personalized features like wishlists and order history.

#### Acceptance Criteria

1. WHEN a visitor submits a valid registration form with name, email, and password, THE Auth_Service SHALL create a new User document with role "customer" and return a JWT token valid for 7 days along with the sanitized user object
2. WHEN a visitor submits a registration form with an email that already exists in the database, THE Auth_Service SHALL return a 409 Conflict error with the message "Email already registered"
3. THE Auth_Service SHALL store the password as a bcrypt hash with 12 salt rounds and exclude the password field from all API responses
4. WHEN registration succeeds, THE Client SHALL store the JWT token and user data in Auth_Store and redirect the user to the home page
5. WHEN a visitor submits a registration form with invalid data, THE Validator SHALL return a 400 error with specific field-level validation messages

### Requirement 2: User Login

**User Story:** As a registered user, I want to log in with my email and password, so that I can access my account and make purchases.

#### Acceptance Criteria

1. WHEN a user submits valid email and password credentials, THE Auth_Service SHALL verify the password against the stored bcrypt hash and return a JWT token valid for 7 days along with the sanitized user object
2. WHEN a user submits invalid credentials, THE Auth_Service SHALL return a 401 error with the message "Invalid credentials" without revealing whether the email or password was incorrect
3. WHEN login succeeds, THE Client SHALL store the JWT token and user data in Auth_Store
4. WHEN a JWT token expires or is malformed, THE Server SHALL return a 401 response and THE Client SHALL clear Auth_Store, clear localStorage, and redirect to the login page

### Requirement 3: Google OAuth Authentication

**User Story:** As a visitor, I want to sign in with my Google account, so that I can access the platform without creating a separate password.

#### Acceptance Criteria

1. WHEN a user initiates Google sign-in, THE Auth_Service SHALL redirect to Google OAuth 2.0 consent screen and handle the callback via Passport.js
2. WHEN Google OAuth callback succeeds, THE Auth_Service SHALL find or create a User document using the Google profile ID and return a JWT token
3. WHEN a Google OAuth user already has an account with the same email, THE Auth_Service SHALL link the Google ID to the existing account rather than creating a duplicate

### Requirement 4: Product Catalog Browsing

**User Story:** As a shopper, I want to browse products with filtering, sorting, and pagination, so that I can find the workbag that suits my needs.

#### Acceptance Criteria

1. THE Product_Service SHALL return only active products (isActive equals true) in all public catalog queries
2. WHEN a shopper applies category, price range, or text search filters, THE Product_Service SHALL return only products matching all specified filter criteria
3. WHEN a shopper selects a sort option, THE Product_Service SHALL sort results according to the selected option: price ascending, price descending, newest first, highest rating, or most popular
4. WHEN no sort option is specified, THE Product_Service SHALL sort results by newest first (createdAt descending)
5. THE Product_Service SHALL paginate all product listing responses with a configurable limit between 1 and 50, defaulting to 12, and include pagination metadata containing page number, limit, total count, and total pages
6. THE Product_Service SHALL calculate total pages as the ceiling of total count divided by limit

### Requirement 5: Product Detail Display

**User Story:** As a shopper, I want to view detailed product information including images, description, pricing, sizes, colors, and reviews, so that I can make an informed purchase decision.

#### Acceptance Criteria

1. WHEN a shopper navigates to a product detail page by slug, THE Product_Service SHALL return the complete product document including all images, sizes, colors, material, dimensions, weight, and care instructions
2. WHEN a product has a compareAtPrice greater than the current price, THE Client SHALL display both prices to indicate a discount
3. WHEN a product has zero stock, THE Client SHALL display an "Out of Stock" indicator and disable the add-to-cart action

### Requirement 6: Cart Management

**User Story:** As a shopper, I want to add, update, and remove items in my cart, so that I can manage my purchase before checkout.

#### Acceptance Criteria

1. WHEN a shopper adds a product to the cart with a specific size and color, THE Cart_Store SHALL add a new line item or increment the quantity of an existing item matching the same product ID, size, and color combination
2. WHEN a cart item quantity update results in a quantity less than or equal to zero, THE Cart_Store SHALL remove that item from the cart
3. WHEN a cart item quantity exceeds the product stock, THE Cart_Store SHALL cap the quantity at the available stock level
4. THE Cart_Store SHALL compute the subtotal as the sum of price multiplied by quantity for each item in the cart
5. THE Cart_Store SHALL compute the total as subtotal minus discount plus shipping cost, where discount is greater than or equal to zero and less than or equal to subtotal
6. WHEN the cart state changes, THE Cart_Store SHALL persist the updated cart to localStorage
7. WHEN a shopper adds a new item with quantity less than or equal to zero, THE Cart_Store SHALL not modify the cart

### Requirement 7: Wishlist Management

**User Story:** As a shopper, I want to save products to a wishlist, so that I can revisit them later for potential purchase.

#### Acceptance Criteria

1. WHILE a user is not authenticated, THE Wishlist_Store SHALL store wishlist product IDs in localStorage
2. WHILE a user is authenticated, THE Wishlist_Store SHALL sync with the backend API as the source of truth
3. WHEN an authenticated user logs in and has local wishlist items, THE Wishlist_Store SHALL merge local and backend wishlists by computing the union of both sets, push the merged list to the backend, and clear localStorage
4. THE Wishlist_Store SHALL maintain uniqueness of product IDs with no duplicates in the wishlist at any time

### Requirement 8: Razorpay Order Creation

**User Story:** As a shopper, I want to pay for my order using Razorpay, so that I can complete my purchase securely online.

#### Acceptance Criteria

1. WHEN a shopper initiates Razorpay checkout, THE Order_Service SHALL validate that all cart items reference active products with sufficient stock
2. THE Order_Service SHALL calculate subtotal, discount, shipping cost, and total exclusively from database product prices and coupon rules, ignoring any client-submitted price values
3. WHEN the subtotal is 999 or greater, THE Order_Service SHALL set shipping cost to zero; otherwise THE Order_Service SHALL set shipping cost to 99
4. THE Order_Service SHALL create a Razorpay order with the amount in paise (INR multiplied by 100) and a receipt in the format ZIM-XXXXXX
5. THE Order_Service SHALL create an Order document with status "pending" and a status history entry noting "Order created, awaiting payment"
6. THE Order_Service SHALL not decrement product stock at order creation time

### Requirement 9: Razorpay Payment Verification

**User Story:** As a shopper, I want my payment to be securely verified, so that my order is confirmed only after successful payment.

#### Acceptance Criteria

1. WHEN the Client submits payment verification data, THE Order_Service SHALL compute the expected signature as HMAC-SHA256 of the concatenation of razorpayOrderId, a pipe character, and razorpayPaymentId using the Razorpay key secret
2. THE Order_Service SHALL compare signatures using a timing-safe comparison to prevent timing attacks
3. WHEN the signature is valid, THE Order_Service SHALL update the order status to "confirmed", set isPaid to true, set paidAt to the current timestamp, and record the payment IDs
4. WHEN the signature is invalid, THE Order_Service SHALL return a 400 error and make no changes to the order document
5. WHEN payment is verified successfully, THE Order_Service SHALL decrement stock for each order item by the ordered quantity
6. WHEN payment is verified and a coupon was applied, THE Order_Service SHALL increment the coupon usedCount by exactly one
7. WHEN payment is verified successfully, THE Email_Service SHALL send an order confirmation email to the customer

### Requirement 10: Cash on Delivery Orders

**User Story:** As a shopper, I want to place an order with Cash on Delivery, so that I can pay when the product arrives.

#### Acceptance Criteria

1. WHEN a shopper selects COD payment, THE Order_Service SHALL create an Order document with paymentMethod "cod" and status "confirmed"
2. THE Order_Service SHALL validate stock availability and calculate totals server-side for COD orders using the same logic as Razorpay orders

### Requirement 11: Order Status Management

**User Story:** As an admin, I want to update order statuses, so that I can track and manage order fulfillment.

#### Acceptance Criteria

1. THE Order_Service SHALL enforce the following valid status transitions: pending to confirmed or cancelled, confirmed to processing or cancelled, processing to shipped or cancelled, shipped to delivered only, and no transitions from delivered or cancelled
2. WHEN an admin attempts an invalid status transition, THE Order_Service SHALL return a 400 error specifying the invalid transition
3. WHEN an order status is updated to "delivered", THE Order_Service SHALL set isDelivered to true and deliveredAt to the current timestamp
4. WHEN an order status changes, THE Order_Service SHALL append a new entry to the statusHistory array with the new status, timestamp, and optional note
5. WHEN an order status changes, THE Email_Service SHALL send a status update notification email to the customer

### Requirement 12: Coupon Application

**User Story:** As a shopper, I want to apply discount coupons to my order, so that I can save money on my purchase.

#### Acceptance Criteria

1. WHEN a shopper applies a coupon code, THE Coupon_Service SHALL validate that the coupon exists, is active, has not expired, and has not exceeded its usage limit
2. WHEN the order subtotal is less than the coupon minimum order amount, THE Coupon_Service SHALL return a 400 error specifying the minimum amount required
3. WHEN the coupon discount type is "percentage", THE Coupon_Service SHALL calculate the discount as subtotal multiplied by discountValue divided by 100, capped by maxDiscount if maxDiscount is defined
4. WHEN the coupon discount type is "fixed", THE Coupon_Service SHALL apply the discountValue directly as the discount amount
5. THE Coupon_Service SHALL ensure the discount never exceeds the subtotal
6. THE Coupon_Service SHALL round the discount to two decimal places

### Requirement 13: Review System

**User Story:** As a customer, I want to leave reviews on products I have purchased, so that I can share my experience with other shoppers.

#### Acceptance Criteria

1. THE Server SHALL enforce a unique constraint on the combination of user and product for reviews, allowing at most one review per user per product
2. WHEN a review is submitted, THE Server SHALL validate that the rating is an integer between 1 and 5 inclusive
3. WHEN a new review is created or deleted, THE Product_Service SHALL recalculate the product averageRating and numReviews fields

### Requirement 14: Admin Product Management

**User Story:** As an admin, I want to create, update, and delete products, so that I can manage the product catalog.

#### Acceptance Criteria

1. WHEN an admin creates a product, THE Product_Service SHALL generate a URL-safe slug from the product name and store the product with all required fields
2. WHEN an admin uploads product images, THE Server SHALL validate that each file is an image type (jpeg, png, or webp) and does not exceed 5MB, then upload to Cloudinary_CDN
3. WHEN an admin deletes a product, THE Product_Service SHALL set isActive to false rather than removing the document, preserving order history references
4. THE Server SHALL restrict all product creation, update, and delete endpoints to users with the "admin" role

### Requirement 15: Authentication and Authorization Middleware

**User Story:** As a platform operator, I want all API endpoints to be properly secured, so that only authorized users can access protected resources.

#### Acceptance Criteria

1. WHEN a request includes a valid JWT in the Authorization header, THE Server SHALL decode the token and attach the user data to the request object
2. WHEN a request includes an expired, malformed, or missing JWT for a protected endpoint, THE Server SHALL return a 401 Unauthorized response
3. WHEN a non-admin user attempts to access an admin-only endpoint, THE Server SHALL return a 403 Forbidden response
4. THE Server SHALL apply a general rate limit of 100 requests per 15-minute window to all API endpoints
5. THE Server SHALL apply a stricter rate limit of 20 requests per 15-minute window to authentication endpoints
6. WHEN a client exceeds the rate limit, THE Server SHALL return a 429 Too Many Requests response

### Requirement 16: Newsletter Subscription

**User Story:** As a visitor, I want to subscribe to the Zimor India newsletter, so that I can receive updates about new products and promotions.

#### Acceptance Criteria

1. WHEN a visitor submits a valid email for newsletter subscription, THE Server SHALL create a Newsletter document with isSubscribed set to true
2. WHEN a visitor submits an email that is already subscribed, THE Server SHALL return an appropriate message without creating a duplicate entry

### Requirement 17: Contact Form

**User Story:** As a visitor, I want to submit a contact message, so that I can reach the Zimor India team with questions or feedback.

#### Acceptance Criteria

1. WHEN a visitor submits a contact form with name, email, subject, and message, THE Server SHALL create a ContactMessage document with isRead set to false
2. WHEN required fields are missing from the contact form submission, THE Validator SHALL return a 400 error with specific field-level validation messages

### Requirement 18: Invoice Generation

**User Story:** As a customer, I want to download a PDF invoice for my order, so that I can keep a record of my purchase.

#### Acceptance Criteria

1. WHEN a customer requests an invoice for their order, THE Server SHALL generate a PDF document containing the company details, order number, date, shipping address, itemized list with quantities and prices, subtotal, discount, shipping cost, total, and payment information
2. THE Server SHALL restrict invoice access to the order owner or an admin user

### Requirement 19: Frontend Performance and User Experience

**User Story:** As a shopper, I want the platform to load quickly and provide smooth interactions, so that I can browse and shop without frustration.

#### Acceptance Criteria

1. THE Client SHALL use React.lazy and code splitting for all route-level components, loading the Admin_Panel as a separate chunk
2. THE Client SHALL use Cloudinary image transformations with automatic format and quality selection for responsive image delivery
3. THE Client SHALL cache product listing queries for 5 minutes using TanStack Query stale time configuration
4. THE Client SHALL display skeleton loaders during data fetching to prevent cumulative layout shift
5. THE Client SHALL implement a mobile-first responsive design across three breakpoints: mobile below 640px, tablet from 640px to 1024px, and desktop above 1024px

### Requirement 20: Security Hardening

**User Story:** As a platform operator, I want the application to follow security best practices, so that user data and transactions are protected.

#### Acceptance Criteria

1. THE Server SHALL use helmet middleware to set security headers including Content-Security-Policy and X-Frame-Options
2. THE Server SHALL configure CORS to accept requests only from the configured client origin
3. THE Server SHALL use hpp middleware to prevent HTTP parameter pollution
4. THE Server SHALL limit request body size to 10MB
5. THE Server SHALL use timing-safe comparison for all cryptographic signature verifications
6. THE Server SHALL store all secrets including JWT_SECRET, Razorpay keys, and Cloudinary credentials in environment variables, never in source code

### Requirement 21: Global Error Handling

**User Story:** As a developer, I want consistent error responses across all API endpoints, so that the Client can handle errors predictably.

#### Acceptance Criteria

1. WHEN an operational error occurs, THE Error_Handler SHALL return a JSON response with the error status code and message
2. WHEN a non-operational error occurs, THE Error_Handler SHALL return a 500 status with the message "Internal server error" and not expose internal details
3. WHILE the server is running in development mode, THE Error_Handler SHALL include the error stack trace in the response
4. WHILE the server is running in production mode, THE Error_Handler SHALL exclude the error stack trace from the response
