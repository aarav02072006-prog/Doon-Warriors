# Operational Deployment Checklist: Magic by Meesho

## 1. Local Verification
- [ ] Run `npm install` at root.
- [ ] Run `npm run lint` (zero errors or warnings).
- [ ] Run `npm test` (all server tests pass).

## 2. Database Changes
- [ ] Verify Supabase migrations `001` through `007` applied successfully in order.
- [ ] Run `npm run db:seed` to verify dataset upserts and reviews generation.

## 3. Backend Deployment (Render)
- [ ] Root Directory set to `server`.
- [ ] Environment variables set (`PORT`, `NODE_ENV`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CLIENT_ORIGINS`).
- [ ] Health check `GET /api/v1/health` returns status `ok`.

## 4. Frontend Deployment (Vercel)
- [ ] Root Directory set to `client`.
- [ ] Environment variables set (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL`).
- [ ] Production build succeeds.

## 5. Smoke Tests
- [ ] Homepage loads with products and category images.
- [ ] Search, filtering, and sorting return correct results.
- [ ] Product detail pages load with reviews and schema.
- [ ] Cart management, Buy Now, and Demo Checkout function successfully.
- [ ] User authentication (sign up, login, account management) works.
