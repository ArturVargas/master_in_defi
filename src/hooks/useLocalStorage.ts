/**
 * Hook para manejo de localStorage con TypeScript
 * Proporciona tipado seguro y manejo de errores
 */

import { useState, useEffect, useCallback } from 'react'

type SetValue<T> = T | ((val: T) => T)

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: SetValue<T>) => void] {
  // Estado para almacenar nuestro valor
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // Función para actualizar el valor
  const setValue = useCallback(
    (value: SetValue<T>) => {
      try {
        // Permitir que value sea una función para tener la misma API que useState
        const valueToStore = value instanceof Function ? value(storedValue) : value
        
        setStoredValue(valueToStore)
        
        // Guardar en localStorage
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore))
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error)
      }
    },
    [key, storedValue]
  )

  return [storedValue, setValue]
}

/**
 * Hook simplificado para leer de localStorage (solo lectura)
 */
export function useLocalStorageRead<T>(key: string, initialValue: T): T {
  const [value] = useLocalStorage(key, initialValue)
  return value
}
