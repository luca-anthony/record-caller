import { useState, useEffect } from 'react'

// Matches when the viewport is phone-sized. Anything above this keeps the
// existing sidebar/desktop layout untouched.
const BREAKPOINT = 768

export default function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= BREAKPOINT : false
  )

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${BREAKPOINT}px)`)
    const handler = (e) => setIsMobile(e.matches)

    // The initial value from useState already reflects the viewport at
    // mount time; this subscription only needs to catch future resizes.
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  return isMobile
}
