import { useEffect, useState, useCallback, useMemo } from "react";
import { MdEdit, MdDeleteForever, MdRefresh, MdSearch, MdAdd, MdPersonAdd } from "react-icons/md";
import { MdFlightClass } from "react-icons/md";
import api from "../../service/api";
import { showSuccessToast, showErrorToast, showInfoToast, useConfirmToast } from "../../components/global/CustomToast";
import CategoriaCursoAno from "./CategoriaCursoAno";
import Style from "./DepartamentosEdit.module.css"
import Table from "../../components/global/Table";

const API_TIMEOUT = 5000;

function TurmasAdm() {
    const [lista, setLista] = useState([]);
    const [listaFiltrada, setListaFiltrada] = useState([]);
    const [termoPesquisa, setTermoPesquisa] = useState('');
    const [loading, setLoading] = useState(false);
    const [salvando, setSalvando] = useState(false);
    
    // Estado para edição de turma
    const [dadosEdicao, setDadosEdicao] = useState({
        idperiodo: '',
        turma: '',
        periodo: '',
        anoletivo: '',
        idcurso: '',
        idanocurricular: '',
        idcategoriacurso: '',
        nomeCurso: '',
        nomeCategoria: '',
        anoCurricular: ''
    });
    
    // Estado para atribuição de professor
    const [modalProfessorAberto, setModalProfessorAberto] = useState(false);
    const [professorSelecionado, setProfessorSelecionado] = useState("");
    const [disciplinasTurma, setDisciplinasTurma] = useState([]);
    const [disciplinaSelecionada, setDisciplinaSelecionada] = useState("");
    const [turmaSelecionada, setTurmaSelecionada] = useState(null);
    const [carregandoDisciplinas, setCarregandoDisciplinas] = useState(false);
    const [carregandoProfessores, setCarregandoProfessores] = useState(false);
    const [professoresDisciplina, setProfessoresDisciplina] = useState([]);
    
    const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null);
    const [modalAdicionarAberto, setModalAdicionarAberto] = useState(false);
    const [modalEditarAberto, setModalEditarAberto] = useState(false);

    const [categoriaCursoAnoData, setCategoriaCursoAnoData] = useState({
        idcategoriacurso: '',
        idcurso: '',
        idanocurricular: ''
    });

    const [novaTurma, setNovaTurma] = useState({
        turma: '',
        periodo: '',
        anoletivo: '',
    });

    const [user, setUser] = useState(null);
    const { showConfirmToast, isConfirming } = useConfirmToast();

    const periodos = ['Manhã', 'Tarde', 'Noite'];

    useEffect(() => {
        const usuarioSalvo = localStorage.getItem("usuarioLogado");
        if (usuarioSalvo) {
            try {
                setUser(JSON.parse(usuarioSalvo));
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
                if (error.response?.data?.mensagem) {
                    showErrorToast("Erro", error.response.data.mensagem);
                } else if (error.response?.data?.message) {
                    showErrorToast("Erro", error.response.data.message);
                } else if (error.response?.data?.error) {
                    showErrorToast("Erro", error.response.data.error);
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
        try {
            setLoading(true);
            const response = await apiClient.get('/turmas');
            setLista(response.data || []);
            setListaFiltrada(response.data || []);
            setUltimaAtualizacao(new Date().toLocaleTimeString('pt-BR'));

            if (mostrarNotificacao && response.data && response.data.length > 0) {
                showSuccessToast(
                    "Sucesso",
                    "Dados atualizados com sucesso",
                    { "Quantidade": `${response.data.length} turma(s)` }
                );
            }
        } catch (error) {
            console.error("Erro ao buscar dados:", error);
        } finally {
            setLoading(false);
        }
    }, [apiClient]);

    const fetchDisciplinasTurma = useCallback(async (idperiodo, anocurricular) => {
        setCarregandoDisciplinas(true);
        try {
            const response = await apiClient.get(`/disciplinasPorTurma/${idperiodo}/${anocurricular}`);
            if (response.data && response.data.length > 0) {
                setDisciplinasTurma(response.data);
            } else {
                setDisciplinasTurma([]);
                showInfoToast("Info", "Esta turma não possui disciplinas cadastradas para este ano");
            }
        } catch (error) {
            console.error("Erro ao buscar disciplinas:", error);
            setDisciplinasTurma([]);
            showErrorToast("Erro", "Não foi possível carregar as disciplinas da turma");
        } finally {
            setCarregandoDisciplinas(false);
        }
    }, [apiClient]);

    const fetchProfessoresPorDisciplina = useCallback(async (iddisciplina) => {
        setCarregandoProfessores(true);
        setProfessorSelecionado("");
        try {
            const response = await apiClient.get(`/professoresPorDisciplina/${iddisciplina}`);
            if (response.data && response.data.length > 0) {
                setProfessoresDisciplina(response.data);
            } else {
                setProfessoresDisciplina([]);
                showInfoToast("Info", "Esta disciplina não possui professores vinculados");
            }
        } catch (error) {
            console.error("Erro ao buscar professores da disciplina:", error);
            setProfessoresDisciplina([]);
            showErrorToast("Erro", "Não foi possível carregar os professores da disciplina");
        } finally {
            setCarregandoProfessores(false);
        }
    }, [apiClient]);

    const handlePesquisa = useCallback((e) => {
        const termo = e.target.value;
        setTermoPesquisa(termo);

        if (termo.trim() === '') {
            setListaFiltrada(lista);
        } else {
            const filtrados = lista.filter(item =>
                item.turma?.toLowerCase().includes(termo.toLowerCase()) ||
                item.periodo?.toLowerCase().includes(termo.toLowerCase()) ||
                item.anoletivo?.toString().includes(termo) ||
                item.curso?.toLowerCase().includes(termo.toLowerCase()) ||
                item.categoriacurso?.toLowerCase().includes(termo.toLowerCase())
            );
            setListaFiltrada(filtrados);
        }
    }, [lista]);

    const limparPesquisa = useCallback(() => {
        setTermoPesquisa('');
        setListaFiltrada(lista);
    }, [lista]);

    useEffect(() => {
        fetchData(false);
    }, [fetchData]);

    useEffect(() => {
        if (termoPesquisa.trim() === '') {
            setListaFiltrada(lista);
        } else {
            const filtrados = lista.filter(item =>
                item.turma?.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
                item.periodo?.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
                item.anoletivo?.toString().includes(termoPesquisa) ||
                item.curso?.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
                item.categoriacurso?.toLowerCase().includes(termoPesquisa.toLowerCase())
            );
            setListaFiltrada(filtrados);
        }
    }, [lista, termoPesquisa]);

    const removerItemLocal = useCallback((id) => {
        setLista(prev => {
            const updatedList = prev.filter(item => item.id_periodo !== id);
            return updatedList;
        });
    }, []);

    const handleCategoriaCursoAnoChange = useCallback((data) => {
        setCategoriaCursoAnoData(data);
    }, []);

    const handleCategoriaCursoAnoEditChange = useCallback((data) => {
        setDadosEdicao(prev => ({
            ...prev,
            idcategoriacurso: data.idcategoriacurso,
            idcurso: data.idcurso,
            idanocurricular: data.idanocurricular
        }));
    }, []);

    const abrirModalEditar = useCallback((item) => {
        setDadosEdicao({
            idperiodo: item.id_periodo,
            turma: item.turma || '',
            periodo: item.periodo || '',
            anoletivo: item.anoletivo || '',
            idcurso: item.id_curso || '',
            idanocurricular: item.id_anocurricular || '',
            idcategoriacurso: item.id_categoria || '',
            nomeCurso: item.curso || '',
            nomeCategoria: item.categoriacurso || '',
            anoCurricular: item.anocurricular || ''
        });
        setModalEditarAberto(true);
    }, []);

    const fecharModalEditar = useCallback(() => {
        if (!salvando) {
            setModalEditarAberto(false);
            setDadosEdicao({
                idperiodo: '',
                turma: '',
                periodo: '',
                anoletivo: '',
                idcurso: '',
                idanocurricular: '',
                idcategoriacurso: '',
                nomeCurso: '',
                nomeCategoria: '',
                anoCurricular: ''
            });
        }
    }, [salvando]);

    const abrirModalProfessor = useCallback(async (item) => {
        setTurmaSelecionada(item);
        setProfessorSelecionado("");
        setDisciplinaSelecionada("");
        setProfessoresDisciplina([]);
        await fetchDisciplinasTurma(item.id_periodo, item.anocurricular);
        setModalProfessorAberto(true);
    }, [fetchDisciplinasTurma]);

    const handleDisciplinaChange = useCallback(async (e) => {
        const iddisciplina = e.target.value;
        setDisciplinaSelecionada(iddisciplina);
        setProfessorSelecionado("");
        if (iddisciplina) {
            await fetchProfessoresPorDisciplina(iddisciplina);
        } else {
            setProfessoresDisciplina([]);
        }
    }, [fetchProfessoresPorDisciplina]);

    const fecharModalProfessor = useCallback(() => {
        if (!salvando) {
            setModalProfessorAberto(false);
            setTurmaSelecionada(null);
            setProfessorSelecionado("");
            setDisciplinaSelecionada("");
            setDisciplinasTurma([]);
            setProfessoresDisciplina([]);
        }
    }, [salvando]);

    const abrirModalAdicionar = useCallback(() => {
        setModalAdicionarAberto(true);
        setNovaTurma({
            turma: '',
            periodo: '',
            anoletivo: '',
        });
        setCategoriaCursoAnoData({
            idcategoriacurso: '',
            idcurso: '',
            idanocurricular: ''
        });
    }, []);

    const fecharModalAdicionar = useCallback(() => {
        if (!salvando) {
            setModalAdicionarAberto(false);
            setNovaTurma({
                turma: '',
                periodo: '',
                anoletivo: '',
            });
            setCategoriaCursoAnoData({
                idcategoriacurso: '',
                idcurso: '',
                idanocurricular: ''
            });
        }
    }, [salvando]);

    const salvarEdicao = useCallback(async (e) => {
        e?.preventDefault();

        if (!dadosEdicao.turma?.trim()) {
            showErrorToast("Validação", "Preencha o nome da turma");
            return;
        }

        if (!dadosEdicao.idcategoriacurso || !dadosEdicao.idcurso || !dadosEdicao.idanocurricular) {
            showErrorToast("Validação", "Selecione a categoria, curso e ano curricular");
            return;
        }

        setSalvando(true);
        try {
            const response = await apiClient.put(`/periodo/${dadosEdicao.idperiodo}`, {
                id_anocurricular: dadosEdicao.idanocurricular,
                id_curso: dadosEdicao.idcurso,
                id_categoria: dadosEdicao.idcategoriacurso,
                turma: dadosEdicao.turma,
                periodo: dadosEdicao.periodo,
                id_anoletivo: dadosEdicao.anoletivo || null
            });

            showSuccessToast(
                "Sucesso",
                response.data.mensagem || "Turma atualizada com sucesso"
            );

            await fetchData(false);
            fecharModalEditar();
        } catch (error) {
            console.error("Erro ao editar:", error);

            if (error.response?.data?.mensagem) {
                showErrorToast("Erro", error.response.data.mensagem);
            } else if (error.response?.data?.error) {
                showErrorToast("Erro", error.response.data.error);
            } else {
                showErrorToast(
                    "Erro ao editar",
                    "Não foi possível atualizar a turma. Tente novamente."
                );
            }
        } finally {
            setSalvando(false);
        }
    }, [dadosEdicao, apiClient, fetchData, fecharModalEditar]);

    const salvarAtribuicaoProfessor = useCallback(async (e) => {
        e?.preventDefault();

        if (!turmaSelecionada) {
            showErrorToast("Erro", "Nenhuma turma selecionada");
            return;
        }

        if (!disciplinaSelecionada) {
            showErrorToast("Validação", "Selecione uma disciplina");
            return;
        }

        if (!professorSelecionado) {
            showErrorToast("Validação", "Selecione um professor");
            return;
        }

        if (!user || !user.id) {
            showErrorToast("Erro", "Usuário não autenticado");
            return;
        }

        setSalvando(true);
        try {
            const response = await apiClient.post('/atribuirProfessorTurma', {
                id_periodo: turmaSelecionada.id_periodo,
                id_disciplina: disciplinaSelecionada,
                id_professor: professorSelecionado,
                id_anoletivo: turmaSelecionada.id_anoletivo || null,
                idAdm: user.id
            });

            showSuccessToast(
                "Sucesso",
                response.data.message || "Professor atribuído com sucesso"
            );

            fecharModalProfessor();
            await fetchData(false);
        } catch (error) {
            console.error("Erro ao atribuir professor:", error);

            if (error.response?.data?.message) {
                showErrorToast("Erro", error.response.data.message);
            } else if (error.response?.data?.error) {
                showErrorToast("Erro", error.response.data.error);
            } else {
                showErrorToast(
                    "Erro ao atribuir professor",
                    "Não foi possível atribuir o professor. Tente novamente."
                );
            }
        } finally {
            setSalvando(false);
        }
    }, [turmaSelecionada, disciplinaSelecionada, professorSelecionado, user, apiClient, fecharModalProfessor, fetchData]);

    const salvarNovaTurma = useCallback(async (e) => {
        e?.preventDefault();

        if (!user || !user.id) {
            showErrorToast("Erro", "Usuário não autenticado");
            return;
        }

        if (!novaTurma.turma?.trim()) {
            showErrorToast("Validação", "Preencha o nome da turma");
            return;
        }

        if (!categoriaCursoAnoData.idcategoriacurso || !categoriaCursoAnoData.idcurso || !categoriaCursoAnoData.idanocurricular) {
            showErrorToast("Validação", "Selecione a categoria, curso e ano curricular");
            return;
        }

        setSalvando(true);
        try {
            const response = await apiClient.post('/registrarPeriodo', {
                id_anocurricular: categoriaCursoAnoData.idanocurricular,
                id_curso: categoriaCursoAnoData.idcurso,
                id_categoria: categoriaCursoAnoData.idcategoriacurso,
                turma: novaTurma.turma,
                periodo: novaTurma.periodo,
                anoletivo: novaTurma.anoletivo,
                idAdm: user.id
            });

            showSuccessToast(
                "Sucesso",
                response.data.mensagem || "Turma adicionada com sucesso"
            );

            await fetchData(false);
            fecharModalAdicionar();
        } catch (error) {
            console.error("Erro ao adicionar turma:", error);
            if (error.response?.data?.mensagem) {
                showErrorToast("Erro", error.response.data.mensagem);
            } else {
                showErrorToast("Erro", "Não foi possível adicionar a turma");
            }
        } finally {
            setSalvando(false);
        }
    }, [novaTurma, categoriaCursoAnoData, apiClient, user, fetchData, fecharModalAdicionar]);

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setDadosEdicao(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleNovaTurmaChange = useCallback((e) => {
        const { name, value } = e.target;
        setNovaTurma(prev => ({ ...prev, [name]: value }));
    }, []);

    const deletarTurma = useCallback(async (id, nome) => {
        showConfirmToast(
            `Tem certeza que deseja excluir a turma "${nome}"? Esta ação não pode ser desfeita.`,
            async () => {
                try {
                    showInfoToast("Processando", "Excluindo turma...");

                    const response = await apiClient.delete(`/periodo/${id}`);

                    showSuccessToast(
                        "Sucesso",
                        response.data?.mensagem || "Turma excluída com sucesso"
                    );

                    removerItemLocal(id);
                } catch (error) {
                    console.error("Erro detalhado ao deletar:", {
                        mensagem: error.message,
                        resposta: error.response?.data,
                        status: error.response?.status,
                        config: error.config
                    });

                    if (error.response?.data?.mensagem) {
                        showErrorToast("Erro", error.response.data.mensagem);
                    } else if (error.response?.status === 404) {
                        showErrorToast("Erro 404", "Rota não encontrada. Verifique o endpoint");
                    } else if (error.response?.status === 500) {
                        showErrorToast("Erro no servidor", error.response?.data?.error || "Erro interno do servidor");
                    } else {
                        showErrorToast(
                            "Erro ao deletar",
                            error.response?.data?.message || "Verifique se a turma está vinculada a estudantes"
                        );
                    }
                }
            },
            null,
            "Confirmar Exclusão"
        );
    }, [apiClient, removerItemLocal, showConfirmToast]);

    const isEmpty = lista.length === 0 && !loading;
    const semResultados = !loading && listaFiltrada.length === 0 && termoPesquisa !== '';

    const headers = ['Categoria', 'Curso', 'Ano', 'Turma', 'Período', 'Ano Letivo', 'Professor', 'Editar', 'Excluir'];

    const renderRow = (item) => (
        <tr key={item.id_periodo}>
            <td className="align-middle">{item.categoriacurso}</td>
            <td className="align-middle">{item.curso}</td>
            <td className="text-center align-middle">{item.anocurricular}º</td>
            <td className="text-center align-middle fw-semibold">{item.turma}</td>
            <td className="text-center align-middle">{item.periodo}</td>
            <td className="text-center align-middle">{item.anoletivo}</td>
            <td className="text-center">
                <button
                    className={`btn btn-sm ${Style.btnProfessor}`}
                    onClick={() => abrirModalProfessor(item)}
                    disabled={loading || salvando || isConfirming}
                    title={`Atribuir professor para ${item.turma}`}
                >
                    <MdPersonAdd size={18} />
                </button>
            </td>
            <td className="text-center">
                <button
                    className={`btn btn-sm ${Style.btnEditar}`}
                    onClick={() => abrirModalEditar(item)}
                    disabled={loading || salvando || isConfirming}
                    title={`Editar ${item.turma}`}
                >
                    <MdEdit />
                </button>
            </td>
            <td className="text-center">
                <button
                    className={`btn btn-sm ${Style.btnDeletar}`}
                    onClick={() => deletarTurma(item.id_periodo, item.turma)}
                    disabled={loading || salvando || isConfirming}
                    title={`Excluir ${item.turma}`}
                >
                    <MdDeleteForever />
                </button>
            </td>
        </tr>
    );

    const renderConteudo = () => {
        if (loading) {
            return (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary mx-auto mb-2" style={{width: '3rem', height: '3rem'}} role="status">
                        <span className="visually-hidden">Carregando...</span>
                    </div>
                    <p className="text-muted mb-0">Carregando turmas...</p>
                </div>
            );
        }

        if (semResultados) {
            return (
                <div className="text-center py-5">
                    <MdSearch size={48} className="text-muted mb-3" />
                    <p className="text-muted mb-2">Nenhuma turma encontrada para "{termoPesquisa}"</p>
                    <button 
                        className="btn btn-outline-primary btn-sm"
                        onClick={limparPesquisa}
                    >
                        Limpar pesquisa
                    </button>
                </div>
            );
        }

        if (isEmpty) {
            return (
                <div className="text-center py-5">
                    <i className="bi bi-inbox display-4 text-muted mb-3 d-block"></i>
                    <p className="text-muted mb-3">Nenhuma turma encontrada</p>
                    <button className="btn btn-outline-primary" onClick={() => fetchData(true)}>
                        <MdRefresh className="me-1" />
                        Carregar turmas
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
            </div>
        );
    };

    return (
        <div className="row mb-4">
            <div className="col-12">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2 className="h4 mb-0" style={{ color: 'var(--azul-escuro)' }}>
                        <MdFlightClass className="me-2 mb-2" />
                        Turmas
                    </h2>
                    <div className="d-flex gap-2">
                        {ultimaAtualizacao && (
                            <small className="text-muted align-self-end small">
                                Atualizado: {ultimaAtualizacao}
                            </small>
                        )}
                        <button
                            className={`btn btn-sm ${Style.AtulizarDepartamento}`}
                            onClick={() => fetchData(true)}
                            disabled={loading || isConfirming}
                            title="Atualizar lista"
                        >
                            <MdRefresh />
                        </button>
                        <button
                            className={`btn btn-sm ${Style.btnSubmit}`}
                            onClick={abrirModalAdicionar}
                            disabled={loading || salvando || isConfirming}
                            title="Adicionar nova turma"
                        >
                            <MdAdd className="me-1" />
                            Nova Turma
                        </button>
                    </div>
                </div>

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
                                                placeholder="Pesquisar turma por nome, período, ano letivo, curso..."
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
                                                        backgroundColor: 'var(--danger)',
                                                        color: 'var(--branco)'
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
                                            {listaFiltrada.length} {listaFiltrada.length === 1 ? 'turma encontrada' : 'turmas encontradas'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {renderConteudo()}
            </div>

            {/* Modal de Edição */}
            {modalEditarAberto && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,.5)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content shadow-lg border-0">
                            <div className="modal-header" style={{ backgroundColor: 'var(--azul-escuro)', color: 'var(--dourado)' }}>
                                <h5 className="modal-title mb-0">
                                    <MdEdit className="me-2 mb-1" />
                                    Editar Turma: {dadosEdicao.turma}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close btn-close-white"
                                    onClick={fecharModalEditar}
                                    disabled={salvando || isConfirming}
                                />
                            </div>

                            <div className="bg-light p-3 border-bottom">
                                <div className="row">
                                    <div className="col-md-4">
                                        <small className="text-muted d-block">Categoria</small>
                                        <strong>{dadosEdicao.nomeCategoria}</strong>
                                    </div>
                                    <div className="col-md-4">
                                        <small className="text-muted d-block">Curso</small>
                                        <strong>{dadosEdicao.nomeCurso}</strong>
                                    </div>
                                    <div className="col-md-4">
                                        <small className="text-muted d-block">Ano Curricular</small>
                                        <strong>{dadosEdicao.anoCurricular}º Ano</strong>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={salvarEdicao}>
                                <div className="modal-body">
                                    <CategoriaCursoAno
                                        onChange={handleCategoriaCursoAnoEditChange}
                                        initialValues={{
                                            idcategoriacurso: dadosEdicao.idcategoriacurso,
                                            idcurso: dadosEdicao.idcurso,
                                            idanocurricular: dadosEdicao.idanocurricular
                                        }}
                                    />

                                    <div className="row mt-3">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Turma</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="turma"
                                                value={dadosEdicao.turma}
                                                onChange={handleInputChange}
                                                placeholder="Ex: A, B, C..."
                                                disabled={salvando || isConfirming}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Período</label>
                                            <select
                                                className="form-select"
                                                name="periodo"
                                                value={dadosEdicao.periodo}
                                                onChange={handleInputChange}
                                                disabled={salvando || isConfirming}
                                                required
                                            >
                                                <option value="">Selecione...</option>
                                                {periodos.map(periodo => (
                                                    <option key={periodo} value={periodo}>
                                                        {periodo}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Ano Letivo</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="anoletivo"
                                                value={dadosEdicao.anoletivo}
                                                onChange={handleInputChange}
                                                placeholder="Ex: 2024-2025"
                                                pattern="\d{4}-\d{4}"
                                                title="Formato: YYYY-YYYY (ex: 2024-2025)"
                                                disabled={salvando || isConfirming}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer border-0">
                                    <button
                                        type="button"
                                        className={`btn ${Style.btnCancelar}`}
                                        onClick={fecharModalEditar}
                                        disabled={salvando || isConfirming}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className={`btn px-4 ${Style.btnSubmit}`}
                                        disabled={salvando || isConfirming || !dadosEdicao.turma.trim()}
                                    >
                                        {salvando ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Salvando...
                                            </>
                                        ) : (
                                            'Salvar Alterações'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Atribuição de Professor */}
            {modalProfessorAberto && turmaSelecionada && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content shadow-lg border-0">
                            <div className="modal-header" style={{ backgroundColor: 'var(--azul-escuro)', color: 'var(--dourado)' }}>
                                <h5 className="modal-title mb-0">
                                    <MdPersonAdd className="me-2 mb-1" />
                                    Atribuir Professor - {turmaSelecionada.turma}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close btn-close-white"
                                    onClick={fecharModalProfessor}
                                    disabled={salvando || isConfirming}
                                />
                            </div>

                            <div className="bg-light p-3 border-bottom">
                                <div className="row">
                                    <div className="col-md-6">
                                        <small className="text-muted d-block">Turma</small>
                                        <strong>{turmaSelecionada.turma}</strong>
                                    </div>
                                    <div className="col-md-6">
                                        <small className="text-muted d-block">Curso</small>
                                        <strong>{turmaSelecionada.curso}</strong>
                                    </div>
                                    <div className="col-md-6 mt-2">
                                        <small className="text-muted d-block">Período</small>
                                        <strong>{turmaSelecionada.periodo}</strong>
                                    </div>
                                    <div className="col-md-6 mt-2">
                                        <small className="text-muted d-block">Ano Letivo</small>
                                        <strong>{turmaSelecionada.anoletivo}</strong>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={salvarAtribuicaoProfessor}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">1. Selecione a Disciplina</label>
                                        <select
                                            className="form-select"
                                            value={disciplinaSelecionada}
                                            onChange={handleDisciplinaChange}
                                            disabled={salvando || carregandoDisciplinas}
                                            required
                                        >
                                            <option value="">Selecione uma disciplina</option>
                                            {carregandoDisciplinas && (
                                                <option value="" disabled>Carregando disciplinas...</option>
                                            )}
                                            {disciplinasTurma.length > 0 && disciplinasTurma.map((disc) => (
                                                <option key={disc.id_disciplina} value={disc.id_disciplina}>
                                                    {disc.disciplina} - {disc.semestre}º Semestre
                                                </option>
                                            ))}
                                        </select>
                                        {disciplinasTurma.length === 0 && !carregandoDisciplinas && (
                                            <small className="text-danger d-block mt-1">
                                                Nenhuma disciplina cadastrada para esta turma.
                                            </small>
                                        )}
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">2. Selecione o Professor</label>
                                        <select
                                            className="form-select"
                                            value={professorSelecionado}
                                            onChange={(e) => setProfessorSelecionado(e.target.value)}
                                            disabled={salvando || carregandoProfessores || !disciplinaSelecionada}
                                            required
                                        >
                                            <option value="">Selecione um professor</option>
                                            {carregandoProfessores && (
                                                <option value="" disabled>Carregando professores...</option>
                                            )}
                                            {professoresDisciplina.length > 0 && professoresDisciplina.map((prof) => (
                                                <option key={prof.id_professor} value={prof.id_professor}>
                                                    {prof.nome} - {prof.especialidade || 'Sem especialidade'}
                                                </option>
                                            ))}
                                        </select>
                                        {disciplinaSelecionada && !carregandoProfessores && professoresDisciplina.length === 0 && (
                                            <small className="text-warning d-block mt-1">
                                                Nenhum professor vinculado a esta disciplina.
                                            </small>
                                        )}
                                    </div>
                                </div>
                                <div className="modal-footer border-0">
                                    <button
                                        type="button"
                                        className={`btn ${Style.btnCancelar}`}
                                        onClick={fecharModalProfessor}
                                        disabled={salvando || isConfirming}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className={`btn px-4 ${Style.btnSubmit}`}
                                        disabled={salvando || !disciplinaSelecionada || !professorSelecionado || disciplinasTurma.length === 0}
                                    >
                                        {salvando ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Atribuindo...
                                            </>
                                        ) : (
                                            'Atribuir Professor'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Adicionar Turma */}
            {modalAdicionarAberto && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,.5)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content shadow-lg border-0">
                            <div className="modal-header" style={{ backgroundColor: 'var(--azul-escuro)', color: 'var(--dourado)' }}>
                                <h5 className="modal-title mb-0">
                                    <MdAdd className="me-2" />
                                    Adicionar Nova Turma
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close btn-close-white"
                                    onClick={fecharModalAdicionar}
                                    disabled={salvando || isConfirming}
                                />
                            </div>
                            <form onSubmit={salvarNovaTurma}>
                                <div className="modal-body">
                                    <CategoriaCursoAno onChange={handleCategoriaCursoAnoChange} />

                                    <div className="row mt-3">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Turma</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="turma"
                                                value={novaTurma.turma}
                                                onChange={handleNovaTurmaChange}
                                                placeholder="Ex: LCC1M, LCC2M..."
                                                disabled={salvando || isConfirming}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Período</label>
                                            <select
                                                className="form-select"
                                                name="periodo"
                                                value={novaTurma.periodo}
                                                onChange={handleNovaTurmaChange}
                                                disabled={salvando || isConfirming}
                                                required
                                            >
                                                <option value="">Selecione...</option>
                                                {periodos.map(periodo => (
                                                    <option key={periodo} value={periodo}>
                                                        {periodo}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Ano Letivo</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="anoletivo"
                                                value={novaTurma.anoletivo}
                                                onChange={handleNovaTurmaChange}
                                                placeholder="Ex: 2025-2026"
                                                pattern="\d{4}-\d{4}"
                                                title="Formato: YYYY-YYYY (ex: 2025-2026)"
                                                disabled={salvando || isConfirming}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer border-0">
                                    <button
                                        type="button"
                                        className={`btn ${Style.btnCancelar}`}
                                        onClick={fecharModalAdicionar}
                                        disabled={salvando || isConfirming}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className={`btn px-4 ${Style.btnSubmit}`}
                                        disabled={salvando || isConfirming || !novaTurma.turma.trim()}
                                    >
                                        {salvando ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Adicionando...
                                            </>
                                        ) : (
                                            'Adicionar Turma'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TurmasAdm;