import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: 'success' | 'warning' | 'error' | 'info' | string
  label?: string
}

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  const statusMap: Record<string, string> = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  }

  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', statusMap[status] || 'bg-gray-100 text-gray-800')}>
      {label || status}
    </span>
  )
}