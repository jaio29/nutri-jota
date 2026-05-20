import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Leaf, LayoutDashboard, Users, LogOut, User } from 'lucide-react';

export const Layout = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<{ nome: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('nutricionistas')
          .select('nome')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        if (data) setProfile(data);
      } catch (err) {
        console.error('Erro ao carregar perfil da nutricionista:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (err) {
      console.error('Erro ao sair:', err);
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Fixa */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>
            <Leaf size={24} fill="currentColor" />
            <span>Nutri Jota</span>
          </h1>
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/pacientes"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Users size={20} />
            <span>Pacientes</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary-color)', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={16} />
              </div>
              <div className="user-name" title={profile?.nome || 'Nutricionista'}>
                {loading ? 'Carregando...' : (profile?.nome || 'Nutricionista')}
              </div>
            </div>
            <div className="user-email" title={user?.email || ''}>
              {user?.email}
            </div>
          </div>
          <button onClick={handleSignOut} className="btn-logout">
            <LogOut size={16} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Área Principal de Conteúdo */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};
