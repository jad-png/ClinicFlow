import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

const Button = forwardRef(function Button({ className, variant = 'default', ...props }, ref) {
  const variants = {
    default: 'bg-zinc-950 text-white shadow-sm hover:bg-zinc-800',
    outline: 'border border-zinc-200 bg-white text-zinc-700 shadow-sm hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950',
    ghost: 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950',
    danger: 'border border-zinc-300 bg-white text-zinc-700 shadow-sm hover:bg-zinc-100 hover:text-zinc-950',
  }

  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex h-10 items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        className,
      )}
      {...props}
    />
  )
})

export { Button }
