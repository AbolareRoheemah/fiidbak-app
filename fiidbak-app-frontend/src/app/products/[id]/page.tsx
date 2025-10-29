"use client"
import { useState, useEffect, useCallback } from "react"
import { ArrowLeft, MessageSquare, Plus, User } from "lucide-react"
import { FeedbackCard } from "@/components/ui/FeedbackCard"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"
import { EmptyState } from "@/components/ui/EmptyState"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useProductStore } from "@/store/useProductStore"

// --- Feedback contract hooks ---
import {
  useProductFeedbackIds,
  useFeedback,
  useWriteFeedback
} from "@/hooks/useContract"

type FeedbackStruct = [
  productId: number | bigint,      // 0
  content: string,                 // 1
  author: string,                  // 2
  unused?: any,                    // 3
  positiveVotes?: number | bigint, // 4
  negativeVotes?: number | bigint, // 5
  authorTier?: number | bigint,    // 6
  approved?: boolean,              // 7
  createdAt?: number | bigint      // 8 (unix timestamp, optional)
]

// The minimum valid type for normalized feedback
type Feedback = {
  id: number | bigint
  content: string
  author: string
  authorTier: number | bigint
  productId: number | bigint
  positiveVotes: number | bigint
  negativeVotes: number | bigint
  totalVotes: number
  approved: boolean
  createdAt?: string
  hasUserVoted: boolean
  userVote: null
}

