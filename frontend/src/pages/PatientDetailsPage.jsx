import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PatientForm from '../components/PatientForm'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import apiClient from '../services/apiClient'
import { useAuthStore } from '../stores/authStore'

function getAuthOptions(token) {
  return { headers: { Authorization: `Bearer ${token}` } }
}

function formatDate(value) {
  if (!value) return '—'
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

export default function PatientDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
  const [patient, setPatient] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    let isCurrent = true

    async function loadPatientDetails() {
      setIsLoading(true)
      setError('')
      const options = getAuthOptions(token)

      try {
        const [patientResult, appointmentResult] = await Promise.all([
          apiClient.get(`/api/patients/${id}`, options),
          apiClient.get(`/api/appointments?patientId=${encodeURIComponent(id)}`, options),
        ])
        if (isCurrent) {
          setPatient(patientResult.patient)
          setAppointments(appointmentResult.appointments || [])
        }
      } catch (requestError) {
        if (isCurrent) {
          setError(requestError.status === 404 ? 'Patient not found.' : (requestError.message || 'Unable to load patient details.'))
        }
      } finally {
        if (isCurrent) setIsLoading(false)
      }
    }

    if (token) loadPatientDetails()

    return () => {
      isCurrent = false
    }
  }, [id, token])

  async function handleDelete() {
    if (!window.confirm('Delete this patient? This action cannot be undone.')) return

    setIsDeleting(true)
    setError('')
    try {
      await apiClient.delete(`/api/patients/${id}`, getAuthOptions(token))
      navigate('/patients', { replace: true })
    } catch (requestError) {
      setError(requestError.message || 'Unable to delete patient.')
      setIsDeleting(false)
    }
  }

  const isAdmin = user?.role === 'admin'

  return (
    <main>
      <section className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
        {isLoading && <Card><CardContent className="flex min-h-36 flex-col items-center justify-center gap-3 p-6 text-sm text-zinc-500"><span className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-700" />Loading patient profile…</CardContent></Card>}

        {!isLoading && error && (
          <Card>
            <CardContent className="flex items-start gap-3 p-6" role="alert"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-sm font-semibold text-zinc-600">!</span><div><p className="font-medium text-zinc-900">Patient unavailable</p><p className="mt-1 text-sm text-zinc-500">{error}</p></div></CardContent>
          </Card>
        )}

        {!isLoading && !error && patient && (
          <>
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">Patient profile</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{patient.fullName}</h1>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setIsEditing(true)}>Edit</Button>
                {isAdmin && <Button variant="danger" disabled={isDeleting} onClick={handleDelete}>{isDeleting ? 'Deleting…' : 'Delete'}</Button>}
              </div>
            </div>

            <Card className="mt-8">
              <CardHeader className="border-b border-zinc-100"><CardTitle className="text-lg">Patient information</CardTitle></CardHeader>
              <CardContent className="grid gap-5 p-6 sm:grid-cols-2 lg:grid-cols-4">
                <InfoItem label="CIN" value={patient.CIN} />
                <InfoItem label="Phone" value={patient.phone} />
                <InfoItem label="Birth date" value={patient.birthDate?.slice(0, 10)} />
                <InfoItem label="Address" value={patient.address || '—'} />
              </CardContent>
            </Card>

            <Card className="mt-6 overflow-hidden">
              <CardHeader className="border-b border-zinc-100"><CardTitle className="text-lg">Appointments</CardTitle></CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[680px] text-left text-sm">
                    <thead className="border-y border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
                      <tr>
                        <th className="px-6 py-3 font-medium">Date</th>
                        <th className="px-6 py-3 font-medium">Reason</th>
                        <th className="px-6 py-3 font-medium">Status</th>
                        <th className="px-6 py-3 font-medium">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {appointments.map((appointment) => (
                        <tr key={appointment.id}>
                          <td className="px-6 py-4 text-zinc-600">{formatDate(appointment.appointmentDate)}</td>
                          <td className="px-6 py-4 font-medium">{appointment.reason || '—'}</td>
                          <td className="px-6 py-4"><Badge variant={appointment.status}>{appointment.status}</Badge></td>
                          <td className="px-6 py-4 text-zinc-600">{appointment.notes || '—'}</td>
                        </tr>
                      ))}
                      {appointments.length === 0 && <tr><td className="px-6 py-14" colSpan="4"><div className="flex flex-col items-center justify-center text-center"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-sm font-semibold text-zinc-400">A</span><p className="mt-3 font-medium text-zinc-700">No appointments yet</p><p className="mt-1 text-sm text-zinc-500">This patient has no scheduled appointments.</p></div></td></tr>}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </section>

      {isEditing && patient && (
        <PatientForm
          patient={patient}
          token={token}
          onClose={() => setIsEditing(false)}
          onSaved={(updatedPatient) => { setPatient(updatedPatient); setIsEditing(false) }}
        />
      )}
    </main>
  )
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  )
}
