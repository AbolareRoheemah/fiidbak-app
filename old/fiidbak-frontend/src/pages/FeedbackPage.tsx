import { useState } from 'react'
import { Search, Filter, ThumbsUp, ThumbsDown, CheckCircle, Clock } from 'lucide-react'
import { FeedbackCard } from '../components/ui/FeedbackCard'
import { EmptyState } from '../components/ui/EmptyState'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'

// Mock data - replace with actual data from contracts
const mockFeedbacks = [
  {
    id: 1,
    content: "This platform has revolutionized how I think about social media. The privacy features are outstanding and the community is incredibly supportive. The tokenomics are well thought out and I can actually earn from my content!",
    author: "0xabcdef1234567890abcdef1234567890abcdef12",
    authorTier: 3,
    productId: 1,
    positiveVotes: 15,
    negativeVotes: 2,
    totalVotes: 17,
    approved: true,
    createdAt: "2024-01-20",
    hasUserVoted: false,
    userVote: null
  },
  {
    id: 2,
    content: "Great concept but the UI needs some work. The onboarding process was a bit confusing for newcomers. However, the core functionality works well and the team is responsive to feedback.",
    author: "0x9876543210fedcba9876543210fedcba98765432",
    authorTier: 2,
    productId: 1,
    positiveVotes: 8,
    negativeVotes: 3,
    totalVotes: 11,
    approved: true,
    createdAt: "2024-01-18",
    hasUserVoted: true,
    userVote: true
  },
  {
    id: 3,
    content: "The gas fees are quite high during peak times, which makes it expensive to post content. The platform is good but needs better scaling solutions.",
    author: "0xfedcba0987654321fedcba0987654321fedcba09",
    authorTier: 4,
    productId: 1,
    positiveVotes: 5,
    negativeVotes: 8,
    totalVotes: 13,
    approved: false,
    createdAt: "2024-01-16",
    hasUserVoted: false,
    userVote: null
  },
  {
    id: 4,
    content: "Amazing user experience! The interface is intuitive and the features are exactly what I needed. The community is very helpful and the documentation is comprehensive.",
    author: "0x1234567890abcdef1234567890abcdef12345678",
    authorTier: 5,
    productId: 2,
    positiveVotes: 22,
    negativeVotes: 1,
    totalVotes: 23,
    approved: true,
    createdAt: "2024-01-22",
    hasUserVoted: false,
    userVote: null
  },
  {
    id: 5,
    content: "Good platform overall, but there are some bugs that need fixing. Customer support is slow to respond, but the core functionality works as expected.",
    author: "0x567890abcdef1234567890abcdef1234567890ab",
    authorTier: 2,
    productId: 3,
    positiveVotes: 6,
    negativeVotes: 4,
    totalVotes: 10,
    approved: true,
    createdAt: "2024-01-19",
    hasUserVoted: true,
    userVote: false
  }
]

export function FeedbackPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending'>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'mostVotes'>('newest')
  const [isLoading] = useState(false)

  const filteredFeedbacks = mockFeedbacks.filter(feedback => {
    const matchesSearch = feedback.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'approved' && feedback.approved) ||
      (statusFilter === 'pending' && !feedback.approved)
    
    return matchesSearch && matchesStatus
  })

  const sortedFeedbacks = [...filteredFeedbacks].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case 'mostVotes':
        return b.totalVotes - a.totalVotes
      default:
        return 0
    }
  })

  const handleVote = async (feedbackId: number, isPositive: boolean) => {
    // TODO: Implement voting logic with smart contract
    console.log('Voting on feedback:', feedbackId, isPositive)
  }

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
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
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
              <p className="text-2xl font-bold text-gray-900">{mockFeedbacks.length}</p>
            </div>
            <ThumbsUp className="text-primary-600" size={24} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-success-600">
                {mockFeedbacks.filter(f => f.approved).length}
              </p>
            </div>
            <CheckCircle className="text-success-600" size={24} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-warning-600">
                {mockFeedbacks.filter(f => !f.approved).length}
              </p>
            </div>
            <Clock className="text-warning-600" size={24} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Votes</p>
              <p className="text-2xl font-bold text-gray-900">
                {mockFeedbacks.reduce((sum, f) => sum + f.totalVotes, 0)}
              </p>
            </div>
            <ThumbsDown className="text-gray-600" size={24} />
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-gray-600">
          Showing {sortedFeedbacks.length} of {mockFeedbacks.length} feedback entries
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
              canVote={true} // TODO: Check user's badge tier
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="search"
          title="No feedback found"
          description="Try adjusting your search terms or filters."
        />
      )}

      {/* Load More */}
      {sortedFeedbacks.length > 0 && (
        <div className="text-center mt-12">
          <button className="btn-outline">
            Load More Feedback
          </button>
        </div>
      )}
    </div>
  )
}
