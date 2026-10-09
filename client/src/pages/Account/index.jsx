import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '@/features/auth/AuthProvider.jsx'
import { apiClient } from '@/lib/apiClient.js'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Sheet } from '@/components/ui/sheet.jsx'
import { useToast } from '@/components/ui/toast.jsx'
import { User, MapPin, LogOut, Plus, Trash2, Edit2 } from 'lucide-react'

export function AccountPage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const { addToast } = useToast()

  const [profile, setProfile] = useState({ full_name: '', phone: '' })
  const [addresses, setAddresses] = useState([])
  const [isAddressSheetOpen, setIsAddressSheetOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
  const [addressForm, setAddressForm] = useState({
    name: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    is_default: false,
  })

  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const [profData, addrData] = await Promise.all([
        apiClient('/me'),
        apiClient('/me/addresses'),
      ])
      setProfile({ full_name: profData.full_name || '', phone: profData.phone || '' })
      setAddresses(addrData || [])
    } catch {
      // ignore
    }
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await apiClient('/me', { method: 'PATCH', body: profile })
      addToast({ title: 'Profile Updated', description: 'Your profile has been successfully updated.', variant: 'success' })
    } catch (err) {
      addToast({ title: 'Update Failed', description: err.message, variant: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveAddress = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      if (editingAddress) {
        await apiClient(`/me/addresses/${editingAddress.id}`, { method: 'PATCH', body: addressForm })
        addToast({ title: 'Address Updated', variant: 'success' })
      } else {
        await apiClient('/me/addresses', { method: 'POST', body: addressForm })
        addToast({ title: 'Address Added', variant: 'success' })
      }
      setIsAddressSheetOpen(false)
      setEditingAddress(null)
      fetchUserData()
    } catch (err) {
      addToast({ title: 'Failed to Save Address', description: err.message, variant: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAddress = async (id) => {
    try {
      await apiClient(`/me/addresses/${id}`, { method: 'DELETE' })
      addToast({ title: 'Address Deleted', variant: 'success' })
      fetchUserData()
    } catch (err) {
      addToast({ title: 'Delete Failed', description: err.message, variant: 'error' })
    }
  }

  const openAddAddress = () => {
    setEditingAddress(null)
    setAddressForm({
      name: profile.full_name || '',
      phone: profile.phone || '',
      line1: '',
      line2: '',
      city: '',
      state: '',
      pincode: '',
      is_default: addresses.length === 0,
    })
    setIsAddressSheetOpen(true)
  }

  const openEditAddress = (addr) => {
    setEditingAddress(addr)
    setAddressForm({
      name: addr.name,
      phone: addr.phone,
      line1: addr.line1,
      line2: addr.line2 || '',
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      is_default: addr.is_default,
    })
    setIsAddressSheetOpen(true)
  }

  const handleLogout = async () => {
    await signOut()
    navigate('/')
    addToast({ title: 'Logged Out', description: 'See you again soon!', variant: 'info' })
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-8">
      <div className="flex items-center justify-between bg-card p-6 rounded-[16px] border border-line">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-brand-soft text-brand flex items-center justify-center font-bold text-xl">
            {user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h1 className="text-xl font-bold font-display text-ink">{profile.full_name || 'My Account'}</h1>
            <p className="text-xs text-ink-muted">{user?.email}</p>
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={handleLogout} className="flex items-center gap-2">
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card p-6 rounded-[16px] border border-line space-y-4">
          <h2 className="text-base font-bold font-display text-ink flex items-center gap-2">
            <User className="w-4 h-4 text-brand" />
            <span>Personal Information</span>
          </h2>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <Input
              label="Full Name"
              value={profile.full_name}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              placeholder="Enter your full name"
            />
            <Input
              label="Phone Number (Indian Mobile)"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              placeholder="9876543210"
            />
            <Button type="submit" variant="primary" size="md" isLoading={isLoading}>
              Save Profile
            </Button>
          </form>
        </div>

        <div className="bg-card p-6 rounded-[16px] border border-line space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold font-display text-ink flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand" />
              <span>Saved Addresses ({addresses.length}/5)</span>
            </h2>
            {addresses.length < 5 && (
              <Button variant="secondary" size="sm" onClick={openAddAddress} className="flex items-center gap-1">
                <Plus className="w-4 h-4" />
                <span>Add New</span>
              </Button>
            )}
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto">
            {addresses.length === 0 ? (
              <p className="text-xs text-ink-muted py-4 text-center">No addresses saved yet.</p>
            ) : (
              addresses.map((addr) => (
                <div key={addr.id} className="p-3 bg-paper rounded-xl border border-line text-xs relative flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-ink">{addr.name}</span>
                      {addr.is_default && (
                        <span className="bg-brand-soft text-brand text-[10px] font-semibold px-2 py-0.5 rounded-full">Default</span>
                      )}
                    </div>
                    <p className="text-ink-muted">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}, {addr.city}, {addr.state} - {addr.pincode}</p>
                    <p className="text-ink-muted mt-0.5">Phone: {addr.phone}</p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => openEditAddress(addr)} className="text-ink-muted hover:text-ink">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onClick={() => handleDeleteAddress(addr.id)} className="text-chilli hover:opacity-80">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <Sheet isOpen={isAddressSheetOpen} onClose={() => setIsAddressSheetOpen(false)} title={editingAddress ? 'Edit Address' : 'Add New Address'}>
        <form onSubmit={handleSaveAddress} className="space-y-4">
          <Input
            label="Full Name"
            required
            value={addressForm.name}
            onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
          />
          <Input
            label="Phone Number"
            required
            value={addressForm.phone}
            onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
            placeholder="9876543210"
          />
          <Input
            label="Address Line 1 (Street, Area)"
            required
            value={addressForm.line1}
            onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })}
          />
          <Input
            label="Address Line 2 (Optional)"
            value={addressForm.line2 || ''}
            onChange={(e) => setAddressForm({ ...addressForm, line2: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="City"
              required
              value={addressForm.city}
              onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
            />
            <Input
              label="State"
              required
              value={addressForm.state}
              onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
            />
          </div>
          <Input
            label="6-Digit Pincode"
            required
            value={addressForm.pincode}
            onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
            placeholder="110001"
          />
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="is_default"
              checked={addressForm.is_default}
              onChange={(e) => setAddressForm({ ...addressForm, is_default: e.target.checked })}
              className="rounded border-line text-brand focus:ring-brand"
            />
            <label htmlFor="is_default" className="text-xs font-medium text-ink">Set as default address</label>
          </div>
          <Button type="submit" variant="primary" size="lg" className="w-full mt-4" isLoading={isLoading}>
            Save Address
          </Button>
        </form>
      </Sheet>
    </div>
  )
}
