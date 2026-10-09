import React, { useState } from 'react'
import { Button, IconButton } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Select } from '@/components/ui/select.jsx'
import { Chip } from '@/components/ui/chip.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Price } from '@/components/ui/price.jsx'
import { Rating } from '@/components/ui/rating.jsx'
import { Skeleton } from '@/components/ui/skeleton.jsx'
import { EmptyState } from '@/components/ui/empty-state.jsx'
import { Spinner } from '@/components/ui/spinner.jsx'
import { Sheet } from '@/components/ui/sheet.jsx'
import { useToast } from '@/components/ui/toast.jsx'
import { ShoppingBag, Heart, Search, Sparkles } from 'lucide-react'

export function StyleguidePage() {
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [chipSelected, setChipSelected] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const { addToast } = useToast()

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-12">
      <div>
        <h1 className="text-3xl font-bold font-display text-ink mb-2">Haat Design System Styleguide</h1>
        <p className="text-ink-muted">Indian market, editorial, warm aesthetic primitives.</p>
      </div>

      {/* Buttons */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold font-display text-ink border-b border-line pb-2">Buttons & IconButtons</h2>
        <div className="flex flex-wrap gap-4 items-center">
          <Button variant="primary">Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="ghost">Ghost Button</Button>
          <Button variant="danger">Danger Button</Button>
          <Button variant="primary" isLoading>Loading</Button>
        </div>
        <div className="flex gap-4 items-center">
          <IconButton icon={ShoppingBag} label="Cart" variant="primary" />
          <IconButton icon={Heart} label="Wishlist" variant="secondary" />
          <IconButton icon={Search} label="Search" variant="ghost" />
        </div>
      </section>

      {/* Inputs & Selects */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold font-display text-ink border-b border-line pb-2">Inputs & Selects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Search Products"
            placeholder="Search sarees, kurtis..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <Select
            label="Sort By"
            options={[
              { value: 'popular', label: 'Most Popular' },
              { value: 'price-low', label: 'Price: Low to High' },
              { value: 'price-high', label: 'Price: High to Low' },
            ]}
          />
        </div>
      </section>

      {/* Chips & Badges */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold font-display text-ink border-b border-line pb-2">Chips & Badges</h2>
        <div className="flex flex-wrap gap-3">
          <Chip selected={chipSelected} onClick={() => setChipSelected(!chipSelected)}>
            {chipSelected ? 'Selected Chip' : 'Click to Toggle Chip'}
          </Chip>
          <Chip>Ethnic Wear</Chip>
          <Chip>Home Decor</Chip>
        </div>
        <div className="flex flex-wrap gap-3">
          <Badge variant="brand">Bestseller</Badge>
          <Badge variant="success">In Stock</Badge>
          <Badge variant="warning">Flash Deal</Badge>
          <Badge variant="chilli">Only 2 Left</Badge>
          <Badge variant="neutral">Standard</Badge>
        </div>
      </section>

      {/* Price & Rating */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold font-display text-ink border-b border-line pb-2">Price & Rating</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-card p-6 rounded-card border border-line">
          <div>
            <h3 className="text-xs font-semibold text-ink-muted mb-2">Price Component</h3>
            <Price price={499} mrp={999} size="lg" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-ink-muted mb-2">Rating Component</h3>
            <div className="flex gap-4 items-center">
              <Rating rating={4.6} count={1420} />
              <Rating rating={3.8} count={85} compact />
            </div>
          </div>
        </div>
      </section>

      {/* Spinners & Skeletons */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold font-display text-ink border-b border-line pb-2">Spinners & Skeletons</h2>
        <div className="flex items-center gap-6">
          <Spinner size="sm" />
          <Spinner size="md" />
          <Spinner size="lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton variant="card" />
          <div className="space-y-2">
            <Skeleton variant="text" width="100%" />
            <Skeleton variant="text" width="80%" />
            <Skeleton variant="text" width="60%" />
          </div>
          <Skeleton variant="block" height="150px" />
        </div>
      </section>

      {/* Empty State */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold font-display text-ink border-b border-line pb-2">Empty State</h2>
        <EmptyState
          icon={Sparkles}
          title="No Flash Deals Active"
          description="Check back at 6 PM for new mega discounts."
          actionLabel="Explore Catalog"
          onAction={() => addToast({ title: 'Navigated', description: 'Redirected to catalog', variant: 'info' })}
        />
      </section>

      {/* Sheet & Toasts */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold font-display text-ink border-b border-line pb-2">Sheet & Toasts</h2>
        <div className="flex flex-wrap gap-4">
          <Button onClick={() => setIsSheetOpen(true)}>Open Bottom Sheet</Button>
          <Button variant="secondary" onClick={() => addToast({ title: 'Success!', description: 'Item added to cart securely.', variant: 'success' })}>
            Trigger Success Toast
          </Button>
          <Button variant="danger" onClick={() => addToast({ title: 'Checkout Failed', description: 'Inventory reserved by another buyer.', variant: 'error' })}>
            Trigger Error Toast
          </Button>
        </div>
      </section>

      {/* Bottom Sheet Component */}
      <Sheet isOpen={isSheetOpen} onClose={() => setIsSheetOpen(false)} title="Filters & Sorting">
        <div className="space-y-4">
          <p className="text-sm text-ink-muted">This is an accessible, focus-trapped bottom sheet that closes with Esc or backdrop click.</p>
          <Button variant="primary" className="w-full" onClick={() => setIsSheetOpen(false)}>
            Apply Filters
          </Button>
        </div>
      </Sheet>
    </div>
  )
}
