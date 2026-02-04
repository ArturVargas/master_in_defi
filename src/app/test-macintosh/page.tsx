/**
 * Página de prueba para el modelo 3D del Macintosh
 * Permite verificar que el modelo se renderiza correctamente
 */

import { MacintoshScene } from '@/components/3D_components'

export default function TestMacintoshPage() {
  return (
    <div className="min-h-screen bg-black p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-center text-4xl font-bold text-white">
          Test: Macintosh 3D Model
        </h1>
        
        <div className="mb-4 rounded-lg bg-zinc-900 p-4">
          <p className="text-sm text-zinc-400">
            Esta es una página de prueba para verificar el modelo 3D del Macintosh.
            Puedes rotar, hacer zoom y explorar el modelo.
          </p>
        </div>

        {/* Contenedor del modelo 3D */}
        <div className="h-[600px] w-full rounded-lg bg-zinc-900">
          <MacintoshScene showDetails={true} enableControls={true} />
        </div>

        <div className="mt-4 rounded-lg bg-zinc-900 p-4">
          <h2 className="mb-2 text-lg font-semibold text-white">
            Controles:
          </h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-400">
            <li>Click y arrastra para rotar</li>
            <li>Rueda del mouse para hacer zoom</li>
            <li>Click derecho y arrastra para mover la cámara</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
