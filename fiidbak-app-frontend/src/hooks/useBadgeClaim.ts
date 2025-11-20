import { useState } from 'react'
import { useAccount, useReadContract, useWriteContract } from 'wagmi'
import { FEEDBACK_MANAGER_ABI } from '@/lib/feedback_mg_abi'
import { CONTRACT_ADDRESSES } from '@/lib/contracts'

const BADGE_NAMES: Record<number, string> = {
  1: 'Seedling',
  2: 'Wooden',
  3: 'Bronze',
  4: 'Silver',
  5: 'Gold'
}

const BADGE_REQUIREMENTS: Record<number, number> = {
  1: 1,
  2: 5,
  3: 10,
  4: 15,
  5: 20
}

export interface EligibleBadge {
  tierId: number
  name: string
  requiredFeedback: number
}

export function useEligibleBadges() {
  const { address, isConnected } = useAccount()

  const { data: eligibleBadgeIds, isLoading, refetch } = useReadContract({
    abi: FEEDBACK_MANAGER_ABI,
    address: CONTRACT_ADDRESSES.FEEDBACK_MANAGER,
    functionName: 'getEligibleBadges',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected
    }
  })

  const eligibleBadges: EligibleBadge[] = eligibleBadgeIds
    ? (eligibleBadgeIds as bigint[]).map((tierId) => ({
        tierId: Number(tierId),
        name: BADGE_NAMES[Number(tierId)] || 'Unknown',
        requiredFeedback: BADGE_REQUIREMENTS[Number(tierId)] || 0
      }))
    : []

  return {
    eligibleBadges,
    isLoading,
    refetch
  }
}

export function useClaimBadge() {
  const [isClaimingBadge, setIsClaimingBadge] = useState(false)
  const [claimError, setClaimError] = useState<string | null>(null)

  const { writeContractAsync } = useWriteContract()

  const claimBadge = async (tierId: number, ipfsCid: string) => {
    setIsClaimingBadge(true)
    setClaimError(null)

    try {
      const hash = await writeContractAsync({
        abi: FEEDBACK_MANAGER_ABI,
        address: CONTRACT_ADDRESSES.FEEDBACK_MANAGER,
        functionName: 'claimBadge',
        args: [BigInt(tierId), ipfsCid]
      })

      return hash
    } catch (error: unknown) {
      console.error('Error claiming badge:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to claim badge'
      setClaimError(errorMessage)
      throw error
    } finally {
      setIsClaimingBadge(false)
    }
  }

  return {
    claimBadge,
    isClaimingBadge,
    claimError
  }
}

export function useBadgeClaim() {
  const { eligibleBadges, isLoading, refetch } = useEligibleBadges()
  const { claimBadge, isClaimingBadge, claimError } = useClaimBadge()

  return {
    eligibleBadges,
    isLoading,
    claimBadge,
    isClaimingBadge,
    claimError,
    refetch
  }
}