export default function ProductDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)
  const [newFeedback, setNewFeedback] = useState("")
  const [isFetchingProduct, setIsFetchingProduct] = useState(false)
  const [feedbackRefreshCount, setFeedbackRefreshCount] = useState(0) // <- NEW STATE

  // Zustand store
  const {
    getProductById,
    selectedProduct,
    setSelectedProduct,
    hasProducts
  } = useProductStore()

  // --- Load product from store or redirect to products page
  useEffect(() => {
    const productId = Number(id)
    if (isNaN(productId)) {
      router.push("/products")
      return
    }

    // Try to get product from store
    const product = getProductById(productId)
    if (product) {
      setSelectedProduct(product)
    } else if (!hasProducts()) {
      setIsFetchingProduct(true)
      router.push("/products")
    } else {
      setIsFetchingProduct(true)
      // Wait a bit then redirect (in case products are still loading)
      const timer = setTimeout(() => {
        router.push("/products")
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [id, getProductById, setSelectedProduct, hasProducts, router])

  // Parse productIdNum as plain variable (not useMemo)
  const n = Number(id)
  const productIdNum = isNaN(n) ? undefined : n

  // --- Fetch feedback ids array for this product
  const { data: feedbackIdData, isLoading: isLoadingIds, refetch: refetchFeedbackIds } = useProductFeedbackIds(productIdNum)
  // Ensure feedbackIdData is always an array
  const feedbackIds: (bigint | number)[] = Array.isArray(feedbackIdData) ? feedbackIdData : []

  // --- Custom fetch of all feedback items --- //
  const [feedbacksState, setFeedbacksState] = useState<{ isLoading: boolean; items: Feedback[] }>({
    isLoading: false,
    items: [],
  })

  // IMPROVED FEEDBACK RELOAD LOGIC:
  // Add feedbackRefreshCount to effect dependencies so we can force reload.
  useEffect(() => {
    let cancelled = false
    async function fetchAllFeedbacks() {
      if (!feedbackIds.length) {
        setFeedbacksState({ isLoading: false, items: [] })
        return
      }
      setFeedbacksState(prev => ({ ...prev, isLoading: true }))
      // The following logic is unchanged: call useFeedback for up to LIMIT feedbacks
      try {
        const LIMIT = 20
        if (feedbackIds.length > LIMIT) {
          setFeedbacksState({ isLoading: false, items: [] })
          return
        }
        let paddedFeedbackIds = [...feedbackIds]
        if (paddedFeedbackIds.length < LIMIT) {
          paddedFeedbackIds = [
            ...paddedFeedbackIds,
            ...Array(LIMIT - paddedFeedbackIds.length).fill(null)
          ]
        }
        const feedbackResults = paddedFeedbackIds.map(feedbackId =>
          feedbackId == null ? { data: undefined, isLoading: false } : useFeedback(feedbackId)
        )
        const normalized: Feedback[] = []
        feedbackResults.forEach((f, i) => {
          if (!feedbackIds[i]) return // only take original ids
          const d = f?.data as FeedbackStruct | undefined
          if (!d) return
          normalized.push({
            id: feedbackIds[i],
            content: d[1] ?? "",
            author: d[2] ?? "",
            authorTier: (d[6] ?? 1) as number | bigint,
            productId: d[0],
            positiveVotes: d[4] ?? 0,
            negativeVotes: d[5] ?? 0,
            totalVotes: (Number(d[4] || 0) + Number(d[5] || 0)),
            approved: d[7] ?? false,
            createdAt: d[8] ? new Date(Number(d[8]) * 1000).toISOString().substring(0, 10) : undefined,
            hasUserVoted: false,
            userVote: null,
          })
        })
        if (!cancelled) setFeedbacksState({ isLoading: false, items: normalized })
      } catch (err) {
        if (!cancelled) setFeedbacksState({ isLoading: false, items: [] })
      }
    }
    fetchAllFeedbacks()
    return () => { cancelled = true }
    // Use both feedbackIds and feedbackRefreshCount as dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(Number(feedbackIds)), feedbackRefreshCount])

  // Compose normalized feedback objects for rendering
  const normalizedFeedbacks: Feedback[] = feedbacksState.items

  // Submit feedback hook
  const {
    giveFeedback,
    isFeedbackLoading
  } = useWriteFeedback(async () => {
    setNewFeedback("")
    setShowFeedbackForm(false)
    // After successful feedback submission, trigger feedback refresh!
    // First, try to refetch the feedback IDs from the contract (will update the feedbackIds array)
    if (typeof refetchFeedbackIds === "function") {
      await refetchFeedbackIds()
    }
    // But in any case also increment local refresh counter to force reload of feedbacks
    setFeedbackRefreshCount(x => x + 1)
  })

  // -------- Util handlers --------
  const formatAddress = (address: string) => {
    if (!address || address.length < 10) return address
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const handleVote = async (feedbackId: number | bigint, isPositive: boolean) => {
    // TODO: Implement voting logic with smart contract
    // (probably need a useVoteFeedback/write contract hook)
    console.log("Voting on feedback:", feedbackId, isPositive)
  }

  // UseCallback recommended, but not forced, for latest closure
  const handleSubmitFeedback = useCallback(async () => {
    if (!newFeedback.trim() || !selectedProduct) return
    await giveFeedback(Number(selectedProduct.id), newFeedback)
  }, [giveFeedback, newFeedback, selectedProduct])

  if (isFetchingProduct || !selectedProduct) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  const approvedCount = normalizedFeedbacks.filter(f => !!f && f.approved).length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Link href="/products" className="flex items-center space-x-2 text-white-600 hover:text-white-900 mb-6">
        <ArrowLeft size={20} />
        <span>Back to Products</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Product Info */}
        <div className="lg:col-span-2">
          <div className="card mb-8">
            <div className="aspect-w-16 aspect-h-9 mb-6 rounded-lg overflow-hidden bg-gray-100">
              <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="w-full h-100 object-cover" />
            </div>

            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-white-900 mb-2">{selectedProduct.name}</h1>
                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                  {/* {selectedProduct.createdAt && (
                    <>
                      <span>Created {new Date(selectedProduct.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                    </>
                  )} */}
                  <span>{selectedProduct.feedbackCount} reviews</span>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white-900 mb-3">Description</h2>
                <p className="text-white-700 leading-relaxed">{selectedProduct.description}</p>
              </div>

              {/* Category */}
              {selectedProduct.category && (
                <div>
                  <h3 className="text-lg font-semibold text-white-900 mb-3">Category</h3>
                  <span className="px-3 py-1 text-blue-700 text-sm font-medium">
                    {selectedProduct.category}
                  </span>
                </div>
              )}

              {/* Tags */}
              {selectedProduct.tags && selectedProduct.tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white-900 mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.tags.map((tag: string, index: number) => (
                      <span
                        key={index}
                         className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Owner Info */}
              <div>
                <h3 className="text-lg font-semibold text-white-900 mb-3">Created by</h3>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <User size={20} className="text-white-600" />
                  </div>
                  <div>
                    <div className="font-medium text-white-900">{formatAddress(selectedProduct.owner)}</div>
                    <div className="text-sm text-gray-500">Product Owner</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feedback Section */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white-900 flex items-center space-x-2">
                <MessageSquare size={24} />
                <span>Feedback ({normalizedFeedbacks.length})</span>
              </h2>
              <button
                onClick={() => setShowFeedbackForm(!showFeedbackForm)}
                className="btn-primary flex items-center space-x-2 cursor-pointer"
              >
                <Plus size={20} />
                <span>Add Feedback</span>
              </button>
            </div>

            {/* Feedback Form */}
            {showFeedbackForm && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-white-900 mb-3 cursor-pointer">Share your feedback</h3>
                <textarea
                  value={newFeedback}
                  onChange={(e) => setNewFeedback(e.target.value)}
                  placeholder="Share your honest feedback about this product..."
                  rows={4}
                  className="w-full input-field mb-4 text-black"
                  disabled={isFeedbackLoading}
                />
                <div className="flex space-x-3">
                  <button
                    onClick={handleSubmitFeedback}
                    className="btn-primary cursor-pointer"
                    disabled={isFeedbackLoading}
                  >
                    {isFeedbackLoading ? "Submitting..." : "Submit Feedback"}
                  </button>
                  <button
                    onClick={() => {
                      setShowFeedbackForm(false)
                      setNewFeedback("")
                    }}
                    className="btn-secondary cursor-pointer"
                    disabled={isFeedbackLoading}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Feedback List */}
            {(isLoadingIds || feedbacksState.isLoading) ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : normalizedFeedbacks.length > 0 ? (
              <div className="space-y-6">
                {normalizedFeedbacks.map((feedback) => (
                  <FeedbackCard
                    key={String(feedback.id)}
                    feedback={feedback}
                    onVote={handleVote}
                    canVote={true}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon="feedback"
                title="No feedback yet"
                description="Be the first to share your thoughts about this product."
                action={{
                  label: "Add Feedback",
                  onClick: () => setShowFeedbackForm(true),
                }}
              />
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats Card */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white-900 mb-4">Statistics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white-600">Total Reviews</span>
                <span className="font-semibold">{selectedProduct.feedbackCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white-600">Approved Reviews</span>
                <span className="font-semibold">{approvedCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white-600">Average Rating</span>
                <span className="font-semibold">4.2/5</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full btn-primary cursor-pointer">Share Product</button>
              <button className="w-full btn-outline cursor-pointer">Report Issue</button>
              {selectedProduct.website && (
                <a
                  href={selectedProduct.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full btn-secondary block text-center"
                >
                  Visit Website
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}