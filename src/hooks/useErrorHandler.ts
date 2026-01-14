/**
 * Hook para manejo centralizado de errores
 * Proporciona estado de error y funciones para manejar errores
 */

import { useState, useCallback } from 'react'

interface UseErrorHandlerReturn {
  error: string | null
  handleError: (error: unknown) => void
  clearError: () => void
}

export function useErrorHandler(autoClearDelay: number = 5000): UseErrorHandlerReturn {
  const [error, setError] = useState<string | null>(null)

  const handleError = useCallback((err: unknown) => {
    let message = 'Error desconocido'
    
    if (err instanceof Error) {
      message = err.message
    } else if (typeof err === 'string') {
      message = err
    } else if (err && typeof err === 'object' && 'message' in err) {
      message = String(err.message)
    }

    setError(message)

    // Auto-clear después del delay especificado
    if (autoClearDelay > 0) {
      setTimeout(() => setError(null), autoClearDelay)
    }
  }, [autoClearDelay])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return { error, handleError, clearError }
}
