import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { ArrowLeftIcon, PencilIcon, TrashIcon, PlusIcon, CalendarIcon, DocumentTextIcon, ClipboardDocumentListIcon, EnvelopeIcon } from '@heroicons/react/24/outline'

export default function ClienteDettaglio() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [cliente, setCliente] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const [activeTab, setActiveTab] = useState('panoramica')
  const [showNewNote, setShowNewNote] = useState(false)
  const [nota, setNota] = useState('')
  
  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => { loadCliente() }, [id])

  const loadCliente = async () => {
    try {
      const { data } = await axios.get(`/api/clienti/${id}`, { headers })
      setCliente(data)
      setForm(data)
    } catch {
      toast.error('Errore nel caricamento')
      navigate('/clienti')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      await axios.put(`/api/clienti/${id}`, form, { headers })
      toast.success('Cliente aggiornato!')
      setEditing(false)
      loadCliente()
    } catch {
      toast.error('Errore nell\'aggiornamento')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Eliminare questo cliente?')) return
    try {
      await axios.delete(`/api/clienti/${id}`, { headers })
      toast.success('Cliente eliminato')
      navigate('/clienti')
    } catch {
      toast.error('Errore nell\'eliminazione')
    }
  }

  const addNote = () => {
    if (!nota.trim()) return
    toast.success('Nota aggiunta (da implementare backend)')
    setNota('')
    setShowNewNote(false)
  }

  if (loading) return <div className="p-8">Caricamento...</div>
  if (!cliente) return null

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/clienti')} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold">
            {cliente.nome[0]}{cliente.cognome[0]}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{cliente.nome} {cliente.cognome}</h1>
            <p className="text-gray-500">{cliente.email}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary flex items-center gap-2"><EnvelopeIcon className="w-4 h-4" /> Email</button>
          <button className="btn-secondary flex items-center gap-2"><DocumentTextIcon className="w-4 h-4" /> Documento</button>
          {!editing ? (
            <button onClick={() => setEditing(true)} className="btn-primary flex items-center gap-2"><PencilIcon className="w-4 h-4" /> Modifica</button>
          ) : (
            <button onClick={() => setEditing(false)} className="btn-secondary">Annulla</button>
          )}
          <button onClick={handleDelete} className="btn-secondary text-red-600 hover:bg-red-50 flex items-center gap-2"><TrashIcon className="w-4 h-4" /> Elimina</button>
        </div>
      </div>

      <div className="flex gap-4 border-b mb-6">
        {['panoramica', 'info', 'documenti'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 font-medium border-b-2 ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}>
            {tab === 'panoramica' ? 'Panoramica' : tab === 'info' ? 'Info' : 'Documenti'}
          </button>
        ))}
      </div>

      {activeTab === 'panoramica' && (
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold">Ultime interazioni</h3>
                <button onClick={() => setShowNewNote(!showNewNote)} className="btn-secondary flex items-center gap-2"><PlusIcon className="w-4 h-4" /> Nota</button>
              </div>
              {showNewNote && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <textarea value={nota} onChange={e => setNota(e.target.value)} placeholder="Scrivi una nota..." className="input-field mb-2" rows={3} />
                  <div className="flex gap-2">
                    <button onClick={addNote} className="btn-primary">Salva</button>
                    <button onClick={() => setShowNewNote(false)} className="btn-secondary">Annulla</button>
                  </div>
                </div>
              )}
              <div className="space-y-3">
                <div className="p-3 border-l-4 border-blue-600 bg-blue-50 rounded">
                  <p className="text-sm text-gray-500">27/02/2024 · 14:30</p>
                  <p className="font-medium">Verifica documenti per carta esclusiva</p>
                  <p className="text-sm text-gray-600">Scadenza documento: 25/03/2024</p>
                </div>
                <div className="p-3 border-l-4 border-green-600 bg-green-50 rounded">
                  <p className="text-sm text-gray-500">20/02/2024 · 10:15</p>
                  <p className="font-medium">Appunto periodico - Incontro trimestrale</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card">
              <h3 className="font-bold mb-3">Etichette</h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">AUM oltre 600K (obiettivo)</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">Clienti</span>
                <button className="px-3 py-1 border border-dashed border-gray-300 text-gray-400 rounded-full text-sm">+ Aggiungi</button>
              </div>
            </div>

            <div className="card">
              <h3 className="font-bold mb-3">Pianificazione incontri</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <CalendarIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Ultimo incontro</p>
                    <p className="text-xs text-gray-500">{cliente.ultimo_incontro || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CalendarIcon className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Prossimo incontro</p>
                    <p className="text-xs text-gray-500">{cliente.prossimo_incontro || 'N/A'}</p>
                  </div>
                </div>
              </div>
              <button className="btn-primary w-full mt-3 flex items-center justify-center gap-2"><PlusIcon className="w-4 h-4" /> Pianifica</button>
            </div>

            <div className="card">
              <h3 className="font-bold mb-3">Attività da pianificare</h3>
              <p className="text-sm text-gray-400">Nessuna attività pianificata</p>
              <button className="btn-secondary w-full mt-3">Crea attività</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'info' && (
        <div className="card max-w-2xl">
          {editing ? (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Nome" value={form.nome||''} onChange={e => setForm({...form, nome: e.target.value})} className="input-field" required />
                <input placeholder="Cognome" value={form.cognome||''} onChange={e => setForm({...form, cognome: e.target.value})} className="input-field" required />
              </div>
              <input placeholder="Email" type="email" value={form.email||''} onChange={e => setForm({...form, email: e.target.value})} className="input-field" />
              <input placeholder="Telefono" value={form.telefono||''} onChange={e => setForm({...form, telefono: e.target.value})} className="input-field" />
              <input placeholder="Indirizzo" value={form.indirizzo||''} onChange={e => setForm({...form, indirizzo: e.target.value})} className="input-field" />
              <input placeholder="AUM" type="number" step="0.01" value={form.aum||''} onChange={e => setForm({...form, aum: e.target.value})} className="input-field" />
              <textarea placeholder="Note" value={form.note||''} onChange={e => setForm({...form, note: e.target.value})} className="input-field" rows={4} />
              <button type="submit" className="btn-primary">Salva modifiche</button>
            </form>
          ) : (
            <div className="space-y-3">
              <div><span className="text-gray-500">Nome:</span> <span className="font-medium">{cliente.nome} {cliente.cognome}</span></div>
              <div><span className="text-gray-500">Email:</span> <span className="font-medium">{cliente.email}</span></div>
              <div><span className="text-gray-500">Telefono:</span> <span className="font-medium">{cliente.telefono}</span></div>
              <div><span className="text-gray-500">Indirizzo:</span> <span className="font-medium">{cliente.indirizzo || 'N/A'}</span></div>
              <div><span className="text-gray-500">AUM:</span> <span className="font-medium">{cliente.aum ? `€${parseFloat(cliente.aum).toLocaleString()}` : 'N/A'}</span></div>
              <div><span className="text-gray-500">Note:</span> <span className="font-medium">{cliente.note || 'Nessuna'}</span></div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'documenti' && (
        <div className="card">
          <p className="text-gray-400">Nessun documento caricato</p>
          <button className="btn-primary mt-4">Carica documento</button>
        </div>
      )}
    </div>
  )
}