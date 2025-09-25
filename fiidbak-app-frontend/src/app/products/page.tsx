"use client"
import { useState } from "react"
import { Search, Filter, Plus } from "lucide-react"
import { ProductCard } from "@/components/ui/ProductCard"
import { EmptyState } from "@/components/ui/EmptyState"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"

// Mock data - replace with actual data from contracts
const mockProducts = [
  {
    id: 1,
    name: "Decentralized Social Media Platform",
    description: "A blockchain-based social media platform with user ownership and data privacy.",
    imageUrl: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400",
    owner: "0x1234...5678",
    feedbackCount: 23,
    createdAt: "2024-01-15",
  },
  {
    id: 2,
    name: "NFT Marketplace",
    description: "Trade and discover unique digital assets in our secure marketplace.",
    imageUrl: "https://images.unsplash.com/photo-1639322537228-f912d0a4d3d8?w=400",
    owner: "0x8765...4321",
    feedbackCount: 45,
    createdAt: "2024-01-10",
  },
  {
    id: 3,
    name: "DeFi Yield Farming Protocol",
    description: "Earn rewards by providing liquidity to our decentralized finance protocol.",
    imageUrl: "https://images.unsplash.com/photo-1642790103337-344b9c2b4e6e?w=400",
    owner: "0xabcd...efgh",
    feedbackCount: 67,
    createdAt: "2024-01-05",
  },
  {
    id: 4,
    name: "Web3 Gaming Platform",
    description: "Play-to-earn gaming with NFT rewards and decentralized ownership.",
    imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400",
    owner: "0xefgh...ijkl",
    feedbackCount: 89,
    createdAt: "2024-01-01",
  },
  {
    id: 5,
    name: "Decentralized Exchange",
    description: "Trade cryptocurrencies with low fees and full custody of your assets.",
    imageUrl: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=400",
    owner: "0xijkl...mnop",
    feedbackCount: 156,
    createdAt: "2023-12-28",
  },
  {
    id: 6,
    name: "DAO Governance Tool",
    description: "Manage decentralized organizations with transparent voting and proposals.",
    imageUrl: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400",
    owner: "0xmnop...qrst",
    feedbackCount: 34,
    createdAt: "2023-12-25",
  },
]

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "mostReviews">("newest")
  const [isLoading] = useState(false)

  const filteredProducts = mockProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case "mostReviews":
        return b.feedbackCount - a.feedbackCount
      default:
        return 0
    }
  })

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
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
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="mostReviews">Most Reviews</option>
            </select>
          </div>

          <button className="btn-primary flex items-center space-x-2">
            <Plus size={20} />
            <span>Create Product</span>
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-white-600">
          Showing {sortedProducts.length} of {mockProducts.length} products
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
              /* Navigate to create product */
            },
          }}
        />
      )}

      {/* Load More */}
      {sortedProducts.length > 0 && (
        <div className="text-center mt-12">
          <button className="btn-outline">Load More Products</button>
        </div>
      )}
    </div>
  )
}
