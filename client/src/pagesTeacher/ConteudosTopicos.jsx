import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TeacherLayout from "../layouts/TeacherLayout";
import { 
  FaFilePdf, 
  FaUpload, 
  FaDownload, 
  FaTrash, 
  FaEdit, 
  FaEye,
  FaBook,
  FaVideo,
  FaFileAlt,
  FaCalendarAlt,
  FaClock,
  FaUserGraduate,
  FaCheckCircle,
  FaTimesCircle,
  FaPlus,
  FaSearch,
  FaFilter
} from "react-icons/fa";
import { 
  MdTopic, 
  MdDescription, 
  MdAttachFile,
  MdClose,
  MdWarning,
  MdInfo
} from "react-icons/md";
import styles from "./ConteudosTopicos.module.css";

function ConteudosTopicos() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [turmas, setTurmas] = useState([]);
  const [turmaSelecionada, setTurmaSelecionada] = useState(null);
  const [disciplinas, setDisciplinas] = useState([]);
  const [disciplinaSelecionada, setDisciplinaSelecionada] = useState(null);
  const [topicos, setTopicos] = useState([]);
  const [activeTab, setActiveTab] = useState("conteudos");
  const [loading, setLoading] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [topicoEditando, setTopicoEditando] = useState(null);
  const [termoPesquisa, setTermoPesquisa] = useState("");
  
  // Estado para novo tópico
  const [novoTopico, setNovoTopico] = useState({
    titulo: "",
    descricao: "",
    tipo: "aula",
    data: new Date().toISOString().split('T')[0],
    arquivos: []
  });
  
  // Estado para faltas
  const [faltas, setFaltas] = useState([]);
  const [modalFaltasAberto, setModalFaltasAberto] = useState(false);
  const [alunos, setAlunos] = useState([]);
  
  const turmasExemplo = [
    { id: 1, nome: "Turma A - 3º Ano", periodo: "Manhã", alunos: 32 },
    { id: 2, nome: "Turma B - 2º Ano", periodo: "Tarde", alunos: 28 },
    { id: 3, nome: "Turma C - 1º Ano", periodo: "Manhã", alunos: 30 }
  ];

  const disciplinasExemplo = {
    1: [
      { id: 1, nome: "Matemática", carga: 4, professor: "João Silva" },
      { id: 2, nome: "Português", carga: 4, professor: "Maria Santos" },
      { id: 3, nome: "Ciências", carga: 3, professor: "Pedro Costa" }
    ],
    2: [
      { id: 4, nome: "Matemática", carga: 4, professor: "João Silva" },
      { id: 5, nome: "História", carga: 3, professor: "Ana Oliveira" },
      { id: 6, nome: "Geografia", carga: 3, professor: "Carlos Lima" }
    ],
    3: [
      { id: 7, nome: "Português", carga: 4, professor: "Maria Santos" },
      { id: 8, nome: "Inglês", carga: 2, professor: "Paula Souza" },
      { id: 9, nome: "Artes", carga: 2, professor: "Roberto Alves" }
    ]
  };

  const topicosExemplo = {
    1: [
      { 
        id: 1, 
        titulo: "Introdução à Álgebra", 
        descricao: "Conceitos básicos de álgebra, expressões algébricas e equações do 1º grau",
        tipo: "aula",
        data: "2024-01-15",
        arquivos: [
          { nome: "Apostila_Algebra.pdf", url: "#", tamanho: "2.5 MB" },
          { nome: "Exercicios_Algebra.pdf", url: "#", tamanho: "1.2 MB" }
        ],
        visualizacoes: 45,
        likes: 12
      },
      { 
        id: 2, 
        titulo: "Geometria Plana", 
        descricao: "Estudo das figuras geométricas planas, áreas e perímetros",
        tipo: "aula",
        data: "2024-01-18",
        arquivos: [
          { nome: "Geometria_Plana.pdf", url: "#", tamanho: "3.1 MB" }
        ],
        visualizacoes: 32,
        likes: 8
      },
      { 
        id: 3, 
        titulo: "Material de Apoio - Prova", 
        descricao: "Material complementar para estudo da prova bimestral",
        tipo: "material",
        data: "2024-01-20",
        arquivos: [
          { nome: "Revisao_Prova.pdf", url: "#", tamanho: "1.8 MB" },
          { nome: "Exercicios_Complementares.pdf", url: "#", tamanho: "2.1 MB" }
        ],
        visualizacoes: 67,
        likes: 25
      }
    ],
    2: [
      { 
        id: 4, 
        titulo: "Funções Matemáticas", 
        descricao: "Estudo das funções do 1º e 2º grau",
        tipo: "aula",
        data: "2024-01-16",
        arquivos: [
          { nome: "Funcoes.pdf", url: "#", tamanho: "2.2 MB" }
        ],
        visualizacoes: 38,
        likes: 10
      }
    ],
    3: [
      { 
        id: 5, 
        titulo: "Literatura Brasileira", 
        descricao: "Análise de obras literárias brasileiras",
        tipo: "aula",
        data: "2024-01-17",
        arquivos: [
          { nome: "Literatura.pdf", url: "#", tamanho: "3.5 MB" }
        ],
        visualizacoes: 28,
        likes: 7
      }
    ]
  };

  const alunosExemplo = {
    1: [
      { id: 1, nome: "Ana Silva", matricula: "2024001", faltas: 2 },
      { id: 2, nome: "Bruno Santos", matricula: "2024002", faltas: 1 },
      { id: 3, nome: "Carla Oliveira", matricula: "2024003", faltas: 0 },
      { id: 4, nome: "Daniel Souza", matricula: "2024004", faltas: 3 },
      { id: 5, nome: "Elena Costa", matricula: "2024005", faltas: 1 }
    ],
    2: [
      { id: 6, nome: "Fernando Lima", matricula: "2024006", faltas: 2 },
      { id: 7, nome: "Gabriela Rocha", matricula: "2024007", faltas: 0 },
      { id: 8, nome: "Henrique Alves", matricula: "2024008", faltas: 1 }
    ],
    3: [
      { id: 9, nome: "Isabela Martins", matricula: "2024009", faltas: 1 },
      { id: 10, nome: "João Pedro", matricula: "2024010", faltas: 2 },
      { id: 11, nome: "Karina Lima", matricula: "2024011", faltas: 0 }
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
    const disc = disciplinasExemplo[turmaId] || [];
    setDisciplinas(disc);
    setDisciplinaSelecionada(null);
    setTopicos([]);
    setAlunos(alunosExemplo[turmaId] || []);
  };

  const selecionarDisciplina = (disciplinaId) => {
    setDisciplinaSelecionada(disciplinaId);
    carregarTopicos(turmaSelecionada.id, disciplinaId);
    carregarFaltas(turmaSelecionada.id, disciplinaId);
  };

  const carregarTopicos = (turmaId, disciplinaId) => {
    const topicosSalvos = localStorage.getItem(`topicos_${turmaId}_${disciplinaId}`);
    if (topicosSalvos) {
      setTopicos(JSON.parse(topicosSalvos));
    } else {
      const topicosDisciplina = topicosExemplo[turmaId] || [];
      setTopicos(topicosDisciplina);
    }
  };

  const carregarFaltas = (turmaId, disciplinaId) => {
    const faltasSalvas = localStorage.getItem(`faltas_${turmaId}_${disciplinaId}`);
    if (faltasSalvas) {
      setFaltas(JSON.parse(faltasSalvas));
    } else {
      setFaltas([]);
    }
  };

  const abrirModalTopico = (topico = null) => {
    if (topico) {
      setTopicoEditando(topico);
      setNovoTopico({
        titulo: topico.titulo,
        descricao: topico.descricao,
        tipo: topico.tipo,
        data: topico.data,
        arquivos: topico.arquivos || []
      });
    } else {
      setTopicoEditando(null);
      setNovoTopico({
        titulo: "",
        descricao: "",
        tipo: "aula",
        data: new Date().toISOString().split('T')[0],
        arquivos: []
      });
    }
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setTopicoEditando(null);
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const novosArquivos = files.map(file => ({
      nome: file.name,
      tamanho: (file.size / 1024 / 1024).toFixed(2) + " MB",
      url: URL.createObjectURL(file)
    }));
    setNovoTopico({ ...novoTopico, arquivos: [...novoTopico.arquivos, ...novosArquivos] });
  };

  const removerArquivo = (index) => {
    const novosArquivos = novoTopico.arquivos.filter((_, i) => i !== index);
    setNovoTopico({ ...novoTopico, arquivos: novosArquivos });
  };

  const salvarTopico = () => {
    if (!novoTopico.titulo.trim()) {
      alert("Por favor, insira um título para o tópico");
      return;
    }

    const novoTopicoObj = {
      id: topicoEditando ? topicoEditando.id : Date.now(),
      titulo: novoTopico.titulo,
      descricao: novoTopico.descricao,
      tipo: novoTopico.tipo,
      data: novoTopico.data,
      arquivos: novoTopico.arquivos,
      visualizacoes: topicoEditando ? topicoEditando.visualizacoes : 0,
      likes: topicoEditando ? topicoEditando.likes : 0
    };

    let novosTopicos;
    if (topicoEditando) {
      novosTopicos = topicos.map(t => t.id === topicoEditando.id ? novoTopicoObj : t);
    } else {
      novosTopicos = [novoTopicoObj, ...topicos];
    }

    setTopicos(novosTopicos);
    localStorage.setItem(`topicos_${turmaSelecionada.id}_${disciplinaSelecionada}`, JSON.stringify(novosTopicos));
    fecharModal();
  };

  const excluirTopico = (id) => {
    if (window.confirm("Tem certeza que deseja excluir este tópico?")) {
      const novosTopicos = topicos.filter(t => t.id !== id);
      setTopicos(novosTopicos);
      localStorage.setItem(`topicos_${turmaSelecionada.id}_${disciplinaSelecionada}`, JSON.stringify(novosTopicos));
    }
  };

  const registrarFalta = (alunoId, presente) => {
    const novaFalta = {
      id: Date.now(),
      alunoId,
      disciplinaId: disciplinaSelecionada,
      data: new Date().toISOString().split('T')[0],
      presente
    };
    
    const novasFaltas = [...faltas, novaFalta];
    setFaltas(novasFaltas);
    localStorage.setItem(`faltas_${turmaSelecionada.id}_${disciplinaSelecionada}`, JSON.stringify(novasFaltas));
    
    // Atualizar contador de faltas do aluno
    const aluno = alunos.find(a => a.id === alunoId);
    if (!presente && aluno) {
      aluno.faltas = (aluno.faltas || 0) + 1;
      setAlunos([...alunos]);
    }
  };

  const getFaltasAluno = (alunoId) => {
    return faltas.filter(f => f.alunoId === alunoId && !f.presente).length;
  };

  const topicosFiltrados = topicos.filter(topico =>
    topico.titulo.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
    topico.descricao.toLowerCase().includes(termoPesquisa.toLowerCase())
  );

  const getTipoIcone = (tipo) => {
    switch(tipo) {
      case "aula": return <FaVideo />;
      case "material": return <MdAttachFile />;
      default: return <FaFileAlt />;
    }
  };

  const getTipoLabel = (tipo) => {
    switch(tipo) {
      case "aula": return "Aula";
      case "material": return "Material de Apoio";
      default: return "Outro";
    }
  };

  return (
    <TeacherLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            <MdTopic className={styles.titleIcon} />
            Conteúdos e Tópicos
          </h1>
          <p className={styles.subtitle}>
            Gerencie materiais de aula, publique arquivos PDF e acompanhe as faltas dos alunos
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
                  <FaUserGraduate />
                </div>
                <div className={styles.turmaInfo}>
                  <h3>{turma.nome}</h3>
                  <p>{turma.alunos} alunos • {turma.periodo}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {turmaSelecionada && (
          <>
            <div className={styles.disciplinasSection}>
              <div className={styles.disciplinasList}>
                {disciplinas.map(disciplina => (
                  <button
                    key={disciplina.id}
                    className={`${styles.disciplinaBtn} ${disciplinaSelecionada === disciplina.id ? styles.disciplinaBtnActive : ''}`}
                    onClick={() => selecionarDisciplina(disciplina.id)}
                  >
                    <FaBook />
                    {disciplina.nome}
                  </button>
                ))}
              </div>
            </div>

            {disciplinaSelecionada && (
              <>
                <div className={styles.tabs}>
                  <button 
                    className={`${styles.tab} ${activeTab === 'conteudos' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('conteudos')}
                  >
                    <FaFileAlt /> Conteúdos
                  </button>
                  <button 
                    className={`${styles.tab} ${activeTab === 'faltas' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('faltas')}
                  >
                    <FaCalendarAlt /> Controle de Faltas
                  </button>
                </div>

                {activeTab === 'conteudos' && (
                  <div className={styles.conteudosContainer}>
                    <div className={styles.conteudosHeader}>
                      <div className={styles.searchBar}>
                        <FaSearch className={styles.searchIcon} />
                        <input
                          type="text"
                          placeholder="Pesquisar tópicos..."
                          value={termoPesquisa}
                          onChange={(e) => setTermoPesquisa(e.target.value)}
                          className={styles.searchInput}
                        />
                      </div>
                      <button className={styles.btnPublicar} onClick={() => abrirModalTopico()}>
                        <FaPlus /> Publicar Conteúdo
                      </button>
                    </div>

                    <div className={styles.topicosGrid}>
                      {topicosFiltrados.map(topico => (
                        <div key={topico.id} className={styles.topicoCard}>
                          <div className={styles.topicoHeader}>
                            <div className={styles.topicoTipo}>
                              {getTipoIcone(topico.tipo)}
                              <span>{getTipoLabel(topico.tipo)}</span>
                            </div>
                            <div className={styles.topicoActions}>
                              <button onClick={() => abrirModalTopico(topico)}>
                                <FaEdit />
                              </button>
                              <button onClick={() => excluirTopico(topico.id)}>
                                <FaTrash />
                              </button>
                            </div>
                          </div>
                          <h3 className={styles.topicoTitulo}>{topico.titulo}</h3>
                          <p className={styles.topicoDescricao}>{topico.descricao}</p>
                          <div className={styles.topicoMeta}>
                            <span><FaCalendarAlt /> {new Date(topico.data).toLocaleDateString('pt-BR')}</span>
                            <span><FaEye /> {topico.visualizacoes} visualizações</span>
                          </div>
                          {topico.arquivos.length > 0 && (
                            <div className={styles.topicoArquivos}>
                              <h4>Arquivos anexados:</h4>
                              {topico.arquivos.map((arquivo, idx) => (
                                <a key={idx} href={arquivo.url} download className={styles.arquivoLink}>
                                  <FaFilePdf />
                                  <span>{arquivo.nome}</span>
                                  <small>({arquivo.tamanho})</small>
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'faltas' && (
                  <div className={styles.faltasContainer}>
                    <div className={styles.faltasHeader}>
                      <h2>Registro de Presenças e Faltas</h2>
                      <p>Data: {new Date().toLocaleDateString('pt-BR')}</p>
                    </div>

                    <div className={styles.faltasTable}>
                      <table className={styles.table}>
                        <thead>
                          <tr>
                            <th>Matrícula</th>
                            <th>Aluno</th>
                            <th>Total de Faltas</th>
                            <th>Presença Hoje</th>
                            <th>Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {alunos.map(aluno => {
                            const faltasHoje = faltas.some(f => f.alunoId === aluno.id && f.data === new Date().toISOString().split('T')[0]);
                            const presenteHoje = faltas.some(f => f.alunoId === aluno.id && f.data === new Date().toISOString().split('T')[0] && f.presente);
                            return (
                              <tr key={aluno.id}>
                                <td>{aluno.matricula}</td>
                                <td><strong>{aluno.nome}</strong></td>
                                <td>
                                  <span className={aluno.faltas > 5 ? styles.faltasAlta : styles.faltasNormal}>
                                    {aluno.faltas || 0} falta(s)
                                  </span>
                                </td>
                                <td>
                                  {presenteHoje ? (
                                    <span className={styles.presenteBadge}>Presente</span>
                                  ) : faltasHoje ? (
                                    <span className={styles.faltaBadge}>Falta</span>
                                  ) : (
                                    <span className={styles.pendenteBadge}>Não registrado</span>
                                  )}
                                </td>
                                <td>
                                  <div className={styles.faltasActions}>
                                    <button 
                                      className={styles.btnPresente}
                                      onClick={() => registrarFalta(aluno.id, true)}
                                      disabled={presenteHoje}
                                    >
                                      <FaCheckCircle /> Presente
                                    </button>
                                    <button 
                                      className={styles.btnFalta}
                                      onClick={() => registrarFalta(aluno.id, false)}
                                      disabled={faltasHoje}
                                    >
                                      <FaTimesCircle /> Falta
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <div className={styles.faltasInfo}>
                      <div className={styles.infoCard}>
                        <MdInfo />
                        <div>
                          <strong>Legenda:</strong>
                          <p>• Presente: Aluno compareceu à aula</p>
                          <p>• Falta: Aluno não compareceu</p>
                          <p>• Total de faltas  5: Alerta de reprovação por frequência</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Modal de Tópico */}
      {modalAberto && (
        <div className={styles.modalOverlay} onClick={fecharModal}>
          <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{topicoEditando ? "Editar Conteúdo" : "Novo Conteúdo"}</h3>
              <button className={styles.modalClose} onClick={fecharModal}>
                <MdClose />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Título do Tópico *</label>
                <input
                  type="text"
                  value={novoTopico.titulo}
                  onChange={(e) => setNovoTopico({ ...novoTopico, titulo: e.target.value })}
                  placeholder="Ex: Introdução à Álgebra"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Tipo de Conteúdo</label>
                <select
                  value={novoTopico.tipo}
                  onChange={(e) => setNovoTopico({ ...novoTopico, tipo: e.target.value })}
                >
                  <option value="aula">Aula</option>
                  <option value="material">Material de Apoio</option>
                  <option value="aviso">Aviso</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Descrição</label>
                <textarea
                  value={novoTopico.descricao}
                  onChange={(e) => setNovoTopico({ ...novoTopico, descricao: e.target.value })}
                  rows="4"
                  placeholder="Descreva o conteúdo do tópico..."
                />
              </div>
              <div className={styles.formGroup}>
                <label>Data</label>
                <input
                  type="date"
                  value={novoTopico.data}
                  onChange={(e) => setNovoTopico({ ...novoTopico, data: e.target.value })}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Arquivos (PDF)</label>
                <div className={styles.fileUpload}>
                  <input
                    type="file"
                    accept=".pdf"
                    multiple
                    onChange={handleFileUpload}
                    id="fileUpload"
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="fileUpload" className={styles.uploadLabel}>
                    <FaUpload /> Selecionar arquivos PDF
                  </label>
                  {novoTopico.arquivos.map((arquivo, idx) => (
                    <div key={idx} className={styles.fileItem}>
                      <FaFilePdf />
                      <span>{arquivo.nome}</span>
                      <small>({arquivo.tamanho})</small>
                      <button onClick={() => removerArquivo(idx)}>
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnCancelar} onClick={fecharModal}>
                Cancelar
              </button>
              <button className={styles.btnSalvar} onClick={salvarTopico}>
                <FaCheckCircle /> Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </TeacherLayout>
  );
}

export default ConteudosTopicos;