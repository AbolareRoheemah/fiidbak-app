import { useState } from 'react'
import { ThumbsUp, ThumbsDown, CheckCircle, Clock, User } from 'lucide-react'
import { BadgeDisplay } from './BadgeDisplay'

interface Feedback {
  id: number | bigint
  content: string
  author: string
  authorTier: number
  productId: number
  positiveVotes: number
  negativeVotes: number
  totalVotes: number
  approved: boolean
  createdAt?: string
  hasUserVoted: boolean
  userVote: boolean | null
}

interface FeedbackCardProps {
  feedback: Feedback
  onVote: (feedbackId: number | bigint, isPositive: boolean) => void
  canVote: boolean
}

export function FeedbackCard({ feedback, onVote, canVote }: FeedbackCardProps) {
  const [isVoting, setIsVoting] = useState(false)

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const handleVote = async (isPositive: boolean) => {
    if (!canVote || isVoting || feedback.hasUserVoted) return
    
    setIsVoting(true)
    try {
      await onVote(feedback.id, isPositive)
    } finally {
      setIsVoting(false)
    }
  }

  const getVotePercentage = () => {
    if (feedback.totalVotes === 0) return 0
    return Math.round((feedback.positiveVotes / feedback.totalVotes) * 100)
  }

  return (
    <div className="card">
      <div className="space-y-4 p-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <User size={20} className="text-gray-600" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-500">
                  {formatAddress(feedback.author)}
                </span>
                <BadgeDisplay tier={feedback.authorTier} />
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                {feedback.createdAt && <span>{new Date(feedback.createdAt).toLocaleDateString()}</span>}
                {feedback.approved ? (
                  <div className="flex items-center space-x-1 text-success-600">
                    <CheckCircle size={14} />
                    <span>Approved</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 text-warning-600">
                    <Clock size={14} />
                    <span>Pending</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="text-white-700">
          {feedback.content}
        </div>

        {/* Voting Section */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleVote(true)}
                disabled={!canVote || isVoting || feedback.hasUserVoted}
                className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  feedback.userVote === true
                    ? 'bg-success-100 text-success-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-success-50 hover:text-success-600'
                } ${!canVote || isVoting || feedback.hasUserVoted ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <ThumbsUp size={14} />
                <span>{feedback.positiveVotes}</span>
              </button>
              
              <button
                onClick={() => handleVote(false)}
                disabled={!canVote || isVoting || feedback.hasUserVoted}
                className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  feedback.userVote === false
                    ? 'bg-error-100 text-error-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-error-50 hover:text-error-600'
                } ${!canVote || isVoting || feedback.hasUserVoted ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <ThumbsDown size={14} />
                <span>{feedback.negativeVotes}</span>
              </button>
            </div>
          </div>

          <div className="text-sm text-gray-500">
            {getVotePercentage()}% positive
          </div>
        </div>

        {/* Voting Status */}
        {feedback.hasUserVoted && (
          <div className="text-sm text-primary-600 bg-primary-50 px-3 py-2 rounded-lg">
            You&apos;ve already voted on this feedback
          </div>
        )}
        
        {!canVote && !feedback.hasUserVoted && (
          <div className="text-sm text-warning-600 bg-warning-50 px-3 py-2 rounded-lg">
            You need a Wooden badge or higher to vote
          </div>
        )}
      </div>
    </div>
  )
}
