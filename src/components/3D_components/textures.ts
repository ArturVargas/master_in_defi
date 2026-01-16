/**
 * Utilidades para generar texturas procedurales de plástico beige vintage
 * Genera normal maps, roughness maps y variación de color usando Canvas API
 */

import { useMemo } from 'react'
import { Texture, CanvasTexture, RepeatWrapping } from 'three'

/**
 * Genera una textura de normal map para simular imperfecciones sutiles del plástico
 */
export function generateNormalMap(size: number = 512): Texture {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  // Crear ruido procedural para simular textura de plástico
  const imageData = ctx.createImageData(size, size)
  const data = imageData.data

  // Generar ruido Perlin simplificado o ruido aleatorio suavizado
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const index = (y * size + x) * 4

      // Generar variación sutil (normal map usa RGB para XYZ)
      // X component (rojo) - variación horizontal
      const nx = Math.sin((x / size) * Math.PI * 8) * 0.1 + 
                 Math.random() * 0.05 - 0.025
      // Y component (verde) - variación vertical  
      const ny = Math.sin((y / size) * Math.PI * 8) * 0.1 + 
                 Math.random() * 0.05 - 0.025
      // Z component (azul) - siempre hacia arriba (normalizada)
      const nz = 0.5 + Math.sqrt(1 - nx * nx - ny * ny) * 0.5

      // Normal map: valores de 0-255, centrados en 128
      data[index] = (nx * 0.5 + 0.5) * 255     // R
      data[index + 1] = (ny * 0.5 + 0.5) * 255 // G
      data[index + 2] = nz * 255                // B
      data[index + 3] = 255                     // A
    }
  }

  ctx.putImageData(imageData, 0, 0)
  const texture = new CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = RepeatWrapping
  texture.repeat.set(2, 2) // Repetir la textura 2x2 para mejor cobertura
  texture.needsUpdate = true
  return texture
}

/**
 * Genera una textura de roughness map para variación de brillo
 * Simula áreas más brillantes y más mates en el plástico
 */
export function generateRoughnessMap(size: number = 512): Texture {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  const imageData = ctx.createImageData(size, size)
  const data = imageData.data

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const index = (y * size + x) * 4

      // Crear variación de roughness (0 = brillante, 255 = mate)
      // Base de 0.7 (179 en escala 0-255) con variación sutil
      const baseRoughness = 0.7
      const variation = Math.sin((x / size) * Math.PI * 4) * 
                       Math.sin((y / size) * Math.PI * 4) * 0.1
      const roughness = Math.max(0, Math.min(1, baseRoughness + variation))

      const gray = roughness * 255
      data[index] = gray     // R
      data[index + 1] = gray  // G
      data[index + 2] = gray // B
      data[index + 3] = 255  // A
    }
  }

  ctx.putImageData(imageData, 0, 0)
  const texture = new CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = RepeatWrapping
  texture.repeat.set(2, 2) // Repetir la textura 2x2 para mejor cobertura
  texture.needsUpdate = true
  return texture
}

/**
 * Genera una textura de variación de color (albedo) para simular desgaste vintage
 * Añade variación sutil de color beige para simular oxidación/desgaste
 */
export function generateAlbedoVariationMap(
  baseColor: string = '#F5F5DC',
  size: number = 512
): Texture {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  // Convertir color base a RGB
  const hex = baseColor.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  const imageData = ctx.createImageData(size, size)
  const data = imageData.data

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const index = (y * size + x) * 4

      // Variación sutil de color (simula desgaste/oxidación)
      const variation = Math.sin((x / size) * Math.PI * 6) * 
                       Math.sin((y / size) * Math.PI * 6) * 0.05
      
      // Aplicar variación más pronunciada en algunas áreas (simula desgaste)
      const wearPattern = Math.random() > 0.95 ? -0.1 : 0 // Algunas áreas más desgastadas
      const totalVariation = variation + wearPattern

      data[index] = Math.max(0, Math.min(255, r + totalVariation * 255))     // R
      data[index + 1] = Math.max(0, Math.min(255, g + totalVariation * 255))   // G
      data[index + 2] = Math.max(0, Math.min(255, b + totalVariation * 255))  // B
      data[index + 3] = 255                                                    // A
    }
  }

  ctx.putImageData(imageData, 0, 0)
  const texture = new CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = RepeatWrapping
  texture.repeat.set(2, 2) // Repetir la textura 2x2 para mejor cobertura
  texture.needsUpdate = true
  return texture
}

/**
 * Genera una textura de ambient occlusion (AO) para sombras sutiles
 * Simula áreas donde la luz no llega tan bien (esquinas, grietas)
 */
export function generateAOMap(size: number = 512): Texture {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  const imageData = ctx.createImageData(size, size)
  const data = imageData.data

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const index = (y * size + x) * 4

      // Crear patrón de AO (más oscuro en bordes, más claro en centro)
      const centerX = size / 2
      const centerY = size / 2
      const distX = Math.abs(x - centerX) / centerX
      const distY = Math.abs(y - centerY) / centerY
      const dist = Math.max(distX, distY)

      // AO: 0 = completamente ocluso (negro), 255 = sin oclusión (blanco)
      const ao = 0.85 + (1 - dist) * 0.15 // Más claro en el centro

      const gray = ao * 255
      data[index] = gray     // R
      data[index + 1] = gray // G
      data[index + 2] = gray // B
      data[index + 3] = 255  // A
    }
  }

  ctx.putImageData(imageData, 0, 0)
  const texture = new CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = RepeatWrapping
  texture.repeat.set(2, 2) // Repetir la textura 2x2 para mejor cobertura
  texture.needsUpdate = true
  return texture
}

/**
 * Hook para generar y memoizar texturas de plástico beige
 * Genera todas las texturas necesarias para un material realista
 */
export function usePlasticTextures(baseColor: string = '#F5F5DC', size: number = 512) {
  return useMemo(() => {
    return {
      normalMap: generateNormalMap(size),
      roughnessMap: generateRoughnessMap(size),
      albedoMap: generateAlbedoVariationMap(baseColor, size),
      aoMap: generateAOMap(size),
    }
  }, [baseColor, size])
}
