"use client"
import { useState, useEffect, useMemo, useCallback } from "react"
import { Search, Filter, Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { ProductCard } from "@/components/ui/ProductCard"
import { EmptyState } from "@/components/ui/EmptyState"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"
import { getAllProducts } from "@/hooks/useContract"
import { getUploadedFile } from "@/utils/pinata"
import { useRouter } from "next/navigation"
import { useProductStore, Product } from "@/store/useProductStore"

type ContractProduct = {
  product_id: string | number
  product_owner: string
  ipfs_cid: string
}

const PAGE_SIZE = 9
const FETCH_ALL_LIMIT = 1000

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"mostReviews">("mostReviews")
  const [loadingIpfs, setLoadingIpfs] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const router = useRouter()

  // Zustand store
  const { 
    products, 
    setProducts, 
    isLoading: storeLoading,
    error: storeError,
    setIsLoading: setStoreLoading,
    setError: setStoreError,
    hasProducts,
    shouldRefetch
  } = useProductStore()

  // Fetch all products from contract
  const { 
    data: productsRaw = [], 
    isLoading: contractLoading, 
    isError, 
    error: fetchError 
  } = getAllProducts([FETCH_ALL_LIMIT, 0])

  // Fetch product details from IPFS and save to Zustand store
  useEffect(() => {
    let ignore = false

    async function fetchProducts() {
      // Skip if we have cached products and shouldn't refetch
      if (hasProducts() && !shouldRefetch()) {
        return
      }

      setLoadingIpfs(true)
      setStoreLoading(true)
      setStoreError(null)

      try {
        if (!productsRaw || !Array.isArray(productsRaw)) {
          setProducts([])
          setLoadingIpfs(false)
          setStoreLoading(false)
          return
        }

        // Remove default/empty product
        const filteredRaw: ContractProduct[] = productsRaw.filter(
          (p: any) =>
            p &&
            p.product_id &&
            Number(p.product_id) !== 0 &&
            p.ipfs_cid &&
            typeof p.ipfs_cid === "string" &&
            p.ipfs_cid.length > 0
        )

        // Fetch IPFS data for each product
        const productPromises = filteredRaw.map(async (p) => {
          let ipfsData: any = {}
          try {
            const url = await getUploadedFile(p.ipfs_cid)
            if (url) {
              const res = await fetch(url)
              if (res.ok) {
                ipfsData = await res.json()
              }
            }
          } catch (e) {
            ipfsData = {}
          }
          return {
            id: Number(p.product_id),
            name: ipfsData.name ?? "Unnamed Product",
            description: ipfsData.description ?? "No description available.",
            imageUrl: ipfsData.image ?? ipfsData.imageUrl ?? "https://placehold.co/400x300?text=No+Image",
            owner: p.product_owner ?? "",
            feedbackCount: ipfsData.feedbackCount ? Number(ipfsData.feedbackCount) : 0,
            createdAt: ipfsData.createdAt ?? new Date().toISOString(),
            category: ipfsData.category,
            website: ipfsData.website,
            tags: ipfsData.tags ?? []
          } as Product
        })

        const productsArr = await Promise.all(productPromises)
        // Sort by id descending (latest first)
        productsArr.sort((a, b) => b.id - a.id)
        
        if (!ignore) {
          // Save to Zustand store
          setProducts(productsArr)
        }
      } catch (err) {
        const errorMsg = "Failed to process product data."
        setStoreError(errorMsg)
      } finally {
        if (!ignore) {
          setLoadingIpfs(false)
          setStoreLoading(false)
        }
      }
    }

    fetchProducts()

    return () => {
      ignore = true
    }
  }, [productsRaw, hasProducts, shouldRefetch, setProducts, setStoreLoading, setStoreError])

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [products, searchTerm])

  const sortedProducts = useMemo(() => {
    let arr = [...filteredProducts].sort((a, b) => b.id - a.id)
    switch (sortBy) {
      case "mostReviews":
        arr = arr.sort((a, b) => {
          if (b.feedbackCount !== a.feedbackCount) {
            return b.feedbackCount - a.feedbackCount
          }
          return b.id - a.id
        })
        break
      default:
        break
    }
    return arr
  }, [filteredProducts, sortBy])

  // Pagination
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return sortedProducts.slice(start, start + PAGE_SIZE)
  }, [sortedProducts, currentPage])

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(sortedProducts.length / PAGE_SIZE))
  }, [sortedProducts.length])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1)
    }
  }, [totalPages, currentPage])

  const handlePrevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }, [])

  const handleNextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  }, [totalPages])

  // Error handling
  if (isError || storeError || fetchError) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <EmptyState
          icon="products"
          title="Error loading products"
          description="There was a problem fetching products from the blockchain. Please try again later."
          action={{
            label: "Retry",
            onClick: () => window.location.reload(),
          }}
        />
      </div>
    )
  }

  // Loading state
  if (contractLoading || loadingIpfs || storeLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  // No products
  if (products.length === 0 && !searchTerm) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <EmptyState
          icon="products"
          title="No products available"
          description="There are currently no products on the platform. Be the first to create one!"
          action={{
            label: "Create Product",
            onClick: () => router.push("/create-product"),
          }}
        />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white-900 mb-2">Products</h1>
        <p className="text-white-600">Discover and review innovative blockchain products and services</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as any)
                setCurrentPage(1)
              }}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
            >
              <option value="mostReviews">Most Reviews</option>
            </select>
          </div>

          <button 
            className="btn-primary flex items-center space-x-2 cursor-pointer" 
            onClick={() => router.push("/create-product")}
          >
            <Plus size={20} />
            <span>Create Product</span>
          </button>
        </div>
      </div>

      {/* Products Grid */}
      {paginatedProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {paginatedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="search"
          title="No products found"
          description="Try adjusting your search terms or create a new product."
          action={{
            label: "Create Product",
            onClick: () => router.push("/create-product"),
          }}
        />
      )}

      {/* Pagination */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-2 mt-16">
        {totalPages > 1 || (totalPages === 1 && sortedProducts.length > 0) ? (
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="px-2 py-1 rounded border border-gray-300 bg-white-100 text-gray-700 hover:bg-primary-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              aria-label="Previous page"
            >
              <ChevronLeft size={18} className="text-white" />
            </button>
            <span className="text-white-700 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="px-2 py-1 rounded border border-gray-300 bg-white-100 text-gray-700 hover:bg-primary-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              aria-label="Next page"
            >
              <ChevronRight size={18} className="text-white" />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}