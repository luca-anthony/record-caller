export default function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, fontFamily: "'Georgia', serif"
    }}>
      <div style={{
        background: '#111',
        border: '1px solid #2a2a2a',
        borderRadius: '4px',
        padding: '2rem',
        maxWidth: '340px',
        width: '90%',
      }}>
        <p style={{
          color: '#f0ece4', fontSize: '0.9rem',
          lineHeight: 1.6, margin: '0 0 1.75rem',
          letterSpacing: '0.03em'
        }}>{message}</p>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: '0.7rem',
              background: '#f0ece4', color: '#0a0a0a',
              border: 'none', borderRadius: '2px',
              fontSize: '0.72rem', letterSpacing: '0.15em',
              textTransform: 'uppercase', fontFamily: 'inherit',
              cursor: 'pointer'
            }}
          >Yes</button>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '0.7rem',
              background: 'transparent', color: '#555',
              border: '1px solid #2a2a2a', borderRadius: '2px',
              fontSize: '0.72rem', letterSpacing: '0.15em',
              textTransform: 'uppercase', fontFamily: 'inherit',
              cursor: 'pointer'
            }}
          >No</button>
        </div>
      </div>
    </div>
  )
}