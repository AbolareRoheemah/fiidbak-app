import { useAccount } from 'wagmi'
import { useUserTier, useUserBadges } from './useContract'
import { useReadContract } from 'wagmi'
import { FEEDBACK_MANAGER_ABI } from '@/lib/feedback_mg_abi'
import { CONTRACT_ADDRESSES } from '@/lib/contracts'
import { useUserProducts } from './useUserProducts'
import { useUserFeedbacks } from './useUserFeedbacks'

export interface UserStats {
  badgeTier: number
  totalFeedback: number
  approvedFeedback: number
  totalProducts: number
  totalVotes: number
  reputation: number
}

export function useUser() {
  const { address, isConnected } = useAccount()

  // Fetch user's badge tier
  const { data: badgeTierData, isLoading: isTierLoading } = useUserTier(address as `0x${string}`)

  // Fetch user's badges
  const { isLoading: isBadgesLoading } = useUserBadges(address as `0x${string}`)

  // Fetch approved feedback count
  const { data: approvedFeedbackData } = useReadContract({
    abi: FEEDBACK_MANAGER_ABI,
    address: CONTRACT_ADDRESSES.FEEDBACK_MANAGER,
    functionName: 'userApprovedFeedbackCount',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address
    }
  })

  // Fetch user's products
  const { products: userProducts, isLoading: isProductsLoading } = useUserProducts()

  // Fetch user's feedbacks
  const { feedbacks: userFeedbacks, isLoading: isFeedbacksLoading } = useUserFeedbacks()

  const isLoading = isTierLoading || isBadgesLoading || isProductsLoading || isFeedbacksLoading

  // Calculate total votes cast (sum of all votes on user's feedbacks)
  const totalVotes = userFeedbacks.reduce((sum, feedback) => sum + feedback.totalVotes, 0)

  // Compile user stats
  const userStats: UserStats | null = isConnected && address ? {
    badgeTier: Number(badgeTierData || 0),
    totalFeedback: userFeedbacks.length,
    approvedFeedback: Number(approvedFeedbackData || 0),
    totalProducts: userProducts.length,
    totalVotes: totalVotes,
    reputation: Number(approvedFeedbackData || 0) * 10 // Simple calculation
  } : null

  const getUserTier = () => {
    // This is now handled by the useUserTier hook
    // Keep this function for backwards compatibility
    return Number(badgeTierData || 0)
  }

  const canUserVote = (userTier: number) => {
    return userTier >= 2 // Wooden badge or higher
  }

  const getVoteWeight = (userTier: number) => {
    switch (userTier) {
      case 2: return 1 // Wooden
      case 3: return 2 // Bronze
      case 4: return 3 // Silver
      case 5: return 5 // Gold
      default: return 0
    }
  }

  return {
    userStats,
    isLoading,
    error: null,
    getUserTier,
    canUserVote,
    getVoteWeight,
    userProducts,
    userFeedbacks,
    refetch: () => {
      // Refetch is handled automatically by wagmi hooks
    }
  }
}
