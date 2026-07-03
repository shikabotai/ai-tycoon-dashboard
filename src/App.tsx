import { useEffect, useState } from 'react'
import './App.css'

type LoginState = {
  username: string
  password: string
}

const VALID_USERNAME = 'mthanath64'
const VALID_PASSWORD = 'Mitch2002'
const MAX_LOGIN_ATTEMPTS = 10
const LOCKOUT_MS = 10 * 60 * 1000
const SESSION_KEY = 'control-center-auth'
const LOGIN_STATE_KEY = 'control-center-login-state'

function loadStoredLoginState() {
  if (typeof window === 'undefined') return { attempts: 0, lockoutUntil: 0 }
  try {
    const raw = window.localStorage.getItem(LOGIN_STATE_KEY)
    if (!raw) return { attempts: 0, lockoutUntil: 0 }
    const parsed = JSON.parse(raw) as { attempts?: number; lockoutUntil?: number }
    return {
      attempts: typeof parsed.attempts === 'number' ? parsed.attempts : 0,
      lockoutUntil: typeof parsed.lockoutUntil === 'number' ? parsed.lockoutUntil : 0,
    }
  } catch {
    return { attempts: 0, lockoutUntil: 0 }
  }
}

function storeLoginState(state: { attempts: number; lockoutUntil: number }) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(LOGIN_STATE_KEY, JSON.stringify(state))
}

function App() {
  const [authReady, setAuthReady] = useState(false)
  const [authed, setAuthed] = useState(false)
  const [login, setLogin] = useState<LoginState>({ username: '', password: '' })
  const [loginError, setLoginError] = useState<string | null>(null)
  const [attempts, setAttempts] = useState(0)
  const [lockoutUntil, setLockoutUntil] = useState(0)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (typeof window === 'undefined') return
    const session = window.localStorage.getItem(SESSION_KEY)
    setAuthed(session === 'true')
    const stored = loadStoredLoginState()
    setAttempts(stored.attempts)
    setLockoutUntil(stored.lockoutUntil)
    setAuthReady(true)
  }, [])

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const lockedOut = lockoutUntil > now
  const lockoutSeconds = lockedOut ? Math.max(1, Math.ceil((lockoutUntil - now) / 1000)) : 0

  function handleLoginSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (lockedOut) {
      setLoginError(`Too many attempts. Try again in ${lockoutSeconds}s.`)
      return
    }

    if (login.username === VALID_USERNAME && login.password === VALID_PASSWORD) {
      setAuthed(true)
      setLoginError(null)
      setAttempts(0)
      setLockoutUntil(0)
      storeLoginState({ attempts: 0, lockoutUntil: 0 })
      window.localStorage.setItem(SESSION_KEY, 'true')
      return
    }

    const nextAttempts = attempts + 1
    const nextLockout = nextAttempts >= MAX_LOGIN_ATTEMPTS ? Date.now() + LOCKOUT_MS : 0
    setAttempts(nextAttempts)
    setLockoutUntil(nextLockout)
    storeLoginState({ attempts: nextAttempts, lockoutUntil: nextLockout })
    setLoginError(nextLockout ? 'Too many failed attempts. Temporary lockout enabled.' : `Incorrect login. ${Math.max(0, MAX_LOGIN_ATTEMPTS - nextAttempts)} tries left.`)
  }

  function logout() {
    setAuthed(false)
    window.localStorage.removeItem(SESSION_KEY)
  }

  if (!authReady) {
    return (
      <div className="login-shell minimal-shell">
        <div className="login-card minimal-card">
          <div className="login-eyebrow">Private Control Center</div>
          <h1>Loading Access Gate</h1>
          <p className="login-copy">Checking local session state before rendering the control center.</p>
        </div>
      </div>
    )
  }

  if (!authed) {
    return (
      <div className="login-shell minimal-shell">
        <div className="login-orb" />
        <form className="login-card minimal-card" onSubmit={handleLoginSubmit}>
          <div className="login-eyebrow">Private Control Center</div>
          <h1>Enter Command Access</h1>
          <p className="login-copy">Isolated login-only test. No business data, no 3D, no motion, no extra runtime layers.</p>
          <label>
            <span>Username</span>
            <input value={login.username} onChange={(e) => setLogin((prev) => ({ ...prev, username: e.target.value }))} autoComplete="username" />
          </label>
          <label>
            <span>Password</span>
            <input type="password" value={login.password} onChange={(e) => setLogin((prev) => ({ ...prev, password: e.target.value }))} autoComplete="current-password" />
          </label>
          <button type="submit" disabled={lockedOut}>{lockedOut ? `Locked · ${lockoutSeconds}s` : 'Enter'}</button>
          <div className="login-meta">
            <span>Attempts used: {attempts}/{MAX_LOGIN_ATTEMPTS}</span>
            {loginError ? <span className="login-error">{loginError}</span> : <span>Plain login-gate isolation build.</span>}
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="login-shell minimal-shell">
      <div className="login-card minimal-card">
        <div className="login-eyebrow">Private Control Center</div>
        <h1>Login Worked</h1>
        <p className="login-copy">The isolated auth gate succeeded. That means the crash is in the layers that come after login, not the login page itself.</p>
        <button onClick={logout}>Lock</button>
      </div>
    </div>
  )
}

export default App
