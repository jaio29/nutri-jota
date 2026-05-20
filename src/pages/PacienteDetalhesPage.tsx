import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, User, Phone, Mail, Calendar, Ruler, Weight, Activity, Plus, FileText, Edit } from 'lucide-react';

export const PacienteDetalhesPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [patient, setPatient] = useState<any | null>(null);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPatientData() {
      if (!user || !id) return;
      try {
        // Fetch patient
        const { data: patientData, error: patientError } = await supabase
          .from('pacientes')
          .select('*')
          .eq('id', id)
          .eq('nutricionista_id', user.id)
          .single();

        if (patientError) throw patientError;
        setPatient(patientData);

        // Fetch consultations
        const { data: consultData, error: consultError } = await supabase
          .from('consultas')
          .select('*')
          .eq('paciente_id', id)
          .order('data_consulta', { ascending: false });

        if (consultError) throw consultError;
        setConsultations(consultData || []);
      } catch (err) {
        console.error('Erro ao buscar dados do paciente:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPatientData();
  }, [id, user]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', color: 'var(--primary-color)' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--primary-light)', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <h3>Paciente não encontrado</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>O paciente que você está procurando não existe ou não pertence à sua conta.</p>
        <Link to="/dashboard" className="btn-primary" style={{ display: 'inline-flex', width: 'auto', padding: '10px 20px', alignItems: 'center', gap: '8px' }}>
          <ArrowLeft size={16} />
          Voltar ao Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Botão Voltar */}
      <div style={{ marginBottom: '24px' }}>
        <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500, transition: 'var(--transition)' }} className="back-link">
          <ArrowLeft size={18} />
          <span>Voltar ao Dashboard</span>
        </Link>
      </div>

      {/* Cabeçalho do Perfil */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #f3f4f6', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', marginBottom: '32px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-start' }}>
          <div style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary-color)', width: '72px', height: '72px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={36} />
          </div>
          <div style={{ flex: 1, minWidth: '240px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-color)', marginBottom: '8px' }}>{patient.nome}</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px 24px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mail size={16} />
                  <span>{patient.email}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Phone size={16} />
                  <span>{patient.whatsapp || 'Sem celular'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={16} />
                  <span>Nasc: {patient.data_nascimento ? new Date(patient.data_nascimento).toLocaleDateString('pt-BR') : '-'}</span>
                </div>
              </div>
            </div>
            <Link 
              to={`/pacientes/${patient.id}/editar`} 
              className="btn-secondary" 
              style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontSize: '0.9rem', cursor: 'pointer' }}
            >
              <Edit size={16} />
              <span>Editar Perfil</span>
            </Link>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
        {/* Coluna Esquerda: Dados de Entrada */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Informações Antropométricas Iniciais */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #f3f4f6', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={18} className="text-primary" style={{ color: 'var(--primary-color)' }} />
              Medidas Iniciais
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ border: '1px solid #f3f4f6', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                <Weight size={20} style={{ color: 'var(--primary-color)', marginBottom: '8px' }} />
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Peso Inicial</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{patient.peso_inicial ? `${patient.peso_inicial} kg` : '-'}</div>
              </div>
              <div style={{ border: '1px solid #f3f4f6', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                <Ruler size={20} style={{ color: 'var(--primary-color)', marginBottom: '8px' }} />
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Altura</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{patient.altura ? `${patient.altura} m` : '-'}</div>
              </div>
            </div>
          </div>

          {/* Objetivos e Restrições */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #f3f4f6', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px' }}>Objetivos e Anamnese</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>Objetivos</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {patient.objetivos && patient.objetivos.length > 0 ? (
                    patient.objetivos.map((obj: string, i: number) => (
                      <span key={i} style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary-color)', fontSize: '0.75rem', fontWeight: 600, padding: '4px 10px', borderRadius: '9999px' }}>
                        {obj}
                      </span>
                    ))
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{patient.objetivo_texto || 'Não informado'}</span>
                  )}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>Alergias / Restrições</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {((patient.alergias && patient.alergias.length > 0) || (patient.restricoes_alimentares && patient.restricoes_alimentares.length > 0)) ? (
                    <>
                      {patient.alergias?.map((al: string, i: number) => (
                        <span key={`al-${i}`} style={{ backgroundColor: '#fee2e2', color: '#ef4444', fontSize: '0.75rem', fontWeight: 600, padding: '4px 10px', borderRadius: '9999px' }}>
                          Alergia: {al}
                        </span>
                      ))}
                      {patient.restricoes_alimentares?.map((res: string, i: number) => (
                        <span key={`res-${i}`} style={{ backgroundColor: '#ffedd5', color: '#ea580c', fontSize: '0.75rem', fontWeight: 600, padding: '4px 10px', borderRadius: '9999px' }}>
                          Restrição: {res}
                        </span>
                      ))}
                    </>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Nenhuma alergia ou restrição registrada.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Coluna Direita: Histórico de Consultas */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #f3f4f6', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Histórico de Consultas</h3>
            <button className="btn-primary" style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '0.85rem' }}>
              <Plus size={14} />
              Registrar Consulta
            </button>
          </div>

          {consultations.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {consultations.map((consult) => (
                <div key={consult.id} style={{ border: '1px solid #f3f4f6', padding: '16px', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: 'var(--text-color)' }}>
                      <Calendar size={16} style={{ color: 'var(--primary-color)' }} />
                      <span>{new Date(consult.data_consulta).toLocaleDateString('pt-BR')}</span>
                    </div>
                    {consult.proximo_retorno && (
                      <span style={{ fontSize: '0.75rem', backgroundColor: 'var(--primary-light)', color: 'var(--primary-color)', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                        Retorno: {new Date(consult.proximo_retorno).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', fontSize: '0.85rem', marginBottom: '12px', backgroundColor: '#f9fafb', padding: '10px', borderRadius: '6px', textAlign: 'center' }}>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Peso</div>
                      <div style={{ fontWeight: 600 }}>{consult.peso ? `${consult.peso} kg` : '-'}</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Cintura</div>
                      <div style={{ fontWeight: 600 }}>{consult.cintura ? `${consult.cintura} cm` : '-'}</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Quadril</div>
                      <div style={{ fontWeight: 600 }}>{consult.quadril ? `${consult.quadril} cm` : '-'}</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>% Gord.</div>
                      <div style={{ fontWeight: 600 }}>{consult.percentual_gordura ? `${consult.percentual_gordura}%` : '-'}</div>
                    </div>
                  </div>
                  {consult.observacoes && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', borderTop: '1px solid #f3f4f6', paddingTop: '8px', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                      <FileText size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
                      <span>{consult.observacoes}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '40px 20px', border: '1px dashed #f3f4f6', borderRadius: '8px' }}>
              <Calendar size={32} style={{ color: 'var(--text-muted)' }} />
              <p style={{ fontSize: '0.9rem', margin: 0 }}>Nenhuma consulta registrada para este paciente.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
