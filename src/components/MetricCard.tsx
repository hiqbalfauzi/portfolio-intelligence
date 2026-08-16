import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon?: React.ReactNode
  className?: string
}

export function MetricCard({ title, value, change, changeLabel, icon, className }: MetricCardProps) {
  const isPositive = change && change > 0
  const isNegative = change && change < 0
  const isNeutral = !change || change === 0

  return (
    <div className={cn('rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm', className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">{value}</p>
          {change !== undefined && (
            <div className="mt-2 flex items-center gap-1">
              {isPositive && <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />}
              {isNegative && <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />}
              {isNeutral && <Minus className="h-4 w-4 text-gray-400 dark:text-gray-500" />}
              <span
                className={cn(
                  'text-sm font-medium',
                  isPositive && 'text-green-600 dark:text-green-400',
                  isNegative && 'text-red-600 dark:text-red-400',
                  isNeutral && 'text-gray-500 dark:text-gray-400'
                )}
              >
                {isPositive ? '+' : ''}{change.toFixed(2)}%
              </span>
              {changeLabel && (
                <span className="text-xs text-gray-500 dark:text-gray-400">{changeLabel}</span>
              )}
            </div>
          )}
        </div>
        {icon && (
          <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3 text-blue-600 dark:text-blue-400">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
