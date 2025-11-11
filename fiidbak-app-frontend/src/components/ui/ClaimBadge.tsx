'use client'

import { useState, useEffect } from 'react'
import { useBadgeClaim } from '@/hooks/useBadgeClaim'
import { useUserBadges } from '@/hooks/useContract'
import { useAccount, useWaitForTransactionReceipt } from 'wagmi'
import toast from 'react-hot-toast'

const BADGE_COLORS: Record<number, string> = {
  1: 'bg-green-100 border-green-500 text-green-800',
  2: 'bg-amber-100 border-amber-700 text-amber-800',
  3: 'bg-orange-100 border-orange-600 text-orange-800',
  4: 'bg-gray-100 border-gray-400 text-gray-800',
  5: 'bg-yellow-100 border-yellow-500 text-yellow-800'
}

const BADGE_DESCRIPTIONS: Record<number, string> = {
  1: 'Welcome to the community! Your first badge for submitting feedback.',
  2: '5 approved feedbacks - You\'re building credibility!',
  3: '10 approved feedbacks - You can now vote on feedback!',
  4: '15 approved feedbacks - Your votes carry more weight!',
  5: '20 approved feedbacks - Maximum voting power achieved!'
}

const BADGE_NAMES: Record<number, string> = {
  1: 'Seedling',
  2: 'Wooden',
  3: 'Bronze',
  4: 'Silver',
  5: 'Gold'
}

interface ClaimBadgeProps {
  onBadgeClaimed?: () => void
}

export function ClaimBadge({ onBadgeClaimed }: ClaimBadgeProps) {
  const { address } = useAccount()
  const { eligibleBadges, isLoading, claimBadge, isClaimingBadge, claimError, refetch } = useBadgeClaim()
  const { data: userBadgesData, isLoading: isLoadingBadges, refetch: refetchUserBadges } = useUserBadges(address as `0x${string}`)
  const [claimingTier, setClaimingTier] = useState<number | null>(null)
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined)

  // Parse claimed badges
  const claimedBadges = userBadgesData
    ? (userBadgesData as bigint[]).map((tierId) => Number(tierId))
    : []

  const { isLoading: isTxPending, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
    hash: txHash
  })

  // Show toast notification when badge is successfully minted
  useEffect(() => {
    if (isTxSuccess) {
      toast.success('Badge successfully minted! 🎉')
      // Refetch user badges to update the claimed badges list
      setTimeout(() => {
        refetchUserBadges()
      }, 1000)
    }
  }, [isTxSuccess, refetchUserBadges])

  const handleClaimBadge = async (tierId: number) => {
    setClaimingTier(tierId)
    try {
      // For now, using a default IPFS CID. In production, this should be generated or fetched
      const ipfsCid = `QmDefaultBadgeCid${tierId}`

      const hash = await claimBadge(tierId, ipfsCid)
      setTxHash(hash)

      // Wait a bit and refetch eligible badges
      setTimeout(() => {
        refetch()
        if (onBadgeClaimed) {
          onBadgeClaimed()
        }
      }, 2000)
    } catch (error) {
      console.error('Failed to claim badge:', error)
    } finally {
      setClaimingTier(null)
    }
  }

  if (isLoading || isLoadingBadges) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Eligible Badges Section */}
      {eligibleBadges.length > 0 && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Badges Ready to Claim!
            </h3>
            <p className="text-sm text-blue-700">
              You have {eligibleBadges.length} badge{eligibleBadges.length > 1 ? 's' : ''} available to claim.
              Click the button below to mint your badge(s) on-chain.
            </p>
          </div>

          {claimError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">{claimError}</p>
            </div>
          )}

          {isTxSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-700">Badge claimed successfully!</p>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {eligibleBadges.map((badge) => (
          <div
            key={badge.tierId}
            className={`rounded-lg border-2 p-6 ${BADGE_COLORS[badge.tierId] || 'bg-gray-100 border-gray-400'}`}
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold">{badge.name} Badge</h4>
              <span className="text-2xl">
                {badge.tierId === 1 && '🌱'}
                {badge.tierId === 2 && '🪵'}
                {badge.tierId === 3 && '🥉'}
                {badge.tierId === 4 && '🥈'}
                {badge.tierId === 5 && '🥇'}
              </span>
            </div>

            <p className="text-sm mb-4">
              {BADGE_DESCRIPTIONS[badge.tierId] || 'Achievement unlocked!'}
            </p>

            <div className="text-xs mb-4 opacity-75">
              Required: {badge.requiredFeedback} approved feedback{badge.requiredFeedback > 1 ? 's' : ''}
            </div>

            <button
              onClick={() => handleClaimBadge(badge.tierId)}
              disabled={isClaimingBadge || isTxPending || claimingTier === badge.tierId}
              className="w-full bg-white hover:bg-opacity-90 disabled:bg-opacity-50 disabled:cursor-not-allowed font-semibold py-2 px-4 rounded-lg transition-all shadow-sm border-2 border-current"
            >
              {claimingTier === badge.tierId || (isTxPending && claimingTier === badge.tierId) ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Minting...
                </span>
              ) : (
                'Claim Badge'
              )}
            </button>
          </div>
        ))}
          </div>
        </div>
      )}

      {/* Claimed Badges Section */}
      {claimedBadges.length > 0 && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              Your Claimed Badges
            </h3>
            <p className="text-sm text-green-700">
              You have claimed {claimedBadges.length} badge{claimedBadges.length > 1 ? 's' : ''}!
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {claimedBadges.map((tierId) => (
              <div
                key={tierId}
                className={`rounded-lg border-2 p-6 relative ${BADGE_COLORS[tierId] || 'bg-gray-100 border-gray-400'} opacity-90`}
              >
                {/* Claimed Badge Indicator */}
                <div className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                  ✓ Claimed
                </div>

                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold">{BADGE_NAMES[tierId]} Badge</h4>
                  <span className="text-2xl">
                    {tierId === 1 && '🌱'}
                    {tierId === 2 && '🪵'}
                    {tierId === 3 && '🥉'}
                    {tierId === 4 && '🥈'}
                    {tierId === 5 && '🥇'}
                  </span>
                </div>

                <p className="text-sm mb-4">
                  {BADGE_DESCRIPTIONS[tierId] || 'Achievement unlocked!'}
                </p>

                <div className="text-xs opacity-75">
                  Badge Tier: {tierId}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Badges Message */}
      {eligibleBadges.length === 0 && claimedBadges.length === 0 && (
        <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No badges yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Keep submitting quality feedback to unlock badges!
          </p>
        </div>
      )}
    </div>
  )
}
