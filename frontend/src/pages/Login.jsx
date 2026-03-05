import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'

const API = import.meta.env.VITE_API_URL

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [totpToken, setTotpToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [requires2FA, setRequires2FA] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = requires2FA
        ? { email, password, totpToken }
        : { email, password }

      const { data } = await axios.post(`${API}/api/auth/login`, payload)

      if (data.requires2FA) {
        setRequires2FA(true)
        toast('Inserisci il codice a 6 cifre dall\'app Authenticator', { icon: '🔐' })
        return
      }

      localStorage.setItem('token', data.token)
      localStorage.setItem('refreshToken', data.refreshToken)
      toast.success('Accesso effettuato!')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Credenziali non valide')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-700">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900">CRM LENTINI</h1>
          <p className="text-gray-500 mt-2">Consulente Finanziario</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!requires2FA ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="email@esempio.it"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="••••••••"
                  required
                />
              </div>
            </>
          ) : (
            <div>
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">🔐</div>
                <p className="text-sm text-gray-600 font-medium">
                  Apri <strong>Google Authenticator</strong> e inserisci il codice a 6 cifre
                </p>
              </div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Codice Authenticator</label>
              <input
                type="text"
                value={totpToken}
                onChange={(e) => setTotpToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="input-field text-center text-2xl tracking-widest font-mono"
                placeholder="000000"
                maxLength={6}
                autoFocus
                required
              />
              <button
                type="button"
                onClick={() => { setRequires2FA(false); setTotpToken('') }}
                className="mt-2 text-sm text-blue-600 hover:underline w-full text-center"
              >
                ← Torna al login
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 text-base font-semibold"
          >
            {loading ? 'Accesso...' : requires2FA ? 'Verifica codice' : 'Accedi'}
          </button>
        </form>
      </div>
    </div>
  )
}
