import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { useState, useEffect } from 'react'

export default function ClienteDettaglio() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [cliente, setCliente] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('info')
  const [note, setNote] = useState('')
  const [attivita, setAttivita] = useState([])
  const [trattative, setTrattative] = useState([])
  const [progetti, setProgetti] = useState([])

  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    loadCliente()
    loadNote()
    loadAttivita()
    loadTrattative()
    loadProgetti()
  }, [id])

  const loadCliente = async () => {
    try {
      const { data } = await axios.get(`/api/clienti/${id}`, { headers })
      setCliente(data)
    } catch {
      toast.error('Errore nel caricamento')
      navigate('/clienti')
    } finally {
      setLoading(false)
    }
  }

  const loadNote = async () => {
    try {
      const { data } = await axios.get(`/api/clienti/${id}/note`, { headers })
      setNote(data.note || '')
    } catch {}
  }

  const loadAttivita = async () => {
    try {
      const { data } = await axios.get(`/api/attivita?clienteId=${id}`, { headers })
      setAttivita(data)
    } catch {}
  }

  const loadTrattative = async () => {
    try {
      const { data } = await axios.get(`/api/trattative?clienteId=${id}`, { headers })
      setTrattative(data)
    } catch {}
  }

  const loadProgetti = async () => {
    try {
      const { data } = await axios.get(`/api/progetti?clienteId=${id}`, { headers })
      setProgetti(data)
    } catch {}
  }

  const saveNote = async () => {
    try {
      await axios.put(`/api/clienti/${id}/note`, { note }, { headers })
      toast.success('Note salvate')
    } catch {
      toast.error('Errore nel salvataggio')
    }
  }

  const handlePianifica = () => {
    navigate('/agenda')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!cliente) return null

  return (
    <div className="p-6">
      <button
        onClick={() => navigate('/clienti')}
        className="mb-4 flex items-center text-gray-600 hover:text-gray-900"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        Torna ai clienti
      </button>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{cliente.nome} {cliente.cognome}</h1>
            <p className="text-gray-600">{cliente.email}</p>
            <p className="text-gray-600">{cliente.telefono}</p>
          </div>
          <button
            onClick={handlePianifica}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Pianifica
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'info', label: 'Informazioni' },
              { id: 'attivita', label: 'Attività' },
              { id: 'trattative', label: 'Trattative' },
              { id: 'progetti', label: 'Progetti' },
              { id: 'note', label: 'Note' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome</label>
                <p className="mt-1 text-gray-900">{cliente.nome}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Cognome</label>
                <p className="mt-1 text-gray-900">{cliente.cognome}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-gray-900">{cliente.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Telefono</label>
                <p className="mt-1 text-gray-900">{cliente.telefono}</p>
              </div>
            </div>
          )}

          {activeTab === 'attivita' && (
            <div>
              {attivita.length === 0 ? (
                <p className="text-gray-500">Nessuna attività presente</p>
              ) : (
                <div className="space-y-2">
                  {attivita.map(att => (
                    <div key={att.id} className="border p-4 rounded">
                      <h3 className="font-medium">{att.titolo}</h3>
                      <p className="text-sm text-gray-600">{att.descrizione}</p>
                      <p className="text-xs text-gray-500">{new Date(att.data).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'trattative' && (
            <div>
              {trattative.length === 0 ? (
                <p className="text-gray-500">Nessuna trattativa presente</p>
              ) : (
                <div className="space-y-2">
                  {trattative.map(tratt => (
                    <div key={tratt.id} className="border p-4 rounded">
                      <h3 className="font-medium">{tratt.nome}</h3>
                      <p className="text-sm text-gray-600">Valore: €{tratt.valore}</p>
                      <p className="text-xs text-gray-500">Stato: {tratt.stato}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'progetti' && (
            <div>
              {progetti.length === 0 ? (
                <p className="text-gray-500">Nessun progetto presente</p>
              ) : (
                <div className="space-y-2">
                  {progetti.map(prog => (
                    <div key={prog.id} className="border p-4 rounded">
                      <h3 className="font-medium">{prog.nome}</h3>
                      <p className="text-sm text-gray-600">{prog.descrizione}</p>
                      <p className="text-xs text-gray-500">Stato: {prog.stato}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'note' && (
            <div>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full border rounded-lg p-3 h-64"
                placeholder="Inserisci note sul cliente..."
              />
              <button
                onClick={saveNote}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Salva Note
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
