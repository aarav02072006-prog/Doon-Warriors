import { get, set, del } from 'idb-keyval'

export const storage = {
  async get(key) {
    try {
      return await get(key)
    } catch {
      return localStorage.getItem(key)
    }
  },
  async set(key, value) {
    try {
      await set(key, value)
    } catch {
      localStorage.setItem(key, JSON.stringify(value))
    }
  },
  async remove(key) {
    try {
      await del(key)
    } catch {
      localStorage.removeItem(key)
    }
  },
}
