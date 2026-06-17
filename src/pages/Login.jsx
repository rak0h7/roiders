import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Button from '../components/ui/Button'
import { isSupabaseConfigured } from '../lib/supabase'

export default function Login() {
  const { session, signIn, resetPassword } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  if (session) return <Navigate to="/" replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: err } = await signIn(email, password)
    setLoading(false)
    if (err) {
      setError(err.message)
      return
    }
    navigate('/')
  }

  const handleReset = async () => {
    if (!email) {
      setError('Enter your email to reset password')
      return
    }
    const { error: err } = await resetPassword(email)
    if (err) setError(err.message)
    else setResetSent(true)
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-10 h-10 bg-accent rounded-sm flex items-center justify-center font-display font-bold text-white">RC</div>
          <h1 className="font-display text-2xl font-bold">ROIDERS.CLUB</h1>
        </div>

        {!isSupabaseConfigured && (
          <div className="mb-4 p-3 bg-warning/10 border border-warning/30 rounded-md text-sm text-warning">
            Supabase not configured. Copy <code className="font-mono">.env.example</code> to <code className="font-mono">.env.local</code> and add your project credentials.
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-md p-6 space-y-4">
          <h2 className="font-display text-lg font-semibold">Sign in</h2>

          {error && <p className="text-sm text-danger">{error}</p>}
          {resetSent && <p className="text-sm text-success">Password reset email sent.</p>}

          <div>
            <label className="block text-xs text-text-secondary mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-bg border border-border rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-accent"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-bg border border-border rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-accent"
              required
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>

          <button type="button" onClick={handleReset} className="text-xs text-text-secondary hover:text-accent w-full text-center">
            Forgot password?
          </button>
        </form>

        <p className="text-center text-sm text-text-secondary mt-4">
          No account? <Link to="/signup" className="text-accent hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  )
}