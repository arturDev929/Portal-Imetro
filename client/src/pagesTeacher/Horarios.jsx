import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TeacherLayout from "../layouts/TeacherLayout";
import { 
  FaClock, 
  FaCalendarAlt, 
  FaDoorOpen, 
  FaChalkboardTeacher,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaBell,
  FaExclamationTriangle,
  FaCheckCircle,
  FaPrint,
  FaDownload,
  FaSearch,
  FaBook
} from "react-icons/fa";
import { 
  MdSchedule, 
  MdAccessTime, 
  MdLocationOn,
  MdWarning,
  MdInfo,
  MdClose
} from "react-icons/md";
import { BiTimeFive } from "react-icons/bi";
import styles from "./Horarios.module.css";

function Horarios() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [turmas, setTurmas] = useState([]);
  const [turmaSelecionada, setTurmaSelecionada] = useState(null);
  const [activeTab, setActiveTab] = useState("entrada");
  const [loading, setLoading] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [horarioEditando, setHorarioEditando] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Estado para horários de entrada
  const [horariosEntrada, setHorariosEntrada] = useState([]);
  const [novoHorarioEntrada, setNovoHorarioEntrada] = useState({
    sala: "",
    horarioEntrada: "07:30",
    horarioSaida: "11:30",
    dias: ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"],
    professor: "",
    disciplina: ""
  });
  
  // Estado para horários de prova
  const [horariosProva, setHorariosProva] = useState([]);
  const [novaProva, setNovaProva] = useState({
    disciplina: "",
    data: "",
    horario: "08:00",
    duracao: "2",
    sala: "",
    tipo: "bimestral",
    observacoes: ""
  });

  const turmasExemplo = [
    { id: 1, nome: "Turma A - 3º Ano", periodo: "Manhã", salas: ["101", "102", "103"] },
    { id: 2, nome: "Turma B - 2º Ano", periodo: "Tarde", salas: ["201", "202", "203"] },
    { id: 3, nome: "Turma C - 1º Ano", periodo: "Manhã", salas: ["301", "302", "303"] }
  ];

  const horariosEntradaExemplo = {
    1: [
      { 
        id: 1, 
        sala: "101", 
        horarioEntrada: "07:30", 
        horarioSaida: "11:30",
        dias: ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"],
        professor: "João Silva",
        disciplina: "Matemática"
      },
      { 
        id: 2, 
        sala: "102", 
        horarioEntrada: "07:30", 
        horarioSaida: "11:30",
        dias: ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"],
        professor: "Maria Santos",
        disciplina: "Português"
      },
      { 
        id: 3, 
        sala: "103", 
        horarioEntrada: "13:00", 
        horarioSaida: "17:00",
        dias: ["Segunda", "Quarta", "Sexta"],
        professor: "Pedro Costa",
        disciplina: "Ciências"
      }
    ],
    2: [
      { 
        id: 4, 
        sala: "201", 
        horarioEntrada: "13:00", 
        horarioSaida: "17:00",
        dias: ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"],
        professor: "Ana Oliveira",
        disciplina: "História"
      }
    ],
    3: [
      { 
        id: 5, 
        sala: "301", 
        horarioEntrada: "07:30", 
        horarioSaida: "11:30",
        dias: ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"],
        professor: "Carlos Lima",
        disciplina: "Geografia"
      }
    ]
  };

  const provasExemplo = {
    1: [
      {
        id: 1,
        disciplina: "Matemática",
        data: "2024-01-25",
        horario: "08:00",
        duracao: "2",
        sala: "101",
        tipo: "bimestral",
        observacoes: "Conteúdo: Equações do 2º grau"
      },
      {
        id: 2,
        disciplina: "Português",
        data: "2024-01-28",
        horario: "10:00",
        duracao: "2.5",
        sala: "102",
        tipo: "bimestral",
        observacoes: "Gramática e interpretação"
      }
    ],
    2: [
      {
        id: 3,
        disciplina: "Matemática",
        data: "2024-01-26",
        horario: "13:00",
        duracao: "2",
        sala: "201",
        tipo: "bimestral",
        observacoes: "Funções matemáticas"
      }
    ],
    3: [
      {
        id: 4,
        disciplina: "Português",
        data: "2024-01-27",
        horario: "08:00",
        duracao: "2",
        sala: "301",
        tipo: "recuperacao",
        observacoes: "Prova de recuperação"
      }
    ]
  };

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem("usuarioLogado");
    if (usuarioSalvo) {
      const userData = JSON.parse(usuarioSalvo);
      setUser({ ...userData, tipo: "professor" });
    }
    carregarTurmas();
  }, [navigate]);

  const carregarTurmas = () => {
    setTurmas(turmasExemplo);
  };

  const selecionarTurma = (turmaId) => {
    const turma = turmas.find(t => t.id === turmaId);
    setTurmaSelecionada(turma);
    carregarHorariosEntrada(turmaId);
    carregarProvas(turmaId);
  };

  const carregarHorariosEntrada = (turmaId) => {
    const horariosSalvos = localStorage.getItem(`horarios_entrada_${turmaId}`);
    if (horariosSalvos) {
      setHorariosEntrada(JSON.parse(horariosSalvos));
    } else {
      setHorariosEntrada(horariosEntradaExemplo[turmaId] || []);
    }
  };

  const carregarProvas = (turmaId) => {
    const provasSalvas = localStorage.getItem(`provas_${turmaId}`);
    if (provasSalvas) {
      setHorariosProva(JSON.parse(provasSalvas));
    } else {
      setHorariosProva(provasExemplo[turmaId] || []);
    }
  };

  const abrirModalHorario = (horario = null) => {
    if (horario) {
      setHorarioEditando(horario);
      setNovoHorarioEntrada(horario);
    } else {
      setHorarioEditando(null);
      setNovoHorarioEntrada({
        sala: "",
        horarioEntrada: "07:30",
        horarioSaida: "11:30",
        dias: ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"],
        professor: user?.nome || "",
        disciplina: ""
      });
    }
    setModalAberto(true);
  };

  const abrirModalProva = (prova = null) => {
    if (prova) {
      setHorarioEditando(prova);
      setNovaProva(prova);
    } else {
      setHorarioEditando(null);
      setNovaProva({
        disciplina: "",
        data: "",
        horario: "08:00",
        duracao: "2",
        sala: "",
        tipo: "bimestral",
        observacoes: ""
      });
    }
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setHorarioEditando(null);
  };

  const salvarHorarioEntrada = () => {
    if (!novoHorarioEntrada.sala || !novoHorarioEntrada.horarioEntrada) {
      alert("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    const novoObj = {
      id: horarioEditando ? horarioEditando.id : Date.now(),
      ...novoHorarioEntrada
    };

    let novosHorarios;
    if (horarioEditando) {
      novosHorarios = horariosEntrada.map(h => h.id === horarioEditando.id ? novoObj : h);
    } else {
      novosHorarios = [...horariosEntrada, novoObj];
    }

    setHorariosEntrada(novosHorarios);
    localStorage.setItem(`horarios_entrada_${turmaSelecionada.id}`, JSON.stringify(novosHorarios));
    fecharModal();
  };

  const salvarProva = () => {
    if (!novaProva.disciplina || !novaProva.data || !novaProva.horario) {
      alert("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    const novoObj = {
      id: horarioEditando ? horarioEditando.id : Date.now(),
      ...novaProva
    };

    let novasProvas;
    if (horarioEditando) {
      novasProvas = horariosProva.map(p => p.id === horarioEditando.id ? novoObj : p);
    } else {
      novasProvas = [...horariosProva, novoObj];
    }

    setHorariosProva(novasProvas);
    localStorage.setItem(`provas_${turmaSelecionada.id}`, JSON.stringify(novasProvas));
    fecharModal();
  };

  const excluirHorario = (id) => {
    if (window.confirm("Tem certeza que deseja excluir este horário?")) {
      const novosHorarios = horariosEntrada.filter(h => h.id !== id);
      setHorariosEntrada(novosHorarios);
      localStorage.setItem(`horarios_entrada_${turmaSelecionada.id}`, JSON.stringify(novosHorarios));
    }
  };

  const excluirProva = (id) => {
    if (window.confirm("Tem certeza que deseja excluir esta prova?")) {
      const novasProvas = horariosProva.filter(p => p.id !== id);
      setHorariosProva(novasProvas);
      localStorage.setItem(`provas_${turmaSelecionada.id}`, JSON.stringify(novasProvas));
    }
  };

  const toggleDia = (dia) => {
    const diasAtuais = [...novoHorarioEntrada.dias];
    if (diasAtuais.includes(dia)) {
      setNovoHorarioEntrada({
        ...novoHorarioEntrada,
        dias: diasAtuais.filter(d => d !== dia)
      });
    } else {
      setNovoHorarioEntrada({
        ...novoHorarioEntrada,
        dias: [...diasAtuais, dia]
      });
    }
  };

  const getTipoProvaLabel = (tipo) => {
    switch(tipo) {
      case "bimestral": return "Prova Bimestral";
      case "recuperacao": return "Prova de Recuperação";
      case "final": return "Prova Final";
      default: return tipo;
    }
  };

  const getTipoProvaColor = (tipo) => {
    switch(tipo) {
      case "bimestral": return "#1976d2";
      case "recuperacao": return "#f57c00";
      case "final": return "#dc3545";
      default: return "#6c757d";
    }
  };

  const horariosFiltrados = horariosEntrada.filter(h =>
    h.sala.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.disciplina.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.professor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const provasFiltradas = horariosProva.filter(p =>
    p.disciplina.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sala.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const diasSemana = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

  return (
    <TeacherLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            <MdSchedule className={styles.titleIcon} />
            Horários
          </h1>
          <p className={styles.subtitle}>
            Gerencie os horários de entrada das salas e agendamento de provas
          </p>
        </div>

        <div className={styles.turmasSection}>
          <div className={styles.turmasGrid}>
            {turmas.map(turma => (
              <div 
                key={turma.id} 
                className={`${styles.turmaCard} ${turmaSelecionada?.id === turma.id ? styles.turmaCardActive : ''}`}
                onClick={() => selecionarTurma(turma.id)}
              >
                <div className={styles.turmaIcon}>
                  <FaChalkboardTeacher />
                </div>
                <div className={styles.turmaInfo}>
                  <h3>{turma.nome}</h3>
                  <p>{turma.periodo}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {turmaSelecionada && (
          <>
            <div className={styles.tabs}>
              <button 
                className={`${styles.tab} ${activeTab === 'entrada' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('entrada')}
              >
                <FaDoorOpen /> Horários de Entrada
              </button>
              <button 
                className={`${styles.tab} ${activeTab === 'provas' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('provas')}
              >
                <FaCalendarAlt /> Horários de Prova
              </button>
            </div>

            <div className={styles.searchBar}>
              <FaSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Pesquisar por sala, disciplina ou professor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            {activeTab === 'entrada' && (
              <div className={styles.horariosContainer}>
                <div className={styles.sectionHeader}>
                  <h2>Horários de Entrada das Salas</h2>
                  <button className={styles.btnAdicionar} onClick={() => abrirModalHorario()}>
                    <FaPlus /> Adicionar Horário
                  </button>
                </div>

                <div className={styles.horariosGrid}>
                  {horariosFiltrados.map(horario => (
                    <div key={horario.id} className={styles.horarioCard}>
                      <div className={styles.horarioHeader}>
                        <div className={styles.salaInfo}>
                          <FaDoorOpen className={styles.salaIcon} />
                          <h3>Sala {horario.sala}</h3>
                        </div>
                        <div className={styles.horarioActions}>
                          <button onClick={() => abrirModalHorario(horario)}>
                            <FaEdit />
                          </button>
                          <button onClick={() => excluirHorario(horario.id)}>
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                      <div className={styles.horarioBody}>
                        <div className={styles.horarioItem}>
                          <BiTimeFive className={styles.itemIcon} />
                          <div>
                            <strong>Horário de Entrada</strong>
                            <p>{horario.horarioEntrada}</p>
                          </div>
                        </div>
                        <div className={styles.horarioItem}>
                          <FaClock className={styles.itemIcon} />
                          <div>
                            <strong>Horário de Saída</strong>
                            <p>{horario.horarioSaida}</p>
                          </div>
                        </div>
                        <div className={styles.horarioItem}>
                          <FaChalkboardTeacher className={styles.itemIcon} />
                          <div>
                            <strong>Professor</strong>
                            <p>{horario.professor}</p>
                          </div>
                        </div>
                        <div className={styles.horarioItem}>
                          <FaBook className={styles.itemIcon} />
                          <div>
                            <strong>Disciplina</strong>
                            <p>{horario.disciplina}</p>
                          </div>
                        </div>
                        <div className={styles.horarioItem}>
                          <MdAccessTime className={styles.itemIcon} />
                          <div>
                            <strong>Dias da Semana</strong>
                            <div className={styles.diasBadges}>
                              {horario.dias.map(dia => (
                                <span key={dia} className={styles.diaBadge}>{dia}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {horariosFiltrados.length === 0 && (
                  <div className={styles.emptyState}>
                    <FaDoorOpen className={styles.emptyIcon} />
                    <h3>Nenhum horário encontrado</h3>
                    <p>Clique em "Adicionar Horário" para criar um novo horário</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'provas' && (
              <div className={styles.provasContainer}>
                <div className={styles.sectionHeader}>
                  <h2>Calendário de Provas</h2>
                  <button className={styles.btnAdicionar} onClick={() => abrirModalProva()}>
                    <FaPlus /> Agendar Prova
                  </button>
                </div>

                <div className={styles.provasList}>
                  {provasFiltradas.map(prova => {
                    const dataProva = new Date(prova.data);
                    const hoje = new Date();
                    const diasRestantes = Math.ceil((dataProva - hoje) / (1000 * 60 * 60 * 24));
                    const isProxima = diasRestantes <= 7 && diasRestantes >= 0;
                    
                    return (
                      <div key={prova.id} className={styles.provaCard}>
                        <div className={styles.provaHeader}>
                          <div className={styles.provaTipo} style={{ background: getTipoProvaColor(prova.tipo) }}>
                            {getTipoProvaLabel(prova.tipo)}
                          </div>
                          {isProxima && (
                            <div className={styles.proximaBadge}>
                              <FaBell /> Próxima
                            </div>
                          )}
                          <div className={styles.provaActions}>
                            <button onClick={() => abrirModalProva(prova)}>
                              <FaEdit />
                            </button>
                            <button onClick={() => excluirProva(prova.id)}>
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                        <div className={styles.provaBody}>
                          <h3>{prova.disciplina}</h3>
                          <div className={styles.provaInfo}>
                            <div className={styles.provaItem}>
                              <FaCalendarAlt />
                              <span>{new Date(prova.data).toLocaleDateString('pt-BR')}</span>
                              {isProxima && diasRestantes > 0 && (
                                <span className={styles.diasRestantes}>Faltam {diasRestantes} dias</span>
                              )}
                              {diasRestantes === 0 && (
                                <span className={styles.hojeBadge}>Hoje!</span>
                              )}
                            </div>
                            <div className={styles.provaItem}>
                              <FaClock />
                              <span>{prova.horario} - Duração: {prova.duracao}h</span>
                            </div>
                            <div className={styles.provaItem}>
                              <MdLocationOn />
                              <span>Sala {prova.sala}</span>
                            </div>
                            {prova.observacoes && (
                              <div className={styles.provaObservacao}>
                                <MdInfo />
                                <span>{prova.observacoes}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {provasFiltradas.length === 0 && (
                  <div className={styles.emptyState}>
                    <FaCalendarAlt className={styles.emptyIcon} />
                    <h3>Nenhuma prova agendada</h3>
                    <p>Clique em "Agendar Prova" para criar um novo agendamento</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de Horário de Entrada */}
      {modalAberto && activeTab === 'entrada' && (
        <div className={styles.modalOverlay} onClick={fecharModal}>
          <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{horarioEditando ? "Editar Horário" : "Novo Horário de Entrada"}</h3>
              <button className={styles.modalClose} onClick={fecharModal}>
                <MdClose />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Sala *</label>
                <input
                  type="text"
                  value={novoHorarioEntrada.sala}
                  onChange={(e) => setNovoHorarioEntrada({ ...novoHorarioEntrada, sala: e.target.value })}
                  placeholder="Ex: 101"
                  list="salas"
                />
                <datalist id="salas">
                  {turmaSelecionada?.salas?.map(sala => (
                    <option key={sala} value={sala} />
                  ))}
                </datalist>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Horário de Entrada *</label>
                  <input
                    type="time"
                    value={novoHorarioEntrada.horarioEntrada}
                    onChange={(e) => setNovoHorarioEntrada({ ...novoHorarioEntrada, horarioEntrada: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Horário de Saída *</label>
                  <input
                    type="time"
                    value={novoHorarioEntrada.horarioSaida}
                    onChange={(e) => setNovoHorarioEntrada({ ...novoHorarioEntrada, horarioSaida: e.target.value })}
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Professor</label>
                <input
                  type="text"
                  value={novoHorarioEntrada.professor}
                  onChange={(e) => setNovoHorarioEntrada({ ...novoHorarioEntrada, professor: e.target.value })}
                  placeholder="Nome do professor"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Disciplina</label>
                <input
                  type="text"
                  value={novoHorarioEntrada.disciplina}
                  onChange={(e) => setNovoHorarioEntrada({ ...novoHorarioEntrada, disciplina: e.target.value })}
                  placeholder="Nome da disciplina"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Dias da Semana</label>
                <div className={styles.diasCheckbox}>
                  {diasSemana.map(dia => (
                    <label key={dia} className={styles.diaCheckbox}>
                      <input
                        type="checkbox"
                        checked={novoHorarioEntrada.dias.includes(dia)}
                        onChange={() => toggleDia(dia)}
                      />
                      <span>{dia}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnCancelar} onClick={fecharModal}>
                Cancelar
              </button>
              <button className={styles.btnSalvar} onClick={salvarHorarioEntrada}>
                <FaSave /> Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Prova */}
      {modalAberto && activeTab === 'provas' && (
        <div className={styles.modalOverlay} onClick={fecharModal}>
          <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{horarioEditando ? "Editar Prova" : "Agendar Prova"}</h3>
              <button className={styles.modalClose} onClick={fecharModal}>
                <MdClose />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Disciplina *</label>
                <input
                  type="text"
                  value={novaProva.disciplina}
                  onChange={(e) => setNovaProva({ ...novaProva, disciplina: e.target.value })}
                  placeholder="Ex: Matemática"
                />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Data *</label>
                  <input
                    type="date"
                    value={novaProva.data}
                    onChange={(e) => setNovaProva({ ...novaProva, data: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Horário *</label>
                  <input
                    type="time"
                    value={novaProva.horario}
                    onChange={(e) => setNovaProva({ ...novaProva, horario: e.target.value })}
                  />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Duração (horas)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={novaProva.duracao}
                    onChange={(e) => setNovaProva({ ...novaProva, duracao: e.target.value })}
                    placeholder="2"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Sala *</label>
                  <input
                    type="text"
                    value={novaProva.sala}
                    onChange={(e) => setNovaProva({ ...novaProva, sala: e.target.value })}
                    placeholder="Ex: 101"
                    list="salas"
                  />
                  <datalist id="salas">
                    {turmaSelecionada?.salas?.map(sala => (
                      <option key={sala} value={sala} />
                    ))}
                  </datalist>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Tipo de Prova</label>
                <select
                  value={novaProva.tipo}
                  onChange={(e) => setNovaProva({ ...novaProva, tipo: e.target.value })}
                >
                  <option value="bimestral">Prova Bimestral</option>
                  <option value="recuperacao">Prova de Recuperação</option>
                  <option value="final">Prova Final</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Observações</label>
                <textarea
                  value={novaProva.observacoes}
                  onChange={(e) => setNovaProva({ ...novaProva, observacoes: e.target.value })}
                  rows="3"
                  placeholder="Informações adicionais sobre a prova..."
                />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnCancelar} onClick={fecharModal}>
                Cancelar
              </button>
              <button className={styles.btnSalvar} onClick={salvarProva}>
                <FaSave /> Agendar
              </button>
            </div>
          </div>
        </div>
      )}
    </TeacherLayout>
  );
}

export default Horarios;