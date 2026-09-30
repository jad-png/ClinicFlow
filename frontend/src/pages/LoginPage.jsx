import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import apiClient from '../services/apiClient'
import { useAuthStore } from '../stores/authStore'

export default function LoginPage() {
  const navigate = useNavigate()
  const token = useAuthStore((state) => state.token)
  const setAuth = useAuthStore((state) => state.setAuth)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (token) {
    return <Navigate to="/dashboard" replace />
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email) || !password) {
      setError('Enter a valid email and password.')
      return
    }

    setIsSubmitting(true)

    try {
      const result = await apiClient.post('/api/auth/login', { email, password })
      setAuth(result.token, result.user)
      navigate('/dashboard', { replace: true })
    } catch (requestError) {
      setError(requestError.message || 'Login failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fafafa] px-5 py-12 text-zinc-950 sm:px-6">
      <Card className="w-full max-w-md shadow-[0_20px_60px_rgb(0,0,0,0.07)]">
        <CardHeader className="p-8 pb-6">
          <div className="mb-7 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-950 text-sm font-bold text-white">C</span>
            <p className="text-xs font-bold tracking-[0.18em] text-zinc-900">CLINICFLOW</p>
          </div>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription className="mt-1">Sign in to manage your clinic workspace.</CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-0">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            {error && (
              <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-3 text-sm text-zinc-700" role="alert">
                {error}
              </p>
            )}
            <Button className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
