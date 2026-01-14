/**
 * Utilidad para combinar clases de Tailwind CSS
 * Similar a clsx pero optimizado para Tailwind
 */

type ClassValue = string | number | boolean | undefined | null
type ClassDictionary = Record<string, boolean | undefined | null>
type ClassArray = ClassValue[]

export function cn(...inputs: (ClassValue | ClassDictionary | ClassArray)[]): string {
  const classes: string[] = []

  for (const input of inputs) {
    if (!input) continue

    if (typeof input === 'string') {
      classes.push(input)
    } else if (Array.isArray(input)) {
      const inner = cn(...input)
      if (inner) classes.push(inner)
    } else if (typeof input === 'object') {
      for (const key in input) {
        if (input[key]) {
          classes.push(key)
        }
      }
    }
  }

  return classes.filter(Boolean).join(' ')
}
