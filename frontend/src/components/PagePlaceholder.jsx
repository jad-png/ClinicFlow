import { Card, CardContent } from './ui/Card'

export default function PagePlaceholder({ title, action }) {
  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950">
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4">
        <p className="text-sm font-semibold tracking-wide">CLINICFLOW</p>
        {action}
      </header>
      <section className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <Card className="mt-6">
          <CardContent className="py-12 text-center text-sm text-zinc-500">
            This page is reserved for the next implementation phase.
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
