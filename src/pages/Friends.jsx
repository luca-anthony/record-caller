import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import useIsMobile from '../hooks/useIsMobile'

export default function Friends({ session }) {
  const isMobile = useIsMobile()
  const [tab, setTab] = useState('friends')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [friends, setFriends] = useState([])
  const [pending, setPending] = useState([])
  const [incoming, setIncoming] = useState([])
  const [selectedFriend, setSelectedFriend] = useState(null)
  const [friendCollection, setFriendCollection] = useState([])
  const [friendTab, setFriendTab] = useState('called')
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)

  const fetchFriends = async () => {
    setLoading(true)

    const { data } = await supabase
      .from('friends')
      .select('*')
      .or(`requester_id.eq.${session.user.id},receiver_id.eq.${session.user.id}`)

    if (data) {
      const accepted = data.filter(f => f.status === 'accepted')
      const pendingOut = data.filter(f => f.status === 'pending' && f.requester_id === session.user.id)
      const pendingIn = data.filter(f => f.status === 'pending' && f.receiver_id === session.user.id)

      // Fetch profiles for accepted friends
      const friendIds = accepted.map(f =>
        f.requester_id === session.user.id ? f.receiver_id : f.requester_id
      )
      const pendingOutIds = pendingOut.map(f => f.receiver_id)
      const pendingInIds = pendingIn.map(f => f.requester_id)

      const allIds = [...new Set([...friendIds, ...pendingOutIds, ...pendingInIds])]

      if (allIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .in('id', allIds)

        const profileMap = {}
        profiles?.forEach(p => { profileMap[p.id] = p })

        setFriends(accepted.map(f => ({
          ...f,
          profile: profileMap[f.requester_id === session.user.id ? f.receiver_id : f.requester_id]
        })))
        setPending(pendingOut.map(f => ({ ...f, profile: profileMap[f.receiver_id] })))
        setIncoming(pendingIn.map(f => ({ ...f, profile: profileMap[f.requester_id] })))
      } else {
        setFriends([])
        setPending([])
        setIncoming([])
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchFriends()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    setSearching(true)

    const { data } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .or(`username.ilike.%${searchQuery}%`)
      .neq('id', session.user.id)
      .limit(10)

    setSearchResults(data || [])
    setSearching(false)
  }

  const sendRequest = async (receiverId) => {
    await supabase.from('friends').insert({
      requester_id: session.user.id,
      receiver_id: receiverId,
      status: 'pending'
    })
    fetchFriends()
    setSearchResults([])
    setSearchQuery('')
  }

  const acceptRequest = async (friendRow) => {
    await supabase.from('friends').update({ status: 'accepted' }).eq('id', friendRow.id)
    fetchFriends()
  }

  const declineRequest = async (friendRow) => {
    await supabase.from('friends').delete().eq('id', friendRow.id)
    fetchFriends()
  }

  const removeFriend = async (friendRow) => {
    await supabase.from('friends').delete().eq('id', friendRow.id)
    setSelectedFriend(null)
    fetchFriends()
  }

  const viewFriend = async (friendData) => {
    setSelectedFriend(friendData)
    setFriendTab('called')

    const { data } = await supabase
      .from('collection')
      .select('*')
      .eq('user_id', friendData.profile.id)
      .order('created_at', { ascending: false })

    setFriendCollection(data || [])
  }

  const getRelationship = (profileId) => {
    if (friends.find(f => f.profile?.id === profileId)) return 'friends'
    if (pending.find(f => f.profile?.id === profileId)) return 'pending'
    if (incoming.find(f => f.profile?.id === profileId)) return 'incoming'
    return 'none'
  }

  const Avatar = ({ url, username, size = 40 }) => (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: '#1a1a1a', border: '1px solid #2a2a2a',
      overflow: 'hidden', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      {url ? (
        <img src={url} alt={username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <span style={{ color: '#444', fontSize: size * 0.35, fontFamily: "'Georgia', serif" }}>
          {username?.[0]?.toUpperCase() || '?'}
        </span>
      )}
    </div>
  )

  // Friend profile view
  if (selectedFriend) {
    const called = friendCollection.filter(r => r.status === 'called')
    const hungUp = friendCollection.filter(r => r.status === 'hung_up')
    const displayed = friendTab === 'called' ? called : hungUp

    return (
      <div style={{
        minHeight: '100vh', background: '#0a0a0a',
        padding: isMobile ? '1.25rem 1rem' : '2rem', fontFamily: "'Georgia', serif", color: '#f0ece4',
        boxSizing: 'border-box'
      }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>

          {/* Back button */}
          <button
            onClick={() => setSelectedFriend(null)}
            style={{
              background: 'transparent', border: 'none',
              color: '#555', fontSize: '0.8rem', letterSpacing: '0.1em',
              textTransform: 'uppercase', fontFamily: 'inherit',
              cursor: 'pointer', marginBottom: isMobile ? '1.25rem' : '2rem', padding: 0
            }}
          >← Back to Friends</button>

          {/* Friend header */}
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: isMobile ? '1.5rem' : '2.5rem' }}>
            <Avatar url={selectedFriend.profile?.avatar_url} username={selectedFriend.profile?.username} size={isMobile ? 52 : 64} />
            <div style={{ minWidth: 0 }}>
              <h1 style={{
                fontSize: isMobile ? '1.1rem' : '1.4rem', fontWeight: 400,
                letterSpacing: '0.15em', textTransform: 'uppercase',
                margin: '0 0 0.25rem',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
              }}>{selectedFriend.profile?.username || 'Unknown'}</h1>
              <p style={{ color: '#444', fontSize: '0.8rem', margin: 0 }}>
                {called.length} calling · {hungUp.length} blocked
              </p>
            </div>
            <button
              onClick={() => removeFriend(selectedFriend)}
              style={{
                marginLeft: isMobile ? 0 : 'auto', padding: '0.5rem 1rem',
                background: 'transparent', border: '1px solid #3a2a2a',
                borderRadius: '2px', color: '#c0392b',
                fontSize: '0.7rem', letterSpacing: '0.1em',
                textTransform: 'uppercase', fontFamily: 'inherit', cursor: 'pointer'
              }}
            >Remove Friend</button>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: isMobile ? '1.25rem' : '2rem', borderBottom: '1px solid #1e1e1e', paddingBottom: '1rem' }}>
            {[
              { id: 'called', label: `📞 Calling (${called.length})` },
              { id: 'hung_up', label: `📵 Blocked (${hungUp.length})` }
            ].map(t => (
              <button key={t.id} onClick={() => setFriendTab(t.id)} style={{
                padding: '0.5rem 1.2rem',
                background: friendTab === t.id ? '#1a1a1a' : 'transparent',
                border: friendTab === t.id ? '1px solid #2a2a2a' : '1px solid transparent',
                borderRadius: '2px', color: friendTab === t.id ? '#f0ece4' : '#555',
                fontSize: '0.75rem', letterSpacing: '0.1em',
                textTransform: 'uppercase', fontFamily: 'inherit', cursor: 'pointer'
              }}>{t.label}</button>
            ))}
          </div>

          {/* Collection grid */}
          {displayed.length === 0 ? (
            <p style={{ color: '#333', textAlign: 'center', marginTop: '4rem', letterSpacing: '0.1em' }}>
              Nothing here yet.
            </p>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(auto-fill, minmax(130px, 1fr))' : 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: isMobile ? '0.85rem' : '1.25rem'
            }}>
              {displayed.map(record => (
                <div key={record.id} style={{
                  background: '#111',
                  border: `1px solid ${record.status === 'called' ? '#2a3a2a' : '#3a2a2a'}`,
                  borderRadius: '3px', overflow: 'hidden'
                }}>
                  <div style={{ width: '100%', aspectRatio: '1', background: '#1a1a1a', overflow: 'hidden' }}>
                    {record.cover_url ? (
                      <img src={record.cover_url} alt={record.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{
                          width: '50px', height: '50px', borderRadius: '50%',
                          border: '7px solid #2a2a2a', boxShadow: 'inset 0 0 0 3px #1a1a1a'
                        }} />
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '0.75rem' }}>
                    <p style={{
                      fontSize: '0.8rem', color: '#f0ece4',
                      margin: '0 0 0.25rem', fontWeight: 600, lineHeight: 1.3,
                      overflow: 'hidden', display: '-webkit-box',
                      WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
                    }}>{record.title}</p>
                    {record.year && <p style={{ fontSize: '0.7rem', color: '#555', margin: '0 0 0.15rem' }}>{record.year}</p>}
                    {record.label && <p style={{ fontSize: '0.7rem', color: '#555', margin: 0 }}>{record.label}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0a0a',
      padding: isMobile ? '1.25rem 1rem' : '2rem', fontFamily: "'Georgia', serif", color: '#f0ece4',
      boxSizing: 'border-box'
    }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>

        <h1 style={{
          fontSize: isMobile ? '1.15rem' : '1.4rem', fontWeight: 400,
          letterSpacing: '0.15em', textTransform: 'uppercase',
          marginBottom: '0.3rem'
        }}>Friends</h1>
        <p style={{ color: '#444', fontSize: '0.8rem', letterSpacing: '0.1em', marginBottom: isMobile ? '1.25rem' : '2rem' }}>
          {friends.length} friends · {incoming.length} pending
        </p>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: isMobile ? '1.25rem' : '2rem', borderBottom: '1px solid #1e1e1e', paddingBottom: '1rem' }}>
          {[
            { id: 'friends', label: `Friends (${friends.length})` },
            { id: 'search', label: 'Find People' },
            { id: 'incoming', label: `Requests (${incoming.length})` },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: isMobile ? '0.5rem 0.8rem' : '0.5rem 1.2rem',
              background: tab === t.id ? '#1a1a1a' : 'transparent',
              border: tab === t.id ? '1px solid #2a2a2a' : '1px solid transparent',
              borderRadius: '2px', color: tab === t.id ? '#f0ece4' : '#555',
              fontSize: '0.75rem', letterSpacing: '0.1em',
              textTransform: 'uppercase', fontFamily: 'inherit', cursor: 'pointer'
            }}>{t.label}</button>
          ))}
        </div>

        {/* Friends list */}
        {tab === 'friends' && (
          loading ? (
            <p style={{ color: '#333', letterSpacing: '0.1em' }}>Loading...</p>
          ) : friends.length === 0 ? (
            <p style={{ color: '#333', textAlign: 'center', marginTop: '4rem', letterSpacing: '0.1em' }}>
              No friends yet — find some in the Find People tab.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {friends.map(f => (
                <div key={f.id} style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  background: '#111', border: '1px solid #1e1e1e',
                  borderRadius: '3px', padding: '0.85rem 1rem'
                }}>
                  <Avatar url={f.profile?.avatar_url} username={f.profile?.username} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#f0ece4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {f.profile?.username || 'Unknown'}
                    </p>
                  </div>
                  <button
                    onClick={() => viewFriend(f)}
                    style={{
                      flexShrink: 0,
                      padding: isMobile ? '0.45rem 0.7rem' : '0.45rem 1rem',
                      background: 'transparent', border: '1px solid #2a2a2a',
                      borderRadius: '2px', color: '#888',
                      fontSize: '0.7rem', letterSpacing: '0.1em',
                      textTransform: 'uppercase', fontFamily: 'inherit', cursor: 'pointer'
                    }}
                  >{isMobile ? 'View' : 'View Collection'}</button>
                </div>
              ))}
            </div>
          )
        )}

        {/* Search */}
        {tab === 'search' && (
          <div>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.5rem' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by username or email..."
                style={{
                  flex: 1, padding: '0.75rem 1rem',
                  background: '#111', border: '1px solid #2a2a2a',
                  borderRadius: '2px', color: '#f0ece4',
                  fontSize: '0.95rem', fontFamily: 'inherit', outline: 'none'
                }}
                onFocus={e => e.target.style.borderColor = '#555'}
                onBlur={e => e.target.style.borderColor = '#2a2a2a'}
              />
              <button type="submit" style={{
                padding: '0.75rem 1.5rem',
                background: '#f0ece4', color: '#0a0a0a',
                border: 'none', borderRadius: '2px',
                fontSize: '0.75rem', letterSpacing: '0.15em',
                textTransform: 'uppercase', fontFamily: 'inherit', cursor: 'pointer'
              }}>
                {searching ? '...' : 'Search'}
              </button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {searchResults.map(profile => {
                const rel = getRelationship(profile.id)
                return (
                  <div key={profile.id} style={{
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    background: '#111', border: '1px solid #1e1e1e',
                    borderRadius: '3px', padding: '0.85rem 1rem'
                  }}>
                    <Avatar url={profile.avatar_url} username={profile.username} />
                    <p style={{ flex: 1, minWidth: 0, margin: 0, fontSize: '0.9rem', color: '#f0ece4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {profile.username || 'No username set'}
                    </p>
                    {rel === 'none' && (
                      <button
                        onClick={() => sendRequest(profile.id)}
                        style={{
                          flexShrink: 0,
                          padding: isMobile ? '0.45rem 0.7rem' : '0.45rem 1rem',
                          background: '#f0ece4', color: '#0a0a0a',
                          border: 'none', borderRadius: '2px',
                          fontSize: '0.7rem', letterSpacing: '0.1em',
                          textTransform: 'uppercase', fontFamily: 'inherit', cursor: 'pointer'
                        }}
                      >Add Friend</button>
                    )}
                    {rel === 'pending' && (
                      <span style={{ color: '#555', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        Requested
                      </span>
                    )}
                    {rel === 'friends' && (
                      <span style={{ color: '#7aad7a', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        Friends ✓
                      </span>
                    )}
                    {rel === 'incoming' && (
                      <span style={{ color: '#888', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        Sent you a request
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Incoming requests */}
        {tab === 'incoming' && (
          incoming.length === 0 ? (
            <p style={{ color: '#333', textAlign: 'center', marginTop: '4rem', letterSpacing: '0.1em' }}>
              No pending requests.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {incoming.map(f => (
                <div key={f.id} style={{
                  display: 'flex', alignItems: 'center', flexWrap: isMobile ? 'wrap' : 'nowrap', gap: '0.75rem',
                  background: '#111', border: '1px solid #1e1e1e',
                  borderRadius: '3px', padding: '0.85rem 1rem'
                }}>
                  <Avatar url={f.profile?.avatar_url} username={f.profile?.username} />
                  <p style={{ flex: 1, minWidth: isMobile ? '100%' : 0, margin: 0, fontSize: '0.9rem', color: '#f0ece4' }}>
                    {f.profile?.username || 'Unknown'} wants to be friends
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem', marginLeft: isMobile ? '52px' : 0 }}>
                    <button
                      onClick={() => acceptRequest(f)}
                      style={{
                        padding: '0.45rem 1rem',
                        background: '#f0ece4', color: '#0a0a0a',
                        border: 'none', borderRadius: '2px',
                        fontSize: '0.7rem', letterSpacing: '0.1em',
                        textTransform: 'uppercase', fontFamily: 'inherit', cursor: 'pointer'
                      }}
                    >Accept</button>
                    <button
                      onClick={() => declineRequest(f)}
                      style={{
                        padding: '0.45rem 1rem',
                        background: 'transparent', border: '1px solid #3a2a2a',
                        borderRadius: '2px', color: '#c0392b',
                        fontSize: '0.7rem', letterSpacing: '0.1em',
                        textTransform: 'uppercase', fontFamily: 'inherit', cursor: 'pointer'
                      }}
                    >Decline</button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

      </div>
    </div>
  )
}