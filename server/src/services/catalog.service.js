import { supabase } from '../config/supabase.js'
import { ApiError } from '../utils/ApiError.js'
import { memoryCache } from '../utils/cache.js'

const PRODUCT_CARD_COLUMNS = 'id, slug, title, brand, price, mrp, discount_pct, rating, rating_count, stock_available, is_flash_deal, cod_available, delivery_days, image_url'

export const catalogService = {
  async getCategories() {
    const cacheKey = 'categories:tree'
    const cached = memoryCache.get(cacheKey)
    if (cached) return cached

    const { data: categories, error } = await supabase
      .from('categories')
      .select('id, slug, name, parent_id, sort_order')
      .order('sort_order', { ascending: true })

    if (error) {
      throw new ApiError(500, error.message, 'DB_ERROR')
    }

    const { data: prodCounts, error: countError } = await supabase
      .from('products')
      .select('category_id, subcategory_id, image_url')

    if (countError) {
      throw new ApiError(500, countError.message, 'DB_ERROR')
    }

    const catCountMap = new Map()
    const subcatCountMap = new Map()
    const catImageMap = new Map()
    const subcatImageMap = new Map()

    for (const p of prodCounts || []) {
      if (p.category_id) {
        catCountMap.set(p.category_id, (catCountMap.get(p.category_id) || 0) + 1)
        if (p.image_url && !catImageMap.has(p.category_id)) {
          catImageMap.set(p.category_id, p.image_url)
        }
      }
      if (p.subcategory_id) {
        subcatCountMap.set(p.subcategory_id, (subcatCountMap.get(p.subcategory_id) || 0) + 1)
        if (p.image_url && !subcatImageMap.has(p.subcategory_id)) {
          subcatImageMap.set(p.subcategory_id, p.image_url)
        }
      }
    }

    const topLevel = categories.filter((c) => !c.parent_id)
    const tree = topLevel.map((parent) => {
      const children = categories
        .filter((c) => c.parent_id === parent.id)
        .map((child) => ({
          ...child,
          product_count: subcatCountMap.get(child.id) || 0,
          image_url: subcatImageMap.get(child.id) || catImageMap.get(parent.id) || null,
        }))

      return {
        ...parent,
        product_count: (catCountMap.get(parent.id) || 0) + children.reduce((acc, c) => acc + c.product_count, 0),
        image_url: catImageMap.get(parent.id) || children.find(c => c.image_url)?.image_url || null,
        children,
      }
    })

    memoryCache.set(cacheKey, tree, 10 * 60 * 1000)
    return tree
  },

  async getHome() {
    const cacheKey = 'home:payload'
    const cached = memoryCache.get(cacheKey)
    if (cached) return cached

    const [flashRes, topRatedRes, bigDiscRes, under299Res, categories] = await Promise.all([
      supabase.from('products').select(PRODUCT_CARD_COLUMNS).eq('is_flash_deal', true).limit(8),
      supabase.from('products').select(PRODUCT_CARD_COLUMNS).order('rating', { ascending: false }).order('rating_count', { ascending: false }).limit(12),
      supabase.from('products').select(PRODUCT_CARD_COLUMNS).order('discount_pct', { ascending: false }).limit(12),
      supabase.from('products').select(PRODUCT_CARD_COLUMNS).lt('price', 299).order('rating', { ascending: false }).limit(12),
      this.getCategories(),
    ])

    const payload = {
      flashDeals: flashRes.data || [],
      topRated: topRatedRes.data || [],
      bigDiscounts: bigDiscRes.data || [],
      under299: under299Res.data || [],
      categories,
    }

    memoryCache.set(cacheKey, payload, 5 * 60 * 1000)
    return payload
  },

  async searchProducts(query) {
    const {
      q,
      category,
      subcategory,
      brands,
      minPrice,
      maxPrice,
      minRating,
      minDiscount,
      inStock,
      cod,
      sort,
      page = 1,
      limit = 24,
      fields = 'full',
    } = query

    const brandArray = brands ? brands.split(',').map((b) => b.trim()).filter(Boolean) : null

    const { data, error } = await supabase.rpc('search_products', {
      q: q || null,
      category_slug: category || null,
      subcategory_slug: subcategory || null,
      brands: brandArray,
      min_price: minPrice !== undefined ? Number(minPrice) : null,
      max_price: maxPrice !== undefined ? Number(maxPrice) : null,
      min_rating: minRating !== undefined ? Number(minRating) : null,
      min_discount: minDiscount !== undefined ? Number(minDiscount) : null,
      in_stock_only: Boolean(inStock),
      cod_only: Boolean(cod),
      sort: sort || 'popularity',
      page: Number(page),
      page_size: Number(limit),
    })

    if (error) {
      throw new ApiError(500, error.message, 'DB_ERROR')
    }

    let items = data.items || []
    const total = data.total || 0
    const facets = data.facets || { brands: [], price: { min: 0, max: 10000 }, categories: [] }

    if (fields === 'lite') {
      items = items.map((item) => ({
        id: item.id,
        slug: item.slug,
        title: item.title.length > 60 ? item.title.substring(0, 57) + '...' : item.title,
        price: item.price,
        mrp: item.mrp,
        discount_pct: item.discount_pct,
        rating: item.rating,
        stock_available: item.stock_available,
        image_url: item.image_url,
      }))
    }

    const pageNum = Number(page)
    const limitNum = Number(limit)
    const totalPages = Math.ceil(total / limitNum) || 1

    return {
      data: items,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        facets,
      },
    }
  },

  async getProductSuggest(q) {
    if (!q || q.trim().length < 2) return []
    const term = q.trim()
    const cacheKey = `suggest:${term.toLowerCase()}`
    const cached = memoryCache.get(cacheKey)
    if (cached) return cached

    const suggestions = []

    const { data: cats } = await supabase
      .from('categories')
      .select('name, slug')
      .ilike('name', `%${term}%`)
      .limit(3)

    for (const c of cats || []) {
      suggestions.push({ type: 'category', label: c.name, slug: c.slug })
    }

    const { data: brandsData } = await supabase
      .from('products')
      .select('brand')
      .ilike('brand', `%${term}%`)
      .limit(3)

    const uniqueBrands = [...new Set((brandsData || []).map((b) => b.brand))]
    for (const b of uniqueBrands) {
      if (b) suggestions.push({ type: 'brand', label: b, slug: `brand-${slugify(b)}` })
    }

    const { data: prods } = await supabase
      .from('products')
      .select('title, slug')
      .ilike('title', `%${term}%`)
      .limit(5)

    for (const p of prods || []) {
      suggestions.push({ type: 'product', label: p.title, slug: p.slug })
    }

    const limited = suggestions.slice(0, 8)
    memoryCache.set(cacheKey, limited, 60 * 1000)
    return limited
  },

  async getProductBySlug(slug) {
    const { data: product, error } = await supabase
      .from('products')
      .select('id, slug, title, description, brand, category_id, subcategory_id, price, mrp, discount_pct, rating, rating_count, colors_count, sizes, material, cod_available, return_days, delivery_days, seller_name, image_url, stock_total, stock_available, is_flash_deal, created_at')
      .eq('slug', slug)
      .single()

    if (error || !product) {
      throw new ApiError(404, 'Product not found', 'NOT_FOUND')
    }

    let category = null
    let subcategory = null
    if (product.category_id) {
      const { data: cat } = await supabase.from('categories').select('id, name, slug').eq('id', product.category_id).single()
      category = cat
    }
    if (product.subcategory_id) {
      const { data: subcat } = await supabase.from('categories').select('id, name, slug').eq('id', product.subcategory_id).single()
      subcategory = subcat
    }

    const { data: reviewsData } = await supabase
      .from('reviews')
      .select('rating')
      .eq('product_id', product.id)

    const ratingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    for (const r of reviewsData || []) {
      if (ratingBreakdown[r.rating] !== undefined) {
        ratingBreakdown[r.rating]++
      }
    }

    let similarQuery = supabase
      .from('products')
      .select(PRODUCT_CARD_COLUMNS)
      .neq('id', product.id)

    if (product.subcategory_id) {
      similarQuery = similarQuery.eq('subcategory_id', product.subcategory_id)
    } else if (product.category_id) {
      similarQuery = similarQuery.eq('category_id', product.category_id)
    }

    const { data: similarProducts } = await similarQuery
      .order('price', { ascending: true })
      .limit(8)

    return {
      ...product,
      breadcrumb: {
        category,
        subcategory,
      },
      ratingBreakdown,
      similarProducts: similarProducts || [],
    }
  },

  async getProductReviews(slug, query) {
    const { page = 1, limit = 10, sort = 'recent' } = query

    const { data: product, error: prodErr } = await supabase
      .from('products')
      .select('id')
      .eq('slug', slug)
      .single()

    if (prodErr || !product) {
      throw new ApiError(404, 'Product not found', 'NOT_FOUND')
    }

    let reviewQuery = supabase
      .from('reviews')
      .select('id, product_id, author_name, rating, title, body, is_seeded, created_at', { count: 'exact' })
      .eq('product_id', product.id)

    if (sort === 'rating_high') {
      reviewQuery = reviewQuery.order('rating', { ascending: false }).order('created_at', { ascending: false })
    } else if (sort === 'rating_low') {
      reviewQuery = reviewQuery.order('rating', { ascending: true }).order('created_at', { ascending: false })
    } else {
      reviewQuery = reviewQuery.order('created_at', { ascending: false })
    }

    const pageNum = Number(page)
    const limitNum = Number(limit)
    const from = (pageNum - 1) * limitNum
    const to = from + limitNum - 1

    const { data: reviews, count, error } = await reviewQuery.range(from, to)

    if (error) {
      throw new ApiError(500, error.message, 'DB_ERROR')
    }

    const total = count || 0
    const totalPages = Math.ceil(total / limitNum) || 1

    return {
      data: reviews || [],
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
      },
    }
  },
}

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
