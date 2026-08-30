import useIsMobile from '../hooks/useIsMobile'

export default function Navbar({ page, setPage }) {
  const isMobile = useIsMobile()
  const links = [
    { id: 'dashboard', label: 'Dashboard', icon: '▣' },
    { id: 'search', label: 'Search', icon: '○' },
    { id: 'friends', label: 'Friends', icon: '◈' },
    { id: 'profile', label: 'Profile', icon: '◉' },
  ]

  if (isMobile) {
    return (
      <div style={{
        width: '100%',
        height: '64px',
        background: '#0d0d0d',
        borderTop: '1px solid #1e1e1e',
        display: 'flex',
        position: 'fixed',
        bottom: 0, left: 0,
        zIndex: 100,
        fontFamily: "'Georgia', serif",
        paddingBottom: 'env(safe-area-inset-bottom)',
        boxSizing: 'border-box',
      }}>
        {links.map(link => (
          <button
            key={link.id}
            onClick={() => setPage(link.id)}
            style={{
              flex: 1,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: '0.25rem',
              background: 'transparent',
              border: 'none',
              color: page === link.id ? '#f0ece4' : '#555',
              fontFamily: 'inherit',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: '1.1rem', opacity: page === link.id ? 1 : 0.7 }}>{link.icon}</span>
            <span style={{ fontSize: '0.62rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {link.label}
            </span>
          </button>
        ))}
      </div>
    )
  }

  return (
    <div style={{
      width: '200px',
      minHeight: '100vh',
      background: '#0d0d0d',
      borderRight: '1px solid #1e1e1e',
      display: 'flex',
      flexDirection: 'column',
      padding: '2rem 0',
      position: 'fixed',
      top: 0, left: 0,
      fontFamily: "'Georgia', serif",
    }}>
      {/* Brand */}
      <div style={{ padding: '0 1.5rem', marginBottom: '2.5rem' }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '50%',
          border: '4px solid #2a2a2a',
          boxShadow: 'inset 0 0 0 2px #111, inset 0 0 0 5px #1e1e1e',
          marginBottom: '0.75rem'
        }} />
        <p style={{
          color: '#f0ece4', fontSize: '0.85rem',
          letterSpacing: '0.15em', textTransform: 'uppercase',
          margin: 0, fontWeight: 400
        }}>Record Caller</p>
      </div>

      {/* Nav links */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '0 0.75rem' }}>
        {links.map(link => (
          <button
            key={link.id}
            onClick={() => setPage(link.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.65rem 0.75rem',
              background: page === link.id ? '#1a1a1a' : 'transparent',
              border: page === link.id ? '1px solid #2a2a2a' : '1px solid transparent',
              borderRadius: '3px',
              color: page === link.id ? '#f0ece4' : '#555',
              fontSize: '0.8rem', letterSpacing: '0.1em',
              textTransform: 'uppercase', fontFamily: 'inherit',
              cursor: 'pointer', textAlign: 'left',
              transition: 'all 0.15s'
            }}
          >
            <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>{link.icon}</span>
            {link.label}
          </button>
        ))}
      </div>
    </div>
  )
}
