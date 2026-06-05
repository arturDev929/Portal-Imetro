import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MdRefresh, MdSearch, MdPersonAdd, MdFlightClass, MdBook, MdSettings, MdDashboard, MdDescription, MdClass } from "react-icons/md";
import { FaChalkboardTeacher, FaUserGraduate, FaClipboardList, FaChartLine } from "react-icons/fa";
import { BiCalendarCheck, BiFileBlank } from "react-icons/bi";
import api from "../service/api";
import { showSuccessToast, showErrorToast, showInfoToast, useConfirmToast } from "../components/global/CustomToast";
import Table from "../components/global/Table";
import TeacherLayout from "../layouts/TeacherLayout";
import styles from "./TurmasTeacher.module.css";

const API_TIMEOUT = 5000;

function TurmasTeacher() {
    const navigate = useNavigate();
    const [lista, setLista] = useState([]);
    const [listaFiltrada, setListaFiltrada] = useState([]);
    const [termoPesquisa, setTermoPesquisa] = useState('');
    const [loading, setLoading] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null);
    const [user, setUser] = useState(null);
    const { showConfirmToast, isConfirming } = useConfirmToast();

    const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false);
    const [turmaSelecionada, setTurmaSelecionada] = useState(null);

    useEffect(() => {
        const usuarioSalvo = localStorage.getItem("usuarioLogado");
        if (usuarioSalvo) {
            try {
                const userData = JSON.parse(usuarioSalvo);
                setUser(userData);
            } catch (error) {
                console.error("Erro ao parsear usuário:", error);
                setUser(null);
            }
        }
    }, []);

    const apiClient = useMemo(() => {
        const client = api.create({
            timeout: API_TIMEOUT,
            headers: { 'Content-Type': 'application/json' }
        });

        client.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.data?.error) {
                    showErrorToast("Erro", error.response.data.error);
                } else if (error.response?.data?.message) {
                    showErrorToast("Erro", error.response.data.message);
                } else if (error.response?.status === 404) {
                    showErrorToast("Erro de Conexão", "Endpoint não encontrado");
                } else if (error.code === 'ECONNABORTED') {
                    showErrorToast("Tempo Esgotado", "Tempo de requisição esgotado");
                } else {
                    showErrorToast("Erro", "Erro na comunicação com o servidor");
                }
                return Promise.reject(error);
            }
        );
        return client;
    }, []);

    const fetchData = useCallback(async (mostrarNotificacao = false) => {
        if (!user?.codigo) {
            return;
        }

        try {
            setLoading(true);
            const response = await apiClient.get(`/turmasProfessor/${user.codigo}`);
            
            const data = response.data?.data || response.data || [];
            setLista(data);
            setListaFiltrada(data);
            setUltimaAtualizacao(new Date().toLocaleTimeString('pt-BR'));

            if (mostrarNotificacao && data.length > 0) {
                showSuccessToast("Sucesso", "Dados atualizados com sucesso", { "Quantidade": `${data.length} disciplina(s)` });
            } else if (mostrarNotificacao && data.length === 0) {
                showInfoToast("Info", "Nenhuma disciplina encontrada para este professor");
            }
        } catch (error) {
            console.error("Erro ao buscar dados:", error);
            showErrorToast("Erro", "Não foi possível carregar os dados");
        } finally {
            setLoading(false);
        }
    }, [apiClient, user?.codigo]);

    useEffect(() => {
        if (user?.codigo) {
            fetchData(false);
        }
    }, [fetchData, user?.codigo]);

    useEffect(() => {
        if (termoPesquisa.trim() === '') {
            setListaFiltrada(lista);
        } else {
            const filtrados = lista.filter(item =>
                item.turma?.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
                item.disciplina?.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
                item.periodo?.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
                item.anoletivo?.toString().includes(termoPesquisa)
            );
            setListaFiltrada(filtrados);
        }
    }, [lista, termoPesquisa]);

    const handlePesquisa = useCallback((e) => {
        setTermoPesquisa(e.target.value);
    }, []);

    const limparPesquisa = useCallback(() => {
        setTermoPesquisa('');
        setListaFiltrada(lista);
    }, [lista]);

    const abrirModalDetalhes = useCallback((item) => {
        setTurmaSelecionada(item);
        setModalDetalhesAberto(true);
    }, []);

    const fecharModalDetalhes = useCallback(() => {
        setModalDetalhesAberto(false);
        setTurmaSelecionada(null);
    }, []);

    const gerenciarTurma = useCallback((item) => {
        navigate(`/professor/gerenciar-turma/${item.idperiodo}/${item.iddisciplina}/${encodeURIComponent(item.turma)}/${encodeURIComponent(item.disciplina)}`);
    }, [navigate]);

    const headers = ['Turma', 'Disciplina', 'Período', 'Ano Letivo', 'Alunos', 'Ações'];

    const renderRow = (item) => (
        <tr key={`${item.idperiodo}-${item.iddisciplina}`} className="align-middle">
            <td className="fw-semibold">{item.turma}</td>
            <td>
                <div className="d-flex align-items-center">
                    <MdBook className="me-2" style={{ color: 'var(--dourado)' }} size={18} />
                    {item.disciplina}
                </div>
             </td>
            <td>{item.periodo || 'Manhã'}</td>
            <td>
                <span className="badge" style={{ backgroundColor: 'var(--azul-escuro)' }}>
                    {item.anoletivo || '2024'}
                </span>
             </td>
            <td className="text-center">
                <span className="badge rounded-pill px-3 py-2" style={{ backgroundColor: 'var(--dourado)', color: 'var(--azul-escuro)' }}>
                    <FaUserGraduate className="me-1" size={12} />
                    {item.total_estudantes || 0}
                </span>
             </td>
            <td className="text-center">
                <div className="d-flex gap-2 justify-content-center">
                    <button
                        className={`btn btn-sm ${styles.btnInfo}`}
                        onClick={() => abrirModalDetalhes(item)}
                        disabled={loading || salvando || isConfirming}
                        title="Ver detalhes da disciplina"
                    >
                        <FaChalkboardTeacher size={16} />
                    </button>
                    <button
                        className={`btn btn-sm ${styles.btnGerenciar}`}
                        onClick={() => gerenciarTurma(item)}
                        disabled={loading || salvando || isConfirming}
                        title="Gerenciar turma"
                    >
                        <MdSettings size={16} />
                    </button>
                </div>
             </td>
        </tr>
    );

    const totalTurmas = [...new Set(lista.map(item => item.turma))].length;
    const totalDisciplinas = lista.length;
    const totalAlunos = lista.reduce((sum, item) => sum + (item.total_estudantes || 0), 0);

    return (
        <TeacherLayout>
            <div className={styles.container}>
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                    <div>
                        <h2 className={styles.headerTitle}>
                            <FaChalkboardTeacher />
                            Minhas Turmas e Disciplinas
                        </h2>
                        <p className={styles.headerSubtitle}>
                            Visualize e gerencie todas as turmas e disciplinas que você ministra
                        </p>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                        {ultimaAtualizacao && (
                            <small className={styles.updateInfo}>
                                Atualizado: {ultimaAtualizacao}
                            </small>
                        )}
                        <button
                            className={styles.btnAtualizar}
                            onClick={() => fetchData(true)}
                            disabled={loading || isConfirming}
                            title="Atualizar lista"
                        >
                            <MdRefresh size={18} className="me-1" />
                            Atualizar
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statCardContent}>
                            <div className={styles.statInfo}>
                                <p className={styles.statLabel}>Total de Turmas</p>
                                <h3 className={styles.statValue}>{totalTurmas}</h3>
                                <small className={styles.statTrend}>Turmas atribuídas</small>
                            </div>
                            <div className={styles.statIconWrapper}>
                                <MdFlightClass className={styles.statIcon} />
                            </div>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statCardContent}>
                            <div className={styles.statInfo}>
                                <p className={styles.statLabel}>Disciplinas Ministradas</p>
                                <h3 className={styles.statValue}>{totalDisciplinas}</h3>
                                <small className={styles.statTrend}>Diferentes disciplinas</small>
                            </div>
                            <div className={styles.statIconWrapper}>
                                <MdBook className={styles.statIcon} />
                            </div>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statCardContent}>
                            <div className={styles.statInfo}>
                                <p className={styles.statLabel}>Total de Alunos</p>
                                <h3 className={styles.statValue}>{totalAlunos}</h3>
                                <small className={styles.statTrend}>Alunos matriculados</small>
                            </div>
                            <div className={styles.statIconWrapper}>
                                <MdPersonAdd className={styles.statIcon} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className={styles.searchCard}>
                    <div className={styles.searchWrapper}>
                        <div className={styles.searchInputGroup}>
                            <MdSearch className={styles.searchIcon} size={20} />
                            <input
                                type="text"
                                className={styles.searchInput}
                                placeholder="Pesquisar por turma, disciplina, período ou ano letivo..."
                                value={termoPesquisa}
                                onChange={handlePesquisa}
                                disabled={loading}
                            />
                            {termoPesquisa && (
                                <button
                                    className={styles.clearButton}
                                    onClick={limparPesquisa}
                                    disabled={loading}
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>

                    {!loading && termoPesquisa && listaFiltrada.length > 0 && (
                        <div className={styles.searchResultBadge}>
                            {listaFiltrada.length} {listaFiltrada.length === 1 ? 'disciplina encontrada' : 'disciplinas encontradas'}
                        </div>
                    )}
                </div>

                {/* Main Content */}
                <div className={styles.tableContainer}>
                    {loading ? (
                        <div className={styles.loadingContainer}>
                            <div className={styles.spinner}></div>
                            <p className="text-muted">Carregando suas disciplinas...</p>
                        </div>
                    ) : termoPesquisa && listaFiltrada.length === 0 ? (
                        <div className={styles.emptyState}>
                            <MdSearch className={styles.emptyIcon} />
                            <h5 className={styles.emptyTitle}>Nenhuma disciplina encontrada</h5>
                            <p className={styles.emptyMessage}>Não encontramos resultados para "{termoPesquisa}"</p>
                            <button className={styles.btnAtualizar} onClick={limparPesquisa}>
                                Limpar pesquisa
                            </button>
                        </div>
                    ) : lista.length === 0 ? (
                        <div className={styles.emptyState}>
                            <MdFlightClass className={styles.emptyIcon} />
                            <h5 className={styles.emptyTitle}>Nenhuma turma atribuída</h5>
                            <p className={styles.emptyMessage}>Você ainda não possui turmas ou disciplinas atribuídas</p>
                            <button className={styles.btnAtualizar} onClick={() => fetchData(true)}>
                                <MdRefresh className="me-1" />
                                Atualizar
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="table-responsive">
                                <Table 
                                    headers={headers}
                                    data={listaFiltrada}
                                    renderRow={renderRow}
                                    className="table table-hover table-striped border-0 mb-0"
                                />
                            </div>
                            {listaFiltrada.length > 0 && (
                                <div className="p-3 bg-light border-top">
                                    <span className="badge bg-light text-dark p-2">
                                        Mostrando {listaFiltrada.length} de {lista.length} disciplina(s)
                                    </span>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Modal de Detalhes */}
            {modalDetalhesAberto && turmaSelecionada && (
                <div className={styles.modalOverlay} onClick={fecharModalDetalhes}>
                    <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h5 className={styles.modalTitle}>
                                <MdDashboard />
                                Painel de Gestão - {turmaSelecionada.disciplina}
                            </h5>
                            <button className={styles.modalClose} onClick={fecharModalDetalhes}>
                                ×
                            </button>
                        </div>

                        <div className={styles.modalInfo}>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <small className="text-muted d-block mb-1">Turma</small>
                                    <strong className="fs-5">{turmaSelecionada.turma}</strong>
                                </div>
                                <div className="col-md-6">
                                    <small className="text-muted d-block mb-1">Disciplina</small>
                                    <strong className="fs-5">{turmaSelecionada.disciplina}</strong>
                                </div>
                                <div className="col-md-4">
                                    <small className="text-muted d-block mb-1">Período</small>
                                    <strong>{turmaSelecionada.periodo || 'Manhã'}</strong>
                                </div>
                                <div className="col-md-4">
                                    <small className="text-muted d-block mb-1">Ano Letivo</small>
                                    <strong>{turmaSelecionada.anoletivo || '2024'}</strong>
                                </div>
                                <div className="col-md-4">
                                    <small className="text-muted d-block mb-1">Total de Alunos</small>
                                    <strong>
                                        <span className="badge fs-6" style={{ backgroundColor: 'var(--dourado)', color: 'var(--azul-escuro)' }}>
                                            {turmaSelecionada.total_estudantes || 0} alunos
                                        </span>
                                    </strong>
                                </div>
                            </div>
                        </div>

                        <div className={styles.modalBody}>
                            <h6 className="mb-3 fw-bold">O que deseja gerenciar?</h6>
                            <div className={styles.modalGrid}>
                                <div className={styles.modalCard} onClick={() => {
                                    fecharModalDetalhes();
                                    navigate(`/professor/gerenciar-turma/${turmaSelecionada.idperiodo}/${turmaSelecionada.iddisciplina}/estudantes`);
                                }}>
                                    <FaUserGraduate className={styles.modalCardIcon} style={{ color: 'var(--azul-escuro)' }} />
                                    <h6 className={styles.modalCardTitle}>Lista de Estudantes</h6>
                                    <p className={styles.modalCardDescription}>Visualize e gerencie os alunos matriculados</p>
                                </div>

                                <div className={styles.modalCard} onClick={() => {
                                    fecharModalDetalhes();
                                    navigate(`/professor/gerenciar-turma/${turmaSelecionada.idperiodo}/${turmaSelecionada.iddisciplina}/notas`);
                                }}>
                                    <FaClipboardList className={styles.modalCardIcon} style={{ color: '#28a745' }} />
                                    <h6 className={styles.modalCardTitle}>Lançamento de Notas</h6>
                                    <p className={styles.modalCardDescription}>Registre as avaliações dos alunos</p>
                                </div>

                                <div className={styles.modalCard} onClick={() => {
                                    fecharModalDetalhes();
                                    navigate(`/professor/gerenciar-turma/${turmaSelecionada.idperiodo}/${turmaSelecionada.iddisciplina}/presencas`);
                                }}>
                                    <BiCalendarCheck className={styles.modalCardIcon} style={{ color: '#17a2b8' }} />
                                    <h6 className={styles.modalCardTitle}>Registro de Presenças</h6>
                                    <p className={styles.modalCardDescription}>Controle a frequência dos alunos</p>
                                </div>

                                <div className={styles.modalCard} onClick={() => {
                                    fecharModalDetalhes();
                                    navigate(`/professor/gerenciar-turma/${turmaSelecionada.idperiodo}/${turmaSelecionada.iddisciplina}/aulas`);
                                }}>
                                    <MdDescription className={styles.modalCardIcon} style={{ color: '#ffc107' }} />
                                    <h6 className={styles.modalCardTitle}>Plano de Aulas</h6>
                                    <p className={styles.modalCardDescription}>Organize seu conteúdo programático</p>
                                </div>

                                <div className={styles.modalCard} onClick={() => {
                                    fecharModalDetalhes();
                                    navigate(`/professor/gerenciar-turma/${turmaSelecionada.idperiodo}/${turmaSelecionada.iddisciplina}/relatorios`);
                                }}>
                                    <FaChartLine className={styles.modalCardIcon} style={{ color: '#dc3545' }} />
                                    <h6 className={styles.modalCardTitle}>Relatórios</h6>
                                    <p className={styles.modalCardDescription}>Visualize estatísticas e desempenho</p>
                                </div>

                                <div className={styles.modalCard} onClick={() => {
                                    fecharModalDetalhes();
                                    gerenciarTurma(turmaSelecionada);
                                }}>
                                    <MdSettings className={styles.modalCardIcon} style={{ color: '#6c757d' }} />
                                    <h6 className={styles.modalCardTitle}>Configurações</h6>
                                    <p className={styles.modalCardDescription}>Configurações da disciplina</p>
                                </div>
                            </div>
                        </div>

                        <div className={styles.modalFooter}>
                            <button className={styles.btnCancelar} onClick={fecharModalDetalhes}>
                                Fechar
                            </button>
                            <button className={styles.btnSubmit} onClick={() => {
                                fecharModalDetalhes();
                                gerenciarTurma(turmaSelecionada);
                            }}>
                                <MdSettings className="me-2" />
                                Acessar Painel Completo
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </TeacherLayout>
    );
}

export default TurmasTeacher;