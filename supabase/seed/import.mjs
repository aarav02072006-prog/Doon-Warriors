import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { parse } from 'csv-parse/sync'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '../../')

dotenv.config({ path: path.join(rootDir, 'server/.env') })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in server/.env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
})

const csvPath = path.join(rootDir, 'data/meesho_generated.csv')

async function ensureCsvExists() {
  if (fs.existsSync(csvPath)) {
    console.info('📁 Found existing data/meesho_generated.csv')
    return
  }

  console.info('📥 Downloading meesho_generated.csv from GitHub...')
  const url = 'https://raw.githubusercontent.com/Neelx/meesho_dataset/main/meesho_generated.csv'
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Failed to download dataset: ${res.statusText}`)
  }
  const text = await res.text()
  fs.mkdirSync(path.dirname(csvPath), { recursive: true })
  fs.writeFileSync(csvPath, text, 'utf-8')
  console.info('✅ Downloaded data/meesho_generated.csv successfully')
}

function getSeededRandom(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  const x = Math.sin(Math.abs(hash)) * 10000
  return x - Math.floor(x)
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

function inferCategoryAndMaterial(title, description, rawCategory, rawMaterial) {
  const t = (title + ' ' + (description || '')).toLowerCase()

  let cat = rawCategory?.trim() || 'General'
  let subcat = 'Miscellaneous'
  let material = rawMaterial || 'Cotton Blend'

  if (t.includes('mobile cover') || t.includes('phone') || t.includes('charger') || t.includes('cable') || t.includes('earphone') || t.includes('smartwatch')) {
    cat = 'Electronics & Accessories'
    subcat = 'Mobile Accessories'
    material = 'Polycarbonate / Silicone'
  } else if (t.includes('shoe') || t.includes('sneaker') || t.includes('sandal') || t.includes('footwear')) {
    cat = 'Bags & Footwear'
    subcat = 'Footwear'
    material = 'Synthetic / Mesh'
  } else if (t.includes('kitchen') || t.includes('cookware') || t.includes('bottle') || t.includes('container') || t.includes('bedsheet') || t.includes('pillow') || t.includes('decor')) {
    cat = 'Home & Kitchen'
    subcat = t.includes('kitchen') ? 'Kitchenware' : 'Home Decor'
    material = t.includes('bedsheet') ? 'Cotton' : 'Stainless Steel / Plastic'
  } else if (t.includes('oil') || t.includes('cream') || t.includes('shampoo') || t.includes('lipstick') || t.includes('makeup') || t.includes('face')) {
    cat = 'Beauty & Personal Care'
    subcat = 'Skin & Hair Care'
    material = 'Organic Formulation'
  } else if (t.includes('saree') || t.includes('kurti') || t.includes('suit') || t.includes('lehenga') || t.includes('ethnic')) {
    cat = 'Women Ethnic'
    subcat = t.includes('saree') ? 'Sarees' : 'Kurtis & Suits'
    material = 'Cotton Blend / Silk'
  } else if (t.includes('handbag') || t.includes('sling') || t.includes('backpack') || t.includes('bag')) {
    cat = 'Bags & Footwear'
    subcat = 'Bags & Wallets'
    material = 'PU Leather / Canvas'
  } else if (t.includes('book') || t.includes('novel') || t.includes('study')) {
    cat = 'Books & Stationery'
    subcat = 'Books'
    material = 'Paper'
  }

  return { cat, subcat, material }
}

const reviewTemplates = {
  clothing: [
    'Fabric quality is very good for this price.',
    'Material is soft and comfortable to wear daily.',
    'Color slightly differs from picture but nice overall.',
    'Stitching could be slightly better, but worth it.',
    'Fits perfectly and looks very elegant.',
    'Value for money product, highly recommend.',
  ],
  electronics: [
    'Battery backup is decent, works as expected.',
    'Build quality is sturdy and looks premium.',
    'Easy to use and setup. Good gadget.',
    'Sound/performance is good for the price.',
    'Very useful everyday accessory.',
  ],
  default: [
    'Good product, delivered on time.',
    'Value for money purchase, happy with quality.',
    'Exactly as shown in description.',
    'Decent quality, packaging was good.',
    'Satisfied with the purchase.',
  ],
}

const firstNames = ['Aarav', 'Priya', 'Rahul', 'Ananya', 'Vikram', 'Neha', 'Amit', 'Sneha', 'Rohit', 'Pooja', 'Karan', 'Divya']
const lastInitials = ['K.', 'S.', 'M.', 'P.', 'R.', 'G.', 'B.', 'V.', 'N.', 'D.']

async function main() {
  await ensureCsvExists()

  const csvData = fs.readFileSync(csvPath, 'utf-8')
  const records = parse(csvData, {
    columns: true,
    skip_empty_lines: true,
  })

  console.info(`📊 Raw CSV rows loaded: ${records.length}`)

  const productMap = new Map()
  for (const row of records) {
    if (!productMap.has(row.product_id)) {
      productMap.set(row.product_id, row)
    }
  }

  const uniqueRows = Array.from(productMap.values())
  console.info(`✨ Deduplicated products: ${uniqueRows.length}`)

  // Pre-process and infer category/subcat for all rows first
  const processedRows = uniqueRows.map((row) => {
    let title = row.title ? row.title.replace(/\s+-\s+[^-]+$/, '').trim() : 'Untitled Product'
    const inferred = inferCategoryAndMaterial(title, row.description, row.category, row.material)
    return {
      ...row,
      cleanTitle: title,
      inferredCategory: inferred.cat,
      inferredSubcategory: inferred.subcat,
      inferredMaterial: inferred.material,
    }
  })

  const categoryNames = new Set()
  const subcategoryMap = new Map()

  for (const row of processedRows) {
    categoryNames.add(row.inferredCategory)
    if (!subcategoryMap.has(row.inferredCategory)) {
      subcategoryMap.set(row.inferredCategory, new Set())
    }
    subcategoryMap.get(row.inferredCategory).add(row.inferredSubcategory)
  }

  console.info('🗂️ Upserting categories...')
  const categoryIdMap = new Map()
  const subcategoryIdMap = new Map()

  let sortOrder = 1
  for (const catName of categoryNames) {
    const slug = slugify(catName)
    const { data, error } = await supabase
      .from('categories')
      .upsert({ slug, name: catName, parent_id: null, sort_order: sortOrder++ }, { onConflict: 'slug' })
      .select('id, name')
      .single()

    if (error) {
      console.error(`Error upserting category ${catName}:`, error.message)
      continue
    }

    categoryIdMap.set(catName, data.id)

    const subcats = subcategoryMap.get(catName) || []
    for (const subcatName of subcats) {
      const subSlug = `${slug}-${slugify(subcatName)}`
      const { data: subData, error: subError } = await supabase
        .from('categories')
        .upsert({ slug: subSlug, name: subcatName, parent_id: data.id, sort_order: sortOrder++ }, { onConflict: 'slug' })
        .select('id, name')
        .single()

      if (!subError && subData) {
        subcategoryIdMap.set(`${catName}|${subcatName}`, subData.id)
      }
    }
  }

  console.info(`✅ Upserted categories and subcategories`)

  const cleanedProducts = []
  for (const row of processedRows) {
    const id = row.product_id
    const title = row.cleanTitle
    const slug = `${slugify(title)}-${id.toLowerCase().replace(/[^a-z0-9]/g, '')}`

    const catId = categoryIdMap.get(row.inferredCategory) || null
    const subcatId = subcategoryIdMap.get(`${row.inferredCategory}|${row.inferredSubcategory}`) || null

    const price = parseInt(row.discounted_price || row.original_price || 100, 10)
    const mrp = parseInt(row.original_price || price * 1.2, 10)
    const discountPct = parseInt(row.discount_percentage || Math.max(0, Math.round(((mrp - price) / mrp) * 100)), 10)
    const rating = parseFloat(row.rating || 4.0)
    const ratingCount = parseInt(row.review_count || 10, 10)
    const colorsCount = parseInt(row.colors_available || 1, 10)

    let sizes = []
    if (row.sizes_available) {
      sizes = row.sizes_available.split(',').map((s) => s.trim()).filter(Boolean)
    }
    if (sizes.length === 0) sizes = ['Free Size']

    const material = row.inferredMaterial
    const codAvailable = row.cod_available ? row.cod_available.toString().toLowerCase() === 'true' : true
    
    let returnDays = 0
    const rp = (row.return_policy || '').toLowerCase()
    if (rp.includes('7')) returnDays = 7
    else if (rp.includes('15')) returnDays = 15
    else if (rp.includes('no') || rp.includes('0')) returnDays = 0
    else returnDays = 7

    let deliveryDays = 5
    const dt = (row.delivery_time || '').match(/\d+/)
    if (dt) deliveryDays = parseInt(dt[0], 10)

    const availability = row.availability || 'In Stock'
    const rand = getSeededRandom(id)
    let stockTotal = 50
    let stockAvailable = 30

    if (availability.includes('Out') || availability.includes('0')) {
      stockTotal = 0
      stockAvailable = 0
    } else if (availability.includes('Limited')) {
      stockAvailable = Math.floor(rand * 5) + 1
      stockTotal = stockAvailable + 10
    } else {
      stockAvailable = Math.floor(rand * 41) + 20
      stockTotal = stockAvailable + 20
    }

    cleanedProducts.push({
      id,
      slug,
      title,
      description: row.description || title,
      brand: row.brand || 'Generic',
      category_id: catId,
      subcategory_id: subcatId,
      price,
      mrp,
      discount_pct: discountPct,
      rating,
      rating_count: ratingCount,
      colors_count: colorsCount,
      sizes,
      material,
      cod_available: codAvailable,
      return_days: returnDays,
      delivery_days: deliveryDays,
      seller_name: row.seller_name || 'Reliable Seller',
      image_url: row.image_url || null,
      stock_total: stockTotal,
      stock_available: stockAvailable,
      is_flash_deal: false,
    })
  }

  console.info('📦 Upserting products in batches...')
  for (let i = 0; i < cleanedProducts.length; i += 200) {
    const batch = cleanedProducts.slice(i, i + 200)
    const { error } = await supabase.from('products').upsert(batch, { onConflict: 'id' })
    if (error) {
      console.error(`Error upserting products batch ${i}:`, error.message)
    }
  }

  console.info('⚡ Assigning Flash Deals...')
  const candidateDeals = cleanedProducts
    .filter((p) => p.stock_available >= 1 && p.stock_available <= 3)
    .sort((a, b) => b.discount_pct - a.discount_pct)
    .slice(0, 8)

  for (const deal of candidateDeals) {
    await supabase
      .from('products')
      .update({ is_flash_deal: true, stock_available: Math.min(3, Math.max(1, deal.stock_available)) })
      .eq('id', deal.id)
  }

  console.info('🧹 Cleaning up old seeded reviews...')
  await supabase.from('reviews').delete().eq('is_seeded', true)

  console.info('✍️ Generating seeded reviews...')
  const allReviews = []
  for (const p of cleanedProducts) {
    const reviewCountToGen = Math.min(p.rating_count, 6)
    const catLower = (p.title + ' ' + (p.description || '')).toLowerCase()
    const templates = catLower.includes('kurti') || catLower.includes('saree') || catLower.includes('shirt')
      ? reviewTemplates.clothing
      : catLower.includes('watch') || catLower.includes('headphone') || catLower.includes('cable')
      ? reviewTemplates.electronics
      : reviewTemplates.default

    for (let r = 0; r < reviewCountToGen; r++) {
      const author = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastInitials[Math.floor(Math.random() * lastInitials.length)]}`
      const ratingVal = Math.min(5, Math.max(1, Math.round(p.rating + (Math.random() * 1 - 0.5))))
      const comment = templates[Math.floor(Math.random() * templates.length)]

      allReviews.push({
        product_id: p.id,
        author_name: author,
        rating: ratingVal,
        title: ratingVal >= 4 ? 'Great quality!' : 'Decent product',
        body: comment,
        is_seeded: true,
      })
    }
  }

  for (let i = 0; i < allReviews.length; i += 300) {
    const batch = allReviews.slice(i, i + 300)
    const { error } = await supabase.from('reviews').insert(batch)
    if (error) {
      console.error('Error inserting reviews batch:', error.message)
    }
  }

  console.info('\n📊 === DATABASE SEED SUMMARY ===')
  console.info(`- Categories upserted`)
  console.info(`- Products imported: ${cleanedProducts.length}`)
  console.info(`- Flash deals marked: ${candidateDeals.length}`)
  console.info(`- Reviews generated: ${allReviews.length}`)
  console.info('================================\n')
}

main().catch((err) => {
  console.error('❌ Seeding failed:', err)
  process.exit(1)
})
