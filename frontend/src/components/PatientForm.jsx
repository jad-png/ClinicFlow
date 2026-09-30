import { useState } from 'react'
import apiClient from '../services/apiClient'
import { Button } from './ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Input } from './ui/Input'
import { Label } from './ui/Label'

const emptyForm = { fullName: '', CIN: '', phone: '', birthDate: '', address: '' }

function getAuthOptions(token) {
  return { headers: { Authorization: `Bearer ${token}` } }
}

export default function PatientForm({ patient, token, onClose, onSaved }) {
  const [form, setForm] = useState(patient ? {
    fullName: patient.fullName || '',
    CIN: patient.CIN || '',
    phone: patient.phone || '',
    birthDate: patient.birthDate?.slice(0, 10) || '',
    address: patient.address || '',
  } : emptyForm)
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  function handleChange(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!form.fullName.trim() || !form.CIN.trim() || !form.phone.trim() || !form.birthDate) {
      setError('Full name, CIN, phone, and birth date are required.')
      return
    }

    setIsSaving(true)
    const payload = { ...form, address: form.address.trim() || null }

    try {
      const result = patient
        ? await apiClient.patch(`/api/patients/${patient.id}`, payload, getAuthOptions(token))
        : await apiClient.post('/api/patients', payload, getAuthOptions(token))
      onSaved(result.patient)
    } catch (requestError) {
      setError(requestError.message || 'Unable to save patient.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-20 flex items-start justify-center overflow-y-auto bg-zinc-950/25 px-4 py-8 backdrop-blur-[2px]">
      <Card className="w-full max-w-lg shadow-[0_20px_70px_rgb(0,0,0,0.16)]">
        <CardHeader className="border-b border-zinc-100 p-6">
          <div className="flex items-center justify-between gap-4">
            <CardTitle>{patient ? 'Edit patient' : 'Add patient'}</CardTitle>
            <Button variant="outline" type="button" onClick={onClose}>Close</Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" name="fullName" value={form.fullName} onChange={handleChange} required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="CIN">CIN</Label>
                <Input id="CIN" name="CIN" value={form.CIN} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" value={form.phone} onChange={handleChange} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthDate">Birth date</Label>
              <Input id="birthDate" name="birthDate" type="date" value={form.birthDate} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <textarea
                id="address"
                name="address"
                value={form.address}
                onChange={handleChange}
                rows="3"
                className="flex min-h-24 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none ring-offset-white transition placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2"
              />
            </div>
            {error && <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-3 text-sm text-zinc-700" role="alert">{error}</p>}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving…' : 'Save patient'}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
