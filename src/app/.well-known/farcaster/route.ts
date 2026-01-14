/**
 * Ruta API para servir el manifest de Farcaster
 * Esta ruta se accede como /.well-known/farcaster
 * Pero se expone como /.well-known/farcaster.json mediante rewrite en next.config.ts
 * 
 * Farcaster requiere exactamente: /.well-known/farcaster.json
 */

import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'

export async function GET() {
  try {
    // Leer el archivo desde public/.well-known/farcaster.json
    const filePath = join(process.cwd(), 'public', '.well-known', 'farcaster.json')
    const fileContents = await readFile(filePath, 'utf-8')
    const manifest = JSON.parse(fileContents)

    // Retornar con headers correctos para Farcaster
    return NextResponse.json(manifest, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600', // Cache por 1 hora
      },
    })
  } catch (error) {
    console.error('Error leyendo manifest de Farcaster:', error)
    
    // Retornar un manifest por defecto si hay error leyendo el archivo
    return NextResponse.json(
      {
        frame: {
          name: 'Master En DeFi',
          iconUrl: 'https://masterendefi.lat/master_defi_icon.png',
          homeUrl: 'https://masterendefi.lat/',
          imageUrl: 'https://masterendefi.lat/master_defi_banner.png',
          buttonTitle: 'Comenzar a aprender',
          splashImageUrl: 'https://masterendefi.lat/splash.png',
          splashBackgroundColor: '#000000',
        },
      },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  }
}
