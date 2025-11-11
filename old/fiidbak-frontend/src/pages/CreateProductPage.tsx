import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Upload, X } from 'lucide-react'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

export function CreateProductPage() {
  const navigate = useNavigate()
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

    setIsLoading(true)
    
    try {
      // TODO: Implement product creation with smart contract
      console.log('Creating product:', formData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success('Product created successfully!')
      navigate('/products')
    } catch (error) {
      toast.error('Failed to create product. Please try again.')
      console.error('Error creating product:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/products')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} />
          <span>Back to Products</span>
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Create New Product</h1>
        <p className="text-gray-600 mt-2">
          Share your innovative product with the community and gather authentic feedback
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
          
          <div className="space-y-6">
            {/* Product Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your product name"
                className="input-field"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="input-field"
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
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your product in detail..."
                rows={6}
                className="input-field"
                required
              />
            </div>

            {/* Website */}
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                Website URL
              </label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="https://your-website.com"
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Image Upload */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Product Image</h2>
          
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
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload size={48} className="text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Upload a product image</p>
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
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Tags</h2>
          
          <div className="space-y-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a tag"
                className="input-field flex-1"
              />
              <button
                type="button"
                onClick={addTag}
                className="btn-primary"
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
                      className="text-primary-500 hover:text-primary-700"
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
            onClick={() => navigate('/products')}
            className="btn-secondary"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary flex items-center space-x-2"
            disabled={isLoading}
          >
            {isLoading && <LoadingSpinner size="sm" />}
            <span>{isLoading ? 'Creating...' : 'Create Product'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
