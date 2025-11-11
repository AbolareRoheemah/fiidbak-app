"use client"
import { useState } from "react"
import { useAccount } from "wagmi"
import { User, Trophy, MessageSquare, Package, TrendingUp, Settings, Award } from "lucide-react"
import { BadgeDisplay } from "@/components/ui/BadgeDisplay"
import { ProductCard } from "@/components/ui/ProductCard"
import { FeedbackCard } from "@/components/ui/FeedbackCard"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"
import { ClaimBadge } from "@/components/ui/ClaimBadge"
import { useUser } from "@/hooks/useUser"

export default function ProfilePage() {
  const { address, isConnected } = useAccount()
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "feedback" | "badges">("overview")

  // Fetch user data from contracts
  const { userStats, userProducts, userFeedbacks, isLoading } = useUser()

  const formatAddress = (address: string) => {
    return `${address?.slice(0, 6)}...${address?.slice(-4)}`
  }

  const getNextTierInfo = () => {
    if (!userStats) {
      return { next: "Wooden", needed: 5, current: 0 }
    }

    const { badgeTier, approvedFeedback } = userStats
    switch (badgeTier) {
      case 0:
        return { next: "Wooden", needed: Math.max(0, 5 - approvedFeedback), current: approvedFeedback }
      case 1:
        return { next: "Wooden", needed: Math.max(0, 5 - approvedFeedback), current: approvedFeedback }
      case 2:
        return { next: "Bronze", needed: Math.max(0, 10 - approvedFeedback), current: approvedFeedback }
      case 3:
        return { next: "Silver", needed: Math.max(0, 15 - approvedFeedback), current: approvedFeedback }
      case 4:
        return { next: "Gold", needed: Math.max(0, 20 - approvedFeedback), current: approvedFeedback }
      default:
        return { next: "Max Level", needed: 0, current: approvedFeedback }
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
              <BadgeDisplay tier={userStats?.badgeTier || 0} />
            </div>
            <p className="text-white-600 mb-4">Member since {new Date().toLocaleDateString()}</p>
            <div className="flex items-center space-x-6 text-sm text-white-500">
              <span>{userStats?.totalFeedback || 0} feedback submitted</span>
              <span>{userStats?.totalProducts || 0} products created</span>
              <span>{userStats?.totalVotes || 0} votes received</span>
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
          <div className="text-2xl font-bold text-white-900 mb-1">{userStats?.reputation || 0}</div>
          <div className="text-sm text-white-600">Reputation Points</div>
        </div>

        <div className="card text-center">
          <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <MessageSquare size={24} className="text-success-600" />
          </div>
          <div className="text-2xl font-bold text-white-900 mb-1">{userStats?.approvedFeedback || 0}</div>
          <div className="text-sm text-white-600">Approved Reviews</div>
        </div>

        <div className="card text-center">
          <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Package size={24} className="text-accent-600" />
          </div>
          <div className="text-2xl font-bold text-white-900 mb-1">{userStats?.totalProducts || 0}</div>
          <div className="text-sm text-white-600">Products Created</div>
        </div>

        <div className="card text-center">
          <div className="w-12 h-12 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <TrendingUp size={24} className="text-warning-600" />
          </div>
          <div className="text-2xl font-bold text-white-900 mb-1">{userStats?.totalVotes || 0}</div>
          <div className="text-sm text-white-600">Votes Received</div>
        </div>
      </div>

      {/* Badge Progress */}
      {userStats && userStats.badgeTier < 5 && nextTier.needed > 0 && (
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
                  style={{ width: `${nextTier.current + nextTier.needed > 0 ? (nextTier.current / (nextTier.current + nextTier.needed)) * 100 : 0}%` }}
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
              { id: "badges", name: "My Badges", count: null, icon: Award },
              { id: "products", name: "My Products", count: userProducts?.length || 0 },
              { id: "feedback", name: "My Feedback", count: userFeedbacks?.length || 0 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as "overview" | "products" | "feedback" | "badges")}
                className={`py-2 px-1 border-b-2 font-medium text-sm cursor-pointer ${
                  activeTab === tab.id
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-white-500 hover:text-white-700 hover:border-gray-300"
                }`}
              >
                {tab.name}
                {tab.count !== null && (
                  <span
                    className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                      activeTab === tab.id ? "bg-primary-100 text-white-600" : "bg-gray-100 text-black"
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
              {userProducts && userProducts.length > 0 ? (
                userProducts.slice(0, 2).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <p className="text-white-600 text-center py-8">No products yet</p>
              )}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white-900 mb-4">Recent Feedback</h3>
            <div className="space-y-4">
              {userFeedbacks && userFeedbacks.length > 0 ? (
                userFeedbacks.slice(0, 2).map((feedback) => (
                  <FeedbackCard key={feedback.id} feedback={feedback} onVote={() => {}} canVote={false} />
                ))
              ) : (
                <p className="text-white-600 text-center py-8">No feedback yet</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "products" && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white-900">My Products</h3>
            <button
              className="btn-primary cursor-pointer"
              onClick={() => window.location.href = '/create-product'}
            >
              Create New Product
            </button>
          </div>
          {userProducts && userProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package size={48} className="text-white-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white-900 mb-2">No products yet</h3>
              <p className="text-white-600 mb-6">Create your first product to get started.</p>
              <button
                className="btn-primary cursor-pointer"
                onClick={() => window.location.href = '/create-product'}
              >
                Create Product
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === "feedback" && (
        <div>
          <h3 className="text-lg font-semibold text-white-900 mb-6">My Feedback</h3>
          {userFeedbacks && userFeedbacks.length > 0 ? (
            <div className="space-y-6">
              {userFeedbacks.map((feedback) => (
                <FeedbackCard key={feedback.id} feedback={feedback} onVote={() => {}} canVote={false} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare size={48} className="text-white-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white-900 mb-2">No feedback yet</h3>
              <p className="text-white-600 mb-6">Start reviewing products to build your reputation.</p>
              <button
                className="btn-primary cursor-pointer"
                onClick={() => window.location.href = '/products'}
              >
                Browse Products
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === "badges" && (
        <div>
          <h3 className="text-lg font-semibold text-white-900 mb-6">Claim Your Badges</h3>
          <ClaimBadge onBadgeClaimed={() => {
            // Optionally refresh user stats or show a success message
            console.log('Badge claimed successfully!')
          }} />
        </div>
      )}
    </div>
  )
}
