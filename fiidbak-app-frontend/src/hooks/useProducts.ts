import { useAccount } from 'wagmi'
import { useGetAllProducts } from './useContract'
import { uploadJsonToPinata } from '@/utils/pinata'
import toast from 'react-hot-toast'

// Contract Product struct matches this interface
interface ContractProduct {
  productId: bigint
  owner: string
  ipfsCid: string
  createdAt: bigint
  exists: boolean
}

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
  const { address } = useAccount()

  // Fetch products from contract (getting 50 products starting from index 0)
  const {
    data: productsData,
    isLoading,
    error: fetchError,
    refetch
  } = useGetAllProducts([BigInt(50), BigInt(0)])

  // Parse product data - contract now returns Product[] with correct field names
  const products: Product[] = Array.isArray(productsData)
    ? (productsData as ContractProduct[])
        .filter(p => p.exists) // Filter out deleted products
        .map((p) => ({
          id: Number(p.productId),
          name: '', // Will be fetched from IPFS
          description: '', // Will be fetched from IPFS
          imageUrl: '', // Will be fetched from IPFS
          owner: p.owner,
          feedbackCount: 0, // Will need to fetch separately or use getProductWithFeedbackCount
          createdAt: new Date(Number(p.createdAt) * 1000).toISOString().substring(0, 10),
          ipfsCid: p.ipfsCid
        }))
    : []

  const error = fetchError ? 'Failed to fetch products' : null

  const createProduct = async (productData: {
    name: string
    description: string
    imageUrl: string
    category: string
    website?: string
    tags: string[]
  }) => {
    if (!address) {
      throw new Error('Wallet not connected')
    }

    try {
      // Upload metadata to IPFS
      const metadata = {
        name: productData.name,
        description: productData.description,
        image: productData.imageUrl,
        category: productData.category,
        website: productData.website,
        tags: productData.tags,
        createdAt: new Date().toISOString(),
        creator: address
      }

      toast.loading('Uploading product metadata to IPFS...')
      const ipfsCid = await uploadJsonToPinata(metadata)
      toast.dismiss()

      if (!ipfsCid) {
        throw new Error('Failed to upload product metadata to IPFS')
      }

      // Note: The actual contract call should be done using useCreateProduct hook
      // This function returns the IPFS CID for the caller to use
      return ipfsCid
    } catch (err) {
      toast.dismiss()
      console.error('Error creating product:', err)
      throw err
    }
  }

  return {
    products,
    isLoading,
    error,
    createProduct,
    refetch
  }
}
