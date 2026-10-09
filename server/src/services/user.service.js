import { supabase } from '../config/supabase.js'
import { ApiError } from '../utils/ApiError.js'

function stripHtml(str) {
  return str ? str.replace(/<[^>]*>?/gm, '') : ''
}

export const userService = {
  async getProfile(userId) {
    let { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, phone, created_at')
      .eq('id', userId)
      .single()

    if (error || !data) {
      const { data: newProfile, error: insErr } = await supabase
        .from('profiles')
        .insert({ id: userId })
        .select('id, full_name, phone, created_at')
        .single()

      if (insErr) {
        throw new ApiError(500, insErr.message, 'DB_ERROR')
      }
      data = newProfile
    }

    return data
  },

  async updateProfile(userId, updates) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select('id, full_name, phone, created_at')
      .single()

    if (error) {
      throw new ApiError(500, error.message, 'DB_ERROR')
    }
    return data
  },

  async getAddresses(userId) {
    const { data, error } = await supabase
      .from('addresses')
      .select('id, user_id, name, phone, line1, line2, city, state, pincode, is_default, created_at')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })

    if (error) {
      throw new ApiError(500, error.message, 'DB_ERROR')
    }
    return data || []
  },

  async addAddress(userId, addressData) {
    const { count, error: countErr } = await supabase
      .from('addresses')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (countErr) {
      throw new ApiError(500, countErr.message, 'DB_ERROR')
    }

    if (count >= 5) {
      throw new ApiError(400, 'Maximum limit of 5 addresses reached', 'MAX_ADDRESSES_REACHED')
    }

    if (addressData.is_default) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', userId)
    } else if (count === 0) {
      addressData.is_default = true
    }

    const { data, error } = await supabase
      .from('addresses')
      .insert({ ...addressData, user_id: userId })
      .select('id, user_id, name, phone, line1, line2, city, state, pincode, is_default, created_at')
      .single()

    if (error) {
      throw new ApiError(500, error.message, 'DB_ERROR')
    }
    return data
  },

  async updateAddress(userId, addressId, updates) {
    const { data: existing } = await supabase
      .from('addresses')
      .select('id')
      .eq('id', addressId)
      .eq('user_id', userId)
      .single()

    if (!existing) {
      throw new ApiError(404, 'Address not found', 'NOT_FOUND')
    }

    if (updates.is_default) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', userId)
    }

    const { data, error } = await supabase
      .from('addresses')
      .update(updates)
      .eq('id', addressId)
      .eq('user_id', userId)
      .select('id, user_id, name, phone, line1, line2, city, state, pincode, is_default, created_at')
      .single()

    if (error) {
      throw new ApiError(500, error.message, 'DB_ERROR')
    }
    return data
  },

  async deleteAddress(userId, addressId) {
    const { data: existing } = await supabase
      .from('addresses')
      .select('id, is_default')
      .eq('id', addressId)
      .eq('user_id', userId)
      .single()

    if (!existing) {
      throw new ApiError(404, 'Address not found', 'NOT_FOUND')
    }

    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', addressId)
      .eq('user_id', userId)

    if (error) {
      throw new ApiError(500, error.message, 'DB_ERROR')
    }

    if (existing.is_default) {
      const { data: remaining } = await supabase
        .from('addresses')
        .select('id')
        .eq('user_id', userId)
        .limit(1)

      if (remaining && remaining.length > 0) {
        await supabase
          .from('addresses')
          .update({ is_default: true })
          .eq('id', remaining[0].id)
      }
    }

    return { success: true }
  },

  async getWishlist(userId) {
    const { data, error } = await supabase
      .from('wishlist')
      .select('product_id, created_at, products(id, slug, title, brand, price, mrp, discount_pct, rating, rating_count, stock_available, image_url)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new ApiError(500, error.message, 'DB_ERROR')
    }
    return (data || []).map((w) => ({
      product_id: w.product_id,
      created_at: w.created_at,
      product: w.products,
    }))
  },

  async addToWishlist(userId, productId) {
    const { data: prod } = await supabase
      .from('products')
      .select('id')
      .eq('id', productId)
      .single()

    if (!prod) {
      throw new ApiError(404, 'Product not found', 'NOT_FOUND')
    }

    const { error } = await supabase
      .from('wishlist')
      .upsert({ user_id: userId, product_id: productId }, { onConflict: 'user_id,product_id' })

    if (error) {
      throw new ApiError(500, error.message, 'DB_ERROR')
    }
    return { success: true }
  },

  async removeFromWishlist(userId, productId) {
    const { error } = await supabase
      .from('wishlist')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId)

    if (error) {
      throw new ApiError(500, error.message, 'DB_ERROR')
    }
    return { success: true }
  },

  async createReview(userId, userEmail, slug, reviewData) {
    const { data: prod } = await supabase
      .from('products')
      .select('id')
      .eq('slug', slug)
      .single()

    if (!prod) {
      throw new ApiError(404, 'Product not found', 'NOT_FOUND')
    }

    const { data: existingRev } = await supabase
      .from('reviews')
      .select('id')
      .eq('product_id', prod.id)
      .eq('user_id', userId)
      .single()

    if (existingRev) {
      throw new ApiError(400, 'You have already reviewed this product', 'ALREADY_REVIEWED')
    }

    const cleanTitle = stripHtml(reviewData.title)
    const cleanBody = stripHtml(reviewData.body)

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .single()

    const authorName = profile?.full_name || userEmail.split('@')[0] || 'Customer'

    const { data, error } = await supabase
      .from('reviews')
      .insert({
        product_id: prod.id,
        user_id: userId,
        author_name: authorName,
        rating: reviewData.rating,
        title: cleanTitle,
        body: cleanBody,
        is_seeded: false,
      })
      .select('id, product_id, author_name, rating, title, body, is_seeded, created_at')
      .single()

    if (error) {
      throw new ApiError(500, error.message, 'DB_ERROR')
    }

    const { data: allReviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('product_id', prod.id)

    if (allReviews && allReviews.length > 0) {
      const totalScore = allReviews.reduce((sum, r) => sum + r.rating, 0)
      const newRating = Number((totalScore / allReviews.length).toFixed(1))
      await supabase
        .from('products')
        .update({ rating: newRating, rating_count: allReviews.length })
        .eq('id', prod.id)
    }

    return data
  },
}
