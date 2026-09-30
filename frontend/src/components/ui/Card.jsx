import { cn } from '../../lib/utils'

function Card({ className, ...props }) {
  return <div className={cn('rounded-2xl border border-zinc-200/80 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.03)]', className)} {...props} />
}

function CardHeader({ className, ...props }) {
  return <div className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
}

function CardTitle({ className, ...props }) {
  return <h1 className={cn('text-xl font-semibold tracking-tight text-zinc-950', className)} {...props} />
}

function CardDescription({ className, ...props }) {
  return <p className={cn('text-sm text-zinc-500', className)} {...props} />
}

function CardContent({ className, ...props }) {
  return <div className={cn('p-6 pt-0', className)} {...props} />
}

export { Card, CardContent, CardDescription, CardHeader, CardTitle }
