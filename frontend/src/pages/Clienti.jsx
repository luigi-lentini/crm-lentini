import { useState, useEffect,, useNavigate useRef } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { PlusIcon, MagnifyingGlassIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline'

export default function Clienti() {
    const navigate = useNavigate()
  const [clienti, setClienti] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [csvPreview, setCsvPreview] = useState([])
  const [importing, setImporting] = useState(false)
  const [form, setForm] = useState({ nome: '', cognome: '', email: '', telefono: '', note: '' })
  const fileRef = useRef(null)

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

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target.result
      const lines = text.split('\n').filter(l => l.trim())
      if (lines.length < 2) {
        toast.error('File CSV vuoto o non valido')
        return
      }
      const rawHeaders = lines[0].split(';').map(h => h.trim().toLowerCase().replace(/["']/g, ''))
      const colonneAccettate = { nome: ['nome'], cognome: ['cognome'], email: ['email'], telefono: ['telefono', 'tel', 'phone'], note: ['note', 'notes'] }
      const mappaColonne = {}
      rawHeaders.forEach((h, i) => {
        for (const [campo, alias] of Object.entries(colonneAccettate)) {
          if (alias.includes(h)) mappaColonne[campo] = i
        }
      })
      const rows = lines.slice(1).map(line => {
        const cols = line.split(';').map(c => c.trim().replace(/["']/g, ''))
        return {
          nome: mappaColonne.nome !== undefined ? cols[mappaColonne.nome] || '' : '',
          cognome: mappaColonne.cognome !== undefined ? cols[mappaColonne.cognome] || '' : '',
          email: mappaColonne.email !== undefined ? cols[mappaColonne.email] || '' : '',
          telefono: mappaColonne.telefono !== undefined ? cols[mappaColonne.telefono] || '' : '',
          note: mappaColonne.note !== undefined ? cols[mappaColonne.note] || '' : ''
        }
      }).filter(r => r.nome || r.cognome || r.email)
      if (rows.length === 0) {
        toast.error('Nessun dato valido trovato nel file')
        return
      }
      setCsvPreview(rows)
      setShowImport(true)
    }
    reader.readAsText(file, 'UTF-8')
    e.target.value = ''
  }

  const handleImport = async () => {
    if (csvPreview.length === 0) return
    setImporting(true)
    try {
      const { data } = await axios.post('/api/clienti/import', { clienti: csvPreview }, { headers })
      toast.success(`Importati ${data.importati} clienti${data.saltati > 0 ? `, ${data.saltati} saltati` : ''}`)
      setShowImport(false)
      setCsvPreview([])
      fetchClienti()
    } catch {
      toast.error('Errore durante l\'importazione')
    } finally {
      setImporting(false)
    }
  }

  const filtered = clienti.filter(c =>
    `${c.nome} ${c.cognome} ${c.email}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Clienti</h2>
        <div className="flex gap-3">
          <input type="file" accept=".csv" ref={fileRef} onChange={handleFileChange} className="hidden" />
          <button onClick={() => fileRef.current.click()} className="btn-secondary flex items-center gap-2">
            <ArrowUpTrayIcon className="w-4 h-4" /> Importa CSV
          </button>
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
            <PlusIcon className="w-4 h-4" /> Nuovo Cliente
          </button>
        </div>
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
                  <tr key={c.id} c onClick={() => navigate(` cursor-pointer/clienti/${c.id}`)}lassName="hover:bg-gray-50">
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

      {showImport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-3xl max-h-[80vh] flex flex-col">
            <h3 className="text-lg font-bold mb-2">Anteprima importazione CSV</h3>
            <p className="text-sm text-gray-500 mb-4">{csvPreview.length} clienti trovati nel file. Verifica i dati e conferma.</p>
            <div className="overflow-auto flex-1 border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="text-left px-4 py-2 text-gray-500">Nome</th>
                    <th className="text-left px-4 py-2 text-gray-500">Cognome</th>
                    <th className="text-left px-4 py-2 text-gray-500">Email</th>
                    <th className="text-left px-4 py-2 text-gray-500">Telefono</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {csvPreview.map((c, i) => (
                    <tr key={i} className={!c.nome && !c.cognome ? 'bg-red-50' : ''}>
                      <td className="px-4 py-2">{c.nome || <span className="text-red-400">mancante</span>}</td>
                      <td className="px-4 py-2">{c.cognome || <span className="text-red-400">mancante</span>}</td>
                      <td className="px-4 py-2 text-gray-500">{c.email}</td>
                      <td className="px-4 py-2 text-gray-500">{c.telefono}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex gap-3 justify-end mt-4">
              <button type="button" onClick={() => { setShowImport(false); setCsvPreview([]) }} className="btn-secondary">Annulla</button>
              <button type="button" onClick={handleImport} disabled={importing} className="btn-primary">
                {importing ? 'Importazione...' : `Importa ${csvPreview.length} clienti`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}