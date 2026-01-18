import { Navigate, Route, Routes, Link, useLocation, useNavigate } from 'react-router-dom'
import './App.css'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import TodosPage from './pages/TodosPage.jsx'

function getAuth() {
  const token = localStorage.getItem('auth_token') || ''
  const userRaw = localStorage.getItem('auth_user') || ''
  let user = null
  try {
    user = userRaw ? JSON.parse(userRaw) : null
  } catch {
    user = null
  }
  return { token, user }
}

function clearAuth() {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('auth_user')
}

function RequireAuth({ children }) {
  const { token } = getAuth()
  if (!token) return <Navigate to="/login" replace />
  return children
}

function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const auth = getAuth()
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register'

  return (
    <div className="appShell">
      <header className="topbar">
        <div className="brand">
          {isAuthPage ? (
            <div className="brandLink">To-Do</div>
          ) : (
            <Link to="/" className="brandLink">
              To-Do
            </Link>
          )}
        </div>
        {isAuthPage ? null : (
          <nav className="nav">
            <button
              type="button"
              className="navButton"
              onClick={() => {
                clearAuth()
                navigate('/login')
              }}
            >
              Logout
            </button>
          </nav>
        )}
      </header>

      <main className="content">
        <Routes>
          <Route
            path="/"
            element={
              <RequireAuth>
                <TodosPage initialUser={auth.user} />
              </RequireAuth>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
