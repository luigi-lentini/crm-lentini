import { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { KeyIcon } from '@heroicons/react/24/outline'

export default function Profilo() {
  const [form, setForm] = useState({ passwordAttuale: '', nuovaPassword: '', confermaPassword: '' })
  const [loading, setLoading] = useState(false)

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
      const token = localStorage.getItem('token')
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/auth/change-password`,
        { passwordAttuale: form.passwordAttuale, nuovaPassword: form.nuovaPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success('Password cambiata con successo!')
      setForm({ passwordAttuale: '', nuovaPassword: '', confermaPassword: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Errore nel cambio password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <KeyIcon className="w-8 h-8 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-800">Profilo & Sicurezza</h1>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
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
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Salvataggio...' : 'Aggiorna Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
