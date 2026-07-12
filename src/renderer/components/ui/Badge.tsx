import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'error' | 'info'
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
        {
          'border-transparent bg-primary text-primary-foreground': variant === 'default',
          'border-transparent bg-secondary text-secondary-foreground': variant === 'secondary',
          'text-foreground': variant === 'outline',
          'border-transparent bg-green-500/20 text-green-400': variant === 'success',
          'border-transparent bg-yellow-500/20 text-yellow-400': variant === 'warning',
          'border-transparent bg-red-500/20 text-red-400': variant === 'error',
          'border-transparent bg-blue-500/20 text-blue-400': variant === 'info',
        },
        className
      )}
      {...props}
    />
  )
}

export default Badge
