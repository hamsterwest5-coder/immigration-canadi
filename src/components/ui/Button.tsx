import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'

    const variants = {
      primary:
        'bg-[#c8102e] text-white hover:bg-[#9b0c24] shadow-md hover:shadow-lg focus-visible:ring-[#c8102e]',
      secondary:
        'bg-[#0a2540] text-white hover:bg-[#1e3a5f] shadow-md focus-visible:ring-[#0a2540]',
      outline:
        'border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 focus-visible:ring-slate-400',
      ghost: 'text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-400',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600',
      success: 'bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-600',
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-5 py-2.5 text-sm',
      lg: 'px-8 py-3.5 text-base',
    }

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
export default Button
