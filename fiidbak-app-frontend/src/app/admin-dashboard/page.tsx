"use client"
import { useState, useEffect } from "react"
import { Shield, Package, MessageSquare, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"
import { useAccount } from "wagmi"
import { useIsApprover, useApproveFeedback, useAllFeedbacksByRange, useGetAllProducts } from "@/hooks/useContract"
import { useRouter } from "next/navigation"

interface PendingFeedback {
  id: number | bigint
  content: string
  author: string
  productId: number
  productName?: string
  createdAt: string
  approved: boolean
}

interface ContractProduct {
  productId: bigint
  owner: string
  ipfsCid: string
  createdAt: bigint
  exists: boolean
}

interface ContractFeedback {
  feedbackId: bigint
  feedbackHash: string
  feedbackBy: string
  productId: bigint
  timestamp: bigint
  approved: boolean
}

export default function AdminPage() {
  const { address, isConnected } = useAccount()
  const [pendingFeedbacks, setPendingFeedbacks] = useState<PendingFeedback[]>([])
  const [approvedFeedbacks, setApprovedFeedbacks] = useState<PendingFeedback[]>([])
  const [isLoadingFeedbacks, setIsLoadingFeedbacks] = useState(false)
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending')
  const [productNames, setProductNames] = useState<Record<number, string>>({})
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalFeedback: 0,
    pendingApprovals: 0,
    approvedCount: 0,
  })

  // Check if user has approver role
  const { data: isApproverData, isLoading: isCheckingApprover } = useIsApprover(address as `0x${string}`)
  console.log("isApproverData", isApproverData)
  const isAdmin = Boolean(isApproverData)
  const router = useRouter()

  // Get all feedbacks
  const { data: allFeedbacksData, refetch: refetchFeedbacks } = useAllFeedbacksByRange(0, 100)
  console.log("allFeedbacksData", allFeedbacksData) 

  // Get all products for stats
  const { data: productsData } = useGetAllProducts([BigInt(100), BigInt(0)])
  console.log("productsData", productsData)

  // Approve feedback hook
  const { approveFeedback, isApproveLoading } = useApproveFeedback(async () => {
    // Refetch feedbacks after approval
    await refetchFeedbacks()
  })

  // Build product name mapping
  useEffect(() => {
    if (!productsData || !Array.isArray(productsData)) return

    const names: Record<number, string> = {}
    for (const product of productsData as ContractProduct[]) {
      if (product.productId) {
        // Fetch product name from IPFS CID if needed
        names[Number(product.productId)] = `Product #${product.productId}`
      }
    }
    setProductNames(names)
  }, [productsData])

  // Process feedbacks data
  useEffect(() => {
    const processFeedbacks = async () => {
      if (!allFeedbacksData || !Array.isArray(allFeedbacksData)) return

      setIsLoadingFeedbacks(true)
      try {
        const feedbacks = allFeedbacksData as ContractFeedback[]

        const pending = feedbacks
          .filter((f: ContractFeedback) => !f.approved)
          .map((f: ContractFeedback) => ({
            id: f.feedbackId || 0,
            content: f.feedbackHash || "",
            author: f.feedbackBy || "",
            productId: Number(f.productId || 0),
            productName: productNames[Number(f.productId || 0)] || `Product #${f.productId}`,
            createdAt: f.timestamp
              ? new Date(Number(f.timestamp) * 1000).toISOString().substring(0, 10)
              : "",
            approved: f.approved || false,
          }))

        const approved = feedbacks
          .filter((f: ContractFeedback) => f.approved)
          .map((f: ContractFeedback) => ({
            id: f.feedbackId || 0,
            content: f.feedbackHash || "",
            author: f.feedbackBy || "",
            productId: Number(f.productId || 0),
            productName: productNames[Number(f.productId || 0)] || `Product #${f.productId}`,
            createdAt: f.timestamp
              ? new Date(Number(f.timestamp) * 1000).toISOString().substring(0, 10)
              : "",
            approved: f.approved || false,
          }))

        setPendingFeedbacks(pending)
        setApprovedFeedbacks(approved)

        // Update stats
        setStats({
          totalProducts: Array.isArray(productsData) ? productsData.length : 0,
          totalFeedback: feedbacks.length,
          pendingApprovals: pending.length,
          approvedCount: approved.length,
        })
      } catch (error) {
        console.error("Error processing feedbacks:", error)
      } finally {
        setIsLoadingFeedbacks(false)
      }
    }

    processFeedbacks()
  }, [allFeedbacksData, productsData, productNames])

  if (!isConnected) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <Shield size={64} className="text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white-900 mb-2">Admin Access Required</h2>
          <p className="text-gray-600">Connect your wallet to access admin features.</p>
        </div>
      </div>
    )
  }

  if (isCheckingApprover) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <AlertTriangle size={64} className="text-warning-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don&apos;t have permission to access admin features.</p>
        </div>
      </div>
    )
  }

  const handleApproveFeedback = async (feedbackId: number | bigint) => {
    await approveFeedback(feedbackId)
  }

  const handleRejectFeedback = async (feedbackId: number | bigint) => {
    // Note: There's no reject function in the contract, only approve
    // Rejected feedback simply remains unapproved
    console.log("Feedback will remain unapproved:", feedbackId)
  }

  if (isLoadingFeedbacks) {
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
        <div className="flex items-center space-x-3 mb-2">
          <Shield size={32} className="text-gray-600" />
          <h1 className="text-3xl font-bold text-white-900">Admin Dashboard</h1>
        </div>
        <p className="text-gray-600">Manage the platform and moderate community content</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-white-900">{stats.totalProducts - 1}</p>
            </div>
            <Package className="text-gray-600" size={24} />
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Feedback</p>
              <p className="text-2xl font-bold text-white-900">{stats.totalFeedback}</p>
            </div>
            <MessageSquare className="text-gray-600" size={24} />
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
              <p className="text-2xl font-bold text-warning-600">{stats.pendingApprovals}</p>
            </div>
            <AlertTriangle className="text-warning-600" size={24} />
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-success-600">{stats.approvedCount}</p>
            </div>
            <CheckCircle className="text-success-600" size={24} />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8 grid grid-cols-1 gap-8">
        <div className="card p-4">
          <h3 className="text-lg font-semibold text-white-900 mb-4">Quick Actions</h3>
          <div className="flex gap-2">
            <button className="w-full btn-primary h-12 cursor-pointer" onClick={() => router.push('/products')}>View All Products</button>
            <button className="w-full border border-primary-500 text-primary-500 rounded-lg h-12 cursor-pointer" onClick={() => router.push('/feedbacks')}>View All Feedbacks</button>
          </div>
        </div>
      </div>

      {/* Moderation Section */}
      <div className="space-y-6">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('pending')}
              className={`py-2 px-1 border-b-2 font-medium text-sm cursor-pointer ${
                activeTab === 'pending'
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Pending Approvals
              <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                activeTab === 'pending' ? "bg-primary-100 text-primary-600" : "bg-gray-100 text-gray-600"
              }`}>
                {pendingFeedbacks.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={`py-2 px-1 border-b-2 font-medium text-sm cursor-pointer ${
                activeTab === 'approved'
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Approved Feedback
              <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                activeTab === 'approved' ? "bg-primary-100 text-primary-600" : "bg-gray-100 text-gray-600"
              }`}>
                {approvedFeedbacks.length}
              </span>
            </button>
          </nav>
        </div>

        {/* Pending Feedbacks */}
        {activeTab === 'pending' && pendingFeedbacks.length > 0 ? (
          <div className="space-y-4">
            {pendingFeedbacks.map((feedback) => (
              <div key={String(feedback.id)} className="card p-4">
                <div className="space-y-4">
                  <div>
                    <p className="text-white-700">{feedback.content}</p>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <span>Author: {feedback.author.slice(0, 6)}...{feedback.author.slice(-4)}</span>
                      <span className="font-medium text-primary-600">{feedback.productName || `Product #${feedback.productId}`}</span>
                      <span>Submitted: {new Date(feedback.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleApproveFeedback(feedback.id)}
                      disabled={isApproveLoading}
                      className="flex items-center space-x-2 btn-primary disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <CheckCircle size={16} />
                      <span>{isApproveLoading ? "Approving..." : "Approve"}</span>
                    </button>
                    <button
                      onClick={() => handleRejectFeedback(feedback.id)}
                      disabled={isApproveLoading}
                      className="flex items-center space-x-2 btn-outline border-red-500 text-red-500 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <XCircle size={16} />
                      <span>Skip</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === 'pending' ? (
          <div className="text-center py-12">
            <CheckCircle size={48} className="text-success-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white-900 mb-2">All caught up!</h3>
            <p className="text-gray-600">No pending feedback for moderation.</p>
          </div>
        ) : null}

        {/* Approved Feedbacks */}
        {activeTab === 'approved' && approvedFeedbacks.length > 0 ? (
          <div className="space-y-4">
            {approvedFeedbacks.map((feedback) => (
              <div key={String(feedback.id)} className="card p-4 border-none">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-white-700">{feedback.content}</p>
                    </div>
                    <span className="ml-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
                      Approved
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <span>Author: {feedback.author.slice(0, 6)}...{feedback.author.slice(-4)}</span>
                      <span className="font-medium text-primary-600">{feedback.productName || `Product #${feedback.productId}`}</span>
                      <span>Approved: {new Date(feedback.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === 'approved' ? (
          <div className="text-center py-12">
            <MessageSquare size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white-900 mb-2">No approved feedback yet</h3>
            <p className="text-gray-600">Approved feedback will appear here.</p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
