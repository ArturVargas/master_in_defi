'use client'

/**
 * Componente 3D del Macintosh Vintage
 * Renderiza el modelo 3D del Macintosh según las especificaciones técnicas
 */

import { useMemo } from 'react'
import { Box, RoundedBox, Text } from '@react-three/drei'
import { usePlasticTextures } from './textures'

// Colores según especificaciones
const COLORS = {
  mainBody: '#F5F5DC', // Beige claro
  screenBezel: '#D8D8C8', // Beige más oscuro
  screen: '#1a1a1a', // Negro muy oscuro
  floppySlot: '#808080', // Gris metálico
  base: '#C8C8B8', // Beige oscuro
} as const

// Dimensiones según especificaciones (en metros, escala web 0.6x)
const DIMENSIONS = {
  // Carcasa principal
  bodyWidth: 0.15, // 15cm
  bodyHeight: 0.18, // 18cm
  bodyDepth: 0.15, // 15cm
  
  // Pantalla
  screenWidth: 0.12, // 12cm
  screenHeight: 0.09, // 9cm
  screenDepth: 0.005, // 0.5cm
  
  // Bisel
  bezelThickness: 0.012, // 1.2cm
  
  // Ranura disquete
  floppyWidth: 0.054, // 5.4cm
  floppyHeight: 0.001, // 0.1cm
  floppyDepth: 0.006, // 0.6cm
} as const

interface MacintoshModelProps {
  /** Si es true, muestra detalles opcionales como base y logo */
  showDetails?: boolean
}

