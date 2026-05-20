import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { PacientesPage } from './pages/PacientesPage';
import { PacienteDetalhesPage } from './pages/PacienteDetalhesPage';
import { PacienteCadastroPage } from './pages/PacienteCadastroPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/pacientes" element={<PacientesPage />} />
              <Route path="/pacientes/novo" element={<PacienteCadastroPage />} />
              <Route path="/pacientes/:id/editar" element={<PacienteCadastroPage />} />
              <Route path="/pacientes/:id" element={<PacienteDetalhesPage />} />
            </Route>
          </Route>

          {/* Default Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
