import { useEffect, useState } from 'react'
import apiClient from '../services/apiClient'
import { Card, CardContent } from '../components/ui/Card'
import { useAuthStore } from '../stores/authStore'

const metrics = [
  { key: 'totalPatients', label: 'Total patients', accent: 'bg-zinc-900' },
  { key: 'todaysAppointments', label: "Today's appointments", accent: 'bg-zinc-600' },
  { key: 'pendingAppointments', label: 'Pending appointments', accent: 'bg-zinc-400' },
  { key: 'confirmedAppointments', label: 'Confirmed appointments', accent: 'bg-zinc-200' },
]

function StatCard({ label, value, accent }) {
  return (
    <Card className="relative overflow-hidden">
      <span className={`absolute inset-y-0 left-0 w-1 ${accent}`} />
      <CardContent className="p-6 pl-7">
        <p className="text-sm font-medium text-zinc-500">{label}</p>
        <p className="mt-4 text-3xl font-semibold tracking-tight text-zinc-950">{value}</p>
      </CardContent>
    </Card>
  )
}

function LoadingCard() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="h-4 w-32 animate-pulse rounded bg-zinc-100" />
        <div className="mt-4 h-9 w-16 animate-pulse rounded bg-zinc-100" />
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const token = useAuthStore((state) => state.token)
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isCurrent = true

    async function loadDashboard() {
      setIsLoading(true)
      setError('')

      try {
        const result = await apiClient.get('/api/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (isCurrent) setSummary(result)
      } catch (requestError) {
        if (isCurrent) setError(requestError.message || 'Unable to load dashboard data.')
      } finally {
        if (isCurrent) setIsLoading(false)
      }
    }

    if (token) loadDashboard()

    return () => {
      isCurrent = false
    }
  }, [token])

  return (
    <main>
      <section className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">Overview</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Dashboard</h1>
          <p className="mt-2 text-sm text-zinc-500">A quick view of today’s clinic activity.</p>
        </div>

        {isLoading && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric) => <LoadingCard key={metric.key} />)}
          </div>
        )}

        {!isLoading && error && (
          <Card className="mt-8 border-zinc-200">
            <CardContent className="flex items-start gap-3 p-6" role="alert">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-sm font-semibold text-zinc-600">!</span>
              <div><p className="font-medium text-zinc-900">Dashboard unavailable</p><p className="mt-1 text-sm text-zinc-500">{error}</p></div>
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && summary && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric) => (
              <StatCard key={metric.key} label={metric.label} accent={metric.accent} value={summary[metric.key] ?? 0} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
