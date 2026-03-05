import { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { KeyIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'

const API = import.meta.env.VITE_API_URL

export default function Profilo() {
  const [form, setForm] = useState({ passwordAttuale: '', nuovaPassword: '', confermaPassword: '' })
  const [loading, setLoading] = useState(false)

  // 2FA states
  const [totpSetupData, setTotpSetupData] = useState(null) // { qrCode, secret }
  const [totpCode, setTotpCode] = useState('')
  const [totpEnabled, setTotpEnabled] = useState(false)
  const [loadingTotp, setLoadingTotp] = useState(false)

  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.nuovaPassword !== form.confermaPassword) {
      toast.error('Le password non coincidono')
      return
    }
    if (form.nuovaPassword.length < 6) {
      toast.error('La nuova password deve avere almeno 6 caratteri')
      return
    }
    setLoading(true)
    try {
      await axios.put(
        `${API}/api/auth/change-password`,
        { passwordAttuale: form.passwordAttuale, nuovaPassword: form.nuovaPassword },
        { headers }
      )
      toast.success('Password cambiata con successo!')
      setForm({ passwordAttuale: '', nuovaPassword: '', confermaPassword: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Errore nel cambio password')
    } finally {
      setLoading(false)
    }
  }

  const handleSetup2FA = async () => {
    setLoadingTotp(true)
    try {
      const { data } = await axios.post(`${API}/api/auth/setup-2fa`, {}, { headers })
      setTotpSetupData(data)
      setTotpCode('')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Errore avvio setup 2FA')
    } finally {
      setLoadingTotp(false)
    }
  }

  const handleVerify2FA = async () => {
    if (totpCode.length !== 6) {
      toast.error('Inserisci il codice a 6 cifre')
      return
    }
    setLoadingTotp(true)
    try {
      await axios.post(`${API}/api/auth/verify-2fa`, { token: totpCode }, { headers })
      toast.success('2FA attivato con successo!')
      setTotpEnabled(true)
      setTotpSetupData(null)
      setTotpCode('')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Codice non valido')
    } finally {
      setLoadingTotp(false)
    }
  }

  const handleDisable2FA = async () => {
    if (!window.confirm('Sei sicuro di voler disabilitare il 2FA?')) return
    setLoadingTotp(true)
    try {
      await axios.post(`${API}/api/auth/disable-2fa`, {}, { headers })
      toast.success('2FA disabilitato')
      setTotpEnabled(false)
      setTotpSetupData(null)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Errore disabilitazione 2FA')
    } finally {
      setLoadingTotp(false)
    }
  }

  return (
    <div className="p-6 max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <KeyIcon className="w-8 h-8 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-800">Profilo & Sicurezza</h1>
      </div>

      {/* Cambia Password */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Cambia Password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Password Attuale</label>
            <input
              type="password"
              name="passwordAttuale"
              value={form.passwordAttuale}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Nuova Password</label>
            <input
              type="password"
              name="nuovaPassword"
              value={form.nuovaPassword}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Conferma Nuova Password</label>
            <input
              type="password"
              name="confermaPassword"
              value={form.confermaPassword}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Salvataggio...' : 'Aggiorna Password'}
          </button>
        </form>
      </div>

      {/* Sezione 2FA */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheckIcon className="w-6 h-6 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-700">Autenticazione a Due Fattori (2FA)</h2>
        </div>

        {totpEnabled ? (
          <div>
            <div className="flex items-center gap-2 mb-4 text-green-600">
              <span className="text-2xl">✅</span>
              <span className="font-semibold">2FA attivo - Il tuo account è protetto</span>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Stai usando Google Authenticator per proteggere il tuo accesso.
            </p>
            <button onClick={handleDisable2FA} disabled={loadingTotp} className="btn-secondary text-red-600 border-red-300 hover:bg-red-50">
              {loadingTotp ? 'Disabilitazione...' : 'Disabilita 2FA'}
            </button>
          </div>
        ) : !totpSetupData ? (
          <div>
            <p className="text-sm text-gray-500 mb-4">
              Aggiungi un livello extra di sicurezza al tuo account. Con il 2FA attivo,
              oltre alla password dovrai inserire un codice dall'app <strong>Google Authenticator</strong>.
            </p>
            <button onClick={handleSetup2FA} disabled={loadingTotp} className="btn-primary">
              {loadingTotp ? 'Generazione QR...' : 'Attiva 2FA con Authenticator'}
            </button>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-600 mb-3 font-medium">
              1. Apri <strong>Google Authenticator</strong> sul tuo telefono
            </p>
            <p className="text-sm text-gray-600 mb-3">
              2. Scansiona il QR code qui sotto con l'app
            </p>
            <div className="flex justify-center mb-4">
              <img src={totpSetupData.qrCode} alt="QR Code 2FA" className="w-48 h-48 border rounded-lg" />
            </div>
            <p className="text-xs text-gray-400 text-center mb-4">
              Oppure inserisci manualmente il codice: <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">{totpSetupData.secret}</code>
            </p>
            <p className="text-sm text-gray-600 mb-2">
              3. Inserisci il codice a 6 cifre generato dall'app per confermare:
            </p>
            <input
              type="text"
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-center text-2xl tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              placeholder="000000"
              maxLength={6}
            />
            <div className="flex gap-2">
              <button onClick={handleVerify2FA} disabled={loadingTotp} className="btn-primary flex-1">
                {loadingTotp ? 'Verifica...' : 'Conferma e Attiva 2FA'}
              </button>
              <button onClick={() => { setTotpSetupData(null); setTotpCode('') }} className="btn-secondary">
                Annulla
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
