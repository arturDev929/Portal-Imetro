import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TeacherLayout from "../layouts/TeacherLayout";
import { 
  FaSave, 
  FaChartLine, 
  FaCheckCircle,
  FaExclamationTriangle,
  FaGraduationCap,
  FaUserGraduate,
  FaSchool,
  FaClipboardList,
  FaClipboardCheck,
  FaExchangeAlt
} from "react-icons/fa";
import { 
  MdAssessment, 
  MdWarning,
  MdInfo,
  MdSchool,
  MdBarChart,
  MdCalculate
} from "react-icons/md";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import styles from "./AvaliacoesNotas.module.css";

// Funções de toast
const showSuccessToast = (title, message) => {
  const toast = document.createElement('div');
  toast.className = 'toast-notification toast-success';
  toast.innerHTML = `
    <div class="toast-content">
      <strong>${title}</strong>
      <p>${message}</p>
    </div>
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
};

const showErrorToast = (title, message) => {
  const toast = document.createElement('div');
  toast.className = 'toast-notification toast-error';
  toast.innerHTML = `
    <div class="toast-content">
      <strong>${title}</strong>
      <p>${message}</p>
    </div>
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
};

const showWarningToast = (title, message) => {
  const toast = document.createElement('div');
  toast.className = 'toast-notification toast-warning';
  toast.innerHTML = `
    <div class="toast-content">
      <strong>${title}</strong>
      <p>${message}</p>
    </div>
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
};

function AvaliacoesNotas() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [turmas, setTurmas] = useState([]);
  const [turmaSelecionada, setTurmaSelecionada] = useState(null);
  const [disciplinaSelecionada, setDisciplinaSelecionada] = useState(null);
  const [alunos, setAlunos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState('avaliacoes');

  // Configuração das avaliações regulares (0 a 5)
  const tiposAvaliacao = [
    { id: 1, nome: "Avaliação 1", peso: 1, maxNota: 5 },
    { id: 2, nome: "Avaliação 2", peso: 1, maxNota: 5 },
    { id: 3, nome: "Avaliação 3", peso: 1, maxNota: 5 },
    { id: 4, nome: "Avaliação 4", peso: 1, maxNota: 5 },
    { id: 5, nome: "Avaliação 5", peso: 1, maxNota: 5 }
  ];

  // Configuração do sistema MACs (0 a 20)
  const tiposMACs = [
    { id: 'macs', nome: 'MACs (PP1)', descricao: 'Convertido das avaliações', maxNota: 20 },
    { id: 'cpf', nome: 'CPF (PP2)', descricao: 'Segunda Prova', maxNota: 20 },
    { id: 'cae', nome: 'CAE (M.C)', descricao: 'Média das Cadeiras', maxNota: 20 },
    { id: 'exa', nome: 'EXA', descricao: 'Exame', maxNota: 20 },
    { id: 'cfe', nome: 'CFE (M.E)', descricao: 'Média do Exame', maxNota: 20 },
    { id: 'recurso', nome: 'RECURSO', descricao: 'Recurso', maxNota: 20 },
    { id: 'esp', nome: 'ESP.', descricao: 'Especialidade', maxNota: 20 }
  ];

  // Dados de exemplo
  const turmasExemplo = [
    { id: 1, nome: "Turma A - 3º Ano", periodo: "Manhã", ano: "2024" },
    { id: 2, nome: "Turma B - 2º Ano", periodo: "Tarde", ano: "2024" },
    { id: 3, nome: "Turma C - 1º Ano", periodo: "Manhã", ano: "2024" }
  ];

  const disciplinasExemplo = {
    1: [
      { id: 1, nome: "Matemática", carga: 4 },
      { id: 2, nome: "Português", carga: 4 },
      { id: 3, nome: "Ciências", carga: 3 }
    ],
    2: [
      { id: 4, nome: "Matemática", carga: 4 },
      { id: 5, nome: "História", carga: 3 },
      { id: 6, nome: "Geografia", carga: 3 }
    ],
    3: [
      { id: 7, nome: "Português", carga: 4 },
      { id: 8, nome: "Inglês", carga: 2 },
      { id: 9, nome: "Artes", carga: 2 }
    ]
  };

  const alunosExemplo = {
    1: [
      { id: 1, nome: "Ana Silva", matricula: "2024001" },
      { id: 2, nome: "Bruno Santos", matricula: "2024002" },
      { id: 3, nome: "Carla Oliveira", matricula: "2024003" },
      { id: 4, nome: "Daniel Souza", matricula: "2024004" },
      { id: 5, nome: "Elena Costa", matricula: "2024005" }
    ],
    2: [
      { id: 6, nome: "Fernando Lima", matricula: "2024006" },
      { id: 7, nome: "Gabriela Rocha", matricula: "2024007" },
      { id: 8, nome: "Henrique Alves", matricula: "2024008" }
    ],
    3: [
      { id: 9, nome: "Isabela Martins", matricula: "2024009" },
      { id: 10, nome: "João Pedro", matricula: "2024010" },
      { id: 11, nome: "Karina Lima", matricula: "2024011" }
    ]
  };

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem("usuarioLogado");
    if (usuarioSalvo) {
      const userData = JSON.parse(usuarioSalvo);
      setUser(userData);
      carregarTurmas();
    } else {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .toast-notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999;
        padding: 16px 20px;
        border-radius: 12px;
        color: white;
        font-size: 14px;
        animation: slideInRight 0.3s ease;
        max-width: 350px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      }
      
      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      .toast-success {
        background: linear-gradient(135deg, #28a745, #20c997);
      }
      
      .toast-error {
        background: linear-gradient(135deg, #dc3545, #c82333);
      }
      
      .toast-warning {
        background: linear-gradient(135deg, #ffc107, #e0a800);
        color: #333;
      }
      
      .toast-content strong {
        display: block;
        margin-bottom: 4px;
        font-size: 16px;
      }
      
      .toast-content p {
        margin: 0;
        font-size: 13px;
        opacity: 0.9;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const carregarTurmas = () => {
    setTurmas(turmasExemplo);
  };

  const carregarDisciplinas = (turmaId) => {
    setDisciplinaSelecionada(null);
    setTurmaSelecionada(turmas.find(t => t.id === turmaId));
    setAlunos([]);
  };

  const carregarAlunos = (disciplinaId) => {
    setDisciplinaSelecionada(disciplinaId);
    const alunosList = alunosExemplo[turmaSelecionada?.id] || [];
    
    const notasSalvas = localStorage.getItem(`notas_completas_${disciplinaId}`);
    let notasData = {};
    if (notasSalvas) {
      const parsed = JSON.parse(notasSalvas);
      notasData = parsed.alunos?.reduce((acc, aluno) => {
        acc[aluno.id] = aluno.notas;
        return acc;
      }, {}) || {};
    }
    
    setAlunos(alunosList.map(aluno => ({
      ...aluno,
      notas: notasData[aluno.id] || {
        // Avaliações regulares (0-5)
        av1: null, av2: null, av3: null, av4: null, av5: null,
        // Sistema MACs (0-20)
        macs: null, cpf: null, cae: null, exa: null, cfe: null, recurso: null, esp: null
      },
      // Resultados das avaliações regulares
      mediaAvaliacoes: null,
      mediaConvertida: null,
      situacaoAvaliacoes: "Pendente",
      // Resultados do sistema MACs
      situacaoMACs: "Pendente",
      mensagemMACs: "Aguardando notas"
    })));
    
    // Calcular situações
    setAlunos(prev => prev.map(aluno => {
      const resultadoAvaliacoes = calcularMediaAvaliacoes(aluno.notas);
      const resultadoMACs = calcularSituacaoMACs(aluno.notas);
      return { 
        ...aluno, 
        ...resultadoAvaliacoes,
        ...resultadoMACs
      };
    }));
  };

  // Função para converter nota de 0-5 para 0-20
  const converterParaVinte = (nota) => {
    if (nota === null || nota === undefined || isNaN(nota)) return null;
    return Math.round((nota * 4) * 10) / 10; // 5 * 4 = 20
  };

  // Função para calcular média das avaliações regulares (0-5)
  const calcularMediaAvaliacoes = (notas) => {
    const avs = [notas.av1, notas.av2, notas.av3, notas.av4, notas.av5];
    const notasValidas = avs.filter(n => n !== null && n !== undefined && !isNaN(n));
    
    if (notasValidas.length === 0) {
      return {
        mediaAvaliacoes: null,
        mediaConvertida: null,
        situacaoAvaliacoes: "Pendente"
      };
    }
    
    const soma = notasValidas.reduce((a, b) => a + b, 0);
    const media = Math.round((soma / notasValidas.length) * 10) / 10;
    const mediaConvertida = converterParaVinte(media);
    
    // Regra: se média >= 3.75 (equivale a 15 em 20), aprovado
    let situacao = "Reprovado";
    if (media >= 3.75) {
      situacao = "Aprovado (Dispensa)";
    } else if (media >= 2.5) {
      situacao = "Recuperação";
    }
    
    return {
      mediaAvaliacoes: media,
      mediaConvertida: mediaConvertida,
      situacaoAvaliacoes: situacao
    };
  };

  // Função para calcular situação do sistema MACs
  const calcularSituacaoMACs = (notas) => {
    // PP1 (MACs) é convertido automaticamente das avaliações
    const macs = notas.macs !== null ? notas.macs : null;
    const cpf = notas.cpf !== null ? notas.cpf : null;
    const cae = notas.cae !== null ? notas.cae : null;
    const exa = notas.exa !== null ? notas.exa : null;
    const recurso = notas.recurso !== null ? notas.recurso : null;
    const esp = notas.esp !== null ? notas.esp : null;

    // 1. Verificar dispensa por CAE >= 15
    if (cae !== null && cae >= 15) {
      return {
        situacaoMACs: "Dispensado (CAE ≥ 15)",
        mensagemMACs: `CAE = ${cae} - Dispensado`
      };
    }

    // 2. Verificar PP1 + PP2 (MACs + CPF)
    if (macs !== null && cpf !== null) {
      const somaPP = macs + cpf;
      const mediaPP = somaPP / 2;
      
      if (mediaPP >= 15) {
        return {
          situacaoMACs: "Aprovado (PP)",
          mensagemMACs: `(${macs} + ${cpf}) / 2 = ${mediaPP} ≥ 15`
        };
      }
    }

    // 3. Verificar EXA (CAE + EXA >= 20)
    if (cae !== null && exa !== null) {
      if (cae + exa >= 20) {
        return {
          situacaoMACs: "Aprovado (EXA)",
          mensagemMACs: `CAE(${cae}) + EXA(${exa}) = ${cae + exa} ≥ 20`
        };
      }
    }

    // 4. Verificar RECURSO (>= 10)
    if (recurso !== null && recurso >= 10) {
      return {
        situacaoMACs: "Aprovado (RECURSO)",
        mensagemMACs: `RECURSO = ${recurso} ≥ 10`
      };
    }

    // 5. Verificar ESP (>= 10)
    if (esp !== null && esp >= 10) {
      return {
        situacaoMACs: "Aprovado (ESP)",
        mensagemMACs: `ESP = ${esp} ≥ 10`
      };
    }

    // 6. Em recuperação ou reprovado
    if (cae !== null && exa !== null && cae + exa < 20) {
      if (recurso !== null && recurso < 10) {
        if (esp !== null && esp < 10) {
          return {
            situacaoMACs: "Reprovado",
            mensagemMACs: "Não atingiu os critérios de aprovação"
          };
        }
        return {
          situacaoMACs: "Em Recuperação (ESP)",
          mensagemMACs: "Aguardando ESP"
        };
      }
      if (recurso !== null && recurso < 10) {
        return {
          situacaoMACs: "Em Recuperação (RECURSO)",
          mensagemMACs: "Aguardando RECURSO"
        };
      }
      return {
        situacaoMACs: "Em Recuperação (EXA)",
        mensagemMACs: "Aguardando EXA"
      };
    }

    // 7. Pendente
    return {
      situacaoMACs: "Pendente",
      mensagemMACs: "Aguardando notas"
    };
  };

  // Atualizar automaticamente o MACs (PP1) quando as avaliações mudarem
  const atualizarMACs = (notas) => {
    const avs = [notas.av1, notas.av2, notas.av3, notas.av4, notas.av5];
    const notasValidas = avs.filter(n => n !== null && n !== undefined && !isNaN(n));
    
    if (notasValidas.length === 0) {
      return null;
    }
    
    const soma = notasValidas.reduce((a, b) => a + b, 0);
    const media = soma / notasValidas.length;
    return converterParaVinte(media);
  };

  const handleNotaChange = (alunoId, campo, valor) => {
    if (valor === '') {
      setAlunos(prev => prev.map(aluno => {
        if (aluno.id === alunoId) {
          const novasNotas = { ...aluno.notas, [campo]: null };
          
          // Se for uma avaliação regular, atualiza automaticamente o MACs
          if (campo.startsWith('av')) {
            const macsConvertido = atualizarMACs(novasNotas);
            if (macsConvertido !== null) {
              novasNotas.macs = macsConvertido;
            }
          }
          
          const resultadoAvaliacoes = calcularMediaAvaliacoes(novasNotas);
          const resultadoMACs = calcularSituacaoMACs(novasNotas);
          return { 
            ...aluno, 
            notas: novasNotas,
            ...resultadoAvaliacoes,
            ...resultadoMACs
          };
        }
        return aluno;
      }));
      return;
    }
    
    let nota = parseFloat(valor);
    if (isNaN(nota)) return;
    
    // Validação diferente para avaliações regulares (0-5) e MACs (0-20)
    const isAvaliacao = campo.startsWith('av');
    const maxNota = isAvaliacao ? 5 : 20;
    
    if (nota < 0 || nota > maxNota) {
      showWarningToast("Atenção", `A nota deve estar entre 0 e ${maxNota}`);
      return;
    }
    
    // Arredondar para 1 casa decimal
    nota = Math.round(nota * 10) / 10;

    setAlunos(prev => prev.map(aluno => {
      if (aluno.id === alunoId) {
        const novasNotas = { ...aluno.notas, [campo]: nota };
        
        // Se for uma avaliação regular, atualiza automaticamente o MACs
        if (campo.startsWith('av')) {
          const macsConvertido = atualizarMACs(novasNotas);
          if (macsConvertido !== null) {
            novasNotas.macs = macsConvertido;
          }
        }
        
        const resultadoAvaliacoes = calcularMediaAvaliacoes(novasNotas);
        const resultadoMACs = calcularSituacaoMACs(novasNotas);
        return { 
          ...aluno, 
          notas: novasNotas,
          ...resultadoAvaliacoes,
          ...resultadoMACs
        };
      }
      return aluno;
    }));
  };

  const salvarNotas = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const dados = {
        turma: turmaSelecionada,
        disciplinaId: disciplinaSelecionada,
        alunos: alunos,
        data: new Date().toISOString()
      };
      
      localStorage.setItem(`notas_completas_${disciplinaSelecionada}`, JSON.stringify(dados));
      
      showSuccessToast("Sucesso", "Notas salvas com sucesso!");
    } catch (error) {
      showErrorToast("Erro", "Erro ao salvar notas");
    } finally {
      setLoading(false);
    }
  };

  // Estatísticas das avaliações regulares
  const estatisticasAvaliacoes = {
    totalAlunos: alunos.length,
    aprovados: alunos.filter(a => a.situacaoAvaliacoes === "Aprovado (Dispensa)").length,
    recuperacao: alunos.filter(a => a.situacaoAvaliacoes === "Recuperação").length,
    reprovados: alunos.filter(a => a.situacaoAvaliacoes === "Reprovado").length,
    pendentes: alunos.filter(a => a.situacaoAvaliacoes === "Pendente").length,
    mediaGeral: alunos.filter(a => a.mediaAvaliacoes !== null).reduce((sum, a) => sum + a.mediaAvaliacoes, 0) / alunos.filter(a => a.mediaAvaliacoes !== null).length || 0,
    mediaGeralConvertida: alunos.filter(a => a.mediaConvertida !== null).reduce((sum, a) => sum + a.mediaConvertida, 0) / alunos.filter(a => a.mediaConvertida !== null).length || 0,
    taxaAprovacao: alunos.filter(a => a.situacaoAvaliacoes !== "Pendente").length > 0 
      ? Math.round((alunos.filter(a => a.situacaoAvaliacoes === "Aprovado (Dispensa)").length / alunos.filter(a => a.situacaoAvaliacoes !== "Pendente").length) * 100) 
      : 0
  };

  // Estatísticas do sistema MACs
  const estatisticasMACs = {
    totalAlunos: alunos.length,
    aprovados: alunos.filter(a => a.situacaoMACs && a.situacaoMACs.includes("Aprovado")).length,
    dispensados: alunos.filter(a => a.situacaoMACs === "Dispensado (CAE ≥ 15)").length,
    recuperacao: alunos.filter(a => a.situacaoMACs && a.situacaoMACs.includes("Recuperação")).length,
    reprovados: alunos.filter(a => a.situacaoMACs === "Reprovado").length,
    pendentes: alunos.filter(a => a.situacaoMACs === "Pendente").length,
    taxaAprovacao: alunos.filter(a => a.situacaoMACs !== "Pendente").length > 0 
      ? Math.round((alunos.filter(a => a.situacaoMACs && a.situacaoMACs.includes("Aprovado")).length / alunos.filter(a => a.situacaoMACs !== "Pendente").length) * 100) 
      : 0
  };

  // Dados para gráficos
  const dadosDistribuicaoAvaliacoes = [
    { name: "Aprovados", value: estatisticasAvaliacoes.aprovados, color: "#28a745" },
    { name: "Recuperação", value: estatisticasAvaliacoes.recuperacao, color: "#ffc107" },
    { name: "Reprovados", value: estatisticasAvaliacoes.reprovados, color: "#dc3545" },
    { name: "Pendentes", value: estatisticasAvaliacoes.pendentes, color: "#6c757d" }
  ].filter(item => item.value > 0);

  const dadosDesempenhoAvaliacoes = alunos.map(aluno => ({
    nome: aluno.nome.split(' ')[0],
    media: aluno.mediaAvaliacoes || 0,
    mediaConvertida: aluno.mediaConvertida || 0,
    situacao: aluno.situacaoAvaliacoes
  }));

  return (
    <TeacherLayout>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>
              <FaGraduationCap className={styles.titleIcon} />
              Sistema de Avaliações
            </h1>
            <p className={styles.subtitle}>
              Avaliações (0-5) com conversão automática para MACs (PP1) • Sistema MACs (0-20)
            </p>
          </div>
        </div>

        {/* Seleção de Turma e Disciplina */}
        <div className={styles.selectionSection}>
          <div className={styles.selectionCard}>
            <h3 className={styles.selectionTitle}>
              <MdSchool className={styles.selectionIcon} />
              Selecione Turma e Disciplina
            </h3>
            <div className={styles.selectionGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Turma</label>
                <select 
                  className={styles.select}
                  value={turmaSelecionada?.id || ""}
                  onChange={(e) => carregarDisciplinas(parseInt(e.target.value))}
                >
                  <option value="">Selecione uma turma</option>
                  {turmas.map(turma => (
                    <option key={turma.id} value={turma.id}>
                      {turma.nome} - {turma.periodo} ({turma.ano})
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Disciplina</label>
                <select 
                  className={styles.select}
                  value={disciplinaSelecionada || ""}
                  onChange={(e) => carregarAlunos(parseInt(e.target.value))}
                  disabled={!turmaSelecionada}
                >
                  <option value="">Selecione uma disciplina</option>
                  {turmaSelecionada && disciplinasExemplo[turmaSelecionada.id]?.map(disciplina => (
                    <option key={disciplina.id} value={disciplina.id}>
                      {disciplina.nome} ({disciplina.carga}h/semana)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {disciplinaSelecionada && (
          <>
            {/* Abas de navegação */}
            <div className={styles.tabsContainer}>
              <button 
                className={`${styles.tabButton} ${abaAtiva === 'avaliacoes' ? styles.tabActive : ''}`}
                onClick={() => setAbaAtiva('avaliacoes')}
              >
                <FaClipboardList />
                Avaliações (0-5)
                <span className={styles.tabBadge}>
                  {alunos.filter(a => a.situacaoAvaliacoes === "Aprovado (Dispensa)").length}/{alunos.length}
                </span>
              </button>
              <button 
                className={`${styles.tabButton} ${abaAtiva === 'macs' ? styles.tabActive : ''}`}
                onClick={() => setAbaAtiva('macs')}
              >
                <FaClipboardCheck />
                Sistema MACs (0-20)
                <span className={styles.tabBadge}>
                  {alunos.filter(a => a.situacaoMACs && a.situacaoMACs.includes("Aprovado")).length}/{alunos.length}
                </span>
              </button>
            </div>

            {/* Conteúdo da Aba de Avaliações Regulares */}
            {abaAtiva === 'avaliacoes' && (
              <div className={styles.tabContent}>
                {/* Regras das Avaliações */}
                <div className={styles.infoCard}>
                  <div className={styles.infoContent}>
                    <MdInfo className={styles.infoIcon} />
                    <div>
                      <strong>Regras das Avaliações Regulares (0-5):</strong>
                      <ul className={styles.infoList}>
                        <li><strong>Média:</strong> Soma das 5 avaliações ÷ 5 (0-5)</li>
                        <li><strong>Conversão:</strong> Média × 4 = Nota em 20 valores</li>
                        <li><strong>Dispensa:</strong> Média ≥ 3.75 (15 em 20) → Aprovado</li>
                        <li><strong>Recuperação:</strong> Média entre 2.5 e 3.74 (10-14.9 em 20)</li>
                        <li><strong>Reprovação:</strong> Média &lt; 2.5 (10 em 20)</li>
                        <li><strong>MACs (PP1):</strong> Atualizado automaticamente com a média convertida</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Estatísticas das Avaliações */}
                <div className={styles.statsSection}>
                  <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                      <div className={styles.statIcon} style={{ background: "#e3f2fd", color: "#1976d2" }}>
                        <FaUserGraduate />
                      </div>
                      <div className={styles.statInfo}>
                        <span className={styles.statLabel}>Total de Alunos</span>
                        <strong className={styles.statValue}>{estatisticasAvaliacoes.totalAlunos}</strong>
                      </div>
                    </div>
                    <div className={styles.statCard}>
                      <div className={styles.statIcon} style={{ background: "#e8f5e9", color: "#388e3c" }}>
                        <FaCheckCircle />
                      </div>
                      <div className={styles.statInfo}>
                        <span className={styles.statLabel}>Aprovados (Dispensa)</span>
                        <strong className={styles.statValue}>{estatisticasAvaliacoes.aprovados}</strong>
                        <small className={styles.statDetail}>Média ≥ 3.75 (15/20)</small>
                      </div>
                    </div>
                    <div className={styles.statCard}>
                      <div className={styles.statIcon} style={{ background: "#fff3e0", color: "#f57c00" }}>
                        <MdWarning />
                      </div>
                      <div className={styles.statInfo}>
                        <span className={styles.statLabel}>Recuperação</span>
                        <strong className={styles.statValue}>{estatisticasAvaliacoes.recuperacao}</strong>
                        <small className={styles.statDetail}>Média 2.5 - 3.74</small>
                      </div>
                    </div>
                    <div className={styles.statCard}>
                      <div className={styles.statIcon} style={{ background: "#ffebee", color: "#d32f2f" }}>
                        <FaExclamationTriangle />
                      </div>
                      <div className={styles.statInfo}>
                        <span className={styles.statLabel}>Reprovados</span>
                        <strong className={styles.statValue}>{estatisticasAvaliacoes.reprovados}</strong>
                        <small className={styles.statDetail}>Média &lt; 2.5</small>
                      </div>
                    </div>
                  </div>

                  {/* Gráficos das Avaliações */}
                  <div className={styles.chartsSection}>
                    {dadosDistribuicaoAvaliacoes.length > 0 && (
                      <div className={styles.chartCard}>
                        <h4 className={styles.chartTitle}>Distribuição - Avaliações</h4>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={dadosDistribuicaoAvaliacoes}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                            >
                              {dadosDistribuicaoAvaliacoes.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    <div className={styles.chartCard}>
                      <h4 className={styles.chartTitle}>Médias por Aluno (0-5 e Convertida)</h4>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={dadosDesempenhoAvaliacoes}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="nome" />
                          <YAxis domain={[0, 20]} />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="media" fill="#1976d2" name="Média (0-5)" />
                          <Bar dataKey="mediaConvertida" fill="#ff9800" name="Convertida (0-20)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Tabela de Avaliações Regulares */}
                <div className={styles.tableSection}>
                  <div className={styles.tableHeader}>
                    <h3 className={styles.tableTitle}>
                      <MdAssessment />
                      Lançamento de Notas (0 a 5)
                    </h3>
                    <div className={styles.tableActions}>
                      <button 
                        className={styles.btnSave}
                        onClick={salvarNotas}
                        disabled={loading}
                      >
                        <FaSave />
                        {loading ? "Salvando..." : "Salvar Notas"}
                      </button>
                    </div>
                  </div>

                  <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th className={styles.thAluno}>Aluno</th>
                          <th className={styles.thMatricula}>Matrícula</th>
                          {tiposAvaliacao.map(av => (
                            <th key={av.id} className={styles.thNota}>
                              {av.nome}
                              <small>0-5</small>
                            </th>
                          ))}
                          <th className={styles.thTotal}>Média</th>
                          <th className={styles.thTotal}>Convertida</th>
                          <th className={styles.thSituacao}>Situação</th>
                        </tr>
                      </thead>
                      <tbody>
                        {alunos.map(aluno => {
                          const media = aluno.mediaAvaliacoes;
                          const mediaConv = aluno.mediaConvertida;
                          const isDispensado = media !== null && media >= 3.75;

                          return (
                            <tr key={aluno.id}>
                              <td className={styles.tdAluno}>
                                <strong>{aluno.nome}</strong>
                              </td>
                              <td className={styles.tdMatricula}>{aluno.matricula}</td>
                              {tiposAvaliacao.map(av => (
                                <td key={av.id} className={styles.tdNota}>
                                  <input
                                    type="number"
                                    className={`${styles.notaInput} ${isDispensado ? styles.notaDispensado : ''}`}
                                    value={aluno.notas[`av${av.id}`] || ""}
                                    onChange={(e) => handleNotaChange(aluno.id, `av${av.id}`, e.target.value)}
                                    step="0.1"
                                    min="0"
                                    max="5"
                                    placeholder="0-5"
                                  />
                                </td>
                              ))}
                              <td className={styles.tdTotal}>
                                <span className={`${styles.totalNota} ${isDispensado ? styles.totalDispensado : ''}`}>
                                  {media !== null ? media.toFixed(1) : "-"}
                                </span>
                              </td>
                              <td className={styles.tdTotal}>
                                <span className={styles.totalEquivalente}>
                                  {mediaConv !== null ? mediaConv.toFixed(1) : "-"}
                                </span>
                              </td>
                              <td className={styles.tdSituacao}>
                                <span className={`${styles.situacaoBadge} ${
                                  aluno.situacaoAvaliacoes === "Aprovado (Dispensa)" 
                                    ? styles.situacaoAprovado 
                                    : aluno.situacaoAvaliacoes === "Recuperação" 
                                    ? styles.situacaoRecuperacao 
                                    : aluno.situacaoAvaliacoes === "Reprovado" 
                                    ? styles.situacaoReprovado 
                                    : styles.situacaoPendente
                                }`}>
                                  {aluno.situacaoAvaliacoes}
                                  {isDispensado && <small style={{ display: 'block', fontSize: '9px' }}>✓ Dispensado</small>}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Conteúdo da Aba Sistema MACs */}
            {abaAtiva === 'macs' && (
              <div className={styles.tabContent}>
                {/* Regras do Sistema MACs */}
                <div className={styles.infoCard}>
                  <div className={styles.infoContent}>
                    <MdInfo className={styles.infoIcon} />
                    <div>
                      <strong>Regras do Sistema MACs (0-20):</strong>
                      <ul className={styles.infoList}>
                        <li><strong>MACs (PP1):</strong> Convertido automaticamente das avaliações (média × 4)</li>
                        <li><strong>CPF (PP2):</strong> Segunda Prova (0-20)</li>
                        <li><strong>CAE (M.C):</strong> Média das Cadeiras</li>
                        <li><strong>EXA:</strong> Exame (CAE + EXA ≥ 20 → Aprovado)</li>
                        <li><strong>CFE (M.E):</strong> Média do Exame</li>
                        <li><strong>RECURSO:</strong> ≥ 10 → Aprovado</li>
                        <li><strong>ESP:</strong> ≥ 10 → Aprovado</li>
                        <li><strong>Dispensa:</strong> CAE ≥ 15 → Aprovado</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Tabela do Sistema MACs */}
                <div className={styles.tableSection}>
                  <div className={styles.tableHeader}>
                    <h3 className={styles.tableTitle}>
                      <MdAssessment />
                      Lançamento de Notas - Sistema MACs (0 a 20)
                    </h3>
                    <div className={styles.tableActions}>
                      <button 
                        className={styles.btnSave}
                        onClick={salvarNotas}
                        disabled={loading}
                      >
                        <FaSave />
                        {loading ? "Salvando..." : "Salvar Notas"}
                      </button>
                    </div>
                  </div>

                  <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th className={styles.thAluno}>Aluno</th>
                          <th className={styles.thMatricula}>Matrícula</th>
                          {tiposMACs.map(av => (
                            <th key={av.id} className={styles.thNota}>
                              {av.nome}
                              <small>{av.descricao}</small>
                            </th>
                          ))}
                          <th className={styles.thSituacao}>Situação</th>
                        </tr>
                      </thead>
                      <tbody>
                        {alunos.map(aluno => {
                          const isDispensado = aluno.situacaoMACs === "Dispensado (CAE ≥ 15)";
                          const isMACsAuto = true; // MACs é preenchido automaticamente
                          
                          return (
                            <tr key={aluno.id}>
                              <td className={styles.tdAluno}>
                                <strong>{aluno.nome}</strong>
                                <small style={{ display: 'block', fontSize: '10px', color: '#28a745' }}>
                                  {aluno.notas.macs !== null && `PP1 Convertido: ${aluno.notas.macs}`}
                                </small>
                              </td>
                              <td className={styles.tdMatricula}>{aluno.matricula}</td>
                              {tiposMACs.map(av => {
                                let disabled = false;
                                if (av.id === 'macs') disabled = true; // MACs é automático
                                if (av.id === 'exa' && isDispensado) disabled = true;
                                if (av.id === 'cfe' && !aluno.notas.cae) disabled = true;
                                if (av.id === 'recurso' && !aluno.notas.exa) disabled = true;
                                if (av.id === 'esp' && !aluno.notas.recurso) disabled = true;

                                return (
                                  <td key={av.id} className={styles.tdNota}>
                                    <input
                                      type="number"
                                      className={`${styles.notaInput} ${av.id === 'macs' ? styles.notaAuto : ''} ${av.id === 'cae' && aluno.notas.cae >= 15 ? styles.notaDispensado : ''}`}
                                      value={aluno.notas[av.id] || ""}
                                      onChange={(e) => handleNotaChange(aluno.id, av.id, e.target.value)}
                                      step="0.1"
                                      min="0"
                                      max="20"
                                      placeholder="0-20"
                                      disabled={disabled}
                                    />
                                    {av.id === 'macs' && aluno.notas.macs !== null && (
                                      <span style={{ fontSize: '10px', color: '#1976d2', display: 'block' }}>
                                        ← Auto
                                      </span>
                                    )}
                                    {av.id === 'cae' && aluno.notas.cae >= 15 && (
                                      <span style={{ fontSize: '10px', color: '#28a745', display: 'block' }}>✓ Dispensa</span>
                                    )}
                                    {av.id === 'exa' && isDispensado && (
                                      <span style={{ fontSize: '10px', color: '#999', display: 'block' }}>Dispensado</span>
                                    )}
                                  </td>
                                );
                              })}
                              <td className={styles.tdSituacao}>
                                <span className={`${styles.situacaoBadge} ${
                                  aluno.situacaoMACs && aluno.situacaoMACs.includes("Aprovado") 
                                    ? styles.situacaoAprovado 
                                    : aluno.situacaoMACs && aluno.situacaoMACs.includes("Dispensado")
                                    ? styles.situacaoDispensado
                                    : aluno.situacaoMACs && aluno.situacaoMACs.includes("Recuperação")
                                    ? styles.situacaoRecuperacao 
                                    : aluno.situacaoMACs === "Reprovado"
                                    ? styles.situacaoReprovado 
                                    : styles.situacaoPendente
                                }`}>
                                  {aluno.situacaoMACs || "Pendente"}
                                  <small style={{ display: 'block', fontSize: '9px', marginTop: '2px' }}>
                                    {aluno.mensagemMACs}
                                  </small>
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </TeacherLayout>
  );
}

export default AvaliacoesNotas;