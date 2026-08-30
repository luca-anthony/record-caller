import { useState, useEffect, useRef } from 'react'
import { searchRecords } from '../lib/discogs'
import { supabase } from '../lib/supabase'
import Toast from '../components/Toast'
import useIsMobile from '../hooks/useIsMobile'

export default function Search({ session }) {
  const isMobile = useIsMobile()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [toasts, setToasts] = useState([])
  const [collection, setCollection] = useState({})
  const toastIdRef = useRef(0)

  useEffect(() => {
    const fetchCollection = async () => {
      const { data } = await supabase
        .from('collection')
        .select('discogs_id, status')
        .eq('user_id', session.user.id)

      if (data) {
        const map = {}
        data.forEach(row => { map[row.discogs_id] = row.status })
        setCollection(map)
      }
    }
    fetchCollection()
  }, [session])

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    const data = await searchRecords(query)
    setResults(data)
    setLoading(false)
  }

  const addToast = (album, type) => {
    toastIdRef.current += 1
    setToasts(prev => [...prev, { id: toastIdRef.current, album, type }])
  }

  const handleAction = async (record, action) => {
    const currentStatus = collection[record.id]

    if (currentStatus === action) {
      await supabase
        .from('collection')
        .delete()
        .eq('user_id', session.user.id)
        .eq('discogs_id', record.id)

      setCollection(prev => {
        const updated = { ...prev }
        delete updated[record.id]
        return updated
      })
      return
    }

    const { error } = await supabase.from('collection').upsert({
      user_id: session.user.id,
      discogs_id: record.id,
      title: record.title,
      year: record.year || null,
      cover_url: record.cover_image || null,
      label: record.label?.[0] || null,
      status: action,
    }, { onConflict: 'user_id,discogs_id' })

    if (!error) {
      setCollection(prev => ({ ...prev, [record.id]: action }))
      addToast(record.title, action)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      padding: isMobile ? '1.25rem 1rem' : '2rem',
      fontFamily: "'Georgia', serif",
      color: '#f0ece4',
      boxSizing: 'border-box'
    }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>

        <h1 style={{
          fontSize: isMobile ? '1.15rem' : '1.4rem', fontWeight: 400,
          letterSpacing: '0.15em', textTransform: 'uppercase',
          color: '#f0ece4', marginBottom: '0.3rem'
        }}>Search Records</h1>
        <p style={{ color: '#444', fontSize: '0.8rem', letterSpacing: '0.1em', marginBottom: isMobile ? '1.25rem' : '2rem' }}>
          Find a record — call it to want it, hang up once you have it.
        </p>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', marginBottom: isMobile ? '1.5rem' : '2.5rem' }}>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Album, label..."
            style={{
              flex: 1, padding: '0.75rem 1rem',
              background: '#111', border: '1px solid #2a2a2a',
              borderRadius: '2px', color: '#f0ece4',
              fontSize: '0.95rem', fontFamily: 'inherit', outline: 'none'
            }}
            onFocus={e => e.target.style.borderColor = '#555'}
            onBlur={e => e.target.style.borderColor = '#2a2a2a'}
          />
          <button
            type="submit"
            style={{
              padding: '0.75rem 1.5rem',
              background: '#f0ece4', color: '#0a0a0a',
              border: 'none', borderRadius: '2px',
              fontSize: '0.75rem', letterSpacing: '0.15em',
              textTransform: 'uppercase', fontFamily: 'inherit',
              cursor: 'pointer'
            }}
          >
            {loading ? '...' : 'Search'}
          </button>
        </form>

        {results.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(auto-fill, minmax(130px, 1fr))' : 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: isMobile ? '0.85rem' : '1.25rem'
          }}>
            {results.map(record => {
              const status = collection[record.id]
              return (
                <div key={record.id} style={{
                  background: '#111',
                  border: `1px solid ${status === 'called' ? '#2a3a2a' : status === 'hung_up' ? '#3a2a2a' : '#1e1e1e'}`,
                  borderRadius: '3px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'border-color 0.2s'
                }}>

                  <div style={{ width: '100%', aspectRatio: '1', background: '#1a1a1a', overflow: 'hidden' }}>
                    {record.cover_image ? (
                      <img
                        src={record.cover_image}
                        alt={record.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{
                        width: '100%', height: '100%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <div style={{
                          width: '60px', height: '60px', borderRadius: '50%',
                          border: '8px solid #2a2a2a',
                          boxShadow: 'inset 0 0 0 4px #1a1a1a'
                        }} />
                      </div>
                    )}
                  </div>

                  <div style={{ padding: '0.75rem', flex: 1 }}>
                    <p style={{
                      fontSize: '0.82rem', color: '#f0ece4',
                      margin: '0 0 0.3rem', fontWeight: 600,
                      lineHeight: 1.3,
                      overflow: 'hidden', display: '-webkit-box',
                      WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
                    }}>{record.title}</p>
                    {record.year && (
                      <p style={{ fontSize: '0.72rem', color: '#555', margin: '0 0 0.2rem' }}>{record.year}</p>
                    )}
                    {record.label?.[0] && (
                      <p style={{ fontSize: '0.72rem', color: '#555', margin: 0 }}>{record.label[0]}</p>
                    )}
                  </div>

                  <div style={{ display: 'flex', borderTop: '1px solid #1e1e1e' }}>
                    <button
                      onClick={() => handleAction(record, 'called')}
                      style={{
                        flex: 1, padding: '0.6rem',
                        background: status === 'called' ? '#1a2a1a' : 'transparent',
                        color: status === 'called' ? '#7aad7a' : '#555',
                        border: 'none', borderRight: '1px solid #1e1e1e',
                        fontSize: '0.7rem', letterSpacing: '0.1em',
                        textTransform: 'uppercase', fontFamily: 'inherit',
                        cursor: 'pointer', transition: 'all 0.2s'
                      }}
                    >
                      📞 {status === 'called' ? 'Calling...' : 'Call'}
                    </button>
                    <button
                      onClick={() => handleAction(record, 'hung_up')}
                      style={{
                        flex: 1, padding: '0.6rem',
                        background: status === 'hung_up' ? '#2a1a1a' : 'transparent',
                        color: status === 'hung_up' ? '#c0392b' : '#555',
                        border: 'none',
                        fontSize: '0.7rem', letterSpacing: '0.1em',
                        textTransform: 'uppercase', fontFamily: 'inherit',
                        cursor: 'pointer', transition: 'all 0.2s'
                      }}
                    >
                      📵 {status === 'hung_up' ? 'Blocked' : 'Block'}
                    </button>
                  </div>

                </div>
              )
            })}
          </div>
        )}

        {!loading && results.length === 0 && query && (
          <p style={{ color: '#333', textAlign: 'center', marginTop: '3rem', letterSpacing: '0.1em' }}>
            No records found.
          </p>
        )}

      </div>

      <Toast toasts={toasts} setToasts={setToasts} />
    </div>
  )
}