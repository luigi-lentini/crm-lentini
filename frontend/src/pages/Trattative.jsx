import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { PlusIcon } from '@heroicons/react/24/outline'

const FASI = ['contatto', 'proposta', 'negoziazione', 'chiusa_vinta', 'chiusa_persa']

export default function Trattative() {
  const [trattative, setTrattative] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
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
      await axios.post('/api/trattative', form, { headers })
      toast.success('Trattativa aggiunta!')
      setShowForm(false)
      setForm({ titolo: '', valore: '', fase: 'contatto', note: '' })
      fetchTrattative()
    } catch {
      toast.error('Errore nel salvataggio')
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
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Trattative</h2>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-4 h-4" /> Nuova Trattativa
        </button>
      </div>
      {loading ? <p className="text-gray-400">Caricamento...</p> : (
        <div className="card overflow-hidden p-0">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Titolo</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Valore</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Fase</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {trattative.length === 0 ? (
                <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-400">Nessuna trattativa</td></tr>
              ) : trattative.map(t => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{t.titolo}</td>
                  <td className="px-6 py-4 text-gray-500">{t.valore ? `€ ${Number(t.valore).toLocaleString('it-IT')}` : '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${faseColor(t.fase)}`}>
                      {t.fase?.replace(/_/g, ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Nuova Trattativa</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input placeholder="Titolo" value={form.titolo} onChange={e => setForm({...form, titolo: e.target.value})} className="input-field" required />
              <input placeholder="Valore (EUR)" type="number" value={form.valore} onChange={e => setForm({...form, valore: e.target.value})} className="input-field" />
              <select value={form.fase} onChange={e => setForm({...form, fase: e.target.value})} className="input-field">
                {FASI.map(f => <option key={f} value={f}>{f.replace(/_/g, ' ')}</option>)}
              </select>
              <textarea placeholder="Note" value={form.note} onChange={e => setForm({...form, note: e.target.value})} className="input-field" rows={3} />
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
