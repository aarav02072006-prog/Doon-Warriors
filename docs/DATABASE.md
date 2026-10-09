# Database Architecture & Seeding Guide

## 1. Overview
The database uses PostgreSQL (hosted on Supabase) with extensions (`pg_trgm`, `unaccent`), relational catalog tables, user profiles, addresses, wishlist, cart, orders, and a robust SQL search function (`search_products`) supporting full-text search (`tsvector`), trigram fuzzy matching for typos, dynamic faceting, sorting, and pagination.

## 2. Migrations
The migrations are located in `supabase/migrations/` and must be executed in numerical order:
1. `001_extensions.sql` — Enables `pg_trgm` and `unaccent` extensions in the `extensions` schema.
2. `002_catalog.sql` — Creates `categories`, `products` (with generated `search_vector` and GIN/B-tree indexes), and `reviews` tables.
3. `003_users.sql` — Creates `profiles` (with auto-create trigger on `auth.users`), `addresses`, and `wishlist` tables.
4. `004_commerce.sql` — Creates `carts`, `cart_items`, `orders`, and `order_items` tables.
5. `005_rls.sql` — Enables Row Level Security (RLS) on all tables with public SELECT policies on catalog/reviews and owner-only mutation policies.
6. `006_search_fn.sql` — Implements the `search_products` PL/pgSQL function with full-text search, trigram typo tolerance, faceting, sorting, and pagination.

### How to Apply Migrations:
- **Option A (Supabase SQL Editor)**: Copy and paste each migration script in order (`001` through `006`) into the Supabase SQL Editor and execute them.
- **Option B (Supabase CLI)**: If your project is linked to Supabase, run:
  ```bash
  supabase db push
  ```

## 3. Seeding the Dataset
The dataset seed script is located at `supabase/seed/import.mjs`. It automatically downloads `meesho_generated.csv` if missing, cleans the data (deduplication, title cleanup, stock derivation via seeded PRNG, category hierarchy creation), upserts products and categories, assigns flash deals, and generates realistic synthetic Indian-English reviews.

### How to Run Seed:
1. Ensure `server/.env` is configured with your Supabase credentials:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```
2. Run the seed command:
   ```bash
   npm run db:seed
   ```
