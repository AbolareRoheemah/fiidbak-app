"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload, X } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'
import { uploadFileToPinata, uploadJsonToPinata } from '@/utils/pinata'
import { useCreateProduct } from '@/hooks/useContract'
import { useAccount } from 'wagmi'

export default function CreateProductPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    website: '',
    tags: [] as string[],
    image: null as File | null
  })
  const [tagInput, setTagInput] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const { address } = useAccount()
  const { createProduct, isCreateLoading, isCreateSuccess } = useCreateProduct(() => router.push('/products'))

  const categories = [
    'DeFi',
    'NFT',
    'Social Media',
    'Gaming',
    'DAO',
    'Infrastructure',
    'Tools',
    'Other'
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({ ...prev, image: file }))
      
      // Create preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }))
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.description) {
      toast.error('Please fill in all required fields')
      return
    }
    if (!address) {
      toast.error('Please connect your wallet')
      return
    }

    console.log('🚀 Creating product with data:', formData)
    setIsLoading(true)

    try {
      // 1. Upload product data to IPFS via Pinata
      console.log('📤 Uploading to IPFS...')
      const ipfsPayload: Record<string, any> = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        website: formData.website,
        tags: formData.tags,
        image: formData.image
      }

      let ipfsCid: string
      ipfsCid = await uploadJsonToPinata(ipfsPayload)
      console.log('✅ IPFS Upload successful, CID:', ipfsCid)

      // 2. Call the contract to mint the product NFT
      console.log('📝 Calling contract with:', {
        owner: address,
        amount: 1,
        ipfsCid
      })
      await createProduct(address as `0x${string}`, 1, ipfsCid)
      console.log('✅ Contract call initiated')
      // Success toast will be handled by the hook
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to create product. Please try again.'
      toast.error(errorMessage)
      console.error('❌ Error creating product:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Add border and outline classes to all input, select, textarea
  const inputClass =
    "input-field border border-gray-400 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors w-full p-4"
  const selectClass =
    "input-field border border-gray-400 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors w-full p-4"
  const textareaClass =
    "input-field border border-gray-400 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors w-full p-4"

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push('/products')}
          className="flex items-center space-x-2 text-white-600 hover:text-white-900 mb-4 cursor-pointer"
        >
          <ArrowLeft size={20} />
          <span>Back to Products</span>
        </button>
        <h1 className="text-3xl font-bold text-white-900">Create New Product</h1>
        <p className="text-white-600 mt-2">
          Share your innovative product with the community and gather authentic feedback
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="card">
          <h2 className="text-xl font-semibold text-white-900 mb-6">Basic Information</h2>
          
          <div className="space-y-6">
            {/* Product Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-white-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your product name"
                className={inputClass}
                required
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-white-700 mb-2">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={selectClass}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-white-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your product in detail..."
                rows={6}
                className={textareaClass}
                required
              />
            </div>

            {/* Website */}
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-white-700 mb-2">
                Website URL
              </label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="https://your-website.com"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Image Upload */}
        <div className="card">
          <h2 className="text-xl font-semibold text-white-900 mb-6">Product Image</h2>
          
          <div className="space-y-4">
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Product preview"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null)
                    setFormData(prev => ({ ...prev, image: null }))
                  }}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload size={48} className="text-white-400 mx-auto mb-4" />
                <p className="text-white-600 mb-4">Upload a product image</p>
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label
                  htmlFor="image"
                  className="btn-primary cursor-pointer inline-block"
                >
                  Choose File
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="card">
          <h2 className="text-xl font-semibold text-white-900 mb-6">Tags</h2>
          
          <div className="space-y-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a tag"
                className={inputClass + " flex-1"}
              />
              <button
                type="button"
                onClick={addTag}
                className="btn-primary cursor-pointer"
              >
                Add
              </button>
            </div>
            
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center space-x-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-primary-500 hover:text-primary-700 cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.push('/products')}
            className="btn-secondary cursor-pointer"
            disabled={isLoading || isCreateLoading || isCreateSuccess}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary flex items-center space-x-2 cursor-pointer"
            disabled={isLoading || isCreateLoading || isCreateSuccess}
          >
            {(isLoading || isCreateLoading || isCreateSuccess) && <LoadingSpinner size="sm" />}
            <span>{(isLoading || isCreateLoading || isCreateSuccess) ? 'Creating...' : 'Create Product'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
