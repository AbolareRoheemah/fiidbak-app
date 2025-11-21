import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useGetOwnerProducts } from './useContract'
import { getUploadedFile } from '@/utils/pinata'

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

export function useUserProducts() {
  const { address } = useAccount()
  const [products, setProducts] = useState<Product[]>([])
  const [isFetchingIPFS, setIsFetchingIPFS] = useState(false)

  const {
    data: productsData,
    isLoading: isContractLoading,
    error: fetchError,
    refetch
  } = useGetOwnerProducts(address as `0x${string}`, 50, 0)

  // Fetch IPFS data for products
  useEffect(() => {
    let ignore = false

    async function fetchIPFSData() {
      if (!productsData || !Array.isArray(productsData) || productsData.length === 0) {
        setProducts([])
        return
      }

      setIsFetchingIPFS(true)

      const contractProducts = productsData as ContractProduct[]
      const productsWithIPFS = await Promise.all(
        contractProducts
          .filter(p => p.exists)
          .map(async (p) => {
            let ipfsData: { name?: string; description?: string; image?: string } = {}
            try {
              const url = await getUploadedFile(p.ipfsCid)
              if (url) {
                const res = await fetch(url)
                if (res.ok) {
                  ipfsData = await res.json()
                }
              }
            } catch (e) {
              console.error(`Failed to fetch IPFS data for product ${p.productId}:`, e)
              ipfsData = {}
            }

            return {
              id: Number(p.productId),
              name: ipfsData.name || '',
              description: ipfsData.description || '',
              imageUrl: ipfsData.image || '',
              owner: p.owner,
              feedbackCount: 0,
              createdAt: new Date(Number(p.createdAt) * 1000).toISOString().substring(0, 10),
              ipfsCid: p.ipfsCid
            }
          })
      )

      // Remove products with no name, description, and image (all blank)
      const cleanedProducts = productsWithIPFS.filter(
        p => !!p.name || !!p.description || !!p.imageUrl
      )

      if (!ignore) {
        setProducts(cleanedProducts)
        setIsFetchingIPFS(false)
      }
    }

    fetchIPFSData()

    return () => {
      ignore = true
    }
  }, [productsData])

  const error = fetchError ? 'Failed to fetch products' : null
  const isLoading = isContractLoading || isFetchingIPFS

  return {
    products,
    isLoading,
    error,
    refetch
  }
}
