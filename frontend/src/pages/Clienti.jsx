import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

export default function Clienti() {
  const [clienti, setClienti] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nome: '', cognome: '', email: '', telefono: '', note: '' })

  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  const fetchClienti = async () => {
    try {
      const { data } = await axios.get('/api/clienti', { headers })
      setClienti(data)
    } catch {
      toast.error('Errore nel caricamento clienti')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchClienti() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post('/api/clienti', form, { headers })
      toast.success('Cliente aggiunto!')
      setShowForm(false)
      setForm({ nome: '', cognome: '', email: '', telefono: '', note: '' })
      fetchClienti()
    } catch {
      toast.error('Errore nel salvataggio')
    }
  }

  const filtered = clienti.filter(c =>
    `${c.nome} ${c.cognome} ${c.email}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Clienti</h2>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-4 h-4" /> Nuovo Cliente
        </button>
      </div>
      <div className="relative mb-6">
        <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
        <input
          type="text"
          placeholder="Cerca cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-10"
        />
      </div>
      {loading ? (
        <p className="text-gray-400">Caricamento...</p>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Nome</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Telefono</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-400">Nessun cliente trovato</td></tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{c.nome} {c.cognome}</td>
                    <td className="px-6 py-4 text-gray-500">{c.email}</td>
                    <td className="px-6 py-4 text-gray-500">{c.telefono}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Nuovo Cliente</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Nome" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} className="input-field" required />
                <input placeholder="Cognome" value={form.cognome} onChange={e => setForm({...form, cognome: e.target.value})} className="input-field" required />
              </div>
              <input placeholder="Email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="input-field" />
              <input placeholder="Telefono" value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} className="input-field" />
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
