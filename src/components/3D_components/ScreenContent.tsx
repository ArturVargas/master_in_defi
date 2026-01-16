'use client'

/**
 * Componente que renderiza el contenido animado de la pantalla del Macintosh
 * Efecto typewriter retro con estilo terminal
 */

import { useState, useEffect } from 'react'

interface ScreenContentProps {
  /** Nombre del protocolo a mostrar */
  protocolName: string
}

export function ScreenContent({ protocolName }: ScreenContentProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [showCursor, setShowCursor] = useState(true)

  // Animación typewriter
  useEffect(() => {
    setDisplayedText('')
    let currentIndex = 0
    const typingSpeed = 100 // ms por letra

    const typingInterval = setInterval(() => {
      if (currentIndex < protocolName.length) {
        setDisplayedText(protocolName.slice(0, currentIndex + 1))
        currentIndex++
      } else {
        clearInterval(typingInterval)
      }
    }, typingSpeed)

    return () => clearInterval(typingInterval)
  }, [protocolName])

  // Cursor parpadeante
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev)
    }, 530) // Velocidad de parpadeo

    return () => clearInterval(cursorInterval)
  }, [])

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#000000',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'monospace',
        color: '#00ff41', // Verde fosforescente tipo terminal
        fontSize: '24px',
        padding: '20px',
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Efecto de scanlines sutil */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `repeating-linear-gradient(
            0deg,
            rgba(0, 255, 65, 0.03) 0px,
            transparent 2px,
            transparent 4px
          )`,
          pointerEvents: 'none',
        }}
      />

      {/* Contenido del texto */}
      <div
        style={{
          textAlign: 'center',
          textShadow: '0 0 10px rgba(0, 255, 65, 0.5), 0 0 20px rgba(0, 255, 65, 0.3)',
          zIndex: 1,
        }}
      >
        <div style={{ marginBottom: '10px' }}>&gt; {displayedText}</div>
        {showCursor && (
          <span
            style={{
              display: 'inline-block',
              width: '12px',
              height: '24px',
              backgroundColor: '#00ff41',
              marginLeft: '4px',
              animation: 'blink 1s infinite',
            }}
          />
        )}
      </div>

      <style jsx>{`
        @keyframes blink {
          0%, 50% {
            opacity: 1;
          }
          51%, 100% {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}
