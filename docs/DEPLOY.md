# Deployment Guide: Magic by Meesho (Haat E-Commerce Platform)

This guide provides step-by-step instructions for deploying the Magic by Meesho platform from a fresh clone to production (Render for backend, Vercel for frontend, and Supabase for PostgreSQL & Auth).

---

## 1. Prerequisites
- **Git** installed locally.
- **Node.js** (v20+) and **npm** installed.
- A **Supabase** account (Free tier).
- A **Render** account (Free web service tier).
- A **Vercel** account (Free tier).

---

## 2. Repository Setup & Local Development
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd Ecom-Project
   ```
2. Install dependencies using npm workspaces (from the project root):
   ```bash
   npm install
   ```
3. Configure environment variables:
   - Copy `server/.env.example` to `server/.env` and fill in your Supabase credentials:
     ```env
     PORT=5000
     NODE_ENV=development
     SUPABASE_URL=https://your-project.supabase.co
     SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
     CLIENT_ORIGINS=http://localhost:5173
     ```
   - Copy `client/.env.example` to `client/.env` and configure:
     ```env
     VITE_SUPABASE_URL=https://your-project.supabase.co
     VITE_SUPABASE_ANON_KEY=your-anon-key
     VITE_API_URL=http://localhost:5000/api/v1
     VITE_TRY_REMOTE_IMAGES=false
     ```
4. Run locally:
   ```bash
   npm run dev
   ```

---

## 3. Supabase Setup
1. Create a new project in your Supabase Dashboard.
2. In **Authentication > Providers > Email**, ensure Email auth is enabled.
3. In the **SQL Editor**, execute the migration files in numerical order:
   - `supabase/migrations/001_extensions.sql`
   - `supabase/migrations/002_catalog.sql`
   - `supabase/migrations/003_users.sql`
   - `supabase/migrations/004_commerce.sql`
   - `supabase/migrations/005_rls.sql`
   - `supabase/migrations/006_search_fn.sql`
   - `supabase/migrations/007_reservations.sql`
4. Seed the database with the Meesho dataset:
   ```bash
   npm run db:seed
   ```

---

## 4. Render Deployment (Backend)
1. In Render Dashboard, click **New > Web Service** and connect your GitHub repository.
2. Configure settings:
   - **Name**: `magic-meesho-backend`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free
3. Add Environment Variables:
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
   - `SUPABASE_URL`: `<your-supabase-url>`
   - `SUPABASE_SERVICE_ROLE_KEY`: `<your-service-role-key>`
   - `CLIENT_ORIGINS`: `https://your-frontend.vercel.app`
4. Deploy and verify health endpoint: `https://your-backend.onrender.com/api/v1/health`.

---

## 5. Vercel Deployment (Frontend)
1. In Vercel Dashboard, click **Add New > Project** and import your repository.
2. Configure settings:
   - **Root Directory**: `client`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add Environment Variables:
   - `VITE_SUPABASE_URL`: `<your-supabase-url>`
   - `VITE_SUPABASE_ANON_KEY`: `<your-anon-key>`
   - `VITE_API_URL`: `https://your-backend.onrender.com/api/v1`
4. Deploy. Vercel automatically handles SPA rewrites for React Router.

---

## 6. Google API Configuration (If Applicable)
- If utilizing Google Maps or OAuth services:
  - Configure credentials in Google Cloud Console.
  - Store keys strictly in environment variables (`VITE_...` for public, server-side for private).
  - Apply HTTP referer or IP restrictions to API keys.

---

## 7. Post-Deployment Verification
- Test `GET /api/v1/health` -> `{ data: { status: "ok", ... } }`.
- Test product browsing, category filtering, sorting, and product detail loading.
- Test user sign-up, login, profile editing, and address book management.
- Test Add to Cart, Wishlist toggling, Buy Now, and Demo Checkout.

---

## 8. Troubleshooting
- **CORS Errors**: Verify `CLIENT_ORIGINS` on Render matches your exact Vercel frontend URL.
- **Supabase 500 Errors**: Ensure all migrations (`001` through `007`) are executed in order in Supabase.
- **Vercel Routing 404**: Ensure Root Directory is set to `client` and Vite build outputs correctly.

---

## 9. Redeployment & Rollbacks
- **Code Updates**: Push to `main` triggers automatic deployment on Render and Vercel.
- **Migrations**: Apply new SQL migrations directly in Supabase SQL Editor or via Supabase CLI.
- **Rollbacks**: Revert deployment versions via Render/Vercel dashboard or Git revert.

---

## 10. Final Checklist
- [x] Local installation & test suite (`npm test`) passed.
- [x] Supabase migrations & seeding executed.
- [ ] Render backend deployed & verified.
- [ ] Vercel frontend deployed & verified.
