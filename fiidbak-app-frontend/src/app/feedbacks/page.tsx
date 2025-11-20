"use client"
import { useState, useEffect, useMemo } from "react"
import { useAccount } from "wagmi"
import { readContract } from '@wagmi/core'
import { Search, Filter, ThumbsUp, ThumbsDown, CheckCircle, Clock } from "lucide-react"
import { FeedbackCard } from "@/components/ui/FeedbackCard"
import { EmptyState } from "@/components/ui/EmptyState"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"
import { useAllFeedbacksByRange, useVoteFeedback, useUserTier } from "@/hooks/useContract"
import { getUploadedFile } from "@/utils/pinata"
import { config } from "@/app/wagmi"
import { BADGE_NFT_ABI } from "@/lib/badge_nft_abi"
import { FEEDBACK_MANAGER_ABI } from "@/lib/feedback_mg_abi"
import { CONTRACT_ADDRESSES } from "@/lib/contracts"

interface ContractFeedback {
  feedbackId: bigint | number
  feedbackBy: string
  productId: bigint | number
  positiveVotes: bigint | number
  negativeVotes: bigint | number
  totalVotes: bigint | number
  approved: boolean
  timestamp: bigint | number
  feedbackHash: string
}

interface Feedback {
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

export default function FeedbackPage() {
  const { address } = useAccount()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "approved" | "pending">("all")
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "mostVotes">("newest")
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [isFetchingIPFS, setIsFetchingIPFS] = useState(false)

  // Fetch feedbacks from contract (getting 100 feedbacks)
  const {
    data: feedbacksData,
    isLoading: isContractLoading,
    refetch
  } = useAllFeedbacksByRange(0, 100)

  // Get user's badge tier
  const { data: userTierData } = useUserTier(address as `0x${string}`)
  const userTier = Number(userTierData || 0)

  // Voting hook
  const { voteOnFeedback } = useVoteFeedback(() => {
    // Refetch feedbacks after voting
    refetch()
  })

  // Fetch IPFS data for feedbacks
  useEffect(() => {
    let ignore = false

    async function fetchIPFSData() {
      if (!feedbacksData || !Array.isArray(feedbacksData) || feedbacksData.length === 0) {
        setFeedbacks([])
        return
      }

      setIsFetchingIPFS(true)

      const contractFeedbacks = feedbacksData as ContractFeedback[]
      const feedbacksWithIPFS = await Promise.all(
        contractFeedbacks.map(async (f) => {
          let ipfsData: { content?: string } = {}
          try {
            const url = await getUploadedFile(f.feedbackHash)
            if (url) {
              const res = await fetch(url)
              if (res.ok) {
                ipfsData = await res.json()
              }
            }
          } catch (e) {
            console.error(`Failed to fetch IPFS data for feedback ${f.feedbackId}:`, e)
            ipfsData = {}
          }

          // Fetch author's badge tier
          let authorTier = 0
          try {
            const tierData = await readContract(config, {
              abi: BADGE_NFT_ABI,
              address: CONTRACT_ADDRESSES.BADGE_NFT,
              functionName: 'getUserTier',
              args: [f.feedbackBy as `0x${string}`]
            })
            authorTier = Number(tierData || 0)
          } catch (e) {
            console.error('Error fetching author tier:', e)
            authorTier = 0
          }

          // Check if user has voted on this feedback
          let hasUserVoted = false
          let userVote: boolean | null = null
          if (address) {
            try {
              const voteData = await readContract(config, {
                abi: FEEDBACK_MANAGER_ABI,
                address: CONTRACT_ADDRESSES.FEEDBACK_MANAGER,
                functionName: 'hasVoted',
                args: [BigInt(f.feedbackId), address]
              })
              hasUserVoted = Boolean(voteData)

              if (hasUserVoted) {
                userVote = true // Default to true, ideally should fetch actual vote direction
              }
            } catch (e) {
              console.error('Error checking user vote:', e)
            }
          }

          return {
            id: Number(f.feedbackId),
            content: ipfsData.content || f.feedbackHash,
            author: f.feedbackBy,
            authorTier,
            productId: Number(f.productId),
            positiveVotes: Number(f.positiveVotes),
            negativeVotes: Number(f.negativeVotes),
            totalVotes: Number(f.totalVotes),
            approved: f.approved,
            createdAt: f.timestamp ? new Date(Number(f.timestamp) * 1000).toISOString().substring(0, 10) : '',
            hasUserVoted,
            userVote,
            ipfsHash: f.feedbackHash
          }
        })
      )

      if (!ignore) {
        setFeedbacks(feedbacksWithIPFS)
        setIsFetchingIPFS(false)
      }
    }

    fetchIPFSData()

    return () => {
      ignore = true
    }
  }, [feedbacksData, address])

  const isLoading = isContractLoading || isFetchingIPFS

  // Filter and sort feedbacks using useMemo for performance
  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter((feedback) => {
      const matchesSearch = feedback.content.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "approved" && feedback.approved) ||
        (statusFilter === "pending" && !feedback.approved)

      return matchesSearch && matchesStatus
    })
  }, [feedbacks, searchTerm, statusFilter])

  const sortedFeedbacks = useMemo(() => {
    return [...filteredFeedbacks].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case "mostVotes":
          return b.totalVotes - a.totalVotes
        default:
          return 0
      }
    })
  }, [filteredFeedbacks, sortBy])

  const handleVote = async (feedbackId: number | bigint, isPositive: boolean) => {
    if (!address) {
      alert("Please connect your wallet to vote")
      return
    }

    if (userTier < 2) {
      alert("You need at least a Wooden badge (tier 2) to vote on feedback")
      return
    }

    await voteOnFeedback(Number(feedbackId), isPositive)
  }

  // Check if user can vote
  const canVote = address && userTier >= 2

  // Calculate stats
  const totalFeedbacks = feedbacks.length
  const approvedCount = feedbacks.filter(f => f.approved).length
  const pendingCount = feedbacks.filter(f => !f.approved).length
  const totalVotesCount = feedbacks.reduce((sum, f) => sum + f.totalVotes, 0)

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Community Feedback</h1>
        <p className="text-gray-600">
          Discover authentic reviews and contribute to the community by voting on feedback
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search feedback..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | "approved" | "pending")}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "newest" | "oldest" | "mostVotes")}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="mostVotes">Most Votes</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Feedback</p>
              <p className="text-2xl font-bold text-gray-900">{totalFeedbacks}</p>
            </div>
            <ThumbsUp className="text-primary-600" size={24} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-success-600">{approvedCount}</p>
            </div>
            <CheckCircle className="text-success-600" size={24} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-warning-600">{pendingCount}</p>
            </div>
            <Clock className="text-warning-600" size={24} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Votes</p>
              <p className="text-2xl font-bold text-gray-900">{totalVotesCount}</p>
            </div>
            <ThumbsDown className="text-gray-600" size={24} />
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-gray-600">
          Showing {sortedFeedbacks.length} of {totalFeedbacks} feedback entries
        </p>
      </div>

      {/* Feedback List */}
      {sortedFeedbacks.length > 0 ? (
        <div className="space-y-6">
          {sortedFeedbacks.map((feedback) => (
            <FeedbackCard
              key={feedback.id}
              feedback={feedback}
              onVote={handleVote}
              canVote={canVote || false}
            />
          ))}
        </div>
      ) : (
        <EmptyState icon="search" title="No feedback found" description="Try adjusting your search terms or filters." />
      )}
    </div>
  )
}
