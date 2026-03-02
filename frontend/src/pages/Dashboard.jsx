import { useState, useEffect } from 'react'
import axios from 'axios'
import { UsersIcon, BriefcaseIcon, ClipboardDocumentListIcon, CurrencyEuroIcon } from '@heroicons/react/24/outline'

const stats = [
  { label: 'Clienti Totali', value: '-', icon: UsersIcon, color: 'bg-blue-500' },
  { label: 'Trattative Aperte', value: '-', icon: BriefcaseIcon, color: 'bg-green-500' },
  { label: 'Attivita Oggi', value: '-', icon: ClipboardDocumentListIcon, color: 'bg-yellow-500' },
  { label: 'AUM Totale', value: '-', icon: CurrencyEuroIcon, color: 'bg-purple-500' },
]

export default function Dashboard() {
  const [data, setData] = useState(stats)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const headers = { Authorization: `Bearer ${token}` }
    Promise.all([
      axios.get('/api/clienti/count', { headers }).catch(() => ({ data: { count: 0 } })),
      axios.get('/api/trattative/count', { headers }).catch(() => ({ data: { count: 0 } })),
      axios.get('/api/attivita/today', { headers }).catch(() => ({ data: { count: 0 } })),
    ]).then(([clienti, trattative, attivita]) => {
      setData([
        { ...stats[0], value: clienti.data.count },
        { ...stats[1], value: trattative.data.count },
        { ...stats[2], value: attivita.data.count },
        { ...stats[3], value: 'N/A' },
      ])
    })
  }, [])

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-500 mt-1">Benvenuto nel tuo CRM</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {data.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card">
            <div className="flex items-center gap-4">
              <div className={`${color} p-3 rounded-xl`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Attivita Recenti</h3>
        <p className="text-gray-400 text-sm">Nessuna attivita recente da mostrare.</p>
      </div>
    </div>
  )
}
