import { useEffect, useState } from 'react'
import apiClient from '../services/apiClient'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { useAuthStore } from '../stores/authStore'

const statuses = ['pending', 'confirmed', 'cancelled']
const emptyForm = { patientId: '', appointmentDate: '', status: 'pending', reason: '', notes: '' }
const selectClass = 'h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2'

function getAuthOptions(token) {
  return { headers: { Authorization: `Bearer ${token}` } }
}

function formatDate(value) {
  if (!value) return '—'
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

export default function AppointmentsPage() {
  const token = useAuthStore((state) => state.token)
  const [appointments, setAppointments] = useState([])
  const [patients, setPatients] = useState([])
  const [filters, setFilters] = useState({ patientId: '', status: '', date: '' })
  const [form, setForm] = useState(emptyForm)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [updatingId, setUpdatingId] = useState(null)
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let isCurrent = true

    async function loadPatients() {
      try {
        const result = await apiClient.get('/api/patients?limit=100', getAuthOptions(token))
        if (isCurrent) setPatients(result.patients || [])
      } catch (requestError) {
        if (isCurrent) setError(requestError.message || 'Unable to load patients.')
      }
    }

    if (token) loadPatients()

    return () => {
      isCurrent = false
    }
  }, [token])

  useEffect(() => {
    let isCurrent = true

    async function loadAppointments() {
      setIsLoading(true)
      setError('')
      const params = new URLSearchParams()
      if (filters.patientId) params.set('patientId', filters.patientId)
      if (filters.status) params.set('status', filters.status)
      if (filters.date) params.set('date', filters.date)
      const query = params.toString()

      try {
        const result = await apiClient.get(`/api/appointments${query ? `?${query}` : ''}`, getAuthOptions(token))
        if (isCurrent) setAppointments(result.appointments || [])
      } catch (requestError) {
        if (isCurrent) setError(requestError.message || 'Unable to load appointments.')
      } finally {
        if (isCurrent) setIsLoading(false)
      }
    }

    if (token) loadAppointments()

    return () => {
      isCurrent = false
    }
  }, [filters, refreshKey, token])

  function handleFilterChange(event) {
    setFilters((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  function handleFormChange(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function handleCreate(event) {
    event.preventDefault()
    setFormError('')

    if (!form.patientId || !form.appointmentDate || !form.reason.trim()) {
      setFormError('Patient, date, and reason are required.')
      return
    }

    setIsCreating(true)
    try {
      await apiClient.post('/api/appointments', {
        ...form,
        appointmentDate: new Date(form.appointmentDate).toISOString(),
        reason: form.reason.trim(),
        notes: form.notes.trim() || null,
      }, getAuthOptions(token))
      setForm(emptyForm)
      setRefreshKey((current) => current + 1)
    } catch (requestError) {
      setFormError(requestError.message || 'Unable to create appointment.')
    } finally {
      setIsCreating(false)
    }
  }

  async function handleStatusChange(appointmentId, status) {
    setError('')
    setUpdatingId(appointmentId)
    try {
      await apiClient.patch(`/api/appointments/${appointmentId}/status`, { status }, getAuthOptions(token))
      setRefreshKey((current) => current + 1)
    } catch (requestError) {
      setError(requestError.message || 'Unable to update appointment status.')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <main>
      <section className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">Scheduling</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Appointments</h1>
          <p className="mt-2 text-sm text-zinc-500">Keep the day organized and the care team aligned.</p>
        </div>

        <Card>
          <CardHeader className="border-b border-zinc-100"><CardTitle className="text-lg">Create appointment</CardTitle></CardHeader>
          <CardContent>
            <form className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" onSubmit={handleCreate}>
              <div className="space-y-2">
                <Label htmlFor="patientId">Patient</Label>
                <select id="patientId" name="patientId" className={selectClass} value={form.patientId} onChange={handleFormChange} required>
                  <option value="">Select a patient</option>
                  {patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.fullName} — {patient.CIN}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="appointmentDate">Date and time</Label>
                <Input id="appointmentDate" name="appointmentDate" type="datetime-local" value={form.appointmentDate} onChange={handleFormChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select id="status" name="status" className={selectClass} value={form.status} onChange={handleFormChange}>
                  {statuses.map((status) => <option key={status} value={status}>{status[0].toUpperCase() + status.slice(1)}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Input id="reason" name="reason" value={form.reason} onChange={handleFormChange} required />
              </div>
              <div className="space-y-2 sm:col-span-2 lg:col-span-3">
                <Label htmlFor="notes">Notes</Label>
                <Input id="notes" name="notes" value={form.notes} onChange={handleFormChange} />
              </div>
              <div className="flex items-end justify-end">
                <Button type="submit" disabled={isCreating}>{isCreating ? 'Creating…' : 'Create appointment'}</Button>
              </div>
              {formError && <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-3 text-sm text-zinc-700 sm:col-span-2 lg:col-span-4" role="alert">{formError}</p>}
            </form>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardContent className="p-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="filterPatientId">Patient</Label>
                <select id="filterPatientId" name="patientId" className={selectClass} value={filters.patientId} onChange={handleFilterChange}>
                  <option value="">All patients</option>
                  {patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.fullName}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="filterStatus">Status</Label>
                <select id="filterStatus" name="status" className={selectClass} value={filters.status} onChange={handleFilterChange}>
                  <option value="">All statuses</option>
                  {statuses.map((status) => <option key={status} value={status}>{status[0].toUpperCase() + status.slice(1)}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="filterDate">Date</Label>
                <Input id="filterDate" name="date" type="date" value={filters.date} onChange={handleFilterChange} />
              </div>
            </div>
          </CardContent>
        </Card>

        {error && <Card className="mt-6"><CardContent className="flex items-start gap-3 p-6" role="alert"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-sm font-semibold text-zinc-600">!</span><div><p className="font-medium text-zinc-900">Couldn’t load appointments</p><p className="mt-1 text-sm text-zinc-500">{error}</p></div></CardContent></Card>}

        <Card className="mt-6 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50/80 text-[11px] uppercase tracking-[0.12em] text-zinc-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Patient</th>
                  <th className="px-5 py-3 font-medium">Reason</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {isLoading && <tr><td className="px-5 py-12" colSpan="5"><div className="flex flex-col items-center justify-center gap-3 text-sm text-zinc-500"><span className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-700" />Loading appointments…</div></td></tr>}
                {!isLoading && !error && appointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td className="px-5 py-4 text-zinc-600">{formatDate(appointment.appointmentDate)}</td>
                    <td className="px-5 py-4 font-medium">{appointment.patientName || '—'}</td>
                    <td className="px-5 py-4">{appointment.reason || '—'}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Badge variant={appointment.status}>{appointment.status}</Badge>
                        <label className="cursor-pointer text-xs text-zinc-400 hover:text-zinc-700">
                          <span className="sr-only">Change status</span>
                          <select className="h-7 rounded-md border border-transparent bg-transparent px-1 text-xs text-zinc-500 outline-none hover:border-zinc-200 hover:bg-white" value={appointment.status} disabled={updatingId === appointment.id} onChange={(event) => handleStatusChange(appointment.id, event.target.value)} aria-label={`Change status for ${appointment.patientName || 'appointment'}`}>
                            {statuses.map((status) => <option key={status} value={status}>{status[0].toUpperCase() + status.slice(1)}</option>)}
                          </select>
                        </label>
                      </div>
                    </td>
                    <td className="max-w-xs px-5 py-4 text-zinc-600">{appointment.notes || '—'}</td>
                  </tr>
                ))}
                {!isLoading && !error && appointments.length === 0 && <tr><td className="px-5 py-14" colSpan="5"><div className="flex flex-col items-center justify-center text-center"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-sm font-semibold text-zinc-400">A</span><p className="mt-3 font-medium text-zinc-700">No appointments found</p><p className="mt-1 text-sm text-zinc-500">Create an appointment or adjust your filters.</p></div></td></tr>}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </main>
  )
}
