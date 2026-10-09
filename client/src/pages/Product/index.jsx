import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient.js'
import { ProductArt } from '@/components/ui/ProductArt.jsx'
import { Price } from '@/components/ui/price.jsx'
import { Rating } from '@/components/ui/rating.jsx'
import { Button, IconButton } from '@/components/ui/button.jsx'
import { Sheet } from '@/components/ui/sheet.jsx'
import { Input } from '@/components/ui/input.jsx'
import { useToast } from '@/components/ui/toast.jsx'
import { useAuth } from '@/features/auth/AuthProvider.jsx'
import { useCart } from '@/features/cart/CartProvider.jsx'
import { deliveryDate } from '@/lib/format.js'
import { ProductCard } from '@/components/ui/ProductCard.jsx'
import { Truck, ZoomIn, X, ChevronRight, Share2 } from 'lucide-react'

export function ProductPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addToCart } = useCart()
  const { addToast } = useToast()

  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  const [sizeError, setSizeError] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [pincode, setPincode] = useState('')
  const [pincodeChecked, setPincodeChecked] = useState(false)
  const [isZoomOpen, setIsZoomOpen] = useState(false)

  const [reviewSort, setReviewSort] = useState('recent')
  const [reviewPage, setReviewPage] = useState(1)
  const [isReviewSheetOpen, setIsReviewSheetOpen] = useState(false)
  const [newReview, setNewReview] = useState({ rating: 5, title: '', body: '' })

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => apiClient(`/products/${slug}`),
  })

  const { data: reviewsData, refetch: refetchReviews } = useQuery({
    queryKey: ['reviews', slug, reviewPage, reviewSort],
    queryFn: () => apiClient(`/products/${slug}/reviews?page=${reviewPage}&limit=5&sort=${reviewSort}`),
    enabled: Boolean(product),
  })

  useEffect(() => {
    window.scrollTo(0, 0)
    if (product?.sizes && product.sizes.length === 1) {
      setSelectedSize(product.sizes[0])
    }
  }, [slug, product])

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-8">
        <div className="w-full h-96 bg-line/40 rounded-2xl animate-pulse" />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold font-display text-ink">Product Not Found</h1>
        <p className="text-sm text-ink-muted">The product you are looking for might have been removed or is unavailable.</p>
        <Button variant="primary" onClick={() => navigate('/search')}>Browse Catalog</Button>
      </div>
    )
  }

  const {
    id,
    title,
    description,
    brand,
    price,
    mrp,
    discount_pct,
    rating,
    rating_count,
    sizes = [],
    material,
    cod_available,
    return_days,
    delivery_days,
    seller_name,
    stock_available,
    breadcrumb,
    ratingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    similarProducts = [],
    image_url,
  } = product

  const isOutOfStock = stock_available === 0
  const isLowStock = stock_available > 0 && stock_available <= 3

  const galleryVariations = [
    { label: 'Standard View', component: <ProductArt title={title} imageUrl={image_url} /> },
    { label: 'Angle View', component: <ProductArt title={title} imageUrl={image_url} /> },
    { label: 'Detail View', component: <ProductArt title={title} imageUrl={image_url} /> },
    { label: 'Brand View', component: <ProductArt title={title} imageUrl={image_url} /> },
  ]

  const handleShare = async () => {
    const shareData = {
      title: title,
      text: `Check out ${title} on Haat at lowest price!`,
      url: window.location.href,
    }
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData)
        return
      } catch {
        // fallback
      }
    }
    try {
      await navigator.clipboard?.writeText(window.location.href)
      addToast({ title: 'Link Copied to Clipboard!', variant: 'success' })
    } catch {
      addToast({ title: 'Unable to copy link', variant: 'error' })
    }
  }

  const handleAddToCart = (andCheckout = false) => {
    if (sizes.length > 0 && !selectedSize) {
      setSizeError(true)
      addToast({ title: 'Please select a size', variant: 'error' })
      return
    }
    setSizeError(false)

    if (andCheckout) {
      navigate('/checkout', { state: { buyNowItem: { product, qty: quantity, size: selectedSize || '' } } })
    } else {
      addToCart(product, quantity, selectedSize)
      addToast({
        title: 'Added to Cart!',
        description: `${title} (${selectedSize || 'Standard'}) added successfully.`,
        variant: 'success',
      })
    }
  }

  const handlePostReview = async (e) => {
    e.preventDefault()
    if (!user) {
      navigate(`/auth?next=${encodeURIComponent(window.location.pathname)}`)
      return
    }

    try {
      await apiClient(`/products/${slug}/reviews`, {
        method: 'POST',
        body: newReview,
      })
      addToast({ title: 'Review Posted!', description: 'Thank you for your feedback.', variant: 'success' })
      setIsReviewSheetOpen(false)
      setNewReview({ rating: 5, title: '', body: '' })
      refetchReviews()
    } catch (err) {
      addToast({ title: 'Failed to post review', description: err.message, variant: 'error' })
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-12">
      <title>{`${title} | haat.`}</title>
      <meta name="description" content={description || title} />
      <link rel="canonical" href={window.location.href} />
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org/',
          '@type': 'Product',
          name: title,
          image: image_url || 'https://haat.ecom/logo.png',
          description: description || title,
          brand: { '@type': 'Brand', name: brand },
          offers: {
            '@type': 'Offer',
            priceCurrency: 'INR',
            price: price,
            availability: stock_available > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: rating,
            reviewCount: rating_count,
          },
        })}
      </script>

      <nav aria-label="Breadcrumb" className="text-xs text-ink-muted flex items-center gap-1.5 flex-wrap">
        <Link to="/" className="hover:text-ink">Home</Link>
        {breadcrumb?.category && (
          <>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to={`/c/${breadcrumb.category.slug}`} className="hover:text-ink">{breadcrumb.category.name}</Link>
          </>
        )}
        {breadcrumb?.subcategory && (
          <>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to={`/c/${breadcrumb.category?.slug}/${breadcrumb.subcategory.slug}`} className="hover:text-ink">{breadcrumb.subcategory.name}</Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-ink truncate max-w-xs">{title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        <div className="lg:col-span-7 space-y-4 lg:sticky lg:top-24">
          <div className="relative bg-card border border-line rounded-[20px] overflow-hidden group">
            <div onClick={() => setIsZoomOpen(true)} className="cursor-zoom-in">
              {galleryVariations[activeImageIndex].component}
            </div>
            <button
              type="button"
              onClick={() => setIsZoomOpen(true)}
              className="absolute bottom-3 right-3 bg-card/90 backdrop-blur-xs border border-line p-2 rounded-xl text-ink shadow-sm hover:bg-card transition-colors"
              aria-label="Zoom image"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {galleryVariations.map((v, idx) => (
              <button
                key={v.label}
                type="button"
                onClick={() => setActiveImageIndex(idx)}
                className={`w-20 aspect-4/5 rounded-xl border overflow-hidden shrink-0 transition-all ${
                  activeImageIndex === idx ? 'border-brand ring-2 ring-brand/30' : 'border-line opacity-75 hover:opacity-100'
                }`}
              >
                <div className="scale-50 origin-top-left w-[200%] h-[200%] pointer-events-none">
                  {v.component}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Link to={`/search?brands=${encodeURIComponent(brand)}`} className="text-xs font-bold text-brand uppercase tracking-wider hover:underline">
                {brand}
              </Link>
              <IconButton icon={Share2} label="Share product" variant="ghost" size="sm" onClick={handleShare} />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-display text-ink leading-snug">{title}</h1>
            <div className="flex items-center gap-3 pt-1">
              <Rating rating={rating} count={rating_count} />
              <a href="#reviews-section" className="text-xs text-brand hover:underline font-semibold">
                See all {rating_count} reviews
              </a>
            </div>
          </div>

          <div className="bg-card border border-line p-4 rounded-2xl space-y-1 shadow-xs">
            <Price price={price} mrp={mrp} discount={discount_pct} size="lg" />
            <p className="text-[11px] text-ink-muted">Inclusive of all taxes</p>
          </div>

          <div>
            {isOutOfStock ? (
              <span className="inline-block bg-chilli/10 text-chilli font-bold text-xs px-3 py-1 rounded-full border border-chilli/20">
                Out of Stock
              </span>
            ) : isLowStock ? (
              <span className="inline-block bg-chilli/10 text-chilli font-bold text-xs px-3 py-1 rounded-full border border-chilli/20 animate-pulse">
                Only {stock_available} left — hurry!
              </span>
            ) : (
              <span className="inline-block bg-leaf/10 text-leaf font-bold text-xs px-3 py-1 rounded-full border border-leaf/20">
                In Stock & Ready to Ship
              </span>
            )}
          </div>

          {sizes.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-ink">Select Size</span>
                {sizeError && <span className="text-chilli font-semibold">Please select a size</span>}
              </div>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => { setSelectedSize(size); setSizeError(false) }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                      selectedSize === size
                        ? 'bg-brand text-white border-brand shadow-sm'
                        : 'bg-card text-ink border-line hover:border-brand/50'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!isOutOfStock && (
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold text-ink">Quantity</span>
              <div className="flex items-center border border-line rounded-xl bg-card">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-1.5 text-ink hover:bg-line/30 rounded-l-xl font-bold"
                >
                  -
                </button>
                <span className="px-4 text-xs font-bold text-ink">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(Math.min(10, stock_available), q + 1))}
                  className="px-3 py-1.5 text-ink hover:bg-line/30 rounded-r-xl font-bold"
                >
                  +
                </button>
              </div>
            </div>
          )}

          <div className="bg-card border border-line p-4 rounded-2xl space-y-3 text-xs">
            <div className="flex items-center gap-2 text-ink">
              <Truck className="w-4 h-4 text-brand" />
              <span className="font-semibold">{deliveryDate(delivery_days)}</span>
            </div>
            <div className="flex items-center gap-4 text-ink-muted">
              <span>{cod_available ? '✓ COD Available' : '✕ COD Unavailable'}</span>
              <span>•</span>
              <span>{return_days > 0 ? `${return_days}-Day Returns` : 'No Returns'}</span>
            </div>
            <div className="pt-2 border-t border-line flex gap-2">
              <input
                type="text"
                maxLength={6}
                placeholder="Enter 6-digit pincode"
                value={pincode}
                onChange={(e) => { setPincode(e.target.value); setPincodeChecked(false) }}
                className="flex-1 bg-paper border border-line rounded-xl px-3 py-2 text-xs"
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  if (pincode.length === 6) setPincodeChecked(true)
                  else addToast({ title: 'Enter valid 6-digit pincode', variant: 'error' })
                }}
              >
                Check
              </Button>
            </div>
            {pincodeChecked && (
              <p className="text-leaf font-semibold">Delivery available to {pincode}! Estimated delivery in {delivery_days} business days.</p>
            )}
          </div>

          <div className="hidden lg:flex gap-3 pt-2">
            <Button
              variant="secondary"
              size="lg"
              className="flex-1"
              disabled={isOutOfStock}
              onClick={() => handleAddToCart(false)}
            >
              Add to Cart
            </Button>
            <Button
              variant="primary"
              size="lg"
              className="flex-1"
              disabled={isOutOfStock}
              onClick={() => handleAddToCart(true)}
            >
              Buy Now
            </Button>
          </div>

          <div className="border-t border-line pt-4 space-y-2 text-xs text-ink-muted">
            <p><strong className="text-ink">Material:</strong> {material}</p>
            <p><strong className="text-ink">Sold by:</strong> {seller_name}</p>
            <p><strong className="text-ink">Product ID:</strong> {id}</p>
            <p className="leading-relaxed pt-2 text-ink">{description}</p>
          </div>
        </div>
      </div>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-line p-3 pb-[env(safe-area-inset-bottom)] flex gap-3 shadow-lg">
        <Button
          variant="secondary"
          size="md"
          className="flex-1"
          disabled={isOutOfStock}
          onClick={() => handleAddToCart(false)}
        >
          Add to Cart
        </Button>
        <Button
          variant="primary"
          size="md"
          className="flex-1"
          disabled={isOutOfStock}
          onClick={() => handleAddToCart(true)}
        >
          Buy Now
        </Button>
      </div>

      <section id="reviews-section" className="bg-card border border-line rounded-[20px] p-6 sm:p-8 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
          <div>
            <h2 className="text-xl font-bold font-display text-ink">Ratings & Reviews</h2>
            <p className="text-xs text-ink-muted">{rating_count} verified buyers</p>
          </div>
          <Button variant="primary" size="md" onClick={() => setIsReviewSheetOpen(true)}>
            Write a Review
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-4 flex flex-col items-center justify-center p-6 bg-paper rounded-2xl border border-line text-center">
            <span className="text-4xl font-extrabold font-display text-ink mb-1">{rating.toFixed(1)}</span>
            <Rating rating={rating} compact className="mb-2" />
            <span className="text-xs text-ink-muted">Based on {rating_count} reviews</span>
          </div>

          <div className="md:col-span-8 space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingBreakdown[star] || 0
              const pct = rating_count > 0 ? (count / rating_count) * 100 : 0
              return (
                <div key={star} className="flex items-center gap-3 text-xs">
                  <span className="w-8 font-semibold text-ink flex items-center gap-1">{star} ★</span>
                  <div className="flex-1 bg-line rounded-full h-2 overflow-hidden">
                    <div className="bg-marigold h-full rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-8 text-right text-ink-muted">{count}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-line">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-ink">Customer Feedback</h3>
            <select
              value={reviewSort}
              onChange={(e) => setReviewSort(e.target.value)}
              className="bg-paper border border-line rounded-xl px-3 py-1.5 text-xs text-ink"
            >
              <option value="recent">Most Recent</option>
              <option value="rating_high">Highest Rating</option>
              <option value="rating_low">Lowest Rating</option>
            </select>
          </div>

          <div className="space-y-4">
            {reviewsData?.data?.length === 0 ? (
              <p className="text-xs text-ink-muted py-4">No reviews yet. Be the first to review!</p>
            ) : (
              reviewsData?.data?.map((rev) => (
                <div key={rev.id} className="p-4 bg-paper rounded-2xl border border-line space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-ink">{rev.author_name}</span>
                    <Rating rating={rev.rating} compact />
                  </div>
                  <h4 className="text-xs font-bold text-ink">{rev.title}</h4>
                  <p className="text-xs text-ink-muted leading-relaxed">{rev.body}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {similarProducts.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold font-display text-ink">Similar Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {similarProducts.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {isZoomOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setIsZoomOpen(false)}
            className="absolute top-4 right-4 text-white bg-white/10 p-2 rounded-full hover:bg-white/25"
            aria-label="Close zoom"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-lg w-full bg-card rounded-2xl overflow-hidden p-6">
            {galleryVariations[activeImageIndex].component}
          </div>
        </div>
      )}

      <Sheet isOpen={isReviewSheetOpen} onClose={() => setIsReviewSheetOpen(false)} title="Write a Review">
        <form onSubmit={handlePostReview} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-ink-muted block mb-1.5">Rating (1 to 5 Stars)</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setNewReview({ ...newReview, rating: star })}
                  className={`p-2 rounded-lg border ${newReview.rating >= star ? 'bg-marigold/20 text-marigold border-marigold' : 'bg-paper text-ink-muted border-line'}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <Input
            label="Review Title (max 80 chars)"
            maxLength80
            required
            value={newReview.title}
            onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
            placeholder="Amazing quality, loved it!"
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-ink-muted">Review Details (10–1000 chars)</label>
            <textarea
              required
              minLength={10}
              maxLength={1000}
              rows={4}
              value={newReview.body}
              onChange={(e) => setNewReview({ ...newReview, body: e.target.value })}
              placeholder="Write detailed review about fit, fabric, and quality..."
              className="bg-card border border-line rounded-xl p-3 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
          <Button type="submit" variant="primary" size="lg" className="w-full mt-2">
            Submit Review
          </Button>
        </form>
      </Sheet>
    </div>
  )
}
