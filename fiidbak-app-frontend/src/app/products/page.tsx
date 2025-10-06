"use client"
import { useState, useEffect, useMemo } from "react"
import { Search, Filter, Plus } from "lucide-react"
import { ProductCard } from "@/components/ui/ProductCard"
import { EmptyState } from "@/components/ui/EmptyState"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"
import { getAllProducts } from "@/hooks/useContract"
import { getUploadedFile } from "@/utils/pinata"
import { useRouter } from "next/navigation"

type Product = {
  id: number
  name: string
  description: string
  imageUrl: string
  owner: string
  feedbackCount: number
  // removed createdAt
}

type ContractProduct = {
  product_id: string | number
  product_owner: string
  ipfs_cid: string
}

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"mostReviews">("mostReviews")
  const [error, setError] = useState<string | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loadingIpfs, setLoadingIpfs] = useState(false)
  const router = useRouter()
  // Fetch products from contract
  const { data: productsRaw = [], isLoading, isError, error: fetchError } = getAllProducts()

  // Fetch product details from IPFS and transform to Product[]
  useEffect(() => {
    let ignore = false
    async function fetchProducts() {
      setLoadingIpfs(true)
      setError(null)
      try {
        if (!productsRaw || !Array.isArray(productsRaw)) {
          setProducts([])
          setLoadingIpfs(false)
          return
        }

        // Remove default/empty product (product_id 0 or empty ipfs_cid)
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
              // Try to fetch the JSON metadata from IPFS
              const res = await fetch(url)
              if (res.ok) {
                ipfsData = await res.json()
              }
            }
          } catch (e) {
            // If IPFS fetch fails, fallback to empty fields
            ipfsData = {}
          }
          return {
            id: Number(p.product_id),
            name: ipfsData.name ?? "Unnamed Product",
            description: ipfsData.description ?? "No description available.",
            imageUrl: ipfsData.image ?? ipfsData.imageUrl ?? "https://placehold.co/400x300?text=No+Image",
            owner: p.product_owner ?? "",
            feedbackCount: ipfsData.feedbackCount ? Number(ipfsData.feedbackCount) : 0,
            // removed createdAt
          } as Product
        })

        const productsArr = await Promise.all(productPromises)
        if (!ignore) setProducts(productsArr)
      } catch (err) {
        setError("Failed to process product data.")
        setProducts([])
      } finally {
        setLoadingIpfs(false)
      }
    }
    fetchProducts()
    return () => {
      ignore = true
    }
  }, [productsRaw])

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [products, searchTerm])

  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      // Only sort by mostReviews, since createdAt is removed
      switch (sortBy) {
        case "mostReviews":
          return b.feedbackCount - a.feedbackCount
        default:
          return 0
      }
    })
  }, [filteredProducts, sortBy])

  // Error handling for fetch
  if (isError || error || fetchError) {
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

  // Loading state (contract or IPFS)
  if (isLoading || loadingIpfs) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  // No products at all
  if (!products || products.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <EmptyState
          icon="products"
          title="No products available"
          description="There are currently no products on the platform. Be the first to create one!"
          action={{
            label: "Create Product",
            onClick: () => {
              router.push("/create-product")
            },
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
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Sort and Actions */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="mostReviews">Most Reviews</option>
            </select>
          </div>

          <button className="btn-primary flex items-center space-x-2" onClick={() => router.push("/create-product")}>
            <Plus size={20} />
            <span>Create Product</span>
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-white-600">
          Showing {sortedProducts.length} of {products.length} products
        </p>
      </div>

      {/* Products Grid */}
      {sortedProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedProducts.map((product) => (
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
            onClick: () => {
              router.push("/create-product")
            },
          }}
        />
      )}

      {/* Load More */}
      {sortedProducts.length > 0 && (
        <div className="text-center mt-12">
          <button className="btn-outline" disabled>
            Load More Products
          </button>
        </div>
      )}
    </div>
  )
}
