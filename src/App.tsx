import './App.css'

function App() {
  return (
    <div className="login-shell minimal-shell">
      <div className="login-orb" />
      <form className="login-card minimal-card" onSubmit={(e) => e.preventDefault()}>
        <div className="login-eyebrow">Private Control Center</div>
        <h1>Static Boot Isolation</h1>
        <p className="login-copy">This is a stripped-down stability test with no business data, no 3D scene, no motion layer, no auth logic, and no runtime loaders.</p>
        <label>
          <span>Username</span>
          <input value="mthanath64" readOnly />
        </label>
        <label>
          <span>Password</span>
          <input type="password" value="Mitch2002" readOnly />
        </label>
        <button type="submit">Static Test Button</button>
        <div className="login-meta">
          <span>If this page still disappears, the problem is lower-level than the new control-center logic.</span>
        </div>
      </form>
    </div>
  )
}

export default App
