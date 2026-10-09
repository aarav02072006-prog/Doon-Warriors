# Security Documentation ("Haat")

## 1. Authentication Flow
- **Supabase Auth** is used for secure user management (Email/Password and Email Magic Link).
- Phone OTP is disabled to avoid paid SMS costs.
- Tokens are managed securely by `@supabase/supabase-js` on the client side (`persistSession: true`) and never stored manually in localStorage/cookies by custom code.

## 2. Token Verification & Middleware (`middleware/auth.js`)
- **`requireAuth`**: Extracts `Authorization: Bearer <access_token>`, hashes the token with SHA-256, and checks an in-memory token cache (60s TTL) to prevent redundant network calls to Supabase Auth on every request.
- Verifies the token using `supabase.auth.getUser(token)` with the service role key on the server.
- Attaches authenticated user info (`req.user = { id, email }`) to the request object.
- **`optionalAuth`**: Similar non-blocking variant that allows guest access while identifying authenticated users if a valid token is provided.

## 3. Row Level Security (RLS) & Service Layer Security
- **Database RLS**: Enabled on every table (`categories`, `products`, `reviews`, `profiles`, `addresses`, `wishlist`, `carts`, `cart_items`, `orders`, `order_items`). Public read access is restricted to catalog and reviews; user tables enforce `auth.uid() = user_id`.
- **Service Layering**: Every query in the server service layer explicitly filters by `req.user.id`. The server never trusts `user_id` supplied in request bodies or query parameters.

## 4. Input Validation & Sanitization
- All incoming inputs (`body`, `query`, `params`) are strictly validated using **Zod** schemas that strip unknown keys and enforce strict type rules (e.g., Indian mobile numbers `^[6-9]\d{9}$`, 6-digit pincodes, review character bounds).
- Review bodies and titles strip HTML tags to prevent XSS.

## 5. Rate Limiting & Proxy Trust
- **Global Limiter**: 300 requests per 15 minutes per IP.
- **Suggest Limiter**: 60 requests per minute for search autocomplete (`/products/suggest`).
- **Auth Limiter**: 20 requests per 15 minutes for sensitive user endpoints.
- **Trust Proxy**: `app.set('trust proxy', 1)` is configured correctly for Render proxy support to ensure accurate client IP rate limiting.

## 6. CORS, Headers & Error Handling
- **CORS**: Restricted strictly to allowed client origins from environment variables (`CLIENT_ORIGINS`). Wildcard `*` is not permitted.
- **Helmet**: Configured with a strict Content Security Policy (CSP) suited for API security.
- **Error Handling**: Production environments suppress stack traces and return clean, generic error messages for internal server errors (`500`).
