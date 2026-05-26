import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowLeft, User, Phone, Mail, Calendar, Ruler, Weight, Activity, 
  Plus, FileText, Save, Check, X, ArrowRight, Sparkles 
} from 'lucide-react';

export const PacienteDetalhesPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [patient, setPatient] = useState<any | null>(null);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Seções da Página: 'dados' | 'consultas' | 'planos'
  const [activeSection, setActiveSection] = useState<'dados' | 'consultas' | 'planos'>('dados');
  
  // Sub-abas de Dados do Paciente: 1 = Pessoal, 2 = Clínico, 3 = Hábitos
  const [activeTab, setActiveTab] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  // Estados locais para edição dos Dados do Paciente
  // Aba 1: Pessoal
  const [nome, setNome] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [sexo, setSexo] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [calculatedAge, setCalculatedAge] = useState<number | null>(null);

  // Aba 2: Clínico
  const [pesoInicial, setPesoInicial] = useState('');
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

  // Aba 3: Hábitos
  const [refeicoesPorDia, setRefeicoesPorDia] = useState('');
  const [horarioAcordaInput, setHorarioAcordaInput] = useState('');
  const [horarioDormeInput, setHorarioDormeInput] = useState('');
  const [litrosAgua, setLitrosAgua] = useState('');
  const [praticaAtividade, setPraticaAtividade] = useState('Não');
  const [atividadeDescricao, setAtividadeDescricao] = useState('');
  const [observacoes, setObservacoes] = useState('');

  // Estados para Modal de Nova Consulta
  const [isConsultModalOpen, setIsConsultModalOpen] = useState(false);
  const [consultDate, setConsultDate] = useState('');
  const [consultWeight, setConsultWeight] = useState('');
  const [consultWaist, setConsultWaist] = useState('');
  const [consultHip, setConsultHip] = useState('');
  const [consultFat, setConsultFat] = useState('');
  const [consultNotes, setConsultNotes] = useState('');
  const [consultReturn, setConsultReturn] = useState('');
  const [savingConsult, setSavingConsult] = useState(false);
  const [consultError, setConsultError] = useState<string | null>(null);

  // Estado para visualização de Plano Alimentar
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);

  // Estados para Geração do Plano Alimentar via IA e Edição
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [planError, setPlanError] = useState<string | null>(null);
  const [editingPlan, setEditingPlan] = useState<any | null>(null);
  const [activePlanDay, setActivePlanDay] = useState<string>('Segunda-feira');
  const [activeViewDay, setActiveViewDay] = useState<string>('Segunda-feira');

  // Buscar dados consolidados do paciente
  const fetchPatientData = async () => {
    if (!user || !id) return;
    try {
      // Buscar paciente
      const { data: patientData, error: patientError } = await supabase
        .from('pacientes')
        .select('*')
        .eq('id', id)
        .eq('nutricionista_id', user.id)
        .single();

      if (patientError) throw patientError;
      setPatient(patientData);

      // Preencher estados locais editáveis
      setNome(patientData.nome || '');
      setDataNascimento(patientData.data_nascimento || '');
      setSexo(patientData.sexo || '');
      setWhatsapp(patientData.whatsapp || '');
      setEmail(patientData.email || '');
      
      setPesoInicial(patientData.peso_inicial !== null ? String(patientData.peso_inicial) : '');
      setAltura(patientData.altura !== null ? String(patientData.altura) : '');
      setSelectedObjetivos(patientData.objetivos || []);
      setObjetivoTexto(patientData.objetivo_texto || '');
      setNivelAtividade(patientData.nivel_atividade || '');
      
      setSelectedPatologias(patientData.patologias || []);
      setSelectedRestricoes(patientData.restricoes_alimentares || []);
      setSelectedAlergias(patientData.alergias || []);
      
      setMedicamentos(patientData.medicamentos || '');
      setSuplementos(patientData.suplementos || '');
      
      setRefeicoesPorDia(patientData.refeicoes_por_dia !== null ? String(patientData.refeicoes_por_dia) : '');
      setHorarioAcordaInput(patientData.horario_acorda ? patientData.horario_acorda.replace(':', '') : '');
      setHorarioDormeInput(patientData.horario_dorme ? patientData.horario_dorme.replace(':', '') : '');
      setLitrosAgua(patientData.litros_agua !== null ? String(patientData.litros_agua) : '');
      setPraticaAtividade(patientData.atividade_fisica ? 'Sim' : 'Não');
      setAtividadeDescricao(patientData.atividade_fisica_descricao || '');
      setObservacoes(patientData.observacoes || '');

      // Buscar consultas
      const { data: consultData, error: consultError } = await supabase
        .from('consultas')
        .select('*')
        .eq('paciente_id', id)
        .order('data_consulta', { ascending: false });

      if (consultError) throw consultError;
      setConsultations(consultData || []);

      // Buscar planos alimentares
      const { data: plansData, error: plansError } = await supabase
        .from('planos_alimentares')
        .select('*')
        .eq('paciente_id', id)
        .order('created_at', { ascending: false });

      if (plansError) throw plansError;
      setPlans(plansData || []);
    } catch (err) {
      console.error('Erro ao buscar dados do paciente:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientData();
  }, [id, user]);

  // Calcular Idade
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

  // Calcular IMC
  useEffect(() => {
    const w = parseFloat(pesoInicial);
    const h = parseFloat(altura);
    if (isNaN(w) || isNaN(h) || h === 0) {
      setImc(null);
      return;
    }
    const heightInMeters = h / 100;
    const computedImc = w / (heightInMeters * heightInMeters);
    setImc(parseFloat(computedImc.toFixed(2)));
  }, [pesoInicial, altura]);

  // Formatar Telefone/WhatsApp
  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length === 0) return '';
    if (numbers.length <= 2) return `(${numbers}`;
    if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setWhatsapp(formatted);
  };

  // Converter número para formato HH:MM
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

  // Formatar data para exibição sem problemas de fuso horário
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  };

  // Gerenciar Seleção Multivalorada com exclusão de "Nenhum"
  const handleCategorySelection = (
    item: string, 
    selectedList: string[], 
    setSelectedList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (item === 'Nenhum') {
      if (selectedList.includes('Nenhum')) {
        setSelectedList([]);
      } else {
        setSelectedList(['Nenhum']);
      }
      return;
    }

    let newList = selectedList.filter(x => x !== 'Nenhum');
    if (newList.includes(item)) {
      newList = newList.filter(x => x !== item);
    } else {
      newList.push(item);
    }
    setSelectedList(newList);
  };

  // Helpers para tags customizadas
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

  // Salvar Alterações Cadastrais
  const handleSavePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id) return;

    if (!nome.trim()) {
      setError('O Nome Completo é um campo obrigatório.');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);

    const formattedAcorda = convertToTimeFormat(horarioAcordaInput);
    const formattedDorme = convertToTimeFormat(horarioDormeInput);

    const payload = {
      nome,
      email: email.trim() || null,
      whatsapp: whatsapp.trim() || null,
      sexo: sexo || null,
      data_nascimento: dataNascimento || null,
      peso_inicial: pesoInicial ? parseFloat(pesoInicial) : null,
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
      const { error: dbError } = await supabase
        .from('pacientes')
        .update(payload)
        .eq('id', id)
        .eq('nutricionista_id', user.id);

      if (dbError) throw dbError;
      setSuccess(true);
      await fetchPatientData();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Erro ao atualizar paciente:', err);
      setError(err.message || 'Houve um erro ao atualizar o paciente.');
    } finally {
      setSaving(false);
    }
  };

  // Salvar Nova Consulta
  const handleSaveConsult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id) return;

    const w = parseFloat(consultWeight);
    if (isNaN(w)) {
      setConsultError("Peso atual é obrigatório.");
      return;
    }

    setSavingConsult(true);
    setConsultError(null);

    const payload = {
      paciente_id: id,
      data_consulta: consultDate,
      peso: w,
      cintura: consultWaist ? parseFloat(consultWaist) : null,
      quadril: consultHip ? parseFloat(consultHip) : null,
      percentual_gordura: consultFat ? parseFloat(consultFat) : null,
      observacoes: consultNotes.trim() || null,
      proximo_retorno: consultReturn || null
    };

    try {
      const { error: dbError } = await supabase
        .from('consultas')
        .insert([payload]);

      if (dbError) throw dbError;

      // Limpar campos e fechar
      setConsultWeight('');
      setConsultFat('');
      setConsultWaist('');
      setConsultHip('');
      setConsultNotes('');
      setConsultReturn('');
      setIsConsultModalOpen(false);
      
      // Recarregar
      await fetchPatientData();
    } catch (err: any) {
      console.error('Erro ao salvar consulta:', err);
      setConsultError(err.message || 'Erro ao salvar consulta.');
    } finally {
      setSavingConsult(false);
    }
  };

  // Abrir Modal de Consulta
  const openNewConsultModal = () => {
    const today = new Date().toISOString().split('T')[0];
    setConsultDate(today);
    setConsultError(null);
    setIsConsultModalOpen(true);
  };

  // Criar Plano Alimentar Manualmente
  const handleCreateManualPlan = () => {
    const emptyPlan = {
      plano_semanal: [
        'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'
      ].map(dia => ({
        dia,
        refeicoes: {
          cafe_da_manha: ['', '', '', '', ''],
          lanche_manha: ['', '', '', '', ''],
          almoco: ['', '', '', '', ''],
          lanche_tarde: ['', '', '', '', ''],
          jantar: ['', '', '', '', '']
        }
      }))
    };
    setEditingPlan(emptyPlan);
    setActivePlanDay('Segunda-feira');
    setPlanError(null);
  };

  // Gerar Plano Alimentar via IA (Gemini 2.5 Flash)
  const handleGeneratePlanWithIA = async () => {
    if (!id || !user) return;
    
    setIsGeneratingPlan(true);
    setPlanError(null);
    setEditingPlan(null);
    
    const messages = [
      'Buscando dados do paciente...',
      'Analisando objetivos, patologias e alergias...',
      'IA calculando cardápio personalizado...',
      'Estruturando refeições semanais...',
      'Organizando as opções do cardápio...'
    ];
    
    let msgIndex = 0;
    setLoadingMessage(messages[0]);
    const messageInterval = setInterval(() => {
      msgIndex = (msgIndex + 1) % messages.length;
      setLoadingMessage(messages[msgIndex]);
    }, 2500);

    try {
      const formattedData = `
Nome: ${nome}
Sexo: ${sexo || 'Não informado'}
Idade: ${calculatedAge !== null ? `${calculatedAge} anos` : 'Não informada'}
Peso de Cadastro: ${pesoInicial ? `${pesoInicial} kg` : 'Não informado'}
Altura: ${altura ? `${altura} cm` : 'Não informada'}
IMC: ${imc !== null ? `${imc} kg/m²` : 'Não calculado'}
Objetivos: ${selectedObjetivos.join(', ') || 'Nenhum'}
Outros objetivos: ${objetivoTexto || 'Nenhum'}
Nível de Atividade Física: ${nivelAtividade || 'Não informado'}
Patologias/Condições de Saúde: ${selectedPatologias.join(', ') || 'Nenhuma'}
Restrições Alimentares: ${selectedRestricoes.join(', ') || 'Nenhuma'}
Alergias Alimentares: ${selectedAlergias.join(', ') || 'Nenhuma'}
Medicamentos: ${medicamentos || 'Nenhum'}
Suplementos: ${suplementos || 'Nenhum'}
Quantidade de refeições diárias desejadas: ${refeicoesPorDia || 'Não informado'}
Consumo de água sugerido: ${litrosAgua ? `${litrosAgua} litros` : 'Não informado'}
Pratica atividade física: ${praticaAtividade} (${atividadeDescricao || 'Nenhuma'})
Observações gerais: ${observacoes || 'Nenhuma'}
`;

      const { data, error: funcError } = await supabase.functions.invoke('gerar-plano', {
        body: { dados_do_paciente: formattedData }
      });

      clearInterval(messageInterval);

      if (funcError) {
        let errorMessage = funcError.message;
        try {
          if (funcError.context) {
            const errBody = await funcError.context.json();
            errorMessage = errBody.error || errBody.message || JSON.stringify(errBody);
          }
        } catch (e) {
          console.error("Erro ao extrair corpo do erro da Edge Function:", e);
        }
        throw new Error(errorMessage);
      }

      if (!data) {
        throw new Error("Nenhum dado retornado pela IA.");
      }

      let parsedPlan: any;
      if (typeof data === 'string') {
        parsedPlan = JSON.parse(data);
      } else {
        parsedPlan = data;
      }

      if (!parsedPlan.plano_semanal || !Array.isArray(parsedPlan.plano_semanal)) {
        throw new Error("O formato do plano retornado pela IA é inválido.");
      }

      const normalizedPlan = {
        plano_semanal: parsedPlan.plano_semanal.map((diaItem: any) => {
          const refeicoes = diaItem.refeicoes || {};
          const normalizeMeal = (mealOptions: any) => {
            if (Array.isArray(mealOptions)) {
              const normalized = [...mealOptions];
              while (normalized.length < 5) normalized.push('');
              return normalized.slice(0, 5);
            }
            return ['', '', '', '', ''];
          };

          return {
            dia: diaItem.dia || 'Dia não especificado',
            refeicoes: {
              cafe_da_manha: normalizeMeal(refeicoes.cafe_da_manha || refeicoes.cafe_manha),
              lanche_manha: normalizeMeal(refeicoes.lanche_manha),
              almoco: normalizeMeal(refeicoes.almoco),
              lanche_tarde: normalizeMeal(refeicoes.lanche_tarde),
              jantar: normalizeMeal(refeicoes.jantar)
            }
          };
        })
      };

      setEditingPlan(normalizedPlan);
      setActivePlanDay(normalizedPlan.plano_semanal[0]?.dia || 'Segunda-feira');

    } catch (err: any) {
      clearInterval(messageInterval);
      console.error("Erro ao gerar plano alimentar via IA:", err);
      setPlanError(err.message || "Não foi possível gerar o plano com IA no momento. Deseja tentar novamente ou criar um Plano Manual?");
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  // Atualizar uma opção específica do plano alimentar ativo em edição
  const handleUpdateOption = (mealKey: string, optionIndex: number, newValue: string) => {
    if (!editingPlan) return;
    
    const updatedPlan = {
      ...editingPlan,
      plano_semanal: editingPlan.plano_semanal.map((d: any) => {
        if (d.dia === activePlanDay) {
          return {
            ...d,
            refeicoes: {
              ...d.refeicoes,
              [mealKey]: d.refeicoes[mealKey].map((opt: string, idx: number) => 
                idx === optionIndex ? newValue : opt
              )
            }
          };
        }
        return d;
      })
    };
    
    setEditingPlan(updatedPlan);
  };

  // Salvar Plano Alimentar no Banco de Dados
  const handleSaveDietaryPlan = async () => {
    if (!id || !user || !editingPlan) return;
    
    setSaving(true);
    setPlanError(null);
    
    try {
      const payload = {
        paciente_id: id,
        conteudo: editingPlan
      };
      
      const { error: insertError } = await supabase
        .from('planos_alimentares')
        .insert([payload]);
        
      if (insertError) throw insertError;
      
      setEditingPlan(null);
      setSuccess(true);
      await fetchPatientData();
      setTimeout(() => setSuccess(false), 3000);
      
    } catch (err: any) {
      console.error("Erro ao salvar plano alimentar:", err);
      setPlanError(err.message || "Houve um erro ao salvar o plano alimentar.");
    } finally {
      setSaving(false);
    }
  };

  // Renderizar o conteúdo do plano alimentar
  const renderPlanContent = (content: any) => {
    if (!content) return <i>Sem conteúdo disponível.</i>;
    
    if (typeof content === 'string') {
      try {
        content = JSON.parse(content);
      } catch (e) {
        return <div style={{ whiteSpace: 'pre-wrap' }}>{content}</div>;
      }
    }
    
    try {
      // Se for a estrutura semanal da IA
      if (content.plano_semanal && Array.isArray(content.plano_semanal)) {
        const currentDayData = content.plano_semanal.find((d: any) => d.dia === activeViewDay) || content.plano_semanal[0];
        if (!currentDayData) return <i>Estrutura do plano vazia.</i>;

        const mealLabels: Record<string, string> = {
          cafe_da_manha: '☕ Café da Manhã',
          lanche_manha: '🍏 Lanche da Manhã',
          almoco: '🍛 Almoço',
          lanche_tarde: '🍪 Lanche da Tarde',
          jantar: '🍲 Jantar'
        };

        return (
          <div>
            {/* Abas dos dias no visualizador */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px', marginBottom: '20px', overflowX: 'auto', paddingLeft: '2px', paddingRight: '2px' }}>
              {content.plano_semanal.map((d: any) => (
                <button
                  key={d.dia}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation(); // Evitar disparar cliques do card pai
                    setActiveViewDay(d.dia);
                  }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: activeViewDay === d.dia ? 'var(--primary-color)' : '#e5e7eb',
                    backgroundColor: activeViewDay === d.dia ? 'var(--primary-light)' : '#ffffff',
                    color: activeViewDay === d.dia ? 'var(--primary-color)' : 'var(--text-muted)',
                    fontSize: '0.9rem',
                    fontWeight: activeViewDay === d.dia ? 600 : 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'var(--transition)'
                  }}
                >
                  {d.dia}
                </button>
              ))}
            </div>
            
            {/* Refeições do dia selecionado */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
              {Object.entries(currentDayData.refeicoes || {}).map(([mealKey, options]: [string, any]) => {
                if (!Array.isArray(options)) return null;
                const filledOptions = options.filter(opt => opt && opt.trim() !== '');
                if (filledOptions.length === 0) return null;
                
                return (
                  <div key={mealKey} style={{ backgroundColor: '#ffffff', border: '1px solid #f3f4f6', borderRadius: '10px', padding: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <h5 style={{ fontWeight: 600, color: 'var(--primary-color)', marginBottom: '12px', fontSize: '1rem', borderBottom: '1px solid #f3f4f6', paddingBottom: '6px' }}>
                      {mealLabels[mealKey] || mealKey}
                    </h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {filledOptions.map((option, idx) => (
                        <div key={idx} style={{ 
                          fontSize: '0.9rem', 
                          color: 'var(--text-color)', 
                          padding: '10px 14px', 
                          backgroundColor: '#f9fafb', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px'
                        }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{idx + 1}.</span>
                          <span style={{ flex: 1 }}>{option}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }

      // Código legado
      const meals = content.refeicoes || content.meals;
      if (Array.isArray(meals)) {
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {meals.map((meal: any, idx: number) => (
              <div key={idx} style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', fontWeight: 600, color: 'var(--primary-color)', marginBottom: '6px' }}>
                  {meal.horario && <span style={{ backgroundColor: 'var(--primary-light)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>{meal.horario}</span>}
                  <span>{meal.nome || meal.title}</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-color)', paddingLeft: meal.horario ? '70px' : '0' }}>
                  {meal.alimentos || meal.foods || meal.description || JSON.stringify(meal)}
                </p>
              </div>
            ))}
            {content.observacoes && (
              <div style={{ marginTop: '10px', borderTop: '1px solid #e5e7eb', paddingTop: '10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <strong>Observações:</strong> {content.observacoes}
              </div>
            )}
          </div>
        );
      }

      return (
        <pre style={{ margin: 0, fontSize: '0.85rem', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
          {JSON.stringify(content, null, 2)}
        </pre>
      );
    } catch (e) {
      return <pre style={{ margin: 0 }}>{JSON.stringify(content, null, 2)}</pre>;
    }
  };

  // Componente Gráfico customizado de peso
  const WeightEvolutionChart = () => {
    // Filtrar pesos válidos e ordenar por data crescente para o gráfico
    const chartData = [...consultations]
      .filter(c => c.peso !== null && c.peso !== undefined)
      .sort((a, b) => new Date(a.data_consulta).getTime() - new Date(b.data_consulta).getTime());

    if (chartData.length === 0) {
      return (
        <div style={{
          border: '1px dashed #e5e7eb',
          borderRadius: '12px',
          padding: '40px 20px',
          textAlign: 'center',
          backgroundColor: '#f9fafb',
          color: 'var(--text-muted)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          minHeight: '220px',
          marginBottom: '24px'
        }}>
          <Weight size={36} style={{ color: '#9ca3af' }} />
          <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>Nenhuma consulta registrada ainda</span>
        </div>
      );
    }

    const width = 600;
    const height = 220;
    const paddingX = 60;
    const paddingY = 30;

    const weights = chartData.map(d => parseFloat(d.peso));
    let minW = Math.min(...weights);
    let maxW = Math.max(...weights);
    
    if (minW === maxW) {
      minW = Math.max(0, minW - 5);
      maxW = maxW + 5;
    } else {
      const padding = (maxW - minW) * 0.2;
      minW = Math.max(0, minW - padding);
      maxW = maxW + padding;
    }
    const weightRange = maxW - minW;

    const points = chartData.map((d, i) => {
      const x = paddingX + (chartData.length > 1 ? (i / (chartData.length - 1)) * (width - 2 * paddingX) : (width - 2 * paddingX) / 2);
      const y = height - paddingY - ((parseFloat(d.peso) - minW) / weightRange) * (height - 2 * paddingY);
      return { x, y, weight: parseFloat(d.peso), date: d.data_consulta };
    });

    let linePath = '';
    points.forEach((p, i) => {
      if (i === 0) linePath += `M ${p.x} ${p.y}`;
      else linePath += ` L ${p.x} ${p.y}`;
    });

    const areaPath = points.length > 0 
      ? `${linePath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`
      : '';

    // Linhas horizontais de grade
    const gridLines = [];
    const gridCount = 4;
    for (let i = 0; i <= gridCount; i++) {
      const y = paddingY + (i / gridCount) * (height - 2 * paddingY);
      const weightVal = maxW - (i / gridCount) * weightRange;
      gridLines.push({ y, val: weightVal.toFixed(1) });
    }

    const [activePoint, setActivePoint] = useState<number | null>(null);

    return (
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #f3f4f6', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', marginBottom: '32px' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={18} style={{ color: 'var(--primary-color)' }} />
          Evolução do Peso (kg)
        </h4>
        <div style={{ position: 'relative', width: '100%', overflow: 'visible' }}>
          <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} style={{ display: 'block', overflow: 'visible' }}>
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary-color)" stopOpacity="0.2" />
                <stop offset="100%" stopColor="var(--primary-color)" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Linhas de Grade e Eixo Y */}
            {gridLines.map((line, idx) => (
              <g key={idx}>
                <line 
                  x1={paddingX} 
                  y1={line.y} 
                  x2={width - paddingX} 
                  y2={line.y} 
                  stroke="#f3f4f6" 
                  strokeWidth="1" 
                />
                <text 
                  x={paddingX - 10} 
                  y={line.y + 4} 
                  textAnchor="end" 
                  fontSize="11" 
                  fill="var(--text-muted)"
                  fontWeight="500"
                >
                  {line.val}
                </text>
              </g>
            ))}

            {/* Área Sombreada */}
            {points.length > 1 && (
              <path d={areaPath} fill="url(#areaGrad)" />
            )}

            {/* Linha do Gráfico */}
            <path 
              d={linePath} 
              fill="none" 
              stroke="var(--primary-color)" 
              strokeWidth="3.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />

            {/* Pontos Interativos */}
            {points.map((p, idx) => (
              <g key={idx}>
                <circle 
                  cx={p.x} 
                  cy={p.y} 
                  r={activePoint === idx ? 7 : 5} 
                  fill={activePoint === idx ? 'var(--primary-hover)' : 'var(--primary-color)'} 
                  stroke="#ffffff" 
                  strokeWidth="2" 
                  style={{ transition: 'all 0.15s ease', cursor: 'pointer' }}
                  onMouseEnter={() => setActivePoint(idx)}
                  onMouseLeave={() => setActivePoint(null)}
                />
                <circle 
                  cx={p.x} 
                  cy={p.y} 
                  r="16" 
                  fill="transparent" 
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setActivePoint(idx)}
                  onMouseLeave={() => setActivePoint(null)}
                />
              </g>
            ))}

            {/* Rótulos do Eixo X (Datas) */}
            {points.map((p, idx) => {
              const shouldDrawLabel = points.length <= 6 || idx === 0 || idx === points.length - 1 || idx === Math.floor(points.length / 2);
              if (!shouldDrawLabel) return null;
              return (
                <text 
                  key={idx}
                  x={p.x} 
                  y={height - 8} 
                  textAnchor="middle" 
                  fontSize="11" 
                  fill="var(--text-muted)"
                  fontWeight="500"
                >
                  {formatDate(p.date)}
                </text>
              );
            })}
          </svg>

          {/* Tooltip HTML Posicionado de forma absoluta */}
          {activePoint !== null && (
            <div style={{
              position: 'absolute',
              left: `${(points[activePoint].x / width) * 100}%`,
              top: `${(points[activePoint].y / height) * 100 - 45}%`,
              transform: 'translateX(-50%)',
              backgroundColor: 'var(--text-color)',
              color: '#ffffff',
              padding: '6px 10px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
              pointerEvents: 'none',
              zIndex: 10
            }}>
              <div style={{ fontSize: '0.85rem' }}>{points[activePoint].weight} kg</div>
              <div style={{ fontSize: '0.7rem', opacity: 0.8, fontWeight: 400 }}>{formatDate(points[activePoint].date)}</div>
            </div>
          )}
        </div>
      </div>
    );
  };

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

      {/* Cabeçalho do Perfil do Paciente */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #f3f4f6', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', marginBottom: '32px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-start' }}>
          <div style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary-color)', width: '72px', height: '72px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={36} />
          </div>
          <div style={{ flex: 1, minWidth: '240px' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-color)', marginBottom: '8px' }}>{nome}</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px 24px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={16} />
                <span>{email || 'Sem e-mail'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={16} />
                <span>{whatsapp || 'Sem celular'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={16} />
                <span>Nasc: {dataNascimento ? formatDate(dataNascimento) : '-'} {calculatedAge !== null && `(${calculatedAge} anos)`}</span>
              </div>
              {altura && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Ruler size={16} />
                  <span>{altura} cm</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navegação por Abas Principais */}
      <div className="form-tabs" style={{ marginBottom: '32px' }}>
        <button 
          onClick={() => { setActiveSection('dados'); setError(null); }} 
          className={`form-tab-btn ${activeSection === 'dados' ? 'active' : ''}`}
        >
          <User size={18} />
          <span>Dados do Paciente</span>
        </button>
        <button 
          onClick={() => { setActiveSection('consultas'); setError(null); }} 
          className={`form-tab-btn ${activeSection === 'consultas' ? 'active' : ''}`}
        >
          <Calendar size={18} />
          <span>Consultas</span>
        </button>
        <button 
          onClick={() => { setActiveSection('planos'); setError(null); }} 
          className={`form-tab-btn ${activeSection === 'planos' ? 'active' : ''}`}
        >
          <FileText size={18} />
          <span>Planos Alimentares</span>
        </button>
      </div>

      {/* Alertas de Sucesso / Erro */}
      {success && (
        <div className="success-banner">
          <Check size={20} />
          <span>Alterações salvas com sucesso!</span>
        </div>
      )}

      {error && (
        <div className="error-message" style={{ marginBottom: '24px' }}>
          <X size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* SEÇÃO 1: DADOS DO PACIENTE */}
      {activeSection === 'dados' && (
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #f3f4f6', borderRadius: '12px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          {/* Navegação Sub-Abas */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '28px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
            <button 
              type="button"
              onClick={() => setActiveTab(1)} 
              style={{
                background: 'none',
                border: 'none',
                color: activeTab === 1 ? 'var(--primary-color)' : 'var(--text-muted)',
                fontWeight: activeTab === 1 ? '600' : '500',
                cursor: 'pointer',
                fontSize: '0.95rem',
                padding: '8px 16px',
                borderBottom: activeTab === 1 ? '3px solid var(--primary-color)' : '3px solid transparent',
                marginBottom: '-13px',
                transition: 'var(--transition)'
              }}
            >
              Pessoal
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab(2)} 
              style={{
                background: 'none',
                border: 'none',
                color: activeTab === 2 ? 'var(--primary-color)' : 'var(--text-muted)',
                fontWeight: activeTab === 2 ? '600' : '500',
                cursor: 'pointer',
                fontSize: '0.95rem',
                padding: '8px 16px',
                borderBottom: activeTab === 2 ? '3px solid var(--primary-color)' : '3px solid transparent',
                marginBottom: '-13px',
                transition: 'var(--transition)'
              }}
            >
              Clínico
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab(3)} 
              style={{
                background: 'none',
                border: 'none',
                color: activeTab === 3 ? 'var(--primary-color)' : 'var(--text-muted)',
                fontWeight: activeTab === 3 ? '600' : '500',
                cursor: 'pointer',
                fontSize: '0.95rem',
                padding: '8px 16px',
                borderBottom: activeTab === 3 ? '3px solid var(--primary-color)' : '3px solid transparent',
                marginBottom: '-13px',
                transition: 'var(--transition)'
              }}
            >
              Hábitos
            </button>
          </div>

          <form onSubmit={handleSavePatient}>
            {/* SUB-ABA 1: PESSOAL */}
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
                    <label htmlFor="whatsapp">WhatsApp</label>
                    <input
                      id="whatsapp"
                      type="tel"
                      placeholder="(11) 99999-9999"
                      value={whatsapp}
                      onChange={handlePhoneChange}
                    />
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
              </div>
            )}

            {/* SUB-ABA 2: CLÍNICO */}
            {activeTab === 2 && (
              <div>
                <div className="form-row-3">
                  <div className="form-group">
                    <label htmlFor="peso">Peso de Cadastro</label>
                    <div className="input-suffix-wrapper">
                      <input
                        id="peso"
                        type="number"
                        step="0.1"
                        placeholder="0.0"
                        value={pesoInicial}
                        onChange={(e) => setPesoInicial(e.target.value)}
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

            {/* SUB-ABA 3: HÁBITOS */}
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

            {/* Ações do Formulário de Edição */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px', paddingTop: '20px', borderTop: '1px solid #f3f4f6' }}>
              <button 
                type="submit" 
                disabled={saving}
                className="btn-primary"
                style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 32px' }}
              >
                <Save size={16} />
                <span>{saving ? 'Salvando...' : 'Salvar Alterações'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SEÇÃO 2: CONSULTAS */}
      {activeSection === 'consultas' && (
        <div>
          {/* Gráfico de Evolução sempre visível */}
          <WeightEvolutionChart />

          {/* Cabeçalho do histórico de consultas */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-color)' }}>Histórico de Consultas</h3>
            <button 
              onClick={openNewConsultModal}
              className="btn-primary" 
              style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}
            >
              <Plus size={18} />
              <span>Nova Consulta</span>
            </button>
          </div>

          {/* Listagem de Consultas */}
          {consultations.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {consultations.map((consult) => (
                <div key={consult.id} style={{ backgroundColor: '#ffffff', border: '1px solid #f3f4f6', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--text-color)', fontSize: '1.05rem' }}>
                      <Calendar size={18} style={{ color: 'var(--primary-color)' }} />
                      <span>Consulta em {formatDate(consult.data_consulta)}</span>
                    </div>
                    {consult.proximo_retorno && (
                      <span style={{ fontSize: '0.8rem', backgroundColor: 'var(--primary-light)', color: 'var(--primary-color)', padding: '4px 12px', borderRadius: '6px', fontWeight: 600 }}>
                        Próximo retorno: {formatDate(consult.proximo_retorno)}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '12px', fontSize: '0.9rem', marginBottom: '16px', backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Peso</div>
                      <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-color)' }}>{consult.peso ? `${consult.peso} kg` : '-'}</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Cintura</div>
                      <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-color)' }}>{consult.cintura ? `${consult.cintura} cm` : '-'}</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Quadril</div>
                      <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-color)' }}>{consult.quadril ? `${consult.quadril} cm` : '-'}</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>% Gordura</div>
                      <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-color)' }}>{consult.percentual_gordura ? `${consult.percentual_gordura}%` : '-'}</div>
                    </div>
                  </div>

                  {consult.observacoes && (
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', borderTop: '1px solid #f3f4f6', paddingTop: '12px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <FileText size={16} style={{ marginTop: '2px', flexShrink: 0, color: 'var(--text-muted)' }} />
                      <span style={{ lineHeight: 1.5 }}>{consult.observacoes}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              border: '1px dashed #e5e7eb',
              borderRadius: '12px',
              padding: '60px 20px',
              textAlign: 'center',
              backgroundColor: '#ffffff',
              color: 'var(--text-muted)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px'
            }}>
              <Calendar size={48} style={{ color: '#9ca3af', marginBottom: '8px' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-color)' }}>Nenhuma consulta registrada</h3>
              <p style={{ fontSize: '0.9rem', maxWidth: '320px', margin: '0' }}>Registre a primeira consulta do paciente para começar a acompanhar as métricas de evolução.</p>
              <button 
                onClick={openNewConsultModal}
                className="btn-primary" 
                style={{ width: 'auto', padding: '10px 20px', marginTop: '8px' }}
              >
                Registrar Consulta
              </button>
            </div>
          )}

          {/* Modal Nova Consulta */}
          {isConsultModalOpen && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 9999,
              padding: '20px'
            }}>
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '32px',
                width: '100%',
                maxWidth: '600px',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                position: 'relative'
              }}>
                <button 
                  type="button"
                  onClick={() => setIsConsultModalOpen(false)}
                  style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
                
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '24px', color: 'var(--text-color)' }}>Registrar Nova Consulta</h3>
                
                {consultError && (
                  <div className="error-message" style={{ marginBottom: '20px' }}>
                    <X size={16} />
                    <span>{consultError}</span>
                  </div>
                )}

                <form onSubmit={handleSaveConsult}>
                  <div className="form-group">
                    <label>Data da Consulta *</label>
                    <input 
                      type="date" 
                      value={consultDate} 
                      onChange={(e) => setConsultDate(e.target.value)} 
                      required 
                    />
                  </div>
                  
                  <div className="form-row-2">
                    <div className="form-group">
                      <label>Peso Atual (kg) *</label>
                      <div className="input-suffix-wrapper">
                        <input 
                          type="number" 
                          step="0.1" 
                          value={consultWeight} 
                          onChange={(e) => setConsultWeight(e.target.value)} 
                          placeholder="0.0"
                          required 
                          className="input-with-suffix"
                        />
                        <span className="input-suffix">kg</span>
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label>% de Gordura</label>
                      <div className="input-suffix-wrapper">
                        <input 
                          type="number" 
                          step="0.1" 
                          value={consultFat} 
                          onChange={(e) => setConsultFat(e.target.value)} 
                          placeholder="0.0"
                          className="input-with-suffix"
                        />
                        <span className="input-suffix">%</span>
                      </div>
                    </div>
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label>Cintura (cm)</label>
                      <div className="input-suffix-wrapper">
                        <input 
                          type="number" 
                          step="0.1" 
                          value={consultWaist} 
                          onChange={(e) => setConsultWaist(e.target.value)} 
                          placeholder="0.0"
                          className="input-with-suffix"
                        />
                        <span className="input-suffix">cm</span>
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label>Quadril (cm)</label>
                      <div className="input-suffix-wrapper">
                        <input 
                          type="number" 
                          step="0.1" 
                          value={consultHip} 
                          onChange={(e) => setConsultHip(e.target.value)} 
                          placeholder="0.0"
                          className="input-with-suffix"
                        />
                        <span className="input-suffix">cm</span>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Próximo Retorno</label>
                    <input 
                      type="date" 
                      value={consultReturn} 
                      onChange={(e) => setConsultReturn(e.target.value)} 
                    />
                  </div>

                  <div className="form-group">
                    <label>Observações</label>
                    <textarea 
                      value={consultNotes} 
                      onChange={(e) => setConsultNotes(e.target.value)} 
                      placeholder="Anote detalhes da consulta, queixas do paciente, impressões gerais..."
                      style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: 'var(--border-radius)', minHeight: '80px', fontFamily: 'inherit', outline: 'none' }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '28px', borderTop: '1px solid #f3f4f6', paddingTop: '20px' }}>
                    <button 
                      type="button" 
                      onClick={() => setIsConsultModalOpen(false)} 
                      className="btn-secondary"
                      style={{ width: 'auto', padding: '10px 24px' }}
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      disabled={savingConsult} 
                      className="btn-primary"
                      style={{ width: 'auto', padding: '10px 24px' }}
                    >
                      {savingConsult ? 'Salvando...' : 'Salvar Consulta'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SEÇÃO 3: PLANOS ALIMENTARES */}
      {activeSection === 'planos' && (
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #f3f4f6', borderRadius: '12px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          
          {/* Seção de Carregamento (IA) */}
          {isGeneratingPlan && (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center', 
              alignItems: 'center', 
              padding: '60px 20px', 
              textAlign: 'center',
              backgroundColor: '#f9fafb',
              border: '1px dashed var(--primary-color)',
              borderRadius: '12px',
              minHeight: '300px',
              gap: '20px'
            }}>
              <div style={{ 
                width: '50px', 
                height: '50px', 
                border: '4px solid var(--primary-light)', 
                borderTopColor: 'var(--primary-color)', 
                borderRadius: '50%', 
                animation: 'spin 1s linear infinite' 
              }}></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-color)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                  <Sparkles size={18} style={{ color: 'var(--primary-color)' }} />
                  Gerando Plano com IA
                </h4>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', margin: 0, fontWeight: 500 }}>
                  {loadingMessage}
                </p>
              </div>
            </div>
          )}

          {/* Seção do Editor (AI ou Manual) */}
          {!isGeneratingPlan && editingPlan && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #e5e7eb', paddingBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <Sparkles size={20} style={{ color: 'var(--primary-color)' }} />
                  <span>Editando Plano Alimentar</span>
                </h3>
                <button 
                  type="button" 
                  onClick={() => { setEditingPlan(null); setPlanError(null); }}
                  className="btn-secondary"
                  style={{ width: 'auto', padding: '8px 16px', fontSize: '0.9rem' }}
                >
                  Cancelar
                </button>
              </div>

              {planError && (
                <div className="error-message" style={{ marginBottom: '24px' }}>
                  <X size={18} />
                  <span>{planError}</span>
                </div>
              )}

              {/* Abas de Dias da Semana no Editor */}
              <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px', marginBottom: '24px', overflowX: 'auto', paddingLeft: '2px', paddingRight: '2px' }}>
                {editingPlan.plano_semanal.map((d: any) => (
                  <button
                    key={d.dia}
                    type="button"
                    onClick={() => setActivePlanDay(d.dia)}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: activePlanDay === d.dia ? 'var(--primary-color)' : '#e5e7eb',
                      backgroundColor: activePlanDay === d.dia ? 'var(--primary-light)' : '#ffffff',
                      color: activePlanDay === d.dia ? 'var(--primary-color)' : 'var(--text-muted)',
                      fontSize: '0.95rem',
                      fontWeight: activePlanDay === d.dia ? 600 : 500,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'var(--transition)'
                    }}
                  >
                    {d.dia}
                  </button>
                ))}
              </div>

              {/* Refeições do dia ativo em edição */}
              {(() => {
                const activeDayData = editingPlan.plano_semanal.find((d: any) => d.dia === activePlanDay);
                if (!activeDayData) return null;

                const mealKeys = ['cafe_da_manha', 'lanche_manha', 'almoco', 'lanche_tarde', 'jantar'];
                const mealLabels: Record<string, string> = {
                  cafe_da_manha: '☕ Café da Manhã',
                  lanche_manha: '🍏 Lanche da Manhã',
                  almoco: '🍛 Almoço',
                  lanche_tarde: '🍪 Lanche da Tarde',
                  jantar: '🍲 Jantar'
                };

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {mealKeys.map((mealKey) => {
                      const options = activeDayData.refeicoes[mealKey] || ['', '', '', '', ''];
                      return (
                        <div key={mealKey} style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                          <h4 style={{ fontWeight: 600, color: 'var(--primary-color)', marginBottom: '16px', fontSize: '1.05rem', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
                            {mealLabels[mealKey]}
                          </h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {options.map((option: string, optIdx: number) => (
                              <div key={optIdx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, width: '60px' }}>
                                  Opção {optIdx + 1}:
                                </span>
                                <input 
                                  type="text"
                                  value={option}
                                  placeholder={`Digite a opção ${optIdx + 1} para esta refeição...`}
                                  onChange={(e) => handleUpdateOption(mealKey, optIdx, e.target.value)}
                                  style={{ flex: 1, padding: '10px 14px', fontSize: '0.95rem' }}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              {/* Ações do Editor */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '32px', paddingTop: '20px', borderTop: '1px solid #f3f4f6' }}>
                <button 
                  type="button" 
                  onClick={() => { setEditingPlan(null); setPlanError(null); }}
                  className="btn-secondary"
                  style={{ width: 'auto', padding: '12px 28px' }}
                >
                  Descartar
                </button>
                <button 
                  type="button" 
                  onClick={handleSaveDietaryPlan}
                  disabled={saving}
                  className="btn-primary"
                  style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 32px' }}
                >
                  <Save size={16} />
                  <span>{saving ? 'Salvando...' : 'Salvar Plano Alimentar'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Seção Histórico / Listagem Principal */}
          {!isGeneratingPlan && !editingPlan && (
            <div>
              {/* Notificação amigável de erro de geração anterior */}
              {planError && (
                <div style={{ 
                  backgroundColor: '#fef2f2', 
                  color: '#ef4444', 
                  padding: '16px 20px', 
                  borderRadius: '12px', 
                  marginBottom: '24px', 
                  border: '1px solid #fee2e2',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '0.95rem' }}>
                    <X size={20} style={{ flexShrink: 0 }} />
                    <span>{planError}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={handleGeneratePlanWithIA}
                      className="btn-primary"
                      style={{ width: 'auto', padding: '8px 16px', fontSize: '0.85rem', backgroundColor: '#ef4444' }}
                    >
                      Tentar com IA Novamente
                    </button>
                    <button
                      onClick={handleCreateManualPlan}
                      className="btn-secondary"
                      style={{ width: 'auto', padding: '8px 16px', fontSize: '0.85rem', borderColor: '#fca5a5', color: '#ef4444' }}
                    >
                      Criar Plano Manual
                    </button>
                  </div>
                </div>
              )}

              {/* Cabeçalho */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-color)', margin: 0 }}>
                  Planos Alimentares do Paciente
                </h3>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button 
                    onClick={handleCreateManualPlan}
                    className="btn-secondary"
                    style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}
                  >
                    <Plus size={18} />
                    <span>Plano Manual</span>
                  </button>
                  <button 
                    onClick={handleGeneratePlanWithIA}
                    className="btn-primary" 
                    style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: 'var(--primary-color)' }}
                  >
                    <Sparkles size={18} />
                    <span>Gerar Plano com IA</span>
                  </button>
                </div>
              </div>

              {/* Lista ou estado vazio */}
              {plans.length === 0 ? (
                <div style={{
                  border: '1px dashed #e5e7eb',
                  borderRadius: '12px',
                  padding: '60px 20px',
                  textAlign: 'center',
                  backgroundColor: '#f9fafb',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px'
                }}>
                  <FileText size={48} style={{ color: '#9ca3af', marginBottom: '4px' }} />
                  <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-color)' }}>
                    Nenhum plano alimentar gerado ainda
                  </span>
                  <p style={{ fontSize: '0.9rem', margin: 0, maxWidth: '340px' }}>
                    Gere um plano alimentar personalizado em segundos com Inteligência Artificial ou crie um plano manualmente do zero.
                  </p>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                    <button 
                      onClick={handleCreateManualPlan}
                      className="btn-secondary"
                      style={{ width: 'auto', padding: '10px 20px' }}
                    >
                      Criar Manualmente
                    </button>
                    <button 
                      onClick={handleGeneratePlanWithIA}
                      className="btn-primary" 
                      style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}
                    >
                      <Sparkles size={18} />
                      <span>Gerar com IA</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Exibição detalhada do plano selecionado */}
                  {selectedPlan && (
                    <div style={{
                      backgroundColor: '#f9fafb',
                      border: '1px solid var(--primary-color)',
                      borderRadius: '12px',
                      padding: '24px',
                      position: 'relative',
                      boxShadow: '0 4px 12px rgba(46, 125, 50, 0.05)'
                    }}>
                      <button 
                        onClick={() => setSelectedPlan(null)}
                        style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                      >
                        <X size={20} />
                      </button>
                      <h4 style={{ fontWeight: 700, color: 'var(--primary-color)', marginBottom: '20px', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileText size={18} />
                        Plano Alimentar de {formatDate(selectedPlan.created_at?.split('T')[0])}
                      </h4>
                      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '20px', maxHeight: '550px', overflowY: 'auto' }}>
                        {renderPlanContent(selectedPlan.conteudo)}
                      </div>
                    </div>
                  )}

                  {/* Lista dos planos */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {plans.map((plan) => (
                      <div 
                        key={plan.id} 
                        onClick={() => setSelectedPlan(plan)}
                        style={{
                          border: '1px solid #e5e7eb',
                          borderRadius: '10px',
                          padding: '16px 20px',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          backgroundColor: selectedPlan?.id === plan.id ? 'var(--primary-light)' : '#ffffff',
                          transition: 'var(--transition)'
                        }}
                        className="table-row-hover"
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <FileText size={22} style={{ color: 'var(--primary-color)' }} />
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-color)', fontSize: '0.95rem' }}>
                              Plano Alimentar de {formatDate(plan.created_at?.split('T')[0])}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              Gerado em {new Date(plan.created_at).toLocaleDateString('pt-BR')} às {new Date(plan.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                        <ArrowRight size={18} style={{ color: 'var(--primary-color)' }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
