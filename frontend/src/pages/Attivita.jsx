import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { PlusIcon } from '@heroicons/react/24/outline'

const STATI = ['da_fare', 'in_corso', 'completata']

export default function Attivita() {
  const [attivita, setAttivita] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ titolo: '', descrizione: '', scadenza: '', stato: 'da_fare' })

  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  const fetchAttivita = async () => {
    try {
      const { data } = await axios.get('/api/attivita', { headers })
      setAttivita(data)
    } catch {
      toast.error('Errore nel caricamento')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAttivita() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post('/api/attivita', form, { headers })
      toast.success('Attivita aggiunta!')
      setShowForm(false)
      setForm({ titolo: '', descrizione: '', scadenza: '', stato: 'da_fare' })
      fetchAttivita()
    } catch {
      toast.error('Errore nel salvataggio')
    }
  }

  const badgeColor = (stato) => ({
    da_fare: 'bg-red-100 text-red-700',
    in_corso: 'bg-yellow-100 text-yellow-700',
    completata: 'bg-green-100 text-green-700'
  }[stato] || 'bg-gray-100 text-gray-700')

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Attivita</h2>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-4 h-4" /> Nuova Attivita
        </button>
      </div>
      {loading ? <p className="text-gray-400">Caricamento...</p> : (
        <div className="space-y-3">
          {attivita.length === 0 ? (
            <p className="text-gray-400">Nessuna attivita</p>
          ) : attivita.map(a => (
            <div key={a.id} className="card flex items-center justify-between">
              <div>
                <p className="font-medium">{a.titolo}</p>
                <p className="text-sm text-gray-500">{a.descrizione}</p>
                {a.scadenza && <p className="text-xs text-gray-400 mt-1">Scadenza: {new Date(a.scadenza).toLocaleDateString('it-IT')}</p>}
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${badgeColor(a.stato)}`}>
                {a.stato?.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      )}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Nuova Attivita</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input placeholder="Titolo" value={form.titolo} onChange={e => setForm({...form, titolo: e.target.value})} className="input-field" required />
              <textarea placeholder="Descrizione" value={form.descrizione} onChange={e => setForm({...form, descrizione: e.target.value})} className="input-field" rows={3} />
              <input type="date" value={form.scadenza} onChange={e => setForm({...form, scadenza: e.target.value})} className="input-field" />
              <select value={form.stato} onChange={e => setForm({...form, stato: e.target.value})} className="input-field">
                {STATI.map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
              </select>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Annulla</button>
                <button type="submit" className="btn-primary">Salva</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
