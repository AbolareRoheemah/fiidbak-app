import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useProductContract } from './useContract'

export interface Product {
  id: number
  name: string
  description: string
  imageUrl: string
  owner: string
  feedbackCount: number
  createdAt: string
  ipfsCid: string
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const productContract = useProductContract()
  const { address } = useAccount()

  const fetchProducts = async () => {
    if (!productContract) return

    setIsLoading(true)
    setError(null)

    try {
      // TODO: Implement actual contract calls
      // For now, using mock data
      const mockProducts: Product[] = [
        {
          id: 1,
          name: "Decentralized Social Media Platform",
          description: "A blockchain-based social media platform with user ownership and data privacy.",
          imageUrl: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400",
          owner: "0x1234...5678",
          feedbackCount: 23,
          createdAt: "2024-01-15",
          ipfsCid: "QmExample1"
        },
        {
          id: 2,
          name: "NFT Marketplace",
          description: "Trade and discover unique digital assets in our secure marketplace.",
          imageUrl: "https://images.unsplash.com/photo-1639322537228-f912d0a4d3d8?w=400",
          owner: "0x8765...4321",
          feedbackCount: 45,
          createdAt: "2024-01-10",
          ipfsCid: "QmExample2"
        }
      ]

      setProducts(mockProducts)
    } catch (err) {
      setError('Failed to fetch products')
      console.error('Error fetching products:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const createProduct = async (productData: {
    name: string
    description: string
    imageUrl: string
    category: string
    website?: string
    tags: string[]
  }) => {
    if (!productContract || !address) {
      throw new Error('Contract or wallet not available')
    }

    try {
      // TODO: Upload metadata to IPFS first
      const metadata = {
        name: productData.name,
        description: productData.description,
        image: productData.imageUrl,
        category: productData.category,
        website: productData.website,
        tags: productData.tags
      }

      // TODO: Get IPFS CID after uploading
      const ipfsCid = "QmExampleNewProduct"

      // TODO: Call contract method
      // await productContract.write.mintProduct([address, 1, ipfsCid])

      console.log('Product created:', productData)
      return true
    } catch (err) {
      console.error('Error creating product:', err)
      throw err
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [productContract])

  return {
    products,
    isLoading,
    error,
    createProduct,
    refetch: fetchProducts
  }
}
