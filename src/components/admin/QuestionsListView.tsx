'use client'

/**
 * Component to display and manage questions with answers
 */

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface Answer {
  id: string
  questionId: string
  text: string
  isCorrect: boolean
  orderIndex: number
}

interface Question {
  id: string
  protocolId: string
  text: string
  explanation?: string
  orderIndex: number
  active: boolean
  createdAt: string
  updatedAt: string
  answers: Answer[]
}

export function QuestionsListView() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [protocols, setProtocols] = useState<string[]>([])
  const [selectedProtocol, setSelectedProtocol] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    protocolId: '',
    text: '',
    explanation: '',
    orderIndex: 0,
    active: true,
    answers: [
      { text: '', isCorrect: false, orderIndex: 0 },
      { text: '', isCorrect: false, orderIndex: 1 },
      { text: '', isCorrect: false, orderIndex: 2 },
      { text: '', isCorrect: false, orderIndex: 3 },
    ]
  })
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/questions?includeInactive=true')
      const data = await response.json()

      if (response.ok) {
        setQuestions(data.questions)

        // Extract unique protocols
        const uniqueProtocols = Array.from(
          new Set(data.questions.map((q: Question) => q.protocolId))
        ) as string[]
        setProtocols(uniqueProtocols)
      } else {
        console.error('Error fetching questions:', data.error)
      }
    } catch (error) {
      console.error('Error fetching questions:', error)
    } finally {
      setLoading(false)
    }
  }

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

      // Validate at least one correct answer
      const hasCorrectAnswer = formData.answers.some(a => a.isCorrect && a.text.trim())
      if (!hasCorrectAnswer) {
        setMessage('✗ Debes marcar al menos una respuesta como correcta')
        setSubmitting(false)
        return
      }

      // Filter out empty answers
      const validAnswers = formData.answers.filter(a => a.text.trim())
      if (validAnswers.length < 2) {
        setMessage('✗ Debes proporcionar al menos 2 respuestas')
        setSubmitting(false)
        return
      }

      const url = editingId ? `/api/questions/${editingId}` : '/api/questions'
      const method = editingId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': adminSecret,
        },
        body: JSON.stringify({
          ...formData,
          answers: validAnswers
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(`✓ Pregunta ${editingId ? 'actualizada' : 'creada'} exitosamente`)
        setFormData({
          protocolId: '',
          text: '',
          explanation: '',
          orderIndex: 0,
          active: true,
          answers: [
            { text: '', isCorrect: false, orderIndex: 0 },
            { text: '', isCorrect: false, orderIndex: 1 },
            { text: '', isCorrect: false, orderIndex: 2 },
            { text: '', isCorrect: false, orderIndex: 3 },
          ]
        })
        setShowAddForm(false)
        setEditingId(null)
        fetchQuestions()
      } else {
        setMessage(`✗ Error: ${data.error || 'Failed to save question'}`)
      }
    } catch (error) {
      setMessage('✗ Error al crear pregunta')
      console.error(error)
    } finally {
      setSubmitting(false)
    }
  }

  const updateAnswer = (index: number, field: 'text' | 'isCorrect', value: string | boolean) => {
    const newAnswers = [...formData.answers]
    newAnswers[index] = { ...newAnswers[index], [field]: value }
    setFormData({ ...formData, answers: newAnswers })
  }

  const addAnswer = () => {
    setFormData({
      ...formData,
      answers: [
        ...formData.answers,
        { text: '', isCorrect: false, orderIndex: formData.answers.length }
      ]
    })
  }

  const removeAnswer = (index: number) => {
    if (formData.answers.length <= 2) {
      alert('Debe haber al menos 2 respuestas')
      return
    }
    const newAnswers = formData.answers.filter((_, i) => i !== index)
    setFormData({ ...formData, answers: newAnswers })
  }

  const handleEdit = (question: Question) => {
    setEditingId(question.id)
    setFormData({
      protocolId: question.protocolId,
      text: question.text,
      explanation: question.explanation || '',
      orderIndex: question.orderIndex,
      active: question.active,
      answers: question.answers.map(a => ({
        text: a.text,
        isCorrect: a.isCorrect,
        orderIndex: a.orderIndex
      }))
    })
    setShowAddForm(true)
    setMessage('')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setShowAddForm(false)
    setFormData({
      protocolId: '',
      text: '',
      explanation: '',
      orderIndex: 0,
      active: true,
      answers: [
        { text: '', isCorrect: false, orderIndex: 0 },
        { text: '', isCorrect: false, orderIndex: 1 },
        { text: '', isCorrect: false, orderIndex: 2 },
        { text: '', isCorrect: false, orderIndex: 3 },
      ]
    })
    setMessage('')
  }

  const inputClass = "w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  const labelClass = "block text-sm font-medium text-zinc-300 mb-2"

  const filteredQuestions = selectedProtocol === 'all'
    ? questions
    : questions.filter(q => q.protocolId === selectedProtocol)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-zinc-400">Cargando preguntas...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-white">
            Preguntas ({filteredQuestions.length})
          </h2>

          <select
            value={selectedProtocol}
            onChange={(e) => setSelectedProtocol(e.target.value)}
            className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos los protocolos</option>
            {protocols.map(protocol => (
              <option key={protocol} value={protocol}>{protocol.toUpperCase()}</option>
            ))}
          </select>
        </div>

        <Button onClick={() => showAddForm ? cancelEdit() : setShowAddForm(true)}>
          {showAddForm ? 'Cancelar' : '+ Agregar Pregunta'}
        </Button>
      </div>

      {/* Add/Edit Question Form */}
      {showAddForm && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            {editingId ? 'Editar Pregunta' : 'Nueva Pregunta'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="protocolId" className={labelClass}>
                  Protocol ID *
                </label>
                <select
                  id="protocolId"
                  value={formData.protocolId}
                  onChange={(e) => setFormData({ ...formData, protocolId: e.target.value })}
                  className={inputClass}
                  required
                >
                  <option value="">Selecciona un protocolo</option>
                  <option value="aave">Aave</option>
                  <option value="morpho">Morpho</option>
                  <option value="sablier">Sablier</option>
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
              <label htmlFor="text" className={labelClass}>
                Pregunta *
              </label>
              <textarea
                id="text"
                value={formData.text}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                rows={3}
                className={inputClass}
                placeholder="¿Cuál es la función principal de...?"
                required
              />
            </div>

            <div>
              <label htmlFor="explanation" className={labelClass}>
                Explicación (opcional)
              </label>
              <textarea
                id="explanation"
                value={formData.explanation}
                onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                rows={2}
                className={inputClass}
                placeholder="Explicación mostrada después de responder..."
              />
            </div>

            {/* Answers */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className={labelClass + " mb-0"}>
                  Respuestas * (mínimo 2)
                </label>
                <Button
                  type="button"
                  onClick={addAnswer}
                  variant="secondary"
                  size="sm"
                >
                  + Agregar Respuesta
                </Button>
              </div>

              <div className="space-y-3">
                {formData.answers.map((answer, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
                    <input
                      type="checkbox"
                      checked={answer.isCorrect}
                      onChange={(e) => updateAnswer(index, 'isCorrect', e.target.checked)}
                      className="mt-2 h-4 w-4 text-green-600 focus:ring-green-500 border-zinc-700 rounded bg-zinc-800"
                      title="Marcar como correcta"
                    />
                    <input
                      type="text"
                      value={answer.text}
                      onChange={(e) => updateAnswer(index, 'text', e.target.value)}
                      placeholder={`Respuesta ${index + 1}`}
                      className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {formData.answers.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeAnswer(index)}
                        className="px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-zinc-500 mt-2">
                ✓ = Respuesta correcta
              </p>
            </div>

            <div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-zinc-700 rounded bg-zinc-800"
                />
                <span className="text-sm text-zinc-300">Activa</span>
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
              {submitting ? 'Guardando...' : (editingId ? 'Actualizar Pregunta' : 'Crear Pregunta')}
            </Button>
          </form>
        </Card>
      )}

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.map((question, qIndex) => (
          <Card key={question.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-medium text-zinc-500">
                    #{question.orderIndex}
                  </span>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-900/30 text-blue-400 border border-blue-500/50 uppercase">
                    {question.protocolId}
                  </span>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      question.active
                        ? 'bg-green-900/30 text-green-400 border border-green-500/50'
                        : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                    }`}
                  >
                    {question.active ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
                <h3 className="text-lg font-medium text-white mb-3">
                  {question.text}
                </h3>
                {question.explanation && (
                  <p className="text-sm text-zinc-400 mb-3 italic">
                    💡 {question.explanation}
                  </p>
                )}
              </div>
            </div>

            {/* Answers */}
            <div className="space-y-2 mb-4">
              {question.answers.map((answer, aIndex) => (
                <div
                  key={answer.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    answer.isCorrect
                      ? 'bg-green-900/10 border-green-500/30'
                      : 'bg-zinc-800/30 border-zinc-700'
                  }`}
                >
                  <span className={`text-sm font-medium ${
                    answer.isCorrect ? 'text-green-400' : 'text-zinc-500'
                  }`}>
                    {String.fromCharCode(65 + aIndex)}.
                  </span>
                  <span className={`flex-1 text-sm ${
                    answer.isCorrect ? 'text-green-200' : 'text-zinc-300'
                  }`}>
                    {answer.text}
                  </span>
                  {answer.isCorrect && (
                    <span className="text-xs text-green-400 font-medium">
                      ✓ Correcta
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 mt-auto">
              <Button
                onClick={() => handleEdit(question)}
                variant="secondary"
                className="flex-1 text-xs"
              >
                ✏️ Editar Pregunta
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredQuestions.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-zinc-400 mb-2">
            {selectedProtocol === 'all'
              ? 'No hay preguntas creadas aún'
              : `No hay preguntas para ${selectedProtocol.toUpperCase()}`
            }
          </p>
          <p className="text-sm text-zinc-500">
            Haz clic en "Agregar Pregunta" para comenzar
          </p>
        </Card>
      )}
    </div>
  )
}
