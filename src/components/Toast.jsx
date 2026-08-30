import { useEffect } from 'react'
import useIsMobile from '../hooks/useIsMobile'

export default function Toast({ toasts, setToasts }) {
  const isMobile = useIsMobile()

  useEffect(() => {
    if (toasts.length === 0) return
    const timer = setTimeout(() => {
      setToasts(prev => prev.slice(1))
    }, 3000)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toasts])

  return (
    <div style={{
      position: 'fixed',
      bottom: isMobile ? '76px' : '1.5rem',
      right: isMobile ? '0.75rem' : '1.5rem',
      left: isMobile ? '0.75rem' : 'auto',
      display: 'flex', flexDirection: 'column', gap: '0.5rem',
      alignItems: isMobile ? 'stretch' : 'flex-end',
      zIndex: 999, pointerEvents: 'none'
    }}>
      {toasts.map(toast => (
        <div
          key={toast.id}
          style={{
            background: '#111',
            border: `1px solid ${toast.type === 'called' ? '#2a3a2a' : '#3a2a2a'}`,
            borderLeft: `3px solid ${toast.type === 'called' ? '#7aad7a' : '#c0392b'}`,
            borderRadius: '3px',
            padding: '0.75rem 2.5rem 0.75rem 1rem',
            fontFamily: "'Georgia', serif",
            color: '#f0ece4',
            fontSize: '0.82rem',
            minWidth: isMobile ? 'auto' : '220px',
            maxWidth: isMobile ? 'none' : '300px',
            boxSizing: 'border-box',
            pointerEvents: 'all',
            position: 'relative',
            animation: 'slideIn 0.2s ease'
          }}
        >
          <p style={{ margin: 0, color: toast.type === 'called' ? '#7aad7a' : '#c0392b', fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
            {toast.type === 'called' ? '📞 Calling' : '📵 Blocked'}
          </p>
          <p style={{ margin: 0, color: '#f0ece4', lineHeight: 1.3 }}>{toast.album}</p>

          {/* Dismiss button */}
          <span
            onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
            style={{
              position: 'absolute', top: '0.5rem', right: '0.6rem',
              color: '#444', cursor: 'pointer', fontSize: '0.9rem',
              lineHeight: 1
            }}
          >×</span>
        </div>
      ))}

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}
