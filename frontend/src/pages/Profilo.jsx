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

  // Carica lo stato 2FA all'avvio
  useEffect(() => {
    const fetch2FAStatus = async () => {
      try {
        const { data } = await axios.get(`${API}/api/auth/2fa-status`, { headers })
        setTotpEnabled(data.totpEnabled)
      } catch (err) {
        console.error('Errore nel caricamento stato 2FA', err)
      }
    }
    fetch2FAStatus()
  }, [])

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
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Profilo & Sicurezza</h1>

      {/* Cambia Password */}
      <div className="card mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <KeyIcon className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-lg font-semibold">Cambia Password</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password Attuale</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Nuova Password</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Conferma Nuova Password</label>
            <input
              type="password"
              name="confermaPassword"
              value={form.confermaPassword}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Salvataggio...' : 'Aggiorna Password'}
          </button>
        </form>
      </div>

      {/* Sezione 2FA */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-100 rounded-lg">
            <ShieldCheckIcon className="w-5 h-5 text-green-600" />
          </div>
          <h2 className="text-lg font-semibold">Autenticazione a Due Fattori (2FA)</h2>
        </div>

        {totpEnabled ? (
          <div>
            <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-4">
              <span className="text-lg">✅</span>
              <span className="font-medium"> 2FA attivo - Il tuo account è protetto </span>
            </div>
            <p className="text-sm text-gray-500 mb-4">Stai usando Google Authenticator per proteggere il tuo accesso.</p>
            <button
              onClick={handleDisable2FA}
              disabled={loadingTotp}
              className="btn-secondary text-red-600 border-red-300 hover:bg-red-50"
            >
              {loadingTotp ? 'Disabilitazione...' : 'Disabilita 2FA'}
            </button>
          </div>
        ) : !totpSetupData ? (
          <div>
            <p className="text-sm text-gray-500 mb-4">
              Aggiungi un livello extra di sicurezza al tuo account. Con il 2FA attivo, oltre alla password
              dovrai inserire un codice dall'app <strong>Google Authenticator</strong>.
            </p>
            <button
              onClick={handleSetup2FA}
              disabled={loadingTotp}
              className="btn-primary"
            >
              {loadingTotp ? 'Generazione QR...' : 'Attiva 2FA con Authenticator'}
            </button>
          </div>
        ) : (
          <div>
            <ol className="list-decimal list-inside space-y-3 text-sm text-gray-700 mb-6">
              <li>Apri <strong>Google Authenticator</strong> sul tuo telefono</li>
              <li>Scansiona il QR code qui sotto con l'app</li>
            </ol>
            <div className="flex justify-center mb-4">
              <img src={totpSetupData.qrCode} alt="QR Code 2FA" className="border rounded-lg p-2" />
            </div>
            <p className="text-xs text-gray-500 text-center mb-4">
              Oppure inserisci manualmente il codice: <code className="bg-gray-100 px-2 py-0.5 rounded font-mono">{totpSetupData.secret}</code>
            </p>
            <ol className="list-decimal list-inside text-sm text-gray-700 mb-4" start={3}>
              <li>Inserisci il codice a 6 cifre generato dall'app per confermare:</li>
            </ol>
            <input
              type="text"
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-center text-2xl tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              placeholder="000000"
              maxLength={6}
            />
            <div className="flex gap-2">
              <button onClick={handleVerify2FA} disabled={loadingTotp} className="btn-primary">
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
