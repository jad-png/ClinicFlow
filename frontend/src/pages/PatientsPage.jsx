import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import apiClient from '../services/apiClient'
import PatientForm from '../components/PatientForm'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { useAuthStore } from '../stores/authStore'

const PAGE_SIZE = 10

function getAuthOptions(token) {
  return { headers: { Authorization: `Bearer ${token}` } }
}

export default function PatientsPage() {
  const token = useAuthStore((state) => state.token)
  const [patients, setPatients] = useState([])
  const [pagination, setPagination] = useState(null)
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [formPatient, setFormPatient] = useState(undefined)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let isCurrent = true

    async function loadPatients() {
      setIsLoading(true)
      setError('')
      const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) })
      if (search) params.set('search', search)

      try {
        const result = await apiClient.get(`/api/patients?${params}`, getAuthOptions(token))
        if (isCurrent) {
          setPatients(result.patients || [])
          setPagination(result.pagination)
        }
      } catch (requestError) {
        if (isCurrent) setError(requestError.message || 'Unable to load patients.')
      } finally {
        if (isCurrent) setIsLoading(false)
      }
    }

    if (token) loadPatients()

    return () => {
      isCurrent = false
    }
  }, [page, search, refreshKey, token])

  function handleSearch(event) {
    event.preventDefault()
    setPage(1)
    setSearch(searchInput.trim())
  }

  function handleSaved() {
    setFormPatient(undefined)
    setPage(1)
    setRefreshKey((current) => current + 1)
  }

  return (
    <main>
      <section className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">Directory</p>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Patients</h1>
              <p className="mt-2 text-sm text-zinc-500">Manage your patient directory and records.</p>
            </div>
            <Button onClick={() => setFormPatient(null)}>Add patient</Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-4 sm:p-5">
            <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleSearch}>
              <Input
                aria-label="Search patients"
                className="sm:max-w-sm"
                placeholder="Search by full name or CIN"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
              />
              <Button type="submit">Search</Button>
              {search && <Button variant="outline" type="button" onClick={() => { setSearchInput(''); setSearch(''); setPage(1) }}>Clear</Button>}
            </form>
          </CardContent>
        </Card>

        {error && <Card className="mt-6"><CardContent className="flex items-start gap-3 p-6" role="alert"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-sm font-semibold text-zinc-600">!</span><div><p className="font-medium text-zinc-900">Couldn’t load patients</p><p className="mt-1 text-sm text-zinc-500">{error}</p></div></CardContent></Card>}

        <Card className="mt-6 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50/80 text-[11px] uppercase tracking-[0.12em] text-zinc-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Full name</th>
                  <th className="px-5 py-3 font-medium">CIN</th>
                  <th className="px-5 py-3 font-medium">Phone</th>
                  <th className="px-5 py-3 font-medium">Birth date</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {isLoading && <tr><td className="px-5 py-12" colSpan="5"><div className="flex flex-col items-center justify-center gap-3 text-sm text-zinc-500"><span className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-700" />Loading patients…</div></td></tr>}
                {!isLoading && !error && patients.map((patient) => (
                  <tr key={patient.id} className="transition-colors hover:bg-zinc-50">
                    <td className="px-5 py-4 font-medium"><Link className="underline-offset-4 hover:underline" to={`/patients/${patient.id}`}>{patient.fullName}</Link></td>
                    <td className="px-5 py-4 text-zinc-600">{patient.CIN}</td>
                    <td className="px-5 py-4 text-zinc-600">{patient.phone}</td>
                    <td className="px-5 py-4 text-zinc-600">{patient.birthDate?.slice(0, 10)}</td>
                    <td className="px-5 py-4 text-right"><Button variant="outline" onClick={() => setFormPatient(patient)}>Edit</Button></td>
                  </tr>
                ))}
                {!isLoading && !error && patients.length === 0 && <tr><td className="px-5 py-14" colSpan="5"><div className="flex flex-col items-center justify-center text-center"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-sm font-semibold text-zinc-400">P</span><p className="mt-3 font-medium text-zinc-700">No patients found</p><p className="mt-1 text-sm text-zinc-500">Try a different search or add a new patient.</p></div></td></tr>}
              </tbody>
            </table>
          </div>
          {pagination && (
            <div className="flex items-center justify-between border-t border-zinc-200 px-5 py-4 text-sm">
              <p className="text-zinc-500">{pagination.total} patient{pagination.total === 1 ? '' : 's'}</p>
              <div className="flex items-center gap-2">
                <Button variant="outline" disabled={!pagination.hasPreviousPage || isLoading} onClick={() => setPage((current) => current - 1)}>Previous</Button>
                <span className="px-2 text-zinc-500">Page {pagination.page} of {pagination.totalPages || 1}</span>
                <Button variant="outline" disabled={!pagination.hasNextPage || isLoading} onClick={() => setPage((current) => current + 1)}>Next</Button>
              </div>
            </div>
          )}
        </Card>
      </section>

      {formPatient !== undefined && (
        <PatientForm
          patient={formPatient}
          token={token}
          onClose={() => setFormPatient(undefined)}
          onSaved={handleSaved}
        />
      )}
    </main>
  )
}
