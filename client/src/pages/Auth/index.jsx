import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { supabase } from '@/lib/supabase.js'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { useToast } from '@/components/ui/toast.jsx'
import { Eye, EyeOff, Sparkles, Mail } from 'lucide-react'

export function AuthPage() {
  const [tab, setTab] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isMagicLink, setIsMagicLink] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const nextUrl = searchParams.get('next') || '/account'
  const { addToast } = useToast()

  const handleAuth = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setIsLoading(true)

    try {
      if (isMagicLink) {
        const { error } = await supabase.auth.signInWithOtp({ email })
        if (error) throw error
        addToast({ title: 'Magic Link Sent!', description: 'Check your email for the login link.', variant: 'success' })
        setIsLoading(false)
        return
      }

      if (tab === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        addToast({ title: 'Welcome Back!', description: 'Successfully logged in.', variant: 'success' })
        navigate(nextUrl, { replace: true })
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        addToast({ title: 'Account Created!', description: 'Please check your email to confirm or log in.', variant: 'success' })
        navigate(nextUrl, { replace: true })
      }
    } catch (err) {
      let friendly = err.message
      if (friendly.includes('Invalid login credentials')) {
        friendly = 'Incorrect email or password. Please try again.'
      } else if (friendly.includes('User already registered')) {
        friendly = 'An account with this email already exists. Please log in.'
      }
      setErrorMsg(friendly)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-card border border-line rounded-[20px] overflow-hidden shadow-lg grid grid-cols-1 md:grid-cols-2">
        <div className="hidden md:flex flex-col justify-between p-8 bg-brand-soft border-r border-line relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-marigold/10 rounded-full blur-3xl pointer-events-none" />
          <div>
            <span className="text-3xl font-extrabold font-display text-brand">Magic</span>
            <span className="text-xs bg-brand text-white font-semibold px-2.5 py-0.5 rounded-[999px] ml-2">
              Magic by Meesho
            </span>
          </div>
          <div className="space-y-4 my-auto py-12">
            <div className="w-12 h-12 rounded-2xl bg-marigold/20 text-marigold flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold font-display text-ink leading-snug">
              Lakhs of products. Lowest prices.
            </h2>
            <p className="text-sm text-ink-muted">
              Value-focused shopping designed for everyone in Bharat. Fast, reliable, and delightful.
            </p>
          </div>
          <div className="text-xs text-ink-muted">
            © {new Date().getFullYear()} Magic by Meesho
          </div>
        </div>

        <div className="p-8 sm:p-10 flex flex-col justify-center">
          <div className="flex border-b border-line mb-6">
            <button
              type="button"
              onClick={() => { setTab('login'); setErrorMsg('') }}
              className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-colors ${
                tab === 'login' ? 'border-brand text-brand' : 'border-transparent text-ink-muted hover:text-ink'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setTab('signup'); setErrorMsg('') }}
              className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-colors ${
                tab === 'signup' ? 'border-brand text-brand' : 'border-transparent text-ink-muted hover:text-ink'
              }`}
            >
              Create Account
            </button>
          </div>

          <h3 className="text-xl font-bold font-display text-ink mb-2">
            {tab === 'login' ? 'Welcome back' : 'Join Magic today'}
          </h3>
          <p className="text-xs text-ink-muted mb-6">
            {tab === 'login' ? 'Enter your credentials to access your account' : 'Sign up to shop, track orders, and manage wishlist'}
          </p>

          {errorMsg && (
            <div className="mb-4 p-3 bg-chilli/10 border border-chilli/20 text-chilli text-xs rounded-xl">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="relative">
              <Input
                label="Email Address"
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Mail className="absolute right-3.5 top-9 w-4 h-4 text-ink-muted pointer-events-none" />
            </div>

            {!isMagicLink && (
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-9 text-ink-muted hover:text-ink"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            )}

            <div className="flex items-center justify-between text-xs pt-1">
              {tab === 'login' && (
                <button
                  type="button"
                  onClick={() => setIsMagicLink(!isMagicLink)}
                  className="text-brand hover:underline font-medium"
                >
                  {isMagicLink ? 'Use Password instead' : 'Sign in with Magic Link'}
                </button>
              )}
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full mt-2" isLoading={isLoading}>
              {isMagicLink ? 'Send Magic Link' : tab === 'login' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
