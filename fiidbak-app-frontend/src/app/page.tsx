'use client'

import { ArrowRight, Shield, Users, Zap } from "lucide-react"
import { ProductCard } from "../components/ui/ProductCard"
import { LoadingSpinner } from "../components/ui/LoadingSpinner"
import Link from "next/link"
import { useProductStore, Product } from "@/store/useProductStore"
import { useEffect, useState } from "react"
import { useGetAllProducts } from "@/hooks/useContract"
import { getUploadedFile } from "@/utils/pinata"

interface ContractProduct {
  productId: bigint
  owner: string
  ipfsCid: string
  createdAt: bigint
  exists: boolean
}

const features = [
  {
    icon: Shield,
    title: "Blockchain Verified",
    description:
      "Every review is recorded on-chain. Once submitted, feedback can't be deleted or manipulated by anyone.",
  },
  {
    icon: Users,
    title: "Earn Reputation",
    description: "Quality reviewers earn badges and reputation. Your voice matters more when you contribute thoughtfully.",
  },
  {
    icon: Zap,
    title: "NFT Proof",
    description: "Get an NFT for each review you write. Own your contributions and build your reviewer portfolio.",
  },
]

// Simple button component using only HTML and Tailwind CSS
function SimpleButton({
  href,
  children,
  className = "",
  variant = "primary",
}: {
  href: string
  children: React.ReactNode
  className?: string
  variant?: "primary" | "outline" | "accent"
}) {
  const base =
    "inline-flex items-center justify-center rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
  const size = "text-lg px-8 py-6"
  let variantClass = ""
  if (variant === "primary") {
    variantClass = "gradient-primary glow-primary text-white border border-transparent"
  } else if (variant === "outline") {
    variantClass =
      "bg-transparent border border-primary/20 text-primary hover:bg-primary/10"
  } else if (variant === "accent") {
    variantClass = "gradient-accent glow-accent text-white border border-transparent"
  }
  return (
    <Link
      href={href}
      className={`${base} ${size} ${variantClass} ${className}`}
    >
      {children}
    </Link>
  )
}

export default function Home() {
  const { products: storeProducts, hasProducts } = useProductStore()
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)

  // Fetch products from contract
  const {
    data: productsRaw = [],
    isLoading: contractLoading,
  } = useGetAllProducts([BigInt(10), BigInt(0)])

  // Fetch IPFS data for products
  useEffect(() => {
    let ignore = false

    async function fetchProducts() {
      // Try to use products from store first
      if (hasProducts() && storeProducts.length > 0) {
        setFeaturedProducts(storeProducts.slice(0, 3))
        return
      }

      // Otherwise fetch from contract
      if (!productsRaw || !Array.isArray(productsRaw) || productsRaw.length === 0) {
        setFeaturedProducts([])
        return
      }

      setIsLoadingProducts(true)

      const contractProducts = productsRaw as ContractProduct[]

      // Filter out default/empty products (same as products page)
      const validProducts = contractProducts.filter(
        (p) =>
          p &&
          p.productId &&
          Number(p.productId) !== 0 &&
          p.ipfsCid &&
          typeof p.ipfsCid === "string" &&
          p.ipfsCid.length > 0 &&
          p.exists === true
      )

      // If no valid products, return early
      if (validProducts.length === 0) {
        setFeaturedProducts([])
        setIsLoadingProducts(false)
        return
      }

      const productsWithIPFS = await Promise.all(
        validProducts
          .slice(0, 3) // Only get first 3 for featured section
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
              name: ipfsData.name || 'Unnamed Product',
              description: ipfsData.description || '',
              imageUrl: ipfsData.image || '',
              owner: p.owner,
              feedbackCount: 0,
              createdAt: new Date(Number(p.createdAt) * 1000).toISOString().substring(0, 10),
              ipfsCid: p.ipfsCid,
              hasValidData: !!(ipfsData.name && ipfsData.name !== 'Unnamed Product')
            }
          })
      )

      // Filter out products with no valid IPFS data
      const productsWithValidData = productsWithIPFS.filter(p => p.hasValidData)

      if (!ignore) {
        setFeaturedProducts(productsWithValidData)
        setIsLoadingProducts(false)
      }
    }

    fetchProducts()

    return () => {
      ignore = true
    }
  }, [productsRaw, storeProducts, hasProducts])

  const isLoading = contractLoading || isLoadingProducts

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-6xl md:text-8xl font-bold mb-6 tracking-tight">
              Product feedback,
              <span className="block text-gradient-primary">verified on-chain</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              Real reviews from real users. No bots, no fake ratings. Just honest feedback stored permanently on the blockchain.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <SimpleButton href="/products" variant="primary">
                <>
                  Browse Products
                  <ArrowRight size={20} className="ml-2" />
                </>
              </SimpleButton>
              <SimpleButton
                href="/create-product"
                variant="outline"
              >
                List Your Product
              </SimpleButton>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {/* <section className="py-20 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "20 days", label: "saved on daily builds.", company: "NETFLIX" },
              { value: "98%", label: "faster time to market.", company: "TripAdvisor" },
              { value: "300%", label: "increase in feedback.", company: "BOX" },
              { value: "6x", label: "faster to build + deploy.", company: "EBAY" },
            ].map((stat, index) => (
              <div
                key={index}
                className="glass-card p-6 rounded-xl text-center group hover:glow-primary transition-all duration-300"
              >
                <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground mb-4">{stat.label}</div>
                <div className="text-xs font-mono text-accent uppercase tracking-wider">{stat.company}</div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Features Section */}
      <section className="py-24 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why Fiidbak?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Traditional review platforms can delete, hide, or manipulate feedback. We can&apos;t.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="bg-card border border-border rounded-2xl p-8 hover:shadow-lg transition-shadow"
                >
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                    <Icon size={28} className="text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Recently Added Products
            </h2>
            <p className="text-lg text-muted-foreground">
              See what the community is reviewing
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No products available yet.</p>
              <SimpleButton href="/create-product" variant="primary">
                <>
                  Create First Product
                  <ArrowRight size={20} className="ml-2" />
                </>
              </SimpleButton>
            </div>
          )}

          <div className="text-center mt-12">
            <SimpleButton
              href="/products"
              variant="outline"
              className="border-primary/20 hover:bg-primary/10 bg-transparent"
            >
              <>
                View All Products
                <ArrowRight size={20} className="ml-2" />
              </>
            </SimpleButton>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-secondary/30">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">Start reviewing or list your product</h2>
          <p className="text-xl text-muted-foreground mb-12">
            Connect your wallet to get started. It&apos;s free.
          </p>
          <SimpleButton href="/products" variant="primary">
            <>
              Get Started
              <ArrowRight size={20} className="ml-2" />
            </>
          </SimpleButton>
        </div>
      </section>
    </div>
  )
}
