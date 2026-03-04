import { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { MagnifyingGlassIcon, PlusIcon, ArrowUpTrayIcon, EyeIcon } from '@heroicons/react/24/outline'
import * as XLSX from 'xlsx'

const API = import.meta.env.VITE_API_URL

export default function Clienti() {
  const navigate = useNavigate()
  const [clienti, setClienti] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [importPreview, setImportPreview] = useState([])
  const [importRows, setImportRows] = useState([])
  const [importing, setImporting] = useState(false)
  const [form, setForm] = useState({ nome: '', cognome: '', email: '', telefono: '', note: '' })

  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  const fetchClienti = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`${API}/api/clienti`, { headers })
      setClienti(res.data)
    } catch {
      toast.error('Errore nel caricamento')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClienti()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`${API}/api/clienti`, form, { headers })
      toast.success('Cliente aggiunto!')
      setShowForm(false)
      setForm({ nome: '', cognome: '', email: '', telefono: '', note: '' })
      fetchClienti()
    } catch {
      toast.error('Errore nel salvataggio')
    }
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const fileName = file.name.toLowerCase()
    const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls')

    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        let rows = []
        if (isExcel) {
          const data = new Uint8Array(ev.target.result)
          const workbook = XLSX.read(data, { type: 'array' })
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
          const json = XLSX.utils.sheet_to_json(firstSheet)

          const colonneAccettate = {
            nome: ['nome', 'name'],
            cognome: ['cognome', 'surname', 'last name'],
            email: ['email', 'e-mail', 'mail'],
            telefono: ['telefono', 'tel', 'phone', 'cellulare'],
            note: ['note', 'notes', 'descrizione']
          }

          rows = json.map(row => {
            const normalizedRow = {}
            Object.keys(row).forEach(key => {
              const lowerKey = key.toLowerCase().trim()
              for (const [campo, alias] of Object.entries(colonneAccettate)) {
                if (alias.includes(lowerKey)) normalizedRow[campo] = row[key]
              }
            })
            return {
              nome: normalizedRow.nome || '',
              cognome: normalizedRow.cognome || '',
              email: normalizedRow.email || '',
              telefono: normalizedRow.telefono || '',
              note: normalizedRow.note || ''
            }
          }).filter(r => r.nome || r.cognome)

        } else {
          const text = ev.target.result
          const lines = text.split(/\r?
/).filter(l => l.trim())
          if (lines.length < 2) throw new Error('File CSV non valido')

          const separator = lines[0].includes(';') ? ';' : ','
          const rawHeaders = lines[0].split(separator).map(h => h.trim().toLowerCase().replace(/["\s]/g, ''))
          
          const mappa = {}
          rawHeaders.forEach((h, i) => {
            if (h.includes('nome')) mappa.nome = i
            if (h.includes('cognome')) mappa.cognome = i
            if (h.includes('email')) mappa.email = i
            if (h.includes('tel') || h.includes('phone')) mappa.telefono = i
            if (h.includes('note')) mappa.note = i
          })

          rows = lines.slice(1).map(line => {
            const cols = line.split(separator).map(c => c.trim().replace(/"/g, ''))
            return {
              nome: mappa.nome !== undefined ? cols[mappa.nome] || '' : '',
              cognome: mappa.cognome !== undefined ? cols[mappa.cognome] || '' : '',
              email: mappa.email !== undefined ? cols[mappa.email] || '' : '',
              telefono: mappa.telefono !== undefined ? cols[mappa.telefono] || '' : '',
              note: mappa.note !== undefined ? cols[mappa.note] || '' : ''
            }
          }).filter(r => r.nome || r.cognome)
        }

        if (rows.length === 0) {
          toast.error('Nessun dato valido trovato nel file')
          return
        }

        setImportRows(rows)
        setImportPreview(rows.slice(0, 5))
        setShowImport(true)
      } catch (err) {
        toast.error('Errore nella lettura del file')
      }
    }

    if (isExcel) {
      reader.readAsArrayBuffer(file)
    } else {
      reader.readAsText(file)
    }
  }

  const handleImportConfirm = async () => {
    setImporting(true)
    let ok = 0, err = 0
    for (const row of importRows) {
      try {
        await axios.post(`${API}/api/clienti`, row, { headers })
        ok++
      } catch {
        err++
      }
    }
    setImporting(false)
    setShowImport(false)
    setImportRows([])
    setImportPreview([])
    toast.success(`Importati ${ok} clienti${err > 0 ? `, ${err} errori` : ''}`)
    fetchClienti()
  }

  const filtered = clienti.filter(c => 
    `${c.nome} ${c.cognome} ${c.email}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Clienti</h1>
        <div className="flex gap-2">
          <label className="btn-secondary flex items-center gap-1 text-sm cursor-pointer">
            <ArrowUpTrayIcon className="w-4 h-4" />
            Importa Excel/CSV
            <input 
              type="file" 
              accept=".csv, .xlsx, .xls" 
              className="hidden" 
              onChange={handleFileChange} 
            />
          </label>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="btn-primary flex items-center gap-1 text-sm"
          >
            <PlusIcon className="w-4 h-4" />
            Nuovo Cliente
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card mb-6 animate-in slide-in-from-top duration-300">
          <h2 className="text-lg font-semibold mb-4">Nuovo Cliente</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              className="input-field"
              placeholder="Nome"
              value={form.nome}
              onChange={(e) => setForm({...form, nome: e.target.value})}
              required
            />
            <input 
              className="input-field"
              placeholder="Cognome"
              value={form.cognome}
              onChange={(e) => setForm({...form, cognome: e.target.value})}
            />
            <input 
              className="input-field"
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({...form, email: e.target.value})}
            />
            <input 
              className="input-field"
              placeholder="Telefono"
              value={form.telefono}
              onChange={(e) => setForm({...form, telefono: e.target.value})}
            />
            <textarea 
              className="input-field col-span-2"
              placeholder="Note"
              value={form.note}
              onChange={(e) => setForm({...form, note: e.target.value})}
              rows={3}
            />
            <div className="col-span-2 flex gap-2">
              <button type="submit" className="btn-primary">Salva</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Annulla</button>
            </div>
          </form>
        </div>
      )}

      {showImport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Anteprima importazione ({importRows.length} clienti)</h2>
            <div className="overflow-auto max-h-64 mb-4">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2">Nome</th>
                    <th className="px-3 py-2">Cognome</th>
                    <th className="px-3 py-2">Email</th>
                    <th className="px-3 py-2">Telefono</th>
                  </tr>
                </thead>
                <tbody>
                  {importPreview.map((r, i) => (
                    <tr key={i} className="border-t">
                      <td className="px-3 py-2">{r.nome}</td>
                      <td className="px-3 py-2">{r.cognome}</td>
                      <td className="px-3 py-2">{r.email}</td>
                      <td className="px-3 py-2">{r.telefono}</td>
                    </tr>
                  ))}
                  {importRows.length > 5 && (
                    <tr><td colSpan={4} className="px-3 py-2 text-gray-400 text-center">... e altri {importRows.length - 5} clienti</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex gap-2 justify-end">
              <button 
                onClick={() => { setShowImport(false); setImportRows([]); setImportPreview([]) }} 
                className="btn-secondary"
              >
                Annulla
              </button>
              <button 
                onClick={handleImportConfirm} 
                disabled={importing}
                className="btn-primary"
              >
                {importing ? 'Importazione...' : `Importa ${importRows.length} clienti`}
              </button>
            </div>
          </div>
        </div>
      )}

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
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">Nessun cliente trovato</td></tr>
              ) : (
                filtered.map((c) => (
                  <tr 
                    key={c.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/clienti/${c.id}`)}
                  >
                    <td className="px-6 py-4 font-medium">{c.nome} {c.cognome}</td>
                    <td className="px-6 py-4 text-gray-500">{c.email}</td>
                    <td className="px-6 py-4 text-gray-500">{c.telefono}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/clienti/${c.id}`)
                        }}
                        className="btn-secondary py-1 px-3 text-xs flex items-center gap-1 ml-auto"
                      >
                        <EyeIcon className="w-3 h-3" />
                        Vedi/Modifica
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
