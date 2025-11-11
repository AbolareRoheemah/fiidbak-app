import { Package, MessageSquare, Search } from 'lucide-react'

interface EmptyStateProps {
  icon: 'products' | 'feedback' | 'search'
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  const getIcon = () => {
    switch (icon) {
      case 'products':
        return <Package size={48} className="text-gray-400" />
      case 'feedback':
        return <MessageSquare size={48} className="text-gray-400" />
      case 'search':
        return <Search size={48} className="text-gray-400" />
      default:
        return <Package size={48} className="text-gray-400" />
    }
  }

  return (
    <div className="text-center py-12">
      <div className="flex justify-center mb-4">
        {getIcon()}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6 max-w-sm mx-auto">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="btn-primary cursor-pointer"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
