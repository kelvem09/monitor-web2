import { createBrowserRouter, Navigate } from 'react-router-dom'
import { Login } from './pages/Login'
import { Mapa } from './pages/mapa/Mapa'
import { EstadosList } from './pages/estados/EstadosList'
import { EstadoForm } from './pages/estados/EstadoForm'
import { MunicipiosList } from './pages/municipios/MunicipiosList'
import { MunicipioForm } from './pages/municipios/MunicipioForm'
import { ProtectedRoute } from './components/ProtectedRoute'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Mapa />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/admin',
    element: <Navigate to="/admin/estados" replace />,
  },
  {
    path: '/admin/estados',
    element: (
      <ProtectedRoute>
        <EstadosList />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/estados/novo',
    element: (
      <ProtectedRoute>
        <EstadoForm mode="create" />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/estados/:id/editar',
    element: (
      <ProtectedRoute>
        <EstadoForm mode="edit" />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/municipios',
    element: (
      <ProtectedRoute>
        <MunicipiosList />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/municipios/novo',
    element: (
      <ProtectedRoute>
        <MunicipioForm mode="create" />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/municipios/:id/editar',
    element: (
      <ProtectedRoute>
        <MunicipioForm mode="edit" />
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])
