import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Search, Plus, UserPlus, Calendar, Target, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Patient {
  id: string;
  nome: string;
  email: string;
  whatsapp: string;
  objetivos: string[] | null;
  objetivo_texto: string | null;
  consultas: {
    data_consulta: string;
  }[];
}

export const PacientesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPatients() {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('pacientes')
          .select(`
            id,
            nome,
            email,
            whatsapp,
            objetivos,
            objetivo_texto,
            consultas (
              data_consulta
            )
          `)
          .eq('nutricionista_id', user.id)
          .order('nome', { ascending: true });

        if (error) throw error;
        if (data) setPatients(data as unknown as Patient[]);
      } catch (err) {
        console.error('Erro ao buscar pacientes:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPatients();
  }, [user]);

  const filteredPatients = patients.filter(patient =>
    patient.nome.toLowerCase().includes(search.toLowerCase())
  );

  const getLastConsultDate = (patient: Patient) => {
    const consults = patient.consultas || [];
    if (consults.length === 0) return 'Sem consultas';
    
    // Sort descending by date
    const sorted = [...consults].sort((a, b) =>
      new Date(b.data_consulta).getTime() - new Date(a.data_consulta).getTime()
    );
    return new Date(sorted[0].data_consulta).toLocaleDateString('pt-BR');
  };

  const getPatientObjectives = (patient: Patient) => {
    const list = patient.objetivos || [];
    if (list.length > 0) {
      return list.join(', ');
    }
    return patient.objetivo_texto || 'Não informado';
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', color: 'var(--primary-color)' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--primary-light)', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-color)', marginBottom: '6px' }}>Meus Pacientes</h2>
          <p style={{ color: 'var(--text-muted)' }}>Lista de pacientes sob seu acompanhamento profissional.</p>
        </div>
        <button 
          onClick={() => navigate('/pacientes/novo')}
          className="btn-primary" 
          style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}
        >
          <Plus size={18} />
          <span>Novo Paciente</span>
        </button>
      </div>

      {patients.length === 0 ? (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #f3f4f6', padding: '60px 20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', textAlign: 'center' }}>
          <div style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary-color)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <UserPlus size={32} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>Nenhum paciente cadastrado ainda</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '360px', margin: '0 auto 24px', fontSize: '0.95rem' }}>
            Cadastre seu primeiro paciente para começar a registrar consultas e planejar dietas.
          </p>
          <button 
            onClick={() => navigate('/pacientes/novo')}
            className="btn-primary" 
            style={{ width: 'auto', padding: '12px 24px' }}
          >
            Cadastrar Paciente
          </button>
        </div>
      ) : (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #f3f4f6', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          {/* Campo de Busca por Nome */}
          <div style={{ position: 'relative', marginBottom: '24px', maxWidth: '400px' }}>
            <Search style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
            <input
              type="text"
              placeholder="Buscar paciente por nome..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '44px' }}
            />
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f3f4f6', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
                  <th style={{ padding: '12px 16px' }}>NOME</th>
                  <th style={{ padding: '12px 16px' }}>OBJETIVO</th>
                  <th style={{ padding: '12px 16px' }}>ÚLTIMA CONSULTA</th>
                  <th style={{ padding: '12px 16px', width: '80px' }}></th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map(patient => (
                  <tr 
                    key={patient.id} 
                    onClick={() => navigate(`/pacientes/${patient.id}`)}
                    style={{ borderBottom: '1px solid #f3f4f6', fontSize: '0.95rem', cursor: 'pointer' }} 
                    className="table-row-hover"
                  >
                    <td style={{ padding: '16px', fontWeight: 600, color: 'var(--text-color)' }}>
                      {patient.nome}
                    </td>
                    <td style={{ padding: '16px', color: 'var(--text-muted)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Target size={14} style={{ color: 'var(--primary-color)', flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '280px' }}>
                          {getPatientObjectives(patient)}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '16px', color: 'var(--text-muted)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={14} style={{ color: '#0284c7', flexShrink: 0 }} />
                        <span>{getLastConsultDate(patient)}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <span style={{ color: 'var(--primary-color)', display: 'inline-flex', alignItems: 'center' }}>
                        <ArrowRight size={16} />
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredPatients.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      Nenhum paciente encontrado com o nome "{search}".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
