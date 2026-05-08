import { createBrowserRouter, Navigate } from 'react-router-dom'
import { Login } from './pages/Login'
import { Mapa } from './pages/mapa/Mapa'
import { RankingPage } from './pages/ranking/Ranking'
import { EstadosList } from './pages/estados/EstadosList'
import { EstadoForm } from './pages/estados/EstadoForm'
import { MunicipiosList } from './pages/municipios/MunicipiosList'
import { MunicipioForm } from './pages/municipios/MunicipioForm'
import { UsuariosList } from './pages/usuarios/UsuariosList'
import { UsuarioForm } from './pages/usuarios/UsuarioForm'
import { TemasList } from './pages/temas/TemasList'
import { TemaForm } from './pages/temas/TemaForm'
import { OdsList } from './pages/ods/OdsList'
import { OdsForm } from './pages/ods/OdsForm'
import { IndicadoresList } from './pages/indicadores/IndicadoresList'
import { IndicadorForm } from './pages/indicadores/IndicadorForm'
import { ProtectedRoute } from './components/ProtectedRoute'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Mapa />,
  },
  {
    path: '/ranking',
    element: <RankingPage />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/admin',
    element: <Navigate to="/admin/indicadores" replace />,
  },
  {
    path: '/admin/indicadores',
    element: (
      <ProtectedRoute>
        <IndicadoresList />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/indicadores/novo',
    element: (
      <ProtectedRoute>
        <IndicadorForm mode="create" />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/indicadores/:id/editar',
    element: (
      <ProtectedRoute>
        <IndicadorForm mode="edit" />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/temas',
    element: (
      <ProtectedRoute>
        <TemasList />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/temas/novo',
    element: (
      <ProtectedRoute>
        <TemaForm mode="create" />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/temas/:id/editar',
    element: (
      <ProtectedRoute>
        <TemaForm mode="edit" />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/ods',
    element: (
      <ProtectedRoute>
        <OdsList />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/ods/novo',
    element: (
      <ProtectedRoute>
        <OdsForm mode="create" />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/ods/:id/editar',
    element: (
      <ProtectedRoute>
        <OdsForm mode="edit" />
      </ProtectedRoute>
    ),
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
    path: '/admin/usuarios',
    element: (
      <ProtectedRoute>
        <UsuariosList />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/usuarios/novo',
    element: (
      <ProtectedRoute>
        <UsuarioForm mode="create" />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/usuarios/:id/editar',
    element: (
      <ProtectedRoute>
        <UsuarioForm mode="edit" />
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])
