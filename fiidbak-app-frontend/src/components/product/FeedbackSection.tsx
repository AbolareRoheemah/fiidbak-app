import { useState } from "react"
import { MessageSquare, Plus } from "lucide-react"
import { FeedbackCard } from "@/components/ui/FeedbackCard"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"
import { EmptyState } from "@/components/ui/EmptyState"

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

interface FeedbackSectionProps {
  feedbacks: Feedback[]
  isLoading: boolean
  onSubmitFeedback: (content: string) => Promise<void>
  onVote: (feedbackId: number | bigint, isPositive: boolean) => Promise<void>
  isFeedbackLoading: boolean
}

export function FeedbackSection({
  feedbacks,
  isLoading,
  onSubmitFeedback,
  onVote,
  isFeedbackLoading,
}: FeedbackSectionProps) {
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)
  const [newFeedback, setNewFeedback] = useState("")

  const handleSubmit = async () => {
    if (!newFeedback.trim()) return

    await onSubmitFeedback(newFeedback)
    setNewFeedback("")
    setShowFeedbackForm(false)
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white-900 flex items-center space-x-2">
          <MessageSquare size={24} />
          <span>Feedback ({feedbacks.length})</span>
        </h2>
        <button
          onClick={() => setShowFeedbackForm(!showFeedbackForm)}
          className="btn-primary flex items-center space-x-2 cursor-pointer"
        >
          <Plus size={20} />
          <span>Add Feedback</span>
        </button>
      </div>

      {/* Feedback Form */}
      {showFeedbackForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-white-900 mb-3 cursor-pointer">Share your feedback</h3>
          <textarea
            value={newFeedback}
            onChange={(e) => setNewFeedback(e.target.value)}
            placeholder="Share your honest feedback about this product..."
            rows={4}
            className="w-full input-field mb-4 text-black"
            disabled={isFeedbackLoading}
          />
          <div className="flex space-x-3">
            <button
              onClick={handleSubmit}
              className="btn-primary cursor-pointer"
              disabled={isFeedbackLoading}
            >
              {isFeedbackLoading ? "Submitting..." : "Submit Feedback"}
            </button>
            <button
              onClick={() => {
                setShowFeedbackForm(false)
                setNewFeedback("")
              }}
              className="btn-secondary cursor-pointer"
              disabled={isFeedbackLoading}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Feedback List */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      ) : feedbacks.length > 0 ? (
        <div className="space-y-6">
          {feedbacks.map((feedback) => (
            <FeedbackCard
              key={String(feedback.id)}
              feedback={feedback}
              onVote={onVote}
              canVote={true}
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
            onClick: () => setShowFeedbackForm(true),
          }}
        />
      )}
    </div>
  )
}
