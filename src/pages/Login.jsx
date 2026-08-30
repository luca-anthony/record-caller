import { useState } from 'react'
import { supabase } from '../lib/supabase'
import useIsMobile from '../hooks/useIsMobile'

export default function Login() {
  const isMobile = useIsMobile()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else setMessage('Check your email to confirm your account!')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    }

    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Georgia', serif",
      padding: isMobile ? '1.25rem' : '2rem',
      boxSizing: 'border-box',
      overflow: 'hidden'
    }}>

      <div style={{
        position: 'fixed', top: '-120px', right: '-120px',
        width: '420px', height: '420px', borderRadius: '50%',
        border: '40px solid #1a1a1a',
        boxShadow: 'inset 0 0 0 20px #111, inset 0 0 0 60px #161616, inset 0 0 0 80px #111',
        opacity: 0.6, pointerEvents: 'none'
      }} />
      <div style={{
        position: 'fixed', bottom: '-80px', left: '-80px',
        width: '280px', height: '280px', borderRadius: '50%',
        border: '30px solid #1a1a1a',
        boxShadow: 'inset 0 0 0 14px #111, inset 0 0 0 40px #161616',
        opacity: 0.4, pointerEvents: 'none'
      }} />

      <div style={{
        width: '100%', maxWidth: '400px',
        background: '#111',
        border: '1px solid #2a2a2a',
        borderRadius: '4px',
        padding: isMobile ? '2rem 1.5rem' : '3rem 2.5rem',
        boxSizing: 'border-box',
        position: 'relative', zIndex: 1
      }}>

        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '50%',
            background: '#1a1a1a',
            border: '6px solid #2a2a2a',
            boxShadow: 'inset 0 0 0 3px #111, inset 0 0 0 8px #222',
            margin: '0 auto 1.2rem'
          }} />
          <h1 style={{
            color: '#f0ece4', fontSize: '1.6rem',
            letterSpacing: '0.12em', fontWeight: 400,
            margin: 0, textTransform: 'uppercase'
          }}>Record Caller</h1>
          <p style={{
            color: '#555', fontSize: '0.8rem',
            letterSpacing: '0.2em', marginTop: '0.4rem',
            textTransform: 'uppercase'
          }}>
            {isSignUp ? 'Create your account' : 'Sign in to your collection'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block', color: '#666',
              fontSize: '0.72rem', letterSpacing: '0.15em',
              textTransform: 'uppercase', marginBottom: '0.5rem'
            }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{
                width: '100%', padding: '0.75rem 1rem',
                background: '#0d0d0d', border: '1px solid #2a2a2a',
                borderRadius: '2px', color: '#f0ece4',
                fontSize: '0.95rem', fontFamily: 'inherit',
                outline: 'none', boxSizing: 'border-box'
              }}
              onFocus={e => e.target.style.borderColor = '#555'}
              onBlur={e => e.target.style.borderColor = '#2a2a2a'}
            />
          </div>

          <div style={{ marginBottom: '1.8rem' }}>
            <label style={{
              display: 'block', color: '#666',
              fontSize: '0.72rem', letterSpacing: '0.15em',
              textTransform: 'uppercase', marginBottom: '0.5rem'
            }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{
                width: '100%', padding: '0.75rem 1rem',
                background: '#0d0d0d', border: '1px solid #2a2a2a',
                borderRadius: '2px', color: '#f0ece4',
                fontSize: '0.95rem', fontFamily: 'inherit',
                outline: 'none', boxSizing: 'border-box'
              }}
              onFocus={e => e.target.style.borderColor = '#555'}
              onBlur={e => e.target.style.borderColor = '#2a2a2a'}
            />
          </div>

          {error && (
            <p style={{ color: '#c0392b', fontSize: '0.82rem', marginBottom: '1rem', textAlign: 'center' }}>
              {error}
            </p>
          )}
          {message && (
            <p style={{ color: '#7aad7a', fontSize: '0.82rem', marginBottom: '1rem', textAlign: 'center' }}>
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '0.85rem',
              background: loading ? '#1a1a1a' : '#f0ece4',
              color: '#0a0a0a', border: 'none',
              borderRadius: '2px', fontSize: '0.8rem',
              letterSpacing: '0.2em', textTransform: 'uppercase',
              fontFamily: 'inherit', cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 600
            }}
          >
            {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.8rem', color: '#444', fontSize: '0.82rem' }}>
          {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
          <span
            onClick={() => { setIsSignUp(!isSignUp); setError(null); setMessage(null) }}
            style={{ color: '#888', cursor: 'pointer', textDecoration: 'underline' }}
          >
            {isSignUp ? 'Sign in' : 'Sign up'}
          </span>
        </p>

      </div>
    </div>
  )
}

// the above code is the login page
// the login only works through email and password