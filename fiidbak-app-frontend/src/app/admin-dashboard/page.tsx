"use client"
import { useState, useEffect } from "react"
import { Shield, Users, Package, MessageSquare, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"
import { useAccount } from "wagmi"
import { useIsApprover, useApproveFeedback, useAllFeedbacksByRange, getAllProducts } from "@/hooks/useContract"
import { readContract } from '@wagmi/core'
import { config } from '@/app/wagmi'
import { FEEDBACK_MANAGER_ABI } from '@/lib/feedback_mg_abi'
import { CONTRACT_ADDRESSES } from '@/lib/contracts'

interface PendingFeedback {
  id: number | bigint
  content: string
  author: string
  productId: number
  productName?: string
  createdAt: string
  approved: boolean
}

export default function AdminPage() {
  const { address, isConnected } = useAccount()
  const [activeTab, setActiveTab] = useState<"overview" | "moderation" | "users">("overview")
  const [pendingFeedbacks, setPendingFeedbacks] = useState<PendingFeedback[]>([])
  const [isLoadingFeedbacks, setIsLoadingFeedbacks] = useState(false)
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalFeedback: 0,
    pendingApprovals: 0,
  })

  // Check if user has approver role
  const { data: isApproverData, isLoading: isCheckingApprover } = useIsApprover(address as `0x${string}`)
  const isAdmin = Boolean(isApproverData)
  console.log("isApproverData", isApproverData)

  // Get all feedbacks
  const { data: allFeedbacksData, refetch: refetchFeedbacks } = useAllFeedbacksByRange(0, 100)

  // Get all products for stats
  const { data: productsData } = getAllProducts([100, 0])

  // Approve feedback hook
  const { approveFeedback, isApproveLoading } = useApproveFeedback(async () => {
    // Refetch feedbacks after approval
    await refetchFeedbacks()
  })

  // Process feedbacks data
  useEffect(() => {
    const processFeedbacks = async () => {
      if (!allFeedbacksData || !Array.isArray(allFeedbacksData)) return

      setIsLoadingFeedbacks(true)
      try {
        const feedbacks = allFeedbacksData as any[]
        const pending = feedbacks
          .filter((f: any) => !f.approved)
          .map((f: any) => ({
            id: f.feedbackId || 0,
            content: f.feedbackHash || "",
            author: f.feedbackBy || "",
            productId: Number(f.productId || 0),
            createdAt: f.timestamp
              ? new Date(Number(f.timestamp) * 1000).toISOString().substring(0, 10)
              : "",
            approved: f.approved || false,
          }))

        setPendingFeedbacks(pending)

        // Update stats
        setStats({
          totalProducts: Array.isArray(productsData) ? productsData.length : 0,
          totalFeedback: feedbacks.length,
          pendingApprovals: pending.length,
        })
      } catch (error) {
        console.error("Error processing feedbacks:", error)
      } finally {
        setIsLoadingFeedbacks(false)
      }
    }

    processFeedbacks()
  }, [allFeedbacksData, productsData])

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
          <p className="text-gray-600">You don't have permission to access admin features.</p>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-white-900">{stats.totalProducts}</p>
            </div>
            <Package className="text-gray-600" size={24} />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Feedback</p>
              <p className="text-2xl font-bold text-white-900">{stats.totalFeedback}</p>
            </div>
            <MessageSquare className="text-success-600" size={24} />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
              <p className="text-2xl font-bold text-warning-600">{stats.pendingApprovals}</p>
            </div>
            <AlertTriangle className="text-warning-600" size={24} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: "overview", name: "Overview" },
              { id: "moderation", name: "Moderation" },
              { id: "users", name: "User Management" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-primary-500 text-gray-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card">
            <h3 className="text-lg font-semibold text-white-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Package size={20} className="text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">New product created</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <MessageSquare size={20} className="text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Feedback submitted</p>
                  <p className="text-xs text-gray-500">4 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Users size={20} className="text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">New user registered</p>
                  <p className="text-xs text-gray-500">6 hours ago</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-white-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full btn-primary">View All Products</button>
              <button className="w-full btn-outline">Manage Users</button>
              <button className="w-full btn-outline">System Settings</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "moderation" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white-900">Pending Feedback Moderation</h3>
            <span className="text-sm text-white-500">{pendingFeedbacks.length} items</span>
          </div>

          {pendingFeedbacks.length > 0 ? (
            <div className="space-y-4">
              {pendingFeedbacks.map((feedback) => (
                <div key={String(feedback.id)} className="card">
                  <div className="space-y-4">
                    <div>
                      <p className="text-white-700">{feedback.content}</p>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span>Author: {feedback.author.slice(0, 6)}...{feedback.author.slice(-4)}</span>
                        <span>Product ID: {feedback.productId}</span>
                        <span>Submitted: {new Date(feedback.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex space-x-3 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => handleApproveFeedback(feedback.id)}
                        disabled={isApproveLoading}
                        className="flex items-center space-x-2 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CheckCircle size={16} />
                        <span>{isApproveLoading ? "Approving..." : "Approve"}</span>
                      </button>
                      <button
                        onClick={() => handleRejectFeedback(feedback.id)}
                        disabled={isApproveLoading}
                        className="flex items-center space-x-2 btn-outline border-red-500 text-red-500 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <XCircle size={16} />
                        <span>Skip</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CheckCircle size={48} className="text-success-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white-900 mb-2">All caught up!</h3>
              <p className="text-gray-600">No pending feedback for moderation.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "users" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white-900">User Management</h3>
            <div className="flex space-x-3">
              <input type="text" placeholder="Search users..." className="input-field w-64" />
              <button className="btn-primary">Search</button>
            </div>
          </div>

          <div className="card">
            <div className="text-center py-12">
              <Users size={48} className="text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white-900 mb-2">User Management</h3>
              <p className="text-gray-600 mb-6">User management features coming soon.</p>
              <button className="btn-primary">View All Users</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
