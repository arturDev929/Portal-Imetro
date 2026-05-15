import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MdRefresh, MdSearch, MdPersonAdd, MdFlightClass, MdBook, MdSettings, MdDashboard } from "react-icons/md";
import { FaChalkboardTeacher, FaUserGraduate, FaClipboardList, FaChartLine } from "react-icons/fa";
import api from "../service/api";
import { showSuccessToast, showErrorToast, showInfoToast, useConfirmToast } from "../components/global/CustomToast";
import Table from "../components/global/Table";
import TeacherLayout from "../layouts/TeacherLayout";
import Style from "../pagesAdm/components/DepartamentosEdit.module.css";

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

    // Estado para modal de detalhes
    const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false);
    const [turmaSelecionada, setTurmaSelecionada] = useState(null);

    useEffect(() => {
        const usuarioSalvo = localStorage.getItem("usuarioLogado");
        if (usuarioSalvo) {
            try {
                const userData = JSON.parse(usuarioSalvo);
                setUser(userData);
                console.log("Usuário carregado:", userData);
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
            console.log("Aguardando código do professor...", user);
            return;
        }

        try {
            setLoading(true);
            console.log("Buscando turmas para o professor:", user.codigo);
            const response = await apiClient.get(`/turmasProfessor/${user.codigo}`);
            
            console.log("Resposta da API:", response.data);
            const data = response.data?.data || response.data || [];
            setLista(data);
            setListaFiltrada(data);
            setUltimaAtualizacao(new Date().toLocaleTimeString('pt-BR'));

            if (mostrarNotificacao && data.length > 0) {
                showSuccessToast(
                    "Sucesso",
                    "Dados atualizados com sucesso",
                    { "Quantidade": `${data.length} disciplina(s)` }
                );
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
        const termo = e.target.value;
        setTermoPesquisa(termo);
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
        // Navegar para página de gestão da turma/disciplina
        navigate(`/professor/gerenciar-turma/${item.idperiodo}/${item.iddisciplina}/${encodeURIComponent(item.turma)}/${encodeURIComponent(item.disciplina)}`);
    }, [navigate]);

    const headers = ['Turma', 'Disciplina', 'Período', 'Ano Letivo', 'Alunos', 'Ações'];

    const renderRow = (item) => (
        <tr key={`${item.idperiodo}-${item.iddisciplina}`} className="align-middle">
            <td className="fw-semibold">{item.turma}</td>
            <td>
                <div className="d-flex align-items-center">
                    <MdBook className="me-2 text-primary" size={18} />
                    {item.disciplina}
                </div>
            </td>
            <td>{item.periodo || 'Manhã'}</td>
            <td>
                <span className="badge bg-secondary">
                    {item.anoletivo || '2024'}
                </span>
            </td>
            <td className="text-center">
                <span className="badge bg-primary rounded-pill px-3 py-2">
                    <FaUserGraduate className="me-1" size={12} />
                    {item.total_estudantes || 0}
                </span>
            </td>
            <td className="text-center">
                <div className="d-flex gap-2 justify-content-center">
                    <button
                        className={`btn btn-sm ${Style.btnInfo}`}
                        onClick={() => abrirModalDetalhes(item)}
                        disabled={loading || salvando || isConfirming}
                        title="Ver detalhes da disciplina"
                    >
                        <FaChalkboardTeacher size={16} />
                    </button>
                    <button
                        className={`btn btn-sm ${Style.btnGerenciar}`}
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

    const renderConteudo = () => {
        if (loading) {
            return (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary mx-auto mb-2" style={{ width: '3rem', height: '3rem' }} role="status">
                        <span className="visually-hidden">Carregando...</span>
                    </div>
                    <p className="text-muted mb-0">Carregando suas disciplinas...</p>
                </div>
            );
        }

        if (termoPesquisa && listaFiltrada.length === 0) {
            return (
                <div className="text-center py-5">
                    <MdSearch size={48} className="text-muted mb-3" />
                    <p className="text-muted mb-2">Nenhuma disciplina encontrada para "{termoPesquisa}"</p>
                    <button 
                        className="btn btn-outline-primary btn-sm"
                        onClick={limparPesquisa}
                    >
                        Limpar pesquisa
                    </button>
                </div>
            );
        }

        if (lista.length === 0 && !loading) {
            return (
                <div className="text-center py-5">
                    <MdFlightClass size={48} className="text-muted mb-3" />
                    <p className="text-muted mb-3">Nenhuma turma ou disciplina atribuída</p>
                    <button className="btn btn-outline-primary" onClick={() => fetchData(true)}>
                        <MdRefresh className="me-1" />
                        Atualizar
                    </button>
                </div>
            );
        }

        return (
            <div className="table-responsive">
                <Table 
                    headers={headers}
                    data={listaFiltrada}
                    renderRow={renderRow}
                    className="table table-hover table-striped border"
                />
                {listaFiltrada.length > 0 && (
                    <div className="mt-3 text-muted small">
                        <span className="badge bg-light text-dark p-2">
                            Mostrando {listaFiltrada.length} de {lista.length} disciplina(s)
                        </span>
                    </div>
                )}
            </div>
        );
    };

    // Calcular estatísticas
    const totalTurmas = [...new Set(lista.map(item => item.turma))].length;
    const totalDisciplinas = lista.length;
    const totalAlunos = lista.reduce((sum, item) => sum + (item.total_estudantes || 0), 0);

    return (
        <TeacherLayout>
            <div className="container-fluid px-4 py-4">
                {/* Header */}
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
                            <div>
                                <h2 className="h4 mb-0" style={{ color: 'var(--azul-escuro)' }}>
                                    <FaChalkboardTeacher className="me-2 mb-2" />
                                    Minhas Turmas e Disciplinas
                                </h2>
                                <p className="text-muted mt-2 mb-0">
                                    Visualize e gerencie todas as turmas e disciplinas que você ministra
                                </p>
                            </div>
                            <div className="d-flex gap-2 mt-2 mt-sm-0">
                                {ultimaAtualizacao && (
                                    <small className="text-muted align-self-end small">
                                        <i className="bi bi-clock me-1"></i>
                                        Atualizado: {ultimaAtualizacao}
                                    </small>
                                )}
                                <button
                                    className={`btn btn-sm ${Style.AtulizarDepartamento}`}
                                    onClick={() => fetchData(true)}
                                    disabled={loading || isConfirming}
                                    title="Atualizar lista"
                                >
                                    <MdRefresh size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cards de Estatísticas */}
                <div className="row mb-4 g-3">
                    <div className="col-md-4">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <p className="text-muted mb-1">Total de Turmas</p>
                                        <h3 className="mb-0 fw-bold">{totalTurmas}</h3>
                                        <small className="text-success">
                                            <i className="bi bi-arrow-up-short"></i>
                                            Turmas atribuídas
                                        </small>
                                    </div>
                                    <div className="bg-primary bg-opacity-10 rounded-3 p-3">
                                        <MdFlightClass size={28} className="text-primary" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <p className="text-muted mb-1">Disciplinas Ministradas</p>
                                        <h3 className="mb-0 fw-bold">{totalDisciplinas}</h3>
                                        <small className="text-info">
                                            <i className="bi bi-book me-1"></i>
                                            Diferentes disciplinas
                                        </small>
                                    </div>
                                    <div className="bg-success bg-opacity-10 rounded-3 p-3">
                                        <MdBook size={28} className="text-success" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <p className="text-muted mb-1">Total de Alunos</p>
                                        <h3 className="mb-0 fw-bold">{totalAlunos}</h3>
                                        <small className="text-warning">
                                            <i className="bi bi-people me-1"></i>
                                            Alunos matriculados
                                        </small>
                                    </div>
                                    <div className="bg-info bg-opacity-10 rounded-3 p-3">
                                        <MdPersonAdd size={28} className="text-info" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Barra de Pesquisa */}
                <div className="row mb-4">
                    <div className="col-md-8 mx-auto">
                        <div className="card shadow-sm border-0">
                            <div className="card-body p-3">
                                <div className="d-flex align-items-center gap-2">
                                    <div className="position-relative flex-grow-1">
                                        <div className="input-group">
                                            <span className="input-group-text border-end-0" style={{ backgroundColor: 'var(--cinza-claro)' }}>
                                                <MdSearch className="text-muted" size={20} />
                                            </span>
                                            <input
                                                type="text"
                                                className="form-control border-start-0 ps-0"
                                                placeholder="Pesquisar por turma, disciplina, período ou ano letivo..."
                                                value={termoPesquisa}
                                                onChange={handlePesquisa}
                                                disabled={loading}
                                                style={{
                                                    borderLeft: 'none',
                                                    boxShadow: 'none',
                                                    backgroundColor: 'var(--cinza-claro)',
                                                    padding: '10px'
                                                }}
                                            />
                                            {termoPesquisa && (
                                                <button
                                                    className="btn border-start-0"
                                                    type="button"
                                                    onClick={limparPesquisa}
                                                    disabled={loading}
                                                    style={{
                                                        borderLeft: 'none',
                                                        backgroundColor: '#dc3545',
                                                        color: 'white'
                                                    }}
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {!loading && termoPesquisa && listaFiltrada.length > 0 && (
                                    <div className="mt-2 text-muted small">
                                        <span className="badge bg-light text-dark p-2">
                                            <i className="bi bi-search me-1"></i>
                                            {listaFiltrada.length} {listaFiltrada.length === 1 ? 'disciplina encontrada' : 'disciplinas encontradas'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Conteúdo Principal */}
                <div className="row">
                    <div className="col-12">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body p-0">
                                {renderConteudo()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Detalhes da Disciplina */}
            {modalDetalhesAberto && turmaSelecionada && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content shadow-lg border-0">
                            <div className="modal-header" style={{ backgroundColor: 'var(--azul-escuro)', color: 'var(--dourado)' }}>
                                <h5 className="modal-title mb-0">
                                    <MdDashboard className="me-2 mb-1" />
                                    Painel de Gestão - {turmaSelecionada.disciplina}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close btn-close-white"
                                    onClick={fecharModalDetalhes}
                                    disabled={salvando || isConfirming}
                                />
                            </div>

                            <div className="bg-light p-4 border-bottom">
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <small className="text-muted d-block mb-1">
                                            <i className="bi bi-building me-1"></i> Turma
                                        </small>
                                        <strong className="fs-5">{turmaSelecionada.turma}</strong>
                                    </div>
                                    <div className="col-md-6">
                                        <small className="text-muted d-block mb-1">
                                            <i className="bi bi-book me-1"></i> Disciplina
                                        </small>
                                        <strong className="fs-5">{turmaSelecionada.disciplina}</strong>
                                    </div>
                                    <div className="col-md-4">
                                        <small className="text-muted d-block mb-1">
                                            <i className="bi bi-sun me-1"></i> Período
                                        </small>
                                        <strong>{turmaSelecionada.periodo || 'Manhã'}</strong>
                                    </div>
                                    <div className="col-md-4">
                                        <small className="text-muted d-block mb-1">
                                            <i className="bi bi-calendar me-1"></i> Ano Letivo
                                        </small>
                                        <strong>{turmaSelecionada.anoletivo || '2024'}</strong>
                                    </div>
                                    <div className="col-md-4">
                                        <small className="text-muted d-block mb-1">
                                            <i className="bi bi-people me-1"></i> Total de Alunos
                                        </small>
                                        <strong>
                                            <span className="badge bg-primary fs-6">
                                                {turmaSelecionada.total_estudantes || 0} alunos
                                            </span>
                                        </strong>
                                    </div>
                                </div>
                            </div>

                            <div className="modal-body p-4">
                                <h6 className="mb-3 fw-bold">O que deseja gerenciar?</h6>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <div 
                                            className="card border-0 bg-light h-100 cursor-pointer"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => {
                                                fecharModalDetalhes();
                                                // Navegar para gestão de estudantes
                                                navigate(`/professor/gerenciar-turma/${turmaSelecionada.idperiodo}/${turmaSelecionada.iddisciplina}/estudantes`);
                                            }}
                                        >
                                            <div className="card-body text-center">
                                                <FaUserGraduate size={32} className="text-primary mb-3" />
                                                <h6 className="mb-2">Lista de Estudantes</h6>
                                                <small className="text-muted">Visualize e gerencie os alunos matriculados</small>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div 
                                            className="card border-0 bg-light h-100 cursor-pointer"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => {
                                                fecharModalDetalhes();
                                                // Navegar para gestão de notas
                                                navigate(`/professor/gerenciar-turma/${turmaSelecionada.idperiodo}/${turmaSelecionada.iddisciplina}/notas`);
                                            }}
                                        >
                                            <div className="card-body text-center">
                                                <FaClipboardList size={32} className="text-success mb-3" />
                                                <h6 className="mb-2">Lançamento de Notas</h6>
                                                <small className="text-muted">Registre as avaliações dos alunos</small>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div 
                                            className="card border-0 bg-light h-100 cursor-pointer"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => {
                                                fecharModalDetalhes();
                                                // Navegar para gestão de presenças
                                                navigate(`/professor/gerenciar-turma/${turmaSelecionada.idperiodo}/${turmaSelecionada.iddisciplina}/presencas`);
                                            }}
                                        >
                                            <div className="card-body text-center">
                                                <i className="bi bi-calendar-check fs-1 text-info"></i>
                                                <h6 className="mb-2 mt-2">Registro de Presenças</h6>
                                                <small className="text-muted">Controle a frequência dos alunos</small>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div 
                                            className="card border-0 bg-light h-100 cursor-pointer"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => {
                                                fecharModalDetalhes();
                                                // Navegar para gestão de aulas
                                                navigate(`/professor/gerenciar-turma/${turmaSelecionada.idperiodo}/${turmaSelecionada.iddisciplina}/aulas`);
                                            }}
                                        >
                                            <div className="card-body text-center">
                                                <i className="bi bi-file-text fs-1 text-warning"></i>
                                                <h6 className="mb-2 mt-2">Plano de Aulas</h6>
                                                <small className="text-muted">Organize seu conteúdo programático</small>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div 
                                            className="card border-0 bg-light h-100 cursor-pointer"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => {
                                                fecharModalDetalhes();
                                                // Navegar para relatórios
                                                navigate(`/professor/gerenciar-turma/${turmaSelecionada.idperiodo}/${turmaSelecionada.iddisciplina}/relatorios`);
                                            }}
                                        >
                                            <div className="card-body text-center">
                                                <FaChartLine size={32} className="text-danger mb-3" />
                                                <h6 className="mb-2">Relatórios</h6>
                                                <small className="text-muted">Visualize estatísticas e desempenho</small>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div 
                                            className="card border-0 bg-light h-100 cursor-pointer"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => {
                                                fecharModalDetalhes();
                                                gerenciarTurma(turmaSelecionada);
                                            }}
                                        >
                                            <div className="card-body text-center">
                                                <MdSettings size={32} className="text-secondary mb-3" />
                                                <h6 className="mb-2">Configurações</h6>
                                                <small className="text-muted">Configurações da disciplina</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer border-0 justify-content-between p-4">
                                <button
                                    type="button"
                                    className={`btn ${Style.btnCancelar}`}
                                    onClick={fecharModalDetalhes}
                                    disabled={salvando || isConfirming}
                                >
                                    Fechar
                                </button>
                                <button
                                    type="button"
                                    className={`btn px-4 ${Style.btnSubmit}`}
                                    onClick={() => {
                                        fecharModalDetalhes();
                                        gerenciarTurma(turmaSelecionada);
                                    }}
                                >
                                    <MdSettings className="me-2" />
                                    Acessar Painel Completo
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </TeacherLayout>
    );
}

export default TurmasTeacher;