import { useEffect, useState, useCallback, useMemo } from "react";
import { 
    MdEdit, 
    MdDeleteForever, 
    MdRefresh, 
    MdExpandMore, 
    MdExpandLess,
    MdRemoveCircleOutline,
    MdSearch 
} from "react-icons/md";
import { IoMdSchool } from "react-icons/io";
import { FaBook, FaCalendarAlt, FaLayerGroup } from "react-icons/fa";
import axios from "axios";
import { showSuccessToast, showErrorToast, showInfoToast, useConfirmToast} from "./CustomToast";

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

    // Configuração do axios
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

    // Fetch cursos
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

    // Fetch departamentos
    const fetchDepartamentos = useCallback(async () => {
        try {
            const response = await apiClient.get('/get/categoriaCurso');
            setDepartamentos(response.data || []);
        } catch (error) {
            console.error("Erro ao buscar departamentos:", error);
            showErrorToast("Erro", "Não foi possível carregar departamentos");
        }
    }, [apiClient]);

    // Função de pesquisa
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

    // Limpar pesquisa
    const limparPesquisa = useCallback(() => {
        setTermoPesquisa('');
        setListaFiltrada(lista);
    }, [lista]);

    // Atualiza lista filtrada quando a lista original muda
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

    // ✅ Fetch anos curriculares
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

    // ✅ Fetch disciplinas por curso
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

    // ✅ Função para remover disciplina do curso
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

    // ✅ Deletar ano curricular
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

    // Função para alternar expansão de ano
    const toggleAnoExpandido = useCallback((ano) => {
        setAnoExpandido(prev => ({
            ...prev,
            [ano]: !prev[ano]
        }));
    }, []);

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
                    <h2 className="h4 mb-0 text-primary">
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
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => fetchCursos(true)}
                            disabled={loading || isConfirming}
                            title="Atualizar lista"
                        >
                            <MdRefresh />
                        </button>
                    </div>
                </div>

                {/* BARRA DE PESQUISA */}
                <div className="row mb-4">
                    <div className="col-md-8 mx-auto">
                        <div className="card shadow-sm border-0">
                            <div className="card-body p-3">
                                <div className="d-flex align-items-center gap-2">
                                    <div className="position-relative flex-grow-1">
                                        <div className="input-group">
                                            <span className="input-group-text bg-white border-end-0">
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
                                                    boxShadow: 'none'
                                                }}
                                            />
                                            {termoPesquisa && (
                                                <button 
                                                    className="btn btn-outline-secondary border-start-0" 
                                                    type="button"
                                                    onClick={limparPesquisa}
                                                    disabled={loading}
                                                    style={{ borderLeft: 'none' }}
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
                        <thead className="table-primary">
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
                                        <td className="align-middle fw-semibold"><IoMdSchool className="me-2 mb-2 text-primary"/>{item.curso}</td>
                                        <td className="align-middle">{item.categoriacurso}</td>
                                        
                                        <td className="text-center">
                                            <button 
                                                className="btn btn-sm btn-outline-info"
                                                onClick={() => fetchDisciplinasPorCurso(item.idcurso, item.curso)}
                                                disabled={loading || loadingDisciplinas || isConfirming}
                                                title={`Ver disciplinas de ${item.curso}`}
                                            >
                                                <FaBook />
                                            </button>
                                        </td> 
                                        <td className="text-center">
                                            <button 
                                                className="btn btn-sm btn-outline-primary"
                                                onClick={() => toggleModal(true, item)}
                                                disabled={loading || salvando || isConfirming}
                                                title={`Editar ${item.curso}`}
                                            >
                                                <MdEdit />
                                            </button>
                                        </td>
                                        <td className="text-center">
                                            <button 
                                                className="btn btn-sm btn-outline-danger"
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

            {/* Modal de Edição */}
            {showModal && (
                <div className="modal fade show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,.5)'}}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content shadow-lg border-0">
                            <div className="modal-header bg-gradient bg-primary text-white">
                                <h5 className="modal-title mb-0">
                                    <i className="bi bi-pencil-square me-2"></i>
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
                                                                className="btn btn-sm btn-outline-danger"
                                                                onClick={() => deletarAnoCurricular(ano.idanocurricular, ano.anocurricular)}
                                                                disabled={salvando || isConfirming}
                                                                title="Excluir ano curricular"
                                                            >
                                                                X
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
                                        className="btn btn-outline-secondary"
                                        onClick={() => toggleModal(false)}
                                        disabled={salvando || isConfirming}
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="btn btn-primary px-4"
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
                            <div className="modal-header bg-gradient bg-info text-white">
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
                                                    <div className="card-body">
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
                                                                <span className="badge bg-primary ms-2">
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
                                            <div className="alert alert-warning text-center py-4">
                                                <i className="bi bi-exclamation-triangle display-4 d-block mb-3 text-warning"></i>
                                                <h5 className="alert-heading">Nenhuma disciplina encontrada</h5>
                                                <p>Este Licenciatura ainda não possui disciplinas cadastradas.</p>
                                            </div>
                                        ) : (
                                            <div className="disciplinas-container" style={{
                                                maxHeight: '60vh',
                                                overflowY: 'auto',
                                                paddingRight: '10px'
                                            }}>
                                                {Object.entries(disciplinasCurso.disciplinas || {}).map(([ano, semestres]) => (
                                                    <div key={ano} className="mb-4">
                                                        {/* Cabeçalho do Ano */}
                                                        <div 
                                                            className="card card-header bg-primary text-white mb-2"
                                                            onClick={() => toggleAnoExpandido(ano)}
                                                            style={{ cursor: 'pointer' }}
                                                        >
                                                            <div className="d-flex justify-content-between align-items-center">
                                                                <div className="d-flex align-items-center">
                                                                    <FaCalendarAlt className="me-2" />
                                                                    <h5 className="mb-0">{ano}</h5>
                                                                </div>
                                                                <div className="d-flex align-items-center">
                                                                    <span className="badge bg-light text-primary me-3">
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
                                                                        <div className="card h-100 border border-primary">
                                                                            <div className="card-header bg-light border-bottom">
                                                                                <div className="d-flex justify-content-between align-items-center">
                                                                                    <h6 className="mb-0 text-primary">
                                                                                        <FaLayerGroup className="me-2" />
                                                                                        {semestre}
                                                                                    </h6>
                                                                                    <span className="badge bg-primary">
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
                                                                                                backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' 
                                                                                            }}
                                                                                        >
                                                                                            <div className="d-flex align-items-center">
                                                                                                <i className="bi bi-book me-2 text-muted"></i>
                                                                                                <span>{disciplina.nome}</span>
                                                                                            </div>
                                                                                            <button 
                                                                                                type="button"
                                                                                                className="btn btn-sm btn-outline-danger"
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
                                    <div className="alert alert-danger text-center py-4">
                                        <i className="bi bi-exclamation-octagon display-4 d-block mb-3"></i>
                                        <h5 className="alert-heading">Erro ao carregar dados</h5>
                                        <p>Não foi possível carregar as disciplinas a Licenciatura.</p>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer border-top">
                                <button 
                                    type="button" 
                                    className="btn btn-secondary"
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