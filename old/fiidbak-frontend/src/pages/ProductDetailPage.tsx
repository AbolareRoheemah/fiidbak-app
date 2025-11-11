import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, MessageSquare, ThumbsUp, ThumbsDown, Plus, User } from 'lucide-react'
import { FeedbackCard } from '../components/ui/FeedbackCard'
import { BadgeDisplay } from '../components/ui/BadgeDisplay'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { EmptyState } from '../components/ui/EmptyState'

// Mock data - replace with actual data from contracts
const mockProduct = {
  id: 1,
  name: "Decentralized Social Media Platform",
  description: "A revolutionary blockchain-based social media platform that gives users complete ownership of their data and content. Built on Ethereum with IPFS for decentralized storage, this platform ensures privacy, censorship resistance, and fair monetization for creators.",
  imageUrl: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800",
  owner: "0x1234567890abcdef1234567890abcdef12345678",
  feedbackCount: 23,
  createdAt: "2024-01-15",
  category: "Social Media",
  website: "https://example.com",
  tags: ["Web3", "Social Media", "Privacy", "DeFi"]
}

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
  }
]

export function ProductDetailPage() {
  const { id } = useParams()
  const [product, setProduct] = useState(mockProduct)
  const [feedbacks, setFeedbacks] = useState(mockFeedbacks)
  const [isLoading, setIsLoading] = useState(false)
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)
  const [newFeedback, setNewFeedback] = useState('')

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const handleVote = async (feedbackId: number, isPositive: boolean) => {
    // TODO: Implement voting logic with smart contract
    console.log('Voting on feedback:', feedbackId, isPositive)
  }

  const handleSubmitFeedback = async () => {
    if (!newFeedback.trim()) return
    
    // TODO: Implement feedback submission with smart contract
    console.log('Submitting feedback:', newFeedback)
    setNewFeedback('')
    setShowFeedbackForm(false)
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
      {/* Back Button */}
      <Link 
        to="/products" 
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft size={20} />
        <span>Back to Products</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Product Info */}
        <div className="lg:col-span-2">
          <div className="card mb-8">
            <div className="aspect-w-16 aspect-h-9 mb-6 rounded-lg overflow-hidden bg-gray-100">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-64 object-cover"
              />
            </div>

            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                  <span>Created {new Date(product.createdAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{product.feedbackCount} reviews</span>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>

              {/* Tags */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Owner Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Created by</h3>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <User size={20} className="text-gray-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{formatAddress(product.owner)}</div>
                    <div className="text-sm text-gray-500">Product Owner</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feedback Section */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                <MessageSquare size={24} />
                <span>Feedback ({feedbacks.length})</span>
              </h2>
              <button
                onClick={() => setShowFeedbackForm(!showFeedbackForm)}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus size={20} />
                <span>Add Feedback</span>
              </button>
            </div>

            {/* Feedback Form */}
            {showFeedbackForm && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Share your feedback</h3>
                <textarea
                  value={newFeedback}
                  onChange={(e) => setNewFeedback(e.target.value)}
                  placeholder="Share your honest feedback about this product..."
                  rows={4}
                  className="w-full input-field mb-4"
                />
                <div className="flex space-x-3">
                  <button
                    onClick={handleSubmitFeedback}
                    className="btn-primary"
                  >
                    Submit Feedback
                  </button>
                  <button
                    onClick={() => {
                      setShowFeedbackForm(false)
                      setNewFeedback('')
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Feedback List */}
            {feedbacks.length > 0 ? (
              <div className="space-y-6">
                {feedbacks.map((feedback) => (
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
                icon="feedback"
                title="No feedback yet"
                description="Be the first to share your thoughts about this product."
                action={{
                  label: "Add Feedback",
                  onClick: () => setShowFeedbackForm(true)
                }}
              />
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats Card */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Reviews</span>
                <span className="font-semibold">{product.feedbackCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Approved Reviews</span>
                <span className="font-semibold">{feedbacks.filter(f => f.approved).length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Average Rating</span>
                <span className="font-semibold">4.2/5</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full btn-primary">
                Share Product
              </button>
              <button className="w-full btn-outline">
                Report Issue
              </button>
              {product.website && (
                <a
                  href={product.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full btn-secondary block text-center"
                >
                  Visit Website
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
