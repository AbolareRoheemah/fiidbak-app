"use client"
import { useEffect, useState, useCallback } from "react"
import { ArrowLeft } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useProductStore } from "@/store/useProductStore"
import toast from "react-hot-toast"
import { ProductInfo } from "@/components/product/ProductInfo"
import { FeedbackSection } from "@/components/product/FeedbackSection"
import { ProductSidebar } from "@/components/product/ProductSidebar"
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
    refetch: refetchFeedbacks,
    feedbackCount
  } = useProductFeedbacks(productIdNum, address as `0x${string}`)

  console.log(normalizedFeedbacks)
  // Submit feedback hook
  const {
    giveFeedback,
    isFeedbackLoading
  } = useWriteFeedback(async () => {
    // After successful feedback submission, wait a bit for blockchain to update, then refetch
    toast.success("Feedback submitted! Refreshing...")
    setTimeout(async () => {
      await refetchFeedbacks()
      toast.success("Feedback loaded!")
    }, 2000)
  })

  // Vote on feedback hook
  const { voteOnFeedback } = useVoteFeedback(async () => {
    // Refresh feedbacks after voting
    await refetchFeedbacks()
  })

  // -------- Handlers --------
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

  const handleSubmitFeedback = useCallback(async (content: string) => {
    if (!content.trim() || !selectedProduct) return

    if (!address) {
      toast.error("Please connect your wallet to submit feedback")
      return
    }

    try {
      // Submit feedback content directly to contract (no IPFS)
      await giveFeedback(Number(selectedProduct.id), content)
    } catch (error) {
      console.error("Error submitting feedback:", error)
      toast.error("Failed to submit feedback")
    }
  }, [giveFeedback, selectedProduct, address])

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
        {/* Product Info and Feedback */}
        <div className="lg:col-span-2">
          <ProductInfo product={selectedProduct} feedbackCount={feedbackCount} />
          <FeedbackSection
            feedbacks={normalizedFeedbacks}
            isLoading={isFeedbacksLoading}
            onSubmitFeedback={handleSubmitFeedback}
            onVote={handleVote}
            isFeedbackLoading={isFeedbackLoading}
          />
        </div>

        {/* Sidebar */}
        <ProductSidebar
          product={selectedProduct}
          totalFeedbacks={feedbackCount}
          approvedFeedbacks={approvedCount}
        />
      </div>
    </div>
  )
}