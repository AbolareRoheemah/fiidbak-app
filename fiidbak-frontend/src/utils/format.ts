// Utility functions for formatting data

export function formatAddress(address: string): string {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function formatDate(timestamp: number | string): string {
  const date = new Date(typeof timestamp === 'string' ? timestamp : timestamp * 1000)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function formatDateTime(timestamp: number | string): string {
  const date = new Date(typeof timestamp === 'string' ? timestamp : timestamp * 1000)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatRelativeTime(timestamp: number | string): string {
  const date = new Date(typeof timestamp === 'string' ? timestamp : timestamp * 1000)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'Just now'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} day${days > 1 ? 's' : ''} ago`
  } else if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000)
    return `${months} month${months > 1 ? 's' : ''} ago`
  } else {
    const years = Math.floor(diffInSeconds / 31536000)
    return `${years} year${years > 1 ? 's' : ''} ago`
  }
}

export function formatVotePercentage(positiveVotes: number, totalVotes: number): number {
  if (totalVotes === 0) return 0
  return Math.round((positiveVotes / totalVotes) * 100)
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function getBadgeTierName(tier: number): string {
  switch (tier) {
    case 1:
      return 'Seedling'
    case 2:
      return 'Wooden'
    case 3:
      return 'Bronze'
    case 4:
      return 'Silver'
    case 5:
      return 'Gold'
    default:
      return 'Newbie'
  }
}

export function getBadgeTierColor(tier: number): string {
  switch (tier) {
    case 1:
      return 'bg-green-100 text-green-800'
    case 2:
      return 'bg-amber-100 text-amber-800'
    case 3:
      return 'bg-orange-100 text-orange-800'
    case 4:
      return 'bg-gray-100 text-gray-800'
    case 5:
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

export function getVoteWeightName(tier: number): string {
  switch (tier) {
    case 2:
      return '1x (Wood)'
    case 3:
      return '2x (Bronze)'
    case 4:
      return '3x (Silver)'
    case 5:
      return '5x (Gold)'
    default:
      return '0x (No voting rights)'
  }
}
