import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import axios from 'axios'
import toast from 'react-hot-toast'
import { PlusIcon } from '@heroicons/react/24/outline'

export default function Agenda() {
  const [events, setEvents] = useState([])
  const [showForm, setShowForm] = useState(false)
  const navigate = useNavigate()
  const [form, setForm] = useState({ 
    titolo: '', dataInizio: '', dataFine: '', tipo: 'meeting', 
    note_salienti: '', indirizzo: '', appuntamento_online: false 
  })
  const [clienti, setClienti] = useState([])

  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  const fetchEvents = async () => {
    try {
      const { data } = await axios.get('/api/appuntamenti', { headers })
      setEvents(data.map(e => ({
        id: e.id,
        title: e.titolo,
        start: e.dataInizio,
        end: e.dataFine,
        extendedProps: { ...e }
      })))
    } catch { toast.error('Errore nel caricamento') }
  }

  const fetchClienti = async () => {
    try {
      const { data } = await axios.get('/api/clienti', { headers })
      setClienti(data)
    } catch { }
  }

  useEffect(() => { 
    fetchEvents()
    fetchClienti()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post('/api/appuntamenti', form, { headers })
      toast.success('Evento aggiunto!')
      setShowForm(false)
      fetchEvents()
    } catch { toast.error('Errore nel salvataggio') }
  }

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Agenda</h2>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-4 h-4" /> Nuovo Appuntamento
        </button>
      </div>

      <div className="card flex-1 overflow-hidden p-4">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          locale="it"
          events={events}
          height="100%"
          eventClick={(info) => navigate(`/agenda/${info.event.id}`)}
          selectable={true}
          select={(info) => {
            setForm({...form, dataInizio: info.startStr.slice(0,16), dataFine: info.endStr.slice(0,16)})
            setShowForm(true)
          }}
        />
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Nuovo Appuntamento</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input placeholder="Titolo" value={form.titolo} onChange={e => setForm({...form, titolo: e.target.value})} className="input-field" required />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500">Inizio</label>
                  <input type="datetime-local" value={form.dataInizio} onChange={e => setForm({...form, dataInizio: e.target.value})} className="input-field" required />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Fine</label>
                  <input type="datetime-local" value={form.dataFine} onChange={e => setForm({...form, dataFine: e.target.value})} className="input-field" required />
                </div>
              </div>
              <select value={form.clienteId} onChange={e => {
                const c = clienti.find(cl => cl.id == e.target.value)
                setForm({...form, clienteId: e.target.value, clienteNome: c ? `${c.nome} ${c.cognome}` : ''})
              }} className="input-field">
                <option value="">Seleziona Cliente</option>
                {clienti.map(c => <option key={c.id} value={c.id}>{c.nome} {c.cognome}</option>)}
              </select>
              <textarea placeholder="Note salienti..." value={form.note_salienti} onChange={e => setForm({...form, note_salienti: e.target.value})} className="input-field" rows={3} />
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