// v2 - build trigger
import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

const STATI = ['da_fare', 'in_corso', 'completata']

const emptyForm = { titolo: '', descrizione: '', scadenza: '', stato: 'da_fare' }

export default function Attivita() {
  const [attivita, setAttivita] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)

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

  const openAdd = () => {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  const openEdit = (a) => {
    setEditingId(a.id)
    setForm({
      titolo: a.titolo || '',
      descrizione: a.descrizione || '',
      scadenza: a.scadenza ? a.scadenza.substring(0, 10) : '',
      stato: a.stato || 'da_fare'
    })
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        await axios.put(`/api/attivita/${editingId}`, form, { headers })
        toast.success('Attivita aggiornata!')
      } else {
        await axios.post('/api/attivita', form, { headers })
        toast.success('Attivita aggiunta!')
      }
      setShowForm(false)
      setEditingId(null)
      setForm(emptyForm)
      fetchAttivita()
    } catch {
      toast.error('Errore nel salvataggio')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Eliminare questa attivita?')) return
    try {
      await axios.delete(`/api/attivita/${id}`, { headers })
      toast.success('Attivita eliminata!')
      fetchAttivita()
    } catch {
      toast.error('Errore eliminazione')
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
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-4 h-4" /> Nuova Attivita
        </button>
      </div>

      {loading ? (
        <p className="text-gray-400">Caricamento...</p>
      ) : (
        <div className="space-y-3">
          {attivita.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Nessuna attivita</p>
          ) : attivita.map(a => (
            <div key={a.id} className="card flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{a.titolo}</p>
                {a.descrizione && <p className="text-sm text-gray-600 mt-1">{a.descrizione}</p>}
                {a.scadenza && (
                  <p className="text-xs text-gray-400 mt-1">
                    Scadenza: {new Date(a.scadenza).toLocaleDateString('it-IT')}
                  </p>
                )}
                <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${badgeColor(a.stato)}`}>
                  {a.stato?.replace('_', ' ')}
                </span>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => openEdit(a)}
                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                  title="Modifica"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(a.id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                  title="Elimina"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="font-bold text-lg mb-4">
              {editingId ? 'Modifica Attivita' : 'Nuova Attivita'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                placeholder="Titolo"
                value={form.titolo}
                onChange={e => setForm({...form, titolo: e.target.value})}
                className="input-field"
                required
              />
              <textarea
                placeholder="Descrizione"
                value={form.descrizione}
                onChange={e => setForm({...form, descrizione: e.target.value})}
                className="input-field"
                rows={3}
              />
              <input
                type="date"
                value={form.scadenza}
                onChange={e => setForm({...form, scadenza: e.target.value})}
                className="input-field"
              />
              <select
                value={form.stato}
                onChange={e => setForm({...form, stato: e.target.value})}
                className="input-field"
              >
                {STATI.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => { setShowForm(false); setEditingId(null) }} className="btn-secondary">Annulla</button>
                <button type="submit" className="btn-primary">{editingId ? 'Aggiorna' : 'Salva'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
