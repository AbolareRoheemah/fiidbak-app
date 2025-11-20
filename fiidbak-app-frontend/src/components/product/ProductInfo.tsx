import { User } from "lucide-react"

interface Product {
  id: number
  name: string
  description: string
  imageUrl: string
  owner: string
  category?: string
  tags?: string[]
  website?: string
  feedbackCount: number
}

interface ProductInfoProps {
  product: Product
  feedbackCount: number
}

export function ProductInfo({ product, feedbackCount }: ProductInfoProps) {
  const formatAddress = (address: string) => {
    if (!address || address.length < 10) return address
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div className="card mb-8">
      <div className="aspect-w-16 aspect-h-9 mb-6 rounded-lg overflow-hidden bg-gray-100">
        <img src={product.imageUrl} alt={product.name} className="w-full h-100 object-cover" />
      </div>

      <div className="space-y-6 p-4">
        <div>
          <h1 className="text-3xl font-bold text-white-900 mb-2">{product.name}</h1>
          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
            <span>{feedbackCount} reviews</span>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white-900 mb-3">Description</h2>
          <p className="text-white-700 leading-relaxed">{product.description}</p>
        </div>

        {/* Category */}
        {product.category && (
          <div>
            <h3 className="text-lg font-semibold text-white-900 mb-3">Category</h3>
            <span className="px-3 py-1 text-blue-700 text-sm font-medium">
              {product.category}
            </span>
          </div>
        )}

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-white-900 mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Owner Info */}
        <div>
          <h3 className="text-lg font-semibold text-white-900 mb-3">Created by</h3>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <User size={20} className="text-white-600" />
            </div>
            <div>
              <div className="font-medium text-white-900">{formatAddress(product.owner)}</div>
              <div className="text-sm text-gray-500">Product Owner</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
