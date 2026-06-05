import { useState } from "react";
import TeacherLayout from "../layouts/TeacherLayout";
import { 
  FaUsers, 
  FaBook, 
  FaCalendarAlt, 
  FaChartLine, 
  FaClock, 
  FaCheckCircle,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaBell,
  FaGift,
  FaCalendarDay,
  FaExclamationTriangle
} from "react-icons/fa";
import { 
  MdAssignment, 
  MdRateReview,
  MdTrendingUp,
  MdSchool,
  MdEvent,
  MdCelebration,
  MdWarning,
  MdInfo
} from "react-icons/md";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import styles from "./PainelGeral.module.css";

function PainelGeral() {
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [viewMode, setViewMode] = useState("agenda");

  const turmas = [
    { id: 1, nome: "Turma A - 3º Ano", alunos: 32, progresso: 75, media: 8.2, atividades: 12 },
    { id: 2, nome: "Turma B - 2º Ano", alunos: 28, progresso: 68, media: 7.8, atividades: 10 },
    { id: 3, nome: "Turma C - 1º Ano", alunos: 30, progresso: 82, media: 8.5, atividades: 14 },
    { id: 4, nome: "Turma D - 4º Ano", alunos: 25, progresso: 71, media: 7.9, atividades: 11 },
  ];

  const agendaProfessor = [
    { 
      id: 1, 
      titulo: "Aula de Matemática", 
      data: "2024-01-15", 
      horario: "08:00 - 10:00", 
      turma: "Turma A",
      local: "Sala 101",
      tipo: "aula",
      prioridade: "alta",
      descricao: "Conteúdo: Equações do 2º grau"
    },
    { 
      id: 2, 
      titulo: "Correção de Provas", 
      data: "2024-01-15", 
      horario: "10:00 - 12:00", 
      turma: "Turma B",
      local: "Sala dos Professores",
      tipo: "correcao",
      prioridade: "media",
      descricao: "Prova bimestral de Português"
    },
    { 
      id: 3, 
      titulo: "Reunião Pedagógica", 
      data: "2024-01-16", 
      horario: "14:00 - 16:00", 
      turma: "Todos",
      local: "Sala de Reuniões",
      tipo: "reuniao",
      prioridade: "alta",
      descricao: "Planejamento do próximo bimestre"
    },
  ];

  const agendaAluno = [
    { 
      id: 1, 
      titulo: "Entregar Trabalho de Matemática", 
      dataEntrega: "2024-01-18", 
      turma: "Turma A",
      disciplina: "Matemática",
      tipo: "trabalho",
      status: "pendente",
      descricao: "Resolver 10 exercícios sobre equações",
      peso: 3
    },
    { 
      id: 2, 
      titulo: "Prova de Português", 
      dataEntrega: "2024-01-20", 
      turma: "Turma A",
      disciplina: "Português",
      tipo: "prova",
      status: "pendente",
      descricao: "Matéria: Gramática e Interpretação",
      peso: 5
    },
    { 
      id: 3, 
      titulo: "Pesquisa de Ciências", 
      dataEntrega: "2024-01-22", 
      turma: "Turma B",
      disciplina: "Ciências",
      tipo: "pesquisa",
      status: "andamento",
      descricao: "Tema: Meio Ambiente",
      peso: 2
    },
  ];

  const feriadosEventos = [
    { 
      id: 1, 
      titulo: "Feriado - Dia de São Paulo", 
      data: "2024-01-25", 
      tipo: "feriado",
      descricao: "Não haverá aula",
      cor: "#dc3545"
    },
    { 
      id: 2, 
      titulo: "Evento - Feira de Ciências", 
      data: "2024-01-28", 
      tipo: "evento",
      descricao: "Apresentação dos projetos",
      horario: "08:00 - 17:00",
      cor: "#28a745"
    },
    { 
      id: 3, 
      titulo: "Feriado - Carnaval", 
      data: "2024-02-12", 
      tipo: "feriado",
      descricao: "Ponto facultativo",
      cor: "#dc3545"
    },
  ];

  const avisos = [
    { 
      id: 1, 
      titulo: "Manutenção na plataforma", 
      mensagem: "O sistema ficará offline das 02:00 às 04:00 para manutenção.",
      data: "2024-01-16",
      tipo: "importante",
      lido: false
    },
    { 
      id: 2, 
      titulo: "Novo material disponível", 
      mensagem: "Material de apoio para as provas finais disponível na biblioteca.",
      data: "2024-01-15",
      tipo: "informativo",
      lido: false
    },
  ];

  const stats = [
    { titulo: "Total de Alunos", valor: "115", icone: FaUsers, aumento: "+12%" },
    { titulo: "Média Geral", valor: "8.2", icone: MdTrendingUp, aumento: "+5%" },
    { titulo: "Tarefas Pendentes", valor: "8", icone: MdAssignment, aumento: "+2" },
    { titulo: "Eventos Hoje", valor: "3", icone: MdEvent, aumento: "hoje" },
  ];

  const desempenhoData = {
    week: [
      { dia: "Seg", media: 7.8, presenca: 92 },
      { dia: "Ter", media: 8.1, presenca: 94 },
      { dia: "Qua", media: 7.9, presenca: 90 },
      { dia: "Qui", media: 8.3, presenca: 95 },
      { dia: "Sex", media: 8.5, presenca: 96 },
    ],
    month: [
      { semana: "Sem 1", media: 7.6, presenca: 88 },
      { semana: "Sem 2", media: 7.9, presenca: 90 },
      { semana: "Sem 3", media: 8.1, presenca: 92 },
      { semana: "Sem 4", media: 8.3, presenca: 94 },
    ],
    year: [
      { mes: "Jan", media: 7.2, presenca: 85 },
      { mes: "Fev", media: 7.5, presenca: 87 },
      { mes: "Mar", media: 7.8, presenca: 89 },
      { mes: "Abr", media: 8.0, presenca: 91 },
      { mes: "Mai", media: 8.2, presenca: 92 },
      { mes: "Jun", media: 8.4, presenca: 93 },
    ]
  };

  const getStatusClass = (status) => {
    switch(status) {
      case "pendente": return styles.statusPendente;
      case "andamento": return styles.statusAndamento;
      case "concluido": return styles.statusConcluido;
      default: return "";
    }
  };

  const getTarefaStatusClass = (status) => {
    switch(status) {
      case "pendente": return styles.tarefaStatusPendente;
      case "andamento": return styles.tarefaStatusAndamento;
      case "concluido": return styles.tarefaStatusConcluido;
      default: return "";
    }
  };

  return (
    <TeacherLayout>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Bem-vindo, Professor! 👋</h1>
            <p className={styles.subtitle}>Gerencie sua agenda, acompanhe tarefas e fique por dentro dos eventos</p>
          </div>
          
          <div className={styles.viewButtons}>
            <button 
              onClick={() => setViewMode("agenda")}
              className={`${styles.viewBtn} ${viewMode === "agenda" ? styles.viewBtnActive : ""}`}
            >
              <FaCalendarAlt /> Agenda
            </button>
            <button 
              onClick={() => setViewMode("tarefas")}
              className={`${styles.viewBtn} ${viewMode === "tarefas" ? styles.viewBtnActive : ""}`}
            >
              <MdAssignment /> Tarefas
            </button>
            <button 
              onClick={() => setViewMode("eventos")}
              className={`${styles.viewBtn} ${viewMode === "eventos" ? styles.viewBtnActive : ""}`}
            >
              <MdCelebration /> Eventos
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className={styles.statsGrid}>
          {stats.map((stat, index) => (
            <div key={index} className={styles.statCard}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "16px" }}>
                <div className={styles.statIconWrapper}>
                  <stat.icone className={styles.statIcon} />
                </div>
                <span className={styles.statBadge}>{stat.aumento}</span>
              </div>
              <h3 className={styles.statValue}>{stat.valor}</h3>
              <p className={styles.statLabel}>{stat.titulo}</p>
            </div>
          ))}
        </div>

        <div className={styles.twoColumnLayout}>
          {/* Coluna Esquerda */}
          <div>
            {/* Agenda do Professor */}
            {viewMode === "agenda" && (
              <div className={styles.card}>
                <h5 className={styles.cardTitle}>
                  <FaChalkboardTeacher className={styles.cardIcon} />
                  Minha Agenda (Professor)
                </h5>
                {agendaProfessor.map((item) => (
                  <div key={item.id} className={styles.agendaItem}>
                    <div className={styles.agendaHeader}>
                      <h6 className={styles.agendaTitle}>{item.titulo}</h6>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <span className={styles.agendaBadge}>{item.horario}</span>
                        <span className={item.prioridade === "alta" ? styles.agendaPriorityHigh : styles.agendaPriorityMedium}>
                          {item.prioridade}
                        </span>
                      </div>
                    </div>
                    <p className={styles.agendaInfo}>
                      Turma: {item.turma} | Local: {item.local}
                    </p>
                    <p className={styles.agendaDescription}>{item.descricao}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Tarefas dos Alunos */}
            {viewMode === "tarefas" && (
              <div className={styles.card}>
                <h5 className={styles.cardTitle}>
                  <MdAssignment className={styles.cardIcon} />
                  Tarefas e Atividades dos Alunos
                </h5>
                {agendaAluno.map((tarefa) => (
                  <div key={tarefa.id} className={`${styles.tarefaItem} ${getTarefaStatusClass(tarefa.status)}`}>
                    <div className={styles.tarefaHeader}>
                      <h6 className={styles.tarefaTitle}>{tarefa.titulo}</h6>
                      <span className={`${styles.tarefaStatusBadge} ${getStatusClass(tarefa.status)}`}>
                        {tarefa.status}
                      </span>
                    </div>
                    <p className={styles.tarefaInfo}>
                      {tarefa.disciplina} • {tarefa.turma} • Peso: {tarefa.peso}
                    </p>
                    <p className={styles.tarefaData}>
                      Entrega: {new Date(tarefa.dataEntrega).toLocaleDateString('pt-BR')}
                    </p>
                    <p className={styles.tarefaDescricao}>{tarefa.descricao}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Feriados e Eventos */}
            {viewMode === "eventos" && (
              <div className={styles.card}>
                <h5 className={styles.cardTitle}>
                  <MdCelebration className={styles.cardIcon} />
                  Feriados e Eventos Especiais
                </h5>
                {feriadosEventos.map((evento) => (
                  <div key={evento.id} className={styles.eventoItem} style={{ borderLeft: `4px solid ${evento.cor}` }}>
                    <div className={styles.eventoHeader}>
                      <h6 className={styles.eventoTitle}>{evento.titulo}</h6>
                      <span className={styles.eventoTypeBadge} style={{ background: evento.cor }}>
                        {evento.tipo === "feriado" ? "Feriado" : "Evento"}
                      </span>
                    </div>
                    <p className={styles.eventoData}>
                      Data: {new Date(evento.data).toLocaleDateString('pt-BR')} {evento.horario && `• ${evento.horario}`}
                    </p>
                    <p className={styles.eventoDescricao}>{evento.descricao}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Gráfico de Desempenho */}
            <div className={styles.chartContainer}>
              <h5 className={styles.chartTitle}>
                <FaChartLine className={styles.cardIcon} />
                Desempenho das Turmas
              </h5>
              <div className={styles.periodButtons}>
                {["week", "month", "year"].map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={`${styles.periodBtn} ${selectedPeriod === period ? styles.periodBtnActive : ""}`}
                  >
                    {period === "week" ? "Semana" : period === "month" ? "Mês" : "Ano"}
                  </button>
                ))}
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={desempenhoData[selectedPeriod]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey={selectedPeriod === "week" ? "dia" : selectedPeriod === "month" ? "semana" : "mes"} />
                  <YAxis yAxisId="left" domain={[0, 10]} />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="media" 
                    stroke="#0b2b40" 
                    strokeWidth={3}
                    name="Média das Notas"
                    dot={{ r: 6, fill: "#0b2b40" }}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="presenca" 
                    stroke="#d4af37" 
                    strokeWidth={3}
                    name="Presença (%)"
                    dot={{ r: 6, fill: "#d4af37" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Coluna Direita */}
          <div>
            {/* Avisos */}
            <div className={styles.card}>
              <h5 className={styles.cardTitle}>
                <FaBell className={styles.cardIcon} />
                Avisos e Comunicados
              </h5>
              {avisos.map((aviso) => (
                <div key={aviso.id} className={`${styles.avisoItem} ${!aviso.lido ? styles.avisoNaoLido : styles.avisoLido} ${aviso.tipo === "importante" ? styles.avisoImportante : styles.avisoInformativo}`}>
                  <div className={styles.avisoHeader}>
                    <h6 className={styles.avisoTitle}>{aviso.titulo}</h6>
                    <small className={styles.avisoDate}>{new Date(aviso.data).toLocaleDateString('pt-BR')}</small>
                  </div>
                  <p className={styles.avisoMessage}>{aviso.mensagem}</p>
                </div>
              ))}
            </div>

            {/* Próximos Compromissos */}
            <div className={styles.card}>
              <h5 className={styles.cardTitle}>
                <FaCalendarAlt className={styles.cardIcon} />
                Próximos Compromissos
              </h5>
              {agendaProfessor.slice(0, 3).map((item) => (
                <div key={item.id} className={styles.compromissoItem}>
                  <div className={styles.compromissoHorario}>
                    <div className={styles.compromissoDia}>
                      {new Date(item.data).toLocaleDateString('pt-BR', { weekday: 'short' })}
                    </div>
                    <span className={styles.compromissoHora}>
                      {item.horario.split(' - ')[0]}
                    </span>
                  </div>
                  <div className={styles.compromissoInfo}>
                    <h6 className={styles.compromissoTitulo}>{item.titulo}</h6>
                    <small className={styles.compromissoDetalhe}>{item.turma} • {item.local}</small>
                  </div>
                </div>
              ))}
            </div>

            {/* Minhas Turmas */}
            <div className={styles.card}>
              <h5 className={styles.cardTitle}>
                <MdSchool className={styles.cardIcon} />
                Minhas Turmas
              </h5>
              {turmas.map((turma, index) => (
                <div key={turma.id} className={styles.turmaItem} style={{ background: index % 2 === 0 ? "#f8f9fa" : "white" }}>
                  <div className={styles.turmaHeader}>
                    <h6 className={styles.turmaNome}>{turma.nome}</h6>
                    <span className={styles.turmaAlunos}>{turma.alunos} alunos</span>
                  </div>
                  <div className={styles.progressContainer}>
                    <div className={styles.progressHeader}>
                      <span className={styles.progressLabel}>Progresso</span>
                      <span className={styles.progressValue}>{turma.progresso}%</span>
                    </div>
                    <div className={styles.progressBar}>
                      <div className={styles.progressFill} style={{ width: `${turma.progresso}%` }}></div>
                    </div>
                  </div>
                  <div className={styles.turmaFooter}>
                    <span><FaBook style={{ marginRight: "4px" }} /> {turma.atividades} atividades</span>
                    <span>Média: {turma.media}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
}

export default PainelGeral;