import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Users, Calendar, Clock, ArrowRight, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Patient {
  id: string;
  nome: string;
  consultas: {
    data_consulta: string;
    proximo_retorno: string | null;
  }[];
}

export const DashboardPage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<{ nome: string } | null>(null);
  const [stats, setStats] = useState({
    totalPatients: 0,
    weeklyConsults: 0,
  });
  const [missingReturnPatients, setMissingReturnPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper to calculate the start and end of the current week (Monday to Sunday)
  const getWeekRange = () => {
    const now = new Date();
    const day = now.getDay(); // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
    
    // Difference to Monday: if Sunday (0), we go back 6 days, otherwise we go back (day - 1) days
    const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1);
    
    const monday = new Date(now.setDate(diffToMonday));
    monday.setHours(0, 0, 0, 0);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    
    const format = (d: Date) => d.toISOString().split('T')[0];
    return { start: format(monday), end: format(sunday) };
  };

  useEffect(() => {
    async function fetchDashboardData() {
      if (!user) return;
      
      try {
        setLoading(true);

        // 1. Fetch nutritionist profile (for the personalized greeting)
        const { data: profileData } = await supabase
          .from('nutricionistas')
          .select('nome')
          .eq('id', user.id)
          .single();
        
        if (profileData) setProfile(profileData);

        // 2. Fetch Card 1 - Total Patients count
        const { count: patientsCount, error: patientsCountError } = await supabase
          .from('pacientes')
          .select('*', { count: 'exact', head: true })
          .eq('nutricionista_id', user.id);

        if (patientsCountError) throw patientsCountError;

        // 3. Fetch Card 2 - Consults of the current week
        const { start: weekStart, end: weekEnd } = getWeekRange();
        
        const { data: weeklyConsultations, error: consultsError } = await supabase
          .from('consultas')
          .select('id, pacientes!inner(nutricionista_id)')
          .eq('pacientes.nutricionista_id', user.id)
          .gte('data_consulta', weekStart)
          .lte('data_consulta', weekEnd);

        if (consultsError) throw consultsError;

        // 4. Fetch Card 3 - Patients without return (last consult > 30 days, no upcoming return)
        const { data: patientsList, error: listError } = await supabase
          .from('pacientes')
          .select(`
            id,
            nome,
            consultas (
              data_consulta,
              proximo_retorno
            )
          `)
          .eq('nutricionista_id', user.id);

        if (listError) throw listError;

        // Process missing returns in memory
        const todayStr = new Date().toISOString().split('T')[0];
        
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

        const missingReturns = (patientsList as unknown as Patient[])
          .map(patient => {
            const consults = patient.consultas || [];
            if (consults.length === 0) return null; // No consultation, exclude

            // Find latest consultation
            const sorted = [...consults].sort((a, b) => 
              new Date(b.data_consulta).getTime() - new Date(a.data_consulta).getTime()
            );
            const latest = sorted[0];

            // Check if latest consultation was > 30 days ago
            const isLastConsultationOld = latest.data_consulta < thirtyDaysAgoStr;

            // Check if there is an upcoming return scheduled (on or after today)
            const hasFutureReturn = latest.proximo_retorno && latest.proximo_retorno >= todayStr;

            if (isLastConsultationOld && !hasFutureReturn) {
              return {
                id: patient.id,
                nome: patient.nome,
                data_consulta: latest.data_consulta,
              };
            }
            return null;
          })
          .filter(Boolean); // Remove null entries

        setStats({
          totalPatients: patientsCount || 0,
          weeklyConsults: weeklyConsultations?.length || 0,
        });
        
        setMissingReturnPatients(missingReturns);

      } catch (err) {
        console.error('Erro ao carregar dados do dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', color: 'var(--primary-color)' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--primary-light)', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  const firstName = profile?.nome ? profile.nome.split(' ')[0] : 'Nutricionista';

  return (
    <div>
      {/* Cabeçalho de Boas-Vindas */}
      <div className="dashboard-header">
        <h2>Olá, {firstName}! 👋</h2>
        <p>Bem-vinda de volta ao seu painel de controle do Nutri Jota.</p>
      </div>

      {/* Grid de Estatísticas (Cards 1 e 2) */}
      <div className="stats-grid">
        {/* Card 1: Total de pacientes ativos */}
        <div className="stat-card">
          <div className="stat-icon patients">
            <Users size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total de Pacientes</span>
            <span className="stat-value">{stats.totalPatients}</span>
          </div>
        </div>

        {/* Card 2: Consultas da semana */}
        <div className="stat-card">
          <div className="stat-icon consults">
            <Calendar size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Consultas da Semana</span>
            <span className="stat-value">{stats.weeklyConsults}</span>
          </div>
        </div>

        {/* Card Auxiliar de Retornos Pendentes */}
        <div className="stat-card">
          <div className="stat-icon missing-return">
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Sem Retorno</span>
            <span className="stat-value">{missingReturnPatients.length}</span>
          </div>
        </div>
      </div>

      {/* Card 3: Seção de Pacientes sem Retorno */}
      <div className="dashboard-section">
        <div className="section-header">
          <h3>Pacientes sem retorno</h3>
          <p>Pacientes cuja última consulta foi há mais de 30 dias e não possuem retorno agendado.</p>
        </div>

        {missingReturnPatients.length > 0 ? (
          <div className="patient-list">
            {missingReturnPatients.map((patient) => (
              <div key={patient.id} className="patient-item">
                <Link to={`/pacientes/${patient.id}`} className="patient-item-link">
                  <span className="patient-name">{patient.nome}</span>
                  <span className="patient-last-consult">
                    Última consulta em: {new Date(patient.data_consulta).toLocaleDateString('pt-BR')}
                  </span>
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="badge-alert">Mais de 30 dias</span>
                  <Link to={`/pacientes/${patient.id}`} style={{ color: 'var(--primary-color)', display: 'flex', alignItems: 'center' }}>
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <AlertCircle size={36} style={{ color: 'var(--text-muted)' }} />
            <p>Nenhum paciente sem retorno no momento</p>
          </div>
        )}
      </div>
    </div>
  );
};
