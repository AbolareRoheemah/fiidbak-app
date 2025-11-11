import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Menu, X, Package, MessageSquare, User, Settings, Plus } from 'lucide-react'
import { BadgeDisplay } from '../ui/BadgeDisplay'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()

  const navigation = [
    { name: 'Products', href: '/products', icon: Package },
    { name: 'Feedback', href: '/feedback', icon: MessageSquare },
    { name: 'Profile', href: '/profile', icon: User },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <span className="text-xl font-bold text-gradient">Fiidbak</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    isActive(item.href)
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Create Product Button */}
            <Link
              to="/create-product"
              className="hidden sm:flex items-center space-x-2 btn-primary"
            >
              <Plus size={16} />
              <span>Create Product</span>
            </Link>

            {/* Badge Display */}
            <div className="hidden lg:block">
              <BadgeDisplay />
            </div>

            {/* Connect Wallet */}
            <ConnectButton />

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      isActive(item.href)
                        ? 'text-primary-600 bg-primary-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
              
              <Link
                to="/create-product"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
              >
                <Plus size={16} />
                <span>Create Product</span>
              </Link>

              <div className="px-3 py-2">
                <BadgeDisplay />
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
