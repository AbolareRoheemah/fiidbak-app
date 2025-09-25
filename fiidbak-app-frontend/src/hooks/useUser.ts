import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useBadgeContract, useFeedbackContract } from './useContract'

export interface UserStats {
  badgeTier: number
  totalFeedback: number
  approvedFeedback: number
  totalProducts: number
  totalVotes: number
  reputation: number
}

export function useUser() {
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const badgeContract = useBadgeContract()
  const feedbackContract = useFeedbackContract()
  const { address, isConnected } = useAccount()

  const fetchUserStats = async () => {
    if (!address || !badgeContract || !feedbackContract) return

    setIsLoading(true)
    setError(null)

    try {
      // TODO: Implement actual contract calls
      // const badgeTier = await badgeContract.read.getUserTier([address])
      // const userBadges = await badgeContract.read.getUserBadges([address])
      
      // Mock data for now
      const mockStats: UserStats = {
        badgeTier: 3,
        totalFeedback: 12,
        approvedFeedback: 8,
        totalProducts: 3,
        totalVotes: 45,
        reputation: 1250
      }

      setUserStats(mockStats)
    } catch (err) {
      setError('Failed to fetch user stats')
      console.error('Error fetching user stats:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const getUserTier = async (userAddress: string) => {
    if (!badgeContract) return 0

    try {
      // TODO: Implement actual contract call
      // const tier = await badgeContract.read.getUserTier([userAddress])
      // return tier
      
      // Mock data for now
      return 2
    } catch (err) {
      console.error('Error fetching user tier:', err)
      return 0
    }
  }

  const canUserVote = (userTier: number) => {
    return userTier >= 2 // Wooden badge or higher
  }

  const getVoteWeight = (userTier: number) => {
    switch (userTier) {
      case 2: return 1 // Wood
      case 3: return 2 // Bronze
      case 4: return 3 // Silver
      case 5: return 5 // Gold
      default: return 0
    }
  }

  useEffect(() => {
    if (isConnected && address) {
      fetchUserStats()
    } else {
      setUserStats(null)
    }
  }, [isConnected, address, badgeContract, feedbackContract])

  return {
    userStats,
    isLoading,
    error,
    getUserTier,
    canUserVote,
    getVoteWeight,
    refetch: fetchUserStats
  }
}
