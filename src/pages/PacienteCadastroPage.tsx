import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { User, Activity, Clock, X, ArrowLeft, ArrowRight, Save, Check } from 'lucide-react';

export const PacienteCadastroPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  // Active Tab State: 1 = Pessoal, 2 = Clínico, 3 = Hábitos
  const [activeTab, setActiveTab] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingPatient, setLoadingPatient] = useState(isEditMode);

  // Form State - Aba 1: Pessoal
  const [nome, setNome] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [sexo, setSexo] = useState('');
  const [telefone, setTelefone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [calculatedAge, setCalculatedAge] = useState<number | null>(null);

  // Form State - Aba 2: Clínico
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [imc, setImc] = useState<number | null>(null);
  const [selectedObjetivos, setSelectedObjetivos] = useState<string[]>([]);
  const [objetivoTexto, setObjetivoTexto] = useState('');
  const [nivelAtividade, setNivelAtividade] = useState('');
  
  const [selectedPatologias, setSelectedPatologias] = useState<string[]>([]);
  const [customPatologia, setCustomPatologia] = useState('');
  
  const [selectedRestricoes, setSelectedRestricoes] = useState<string[]>([]);
  const [customRestricao, setCustomRestricao] = useState('');
  
  const [selectedAlergias, setSelectedAlergias] = useState<string[]>([]);
  const [customAlergia, setCustomAlergia] = useState('');

  const [medicamentos, setMedicamentos] = useState('');
  const [suplementos, setSuplementos] = useState('');

  // Form State - Aba 3: Hábitos
  const [refeicoesPorDia, setRefeicoesPorDia] = useState('');
  const [horarioAcordaInput, setHorarioAcordaInput] = useState('');
  const [horarioDormeInput, setHorarioDormeInput] = useState('');
  const [litrosAgua, setLitrosAgua] = useState('');
  const [praticaAtividade, setPraticaAtividade] = useState('Não');
  const [atividadeDescricao, setAtividadeDescricao] = useState('');
  const [observacoes, setObservacoes] = useState('');

  // Auto-calculate Age
  useEffect(() => {
    if (!dataNascimento) {
      setCalculatedAge(null);
      return;
    }
    const birthDate = new Date(dataNascimento);
    if (isNaN(birthDate.getTime())) {
      setCalculatedAge(null);
      return;
    }
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    setCalculatedAge(age);
  }, [dataNascimento]);

  // Auto-calculate IMC
  useEffect(() => {
    const w = parseFloat(peso);
    const h = parseFloat(altura);
    if (isNaN(w) || isNaN(h) || h === 0) {
      setImc(null);
      return;
    }
    const heightInMeters = h / 100;
    const computedImc = w / (heightInMeters * heightInMeters);
    setImc(parseFloat(computedImc.toFixed(2)));
  }, [peso, altura]);

  // Load patient data if editing
  useEffect(() => {
    async function loadPatientData() {
      if (!isEditMode || !id || !user) return;
      try {
        const { data, error } = await supabase
          .from('pacientes')
          .select('*')
          .eq('id', id)
          .eq('nutricionista_id', user.id)
          .single();

        if (error) throw error;
        if (data) {
          setNome(data.nome || '');
          setDataNascimento(data.data_nascimento || '');
          setSexo(data.sexo || '');
          setTelefone(data.telefone || '');
          setWhatsapp(data.whatsapp || '');
          setEmail(data.email || '');
          
          setPeso(data.peso_inicial !== null ? String(data.peso_inicial) : '');
          setAltura(data.altura !== null ? String(data.altura) : '');
          setSelectedObjetivos(data.objetivos || []);
          setObjetivoTexto(data.objetivo_texto || '');
          setNivelAtividade(data.nivel_atividade || '');
          
          setSelectedPatologias(data.patologias || []);
          setSelectedRestricoes(data.restricoes_alimentares || []);
          setSelectedAlergias(data.alergias || []);
          
          setMedicamentos(data.medicamentos || '');
          setSuplementos(data.suplementos || '');
          
          setRefeicoesPorDia(data.refeicoes_por_dia !== null ? String(data.refeicoes_por_dia) : '');
          setHorarioAcordaInput(data.horario_acorda ? data.horario_acorda.replace(':', '') : '');
          setHorarioDormeInput(data.horario_dorme ? data.horario_dorme.replace(':', '') : '');
          setLitrosAgua(data.litros_agua !== null ? String(data.litros_agua) : '');
          setPraticaAtividade(data.atividade_fisica ? 'Sim' : 'Não');
          setAtividadeDescricao(data.atividade_fisica_descricao || '');
          setObservacoes(data.observacoes || '');
        }
      } catch (err) {
        console.error('Erro ao carregar dados do paciente:', err);
        setError('Não foi possível carregar os dados do paciente para edição.');
      } finally {
        setLoadingPatient(false);
      }
    }
    loadPatientData();
  }, [id, isEditMode, user]);

  // Phone and WhatsApp formatter
  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length === 0) return '';
    if (numbers.length <= 2) return `(${numbers}`;
    if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'tel' | 'whats') => {
    const formatted = formatPhoneNumber(e.target.value);
    if (type === 'tel') setTelefone(formatted);
    else setWhatsapp(formatted);
  };

  // Convert Time helper
  const convertToTimeFormat = (val: string): string => {
    if (!val) return '';
    const numStr = val.replace(/\D/g, '');
    if (!numStr) return '';
    
    const num = parseInt(numStr, 10);
    let hours = 0;
    let minutes = 0;
    
    if (numStr.length <= 2) {
      hours = num;
    } else {
      hours = Math.floor(num / 100);
      minutes = num % 100;
    }
    
    hours = Math.min(Math.max(hours, 0), 23);
    minutes = Math.min(Math.max(minutes, 0), 59);
    
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}`;
  };

  // Handle Multi-Select Categories with "Nenhum" exclusion
  const handleCategorySelection = (
    item: string, 
    selectedList: string[], 
    setSelectedList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (item === 'Nenhum') {
      // If "Nenhum" is selected, clear everything else and just keep "Nenhum"
      if (selectedList.includes('Nenhum')) {
        setSelectedList([]);
      } else {
        setSelectedList(['Nenhum']);
      }
      return;
    }

    // If a normal option is clicked, filter out "Nenhum" and toggle option
    let newList = selectedList.filter(x => x !== 'Nenhum');
    if (newList.includes(item)) {
      newList = newList.filter(x => x !== item);
    } else {
      newList.push(item);
    }
    setSelectedList(newList);
  };

  // Custom Tag Helpers
  const addCustomTag = (
    value: string, 
    setValue: React.Dispatch<React.SetStateAction<string>>, 
    list: string[], 
    setList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (!value.trim()) return;
    const val = value.trim();
    if (!list.includes(val)) {
      setList(prev => prev.filter(x => x !== 'Nenhum').concat(val));
    }
    setValue('');
  };

  const removeCustomTag = (
    val: string, 
    setList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setList(prev => prev.filter(x => x !== val));
  };

  // Validation before submission
  const validateForm = () => {
    setError(null);
    if (!nome.trim()) {
      setError('O Nome Completo é um campo obrigatório.');
      setActiveTab(1);
      return false;
    }
    return true;
  };

  // Form Submit
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !user) return;

    setSaving(true);
    setError(null);

    // Format hours before sending
    const formattedAcorda = convertToTimeFormat(horarioAcordaInput);
    const formattedDorme = convertToTimeFormat(horarioDormeInput);

    const payload = {
      nome,
      email: email.trim() || null,
      whatsapp: whatsapp.trim() || null,
      sexo: sexo || null,
      data_nascimento: dataNascimento || null,
      peso_inicial: peso ? parseFloat(peso) : null,
      altura: altura ? parseFloat(altura) : null,
      objetivos: selectedObjetivos.length > 0 ? selectedObjetivos : null,
      objetivo_texto: objetivoTexto.trim() || null,
      nivel_atividade: nivelAtividade || null,
      patologias: selectedPatologias.length > 0 ? selectedPatologias : null,
      restricoes_alimentares: selectedRestricoes.length > 0 ? selectedRestricoes : null,
      alergias: selectedAlergias.length > 0 ? selectedAlergias : null,
      medicamentos: medicamentos.trim() || null,
      suplementos: suplementos.trim() || null,
      refeicoes_por_dia: refeicoesPorDia ? parseInt(refeicoesPorDia, 10) : null,
      horario_acorda: formattedAcorda || null,
      horario_dorme: formattedDorme || null,
      litros_agua: litrosAgua ? parseFloat(litrosAgua) : null,
      atividade_fisica: praticaAtividade === 'Sim',
      atividade_fisica_descricao: praticaAtividade === 'Sim' ? atividadeDescricao.trim() : null,
      observacoes: observacoes.trim() || null,
    };

    try {
      let patientId = id;

      if (isEditMode) {
        const { error: dbError } = await supabase
          .from('pacientes')
          .update(payload)
          .eq('id', id)
          .eq('nutricionista_id', user.id);

        if (dbError) throw dbError;
      } else {
        const { data, error: dbError } = await supabase
          .from('pacientes')
          .insert([
            {
              nutricionista_id: user.id,
              ...payload
            }
          ])
          .select('id')
          .single();

        if (dbError) throw dbError;
        if (data) {
          patientId = data.id;
        }
      }

      setSuccess(true);
      setTimeout(() => {
        if (patientId) {
          navigate(`/pacientes/${patientId}`);
        } else {
          navigate('/pacientes');
        }
      }, 1500);

    } catch (err: any) {
      console.error('Erro ao salvar paciente:', err);
      setError(err.message || 'Houve um erro desconhecido ao salvar o paciente.');
    } finally {
      setSaving(false);
    }
  };

  if (loadingPatient) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', color: 'var(--primary-color)' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--primary-light)', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Top Breadcrumb / Voltar */}
      <div style={{ marginBottom: '24px' }}>
        <button 
          onClick={() => navigate(isEditMode ? `/pacientes/${id}` : '/pacientes')} 
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', background: 'none', border: 'none', fontWeight: 500, cursor: 'pointer', padding: 0 }}
        >
          <ArrowLeft size={18} />
          <span>{isEditMode ? 'Voltar para Perfil do Paciente' : 'Voltar para Lista de Pacientes'}</span>
        </button>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-color)', marginBottom: '6px' }}>
          {isEditMode ? 'Editar Paciente' : 'Cadastrar Novo Paciente'}
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>
          {isEditMode ? 'Atualize as informações clínicas e pessoais do paciente.' : 'Preencha os dados abaixo estruturados para anamnese completa do paciente.'}
        </p>
      </div>

      {/* Success / Error Alerts */}
      {success && (
        <div className="success-banner">
          <Check size={20} />
          <span>{isEditMode ? 'Paciente atualizado com sucesso! Redirecionando para o perfil...' : 'Paciente cadastrado com sucesso! Redirecionando para o perfil...'}</span>
        </div>
      )}

      {error && (
        <div className="error-message" style={{ marginBottom: '24px' }}>
          <X size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Form Tabs */}
      <div className="form-tabs">
        <button 
          type="button" 
          onClick={() => setActiveTab(1)} 
          className={`form-tab-btn ${activeTab === 1 ? 'active' : ''}`}
        >
          <User size={18} />
          <span>1. Dados Pessoais</span>
        </button>
        <button 
          type="button" 
          onClick={() => setActiveTab(2)} 
          className={`form-tab-btn ${activeTab === 2 ? 'active' : ''}`}
        >
          <Activity size={18} />
          <span>2. Dados Clínicos</span>
        </button>
        <button 
          type="button" 
          onClick={() => setActiveTab(3)} 
          className={`form-tab-btn ${activeTab === 3 ? 'active' : ''}`}
        >
          <Clock size={18} />
          <span>3. Hábitos e Rotina</span>
        </button>
      </div>

      {/* Form Container */}
      <form 
        onSubmit={handleSave} 
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' && (target as HTMLInputElement).type !== 'submit') {
              e.preventDefault();
            }
          }
        }}
        className="form-container-card" 
        style={{ backgroundColor: '#ffffff', border: '1px solid #f3f4f6', borderRadius: '12px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
      >
        
        {/* ABA 1: PESSOAL */}
        {activeTab === 1 && (
          <div>
            <div className="form-group">
              <label htmlFor="nome">Nome Completo *</label>
              <input
                id="nome"
                type="text"
                placeholder="Nome completo do paciente"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="nascimento">Data de Nascimento</label>
                <input
                  id="nascimento"
                  type="date"
                  value={dataNascimento}
                  onChange={(e) => setDataNascimento(e.target.value)}
                />
                {calculatedAge !== null && (
                  <div className="form-helper" style={{ color: 'var(--primary-color)', fontWeight: 600 }}>
                    Idade calculada: {calculatedAge} anos
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="sexo">Sexo</label>
                <select
                  id="sexo"
                  value={sexo}
                  onChange={(e) => setSexo(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: 'var(--border-radius)', border: '1px solid #ddd', fontSize: '16px', outline: 'none', background: 'white' }}
                >
                  <option value="">Selecione...</option>
                  <option value="Feminino">Feminino</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="telefone">Telefone</label>
                <input
                  id="telefone"
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={telefone}
                  onChange={(e) => handlePhoneChange(e, 'tel')}
                />
              </div>

              <div className="form-group">
                <label htmlFor="whatsapp">WhatsApp</label>
                <input
                  id="whatsapp"
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={whatsapp}
                  onChange={(e) => handlePhoneChange(e, 'whats')}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">E-mail</label>
              <input
                id="email"
                type="email"
                placeholder="email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* ABA 2: CLÍNICO */}
        {activeTab === 2 && (
          <div>
            <div className="form-row-3">
              <div className="form-group">
                <label htmlFor="peso">Peso Atual</label>
                <div className="input-suffix-wrapper">
                  <input
                    id="peso"
                    type="number"
                    step="0.1"
                    placeholder="0.0"
                    value={peso}
                    onChange={(e) => setPeso(e.target.value)}
                    className="input-with-suffix"
                  />
                  <span className="input-suffix">kg</span>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="altura">Altura</label>
                <div className="input-suffix-wrapper">
                  <input
                    id="altura"
                    type="number"
                    placeholder="0"
                    value={altura}
                    onChange={(e) => setAltura(e.target.value)}
                    className="input-with-suffix"
                  />
                  <span className="input-suffix">cm</span>
                </div>
              </div>

              <div className="form-group">
                <label>IMC (Calculado)</label>
                <div className="read-only-display">
                  {imc !== null ? `${imc} kg/m²` : 'Preencha peso e altura'}
                </div>
              </div>
            </div>

            {/* Objetivos */}
            <div className="form-group" style={{ marginTop: '28px' }}>
              <label>Objetivos de Acompanhamento</label>
              <div className="options-grid">
                {['Emagrecer', 'Ganhar massa', 'Controlar diabetes', 'Saúde geral', 'Performance esportiva', 'Reeducação alimentar'].map((obj) => (
                  <div 
                    key={obj}
                    className={`option-card ${selectedObjetivos.includes(obj) ? 'selected' : ''}`}
                    onClick={() => handleCategorySelection(obj, selectedObjetivos, setSelectedObjetivos)}
                  >
                    <div className="option-checkbox">
                      <Check size={12} strokeWidth={3} />
                    </div>
                    <span>{obj}</span>
                  </div>
                ))}
              </div>
              <input
                type="text"
                placeholder="Objetivo adicional livre ou observações sobre o objetivo"
                value={objetivoTexto}
                onChange={(e) => setObjetivoTexto(e.target.value)}
                style={{ marginTop: '10px' }}
              />
            </div>

            {/* Nível de atividade */}
            <div className="form-group" style={{ marginTop: '28px' }}>
              <label htmlFor="nivel-atividade">Nível de Atividade Física</label>
              <select
                id="nivel-atividade"
                value={nivelAtividade}
                onChange={(e) => setNivelAtividade(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: 'var(--border-radius)', border: '1px solid #ddd', fontSize: '16px', outline: 'none', background: 'white' }}
              >
                <option value="">Selecione...</option>
                <option value="Sedentário">Sedentário</option>
                <option value="Levemente ativo">Levemente ativo</option>
                <option value="Moderadamente ativo">Moderadamente ativo</option>
                <option value="Muito ativo">Muito ativo</option>
                <option value="Extremamente ativo">Extremamente ativo</option>
              </select>
            </div>

            {/* Patologias */}
            <div className="form-group" style={{ marginTop: '28px' }}>
              <label>Patologias ou Condições de Saúde</label>
              <div className="options-grid">
                {['Nenhum', 'Diabetes', 'Hipertensão', 'Hipotireoidismo', 'Hipertireoidismo', 'Síndrome do ovário policístico', 'Doença celíaca', 'Colesterol alto'].map((pat) => (
                  <div 
                    key={pat}
                    className={`option-card ${selectedPatologias.includes(pat) ? 'selected' : ''}`}
                    onClick={() => handleCategorySelection(pat, selectedPatologias, setSelectedPatologias)}
                  >
                    <div className="option-checkbox">
                      <Check size={12} strokeWidth={3} />
                    </div>
                    <span>{pat}</span>
                  </div>
                ))}
              </div>
              
              <div className="tag-input-group">
                <input
                  type="text"
                  placeholder="Adicionar patologia personalizada..."
                  value={customPatologia}
                  onChange={(e) => setCustomPatologia(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomTag(customPatologia, setCustomPatologia, selectedPatologias, setSelectedPatologias);
                    }
                  }}
                />
                <button 
                  type="button"
                  onClick={() => addCustomTag(customPatologia, setCustomPatologia, selectedPatologias, setSelectedPatologias)}
                  className="btn-primary" 
                  style={{ width: 'auto', padding: '10px 16px' }}
                >
                  Add
                </button>
              </div>

              {selectedPatologias.filter(x => !['Nenhum', 'Diabetes', 'Hipertensão', 'Hipotireoidismo', 'Hipertireoidismo', 'Síndrome do ovário policístico', 'Doença celíaca', 'Colesterol alto'].includes(x)).length > 0 && (
                <div className="tags-container">
                  {selectedPatologias.filter(x => !['Nenhum', 'Diabetes', 'Hipertensão', 'Hipotireoidismo', 'Hipertireoidismo', 'Síndrome do ovário policístico', 'Doença celíaca', 'Colesterol alto'].includes(x)).map(tag => (
                    <span key={tag} className="tag-badge">
                      {tag}
                      <button type="button" onClick={() => removeCustomTag(tag, setSelectedPatologias)} className="tag-remove-btn">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Restrições Alimentares */}
            <div className="form-group" style={{ marginTop: '28px' }}>
              <label>Restrições Alimentares</label>
              <div className="options-grid">
                {['Nenhum', 'Lactose', 'Glúten', 'Açúcar', 'Carne vermelha', 'Frutos do mar'].map((res) => (
                  <div 
                    key={res}
                    className={`option-card ${selectedRestricoes.includes(res) ? 'selected' : ''}`}
                    onClick={() => handleCategorySelection(res, selectedRestricoes, setSelectedRestricoes)}
                  >
                    <div className="option-checkbox">
                      <Check size={12} strokeWidth={3} />
                    </div>
                    <span>{res}</span>
                  </div>
                ))}
              </div>
              
              <div className="tag-input-group">
                <input
                  type="text"
                  placeholder="Adicionar restrição personalizada..."
                  value={customRestricao}
                  onChange={(e) => setCustomRestricao(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomTag(customRestricao, setCustomRestricao, selectedRestricoes, setSelectedRestricoes);
                    }
                  }}
                />
                <button 
                  type="button"
                  onClick={() => addCustomTag(customRestricao, setCustomRestricao, selectedRestricoes, setSelectedRestricoes)}
                  className="btn-primary" 
                  style={{ width: 'auto', padding: '10px 16px' }}
                >
                  Add
                </button>
              </div>

              {selectedRestricoes.filter(x => !['Nenhum', 'Lactose', 'Glúten', 'Açúcar', 'Carne vermelha', 'Frutos do mar'].includes(x)).length > 0 && (
                <div className="tags-container">
                  {selectedRestricoes.filter(x => !['Nenhum', 'Lactose', 'Glúten', 'Açúcar', 'Carne vermelha', 'Frutos do mar'].includes(x)).map(tag => (
                    <span key={tag} className="tag-badge">
                      {tag}
                      <button type="button" onClick={() => removeCustomTag(tag, setSelectedRestricoes)} className="tag-remove-btn">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Alergias Alimentares */}
            <div className="form-group" style={{ marginTop: '28px' }}>
              <label>Alergias Alimentares</label>
              <div className="options-grid">
                {['Nenhum', 'Amendoim', 'Leite', 'Ovo', 'Soja', 'Trigo', 'Frutos do mar'].map((al) => (
                  <div 
                    key={al}
                    className={`option-card ${selectedAlergias.includes(al) ? 'selected' : ''}`}
                    onClick={() => handleCategorySelection(al, selectedAlergias, setSelectedAlergias)}
                  >
                    <div className="option-checkbox">
                      <Check size={12} strokeWidth={3} />
                    </div>
                    <span>{al}</span>
                  </div>
                ))}
              </div>
              
              <div className="tag-input-group">
                <input
                  type="text"
                  placeholder="Adicionar alergia personalizada..."
                  value={customAlergia}
                  onChange={(e) => setCustomAlergia(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomTag(customAlergia, setCustomAlergia, selectedAlergias, setSelectedAlergias);
                    }
                  }}
                />
                <button 
                  type="button"
                  onClick={() => addCustomTag(customAlergia, setCustomAlergia, selectedAlergias, setSelectedAlergias)}
                  className="btn-primary" 
                  style={{ width: 'auto', padding: '10px 16px' }}
                >
                  Add
                </button>
              </div>

              {selectedAlergias.filter(x => !['Nenhum', 'Amendoim', 'Leite', 'Ovo', 'Soja', 'Trigo', 'Frutos do mar'].includes(x)).length > 0 && (
                <div className="tags-container">
                  {selectedAlergias.filter(x => !['Nenhum', 'Amendoim', 'Leite', 'Ovo', 'Soja', 'Trigo', 'Frutos do mar'].includes(x)).map(tag => (
                    <span key={tag} className="tag-badge">
                      {tag}
                      <button type="button" onClick={() => removeCustomTag(tag, setSelectedAlergias)} className="tag-remove-btn">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Medicamentos e Suplementos */}
            <div className="form-group" style={{ marginTop: '28px' }}>
              <label htmlFor="medicamentos">Medicamentos Contínuos</label>
              <textarea
                id="medicamentos"
                placeholder="Descreva medicamentos de uso contínuo..."
                value={medicamentos}
                onChange={(e) => setMedicamentos(e.target.value)}
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: 'var(--border-radius)', minHeight: '80px', fontFamily: 'inherit', outline: 'none' }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="suplementos">Suplementos em Uso</label>
              <textarea
                id="suplementos"
                placeholder="Descreva suplementos e vitaminas em uso..."
                value={suplementos}
                onChange={(e) => setSuplementos(e.target.value)}
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: 'var(--border-radius)', minHeight: '80px', fontFamily: 'inherit', outline: 'none' }}
              />
            </div>
          </div>
        )}

        {/* ABA 3: HÁBITOS */}
        {activeTab === 3 && (
          <div>
            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="refeicoes">Quantidade de Refeições Diárias</label>
                <input
                  id="refeicoes"
                  type="number"
                  placeholder="Ex: 5"
                  value={refeicoesPorDia}
                  onChange={(e) => setRefeicoesPorDia(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="agua">Consumo de Água Diário</label>
                <div className="input-suffix-wrapper">
                  <input
                    id="agua"
                    type="number"
                    step="0.1"
                    placeholder="Ex: 3.5"
                    value={litrosAgua}
                    onChange={(e) => setLitrosAgua(e.target.value)}
                    className="input-with-suffix"
                  />
                  <span className="input-suffix">litros</span>
                </div>
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="horario-acorda">Horário que Acorda (Número)</label>
                <input
                  id="horario-acorda"
                  type="number"
                  placeholder="Ex: 6 ou 630"
                  value={horarioAcordaInput}
                  onChange={(e) => setHorarioAcordaInput(e.target.value)}
                />
                {horarioAcordaInput && (
                  <div className="form-helper">
                    Convertido para: <strong>{convertToTimeFormat(horarioAcordaInput)}</strong>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="horario-dorme">Horário que Dorme (Número)</label>
                <input
                  id="horario-dorme"
                  type="number"
                  placeholder="Ex: 23 ou 2230"
                  value={horarioDormeInput}
                  onChange={(e) => setHorarioDormeInput(e.target.value)}
                />
                {horarioDormeInput && (
                  <div className="form-helper">
                    Convertido para: <strong>{convertToTimeFormat(horarioDormeInput)}</strong>
                  </div>
                )}
              </div>
            </div>

            {/* Atividade física */}
            <div className="form-group" style={{ marginTop: '28px' }}>
              <label>Pratica Atividade Física?</label>
              <div style={{ display: 'flex', gap: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 500 }}>
                  <input 
                    type="radio" 
                    name="praticaAtividade" 
                    value="Sim" 
                    checked={praticaAtividade === 'Sim'}
                    onChange={() => setPraticaAtividade('Sim')}
                    style={{ width: 'auto' }}
                  />
                  Sim
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 500 }}>
                  <input 
                    type="radio" 
                    name="praticaAtividade" 
                    value="Não" 
                    checked={praticaAtividade === 'Não'}
                    onChange={() => setPraticaAtividade('Não')}
                    style={{ width: 'auto' }}
                  />
                  Não
                </label>
              </div>

              {praticaAtividade === 'Sim' && (
                <div style={{ marginTop: '16px' }}>
                  <label htmlFor="atividade-descricao">Qual atividade e frequência semanal?</label>
                  <textarea
                    id="atividade-descricao"
                    placeholder="Ex: Musculação 5x na semana, Corrida 2x na semana..."
                    value={atividadeDescricao}
                    onChange={(e) => setAtividadeDescricao(e.target.value)}
                    style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: 'var(--border-radius)', minHeight: '80px', fontFamily: 'inherit', outline: 'none' }}
                  />
                </div>
              )}
            </div>

            <div className="form-group" style={{ marginTop: '28px' }}>
              <label htmlFor="observacoes">Observações Gerais</label>
              <textarea
                id="observacoes"
                placeholder="Observações complementares sobre a rotina, sono, digestão, etc..."
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: 'var(--border-radius)', minHeight: '100px', fontFamily: 'inherit', outline: 'none' }}
              />
            </div>
          </div>
        )}

        {/* Navigation Action Buttons */}
        <div className="form-actions">
          <div>
            {activeTab > 1 && (
              <button 
                type="button" 
                onClick={() => setActiveTab(prev => prev - 1)} 
                className="btn-secondary"
              >
                <ArrowLeft size={16} />
                <span>Anterior</span>
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              type="button" 
              onClick={() => navigate(isEditMode ? `/pacientes/${id}` : '/pacientes')} 
              className="btn-secondary"
              style={{ borderColor: 'transparent' }}
            >
              Cancelar
            </button>
            
            {activeTab < 3 ? (
              <button 
                key="next-btn"
                type="button" 
                onClick={() => setActiveTab(prev => prev + 1)} 
                className="btn-primary"
                style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}
              >
                <span>Próximo</span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <button 
                key="submit-btn"
                type="submit" 
                disabled={saving}
                className="btn-primary"
                style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}
              >
                <Save size={16} />
                <span>{saving ? 'Salvando...' : 'Salvar Paciente'}</span>
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
