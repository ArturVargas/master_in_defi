'use client'

/**
 * Escena 3D del Macintosh con Canvas, cámara e iluminación
 * Wrapper que configura el entorno 3D necesario para renderizar el modelo
 */

import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { MacintoshModel } from './MacintoshModel'

interface MacintoshSceneProps {
  /** Si es true, muestra detalles opcionales */
  showDetails?: boolean
  /** Si es true, permite rotar el modelo con el mouse */
  enableControls?: boolean
  /** Clase CSS adicional para el contenedor del Canvas */
  className?: string
}

export function MacintoshScene({
  showDetails = false,
  enableControls = true,
  className,
}: MacintoshSceneProps) {
  return (
    <div className={className} style={{ width: '100%', height: '100%' }}>
      <Canvas
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]} // Device pixel ratio (1 para móviles, 2 para desktop)
        style={{ width: '100%', height: '100%' }}
      >
        {/* Iluminación según especificaciones */}
        {/* Luz Ambiental */}
        <ambientLight intensity={0.4} color="#ffffff" />

        {/* Luz Direccional Principal */}
        <directionalLight
          position={[5, 5, 5]}
          intensity={0.8}
          color="#ffffff"
          castShadow={false}
        />

        {/* Luz Direccional de Relleno */}
        <directionalLight
          position={[-5, 2, -5]}
          intensity={0.3}
          color="#ffffff"
        />

        {/* Luz Puntual (Opcional) */}
        <pointLight position={[0, 3, 3]} intensity={0.5} color="#ffffff" />

        {/* Cámara según especificaciones */}
        <PerspectiveCamera
          makeDefault
          fov={55}
          position={[0.4, 0.2, 0.6]}
          near={0.1}
          far={100}
        />

        {/* Controles de órbita (rotar, zoom, pan) */}
        {enableControls && (
          <OrbitControls
            enablePan={false} // Deshabilitar pan para mantener el modelo centrado
            enableZoom={true}
            enableRotate={true}
            minDistance={0.5}
            maxDistance={2}
            autoRotate={false}
            autoRotateSpeed={0.5}
          />
        )}

        {/* Modelo del Macintosh */}
        <MacintoshModel showDetails={showDetails} />
      </Canvas>
    </div>
  )
}
