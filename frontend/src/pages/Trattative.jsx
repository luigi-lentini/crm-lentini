import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

const FASI = ['contatto', 'proposta', 'negoziazione', 'chiusa_vinta', 'chiusa_persa']

export default function Trattative() {
  const [trattative, setTrattative] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ titolo: '', valore: '', fase: 'contatto', note: '' })

  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  const fetchTrattative = async () => {
    try {
      const { data } = await axios.get('/api/trattative', { headers })
      setTrattative(data)
    } catch {
      toast.error('Errore nel caricamento')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTrattative() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        await axios.put(`/api/trattative/${editingId}`, form, { headers })
        toast.success('Trattativa aggiornata!')
        setEditingId(null)
      } else {
        await axios.post('/api/trattative', form, { headers })
        toast.success('Trattativa aggiunta!')
      }
      setShowForm(false)
      setForm({ titolo: '', valore: '', fase: 'contatto', note: '' })
      fetchTrattative()
    } catch {
      toast.error('Errore nel salvataggio')
    }
  }

  const handleEdit = (t) => {
    setForm({ titolo: t.titolo, valore: t.valore, fase: t.fase, note: t.note || '' })
    setEditingId(t.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Sei sicuro di voler eliminare questa trattativa?')) return
    try {
      await axios.delete(`/api/trattative/${id}`, { headers })
      toast.success('Trattativa eliminata!')
      fetchTrattative()
    } catch {
      toast.error('Errore nell\'eliminazione')
    }
  }

  const faseColor = (fase) => ({
    contatto: 'bg-blue-100 text-blue-700',
    proposta: 'bg-yellow-100 text-yellow-700',
    negoziazione: 'bg-orange-100 text-orange-700',
    chiusa_vinta: 'bg-green-100 text-green-700',
    chiusa_persa: 'bg-red-100 text-red-700',
  }[fase] || 'bg-gray-100 text-gray-700')

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Trattative</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <PlusIcon className="h-5 w-5" />
          Nuova Trattativa
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">Caricamento...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {trattative.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Nessuna trattativa presente</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Titolo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valore</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fase</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Azioni</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {trattative.map(t => (
                  <tr key={t.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{t.titolo}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {t.valore ? `€ ${Number(t.valore).toLocaleString('it-IT')}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${faseColor(t.fase)}`}>
                        {t.fase?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(t)} className="text-blue-600 hover:text-blue-800">
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button onClick={() => handleDelete(t.id)} className="text-red-600 hover:text-red-800">
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Modifica Trattativa' : 'Nuova Trattativa'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                placeholder="Titolo"
                value={form.titolo}
                onChange={e => setForm({...form, titolo: e.target.value})}
                className="input-field"
                required
              />
              <input
                placeholder="Valore (EUR)"
                type="number"
                value={form.valore}
                onChange={e => setForm({...form, valore: e.target.value})}
                className="input-field"
              />
              <select
                value={form.fase}
                onChange={e => setForm({...form, fase: e.target.value})}
                className="input-field"
              >
                {FASI.map(f => <option key={f} value={f}>{f.replace(/_/g, ' ')}</option>)}
              </select>
              <textarea
                placeholder="Note"
                value={form.note}
                onChange={e => setForm({...form, note: e.target.value})}
                className="input-field"
                rows={3}
              />
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditingId(null); setForm({ titolo: '', valore: '', fase: 'contatto', note: '' }) }}
                  className="btn-secondary"
                >
                  Annulla
                </button>
                <button type="submit" className="btn-primary">Salva</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
