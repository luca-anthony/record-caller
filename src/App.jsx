import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import Search from './pages/Search'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Navbar from './components/Navbar'
import Friends from './pages/Friends'
import useIsMobile from './hooks/useIsMobile'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState('dashboard')
  const isMobile = useIsMobile()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) return null
  if (!session) return <Login />

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0a' }}>
      <Navbar page={page} setPage={setPage} />
      <div style={{
        marginLeft: isMobile ? 0 : '200px',
        paddingBottom: isMobile ? '64px' : 0,
        flex: 1,
        minWidth: 0,
      }}>
        {page === 'dashboard' && <Dashboard session={session} />}
        {page === 'search' && <Search session={session} />}
        {page === 'profile' && <Profile session={session} onSignOut={() => supabase.auth.signOut()} />}
        {page === 'friends' && <Friends session={session} />}
      </div>
    </div>
  )
}