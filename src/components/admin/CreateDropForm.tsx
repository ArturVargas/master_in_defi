'use client'

/**
 * Formulario para crear nuevos drops de POAP
 * Adaptado del proyecto poap-quiz-app con el estilo dark del proyecto actual
 */

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface ProtocolOption {
  id: string
  name: string
  title?: string | null
  status?: string
}

interface CreateDropFormProps {
  adminSecret: string
  onSuccess?: (eventId: number) => void
}

export function CreateDropForm({ adminSecret, onSuccess }: CreateDropFormProps) {
  // Get current date for default values
  const now = new Date()
  const startDate = new Date(now.getTime() + 24 * 60 * 60 * 1000) // Tomorrow
  const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // +30 days
  const expiryDate = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000) // +60 days

  const [protocols, setProtocols] = useState<ProtocolOption[]>([])
  const [protocolsLoading, setProtocolsLoading] = useState(true)

  const fetchProtocols = useCallback(async () => {
    if (!adminSecret) return
    setProtocolsLoading(true)
    try {
      const response = await fetch('/api/protocols', {
        headers: { 'x-admin-secret': adminSecret },
      })
      const json = await response.json()
      const payload = json.data
      if (response.ok && payload?.protocols && Array.isArray(payload.protocols)) {
        setProtocols(payload.protocols)
      }
    } catch {
      // ignore
    } finally {
      setProtocolsLoading(false)
    }
  }, [adminSecret])

  useEffect(() => {
    fetchProtocols()
  }, [fetchProtocols])

  const formatDateTimeLocal = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  const [formData, setFormData] = useState({
    protocolId: '',
    name: 'Master en DeFi - Protocol Quiz',
    description: 'Completa el quiz con 75% o más de respuestas correctas para obtener este POAP',
    eventUrl: 'https://masterendefi.lat',
    city: 'Virtual',
    country: 'Global',
    startDate: formatDateTimeLocal(startDate),
    endDate: formatDateTimeLocal(endDate),
    expiryDate: formatDateTimeLocal(expiryDate),
    secretCode: Math.floor(100000 + Math.random() * 900000).toString(),
    email: '',
    requestedCodes: '100',
    virtualEvent: true,
    privateEvent: false,
    // Quiz configuration
    quizTitle: '',
    quizSubtitle: '',
    passingPercentage: '75',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const dropFormData = new FormData()

      // Add all required fields
      dropFormData.append('protocolId', formData.protocolId)
      dropFormData.append('name', formData.name)
      dropFormData.append('description', formData.description)
      dropFormData.append('eventUrl', formData.eventUrl)
      dropFormData.append('city', formData.city)
      dropFormData.append('country', formData.country)
      dropFormData.append('startDate', formData.startDate)
      dropFormData.append('endDate', formData.endDate)
      dropFormData.append('expiryDate', formData.expiryDate)
      dropFormData.append('secretCode', formData.secretCode)
      dropFormData.append('email', formData.email)
      dropFormData.append('requestedCodes', formData.requestedCodes)
      dropFormData.append('virtualEvent', formData.virtualEvent.toString())
      dropFormData.append('privateEvent', formData.privateEvent.toString())

      // Quiz configuration
      dropFormData.append('quizTitle', formData.quizTitle)
      dropFormData.append('quizSubtitle', formData.quizSubtitle)
      dropFormData.append('passingPercentage', formData.passingPercentage)

      if (imageFile) {
        dropFormData.append('image', imageFile)
      }

      const response = await fetch('/api/admin/drops/create', {
        method: 'POST',
        headers: {
          'x-admin-secret': adminSecret,
        },
        body: dropFormData,
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(`✓ Drop creado exitosamente! Event ID: ${data.eventId || data.id}`)
        onSuccess?.(data.eventId || data.id)

        // Reset form
        setFormData({
          ...formData,
          name: '',
          description: '',
          quizTitle: '',
          quizSubtitle: '',
          secretCode: Math.floor(100000 + Math.random() * 900000).toString(),
        })
        setImageFile(null)
      } else {
        setMessage(`✗ Error: ${data.error || 'Failed to create drop'}`)
      }
    } catch (error) {
      setMessage('✗ Error al crear drop')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  const labelClass = "block text-sm font-medium text-zinc-300 mb-2"

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Información Básica</h3>

        <div className="mb-4">
          <label htmlFor="protocolId" className={labelClass}>
            Protocol ID * (aave, morpho, sablier)
          </label>
          <select
            id="protocolId"
            value={formData.protocolId}
            onChange={(e) => setFormData({ ...formData, protocolId: e.target.value })}
            className={inputClass}
            required
            disabled={protocolsLoading}
          >
            <option value="">
              {protocolsLoading ? 'Cargando...' : 'Selecciona un protocolo'}
            </option>
            {protocols.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title || p.name} {p.status === 'draft' ? '(draft)' : ''}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-zinc-500">
            Selecciona el protocolo para el cual estás creando este POAP
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="name" className={labelClass}>
              Nombre del Drop *
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label htmlFor="eventUrl" className={labelClass}>
              URL del Evento *
            </label>
            <input
              id="eventUrl"
              type="url"
              value={formData.eventUrl}
              onChange={(e) => setFormData({ ...formData, eventUrl: e.target.value })}
              className={inputClass}
              placeholder="https://..."
              required
            />
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="description" className={labelClass}>
            Descripción *
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className={inputClass}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="city" className={labelClass}>
              Ciudad *
            </label>
            <input
              id="city"
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label htmlFor="country" className={labelClass}>
              País *
            </label>
            <input
              id="country"
              type="text"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              className={inputClass}
              required
            />
          </div>
        </div>
      </Card>

      {/* Dates */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Fechas</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="startDate" className={labelClass}>
              Fecha de Inicio *
            </label>
            <input
              id="startDate"
              type="datetime-local"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label htmlFor="endDate" className={labelClass}>
              Fecha de Fin *
            </label>
            <input
              id="endDate"
              type="datetime-local"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className={inputClass}
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="expiryDate" className={labelClass}>
            Fecha de Expiración de Códigos *
          </label>
          <input
            id="expiryDate"
            type="datetime-local"
            value={formData.expiryDate}
            onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
            className={inputClass}
            required
          />
          <p className="mt-1 text-xs text-zinc-500">
            Fecha límite para reclamar los POAPs
          </p>
        </div>
      </Card>

      {/* Contact & Configuration */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Contacto y Configuración</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="email" className={labelClass}>
              Email de Contacto *
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label htmlFor="requestedCodes" className={labelClass}>
              Cantidad de Códigos *
            </label>
            <input
              id="requestedCodes"
              type="number"
              min="1"
              value={formData.requestedCodes}
              onChange={(e) => setFormData({ ...formData, requestedCodes: e.target.value })}
              className={inputClass}
              required
            />
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="secretCode" className={labelClass}>
            Código Secreto (para editar después) *
          </label>
          <input
            id="secretCode"
            type="text"
            value={formData.secretCode}
            onChange={(e) => setFormData({ ...formData, secretCode: e.target.value })}
            className={inputClass}
            placeholder="6 dígitos"
            required
          />
          <p className="mt-1 text-xs text-zinc-500">
            Guarda este código - lo necesitarás para editar el drop más tarde
          </p>
        </div>

        <div>
          <label htmlFor="image" className={labelClass}>
            Imagen del POAP *
          </label>
          <input
            id="image"
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="w-full text-sm text-zinc-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer cursor-pointer"
            required
          />
          <p className="mt-1 text-xs text-zinc-500">
            PNG o JPG, recomendado 500x500px
          </p>
        </div>

        <div className="mt-4 space-y-3">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.virtualEvent}
              onChange={(e) => setFormData({ ...formData, virtualEvent: e.target.checked })}
              className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-zinc-700 rounded bg-zinc-800"
            />
            <span className="text-sm text-zinc-300">Evento Virtual</span>
          </label>

          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.privateEvent}
              onChange={(e) => setFormData({ ...formData, privateEvent: e.target.checked })}
              className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-zinc-700 rounded bg-zinc-800"
            />
            <span className="text-sm text-zinc-300">Evento Privado</span>
          </label>
        </div>
      </Card>

      {/* Quiz Configuration */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Configuración del Quiz (Opcional)</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="quizTitle" className={labelClass}>
              Título del Quiz
            </label>
            <input
              id="quizTitle"
              type="text"
              value={formData.quizTitle}
              onChange={(e) => setFormData({ ...formData, quizTitle: e.target.value })}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="quizSubtitle" className={labelClass}>
              Subtítulo del Quiz
            </label>
            <input
              id="quizSubtitle"
              type="text"
              value={formData.quizSubtitle}
              onChange={(e) => setFormData({ ...formData, quizSubtitle: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor="passingPercentage" className={labelClass}>
            Porcentaje para Aprobar *
          </label>
          <input
            id="passingPercentage"
            type="number"
            min="0"
            max="100"
            value={formData.passingPercentage}
            onChange={(e) => setFormData({ ...formData, passingPercentage: e.target.value })}
            className={inputClass}
            required
          />
          <p className="mt-1 text-xs text-zinc-500">
            Porcentaje mínimo de respuestas correctas para obtener el POAP
          </p>
        </div>
      </Card>

      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.includes('✗')
              ? 'bg-red-900/20 border border-red-500/50 text-red-400'
              : 'bg-green-900/20 border border-green-500/50 text-green-400'
          }`}
        >
          {message}
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={loading}
        className="w-full"
      >
        {loading ? 'Creando Drop en POAP...' : 'Crear Drop en POAP'}
      </Button>
    </form>
  )
}
