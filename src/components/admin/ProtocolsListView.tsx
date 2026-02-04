'use client'

/**
 * Component to display and manage protocols
 */

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface Protocol {
  id: string
  name: string
  title?: string
  description?: string
  docs?: string
  logoUrl?: string
  category?: string
  difficulty?: string
  secretWord?: string
  status: 'public' | 'draft'
  active: boolean
  orderIndex: number
  createdAt: string
  updatedAt: string
}

interface ProtocolsListViewProps {
  /** Admin secret del login; si está presente, la API devuelve todos los protocolos (incl. draft) */
  adminSecret?: string
}

export function ProtocolsListView({ adminSecret: adminSecretProp = '' }: ProtocolsListViewProps) {
  const [protocols, setProtocols] = useState<Protocol[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    title: '',
    description: '',
    docs: '',
    logoUrl: '',
    category: 'lending',
    difficulty: 'intermediate',
    secretWord: '',
    status: 'public' as 'public' | 'draft',
    active: true,
    orderIndex: 0,
  })
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const fetchProtocols = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/protocols', {
        headers: adminSecretProp ? { 'x-admin-secret': adminSecretProp } : {},
      })
      const json = await response.json()

      if (response.ok) {
        const payload = json.data
        if (payload?.protocols && Array.isArray(payload.protocols)) {
          setProtocols(payload.protocols)
        }
      } else {
        console.error('Error fetching protocols:', json?.error)
      }
    } catch (error) {
      console.error('Error fetching protocols:', error)
    } finally {
      setLoading(false)
    }
  }, [adminSecretProp])

  useEffect(() => {
    fetchProtocols()
  }, [fetchProtocols])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage('')

    try {
      const adminSecret = prompt('Ingresa el admin secret:')
      if (!adminSecret) {
        setMessage('✗ Admin secret requerido')
        setSubmitting(false)
        return
      }

      const url = editingId ? `/api/protocols/${editingId}` : '/api/protocols'
      const method = editingId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': adminSecret,
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(`✓ Protocolo "${formData.name}" ${editingId ? 'actualizado' : 'creado'} exitosamente`)
        setFormData({
          id: '',
          name: '',
          title: '',
          description: '',
          docs: '',
          logoUrl: '',
          category: 'lending',
          difficulty: 'intermediate',
          secretWord: '',
          status: 'public',
          active: true,
          orderIndex: 0,
        })
        setShowAddForm(false)
        setEditingId(null)
        fetchProtocols()
      } else {
        setMessage(`✗ Error: ${data.error || 'Failed to save protocol'}`)
      }
    } catch (error) {
      setMessage('✗ Error al guardar protocolo')
      console.error(error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (protocol: Protocol) => {
    setEditingId(protocol.id)
    setFormData({
      id: protocol.id,
      name: protocol.name,
      title: protocol.title || '',
      description: protocol.description || '',
      docs: protocol.docs || '',
      logoUrl: protocol.logoUrl || '',
      category: protocol.category || 'lending',
      difficulty: protocol.difficulty || 'intermediate',
      secretWord: protocol.secretWord || '',
      status: protocol.status,
      active: protocol.active,
      orderIndex: protocol.orderIndex,
    })
    setShowAddForm(true)
    setMessage('')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setShowAddForm(false)
    setFormData({
      id: '',
      name: '',
      title: '',
      description: '',
      docs: '',
      logoUrl: '',
      category: 'lending',
      difficulty: 'intermediate',
      secretWord: '',
      status: 'public',
      active: true,
      orderIndex: 0,
    })
    setMessage('')
  }

  const toggleProtocolStatus = async (protocolId: string, currentStatus: 'public' | 'draft') => {
    const newStatus = currentStatus === 'public' ? 'draft' : 'public'

    try {
      const adminSecret = prompt('Ingresa el admin secret:')
      if (!adminSecret) {
        setMessage('✗ Admin secret requerido')
        return
      }

      const response = await fetch(`/api/protocols/${protocolId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': adminSecret,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(`✓ Protocolo "${protocolId}" cambiado a ${newStatus}`)
        fetchProtocols()
      } else {
        setMessage(`✗ Error: ${data.error || 'Failed to update protocol'}`)
      }
    } catch (error) {
      setMessage('✗ Error al actualizar protocolo')
      console.error(error)
    }
  }

  const inputClass = "w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  const labelClass = "block text-sm font-medium text-zinc-300 mb-2"

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-zinc-400">Cargando protocolos...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Add Protocol Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">
          Protocolos ({protocols.length})
        </h2>
        <Button onClick={() => showAddForm ? cancelEdit() : setShowAddForm(true)}>
          {showAddForm ? 'Cancelar' : '+ Agregar Protocolo'}
        </Button>
      </div>

      {/* Add/Edit Protocol Form */}
      {showAddForm && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            {editingId ? 'Editar Protocolo' : 'Nuevo Protocolo'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="id" className={labelClass}>
                  ID * (ej: aave, morpho)
                </label>
                <input
                  id="id"
                  type="text"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  className={inputClass}
                  placeholder="aave"
                  required
                  readOnly={!!editingId}
                  disabled={!!editingId}
                />
                {editingId && (
                  <p className="text-xs text-zinc-500 mt-1">El ID no se puede modificar</p>
                )}
              </div>

              <div>
                <label htmlFor="name" className={labelClass}>
                  Nombre *
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={inputClass}
                  placeholder="Aave"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="title" className={labelClass}>
                Título
              </label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={inputClass}
                placeholder="Leading DeFi Lending Protocol"
              />
            </div>

            <div>
              <label htmlFor="description" className={labelClass}>
                Descripción (resumen corto para cards)
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className={inputClass}
                placeholder="Descripción breve del protocolo..."
              />
            </div>

            <div>
              <label htmlFor="docs" className={labelClass}>
                Documentación completa (para IA)
              </label>
              <textarea
                id="docs"
                value={formData.docs}
                onChange={(e) => setFormData({ ...formData, docs: e.target.value })}
                rows={12}
                className={inputClass}
                placeholder="Pega aquí la documentación completa del protocolo (docs, whitepaper, etc.). Se usa para generar el brief y las preguntas por voz en Nomi Echo. Si está vacío, se usará la descripción."
              />
              <p className="mt-1 text-xs text-zinc-500">
                Texto largo que Nomi Echo usa para generar el brief y las preguntas. Recomendado para mejor contexto.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="logoUrl" className={labelClass}>
                  Logo URL
                </label>
                <input
                  id="logoUrl"
                  type="url"
                  value={formData.logoUrl}
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                  className={inputClass}
                  placeholder="https://..."
                />
              </div>

              <div>
                <label htmlFor="secretWord" className={labelClass}>
                  Secret Word
                </label>
                <input
                  id="secretWord"
                  type="text"
                  value={formData.secretWord}
                  onChange={(e) => setFormData({ ...formData, secretWord: e.target.value })}
                  className={inputClass}
                  placeholder="SECRET_WORD_123"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className={labelClass}>
                  Categoría
                </label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className={inputClass}
                >
                  <option value="lending">Lending</option>
                  <option value="streaming">Streaming</option>
                  <option value="exchange">Exchange</option>
                  <option value="derivatives">Derivatives</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="difficulty" className={labelClass}>
                  Dificultad
                </label>
                <select
                  id="difficulty"
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  className={inputClass}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="status" className={labelClass}>
                  Estado *
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'public' | 'draft' })}
                  className={inputClass}
                  required
                >
                  <option value="public">Public (Visible para usuarios)</option>
                  <option value="draft">Draft (Oculto, solo admin)</option>
                </select>
              </div>

              <div>
                <label htmlFor="orderIndex" className={labelClass}>
                  Orden
                </label>
                <input
                  id="orderIndex"
                  type="number"
                  value={formData.orderIndex}
                  onChange={(e) => setFormData({ ...formData, orderIndex: parseInt(e.target.value) })}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-zinc-700 rounded bg-zinc-800"
                />
                <span className="text-sm text-zinc-300">Activo</span>
              </label>
            </div>

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

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? 'Guardando...' : (editingId ? 'Actualizar Protocolo' : 'Crear Protocolo')}
            </Button>
          </form>
        </Card>
      )}

      {/* Protocols List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {protocols.map((protocol) => (
          <Card key={protocol.id} className="p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                {protocol.logoUrl && (
                  <img
                    src={protocol.logoUrl}
                    alt={protocol.name}
                    className="w-10 h-10 rounded-full"
                  />
                )}
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {protocol.name}
                  </h3>
                  <p className="text-xs text-zinc-500">ID: {protocol.id}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    protocol.status === 'public'
                      ? 'bg-blue-900/30 text-blue-400 border border-blue-500/50'
                      : 'bg-orange-900/30 text-orange-400 border border-orange-500/50'
                  }`}
                >
                  {protocol.status === 'public' ? '👁️ Public' : '📝 Draft'}
                </span>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    protocol.active
                      ? 'bg-green-900/30 text-green-400 border border-green-500/50'
                      : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                  }`}
                >
                  {protocol.active ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>

            {protocol.title && (
              <p className="text-sm text-zinc-400 mb-2">{protocol.title}</p>
            )}

            {protocol.description && (
              <p className="text-xs text-zinc-500 mb-3 line-clamp-2">
                {protocol.description}
              </p>
            )}

            <div className="flex items-center gap-3 text-xs mb-4">
              {protocol.category && (
                <span className="px-2 py-1 bg-blue-900/20 text-blue-400 rounded border border-blue-500/30">
                  {protocol.category}
                </span>
              )}
              {protocol.difficulty && (
                <span className="px-2 py-1 bg-purple-900/20 text-purple-400 rounded border border-purple-500/30">
                  {protocol.difficulty}
                </span>
              )}
              {protocol.secretWord && (
                <span className="px-2 py-1 bg-yellow-900/20 text-yellow-400 rounded border border-yellow-500/30">
                  🔐 Secret Word
                </span>
              )}
            </div>

            <div className="flex gap-2 mt-auto">
              <Button
                onClick={() => handleEdit(protocol)}
                variant="secondary"
                className="flex-1 text-xs"
              >
                ✏️ Editar
              </Button>
              <Button
                onClick={() => toggleProtocolStatus(protocol.id, protocol.status)}
                className="flex-1 text-xs"
              >
                {protocol.status === 'public' ? '📝 Draft' : '👁️ Public'}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {protocols.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-zinc-400 mb-2">No hay protocolos creados aún</p>
          <p className="text-sm text-zinc-500">
            Haz clic en &quot;Agregar Protocolo&quot; para comenzar
          </p>
        </Card>
      )}
    </div>
  )
}
