import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Button from '../components/ui/Button'

export default function Signup() {
  const { session, signUp } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmEmail, setConfirmEmail] = useState(false)

  if (session) return <Navigate to="/" replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { data, error: err } = await signUp(email, password)
    setLoading(false)
    if (err) {
      setError(err.message)
      return
    }
    if (data?.session) {
      navigate('/')
    } else {
      setConfirmEmail(true)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-10 h-10 bg-accent rounded-sm flex items-center justify-center font-display font-bold text-white">RC</div>
          <h1 className="font-display text-2xl font-bold">ROIDERS.CLUB</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-md p-6 space-y-4">
          <h2 className="font-display text-lg font-semibold">Create account</h2>

          {error && <p className="text-sm text-danger">{error}</p>}
          {confirmEmail && (
            <p className="text-sm text-success">Check your email to confirm your account, then sign in.</p>
          )}

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
              minLength={6}
              required
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Creating...' : 'Sign up'}
          </Button>
        </form>

        <p className="text-center text-sm text-text-secondary mt-4">
          Already have an account? <Link to="/login" className="text-accent hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}