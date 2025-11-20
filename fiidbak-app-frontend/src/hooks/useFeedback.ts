import { useAccount } from 'wagmi'
import {
  useAllFeedbacksByRange
} from './useContract'
import { uploadJsonToPinata } from '@/utils/pinata'
import toast from 'react-hot-toast'

interface ContractFeedback {
  feedbackId: bigint
  feedbackHash: string
  feedbackBy: string
  productId: bigint
  timestamp: bigint
  approved: boolean
  positiveVotes?: bigint
  negativeVotes?: bigint
  totalVotes?: bigint
}

export interface Feedback {
  id: number
  content: string
  author: string
  authorTier: number
  productId: number
  positiveVotes: number
  negativeVotes: number
  totalVotes: number
  approved: boolean
  createdAt: string
  hasUserVoted: boolean
  userVote: boolean | null
  ipfsHash: string
}

export function useFeedback() {
  const { address } = useAccount()

  // Fetch feedbacks from contract (getting first 20)
  const {
    data: feedbackData,
    isLoading,
    error: fetchError,
    refetch
  } = useAllFeedbacksByRange(0, 20)

  // Parse feedback data
  const feedbacks: Feedback[] = Array.isArray(feedbackData)
    ? (feedbackData as ContractFeedback[]).map((f: ContractFeedback, index) => ({
        id: Number(f.feedbackId || index),
        content: f.feedbackHash || '',
        author: f.feedbackBy || '',
        authorTier: 1, // Will need to fetch from badge contract
        productId: Number(f.productId || 0),
        positiveVotes: Number(f.positiveVotes || 0),
        negativeVotes: Number(f.negativeVotes || 0),
        totalVotes: Number(f.totalVotes || 0),
        approved: f.approved || false,
        createdAt: f.timestamp ? new Date(Number(f.timestamp) * 1000).toISOString().substring(0, 10) : '',
        hasUserVoted: false,
        userVote: null,
        ipfsHash: f.feedbackHash || ''
      }))
    : []

  const error = fetchError ? 'Failed to fetch feedback' : null

  // Submit feedback - use the hook from useContract
  const submitFeedback = async (productId: number, content: string) => {
    if (!address) {
      throw new Error('Wallet not connected')
    }

    try {
      // Upload feedback content to IPFS
      const metadata = {
        content,
        timestamp: new Date().toISOString(),
        author: address,
        productId
      }

      toast.loading('Uploading feedback to IPFS...')
      const ipfsCid = await uploadJsonToPinata(metadata)
      toast.dismiss()

      if (!ipfsCid) {
        throw new Error('Failed to upload feedback to IPFS')
      }

      // Note: The actual contract call should be done using useWriteFeedback hook
      // This function is just a helper
      return ipfsCid
    } catch (err) {
      toast.dismiss()
      console.error('Error submitting feedback:', err)
      throw err
    }
  }

  // Vote on feedback - use the hook from useContract
  const voteOnFeedback = async (feedbackId: number, isPositive: boolean) => {
    if (!address) {
      throw new Error('Wallet not connected')
    }

    // Note: The actual voting logic with tier checking should be done
    // using useVoteFeedback and useUserTier hooks
    // This function is just a helper
    return { feedbackId, isPositive }
  }

  const getProductFeedbacks = (productId: number) => {
    return feedbacks.filter(f => f.productId === productId)
  }

  return {
    feedbacks,
    isLoading,
    error,
    submitFeedback,
    voteOnFeedback,
    getProductFeedbacks,
    refetch
  }
}
