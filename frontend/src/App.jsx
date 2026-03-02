import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Clienti from './pages/Clienti.jsx'
import Attivita from './pages/Attivita.jsx'
import Trattative from './pages/Trattative.jsx'
import Profilo from './pages/Profilo.jsx'
import Agenda from './pages/Agenda.jsx'
import TodoList from './pages/TodoList.jsx'
import Progetti from './pages/Progetti.jsx'
import Verifiche from './pages/Verifiche.jsx'
import Layout from './components/Layout.jsx'

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" />
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="clienti" element={<Clienti />} />
          <Route path="attivita" element={<Attivita />} />
          <Route path="trattative" element={<Trattative />} />
          <Route path="profilo" element={<Profilo />} />
                        <Route path="agenda" element={<Agenda />} />
                        <Route path="todo" element={<TodoList />} />
                        <Route path="progetti" element={<Progetti />} />
                    <Route path="verifiche" element={<Verifiche />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}
