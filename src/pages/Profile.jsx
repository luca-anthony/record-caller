import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import useIsMobile from '../hooks/useIsMobile'

export default function Profile({ session, onSignOut }) {
  const isMobile = useIsMobile()
  const [username, setUsername] = useState('')
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', session.user.id)
        .single()

      if (data) {
        setUsername(data.username || '')
        setAvatarUrl(data.avatar_url || null)
      }
      setLoading(false)
    }
    fetchProfile()
  }, [session])

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)

    const { error } = await supabase.from('profiles').upsert({
      id: session.user.id,
      username,
      avatar_url: avatarUrl,
    })

    if (error) setMessage({ type: 'error', text: error.message })
    else setMessage({ type: 'success', text: 'Profile saved!' })
    setSaving(false)
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)

    const fileExt = file.name.split('.').pop()
    const filePath = `${session.user.id}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true })

    if (!uploadError) {
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
      setAvatarUrl(data.publicUrl)
    }
    setUploading(false)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#333', fontFamily: "'Georgia', serif", letterSpacing: '0.1em' }}>Loading...</p>
    </div>
  )

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0a0a',
      padding: isMobile ? '1.25rem 1rem' : '2rem', fontFamily: "'Georgia', serif", color: '#f0ece4',
      boxSizing: 'border-box'
    }}>
      <div style={{ maxWidth: '500px', margin: '0 auto' }}>

        {/* Header with sign out */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap', marginBottom: isMobile ? '1.5rem' : '2.5rem' }}>
          <div>
            <h1 style={{
              fontSize: isMobile ? '1.15rem' : '1.4rem', fontWeight: 400,
              letterSpacing: '0.15em', textTransform: 'uppercase',
              margin: '0 0 0.3rem'
            }}>Your Profile</h1>
            <p style={{ color: '#444', fontSize: '0.8rem', letterSpacing: '0.1em', margin: 0 }}>
              {session.user.email}
            </p>
          </div>
          <button
            onClick={onSignOut}
            style={{
              padding: '0.5rem 1rem',
              background: 'transparent', border: '1px solid #3a2a2a',
              borderRadius: '2px', color: '#c0392b',
              fontSize: '0.7rem', letterSpacing: '0.1em',
              textTransform: 'uppercase', fontFamily: 'inherit', cursor: 'pointer'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#1a0a0a'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >← Sign Out</button>
        </div>

        {/* Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: '#1a1a1a', border: '1px solid #2a2a2a',
            overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0
          }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt="avatar"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%',
                border: '5px solid #2a2a2a',
                boxShadow: 'inset 0 0 0 3px #111'
              }} />
            )}
          </div>
          <div>
            <label style={{
              display: 'inline-block', padding: '0.5rem 1rem',
              background: 'transparent', border: '1px solid #2a2a2a',
              borderRadius: '2px', color: '#888',
              fontSize: '0.72rem', letterSpacing: '0.15em',
              textTransform: 'uppercase', cursor: 'pointer'
            }}>
              {uploading ? 'Uploading...' : 'Upload Photo'}
              <input type="file" accept="image/*" onChange={handleAvatarUpload}
                style={{ display: 'none' }} />
            </label>
            <p style={{ color: '#333', fontSize: '0.7rem', marginTop: '0.5rem' }}>JPG, PNG or GIF</p>
          </div>
        </div>

        {/* Username */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block', color: '#666',
            fontSize: '0.72rem', letterSpacing: '0.15em',
            textTransform: 'uppercase', marginBottom: '0.5rem'
          }}>Username</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="your_username"
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

        {message && (
          <p style={{
            color: message.type === 'success' ? '#7aad7a' : '#c0392b',
            fontSize: '0.82rem', marginBottom: '1rem'
          }}>{message.text}</p>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width: '100%', padding: '0.85rem',
            background: saving ? '#1a1a1a' : '#f0ece4',
            color: '#0a0a0a', border: 'none',
            borderRadius: '2px', fontSize: '0.8rem',
            letterSpacing: '0.2em', textTransform: 'uppercase',
            fontFamily: 'inherit', cursor: saving ? 'not-allowed' : 'pointer'
          }}
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </div>
  )
}