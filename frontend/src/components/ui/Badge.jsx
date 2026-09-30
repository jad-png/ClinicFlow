import { cn } from '../../lib/utils'

function Badge({ className, variant = 'default', ...props }) {
  const variants = {
    default: 'bg-zinc-100 text-zinc-700',
    pending: 'bg-zinc-100 text-zinc-600 ring-1 ring-inset ring-zinc-200',
    confirmed: 'bg-zinc-900 text-white ring-1 ring-inset ring-zinc-900',
    cancelled: 'bg-white text-zinc-400 ring-1 ring-inset ring-zinc-200',
  }

  return <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize', variants[variant] || variants.default, className)} {...props} />
}

export { Badge }
