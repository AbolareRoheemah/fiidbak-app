import { Link } from 'react-router-dom'
import { ArrowRight, Shield, Users, Zap, TrendingUp, Star } from 'lucide-react'
import { ProductCard } from '../components/ui/ProductCard'

// Mock data - replace with actual data from contracts
const featuredProducts = [
  {
    id: 1,
    name: "Decentralized Social Media Platform",
    description: "A blockchain-based social media platform with user ownership and data privacy.",
    imageUrl: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400",
    owner: "0x1234...5678",
    feedbackCount: 23,
    createdAt: "2024-01-15"
  },
  {
    id: 2,
    name: "NFT Marketplace",
    description: "Trade and discover unique digital assets in our secure marketplace.",
    imageUrl: "https://images.unsplash.com/photo-1639322537228-f912d0a4d3d8?w=400",
    owner: "0x8765...4321",
    feedbackCount: 45,
    createdAt: "2024-01-10"
  },
  {
    id: 3,
    name: "DeFi Yield Farming Protocol",
    description: "Earn rewards by providing liquidity to our decentralized finance protocol.",
    imageUrl: "https://images.unsplash.com/photo-1642790103337-344b9c2b4e6e?w=400",
    owner: "0xabcd...efgh",
    feedbackCount: 67,
    createdAt: "2024-01-05"
  }
]

const features = [
  {
    icon: Shield,
    title: "Verified Reviews",
    description: "All feedback is verified through blockchain technology ensuring authenticity and preventing fake reviews."
  },
  {
    icon: Users,
    title: "Community Driven",
    description: "Community voting system with weighted votes based on user reputation and badge tiers."
  },
  {
    icon: Zap,
    title: "Instant Rewards",
    description: "Earn badges and reputation for quality feedback, creating a gamified experience."
  }
]

export function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-primary text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Decentralized
              <span className="block text-accent-300">Feedback Platform</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Discover, review, and earn rewards for authentic product feedback. 
              Built on blockchain for transparency and trust.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products" className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors duration-200">
                Explore Products
              </Link>
              <Link to="/create-product" className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold py-3 px-8 rounded-lg transition-colors duration-200">
                Create Product
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">1,234</div>
              <div className="text-gray-600">Products Listed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">5,678</div>
              <div className="text-gray-600">Reviews Submitted</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">2,345</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">98%</div>
              <div className="text-gray-600">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Fiidbak?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform combines blockchain technology with community governance 
              to create the most trustworthy feedback ecosystem.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon size={32} className="text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Featured Products
              </h2>
              <p className="text-xl text-gray-600">
                Discover the most reviewed and trusted products on our platform
              </p>
            </div>
            <Link 
              to="/products" 
              className="hidden md:flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-semibold"
            >
              <span>View All</span>
              <ArrowRight size={20} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center mt-8 md:hidden">
            <Link 
              to="/products" 
              className="btn-primary inline-flex items-center space-x-2"
            >
              <span>View All Products</span>
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-accent text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Join the Future of Feedback?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Connect your wallet and start earning badges for quality reviews today.
          </p>
          <Link 
            to="/products" 
            className="bg-white text-accent-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors duration-200 inline-flex items-center space-x-2"
          >
            <Star size={20} />
            <span>Get Started</span>
          </Link>
        </div>
      </section>
    </div>
  )
}
