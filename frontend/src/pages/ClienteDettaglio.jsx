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

  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    loadCliente()
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

  if (loading) return <div className="p-8">Caricamento...</div>
  if (!cliente) return null

  return (
    <div className="p-8">
      <button onClick={() => navigate('/clienti')} className="p-2 hover:bg-gray-100 rounded-lg">
        <ArrowLeftIcon className="w-5 h-5" />
      </button>
      <h1 className="text-2xl font-bold mt-4">{cliente.nome} {cliente.cognome}</h1>
      <p>{cliente.email}</p>
    </div>
  )
}
