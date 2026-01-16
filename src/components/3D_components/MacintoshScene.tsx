'use client'

/**
 * Escena 3D del Macintosh con Canvas, cámara e iluminación
 * Wrapper que configura el entorno 3D necesario para renderizar el modelo
 */

import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
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
        {/* Fondo negro */}
        <color attach="background" args={['black']} />

        {/* Iluminación según especificaciones */}
        {/* Luz Ambiental */}
        <ambientLight intensity={0.15} color="#ffffff" />

        {/* Luz Direccional Principal (spotlight para sombras) */}
        <spotLight
          decay={0}
          position={[10, 20, 10]}
          angle={0.12}
          penumbra={1}
          intensity={0.6} // Intensidad reducida
          castShadow={false}
          shadow-mapSize={1024}
        />

        {/* Luz Direccional de Relleno */}
        <directionalLight
          position={[-5, 2, -5]}
          intensity={0.3}
          color="#ffffff"
        />

        {/* Cámara en distancia intermedia */}
        <PerspectiveCamera
          makeDefault
          fov={55}
          position={[0.6, 0.28, 0.9]} // Distancia intermedia
          near={0.1}
          far={100}
        />

        {/* Controles de órbita (rotar, sin zoom, sin pan, rango Y limitado) */}
        {enableControls && (
          <OrbitControls
            enablePan={false} // Deshabilitar pan para mantener el modelo centrado
            enableZoom={false} // Deshabilitar zoom
            enableRotate={true}
            minDistance={0.6} // Distancia mínima fija
            maxDistance={0.6} // Distancia máxima fija (misma que mínima = sin zoom)
            minPolarAngle={Math.PI / 3} // Ángulo mínimo vertical (60 grados desde arriba)
            maxPolarAngle={Math.PI / 1.5} // Ángulo máximo vertical (120 grados desde arriba)
            autoRotate={false}
            autoRotateSpeed={0.5}
          />
        )}

        {/* Modelo del Macintosh */}
        <MacintoshModel showDetails={showDetails} />

        {/* Post-Processing: Efectos visuales avanzados */}
        <EffectComposer>
          {/* Bloom: Efecto de brillo suave en áreas luminosas (más intenso como en el CodeSandbox) */}
          <Bloom
            luminanceThreshold={0} // Sin umbral para que todo brille
            mipmapBlur
            luminanceSmoothing={0.0}
            intensity={5} // Intensidad alta como en el ejemplo
          />

          {/* Vignette: Oscurecimiento sutil en los bordes para enfoque */}
          <Vignette
            eskil={false} // No usar técnica eskil
            offset={0.1} // Offset del efecto
            darkness={0.5} // Intensidad del oscurecimiento
          />
        </EffectComposer>
      </Canvas>
    </div>
  )
}
