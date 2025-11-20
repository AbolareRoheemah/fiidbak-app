import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface Product {
  id: number
  name: string
  description: string
  imageUrl: string
  owner: string
  feedbackCount: number
  createdAt?: string
  category?: string
  website?: string
  tags?: string[]
  ipfsCid?: string
}

interface ProductStore {
  // State
  products: Product[]
  selectedProduct: Product | null
  isLoading: boolean
  error: string | null
  lastFetchTime: number | null

  // Actions
  setProducts: (products: Product[]) => void
  setSelectedProduct: (product: Product | null) => void
  setIsLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void

  // Computed
  getProductById: (id: number) => Product | undefined
  hasProducts: () => boolean
  shouldRefetch: () => boolean
}

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000

export const useProductStore = create<ProductStore>()(
  persist(
    (set, get) => ({
      // Initial state
      products: [],
      selectedProduct: null,
      isLoading: false,
      error: null,
      lastFetchTime: null,

      // Actions
      setProducts: (products) =>
        set({
          products,
          lastFetchTime: Date.now(),
          error: null,
        }),

      setSelectedProduct: (product) => set({ selectedProduct: product }),

      setIsLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      clearError: () => set({ error: null }),

      // Computed actions
      getProductById: (id) => {
        const { products } = get()
        return products.find((p) => p.id === id)
      },

      hasProducts: () => {
        const { products } = get()
        return products.length > 0
      },

      shouldRefetch: () => {
        const { lastFetchTime } = get()
        if (!lastFetchTime) return true
        return Date.now() - lastFetchTime > CACHE_DURATION
      },
    }),
    {
      name: "product-store", // persist to localStorage under this key
      partialize: (state) => ({
        products: state.products,
        lastFetchTime: state.lastFetchTime,
      }),
    }
  )
)