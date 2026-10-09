import React, { useState } from 'react'
import { Link } from 'react-router'
import { ProductArt } from './ProductArt.jsx'
import { Price } from './price.jsx'
import { Rating } from './rating.jsx'
import { IconButton } from './button.jsx'
import { Heart } from 'lucide-react'
import { apiClient } from '@/lib/apiClient.js'
import { useToast } from './toast.jsx'

export function ProductCard({ product }) {
  const {
    id,
    slug,
    title,
    brand,
    price,
    mrp,
    discount_pct,
    rating,
    rating_count,
    stock_available,
    is_flash_deal,
    cod_available,
    category_slug,
    image_url,
  } = product

  const [isWishlisted, setIsWishlisted] = useState(false)
  const { addToast } = useToast()

  const handleWishlistClick = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    const nextState = !isWishlisted
    setIsWishlisted(nextState)

    try {
      if (nextState) {
        await apiClient(`/me/wishlist/${id}`, { method: 'PUT' })
        addToast({ title: 'Added to Wishlist', variant: 'success' })
      } else {
        await apiClient(`/me/wishlist/${id}`, { method: 'DELETE' })
        addToast({ title: 'Removed from Wishlist', variant: 'info' })
      }
    } catch {
      setIsWishlisted(!nextState)
      addToast({ title: 'Please sign in to manage wishlist', variant: 'error' })
    }
  }

  const isOutOfStock = stock_available === 0
  const isLowStock = stock_available > 0 && stock_available <= 3

  return (
    <Link
      to={`/p/${slug}`}
      className={`group relative bg-card border border-line rounded-[14px] flex flex-col overflow-hidden transition-all duration-200 md:hover:-translate-y-0.5 md:hover:shadow-md ${
        isOutOfStock ? 'opacity-60' : ''
      }`}
    >
      <div className="relative">
        <ProductArt
          id={id}
          categorySlug={category_slug || 'general'}
          brand={brand}
          title={title}
          imageUrl={image_url}
        />

        <div className="absolute top-2 right-2 z-20">
          <IconButton
            icon={Heart}
            label="Save to Wishlist"
            variant="secondary"
            size="sm"
            onClick={handleWishlistClick}
            className={`bg-card/80 backdrop-blur-xs transition-colors ${
              isWishlisted ? '!text-chilli !bg-chilli/10' : 'text-ink hover:text-chilli'
            }`}
          />
        </div>

        {is_flash_deal && (
          <span className="absolute top-2 left-2 z-10 text-[11px] font-extrabold text-white bg-marigold px-2 py-0.5 rounded-full shadow-xs">
            ⚡ Flash Deal
          </span>
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs z-10 flex items-center justify-center">
            <span className="bg-card text-chilli font-bold text-xs px-3 py-1.5 rounded-full shadow-md">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className="p-3.5 flex flex-col flex-1 justify-between gap-2.5">
        <div>
          <h3 className="text-xs sm:text-sm font-medium text-ink line-clamp-2 leading-snug group-hover:text-brand transition-colors">
            {title}
          </h3>
        </div>

        <div className="space-y-2">
          <Price price={price} mrp={mrp} discount={discount_pct} size="sm" />

          <div className="flex items-center justify-between gap-1 pt-1 border-t border-line/60">
            <Rating rating={rating} count={rating_count} compact />

            <div className="flex items-center gap-1.5">
              {cod_available && (
                <span className="text-[10px] font-semibold text-ink-muted bg-line/50 px-1.5 py-0.5 rounded">
                  COD
                </span>
              )}
              {isLowStock && (
                <span className="text-[10px] font-bold text-chilli bg-chilli/10 px-1.5 py-0.5 rounded">
                  Only {stock_available} left
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
