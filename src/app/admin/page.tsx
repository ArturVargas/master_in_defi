'use client'

/**
 * Panel de administración para crear y gestionar drops de POAP
 * Protegido con admin secret
 */

import { useState } from 'react'
import { CreateDropForm } from '@/components/admin/CreateDropForm'
import { UploadCodesForm } from '@/components/admin/UploadCodesForm'
import { TabNavigation } from '@/components/admin/TabNavigation'
import { DropsListView } from '@/components/admin/DropsListView'
import { ProtocolsListView } from '@/components/admin/ProtocolsListView'
import { QuestionsListView } from '@/components/admin/QuestionsListView'
import { CodesListView } from '@/components/admin/CodesListView'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function AdminPage() {
  const [adminSecret, setAdminSecret] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeTab, setActiveTab] = useState('create-drop')
  const [createdDropId, setCreatedDropId] = useState<string | null>(null)
  const [createdDropName, setCreatedDropName] = useState<string | null>(null)

  const tabs = [
    { id: 'create-drop', label: 'Crear Drop' },
    { id: 'drops', label: 'Ver Drops' },
    { id: 'codes', label: 'Ver Códigos' },
    { id: 'protocols', label: 'Protocolos' },
    { id: 'questions', label: 'Preguntas' },
  ]

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (adminSecret) {
      setIsAuthenticated(true)
    }
  }

  const handleLogout = () => {
    setAdminSecret('')
    setIsAuthenticated(false)
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Admin Panel</h1>
            <p className="text-zinc-400 text-sm">
              Gestión de Drops POAP para Master en DeFi
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="secret" className="block text-sm font-medium text-zinc-300 mb-2">
                Admin Secret
              </label>
              <input
                id="secret"
                type="password"
                value={adminSecret}
                onChange={(e) => setAdminSecret(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ingresa el código secreto"
                required
              />
            </div>

            <Button type="submit" className="w-full">
              Iniciar Sesión
            </Button>
          </form>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Panel de Administración
            </h1>
            <p className="text-zinc-400">
              Gestiona drops, protocolos, preguntas y respuestas
            </p>
          </div>

          <Button
            onClick={handleLogout}
            variant="secondary"
            className="bg-zinc-800 hover:bg-zinc-700"
          >
            Cerrar Sesión
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <TabNavigation
            tabs={tabs}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
        </div>

        {/* Tab Content */}
        {activeTab === 'create-drop' && (
          <div className="space-y-8">
            {/* Info Card */}
            <Card className="p-6 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30">
              <h2 className="text-lg font-semibold text-white mb-2">
                ℹ️ Instrucciones
              </h2>
              <ul className="space-y-2 text-sm text-zinc-300">
                <li>• Selecciona un protocolo (Aave, Morpho, Sablier) en el formulario</li>
                <li>• El drop se creará en POAP.xyz y se guardará automáticamente en la base de datos</li>
                <li>• Los usuarios podrán reclamar POAPs inmediatamente después de pasar el quiz</li>
                <li>• El porcentaje para aprobar define cuántas respuestas correctas necesita el usuario</li>
                <li>• Guarda el código secreto para poder editar el drop después en POAP.xyz</li>
              </ul>
            </Card>

            {/* Create Drop Form */}
            <Card className="p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Crear Nuevo Drop
                </h2>
                <p className="text-zinc-400 text-sm">
                  Completa el formulario para crear un drop en POAP.xyz
                </p>
              </div>

              <CreateDropForm
                adminSecret={adminSecret}
                onSuccess={(eventId) => {
                  console.log('Drop created with Event ID:', eventId)
                  setActiveTab('drops')
                }}
              />
            </Card>

            {/* Sistema Automático */}
            <Card className="p-6 bg-green-900/10 border-green-500/30">
              <h2 className="text-lg font-semibold text-white mb-3">
                ✅ Sistema de Distribución Automático
              </h2>
              <div className="space-y-3 text-sm text-zinc-300">
                <p className="text-white font-medium">
                  El sistema distribuye códigos automáticamente:
                </p>
                <ul className="space-y-2 ml-4">
                  <li>✓ Los drops se guardan automáticamente en la base de datos</li>
                  <li>✓ Sube códigos POAP desde archivos .txt (uno por línea)</li>
                  <li>✓ Los códigos se asignan automáticamente al completar el quiz</li>
                  <li>✓ Cada código se usa solo una vez</li>
                  <li>✓ Puedes ver estadísticas en tiempo real</li>
                </ul>
                <p className="mt-4 text-zinc-400">
                  Una vez subidos los códigos, los usuarios que pasen el quiz recibirán automáticamente su POAP.
                </p>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'drops' && <DropsListView />}
        {activeTab === 'codes' && <CodesListView />}
        {activeTab === 'protocols' && <ProtocolsListView adminSecret={adminSecret} />}
        {activeTab === 'questions' && <QuestionsListView adminSecret={adminSecret} />}
      </div>
    </div>
  )
}
