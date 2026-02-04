/**
 * Configuración del cliente Nomi Echo
 * Usa config centralizada; re-exporta valores usados por el cliente
 */

import { config } from '@/lib/config'

export const nomiEchoConfig = {
  get baseUrl(): string {
    const url = config.nomiEcho.apiUrl
    return url.endsWith('/') ? url.slice(0, -1) : url
  },
  get timeoutMs(): number {
    return config.nomiEcho.timeoutMs
  },
} as const
