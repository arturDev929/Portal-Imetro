import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import TeacherLayout from "../layouts/TeacherLayout";
import { 
  FaSave, 
  FaEdit, 
  FaTrash, 
  FaPlus, 
  FaChartLine, 
  FaDownload,
  FaEye,
  FaCheckCircle,
  FaExclamationTriangle
} from "react-icons/fa";
import { 
  MdAssessment, 
  MdCalculate, 
  MdWarning,
  MdInfo,
  MdSchool
} from "react-icons/md";
import { 
  LineChart, 
  Line, 
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
  Cell
} from 'recharts';
import styles from "./AvaliacoesNotas.module.css";

// Funções de toast personalizadas
const showSuccessToast = (title, message, details = null) => {
  const toast = document.createElement('div');
  toast.className = 'toast-notification toast-success';
  toast.innerHTML = `
    <div class="toast-content">
      <strong>${title}</strong>
      <p>${message}</p>
      ${details ? `<small>${Object.entries(details).map(([k,v]) => `${k}: ${v}`).join(' • ')}</small>` : ''}
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
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editando, setEditando] = useState(false);

  // Configuração das avaliações
  const tiposAvaliacao = [
    { id: 1, nome: "Avaliação 1", peso: 1, descricao: "Primeira avaliação (0-5)" },
    { id: 2, nome: "Avaliação 2", peso: 1, descricao: "Segunda avaliação (0-5)" },
    { id: 3, nome: "Avaliação 3", peso: 1, descricao: "Terceira avaliação (0-5)" },
    { id: 4, nome: "Avaliação 4", peso: 1, descricao: "Quarta avaliação (0-5)" },
    { id: 5, nome: "Avaliação 5", peso: 1, descricao: "Quinta avaliação (0-5)" }
  ];

  // Função para converter nota de 0-5 para 0-20
  const converterParaVinte = (nota) => {
    if (nota === null || nota === undefined || isNaN(nota)) return null;
    return nota * 4; // 5 -> 20, 2.5 -> 10, etc
  };

  // Função para converter nota de 0-20 para 0-5
  const converterParaCinco = (nota) => {
    if (nota === null || nota === undefined || isNaN(nota)) return null;
    return nota / 4;
  };

  // Dados de exemplo (simulando API)
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
      
      .toast-content small {
        display: block;
        margin-top: 4px;
        font-size: 11px;
        opacity: 0.8;
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
  };

  const carregarAlunos = (disciplinaId) => {
    setDisciplinaSelecionada(disciplinaId);
    const alunosList = alunosExemplo[turmaSelecionada?.id] || [];
    
    const notasSalvas = localStorage.getItem(`notas_${disciplinaId}`);
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
        1: null, 2: null, 3: null, 4: null, 5: null
      },
      total: null,
      totalVinte: null,
      situacao: "Pendente"
    })));
    
    setAlunos(prev => prev.map(aluno => {
      const total = calcularTotal(aluno.notas);
      const totalVinte = total !== null ? total * 4 : null;
      const situacao = total >= 2.5 ? "Aprovado" : total >= 1.75 ? "Recuperação" : total === null ? "Pendente" : "Reprovado";
      return { ...aluno, total, totalVinte, situacao };
    }));
    
    carregarAvaliacoes(disciplinaId);
  };

  const carregarAvaliacoes = (disciplinaId) => {
    const avaliacoesSalvas = localStorage.getItem(`avaliacoes_${disciplinaId}`);
    if (avaliacoesSalvas) {
      setAvaliacoes(JSON.parse(avaliacoesSalvas));
    } else {
      setAvaliacoes([]);
    }
  };

  const handleNotaChange = (alunoId, avaliacaoId, valor) => {
    if (valor === '') {
      setAlunos(prev => prev.map(aluno => {
        if (aluno.id === alunoId) {
          const novasNotas = { ...aluno.notas, [avaliacaoId]: null };
          const total = calcularTotal(novasNotas);
          const totalVinte = total !== null ? total * 4 : null;
          const situacao = total >= 2.5 ? "Aprovado" : total >= 1.75 ? "Recuperação" : total === null ? "Pendente" : "Reprovado";
          return {
            ...aluno,
            notas: novasNotas,
            total,
            totalVinte,
            situacao
          };
        }
        return aluno;
      }));
      return;
    }
    
    let nota = parseFloat(valor);
    if (isNaN(nota)) return;
    
    // Validar nota entre 0 e 5
    if (nota < 0 || nota > 5) {
      showWarningToast("Atenção", "A nota deve estar entre 0 e 5");
      return;
    }
    
    // Arredondar para 1 casa decimal
    nota = Math.round(nota * 10) / 10;

    setAlunos(prev => prev.map(aluno => {
      if (aluno.id === alunoId) {
        const novasNotas = { ...aluno.notas, [avaliacaoId]: nota };
        const total = calcularTotal(novasNotas);
        const totalVinte = total !== null ? total * 4 : null;
        const situacao = total >= 2.5 ? "Aprovado" : total >= 1.75 ? "Recuperação" : "Reprovado";
        return {
          ...aluno,
          notas: novasNotas,
          total,
          totalVinte,
          situacao
        };
      }
      return aluno;
    }));
  };

  const calcularTotal = (notas) => {
    let soma = 0;
    let count = 0;
    for (let i = 1; i <= 5; i++) {
      if (notas[i] !== null && notas[i] !== undefined && !isNaN(notas[i])) {
        soma += notas[i];
        count++;
      }
    }
    if (count === 0) return null;
    const media = soma / count;
    return Math.round(media * 10) / 10;
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
      
      localStorage.setItem(`notas_${disciplinaSelecionada}`, JSON.stringify(dados));
      
      const novasAvaliacoes = tiposAvaliacao.map(av => ({
        ...av,
        media: calcularMediaTurma(av.id),
        mediaVinte: calcularMediaTurma(av.id) * 4,
        maiorNota: calcularMaiorNota(av.id),
        menorNota: calcularMenorNota(av.id)
      }));
      setAvaliacoes(novasAvaliacoes);
      localStorage.setItem(`avaliacoes_${disciplinaSelecionada}`, JSON.stringify(novasAvaliacoes));
      
      showSuccessToast("Sucesso", "Notas salvas com sucesso!");
    } catch (error) {
      showErrorToast("Erro", "Erro ao salvar notas");
    } finally {
      setLoading(false);
    }
  };

  const calcularMediaTurma = (avaliacaoId) => {
    let soma = 0;
    let count = 0;
    alunos.forEach(aluno => {
      if (aluno.notas[avaliacaoId] !== null && !isNaN(aluno.notas[avaliacaoId])) {
        soma += aluno.notas[avaliacaoId];
        count++;
      }
    });
    return count > 0 ? Math.round((soma / count) * 10) / 10 : 0;
  };

  const calcularMaiorNota = (avaliacaoId) => {
    let maior = 0;
    alunos.forEach(aluno => {
      const nota = aluno.notas[avaliacaoId];
      if (nota !== null && !isNaN(nota) && nota > maior) {
        maior = nota;
      }
    });
    return maior;
  };

  const calcularMenorNota = (avaliacaoId) => {
    let menor = 5;
    alunos.forEach(aluno => {
      const nota = aluno.notas[avaliacaoId];
      if (nota !== null && !isNaN(nota) && nota < menor) {
        menor = nota;
      }
    });
    return menor === 5 ? 0 : menor;
  };

  const estatisticasTurma = {
    mediaGeral: alunos.length > 0 
      ? Math.round((alunos.reduce((sum, a) => sum + (a.total || 0), 0) / alunos.filter(a => a.total !== null).length) * 10) / 10 
      : 0,
    mediaGeralVinte: alunos.length > 0 
      ? Math.round((alunos.reduce((sum, a) => sum + (a.totalVinte || 0), 0) / alunos.filter(a => a.totalVinte !== null).length) * 10) / 10 
      : 0,
    aprovados: alunos.filter(a => a.situacao === "Aprovado").length,
    recuperacao: alunos.filter(a => a.situacao === "Recuperação").length,
    reprovados: alunos.filter(a => a.situacao === "Reprovado").length,
    pendentes: alunos.filter(a => a.situacao === "Pendente").length,
    taxaAprovacao: alunos.filter(a => a.situacao !== "Pendente").length > 0 
      ? Math.round((alunos.filter(a => a.situacao === "Aprovado").length / alunos.filter(a => a.situacao !== "Pendente").length) * 100) 
      : 0
  };

  const dadosDesempenho = alunos.map(aluno => ({
    nome: aluno.nome.split(' ')[0],
    total: aluno.total || 0,
    totalVinte: aluno.totalVinte || 0,
    situacao: aluno.situacao
  }));

  const dadosDistribuicao = [
    { name: "Aprovados (≥ 2.5)", value: estatisticasTurma.aprovados, color: "#28a745" },
    { name: "Recuperação (1.75-2.49)", value: estatisticasTurma.recuperacao, color: "#ffc107" },
    { name: "Reprovados (< 1.75)", value: estatisticasTurma.reprovados, color: "#dc3545" },
    { name: "Pendentes", value: estatisticasTurma.pendentes, color: "#6c757d" }
  ].filter(item => item.value > 0);

  const dadosAvaliacoes = avaliacoes.map((av, index) => ({
    nome: `Av${index + 1}`,
    media: av.media || 0,
    mediaVinte: av.mediaVinte || 0,
    maior: av.maiorNota || 0,
    menor: av.menorNota || 0
  }));

  return (
    <TeacherLayout>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>
              <MdAssessment className={styles.titleIcon} />
              Avaliações e Notas
            </h1>
            <p className={styles.subtitle}>
              Gerencie as 5 avaliações (notas de 0 a 5) - Equivalência: 5 = 20 valores
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
            {/* Estatísticas da Turma */}
            <div className={styles.statsSection}>
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statIcon} style={{ background: "#e3f2fd", color: "#1976d2" }}>
                    <FaChartLine />
                  </div>
                  <div className={styles.statInfo}>
                    <span className={styles.statLabel}>Média Geral (0-5)</span>
                    <strong className={styles.statValue}>{estatisticasTurma.mediaGeral || 0}</strong>
                    <small className={styles.statDetail}>
                      Equivalente: {(estatisticasTurma.mediaGeral * 4).toFixed(1)} valores
                    </small>
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statIcon} style={{ background: "#e8f5e9", color: "#388e3c" }}>
                    <FaCheckCircle />
                  </div>
                  <div className={styles.statInfo}>
                    <span className={styles.statLabel}>Aprovados</span>
                    <strong className={styles.statValue}>{estatisticasTurma.aprovados}</strong>
                    <small className={styles.statDetail}>Nota ≥ 2.5 (≥ 10 valores)</small>
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statIcon} style={{ background: "#fff3e0", color: "#f57c00" }}>
                    <MdWarning />
                  </div>
                  <div className={styles.statInfo}>
                    <span className={styles.statLabel}>Recuperação</span>
                    <strong className={styles.statValue}>{estatisticasTurma.recuperacao}</strong>
                    <small className={styles.statDetail}>Nota 1.75 - 2.49 (7-9.9 valores)</small>
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statIcon} style={{ background: "#ffebee", color: "#d32f2f" }}>
                    <FaExclamationTriangle />
                  </div>
                  <div className={styles.statInfo}>
                    <span className={styles.statLabel}>Reprovados</span>
                    <strong className={styles.statValue}>{estatisticasTurma.reprovados}</strong>
                    <small className={styles.statDetail}>Nota &lt; 1.75 (&lt; 7 valores)</small>
                  </div>
                </div>
              </div>

              {/* Gráficos */}
              <div className={styles.chartsSection}>
                <div className={styles.chartCard}>
                  <h4 className={styles.chartTitle}>Desempenho por Aluno (Nota Final)</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dadosDesempenho}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="nome" />
                      <YAxis domain={[0, 5]} label={{ value: 'Nota (0-5)', position: 'insideLeft', angle: -90 }} />
                      <Tooltip formatter={(value) => [`${value} (equiv. ${value * 4} valores)`, 'Nota Final']} />
                      <Legend />
                      <Bar dataKey="total" fill="var(--dourado)" name="Nota Final (0-5)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {dadosDistribuicao.length > 0 && (
                  <div className={styles.chartCard}>
                    <h4 className={styles.chartTitle}>Distribuição de Resultados</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={dadosDistribuicao}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        >
                          {dadosDistribuicao.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {dadosAvaliacoes.length > 0 && (
                  <div className={styles.chartCard}>
                    <h4 className={styles.chartTitle}>Média das Avaliações</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={dadosAvaliacoes}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="nome" />
                        <YAxis domain={[0, 5]} label={{ value: 'Nota (0-5)', position: 'insideLeft', angle: -90 }} />
                        <Tooltip formatter={(value) => [`${value} (equiv. ${value * 4} valores)`, '']} />
                        <Legend />
                        <Line type="monotone" dataKey="media" stroke="var(--azul-escuro)" name="Média" strokeWidth={2} />
                        <Line type="monotone" dataKey="maior" stroke="#28a745" name="Maior Nota" strokeWidth={2} />
                        <Line type="monotone" dataKey="menor" stroke="#dc3545" name="Menor Nota" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>

            {/* Informações da Escala */}
            <div className={styles.infoCard}>
              <div className={styles.infoContent}>
                <MdInfo className={styles.infoIcon} />
                <div>
                  <strong>Escala de Avaliação:</strong>
                  <ul className={styles.infoList}>
                    <li>Nota 5.0 = 20 valores (Excelente)</li>
                    <li>Nota 4.0 = 16 valores (Muito Bom)</li>
                    <li>Nota 3.0 = 12 valores (Bom)</li>
                    <li>Nota 2.5 = 10 valores (Aprovação mínima)</li>
                    <li>Nota 1.75 = 7 valores (Recuperação)</li>
                    <li>Nota 0.0 = 0 valores (Reprovado)</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Tabela de Notas */}
            <div className={styles.tableSection}>
              <div className={styles.tableHeader}>
                <h3 className={styles.tableTitle}>
                  Lançamento de Notas (0 a 5)
                </h3>
                <div className={styles.tableActions}>
                  <button 
                    className={styles.btnSave}
                    onClick={salvarNotas}
                    disabled={loading}
                  >
                    <FaSave className="me-2" />
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
                          <small>{av.descricao}</small>
                        </th>
                      ))}
                      <th className={styles.thTotal}>Média Final</th>
                      <th className={styles.thTotal}>Equivalente</th>
                      <th className={styles.thSituacao}>Situação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alunos.map(aluno => (
                      <tr key={aluno.id}>
                        <td className={styles.tdAluno}>
                          <strong>{aluno.nome}</strong>
                        </td>
                        <td className={styles.tdMatricula}>{aluno.matricula}</td>
                        {tiposAvaliacao.map(av => (
                          <td key={av.id} className={styles.tdNota}>
                            <input
                              type="number"
                              className={styles.notaInput}
                              value={aluno.notas[av.id] || ""}
                              onChange={(e) => handleNotaChange(aluno.id, av.id, e.target.value)}
                              step="0.1"
                              min="0"
                              max="5"
                              placeholder="0-5"
                            />
                          </td>
                        ))}
                        <td className={styles.tdTotal}>
                          <span className={styles.totalNota}>
                            {aluno.total !== null ? aluno.total.toFixed(1) : "-"}
                          </span>
                        </td>
                        <td className={styles.tdTotal}>
                          <span className={styles.totalEquivalente}>
                            {aluno.totalVinte !== null ? aluno.totalVinte.toFixed(1) : "-"}
                          </span>
                        </td>
                        <td className={styles.tdSituacao}>
                          <span className={`${styles.situacaoBadge} ${
                            aluno.situacao === "Aprovado" ? styles.situacaoAprovado :
                            aluno.situacao === "Recuperação" ? styles.situacaoRecuperacao :
                            aluno.situacao === "Reprovado" ? styles.situacaoReprovado :
                            styles.situacaoPendente
                          }`}>
                            {aluno.situacao}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </TeacherLayout>
  );
}

export default AvaliacoesNotas;