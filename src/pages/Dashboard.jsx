import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import Toast from '../components/Toast'
import ConfirmModal from '../components/ConfirmModal'
import useIsMobile from '../hooks/useIsMobile'
import { groupByFormat } from '../lib/collectionUtils'

export default function Dashboard({ session }) {
  const isMobile = useIsMobile()
  const [collection, setCollection] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('called')
  const [toasts, setToasts] = useState([])
  const [modal, setModal] = useState(null)
  const toastIdRef = useRef(0)

  useEffect(() => {
    const fetchCollection = async () => {
      const { data } = await supabase
        .from('collection')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      if (data) setCollection(data)
      setLoading(false)
    }
    fetchCollection()
  }, [session])

  const addToast = (album, type) => {
    toastIdRef.current += 1
    setToasts(prev => [...prev, { id: toastIdRef.current, album, type }])
  }

  const showConfirm = (message, onConfirm) => {
    setModal({ message, onConfirm })
  }

  const handleAction = async (record, action) => {
    const currentStatus = record.status

    if (currentStatus === 'hung_up' && action === 'hung_up') {
      showConfirm(
        `Are you sure you want to get rid of "${record.title}"?`,
        () => removeRecord(record)
      )
      return
    }

    if (currentStatus === 'hung_up' && action === 'called') {
      showConfirm(
        `Are you sure you don't have "${record.title}" anymore?`,
        () => updateRecord(record, 'called')
      )
      return
    }

    if (currentStatus === action) {
      removeRecord(record)
      return
    }

    updateRecord(record, action)
  }

  const removeRecord = async (record) => {
    await supabase.from('collection').delete().eq('id', record.id)
    setCollection(prev => prev.filter(r => r.id !== record.id))
    setModal(null)
  }

  const updateRecord = async (record, action) => {
    const { error } = await supabase
      .from('collection')
      .update({ status: action })
      .eq('id', record.id)

    if (!error) {
      setCollection(prev =>
        prev.map(r => r.id === record.id ? { ...r, status: action } : r)
      )
      addToast(record.title, action)
    }
    setModal(null)
  }

  const called = collection.filter(r => r.status === 'called')
  const hungUp = collection.filter(r => r.status === 'hung_up')
  const displayed = tab === 'called' ? called : hungUp

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0a0a',
      padding: isMobile ? '1.25rem 1rem' : '2rem',
      fontFamily: "'Georgia', serif", color: '#f0ece4', boxSizing: 'border-box'
    }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>

        {/* Header with version */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: isMobile ? '1.25rem' : '2rem' }}>
          <div>
            <h1 style={{
              fontSize: isMobile ? '1.15rem' : '1.4rem', fontWeight: 400,
              letterSpacing: '0.15em', textTransform: 'uppercase',
              color: '#f0ece4', margin: '0 0 0.3rem'
            }}>Your Collection</h1>
            <p style={{ color: '#444', fontSize: '0.8rem', letterSpacing: '0.1em', margin: 0 }}>
              {called.length} calling · {hungUp.length} blocked
            </p>
          </div>
          <span style={{
            fontSize: '0.65rem', letterSpacing: '0.15em',
            color: '#2a2a2a', textTransform: 'uppercase',
            fontFamily: "'Georgia', serif", marginTop: '0.2rem'
          }}>v4.8.5</span>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: isMobile ? '1.25rem' : '2rem', borderBottom: '1px solid #1e1e1e', paddingBottom: '1rem' }}>
          {[
            { id: 'called', label: `📞 Calling (${called.length})` },
            { id: 'hung_up', label: `📵 Blocked (${hungUp.length})` }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: isMobile ? '0.5rem 0.9rem' : '0.5rem 1.2rem',
                background: tab === t.id ? '#1a1a1a' : 'transparent',
                border: tab === t.id ? '1px solid #2a2a2a' : '1px solid transparent',
                borderRadius: '2px', color: tab === t.id ? '#f0ece4' : '#555',
                fontSize: '0.75rem', letterSpacing: '0.1em',
                textTransform: 'uppercase', fontFamily: 'inherit',
                cursor: 'pointer', transition: 'all 0.15s'
              }}
            >{t.label}</button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <p style={{ color: '#333', letterSpacing: '0.1em' }}>Loading...</p>
        ) : displayed.length === 0 ? (
          <p style={{ color: '#333', letterSpacing: '0.1em', textAlign: 'center', marginTop: '4rem' }}>
            {tab === 'called' ? "Nothing calling yet." : "Nothing blocked yet."}
          </p>
        ) : (
          groupByFormat(displayed).map(({ format, records }) => (
            <div key={format} style={{ marginBottom: isMobile ? '1.75rem' : '2.5rem' }}>
              <h2 style={{
                fontSize: '0.75rem', fontWeight: 400,
                letterSpacing: '0.2em', textTransform: 'uppercase',
                color: '#555', margin: '0 0 0.9rem'
              }}>{format === 'CD' ? 'CDs' : format === 'Vinyl' ? 'Vinyl' : format === 'Cassette' ? 'Cassettes' : 'Other'} ({records.length})</h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? 'repeat(auto-fill, minmax(130px, 1fr))' : 'repeat(auto-fill, minmax(160px, 1fr))',
                gap: isMobile ? '0.85rem' : '1.25rem'
              }}>
                {records.map(record => (
                  <div key={record.id} style={{
                    background: '#111',
                    border: `1px solid ${record.status === 'called' ? '#2a3a2a' : '#3a2a2a'}`,
                    borderRadius: '3px', overflow: 'hidden',
                    display: 'flex', flexDirection: 'column'
                  }}>

                    <div style={{ width: '100%', aspectRatio: '1', background: '#1a1a1a', overflow: 'hidden' }}>
                      {record.cover_url ? (
                        <img src={record.cover_url} alt={record.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{
                            width: '50px', height: '50px', borderRadius: '50%',
                            border: '7px solid #2a2a2a',
                            boxShadow: 'inset 0 0 0 3px #1a1a1a'
                          }} />
                        </div>
                      )}
                    </div>

                    <div style={{ padding: '0.75rem', flex: 1 }}>
                      <p style={{
                        fontSize: '0.8rem', color: '#f0ece4',
                        margin: '0 0 0.1rem', fontWeight: 600, lineHeight: 1.3,
                        overflow: 'hidden', display: '-webkit-box',
                        WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
                      }}>{record.title}</p>
                      {record.artist && (
                        <p style={{
                          fontSize: '0.7rem', color: '#7a7a7a', margin: '0 0 0.25rem',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                        }}>{record.artist}</p>
                      )}
                      {record.year && <p style={{ fontSize: '0.7rem', color: '#555', margin: '0 0 0.15rem' }}>{record.year}</p>}
                      {record.label && <p style={{ fontSize: '0.7rem', color: '#555', margin: 0 }}>{record.label}</p>}
                    </div>

                    <div style={{ display: 'flex', borderTop: '1px solid #1e1e1e' }}>
                      <button
                        onClick={() => handleAction(record, 'called')}
                        style={{
                          flex: 1, padding: '0.6rem',
                          background: record.status === 'called' ? '#1a2a1a' : 'transparent',
                          color: record.status === 'called' ? '#7aad7a' : '#555',
                          border: 'none', borderRight: '1px solid #1e1e1e',
                          fontSize: '0.7rem', letterSpacing: '0.1em',
                          textTransform: 'uppercase', fontFamily: 'inherit',
                          cursor: 'pointer', transition: 'all 0.2s'
                        }}
                      >
                        📞 {record.status === 'called' ? 'Calling...' : 'Call'}
                      </button>
                      <button
                        onClick={() => handleAction(record, 'hung_up')}
                        style={{
                          flex: 1, padding: '0.6rem',
                          background: record.status === 'hung_up' ? '#2a1a1a' : 'transparent',
                          color: record.status === 'hung_up' ? '#c0392b' : '#555',
                          border: 'none',
                          fontSize: '0.7rem', letterSpacing: '0.1em',
                          textTransform: 'uppercase', fontFamily: 'inherit',
                          cursor: 'pointer', transition: 'all 0.2s'
                        }}
                      >
                        📵 {record.status === 'hung_up' ? 'Blocked' : 'Hang Up and Block'}
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          ))
        )}

      </div>

      <Toast toasts={toasts} setToasts={setToasts} />

      {modal && (
        <ConfirmModal
          message={modal.message}
          onConfirm={modal.onConfirm}
          onCancel={() => setModal(null)}
        />
      )}
    </div>
  )
}