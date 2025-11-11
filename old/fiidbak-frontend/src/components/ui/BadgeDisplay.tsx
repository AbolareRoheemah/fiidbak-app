import { useAccount } from 'wagmi'
import { Trophy, Star } from 'lucide-react'

interface BadgeDisplayProps {
  tier?: number
  className?: string
}

export function BadgeDisplay({ tier = 0, className = '' }: BadgeDisplayProps) {
  const { address } = useAccount()

  const getBadgeInfo = (tier: number) => {
    switch (tier) {
      case 1:
        return { name: 'Seedling', color: 'badge-seedling', icon: '🌱' }
      case 2:
        return { name: 'Wooden', color: 'badge-wooden', icon: '🪵' }
      case 3:
        return { name: 'Bronze', color: 'badge-bronze', icon: '🥉' }
      case 4:
        return { name: 'Silver', color: 'badge-silver', icon: '🥈' }
      case 5:
        return { name: 'Gold', color: 'badge-gold', icon: '🥇' }
      default:
        return { name: 'Newbie', color: 'bg-gray-100 text-gray-600', icon: '⭐' }
    }
  }

  const badgeInfo = getBadgeInfo(tier)

  if (!address) {
    return null
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="flex items-center space-x-1">
        <span className="text-lg">{badgeInfo.icon}</span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeInfo.color}`}>
          {badgeInfo.name}
        </span>
      </div>
      {tier >= 2 && (
        <div className="flex items-center text-yellow-500">
          <Trophy size={14} />
        </div>
      )}
    </div>
  )
}
