import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TeacherLayout from "../layouts/TeacherLayout";
import { 
  FaCalendarAlt, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSave,
  FaTimes,
  FaBell,
  FaClock,
  FaMapMarkerAlt,
  FaUsers,
  FaChalkboardTeacher,
  FaChevronLeft,
  FaChevronRight,
  FaList,
  FaTh,
  FaSearch
} from "react-icons/fa";
import { 
  MdEvent, 
  MdClose,
  MdInfo,
  MdRepeat
} from "react-icons/md";
import styles from "./Agenda.module.css";

function MinhaAgenda() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [eventos, setEventos] = useState([]);
  const [viewMode, setViewMode] = useState("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [modalAberto, setModalAberto] = useState(false);
  const [eventoEditando, setEventoEditando] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [novoEvento, setNovoEvento] = useState({
    titulo: "",
    descricao: "",
    data: "",
    horarioInicio: "08:00",
    horarioFim: "10:00",
    local: "",
    tipo: "aula",
    recorrencia: "nenhuma",
    lembrete: 15,
    participantes: []
  });

  const tiposEvento = [
    { id: "aula", nome: "Aula", cor: "#1976d2" },
    { id: "reuniao", nome: "Reunião", cor: "#f57c00" },
    { id: "prova", nome: "Prova", cor: "#dc3545" },
    { id: "evento", nome: "Evento", cor: "#28a745" },
    { id: "outro", nome: "Outro", cor: "#6c757d" }
  ];

  const eventosExemplo = [
    {
      id: 1,
      titulo: "Aula de Matemática",
      descricao: "Conteúdo: Equações do 2º grau",
      data: "2024-01-15",
      horarioInicio: "08:00",
      horarioFim: "10:00",
      local: "Sala 101",
      tipo: "aula",
      recorrencia: "semanal",
      lembrete: 15,
      participantes: ["Turma A"]
    },
    {
      id: 2,
      titulo: "Reunião Pedagógica",
      descricao: "Planejamento do próximo bimestre",
      data: "2024-01-16",
      horarioInicio: "14:00",
      horarioFim: "16:00",
      local: "Sala de Reuniões",
      tipo: "reuniao",
      recorrencia: "nenhuma",
      lembrete: 30,
      participantes: ["Todos os professores"]
    },
    {
      id: 3,
      titulo: "Prova de Português",
      descricao: "Prova bimestral",
      data: "2024-01-20",
      horarioInicio: "10:00",
      horarioFim: "12:00",
      local: "Sala 102",
      tipo: "prova",
      recorrencia: "nenhuma",
      lembrete: 60,
      participantes: ["Turma B"]
    }
  ];

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem("usuarioLogado");
    if (usuarioSalvo) {
      const userData = JSON.parse(usuarioSalvo);
      setUser({ ...userData, tipo: "professor" });
      carregarEventos();
    } else {
      navigate("/");
    }
  }, [navigate]);

  const carregarEventos = () => {
    const eventosSalvos = localStorage.getItem("agenda_eventos");
    if (eventosSalvos) {
      setEventos(JSON.parse(eventosSalvos));
    } else {
      setEventos(eventosExemplo);
    }
  };

  const salvarEventos = (novosEventos) => {
    setEventos(novosEventos);
    localStorage.setItem("agenda_eventos", JSON.stringify(novosEventos));
  };

  const abrirModalEvento = (evento = null) => {
    if (evento) {
      setEventoEditando(evento);
      setNovoEvento(evento);
    } else {
      setEventoEditando(null);
      setNovoEvento({
        titulo: "",
        descricao: "",
        data: new Date().toISOString().split('T')[0],
        horarioInicio: "08:00",
        horarioFim: "10:00",
        local: "",
        tipo: "aula",
        recorrencia: "nenhuma",
        lembrete: 15,
        participantes: []
      });
    }
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setEventoEditando(null);
  };

  const salvarEvento = () => {
    if (!novoEvento.titulo || !novoEvento.data) {
      alert("Por favor, preencha título e data");
      return;
    }

    const novoObj = {
      id: eventoEditando ? eventoEditando.id : Date.now(),
      ...novoEvento
    };

    let novosEventos;
    if (eventoEditando) {
      novosEventos = eventos.map(e => e.id === eventoEditando.id ? novoObj : e);
    } else {
      novosEventos = [...eventos, novoObj];
    }

    salvarEventos(novosEventos);
    fecharModal();
  };

  const excluirEvento = (id) => {
    if (window.confirm("Tem certeza que deseja excluir este evento?")) {
      const novosEventos = eventos.filter(e => e.id !== id);
      salvarEventos(novosEventos);
    }
  };

  const getTipoInfo = (tipo) => {
    return tiposEvento.find(t => t.id === tipo) || tiposEvento[4];
  };

  const getDiasNoMes = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getEventosDoDia = (date) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return eventos.filter(e => e.data === dateStr);
  };

  const mudarMes = (incremento) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + incremento);
    setCurrentDate(newDate);
  };

  const eventosFiltrados = eventos.filter(e =>
    e.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.local.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const eventosPorData = [...eventosFiltrados].sort((a, b) => 
    new Date(a.data) - new Date(b.data)
  );

  const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  return (
    <TeacherLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            <FaCalendarAlt className={styles.titleIcon} />
            Minha Agenda
          </h1>
          <p className={styles.subtitle}>
            Gerencie seus compromissos, aulas e eventos importantes
          </p>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.viewControls}>
            <button 
              className={`${styles.viewBtn} ${viewMode === 'month' ? styles.viewBtnActive : ''}`}
              onClick={() => setViewMode('month')}
            >
              <FaTh /> Mês
            </button>
            <button 
              className={`${styles.viewBtn} ${viewMode === 'list' ? styles.viewBtnActive : ''}`}
              onClick={() => setViewMode('list')}
            >
              <FaList /> Lista
            </button>
          </div>
          <div className={styles.searchBar}>
            <FaSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Pesquisar eventos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <button className={styles.btnAdicionar} onClick={() => abrirModalEvento()}>
            <FaPlus /> Novo Evento
          </button>
        </div>

        {viewMode === 'month' && (
          <div className={styles.calendarContainer}>
            <div className={styles.calendarHeader}>
              <button onClick={() => mudarMes(-1)} className={styles.navBtn}>
                <FaChevronLeft />
              </button>
              <h2>{meses[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
              <button onClick={() => mudarMes(1)} className={styles.navBtn}>
                <FaChevronRight />
              </button>
            </div>
            <div className={styles.calendarWeekdays}>
              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(day => (
                <div key={day} className={styles.weekday}>{day}</div>
              ))}
            </div>
            <div className={styles.calendarDays}>
              {getDiasNoMes(currentDate).map((date, index) => {
                const eventosDoDia = date ? getEventosDoDia(date) : [];
                const isToday = date && date.toDateString() === new Date().toDateString();
                return (
                  <div key={index} className={`${styles.calendarDay} ${!date ? styles.emptyDay : ''} ${isToday ? styles.today : ''}`}>
                    {date && (
                      <>
                        <span className={styles.dayNumber}>{date.getDate()}</span>
                        <div className={styles.dayEvents}>
                          {eventosDoDia.slice(0, 3).map(evento => {
                            const tipoInfo = getTipoInfo(evento.tipo);
                            return (
                              <div key={evento.id} className={styles.dayEvent} style={{ backgroundColor: tipoInfo.cor }}>
                                <small>{evento.horarioInicio} - {evento.titulo}</small>
                              </div>
                            );
                          })}
                          {eventosDoDia.length > 3 && (
                            <div className={styles.moreEvents}>+{eventosDoDia.length - 3}</div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {viewMode === 'list' && (
          <div className={styles.listContainer}>
            {eventosPorData.length === 0 ? (
              <div className={styles.emptyState}>
                <FaCalendarAlt className={styles.emptyIcon} />
                <h3>Nenhum evento encontrado</h3>
                <p>Clique em "Novo Evento" para adicionar um compromisso</p>
              </div>
            ) : (
              eventosPorData.map(evento => {
                const tipoInfo = getTipoInfo(evento.tipo);
                return (
                  <div key={evento.id} className={styles.eventoCard}>
                    <div className={styles.eventoDate} style={{ backgroundColor: tipoInfo.cor }}>
                      <span className={styles.eventoDay}>{new Date(evento.data).getDate()}</span>
                      <span className={styles.eventoMonth}>{meses[new Date(evento.data).getMonth()].substring(0, 3)}</span>
                    </div>
                    <div className={styles.eventoInfo}>
                      <h3>{evento.titulo}</h3>
                      <p className={styles.eventoDescricao}>{evento.descricao}</p>
                      <div className={styles.eventoMeta}>
                        <span><FaClock /> {evento.horarioInicio} - {evento.horarioFim}</span>
                        <span><FaMapMarkerAlt /> {evento.local || "Local não definido"}</span>
                        <span className={styles.eventoTipo} style={{ backgroundColor: tipoInfo.cor }}>
                          {tipoInfo.nome}
                        </span>
                      </div>
                      {evento.lembrete && (
                        <div className={styles.eventoLembrete}>
                          <FaBell /> Lembrete {evento.lembrete} minutos antes
                        </div>
                      )}
                    </div>
                    <div className={styles.eventoActions}>
                      <button onClick={() => abrirModalEvento(evento)}>
                        <FaEdit />
                      </button>
                      <button onClick={() => excluirEvento(evento.id)}>
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Modal de Evento */}
      {modalAberto && (
        <div className={styles.modalOverlay} onClick={fecharModal}>
          <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{eventoEditando ? "Editar Evento" : "Novo Evento"}</h3>
              <button className={styles.modalClose} onClick={fecharModal}>
                <MdClose />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Título *</label>
                <input
                  type="text"
                  value={novoEvento.titulo}
                  onChange={(e) => setNovoEvento({ ...novoEvento, titulo: e.target.value })}
                  placeholder="Ex: Aula de Matemática"
                />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Data *</label>
                  <input
                    type="date"
                    value={novoEvento.data}
                    onChange={(e) => setNovoEvento({ ...novoEvento, data: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Tipo</label>
                  <select
                    value={novoEvento.tipo}
                    onChange={(e) => setNovoEvento({ ...novoEvento, tipo: e.target.value })}
                  >
                    {tiposEvento.map(tipo => (
                      <option key={tipo.id} value={tipo.id}>{tipo.nome}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Horário Início</label>
                  <input
                    type="time"
                    value={novoEvento.horarioInicio}
                    onChange={(e) => setNovoEvento({ ...novoEvento, horarioInicio: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Horário Fim</label>
                  <input
                    type="time"
                    value={novoEvento.horarioFim}
                    onChange={(e) => setNovoEvento({ ...novoEvento, horarioFim: e.target.value })}
                  />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Local</label>
                  <input
                    type="text"
                    value={novoEvento.local}
                    onChange={(e) => setNovoEvento({ ...novoEvento, local: e.target.value })}
                    placeholder="Sala, auditório, etc"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Lembrete (minutos antes)</label>
                  <select
                    value={novoEvento.lembrete}
                    onChange={(e) => setNovoEvento({ ...novoEvento, lembrete: parseInt(e.target.value) })}
                  >
                    <option value={5}>5 minutos</option>
                    <option value={15}>15 minutos</option>
                    <option value={30}>30 minutos</option>
                    <option value={60}>1 hora</option>
                    <option value={120}>2 horas</option>
                    <option value={1440}>1 dia</option>
                  </select>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Descrição</label>
                <textarea
                  value={novoEvento.descricao}
                  onChange={(e) => setNovoEvento({ ...novoEvento, descricao: e.target.value })}
                  rows="3"
                  placeholder="Descrição detalhada do evento..."
                />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnCancelar} onClick={fecharModal}>
                Cancelar
              </button>
              <button className={styles.btnSalvar} onClick={salvarEvento}>
                <FaSave /> Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </TeacherLayout>
  );
}

export default MinhaAgenda;