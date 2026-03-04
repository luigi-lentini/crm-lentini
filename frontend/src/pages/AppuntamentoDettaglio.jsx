import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { ArrowLeftIcon, CalendarIcon, MapPinIcon, UserGroupIcon, ClockIcon, PencilIcon, TrashIcon, DocumentTextIcon, VideoCameraIcon } from '@heroicons/react/24/outline'

export default function AppuntamentoDettaglio() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [appuntamento, setAppuntamento] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editingOrario, setEditingOrario] = useState(false)
  const [form, setForm] = useState({})

  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => { loadAppuntamento() }, [id])

  const loadAppuntamento = async () => {
    try {
      const { data } = await axios.get(`/api/appuntamenti/${id}`, { headers })
      setAppuntamento(data)
      setForm(data)
    } catch {
      toast.error('Errore nel caricamento')
      navigate('/agenda')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      await axios.put(`/api/appuntamenti/${id}`, form, { headers })
      toast.success('Appuntamento aggiornato!')
      setEditing(false)
      setEditingOrario(false)
      loadAppuntamento()
    } catch { toast.error('Errore nell\'aggiornamento') }
  }

  const handleSaveOrario = async () => {
    try {
      await axios.put(`/api/appuntamenti/${id}`, form, { headers })
      toast.success('Orario aggiornato!')
      setEditingOrario(false)
      loadAppuntamento()
    } catch { toast.error('Errore nel salvataggio orario') }
  }

  const handleDelete = async () => {
    if (!confirm('Eliminare questo appuntamento?')) return
    try {
      await axios.delete(`/api/appuntamenti/${id}`, { headers })
      toast.success('Appuntamento eliminato')
      navigate('/agenda')
    } catch { toast.error('Errore nell\'eliminazione') }
  }

  if (loading) return <div className="p-8">Caricamento...</div>
  if (!appuntamento) return null

  const dataInizio = new Date(appuntamento.dataInizio)
  const dataFine = new Date(appuntamento.dataFine)

  const fmt = (isoStr) => {
    if (!isoStr) return ''
    return isoStr.slice(0, 16)
  }

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/agenda')} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{appuntamento.titolo}</h1>
          <p className="text-gray-500">
            {dataInizio.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button onClick={() => setEditing(!editing)} className="btn-secondary flex items-center gap-2">
          <PencilIcon className="w-4 h-4" />
          {editing ? 'Annulla' : 'Modifica'}
        </button>
        <button onClick={handleDelete} className="btn-danger flex items-center gap-2">
          <TrashIcon className="w-4 h-4" />
          Elimina
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="card">
            <h3 className="font-bold mb-4">Note Salienti</h3>
            {editing ? (
              <textarea
                value={form.note_salienti || ''}
                onChange={e => setForm({...form, note_salienti: e.target.value})}
                className="input-field"
                rows={10}
                placeholder="Inserisci le note dell'incontro..."
              />
            ) : (
              <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
                {appuntamento.note_salienti || 'Nessuna nota inserita.'}
              </div>
            )}
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">Informazioni Incontro</h3>
              {!editing && (
                <button
                  onClick={() => setEditingOrario(!editingOrario)}
                  className="btn-secondary flex items-center gap-2 text-sm"
                >
                  <ClockIcon className="w-4 h-4" />
                  {editingOrario ? 'Annulla' : 'Modifica Orario'}
                </button>
              )}
            </div>

            {editingOrario && !editing ? (
              <div className="space-y-4 mb-4 p-4 bg-blue-50 rounded-lg">
                <div>
                  <label className="text-xs text-gray-500 uppercase font-bold mb-1 block">Inizio</label>
                  <input
                    type="datetime-local"
                    value={fmt(form.dataInizio)}
                    onChange={e => setForm({...form, dataInizio: e.target.value})}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase font-bold mb-1 block">Fine</label>
                  <input
                    type="datetime-local"
                    value={fmt(form.dataFine)}
                    onChange={e => setForm({...form, dataFine: e.target.value})}
                    className="input-field"
                  />
                </div>
                <button onClick={handleSaveOrario} className="btn-primary">
                  Salva Orario
                </button>
              </div>
            ) : null}

            <div className="grid grid-cols-2 gap-6">
              <div className="flex gap-3">
                <ClockIcon className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold">Orario</p>
                  {editing ? (
                    <div className="space-y-2 mt-1">
                      <div>
                        <label className="text-xs text-gray-400">Inizio</label>
                        <input
                          type="datetime-local"
                          value={fmt(form.dataInizio)}
                          onChange={e => setForm({...form, dataInizio: e.target.value})}
                          className="input-field text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400">Fine</label>
                        <input
                          type="datetime-local"
                          value={fmt(form.dataFine)}
                          onChange={e => setForm({...form, dataFine: e.target.value})}
                          className="input-field text-sm"
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm">
                      {dataInizio.toLocaleTimeString('it-IT', {hour:'2-digit', minute:'2-digit'})} - {dataFine.toLocaleTimeString('it-IT', {hour:'2-digit', minute:'2-digit'})}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <MapPinIcon className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold">Luogo/Indirizzo</p>
                  {editing ? (
                    <input
                      type="text"
                      value={form.indirizzo || ''}
                      onChange={e => setForm({...form, indirizzo: e.target.value})}
                      className="input-field text-sm"
                      placeholder="Indirizzo..."
                    />
                  ) : (
                    <p className="text-sm">{appuntamento.indirizzo || appuntamento.luogo || 'N/A'}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <VideoCameraIcon className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold">Tipo Incontro</p>
                  {editing ? (
                    <select
                      value={form.tipo || 'meeting'}
                      onChange={e => setForm({...form, tipo: e.target.value})}
                      className="input-field text-sm"
                    >
                      <option value="meeting">Meeting</option>
                      <option value="call">Call</option>
                      <option value="online">Online</option>
                    </select>
                  ) : (
                    <p className="text-sm capitalize">{appuntamento.appuntamento_online ? 'Online (Video Call)' : appuntamento.tipo}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <UserGroupIcon className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold">Partecipanti</p>
                  <p className="text-sm">{appuntamento.clienteNome || 'Nessun cliente associato'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h3 className="font-bold mb-4">Dettagli Pianificazione</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Si ripete</p>
                <span className="px-2 py-1 bg-gray-100 rounded text-xs">{appuntamento.si_ripete || 'No'}</span>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Stato</p>
                <span className={`px-2 py-1 rounded text-xs ${appuntamento.stato === 'completato' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                  {appuntamento.stato}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Priorità</p>
                <span className={`px-2 py-1 rounded text-xs ${appuntamento.priorita === 'alta' ? 'bg-red-100 text-red-700' : 'bg-gray-100'}`}>
                  {appuntamento.priorita || 'media'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={appuntamento.invia_email} readOnly className="rounded text-blue-600" />
                <span className="text-sm text-gray-600">Email di promemoria inviata</span>
              </div>
            </div>
          </div>

          {appuntamento.clienteId && (
            <button
              onClick={() => navigate(`/clienti/${appuntamento.clienteId}`)}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              Vedi Scheda Cliente
            </button>
          )}
        </div>
      </div>

      {editing && (
        <div className="mt-6 flex justify-end">
          <button onClick={handleUpdate} className="btn-primary px-8">Salva Tutte le Modifiche</button>
        </div>
      )}
    </div>
  )
}