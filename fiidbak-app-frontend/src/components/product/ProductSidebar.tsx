import { useCallback } from "react"

interface Product {
  website?: string
}

interface ProductSidebarProps {
  product: Product
  totalFeedbacks: number
  approvedFeedbacks: number
}

export function ProductSidebar({
  product,
  totalFeedbacks,
  approvedFeedbacks,
}: ProductSidebarProps) {
  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator
        .share({
          title: "Check out this product on Fiidbak!",
          url: typeof window !== "undefined" ? window.location.href : "",
        })
        .catch(() => {
          // User cancelled or error. Do nothing.
        })
    } else if (typeof window !== "undefined" && window.location.href) {
      // Fallback: copy to clipboard
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => {
          alert("Product URL copied to clipboard!")
        })
        .catch(() => {
          alert("Failed to copy URL.")
        })
    }
  }, [])

  return (
    <div className="space-y-6">
      {/* Stats Card */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white-900 mb-4">Statistics</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-white-600">Total Reviews</span>
            <span className="font-semibold">{totalFeedbacks}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white-600">Approved Reviews</span>
            <span className="font-semibold">{approvedFeedbacks}</span>
          </div>
          {/* <div className="flex items-center justify-between">
            <span className="text-white-600">Average Rating</span>
            <span className="font-semibold">4.2/5</span>
          </div> */}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white-900 mb-4">Quick Actions</h3>
        <div className="space-y-3">
          <button
            className="w-full btn-primary cursor-pointer"
            onClick={handleShare}
            type="button"
          >
            Share Product
          </button>
          {/* <button className="w-full btn-outline cursor-pointer">Report Issue</button> */}
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
  )
}
