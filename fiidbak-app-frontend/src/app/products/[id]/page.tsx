"use client"
import { useState, useEffect, useCallback } from "react"
import { ArrowLeft, MessageSquare, Plus, User } from "lucide-react"
import { FeedbackCard } from "@/components/ui/FeedbackCard"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"
import { EmptyState } from "@/components/ui/EmptyState"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useProductStore } from "@/store/useProductStore"
import toast from "react-hot-toast"
import { uploadJsonToPinata } from "@/utils/pinata"

// --- Feedback contract hooks ---
import {
  useWriteFeedback,
  useVoteFeedback,
  useUserTier
} from "@/hooks/useContract"
import { useProductFeedbacks } from "@/hooks/useProductFeedbacks"
import { useAccount } from "wagmi"

export default function ProductDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)
  const [newFeedback, setNewFeedback] = useState("")
  const [isFetchingProduct, setIsFetchingProduct] = useState(false)

  // Get user account and tier
  const { address } = useAccount()
  const { data: userTierData } = useUserTier(address as `0x${string}`)

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

  // Use the new hook to fetch all feedbacks for this product
  const {
    feedbacks: normalizedFeedbacks,
    isLoading: isFeedbacksLoading,
    error: feedbacksError,
    refetch: refetchFeedbacks,
    feedbackCount
  } = useProductFeedbacks(productIdNum)

  // Submit feedback hook
  const {
    giveFeedback,
    isFeedbackLoading
  } = useWriteFeedback(async () => {
    setNewFeedback("")
    setShowFeedbackForm(false)
    // After successful feedback submission, refetch feedbacks
    await refetchFeedbacks()
  })

  // Vote on feedback hook
  const {
    voteOnFeedback,
    isVoteLoading
  } = useVoteFeedback(async () => {
    // Refresh feedbacks after voting
    await refetchFeedbacks()
  })

  // -------- Util handlers --------
  const formatAddress = (address: string) => {
    if (!address || address.length < 10) return address
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const handleVote = async (feedbackId: number | bigint, isPositive: boolean) => {
    if (!address) {
      toast.error("Please connect your wallet to vote")
      return
    }

    // Check user tier (need at least Wooden badge which is tier 2)
    const userTier = Number(userTierData || 0)
    if (userTier < 2) {
      toast.error("You need at least a Wooden badge (tier 2) to vote on feedback")
      return
    }

    await voteOnFeedback(feedbackId, isPositive)
  }

  // UseCallback recommended, but not forced, for latest closure
  const handleSubmitFeedback = useCallback(async () => {
    if (!newFeedback.trim() || !selectedProduct) return

    if (!address) {
      toast.error("Please connect your wallet to submit feedback")
      return
    }

    try {
      // Upload feedback content to IPFS
      const metadata = {
        content: newFeedback,
        timestamp: new Date().toISOString(),
        author: address,
        productId: selectedProduct.id
      }

      toast.loading("Uploading feedback to IPFS...")
      const ipfsCid = await uploadJsonToPinata(metadata)
      toast.dismiss()

      if (!ipfsCid) {
        toast.error("Failed to upload feedback to IPFS")
        return
      }

      // Submit feedback with IPFS hash to contract
      await giveFeedback(Number(selectedProduct.id), ipfsCid)
    } catch (error) {
      toast.dismiss()
      console.error("Error submitting feedback:", error)
      toast.error("Failed to submit feedback")
    }
  }, [giveFeedback, newFeedback, selectedProduct, address])

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
  const actualFeedbackCount = feedbackCount

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
                  <span>{actualFeedbackCount} reviews</span>
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
            {isFeedbacksLoading ? (
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
                <span className="font-semibold">{actualFeedbackCount}</span>
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