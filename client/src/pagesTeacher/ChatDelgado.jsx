import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import TeacherLayout from "../layouts/TeacherLayout";
import { 
  FaPaperPlane, 
  FaUserCircle, 
  FaUsers, 
  FaVoteYea,
  FaCheckCircle,
  FaUserTie,
  FaCrown,
  FaPoll,
  FaChartBar,
  FaComments,
  FaThumbsUp,
  FaUserGraduate,
  FaRegSmile
} from "react-icons/fa";
import { 
  MdHowToVote,
  MdBallot,
  MdChat,
  MdGroup,
  MdPersonAdd
} from "react-icons/md";
import styles from "./ChatDelegado.module.css";

function ChatDelegado() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [turmas, setTurmas] = useState([]);
  const [turmaSelecionada, setTurmaSelecionada] = useState(null);
  const [mensagens, setMensagens] = useState([]);
  const [novaMensagem, setNovaMensagem] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [candidatos, setCandidatos] = useState([]);
  const [votacaoAtiva, setVotacaoAtiva] = useState(false);
  const [votoUsuario, setVotoUsuario] = useState(null);
  const [resultadoVotacao, setResultadoVotacao] = useState(null);
  const [delegadoAtual, setDelegadoAtual] = useState(null);
  const messagesEndRef = useRef(null);
  
  // Dados do professor logado
  const professorLogado = {
    id: 0,
    nome: "Professor João Silva",
    tipo: "professor",
    email: "professor@imetro.com",
    codigo: "PROF001"
  };

  const turmasExemplo = [
    { id: 1, nome: "Turma A - 3º Ano", periodo: "Manhã", alunos: 32, delegado: null },
    { id: 2, nome: "Turma B - 2º Ano", periodo: "Tarde", alunos: 28, delegado: null },
    { id: 3, nome: "Turma C - 1º Ano", periodo: "Manhã", alunos: 30, delegado: { id: 5, nome: "Carlos Silva", votos: 15 } }
  ];

  const alunosExemplo = {
    1: [
      { id: 1, nome: "Ana Silva", matricula: "2024001", foto: null },
      { id: 2, nome: "Bruno Santos", matricula: "2024002", foto: null },
      { id: 3, nome: "Carla Oliveira", matricula: "2024003", foto: null },
      { id: 4, nome: "Daniel Souza", matricula: "2024004", foto: null },
      { id: 5, nome: "Elena Costa", matricula: "2024005", foto: null }
    ],
    2: [
      { id: 6, nome: "Fernando Lima", matricula: "2024006", foto: null },
      { id: 7, nome: "Gabriela Rocha", matricula: "2024007", foto: null },
      { id: 8, nome: "Henrique Alves", matricula: "2024008", foto: null }
    ],
    3: [
      { id: 9, nome: "Isabela Martins", matricula: "2024009", foto: null },
      { id: 10, nome: "João Pedro", matricula: "2024010", foto: null },
      { id: 11, nome: "Karina Lima", matricula: "2024011", foto: null },
      { id: 5, nome: "Carlos Silva", matricula: "2024005", foto: null }
    ]
  };

  const mensagensExemplo = {
    1: [
      { id: 1, usuario: "Ana Silva", usuarioId: 1, mensagem: "Bom dia pessoal!", data: new Date().toISOString(), tipo: "aluno", curtidas: 2 },
      { id: 2, usuario: "Professor João Silva", usuarioId: 0, mensagem: "Bom dia! Hoje teremos prova de matemática", data: new Date().toISOString(), tipo: "professor", curtidas: 5 },
      { id: 3, usuario: "Bruno Santos", usuarioId: 2, mensagem: "Ok professor!", data: new Date().toISOString(), tipo: "aluno", curtidas: 1 }
    ],
    2: [
      { id: 4, usuario: "Professor João Silva", usuarioId: 0, mensagem: "Alunos, lembrem-se do trabalho para amanhã", data: new Date().toISOString(), tipo: "professor", curtidas: 3 }
    ],
    3: [
      { id: 5, usuario: "Carlos Silva", usuarioId: 5, mensagem: "Pessoal, alguém pode me ajudar com a matéria?", data: new Date().toISOString(), tipo: "aluno", curtidas: 2 },
      { id: 6, usuario: "Isabela Martins", usuarioId: 9, mensagem: "Eu ajudo Carlos!", data: new Date().toISOString(), tipo: "aluno", curtidas: 1 }
    ]
  };

  useEffect(() => {
    // Forçar o usuário como professor
    const usuarioSalvo = localStorage.getItem("usuarioLogado");
    if (usuarioSalvo) {
      const userData = JSON.parse(usuarioSalvo);
      // Garantir que o tipo seja professor
      setUser({ ...userData, tipo: "professor" });
    } else {
      // Se não tiver usuário salvo, usar o professor padrão
      setUser(professorLogado);
    }
    carregarTurmas();
  }, [navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [mensagens]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const carregarTurmas = () => {
    setTurmas(turmasExemplo);
  };

  const selecionarTurma = (turmaId) => {
    const turma = turmas.find(t => t.id === turmaId);
    setTurmaSelecionada(turma);
    carregarMensagens(turmaId);
    carregarCandidatos(turmaId);
    carregarVotacaoStatus(turmaId);
    setDelegadoAtual(turma.delegado);
  };

  const carregarMensagens = (turmaId) => {
    const msgs = mensagensExemplo[turmaId] || [];
    setMensagens(msgs);
  };

  const carregarCandidatos = (turmaId) => {
    const alunos = alunosExemplo[turmaId] || [];
    setCandidatos(alunos.map(aluno => ({
      ...aluno,
      votos: 0,
      propostas: aluno.id === 5 ? "Melhorar a comunicação entre alunos e professores" : ""
    })));
  };

  const carregarVotacaoStatus = (turmaId) => {
    const votacaoSalva = localStorage.getItem(`votacao_${turmaId}`);
    if (votacaoSalva) {
      const dados = JSON.parse(votacaoSalva);
      setVotacaoAtiva(dados.ativa);
      setVotoUsuario(dados.votos?.[user?.id] || null);
      setResultadoVotacao(dados.resultado);
    } else {
      setVotacaoAtiva(false);
      setVotoUsuario(null);
      setResultadoVotacao(null);
    }
  };

  const enviarMensagem = () => {
    if (!novaMensagem.trim()) return;
    
    const novaMsg = {
      id: Date.now(),
      usuario: user?.nome || "Professor",
      usuarioId: user?.id || 0,
      mensagem: novaMensagem,
      data: new Date().toISOString(),
      tipo: "professor", // Forçar como professor
      curtidas: 0
    };
    
    setMensagens([...mensagens, novaMsg]);
    setNovaMensagem("");
    
    const msgsSalvas = localStorage.getItem(`chat_${turmaSelecionada.id}`);
    const todasMsgs = msgsSalvas ? JSON.parse(msgsSalvas) : [];
    todasMsgs.push(novaMsg);
    localStorage.setItem(`chat_${turmaSelecionada.id}`, JSON.stringify(todasMsgs));
  };

  const curtirMensagem = (msgId) => {
    setMensagens(mensagens.map(msg => 
      msg.id === msgId ? { ...msg, curtidas: msg.curtidas + 1 } : msg
    ));
  };

  const iniciarVotacao = () => {
    if (candidatos.length < 2) {
      alert("Precisa de pelo menos 2 candidatos para iniciar a votação");
      return;
    }
    setVotacaoAtiva(true);
    setVotoUsuario(null);
    setResultadoVotacao(null);
    
    localStorage.setItem(`votacao_${turmaSelecionada.id}`, JSON.stringify({
      ativa: true,
      votos: {},
      resultado: null
    }));
    
    // Mensagem no chat informando que a votação começou
    const msgInicio = {
      id: Date.now(),
      usuario: "Sistema",
      usuarioId: -1,
      mensagem: `📢 A votação para eleição de delegado(a) da turma foi iniciada pelo professor! Vote agora! 📢`,
      data: new Date().toISOString(),
      tipo: "sistema",
      curtidas: 0
    };
    setMensagens([...mensagens, msgInicio]);
  };

  const votar = (candidatoId) => {
    if (!votacaoAtiva) {
      alert("A votação não está ativa no momento");
      return;
    }
    if (votoUsuario) {
      alert("Você já votou!");
      return;
    }
    
    setVotoUsuario(candidatoId);
    setCandidatos(candidatos.map(c => 
      c.id === candidatoId ? { ...c, votos: c.votos + 1 } : c
    ));
    
    const votacaoSalva = localStorage.getItem(`votacao_${turmaSelecionada.id}`);
    const dados = votacaoSalva ? JSON.parse(votacaoSalva) : { ativa: true, votos: {}, resultado: null };
    dados.votos[user?.id || 0] = candidatoId;
    localStorage.setItem(`votacao_${turmaSelecionada.id}`, JSON.stringify(dados));
    
    alert("Voto computado com sucesso!");
  };

  const finalizarVotacao = () => {
    if (candidatos.length === 0) return;
    
    const vencedor = [...candidatos].sort((a, b) => b.votos - a.votos)[0];
    const totalVotos = candidatos.reduce((sum, c) => sum + c.votos, 0);
    
    setResultadoVotacao({
      vencedor,
      totalVotos,
      data: new Date().toISOString()
    });
    setVotacaoAtiva(false);
    setDelegadoAtual(vencedor);
    
    setTurmas(turmas.map(t => 
      t.id === turmaSelecionada.id ? { ...t, delegado: vencedor } : t
    ));
    
    const votacaoSalva = localStorage.getItem(`votacao_${turmaSelecionada.id}`);
    const dados = votacaoSalva ? JSON.parse(votacaoSalva) : {};
    dados.ativa = false;
    dados.resultado = {
      vencedor,
      totalVotos,
      data: new Date().toISOString()
    };
    localStorage.setItem(`votacao_${turmaSelecionada.id}`, JSON.stringify(dados));
    
    const msgVitoria = {
      id: Date.now(),
      usuario: "Sistema",
      usuarioId: -1,
      mensagem: `🎉 Parabéns ${vencedor.nome}! Você foi eleito(a) delegado(a) da turma com ${vencedor.votos} votos! 🎉`,
      data: new Date().toISOString(),
      tipo: "sistema",
      curtidas: 0
    };
    setMensagens([...mensagens, msgVitoria]);
  };

  const formatarData = (dataString) => {
    const data = new Date(dataString);
    return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <TeacherLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            <MdChat className={styles.titleIcon} />
            Chat e Eleição de Delegado
          </h1>
          <p className={styles.subtitle}>
            Comunicação interativa com os alunos e eleição do representante de turma
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
                  <FaUsers />
                </div>
                <div className={styles.turmaInfo}>
                  <h3>{turma.nome}</h3>
                  <p>{turma.alunos} alunos • {turma.periodo}</p>
                  {turma.delegado && (
                    <span className={styles.delegadoBadge}>
                      <FaUserTie /> Delegado: {turma.delegado.nome}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {turmaSelecionada && (
          <div className={styles.mainContent}>
            <div className={styles.tabs}>
              <button 
                className={`${styles.tab} ${activeTab === 'chat' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('chat')}
              >
                <FaComments /> Chat da Turma
              </button>
              <button 
                className={`${styles.tab} ${activeTab === 'votacao' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('votacao')}
              >
                <MdHowToVote /> Eleição de Delegado
              </button>
              <button 
                className={`${styles.tab} ${activeTab === 'resultados' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('resultados')}
              >
                <FaPoll /> Resultados
              </button>
            </div>

            {activeTab === 'chat' && (
              <div className={styles.chatContainer}>
                <div className={styles.chatHeader}>
                  <div className={styles.chatInfo}>
                    <FaComments className={styles.chatIcon} />
                    <span>Chat - {turmaSelecionada.nome}</span>
                  </div>
                  <div className={styles.userInfo}>
                    <FaUserTie className={styles.userIcon} />
                    <span>Você é: Professor</span>
                  </div>
                </div>

                <div className={styles.messagesArea}>
                  {mensagens.map(msg => (
                    <div 
                      key={msg.id} 
                      className={`${styles.message} ${msg.tipo === 'professor' ? styles.messageProfessor : msg.tipo === 'sistema' ? styles.messageSystem : styles.messageAluno}`}
                    >
                      <div className={styles.messageAvatar}>
                        {msg.tipo === 'professor' ? <FaUserTie /> : msg.tipo === 'sistema' ? <FaRegSmile /> : <FaUserGraduate />}
                      </div>
                      <div className={styles.messageContent}>
                        <div className={styles.messageHeader}>
                          <span className={styles.messageAuthor}>
                            {msg.usuario}
                            {msg.tipo === 'professor' && <span className={styles.professorBadge}>Professor</span>}
                          </span>
                          <span className={styles.messageTime}>{formatarData(msg.data)}</span>
                        </div>
                        <p className={styles.messageText}>{msg.mensagem}</p>
                        <button 
                          className={styles.messageLike}
                          onClick={() => curtirMensagem(msg.id)}
                        >
                          <FaThumbsUp /> {msg.curtidas}
                        </button>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <div className={styles.messageInput}>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Digite sua mensagem como professor..."
                    value={novaMensagem}
                    onChange={(e) => setNovaMensagem(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && enviarMensagem()}
                  />
                  <button className={styles.sendButton} onClick={enviarMensagem}>
                    <FaPaperPlane />
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'votacao' && (
              <div className={styles.votacaoContainer}>
                <div className={styles.votacaoHeader}>
                  <h2>Eleição de Delegado(a) de Turma</h2>
                  <p>Como professor, você pode iniciar e finalizar a votação</p>
                </div>

                {!votacaoAtiva && !resultadoVotacao ? (
                  <div className={styles.iniciarVotacao}>
                    <MdBallot className={styles.votacaoIcon} />
                    <h3>Iniciar nova eleição</h3>
                    <p>Quando iniciar a votação, os alunos poderão votar nos candidatos</p>
                    <button className={styles.btnIniciar} onClick={iniciarVotacao}>
                      <FaVoteYea /> Iniciar Votação
                    </button>
                  </div>
                ) : votacaoAtiva ? (
                  <>
                    <div className={styles.votacaoStatus}>
                      <span className={styles.statusBadge}>
                        Votação em Andamento
                      </span>
                      <p>Os alunos já podem votar nos seus candidatos</p>
                    </div>

                    <div className={styles.candidatosGrid}>
                      {candidatos.map(candidato => (
                        <div key={candidato.id} className={styles.candidatoCard}>
                          <div className={styles.candidatoAvatar}>
                            {candidato.foto ? (
                              <img src={candidato.foto} alt={candidato.nome} />
                            ) : (
                              <FaUserCircle />
                            )}
                          </div>
                          <h3>{candidato.nome}</h3>
                          <p className={styles.candidatoMatricula}>Mat: {candidato.matricula}</p>
                          {candidato.propostas && (
                            <p className={styles.candidatoPropostas}>"{candidato.propostas}"</p>
                          )}
                          <div className={styles.candidatoVotos}>
                            <FaChartBar /> {candidato.votos} votos
                          </div>
                          <button 
                            className={styles.btnVotar}
                            disabled={true}
                          >
                            <FaCheckCircle /> Professor não vota
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className={styles.acaoFinalizar}>
                      <button className={styles.btnFinalizar} onClick={finalizarVotacao}>
                        Finalizar Votação
                      </button>
                    </div>
                  </>
                ) : resultadoVotacao && (
                  <div className={styles.resultadoContainer}>
                    <div className={styles.vencedorCard}>
                      <FaCrown className={styles.vencedorIcon} />
                      <h2>Vencedor(a)</h2>
                      <div className={styles.vencedorAvatar}>
                        {resultadoVotacao.vencedor.foto ? (
                          <img src={resultadoVotacao.vencedor.foto} alt={resultadoVotacao.vencedor.nome} />
                        ) : (
                          <FaUserTie />
                        )}
                      </div>
                      <h3>{resultadoVotacao.vencedor.nome}</h3>
                      <p className={styles.vencedorVotos}>
                        {resultadoVotacao.vencedor.votos} votos
                      </p>
                      <p className={styles.totalVotos}>
                        Total de votos: {resultadoVotacao.totalVotos}
                      </p>
                      <p className={styles.dataVotacao}>
                        Eleição finalizada em {new Date(resultadoVotacao.data).toLocaleDateString('pt-BR')}
                      </p>
                    </div>

                    <div className={styles.outrosCandidatos}>
                      <h4>Outros Candidatos</h4>
                      {candidatos.filter(c => c.id !== resultadoVotacao.vencedor.id).map(candidato => (
                        <div key={candidato.id} className={styles.outroCandidato}>
                          <span>{candidato.nome}</span>
                          <span>{candidato.votos} votos</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'resultados' && (
              <div className={styles.resultadosContainer}>
                <div className={styles.historicoVotacoes}>
                  <h2>Histórico de Eleições</h2>
                  
                  {turmaSelecionada.delegado ? (
                    <div className={styles.delegadoAtual}>
                      <div className={styles.delegadoAtualIcon}>
                        <FaUserTie />
                      </div>
                      <div>
                        <h3>Delegado(a) Atual</h3>
                        <p><strong>{turmaSelecionada.delegado.nome}</strong></p>
                        <small>Eleito em {new Date().toLocaleDateString('pt-BR')}</small>
                      </div>
                    </div>
                  ) : (
                    <p className={styles.semDelegado}>Nenhum delegado eleito ainda</p>
                  )}

                  <div className={styles.estatisticasEleitorais}>
                    <h3>Estatísticas da Turma</h3>
                    <div className={styles.estatsGrid}>
                      <div className={styles.estatCard}>
                        <FaUsers />
                        <span>Total de Alunos</span>
                        <strong>{turmaSelecionada.alunos}</strong>
                      </div>
                      <div className={styles.estatCard}>
                        <FaVoteYea />
                        <span>Participação</span>
                        <strong>75%</strong>
                      </div>
                      <div className={styles.estatCard}>
                        <FaUserTie />
                        <span>Mandato</span>
                        <strong>Ano Letivo</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </TeacherLayout>
  );
}

export default ChatDelegado;