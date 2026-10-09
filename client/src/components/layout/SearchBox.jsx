import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import { Search, Clock, X, Sparkles } from 'lucide-react'
import { apiClient } from '@/lib/apiClient.js'
import { storage } from '@/lib/storage.js'

export function SearchBox() {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [recentSearches, setRecentSearches] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const containerRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    storage.get('haat_recent_searches').then((saved) => {
      if (saved && Array.isArray(saved)) setRecentSearches(saved)
    })
  }, [])

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSuggestions([])
      return
    }

    const timer = setTimeout(async () => {
      try {
        const data = await apiClient(`/products/suggest?q=${encodeURIComponent(query.trim())}`)
        setSuggestions(data || [])
        setIsOpen(true)
      } catch {
        setSuggestions([])
      }
    }, 250)

    return () => clearTimeout(timer)
  }, [query])

  const saveRecentSearch = async (term) => {
    if (!term || term.trim().length < 2) return
    const updated = [term, ...recentSearches.filter((s) => s !== term)].slice(0, 6)
    setRecentSearches(updated)
    await storage.set('haat_recent_searches', updated)
  }

  const handleKeyDown = (e) => {
    if (!isOpen) return

    const totalItems = (query.length < 2 ? recentSearches : suggestions).length
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedIndex >= 0) {
        const list = query.length < 2 ? recentSearches : suggestions
        const item = list[selectedIndex]
        if (typeof item === 'string') {
          executeSearch(item)
        } else if (item?.slug) {
          setIsOpen(false)
          if (item.type === 'category') {
            navigate(`/c/${item.slug}`)
          } else {
            navigate(`/p/${item.slug}`)
          }
        }
      } else {
        executeSearch(query)
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  const executeSearch = (term) => {
    if (!term || !term.trim()) return
    setIsOpen(false)
    saveRecentSearch(term.trim())
    navigate(`/search?q=${encodeURIComponent(term.trim())}`)
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 w-4 h-4 text-ink-muted pointer-events-none" />
        <input
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls="search-suggestions"
          aria-autocomplete="list"
          placeholder="Search sarees, kurtis, electronics..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
            setSelectedIndex(-1)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full bg-paper border border-line rounded-full pl-10 pr-10 py-2 text-sm text-ink placeholder:text-ink-muted/65 focus:outline-none focus:ring-2 focus:ring-brand"
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(''); setSuggestions([]) }}
            className="absolute right-3 text-ink-muted hover:text-ink"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isOpen && (query.length < 2 ? recentSearches.length > 0 : suggestions.length > 0) && (
        <ul
          id="search-suggestions"
          role="listbox"
          className="absolute top-full left-0 right-0 mt-1.5 bg-card border border-line rounded-xl shadow-lg overflow-hidden z-50 max-h-80 overflow-y-auto"
        >
          {query.length < 2 ? (
            <>
              <li className="px-3.5 py-2 text-[11px] font-bold text-ink-muted uppercase tracking-wider bg-paper/50 flex items-center justify-between">
                <span>Recent Searches</span>
                <button
                  type="button"
                  onClick={async () => {
                    setRecentSearches([])
                    await storage.remove('haat_recent_searches')
                  }}
                  className="hover:text-ink lowercase text-xs"
                >
                  clear
                </button>
              </li>
              {recentSearches.map((term, index) => (
                <li
                  key={term}
                  role="option"
                  aria-selected={selectedIndex === index}
                  onClick={() => executeSearch(term)}
                  className={`px-4 py-2.5 text-xs flex items-center gap-2.5 cursor-pointer transition-colors ${
                    selectedIndex === index ? 'bg-brand-soft text-brand font-semibold' : 'text-ink hover:bg-line/30'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-ink-muted shrink-0" />
                  <span className="flex-1 truncate">{term}</span>
                </li>
              ))}
            </>
          ) : (
            <>
              <li className="px-3.5 py-2 text-[11px] font-bold text-ink-muted uppercase tracking-wider bg-paper/50">
                Suggestions
              </li>
              {suggestions.map((item, index) => (
                <li
                  key={`${item.type}-${item.slug}`}
                  role="option"
                  aria-selected={selectedIndex === index}
                  onClick={() => {
                    setIsOpen(false)
                    saveRecentSearch(item.label)
                    if (item.type === 'category') {
                      navigate(`/c/${item.slug}`)
                    } else if (item.type === 'brand') {
                      navigate(`/search?brands=${encodeURIComponent(item.label)}`)
                    } else {
                      navigate(`/p/${item.slug}`)
                    }
                  }}
                  className={`px-4 py-2.5 text-xs flex items-center justify-between cursor-pointer transition-colors ${
                    selectedIndex === index ? 'bg-brand-soft text-brand font-semibold' : 'text-ink hover:bg-line/30'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <Sparkles className="w-3.5 h-3.5 text-brand shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </span>
                  <span className="text-[10px] text-ink-muted uppercase bg-line/50 px-1.5 py-0.5 rounded">
                    {item.type}
                  </span>
                </li>
              ))}
            </>
          )}
        </ul>
      )}
    </div>
  )
}