export function MacintoshModel({ showDetails = false }: MacintoshModelProps) {
  // Generar texturas procedurales para materiales de plástico
  const mainBodyTextures = usePlasticTextures(COLORS.mainBody, 512)
  const bezelTextures = usePlasticTextures(COLORS.screenBezel, 512)
  const baseTextures = usePlasticTextures(COLORS.base, 512)

  // Props de materiales físicos (PBR) con texturas para mejor performance
  const mainBodyMaterialProps = useMemo(() => ({
    color: COLORS.mainBody,
    roughness: 0.7,
    metalness: 0.1,
    // Propiedades PBR para plástico con recubrimiento
    clearcoat: 0.3, // Recubrimiento brillante sutil (simula plástico con acabado)
    clearcoatRoughness: 0.2, // Rugosidad del recubrimiento (más bajo = más brillante)
    ior: 1.5, // Índice de refracción del plástico (típico para plástico ABS)
    envMapIntensity: 0.5, // Intensidad de reflejos del entorno
    // Texturas
    normalMap: mainBodyTextures.normalMap,
    normalScale: 0.3, // Intensidad del normal map (sutil)
    roughnessMap: mainBodyTextures.roughnessMap,
    aoMap: mainBodyTextures.aoMap,
    aoMapIntensity: 0.5, // Intensidad de ambient occlusion
  }), [mainBodyTextures])

  const screenBezelMaterialProps = useMemo(() => ({
    color: COLORS.screenBezel,
    roughness: 0.7,
    metalness: 0.1,
    // Propiedades PBR
    clearcoat: 0.25, // Recubrimiento ligeramente menos brillante que la carcasa
    clearcoatRoughness: 0.25,
    ior: 1.5,
    envMapIntensity: 0.4,
    // Texturas
    normalMap: bezelTextures.normalMap,
    normalScale: 0.3,
    roughnessMap: bezelTextures.roughnessMap,
    aoMap: bezelTextures.aoMap,
    aoMapIntensity: 0.5,
  }), [bezelTextures])

  const screenMaterialProps = {
    color: COLORS.screen,
    roughness: 0.9,
    metalness: 0.0,
    emissive: '#000000',
  }

  const floppySlotMaterialProps = {
    color: COLORS.floppySlot,
    roughness: 0.3,
    metalness: 0.7,
  }

  const baseMaterialProps = useMemo(() => ({
    color: COLORS.base,
    roughness: 0.7,
    metalness: 0.1,
    // Propiedades PBR (base puede tener menos brillo)
    clearcoat: 0.2, // Recubrimiento menos brillante
    clearcoatRoughness: 0.3,
    ior: 1.5,
    envMapIntensity: 0.3, // Menos reflejos en la base
    // Texturas
    normalMap: baseTextures.normalMap,
    normalScale: 0.3,
    roughnessMap: baseTextures.roughnessMap,
    aoMap: baseTextures.aoMap,
    aoMapIntensity: 0.5,
  }), [baseTextures])

  return (
    <group>
      {/* Carcasa Principal */}
      <RoundedBox
        args={[DIMENSIONS.bodyWidth, DIMENSIONS.bodyHeight, DIMENSIONS.bodyDepth]}
        radius={0.006} // Radio de bordes redondeados (6mm)
        smoothness={4}
        position={[0, 0, 0]}
      >
        <meshPhysicalMaterial {...mainBodyMaterialProps} />
      </RoundedBox>

      {/* Bisel de la Pantalla - Parte Superior */}
      <Box
        args={[DIMENSIONS.screenWidth + DIMENSIONS.bezelThickness * 2, DIMENSIONS.bezelThickness, 0.008]}
        position={[0, DIMENSIONS.screenHeight / 2 + DIMENSIONS.bezelThickness / 2 + 0.03, 0.075]}
      >
        <meshPhysicalMaterial {...screenBezelMaterialProps} />
      </Box>

      {/* Bisel de la Pantalla - Parte Inferior */}
      <Box
        args={[DIMENSIONS.screenWidth + DIMENSIONS.bezelThickness * 2, DIMENSIONS.bezelThickness, 0.008]}
        position={[0, -DIMENSIONS.screenHeight / 2 - DIMENSIONS.bezelThickness / 2 + 0.03, 0.075]}
      >
        <meshPhysicalMaterial {...screenBezelMaterialProps} />
      </Box>

      {/* Bisel de la Pantalla - Parte Izquierda */}
      <Box
        args={[DIMENSIONS.bezelThickness, DIMENSIONS.screenHeight, 0.008]}
        position={[-DIMENSIONS.screenWidth / 2 - DIMENSIONS.bezelThickness / 2, 0.03, 0.075]}
      >
        <meshPhysicalMaterial {...screenBezelMaterialProps} />
      </Box>

      {/* Bisel de la Pantalla - Parte Derecha */}
      <Box
        args={[DIMENSIONS.bezelThickness, DIMENSIONS.screenHeight, 0.008]}
        position={[DIMENSIONS.screenWidth / 2 + DIMENSIONS.bezelThickness / 2, 0.03, 0.075]}
      >
        <meshPhysicalMaterial {...screenBezelMaterialProps} />
      </Box>

      {/* Pantalla CRT - Aquí se renderizará el contenido del protocolo */}
      <Box
        args={[DIMENSIONS.screenWidth, DIMENSIONS.screenHeight, DIMENSIONS.screenDepth]}
        position={[0, 0.03, 0.076]}
      >
        <meshStandardMaterial {...screenMaterialProps} />
      </Box>

      {/* Ranura de Disquete */}
      <Box
        args={[DIMENSIONS.floppyWidth, DIMENSIONS.floppyHeight, DIMENSIONS.floppyDepth]}
        position={[0, -0.048, 0.076]}
      >
        <meshStandardMaterial {...floppySlotMaterialProps} />
      </Box>

      {/* Logotipo de Apple - Parte inferior izquierda del frente */}
      {/* Símbolo de Apple estilizado - usando texto con símbolo Unicode */}
      <Text
        position={[-0.06, -0.08, 0.077]}
        rotation={[0, 0, 0]}
        fontSize={0.015}
        color="#999999"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.001}
        outlineColor="#666666"
      >
        ⚬
      </Text>
      {/* Texto "Apple" pequeño debajo */}
      <Text
        position={[-0.06, -0.092, 0.077]}
        rotation={[0, 0, 0]}
        fontSize={0.006}
        color="#666666"
        anchorX="center"
        anchorY="top"
      >
        Apple
      </Text>

      {/* Base/Soporte (Opcional) - Ancho reducido */}
      {showDetails && (
        <Box
          args={[DIMENSIONS.bodyWidth * 1.05, 0.03, DIMENSIONS.bodyDepth * 1.05]}
          position={[0, -DIMENSIONS.bodyHeight / 2 - 0.015, 0]}
        >
          <meshPhysicalMaterial {...baseMaterialProps} />
        </Box>
      )}
    </group>
  )
}
