import { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { CalendarDaysIcon, PlusIcon } from '@heroicons/react/24/outline'

export default function Agenda() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ titolo: '', dataInizio: '', dataFine: '', luogo: '', tipo: 'meeting', clienteNome: '' })
  const [editing, setEditing] = useState(null)

  useEffect(() => { loadItems() }, [])

  const loadItems = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/appuntamenti`, { headers: { Authorization: `Bearer ${token}` } })
      setItems(res.data)
    } catch { toast.error('Errore caricamento appuntamenti') }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      if (editing) {
        await axios.put(`${import.meta.env.VITE_API_URL}/api/appuntamenti/${editing}`, form, { headers: { Authorization: `Bearer ${token}` } })
        toast.success('Aggiornato')
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/appuntamenti`, form, { headers: { Authorization: `Bearer ${token}` } })
        toast.success('Creato')
      }
      setForm({ titolo: '', dataInizio: '', dataFine: '', luogo: '', tipo: 'meeting', clienteNome: '' })
      setEditing(null)
      loadItems()
    } catch { toast.error('Errore salvataggio') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Eliminare?')) return
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/appuntamenti/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      toast.success('Eliminato')
      loadItems()
    } catch { toast.error('Errore eliminazione') }
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <CalendarDaysIcon className="w-8 h-8 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-800">Agenda Appuntamenti</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">{editing ? 'Modifica' : 'Nuovo'} Appuntamento</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input type="text" placeholder="Titolo" value={form.titolo} onChange={e => setForm({...form, titolo: e.target.value})} required className="w-full border rounded-lg px-3 py-2" />
              <input type="datetime-local" value={form.dataInizio} onChange={e => setForm({...form, dataInizio: e.target.value})} required className="w-full border rounded-lg px-3 py-2" />
              <input type="datetime-local" value={form.dataFine} onChange={e => setForm({...form, dataFine: e.target.value})} required className="w-full border rounded-lg px-3 py-2" />
              <input type="text" placeholder="Luogo" value={form.luogo} onChange={e => setForm({...form, luogo: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
              <select value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})} className="w-full border rounded-lg px-3 py-2">
                <option value="meeting">Meeting</option>
                <option value="call">Chiamata</option>
                <option value="visita">Visita</option>
              </select>
              <input type="text" placeholder="Nome Cliente" value={form.clienteNome} onChange={e => setForm({...form, clienteNome: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">Salva</button>
              {editing && <button type="button" onClick={() => { setEditing(null); setForm({ titolo: '', dataInizio: '', dataFine: '', luogo: '', tipo: 'meeting', clienteNome: '' }) }} className="w-full bg-gray-300 text-gray-700 py-2 rounded-lg">Annulla</button>}
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Prossimi Appuntamenti</h2>
            <div className="space-y-3">
              {items.map(item => (
                <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-800">{item.titolo}</h3>
                      <p className="text-sm text-gray-600">{new Date(item.dataInizio).toLocaleString('it-IT')}</p>
                      {item.luogo && <p className="text-sm text-gray-500">📍 {item.luogo}</p>}
                      {item.clienteNome && <p className="text-sm text-blue-600">👤 {item.clienteNome}</p>}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setForm(item); setEditing(item.id) }} className="text-blue-600 hover:underline text-sm">Modifica</button>
                      <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:underline text-sm">Elimina</button>
                    </div>
                  </div>
                </div>
              ))}
              {items.length === 0 && <p className="text-gray-400 text-center py-8">Nessun appuntamento</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
