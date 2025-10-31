import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useUserTier, useUserBadges } from './useContract'
import { useReadContract } from 'wagmi'
import { FEEDBACK_MANAGER_ABI } from '@/lib/feedback_mg_abi'
import { CONTRACT_ADDRESSES } from '@/lib/contracts'

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
  const { data: userBadgesData, isLoading: isBadgesLoading } = useUserBadges(address as `0x${string}`)

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

  const isLoading = isTierLoading || isBadgesLoading

  // Compile user stats
  const userStats: UserStats | null = isConnected && address ? {
    badgeTier: Number(badgeTierData || 0),
    totalFeedback: 0, // Would need to track this separately
    approvedFeedback: Number(approvedFeedbackData || 0),
    totalProducts: 0, // Would need to track this separately
    totalVotes: 0, // Would need to track this separately
    reputation: Number(approvedFeedbackData || 0) * 10 // Simple calculation
  } : null

  const getUserTier = (userAddress: string) => {
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
    refetch: () => {
      // Refetch is handled automatically by wagmi hooks
    }
  }
}
