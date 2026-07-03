import { useEffect, useState } from 'react'
import './App.css'

type LoginState = {
  username: string
  password: string
}

type AppMode = 'personal' | 'business'
type PersonalSection = 'home' | 'vessel' | 'identity'
type BusinessPanel = 'overview' | 'agents' | 'review'

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
  const [appMode, setAppMode] = useState<AppMode>('personal')
  const [personalSection, setPersonalSection] = useState<PersonalSection>('home')
  const [businessPanel, setBusinessPanel] = useState<BusinessPanel>('overview')
  const [commandValue, setCommandValue] = useState('')
  const [commandResponse, setCommandResponse] = useState('Minimal routed shell test. No live data or heavy visual systems yet.')
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

  function submitCommand(event: React.FormEvent) {
    event.preventDefault()
    const trimmed = commandValue.trim()
    if (!trimmed) return
    if (trimmed.toLowerCase().includes('review')) {
      setAppMode('business')
      setBusinessPanel('review')
      setCommandResponse('Routed to Business Command review panel in minimal shell test.')
    } else if (trimmed.toLowerCase().includes('agent')) {
      setAppMode('business')
      setBusinessPanel('agents')
      setCommandResponse('Routed to Business Command agents panel in minimal shell test.')
    } else if (trimmed.toLowerCase().includes('vessel')) {
      setAppMode('personal')
      setPersonalSection('vessel')
      setCommandResponse('Routed to Vessel section in minimal shell test.')
    } else if (trimmed.toLowerCase().includes('identity')) {
      setAppMode('personal')
      setPersonalSection('identity')
      setCommandResponse('Routed to Identity section in minimal shell test.')
    } else {
      setCommandResponse(`Accepted command: ${trimmed}`)
    }
    setCommandValue('')
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
          <p className="login-copy">Login plus routed shell test. Still no live data, no 3D, no motion, and no feature loaders.</p>
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
            {loginError ? <span className="login-error">{loginError}</span> : <span>Minimal routed shell test build.</span>}
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="control-shell">
      <header className="top-shell-bar">
        <div>
          <div className="shell-mark">Private Control Center</div>
          <div className="shell-submark">Routed shell isolation build, still without heavy feature layers</div>
        </div>
        <div className="shell-actions">
          <button className={appMode === 'personal' ? 'shell-toggle active' : 'shell-toggle'} onClick={() => setAppMode('personal')}>Personal</button>
          <button className={appMode === 'business' ? 'shell-toggle active' : 'shell-toggle'} onClick={() => setAppMode('business')}>Business</button>
          <button className="logout-btn" onClick={logout}>Lock</button>
        </div>
      </header>

      <section className="daily-focus-strip">
        <div><span>Mode</span><strong>{appMode}</strong></div>
        <div><span>Personal</span><strong>{personalSection}</strong></div>
        <div><span>Business</span><strong>{businessPanel}</strong></div>
        <div><span>Status</span><strong>Routed shell</strong></div>
      </section>

      <main className="section-page personal-section-page">
        <section className="section-hero">
          <div>
            <div className="section-eyebrow">Isolation Step</div>
            <h1>Minimal Routed Post-Login Shell</h1>
            <p>This adds basic mode switching, command routing, and richer section rendering, while still excluding live data, Canvas, Phaser, motion, and heavier app trees.</p>
          </div>
        </section>

        <form className="detail-panel" onSubmit={submitCommand}>
          <h2>Command Test</h2>
          <p className="login-copy">Try commands like “review”, “agent”, “vessel”, or “identity”.</p>
          <div className="command-input-wrap">
            <input value={commandValue} onChange={(e) => setCommandValue(e.target.value)} placeholder="Type a simple routing command..." />
            <button type="submit">Send</button>
          </div>
          <div className="command-response-box">{commandResponse}</div>
        </form>

        {appMode === 'personal' ? (
          <>
            <section className="summary-grid">
              <article className="summary-card">
                <span>Current personal section</span>
                <strong>{personalSection}</strong>
                <p>Static section routing is working inside the richer shell.</p>
              </article>
              <article className="summary-card">
                <span>Visual systems</span>
                <strong>Disabled</strong>
                <p>No Canvas, Phaser, or animated visual surfaces are mounted.</p>
              </article>
              <article className="summary-card">
                <span>Live data</span>
                <strong>Disabled</strong>
                <p>Personal projections are still bypassed in this step.</p>
              </article>
            </section>

            {personalSection !== 'home' ? (
              <section className="detail-panels">
                <article className="detail-panel">
                  <h2>{personalSection === 'vessel' ? 'Vessel' : 'Identity'} page</h2>
                  <p>{personalSection === 'vessel' ? 'Body, consistency, and health operating layer placeholder.' : 'Mission, values, and decision-layer placeholder.'}</p>
                  <ul>
                    <li>Static content only</li>
                    <li>No projections yet</li>
                    <li>No heavy runtime dependencies</li>
                  </ul>
                </article>
                <article className="detail-panel">
                  <h2>Why this matters</h2>
                  <p>This checks whether richer conditional page rendering breaks the shell before we reintroduce real data or animation systems.</p>
                </article>
              </section>
            ) : null}
          </>
        ) : (
          <section className="detail-panels">
            <article className="detail-panel">
              <h2>Business Command Shell</h2>
              <p>Business mode is rendering, but still without live Supabase data, review queues, or visual constellations.</p>
              <ul>
                <li>Current panel: {businessPanel}</li>
                <li>Review panel routing still works</li>
                <li>No business loaders active yet</li>
              </ul>
            </article>
            <article className="detail-panel">
              <h2>What this tests</h2>
              <p>This reintroduces a slightly richer multi-view shell without the larger data/runtime stack.</p>
            </article>
          </section>
        )}
      </main>
    </div>
  )
}

export default App
