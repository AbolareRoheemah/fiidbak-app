import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useFeedbackContract, useBadgeContract } from './useContract'

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
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const feedbackContract = useFeedbackContract()
  const badgeContract = useBadgeContract()
  const { address } = useAccount()

  const fetchFeedbacks = async () => {
    if (!feedbackContract) return

    setIsLoading(true)
    setError(null)

    try {
      // TODO: Implement actual contract calls
      // For now, using mock data
      const mockFeedbacks: Feedback[] = [
        {
          id: 1,
          content: "This platform has revolutionized how I think about social media. The privacy features are outstanding and the community is incredibly supportive.",
          author: "0xabcdef1234567890abcdef1234567890abcdef12",
          authorTier: 3,
          productId: 1,
          positiveVotes: 15,
          negativeVotes: 2,
          totalVotes: 17,
          approved: true,
          createdAt: "2024-01-20",
          hasUserVoted: false,
          userVote: null,
          ipfsHash: "QmFeedback1"
        },
        {
          id: 2,
          content: "Great concept but the UI needs some work. The onboarding process was a bit confusing for newcomers.",
          author: "0x9876543210fedcba9876543210fedcba98765432",
          authorTier: 2,
          productId: 1,
          positiveVotes: 8,
          negativeVotes: 3,
          totalVotes: 11,
          approved: true,
          createdAt: "2024-01-18",
          hasUserVoted: true,
          userVote: true,
          ipfsHash: "QmFeedback2"
        }
      ]

      setFeedbacks(mockFeedbacks)
    } catch (err) {
      setError('Failed to fetch feedback')
      console.error('Error fetching feedback:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const submitFeedback = async (productId: number, content: string) => {
    if (!feedbackContract || !address) {
      throw new Error('Contract or wallet not available')
    }

    try {
      // TODO: Upload feedback content to IPFS first
      const metadata = {
        content,
        timestamp: new Date().toISOString(),
        author: address
      }

      // TODO: Get IPFS hash after uploading
      const ipfsHash = "QmNewFeedback"

      // TODO: Call contract method
      // await feedbackContract.write.submitFeedback([productId, ipfsHash])

      console.log('Feedback submitted:', { productId, content })
      return true
    } catch (err) {
      console.error('Error submitting feedback:', err)
      throw err
    }
  }

  const voteOnFeedback = async (feedbackId: number, isPositive: boolean) => {
    if (!feedbackContract || !address) {
      throw new Error('Contract or wallet not available')
    }

    try {
      // TODO: Check user's badge tier before voting
      const userTier = await badgeContract?.read.getUserTier([address])
      
      if (!userTier || userTier < 2) {
        throw new Error('You need a Wooden badge or higher to vote')
      }

      // TODO: Call contract method
      // await feedbackContract.write.voteOnFeedback([feedbackId, isPositive])

      console.log('Voted on feedback:', { feedbackId, isPositive })
      return true
    } catch (err) {
      console.error('Error voting on feedback:', err)
      throw err
    }
  }

  const getProductFeedbacks = async (productId: number) => {
    if (!feedbackContract) return []

    try {
      // TODO: Implement actual contract call
      // const feedbackIds = await feedbackContract.read.getProductFeedbacks([productId])
      // const feedbacks = await Promise.all(
      //   feedbackIds.map(id => feedbackContract.read.getFeedback([id]))
      // )
      
      return feedbacks.filter(f => f.productId === productId)
    } catch (err) {
      console.error('Error fetching product feedbacks:', err)
      return []
    }
  }

  useEffect(() => {
    fetchFeedbacks()
  }, [feedbackContract])

  return {
    feedbacks,
    isLoading,
    error,
    submitFeedback,
    voteOnFeedback,
    getProductFeedbacks,
    refetch: fetchFeedbacks
  }
}
