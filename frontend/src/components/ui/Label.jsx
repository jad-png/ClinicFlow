import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

const Label = forwardRef(function Label({ className, ...props }, ref) {
  return <label ref={ref} className={cn('text-[13px] font-medium leading-none text-zinc-700', className)} {...props} />
})

export { Label }
