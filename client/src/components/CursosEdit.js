import { useEffect, useState, useCallback, useMemo } from "react";
import { 
    MdEdit, 
    MdDeleteForever, 
    MdRefresh, 
    MdExpandMore, 
    MdExpandLess,
    MdRemoveCircleOutline,
    MdSearch,
    MdAdd 
} from "react-icons/md";
import { IoMdSchool } from "react-icons/io";
import { FaBook, FaCalendarAlt, FaLayerGroup } from "react-icons/fa";
import axios from "axios";
import { showSuccessToast, showErrorToast, showInfoToast, useConfirmToast} from "./CustomToast";
import Style from "./DepartamentosEdit.module.css"

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";
const API_TIMEOUT = 5000;

function CursosEdit() {
    const [lista, setLista] = useState([]);
    const [listaFiltrada, setListaFiltrada] = useState([]);
    const [termoPesquisa, setTermoPesquisa] = useState('');
    const [departamentos, setDepartamentos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [dadosEdicao, setDadosEdicao] = useState({
        idcurso: '',
        curso: '',
        idcategoriacurso: ''
    });
    const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null);
    
    // Novo estado para controle do modal de adicionar
    const [modalAdicionarAberto, setModalAdicionarAberto] = useState(false);
    const [dadosNovoCurso, setDadosNovoCurso] = useState({
        curso: '',
        idcategoriacurso: ''
    });
    
    // Estados para anos curriculares
    const [anosCurriculares, setAnosCurriculares] = useState([]);
    const [loadingAnos, setLoadingAnos] = useState(false);

    // Novos estados para o modal de disciplinas
    const [modalDisciplinasAberto, setModalDisciplinasAberto] = useState(false);
    const [disciplinasCurso, setDisciplinasCurso] = useState(null);
    const [loadingDisciplinas, setLoadingDisciplinas] = useState(false);
    const [anoExpandido, setAnoExpandido] = useState({});
    const [cursoSelecionado, setCursoSelecionado] = useState(null);
    const [cursoSelecionadoId, setCursoSelecionadoId] = useState(null);
    const [removendoDisciplina, setRemovendoDisciplina] = useState(null);

    const { showConfirmToast, isConfirming } = useConfirmToast();

    const apiClient = useMemo(() => {
        const client = axios.create({
            baseURL: API_BASE_URL,
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

    const fetchCursos = useCallback(async (mostrarNotificacao = false) => {
        try {
            setLoading(true);
            const response = await apiClient.get('/get/cursos');
            setLista(response.data || []);
            setListaFiltrada(response.data || []);
            setUltimaAtualizacao(new Date().toLocaleTimeString('pt-BR'));
            
            if (mostrarNotificacao && response.data && response.data.length > 0) {
                showSuccessToast(
                    "Sucesso",
                    "Dados atualizados com sucesso",
                    { "Quantidade": `${response.data.length} curso(s)` }
                );
            }
        } catch (error) {
            console.error("Erro ao buscar cursos:", error);
        } finally {
            setLoading(false);
        }
    }, [apiClient]);

    const fetchDepartamentos = useCallback(async () => {
        try {
            const response = await apiClient.get('/get/categoriaCurso');
            setDepartamentos(response.data || []);
        } catch (error) {
            console.error("Erro ao buscar departamentos:", error);
            showErrorToast("Erro", "Não foi possível carregar departamentos");
        }
    }, [apiClient]);

    const handlePesquisa = useCallback((e) => {
        const termo = e.target.value;
        setTermoPesquisa(termo);
        
        if (termo.trim() === '') {
            setListaFiltrada(lista);
        } else {
            const filtrados = lista.filter(item => 
                item.curso.toLowerCase().includes(termo.toLowerCase()) ||
                (item.categoriacurso && item.categoriacurso.toLowerCase().includes(termo.toLowerCase()))
            );
            setListaFiltrada(filtrados);
        }
    }, [lista]);

    const limparPesquisa = useCallback(() => {
        setTermoPesquisa('');
        setListaFiltrada(lista);
    }, [lista]);

    useEffect(() => {
        if (termoPesquisa.trim() === '') {
            setListaFiltrada(lista);
        } else {
            const filtrados = lista.filter(item => 
                item.curso.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
                (item.categoriacurso && item.categoriacurso.toLowerCase().includes(termoPesquisa.toLowerCase()))
            );
            setListaFiltrada(filtrados);
        }
    }, [lista, termoPesquisa]);

    const fetchAnosCurriculares = useCallback(async (idCurso) => {
        if (!idCurso) {
            console.log('ID do curso não fornecido');
            setAnosCurriculares([]);
            return;
        }
        
        try {
            setLoadingAnos(true);
            const response = await apiClient.get(`/get/anoCurricular/${idCurso}`);
            
            const data = response.data;
            
            if (Array.isArray(data)) {
                setAnosCurriculares(data);
            } else if (data && typeof data === 'object') {
                setAnosCurriculares([data]);
            } else {
                setAnosCurriculares([]);
            }
            
        } catch (error) {
            console.error("Erro ao buscar anos curriculares:", error);
            setAnosCurriculares([]);
        } finally {
            setLoadingAnos(false);
        }
    }, [apiClient]);

    const fetchDisciplinasPorCurso = useCallback(async (idCurso, nomeCurso) => {
        if (!idCurso) {
            console.log('ID do curso não fornecido');
            return;
        }
        
        try {
            setLoadingDisciplinas(true);
            setCursoSelecionado(nomeCurso);
            setCursoSelecionadoId(idCurso);
            
            const response = await apiClient.get(`/get/disciplinasPorCurso/${idCurso}`);
            console.log('Resposta disciplinas:', response.data);
            
            setDisciplinasCurso(response.data);
            setModalDisciplinasAberto(true);
            
            // Expandir todos os anos inicialmente
            if (response.data && response.data.disciplinas) {
                const anos = Object.keys(response.data.disciplinas);
                const expandidoInicial = {};
                anos.forEach(ano => {
                    expandidoInicial[ano] = true;
                });
                setAnoExpandido(expandidoInicial);
            }
            
        } catch (error) {
            console.error("Erro ao buscar disciplinas do curso:", error);
            showErrorToast("Erro", "Não foi possível carregar as disciplinas do curso");
        } finally {
            setLoadingDisciplinas(false);
        }
    }, [apiClient]);

    const removerDisciplinaDoCurso = useCallback(async (idsemestre, disciplinaNome) => {
        showConfirmToast(
            `Tem certeza que deseja remover a disciplina "${disciplinaNome}" deste curso?`,
            async () => {
                try {
                    setRemovendoDisciplina(idsemestre);
                    showInfoToast("Processando", `Removendo disciplina "${disciplinaNome}"...`);

                    const response = await apiClient.delete(`/delete/disciplinaSemestre/${idsemestre}`);
                    
                    showSuccessToast(
                        "Sucesso",
                        response.data.message || "Disciplina removida do curso com sucesso",
                        { "Disciplina": disciplinaNome }
                    );

                    // Recarregar as disciplinas do curso
                    await fetchDisciplinasPorCurso(cursoSelecionadoId, cursoSelecionado);
                    
                } catch (error) {
                    console.error("Erro ao remover disciplina:", error);
                    showErrorToast("Erro", "Não foi possível remover a disciplina do curso");
                } finally {
                    setRemovendoDisciplina(null);
                }
            },
            null,
            "Confirmar Remoção"
        );
    }, [apiClient, cursoSelecionadoId, cursoSelecionado, fetchDisciplinasPorCurso, showConfirmToast]);

    const deletarAnoCurricular = useCallback(async (idanocurricular, anocurricular) => {
        showConfirmToast(
            `Tem certeza que deseja excluir o ano curricular "${anocurricular}"? Esta ação não pode ser desfeita.`,
            async () => {
                try {
                    showInfoToast("Processando", "Excluindo ano curricular...");
                    
                    await apiClient.delete(`/delete/anocurricular/${idanocurricular}`);
                    showSuccessToast("Sucesso", "Ano curricular excluído");
                    
                    await fetchAnosCurriculares(dadosEdicao.idcurso);
                } catch (error) {
                    console.error("Erro ao excluir ano curricular:", error);
                    showErrorToast("Erro", "Não foi possível excluir o ano curricular");
                }
            },
            null,
            "Confirmar Exclusão"
        );
    }, [apiClient, dadosEdicao.idcurso, fetchAnosCurriculares, showConfirmToast]);

    // ✅ Função para adicionar novo curso
    const adicionarCurso = useCallback(async (e) => {
        e?.preventDefault();
        
        const nome = dadosNovoCurso.curso?.trim();
        const departamentoId = dadosNovoCurso.idcategoriacurso;
        
        if (!nome) {
            showErrorToast("Validação", "Preencha o nome da licenciatura");
            return;
        }
        
        if (!departamentoId) {
            showErrorToast("Validação", "Selecione um departamento");
            return;
        }

        setSalvando(true);
        try {
            const response = await apiClient.post('/post/registrarcurso', {
                curso: nome,
                idcategoriacurso: departamentoId
            });

            const deptSelecionado = departamentos.find(d => d.idcategoriacurso === departamentoId);
            
            showSuccessToast(
                "Sucesso",
                response.data.message || "Licenciatura adicionada com sucesso",
                { 
                    "Nome": nome,
                    "Departamento": deptSelecionado?.categoriacurso
                }
            );
            
            await fetchCursos(false);
            fecharModalAdicionar();
        } catch (error) {
            console.error("Erro ao adicionar licenciatura:", error);
        } finally {
            setSalvando(false);
        }
    }, [dadosNovoCurso, apiClient, fetchCursos, departamentos]);

    // Função para alternar expansão de ano
    const toggleAnoExpandido = useCallback((ano) => {
        setAnoExpandido(prev => ({
            ...prev,
            [ano]: !prev[ano]
        }));
    }, []);

    // Funções para abrir/fechar modal de adicionar
    const abrirModalAdicionar = useCallback(() => {
        setDadosNovoCurso({
            curso: '',
            idcategoriacurso: ''
        });
        setModalAdicionarAberto(true);
    }, []);

    const fecharModalAdicionar = useCallback(() => {
        if (!salvando) {
            setModalAdicionarAberto(false);
            setDadosNovoCurso({
                curso: '',
                idcategoriacurso: ''
            });
        }
    }, [salvando]);

    // Carrega dados na montagem
    useEffect(() => {
        fetchCursos(false);
        fetchDepartamentos();
    }, [fetchCursos, fetchDepartamentos]);

    const abrirModalEditar = useCallback(async (item) => {
        setDadosEdicao({
            idcurso: item.idcurso,
            curso: item.curso || '',
            idcategoriacurso: item.idcategoriacurso || ''
        });
        
        await fetchAnosCurriculares(item.idcurso);
    }, [fetchAnosCurriculares]);

    const fecharModal = useCallback(() => {
        if (!salvando) {
            setDadosEdicao({ idcurso: '', curso: '', idcategoriacurso: '' });
            setAnosCurriculares([]);
        }
    }, [salvando]);

    const toggleModal = useCallback(async (abrir = true, item = null) => {
        if (abrir && item) {
            await abrirModalEditar(item);
        } else {
            fecharModal();
        }
    }, [abrirModalEditar, fecharModal]);

    // ✅ SALVAR COM RECARREGAMENTO AUTOMÁTICO
    const salvarEdicao = useCallback(async (e) => {
        e?.preventDefault();
        
        const nome = dadosEdicao.curso?.trim();
        const departamentoId = dadosEdicao.idcategoriacurso;
        
        if (!nome) {
            showErrorToast("Validação", "Preencha o nome do curso");
            return;
        }
        
        if (!departamentoId) {
            showErrorToast("Validação", "Selecione um departamento");
            return;
        }

        setSalvando(true);
        try {
            const response = await apiClient.put(`/put/curso/${dadosEdicao.idcurso}`, {
                curso: nome,
                idcategoriacurso: departamentoId
            });

            const deptSelecionado = departamentos.find(d => d.idcategoriacurso === departamentoId);
            
            showSuccessToast(
                "Sucesso",
                response.data.message || "Curso atualizado",
                { 
                    "Nome": nome,
                    "Departamento": deptSelecionado?.categoriacurso || 'N/D'
                }
            );
            
            await fetchCursos(false);
            fecharModal();
        } catch (error) {
            console.error("Erro ao editar:", error);
        } finally {
            setSalvando(false);
        }
    }, [dadosEdicao, apiClient, fetchCursos, fecharModal, departamentos]);

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setDadosEdicao(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleNovoCursoInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setDadosNovoCurso(prev => ({ ...prev, [name]: value }));
    }, []);

    // ✅ DELETAR CURSO
    const deletarCurso = useCallback(async (id, nome) => {
        showConfirmToast(
            `Tem certeza que deseja excluir o curso "${nome}"? Esta ação também excluirá todos os anos curriculares associados e não pode ser desfeita.`,
            async () => {
                try {
                    showInfoToast("Processando", "Excluindo curso...");
                    
                    const response = await apiClient.delete(`/delete/curso/${id}`);
                    
                    showSuccessToast(
                        "Sucesso",
                        response.data.message || "Curso excluído com sucesso"
                    );
                    
                    await fetchCursos(false);
                } catch (error) {
                    console.error("Erro ao deletar:", error);
                }
            },
            null,
            "Confirmar Exclusão de Curso"
        );
    }, [apiClient, fetchCursos, showConfirmToast]);

    // States derivados
    const isEmpty = lista.length === 0 && !loading;
    const showModal = dadosEdicao.idcurso !== '';
    const semResultados = !loading && listaFiltrada.length === 0 && termoPesquisa !== '';

    return (
        <div className="row mb-4">
            <div className="col-12">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2 className="h4 mb-0" style={{color:'var(--azul-escuro)'}}>
                        <IoMdSchool className="me-2 mb-2"/>
                        Licenciaturas
                    </h2>
                    <div className="d-flex gap-2">
                        {ultimaAtualizacao && (
                            <small className="text-muted align-self-end small">
                                Atualizado: {ultimaAtualizacao}
                            </small>
                        )}
                        <button 
                            className={`btn btn-sm ${Style.AtulizarDepartamento}`}
                            onClick={() => fetchCursos(true)}
                            disabled={loading || isConfirming}
                            title="Atualizar lista"
                        >
                            <MdRefresh />
                        </button>
                        <button
                            className={`btn btn-sm ${Style.btnSubmit}`}
                            onClick={abrirModalAdicionar}
                            disabled={loading || salvando || isConfirming}
                            title="Adicionar nova licenciatura"
                            >
                            <MdAdd className="me-1" />
                                Nova Licenciatura
                        </button>
                    </div>
                </div>

                {/* BARRA DE PESQUISA E BOTÃO ADICIONAR */}
                <div className="row mb-4">
                    <div className="col-md-8 mx-auto">
                        <div className="card shadow-sm border-0">
                            <div className="card-body p-3">
                                <div className="d-flex align-items-center gap-2">
                                    <div className="position-relative flex-grow-1">
                                        <div className="input-group">
                                            <span className="input-group-text border-end-0" style={{backgroundColor:'var(--cinza-claro)'}}>
                                                <MdSearch className="text-muted" size={20} />
                                            </span>
                                            <input
                                                type="text"
                                                className="form-control border-start-0 ps-0"
                                                placeholder="Pesquisar licenciatura por nome ou departamento..."
                                                value={termoPesquisa}
                                                onChange={handlePesquisa}
                                                disabled={loading}
                                                style={{ 
                                                    borderLeft: 'none',
                                                    boxShadow: 'none',
                                                    backgroundColor: 'var(--cinza-claro)',
                                                    padding:'10px'
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
                                                        color:'var(--branco)'
                                                    }}
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* INDICADOR DE RESULTADOS */}
                                {!loading && termoPesquisa && listaFiltrada.length > 0 && (
                                    <div className="mt-2 text-muted small">
                                        <span className="badge bg-light text-dark p-2">
                                            {listaFiltrada.length} {listaFiltrada.length === 1 ? 'licenciatura encontrada' : 'licenciaturas encontradas'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table table-hover table-striped border">
                        <thead style={{backgroundColor:'var(--azul-escuro)',color:'var(--branco)'}}>
                            <tr>
                                <th className="col-5">Nome da Licenciatura</th>
                                <th className="col-4">Departamento</th>
                                <th className="col-1">Disciplinas</th>
                                <th className="col-1 text-center">Editar</th>
                                <th className="col-1 text-center">Apagar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-5">
                                        <div className="spinner-border text-primary mx-auto mb-2" style={{width: '3rem', height: '3rem'}} role="status">
                                            <span className="visually-hidden">Carregando...</span>
                                        </div>
                                        <p className="text-muted mb-0">Carregando cursos...</p>
                                    </td>
                                </tr>
                            ) : semResultados ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-5">
                                        <MdSearch size={48} className="text-muted mb-3" />
                                        <p className="text-muted mb-2">Nenhuma licenciatura encontrada para "{termoPesquisa}"</p>
                                        <button 
                                            className="btn btn-outline-primary btn-sm"
                                            onClick={limparPesquisa}
                                        >
                                            Limpar pesquisa
                                        </button>
                                    </td>
                                </tr>
                            ) : isEmpty ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-5">
                                        <i className="bi bi-inbox display-4 text-muted mb-3 d-block"></i>
                                        <p className="text-muted mb-3">Nenhuma licenciatura encontrada</p>
                                        <button className="btn btn-outline-primary" onClick={() => fetchCursos(true)}>
                                            <MdRefresh className="me-1" />
                                            Carregar licenciaturas
                                        </button>
                                    </td>
                                </tr>
                            ) : (
                                listaFiltrada.map((item) => (
                                    <tr key={item.idcurso}>
                                        <td className="align-middle fw-semibold" style={{color:'var(--azul-escuro)'}}><IoMdSchool className="me-2 mb-2"/>{item.curso}</td>
                                        <td className="align-middle" style={{color:'var(--azul-escuro)'}}>{item.categoriacurso}</td>
                                        
                                        <td className="text-center">
                                            <button 
                                                className={`btn btn-sm ${Style.btnOutros}`}
                                                onClick={() => fetchDisciplinasPorCurso(item.idcurso, item.curso)}
                                                disabled={loading || loadingDisciplinas || isConfirming}
                                                title={`Ver disciplinas de ${item.curso}`}
                                            >
                                                <FaBook />
                                            </button>
                                        </td> 
                                        <td className="text-center">
                                            <button 
                                                className={`btn btn-sm ${Style.btnEditar}`}
                                                onClick={() => toggleModal(true, item)}
                                                disabled={loading || salvando || isConfirming}
                                                title={`Editar ${item.curso}`}
                                            >
                                                <MdEdit />
                                            </button>
                                        </td>
                                        <td className="text-center">
                                            <button 
                                                className={`btn btn-sm ${Style.btnDeletar}`}
                                                onClick={() => deletarCurso(item.idcurso, item.curso)}
                                                disabled={loading || salvando || isConfirming}
                                                title={`Excluir ${item.curso}`}
                                            >
                                                <MdDeleteForever />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de Adicionar Nova Licenciatura */}
            {modalAdicionarAberto && (
                <div className="modal fade show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,.5)'}}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content shadow-lg border-0">
                            <div className="modal-header" style={{backgroundColor: 'var(--azul-escuro)',color:'var(--dourado)'}}>
                                <h5 className="modal-title mb-0">
                                    <MdAdd className="me-2 mb-1"/>
                                    Adicionar Nova Licenciatura
                                </h5>
                                <button 
                                    type="button" 
                                    className="btn-close btn-close-white"
                                    onClick={fecharModalAdicionar}
                                    disabled={salvando || isConfirming}
                                />
                            </div>
                            <form onSubmit={adicionarCurso}>
                                <div className="modal-body">
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <input 
                                                type="text" 
                                                className="form-control form-control-lg shadow-sm"
                                                id="novoCurso"
                                                name="curso"
                                                value={dadosNovoCurso.curso}
                                                onChange={handleNovoCursoInputChange}
                                                placeholder="Digite o nome da licenciatura"
                                                autoFocus
                                                disabled={salvando || isConfirming}
                                                maxLength={100}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <select 
                                                className="form-select form-control-lg shadow-sm"
                                                id="novoDepartamento"
                                                name="idcategoriacurso"
                                                value={dadosNovoCurso.idcategoriacurso}
                                                onChange={handleNovoCursoInputChange}
                                                disabled={salvando || isConfirming}
                                                required
                                            >
                                                <option value="">Selecione um departamento...</option>
                                                {departamentos.map((dept) => (
                                                    <option key={dept.idcategoriacurso} value={dept.idcategoriacurso}>
                                                        {dept.categoriacurso}
                                                    </option>
                                                ))}
                                            </select>
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
                                        className={`btn ${Style.btnSubmit}`}
                                        disabled={salvando || isConfirming || !dadosNovoCurso.curso.trim() || !dadosNovoCurso.idcategoriacurso}
                                    >
                                        {salvando ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Adicionando...
                                            </>
                                        ) : (
                                            'Adicionar Licenciatura'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Edição */}
            {showModal && (
                <div className="modal fade show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,.5)'}}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content shadow-lg border-0">
                            <div className="modal-header" style={{backgroundColor: 'var(--azul-escuro)',color:'var(--dourado)'}}>
                                <h5 className="modal-title mb-0">
                                    <MdEdit className="me-2 mb-1"/>
                                    Editar a Licenciatura em - {dadosEdicao.curso}
                                </h5>
                                <button 
                                    type="button" 
                                    className="btn-close btn-close-white"
                                    onClick={() => toggleModal(false)}
                                    disabled={salvando || isConfirming}
                                />
                            </div>
                            <form onSubmit={salvarEdicao}>
                                <div className="modal-body">
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <input 
                                                type="text" 
                                                className="form-control form-control-lg shadow-sm"
                                                id="editarCurso"
                                                name="curso"
                                                value={dadosEdicao.curso}
                                                onChange={handleInputChange}
                                                placeholder="Digite o nome do curso"
                                                autoFocus
                                                disabled={salvando || isConfirming}
                                                maxLength={100}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <select 
                                                className="form-select form-control-lg shadow-sm"
                                                id="editarDepartamento"
                                                name="idcategoriacurso"
                                                value={dadosEdicao.idcategoriacurso}
                                                onChange={handleInputChange}
                                                disabled={salvando || isConfirming}
                                                required
                                            >
                                                <option value="">Selecione um departamento...</option>
                                                {departamentos.map((dept) => (
                                                    <option key={dept.idcategoriacurso} value={dept.idcategoriacurso}>
                                                        {dept.categoriacurso}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Seção de Anos Curriculares */}
                                    <div className="border-top pt-3 mt-3">
                                        <h6 className={`mb-3`} style={{color:'var(--azul-escuro)'}}>
                                            <FaCalendarAlt className="me-2 mb-1" />
                                            Anos Curriculares
                                        </h6>

                                        {loadingAnos ? (
                                            <div className="text-center py-3">
                                                <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                                                Carregando anos curriculares...
                                            </div>
                                        ) : !anosCurriculares || anosCurriculares.length === 0 ? (
                                            <div className="alert alert-info text-center py-3">
                                                <i className="bi bi-info-circle me-2"></i>
                                                Nenhum ano curricular cadastrado para este curso
                                            </div>
                                        ) : (
                                            <div>
                                                <div className="d-flex flex-column gap-2">
                                                    {anosCurriculares.map((ano) => (
                                                        <div 
                                                            key={ano.idanocurricular} 
                                                            className="d-flex justify-content-between align-items-center bg-light rounded-3 px-3 py-2 shadow-sm border"
                                                        >
                                                            <div className="d-flex align-items-center">
                                                                <i className="bi bi-calendar-check me-2 text-primary"></i>
                                                                <span className="fw-semibold">
                                                                    {ano.anocurricular}
                                                                </span>
                                                            </div>
                                                            <button 
                                                                type="button"
                                                                className={`btn ${Style.btnDeletar}`}
                                                                onClick={() => deletarAnoCurricular(ano.idanocurricular, ano.anocurricular)}
                                                                disabled={salvando || isConfirming}
                                                                title="Excluir ano curricular"
                                                            >
                                                                <MdDeleteForever/>
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="modal-footer border-0">
                                    <button 
                                        type="button" 
                                        className={`btn ${Style.btnCancelar}`}
                                        onClick={() => toggleModal(false)}
                                        disabled={salvando || isConfirming}
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        type="submit" 
                                        className={`btn ${Style.btnSubmit}`}
                                        disabled={salvando || isConfirming || !dadosEdicao.curso.trim() || !dadosEdicao.idcategoriacurso}
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

            {/* Modal de Disciplinas do Curso */}
            {modalDisciplinasAberto && (
                <div className="modal fade show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,.5)'}}>
                    <div className="modal-dialog modal-dialog-centered modal-xl">
                        <div className="modal-content shadow-lg border-0">
                            <div className="modal-header" style={{backgroundColor: 'var(--azul-escuro)',color:'var(--dourado)'}}>
                                <h5 className="modal-title mb-0">
                                    <i className="bi bi-journal-bookmark me-2"></i>
                                    Disciplinas da Licenciatura - {cursoSelecionado || 'Curso'}
                                </h5>
                                <button 
                                    type="button" 
                                    className="btn-close btn-close-white"
                                    onClick={() => {
                                        setModalDisciplinasAberto(false);
                                        setDisciplinasCurso(null);
                                        setAnoExpandido({});
                                        setCursoSelecionadoId(null);
                                    }}
                                    disabled={loadingDisciplinas || isConfirming}
                                />
                            </div>
                            <div className="modal-body">
                                {loadingDisciplinas ? (
                                    <div className="text-center py-5">
                                        <div className="spinner-border text-info mb-3" style={{width: '3rem', height: '3rem'}} role="status">
                                            <span className="visually-hidden">Carregando...</span>
                                        </div>
                                        <p className="text-muted">Carregando disciplinas...</p>
                                    </div>
                                ) : disciplinasCurso ? (
                                    <div>
                                        {/* Cabeçalho com informações do curso */}
                                        <div className="row mb-4">
                                            <div className="col-md-12">
                                                <div className="card bg-light border-0">
                                                    <div className="card-body" style={{color:'var(--azul-escuro)'}}>
                                                        <h6 className="card-title">
                                                            Informações do Curso
                                                        </h6>
                                                        <ul className="list-unstyled mb-0">
                                                            <li className="mb-1">
                                                                <strong>Licenciatura:</strong> {disciplinasCurso.curso}
                                                            </li>
                                                            <li className="mb-1">
                                                                <strong>Departamento:</strong> {disciplinasCurso.categoria}
                                                            </li>
                                                            <li>
                                                                <strong>Total de Disciplinas:</strong> 
                                                                <span className="badge ms-2" style={{background:'var(--azul-escuro)',color:'var(--dourado)'}}>
                                                                    {disciplinasCurso.totalDisciplinas}
                                                                </span>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Lista de disciplinas por ano e semestre */}
                                        {Object.keys(disciplinasCurso.disciplinas || {}).length === 0 ? (
                                            <div className="alert text-center py-4" style={{backgroundColor:'var(--azul-escuro)',color:'var(--dourado)'}}>
                                                <i className="bi bi-exclamation-triangle display-4 d-block mb-3 text-warning"></i>
                                                <h5 className="alert-heading">Nenhuma disciplina encontrada</h5>
                                                <p>Esta Licenciatura ainda não possui disciplinas cadastradas.</p>
                                            </div>
                                        ) : (
                                            <div className="disciplinas-container" style={{
                                                maxHeight: '60vh',
                                                overflowY: 'auto',
                                                paddingRight: '10px',
                                                backgroundColor:'var(--cinza-claro)',
                                            }}>
                                                {Object.entries(disciplinasCurso.disciplinas || {}).map(([ano, semestres]) => (
                                                    <div key={ano} className="mb-4">
                                                        {/* Cabeçalho do Ano */}
                                                        <div 
                                                            className="card card-header text-white mb-2"
                                                            onClick={() => toggleAnoExpandido(ano)}
                                                            style={{ cursor: 'pointer', backgroundColor:'var(--azul-escuro)'}}
                                                        >
                                                            <div className="d-flex justify-content-between align-items-center">
                                                                <div className="d-flex align-items-center" style={{color:'var(--dourado)'}}>
                                                                    <FaCalendarAlt className="me-2" />
                                                                    <h5 className="mb-0">{ano}</h5>
                                                                </div>
                                                                <div className="d-flex align-items-center">
                                                                    <span className="badge me-3" style={{color:'var(--dourado)',backgroundColor:'var(--cinza-claro)'}}>
                                                                        {Object.keys(semestres).length} semestre(s)
                                                                    </span>
                                                                    {anoExpandido[ano] ? <MdExpandLess size={24} /> : <MdExpandMore size={24} />}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Semestres (expansível) */}
                                                        {anoExpandido[ano] && (
                                                            <div className="row">
                                                                {Object.entries(semestres).map(([semestre, disciplinas]) => (
                                                                    <div key={semestre} className="col-12 col-md-6 mb-3">
                                                                        <div className="card h-100"  style={{border:'1px solid var(--azul-escuro)'}}>
                                                                            <div className="card-header bg-light border-bottom">
                                                                                <div className="d-flex justify-content-between align-items-center">
                                                                                    <h6 className="mb-0" style={{color:'var(--azul-escuro)'}}>
                                                                                        <FaLayerGroup className="me-2 mb-1" />
                                                                                        {semestre}
                                                                                    </h6>
                                                                                    <span className="badge" style={{color:'var(--dourado)',backgroundColor:'var(--azul-metropolitano)'}}>
                                                                                        {disciplinas.length} disciplina(s)
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                            <div className="card-body p-0">
                                                                                <ul className="list-group list-group-flush">
                                                                                    {disciplinas.map((disciplina, index) => (
                                                                                        <li 
                                                                                            key={disciplina.id} 
                                                                                            className="list-group-item border-0 py-2 px-3 d-flex justify-content-between align-items-center"
                                                                                            style={{ 
                                                                                                backgroundColor: index % 2 === 0 ? 'var(--branco)' : 'var(--cinza-claro)' 
                                                                                            }}
                                                                                        >
                                                                                            <div className="d-flex align-items-center">
                                                                                                <i className="bi bi-book me-2 text-muted"></i>
                                                                                                <span>{disciplina.nome}</span>
                                                                                            </div>
                                                                                            <button 
                                                                                                type="button"
                                                                                                className={`btn btn-sm ${Style.btnDeletar}`}
                                                                                                onClick={() => removerDisciplinaDoCurso(disciplina.idsemestre, disciplina.nome)}
                                                                                                disabled={removendoDisciplina === disciplina.idsemestre || isConfirming}
                                                                                                title={`Remover ${disciplina.nome} do curso`}
                                                                                            >
                                                                                                {removendoDisciplina === disciplina.idsemestre ? (
                                                                                                    <span className="spinner-border spinner-border-sm"></span>
                                                                                                ) : (
                                                                                                    <MdRemoveCircleOutline />
                                                                                                )}
                                                                                            </button>
                                                                                        </li>
                                                                                    ))}
                                                                                </ul>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-4" style={{backgroundColor:'var(--danger)',color:'var(--azul-escuro)'}}>
                                        <i className="bi bi-exclamation-octagon display-4 d-block mb-3"></i>
                                        <h5 className="alert-heading">Erro ao carregar dados</h5>
                                        <p>Não foi possível carregar as disciplinas a Licenciatura.</p>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer border-top">
                                <button 
                                    type="button" 
                                    className={`btn ${Style.btnCancelar}`}
                                    onClick={() => {
                                        setModalDisciplinasAberto(false);
                                        setDisciplinasCurso(null);
                                        setAnoExpandido({});
                                        setCursoSelecionadoId(null);
                                    }}
                                    disabled={isConfirming}
                                >
                                    Fechar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CursosEdit;