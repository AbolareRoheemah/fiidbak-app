"use client"
import { useState } from "react"
import { useAccount } from "wagmi"
import { User, Trophy, MessageSquare, Package, TrendingUp, Settings } from "lucide-react"
import { BadgeDisplay } from "@/components/ui/BadgeDisplay"
import { ProductCard } from "@/components/ui/ProductCard"
import { FeedbackCard } from "@/components/ui/FeedbackCard"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"

// Mock data - replace with actual data from contracts
const mockUserStats = {
  badgeTier: 3,
  totalFeedback: 12,
  approvedFeedback: 8,
  totalProducts: 3,
  totalVotes: 45,
  reputation: 1250,
}

const mockUserProducts = [
  {
    id: 1,
    name: "My Awesome Product",
    description: "A revolutionary product that changes everything.",
    imageUrl: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400",
    owner: "0x1234...5678",
    feedbackCount: 15,
    createdAt: "2024-01-15",
  },
]

const mockUserFeedbacks = [
  {
    id: 1,
    content: "This is my feedback on a great product. I really enjoyed using it and would recommend it to others.",
    author: "0x1234...5678",
    authorTier: 3,
    productId: 1,
    positiveVotes: 8,
    negativeVotes: 1,
    totalVotes: 9,
    approved: true,
    createdAt: "2024-01-20",
    hasUserVoted: false,
    userVote: null,
  },
]

export default function ProfilePage() {
  const { address, isConnected } = useAccount()
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "feedback">("overview")
  const [isLoading] = useState(false)

  const formatAddress = (address: string) => {
    return `${address?.slice(0, 6)}...${address?.slice(-4)}`
  }

  const getNextTierInfo = () => {
    const { badgeTier } = mockUserStats
    switch (badgeTier) {
      case 1:
        return { next: "Wooden", needed: 5 - mockUserStats.approvedFeedback, current: mockUserStats.approvedFeedback }
      case 2:
        return { next: "Bronze", needed: 10 - mockUserStats.approvedFeedback, current: mockUserStats.approvedFeedback }
      case 3:
        return { next: "Silver", needed: 15 - mockUserStats.approvedFeedback, current: mockUserStats.approvedFeedback }
      case 4:
        return { next: "Gold", needed: 20 - mockUserStats.approvedFeedback, current: mockUserStats.approvedFeedback }
      default:
        return { next: "Wooden", needed: 5 - mockUserStats.approvedFeedback, current: mockUserStats.approvedFeedback }
    }
  }

  const nextTier = getNextTierInfo()

  if (!isConnected) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User size={32} className="text-white-400" />
          </div>
          <h2 className="text-2xl font-bold text-white-900 mb-2">Connect Your Wallet</h2>
          <p className="text-white-600 mb-6">Connect your wallet to view your profile and manage your feedback.</p>
        </div>
      </div>
    )
  }

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
      {/* Profile Header */}
      <div className="card mb-8">
        <div className="flex items-start space-x-6">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
            <User size={32} className="text-primary-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-2">
              <h1 className="text-2xl font-bold text-white-900">{formatAddress(address || "")}</h1>
              <BadgeDisplay tier={mockUserStats.badgeTier} />
            </div>
            <p className="text-white-600 mb-4">Member since {new Date().toLocaleDateString()}</p>
            <div className="flex items-center space-x-6 text-sm text-white-500">
              <span>{mockUserStats.totalFeedback} feedback submitted</span>
              <span>{mockUserStats.totalProducts} products created</span>
              <span>{mockUserStats.totalVotes} votes cast</span>
            </div>
          </div>
          <button className="btn-outline flex items-center space-x-2">
            <Settings size={16} />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card text-center">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Trophy size={24} className="text-primary-600" />
          </div>
          <div className="text-2xl font-bold text-white-900 mb-1">{mockUserStats.reputation}</div>
          <div className="text-sm text-white-600">Reputation Points</div>
        </div>

        <div className="card text-center">
          <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <MessageSquare size={24} className="text-success-600" />
          </div>
          <div className="text-2xl font-bold text-white-900 mb-1">{mockUserStats.approvedFeedback}</div>
          <div className="text-sm text-white-600">Approved Reviews</div>
        </div>

        <div className="card text-center">
          <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Package size={24} className="text-accent-600" />
          </div>
          <div className="text-2xl font-bold text-white-900 mb-1">{mockUserStats.totalProducts}</div>
          <div className="text-sm text-white-600">Products Created</div>
        </div>

        <div className="card text-center">
          <div className="w-12 h-12 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <TrendingUp size={24} className="text-warning-600" />
          </div>
          <div className="text-2xl font-bold text-white-900 mb-1">{mockUserStats.totalVotes}</div>
          <div className="text-sm text-white-600">Votes Cast</div>
        </div>
      </div>

      {/* Badge Progress */}
      {mockUserStats.badgeTier < 5 && (
        <div className="card mb-8">
          <h3 className="text-lg font-semibold text-white-900 mb-4">Badge Progress</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm font-medium text-white-700 mb-2">
                <span>Progress to {nextTier.next} Badge</span>
                <span>
                  {nextTier.current}/{nextTier.current + nextTier.needed}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(nextTier.current / (nextTier.current + nextTier.needed)) * 100}%` }}
                ></div>
              </div>
            </div>
            <p className="text-sm text-white-600">
              You need {nextTier.needed} more approved feedback to reach the {nextTier.next} badge tier.
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: "overview", name: "Overview", count: null },
              { id: "products", name: "My Products", count: mockUserProducts.length },
              { id: "feedback", name: "My Feedback", count: mockUserFeedbacks.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-white-500 hover:text-white-700 hover:border-gray-300"
                }`}
              >
                {tab.name}
                {tab.count !== null && (
                  <span
                    className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                      activeTab === tab.id ? "bg-primary-100 text-primary-600" : "bg-gray-100 text-white-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-white-900 mb-4">Recent Products</h3>
            <div className="space-y-4">
              {mockUserProducts.slice(0, 2).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white-900 mb-4">Recent Feedback</h3>
            <div className="space-y-4">
              {mockUserFeedbacks.slice(0, 2).map((feedback) => (
                <FeedbackCard key={feedback.id} feedback={feedback} onVote={() => {}} canVote={false} />
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "products" && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white-900">My Products</h3>
            <button className="btn-primary">Create New Product</button>
          </div>
          {mockUserProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockUserProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package size={48} className="text-white-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white-900 mb-2">No products yet</h3>
              <p className="text-white-600 mb-6">Create your first product to get started.</p>
              <button className="btn-primary">Create Product</button>
            </div>
          )}
        </div>
      )}

      {activeTab === "feedback" && (
        <div>
          <h3 className="text-lg font-semibold text-white-900 mb-6">My Feedback</h3>
          {mockUserFeedbacks.length > 0 ? (
            <div className="space-y-6">
              {mockUserFeedbacks.map((feedback) => (
                <FeedbackCard key={feedback.id} feedback={feedback} onVote={() => {}} canVote={false} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare size={48} className="text-white-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white-900 mb-2">No feedback yet</h3>
              <p className="text-white-600 mb-6">Start reviewing products to build your reputation.</p>
              <button className="btn-primary">Browse Products</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
