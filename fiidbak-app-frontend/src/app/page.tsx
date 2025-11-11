'use client'

import { ArrowRight, Shield, Users, Zap, TrendingUp, Star, Sparkles } from "lucide-react"
import { ProductCard } from "../components/ui/ProductCard"
import { LoadingSpinner } from "../components/ui/LoadingSpinner"
import Link from "next/link"
import { useProductStore } from "@/store/useProductStore"
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

interface Product {
  id: number
  name: string
  description: string
  imageUrl: string
  owner: string
  feedbackCount: number
  createdAt: string
  ipfsCid: string
}

const features = [
  {
    icon: Shield,
    title: "Verified Reviews",
    description:
      "All feedback is verified through blockchain technology ensuring authenticity and preventing fake reviews.",
  },
  {
    icon: Users,
    title: "Community Driven",
    description: "Community voting system with weighted votes based on user reputation and badge tiers.",
  },
  {
    icon: Zap,
    title: "Instant Rewards",
    description: "Earn badges and reputation for quality feedback, creating a gamified experience.",
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
      const productsWithIPFS = await Promise.all(
        contractProducts
          .filter(p => p.exists)
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
              ipfsCid: p.ipfsCid
            }
          })
      )

      if (!ignore) {
        setFeaturedProducts(productsWithIPFS)
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
      <section className="relative py-24 overflow-hidden">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,oklch(0.2_0_0)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.2_0_0)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-8">
              <Sparkles size={16} className="text-primary" />
              <span className="text-sm font-medium text-primary">{"Powered by Blockchain Technology"}</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-8 text-balance">
              The complete
              <span className="block text-gradient-primary">platform for</span>
              <span className="block">authentic feedback</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto text-pretty">
              {
                "Your team's toolkit to stop configuring and start innovating. Securely build, deploy, and scale the best feedback experiences with blockchain."
              }
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <SimpleButton href="/products" variant="primary">
                <>
                  Explore Products
                  <ArrowRight size={20} className="ml-2" />
                </>
              </SimpleButton>
              <SimpleButton
                href="/create-product"
                variant="outline"
              >
                Create Product
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
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center space-x-2 text-primary mb-6">
                <Sparkles size={16} />
                <span className="text-sm font-medium uppercase tracking-wider">Collaboration</span>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
                Faster iteration.
                <span className="block text-gradient-primary">More innovation.</span>
              </h2>

              <p className="text-lg text-muted-foreground mb-8 text-pretty">
                The platform for rapid progress. Let your team focus on shipping features instead of managing
                infrastructure with automated feedback collection, built-in verification, and integrated community
                governance.
              </p>
            </div>

            <div className="space-y-6">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <div
                    key={index}
                    className="glass-card p-6 rounded-xl group hover:glow-primary transition-all duration-300"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon size={24} className="text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                        <p className="text-muted-foreground text-pretty">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 text-primary mb-6">
              <TrendingUp size={16} />
              <span className="text-sm font-medium uppercase tracking-wider">Featured Products</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
              Make teamwork seamless.
              <span className="block text-muted-foreground text-2xl font-normal mt-2">
                Tools for your team and stakeholders to share feedback and iterate faster.
              </span>
            </h2>
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
      <section className="py-24 border-t border-border">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">Ready to Join the Future of Feedback?</h2>
          <p className="text-xl text-muted-foreground mb-12 text-pretty">
            Connect your wallet and start earning badges for quality reviews today.
          </p>
          <SimpleButton href="/products" variant="accent">
            <>
              <Star size={20} className="mr-2" />
              Get Started
            </>
          </SimpleButton>
        </div>
      </section>
    </div>
  )
}
