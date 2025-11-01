import { Package, Eye, MessageSquare, User } from 'lucide-react'
import Link from 'next/link'

interface Product {
  id: number
  name: string
  description: string
  imageUrl: string
  owner: string
  feedbackCount: number
}

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <Link href={`/products/${product.id}`} className="group">
      <div className="card hover:shadow-lg transition-all duration-300 group-hover:scale-105">
        {/* Product Image */}
        <div className="aspect-w-16 aspect-h-9 mb-4 rounded-lg overflow-hidden bg-gray-100">
          <img
            src={product.imageUrl || '/placeholder-product.jpg'}
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
          />
        </div>

        {/* Product Info */}
        <div className="space-y-3">
          <div>
            <h3 className="text-lg font-semibold text-white-900 group-hover:text-primary-600 transition-colors">
              {product.name}
            </h3>
            <p className="text-white-600 text-sm line-clamp-2 mt-1">
              {product.description}
            </p>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              {/* <div className="flex items-center space-x-1">
                <MessageSquare size={14} />
                <span>{product.feedbackCount} reviews</span>
              </div> */}
            </div>
            <div className="flex items-center space-x-1">
              <User size={14} />
              <span>{formatAddress(product.owner)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
