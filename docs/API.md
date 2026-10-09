# API Documentation ("Haat")

Base URL: `/api/v1`

## Response Format
- Success: `{ data, meta? }`
- Error: `{ error: { code, message, details? } }`

---

## Endpoints

### 1. Health Check
- **GET `/api/v1/health`**
- **Description**: Checks server status and time.
- **Example Response**:
  ```json
  {
    "data": {
      "status": "ok",
      "time": "2026-10-09T05:00:00.000Z"
    }
  }
  ```

### 2. Categories Tree
- **GET `/api/v1/categories`**
- **Description**: Returns tree of categories with product counts.
- **Example Response**:
  ```json
  {
    "data": [
      {
        "id": 1,
        "slug": "women-ethnic",
        "name": "Women Ethnic",
        "parent_id": null,
        "sort_order": 1,
        "product_count": 250,
        "children": [
          {
            "id": 2,
            "slug": "women-ethnic-kurtis",
            "name": "Kurtis",
            "parent_id": 1,
            "sort_order": 2,
            "product_count": 120
          }
        ]
      }
    ]
  }
  ```

### 3. Homepage Payload
- **GET `/api/v1/home`**
- **Description**: Single payload containing flash deals, top rated, big discounts, under ₹299 products, and category tree.
- **Example Response**:
  ```json
  {
    "data": {
      "flashDeals": [...],
      "topRated": [...],
      "bigDiscounts": [...],
      "under299": [...],
      "categories": [...]
    }
  }
  ```

### 4. Search & Filter Products
- **GET `/api/v1/products`**
- **Query Params**: `q`, `category`, `subcategory`, `brands`, `minPrice`, `maxPrice`, `minRating`, `minDiscount`, `inStock`, `cod`, `sort`, `page`, `limit` (max 48), `fields` (`full` | `lite`).
- **Example Response**:
  ```json
  {
    "data": [...],
    "meta": {
      "page": 1,
      "limit": 24,
      "total": 150,
      "totalPages": 7,
      "facets": {
        "brands": [{"name": "Brand A", "count": 45}],
        "price": {"min": 199, "max": 2499},
        "categories": [{"slug": "kurtis", "name": "Kurtis", "count": 120}]
      }
    }
  }
  ```

### 5. Product Suggestions
- **GET `/api/v1/products/suggest?q=saree`**
- **Query Params**: `q` (min 2 chars)
- **Example Response**:
  ```json
  {
    "data": [
      { "type": "category", "label": "Sarees", "slug": "sarees" },
      { "type": "product", "label": "Bandhani Silk Saree", "slug": "bandhani-silk-saree-meesho-123" }
    ]
  }
  ```

### 6. Product Detail
- **GET `/api/v1/products/:slug`**
- **Description**: Full product detail + breadcrumb + rating breakdown + 8 similar products.
- **Example Response**:
  ```json
  {
    "data": {
      "id": "MEESHO_123",
      "slug": "bandhani-silk-saree-meesho-123",
      "title": "Bandhani Silk Saree",
      "price": 599,
      "mrp": 1299,
      "breadcrumb": { "category": {...}, "subcategory": {...} },
      "ratingBreakdown": { "1": 2, "2": 5, "3": 12, "4": 45, "5": 120 },
      "similarProducts": [...]
    }
  }
  ```

### 7. Product Reviews
- **GET `/api/v1/products/:slug/reviews`**
- **Query Params**: `page`, `limit`, `sort` (`recent` | `helpful` | `rating_high` | `rating_low`).
- **Example Response**:
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "author_name": "Priya S.",
        "rating": 5,
        "title": "Great quality!",
        "body": "Fabric quality is very good for this price.",
        "is_seeded": true,
        "created_at": "2026-10-09T05:00:00.000Z"
      }
    ],
    "meta": { "page": 1, "limit": 10, "total": 25, "totalPages": 3 }
  }
  ```
