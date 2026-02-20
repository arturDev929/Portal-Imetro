import { useEffect, useState, useCallback, useMemo } from "react";
import { MdEdit, MdDeleteForever, MdRefresh, MdSearch, MdAdd } from "react-icons/md";
import { MdFlightClass } from "react-icons/md";
import axios from "axios";
import { showSuccessToast, showErrorToast, showInfoToast, useConfirmToast } from "./CustomToast";
import CategoriaCursoAno from "./CategoriaCursoAno"; // Import do componente
import Style from "./DepartamentosEdit.module.css"

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";
const API_TIMEOUT = 5000;

function TurmasAdm() {
    const [lista, setLista] = useState([]);
    const [listaFiltrada, setListaFiltrada] = useState([]);
    const [termoPesquisa, setTermoPesquisa] = useState('');
    const [loading, setLoading] = useState(false);
    const [salvando, setSalvando] = useState(false);
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
    const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null);
    const [modalAdicionarAberto, setModalAdicionarAberto] = useState(false);
    const [modalEditarAberto, setModalEditarAberto] = useState(false);
    
    // Estado para os dados do CategoriaCursoAno
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

    const fetchData = useCallback(async (mostrarNotificacao = false) => {
        try {
            setLoading(true);
            const response = await apiClient.get('/get/turmas');
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

    // const adicionarItemLocal = useCallback((novoItem) => {
    //     setLista(prev => [...prev, novoItem]);
    // }, []);

    // const atualizarItemLocal = useCallback((id, dadosAtualizados) => {
    //     setLista(prev => {
    //         const updatedList = prev.map(item => 
    //             item.idperiodo === id 
    //                 ? { ...item, ...dadosAtualizados }
    //                 : item
    //         );
    //         return updatedList;
    //     });
    // }, []);

    const removerItemLocal = useCallback((id) => {
        setLista(prev => {
            const updatedList = prev.filter(item => item.idperiodo !== id);
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
        console.log("Item para edição:", item);
        
        setDadosEdicao({
            idperiodo: item.idperiodo,
            turma: item.turma || '',
            periodo: item.periodo || '',
            anoletivo: item.anoletivo || '',
            idcurso: item.idcurso || '',
            idanocurricular: item.idanocurricular || '',
            idcategoriacurso: item.idcategoriacurso || '',
            // Campos para exibição
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
        const response = await apiClient.put(`http://localhost:8080/put/turma/${dadosEdicao.idperiodo}`, {
            turma: dadosEdicao.turma,
            periodo: dadosEdicao.periodo,
            anoletivo: dadosEdicao.anoletivo,
            idcurso: dadosEdicao.idcurso,
            idanocurricular: dadosEdicao.idanocurricular,
            idcategoriacurso: dadosEdicao.idcategoriacurso
        });

        console.log("Resposta:", response.data);

        showSuccessToast(
            "Sucesso",
            response.data.mensagem || "Turma atualizada com sucesso"
        );
        
        // Buscar dados atualizados
        await fetchData(false);
        fecharModalEditar();
    } catch (error) {
        console.error("Erro ao editar:", error);
        
        // Mostrar mensagem de erro específica do backend
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
            const response = await apiClient.post('http://localhost:8080/post/registrarPeriodo', {
                turma: novaTurma.turma,
                periodo: novaTurma.periodo,
                anoletivo: novaTurma.anoletivo,
                idcurso: categoriaCursoAnoData.idcurso,
                idanocurricular: categoriaCursoAnoData.idanocurricular,
                idcategoriacurso: categoriaCursoAnoData.idcategoriacurso,
                idAdm: user.id
            });

            showSuccessToast(
                "Sucesso",
                response.data.message || "Turma adicionada com sucesso"
            );

            await fetchData(false);
            fecharModalAdicionar();
        } catch (error) {
            
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
                    
                    const response = await apiClient.delete(`http://localhost:8080/delete/turma/${id}`);
                    
                    showSuccessToast(
                        "Sucesso",
                        response.data?.message || "Turma excluída com sucesso"
                    );
                    
                    removerItemLocal(id);
                } catch (error) {
                    console.error("Erro detalhado ao deletar:", {
                        mensagem: error.message,
                        resposta: error.response?.data,
                        status: error.response?.status,
                        config: error.config
                    });
                    
                    if (error.response?.status === 404) {
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

    return ( 
        <div className="row mb-4">
            <div className="col-12">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2 className="h4 mb-0" style={{color:'var(--azul-escuro)'}}>
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

                {/* BARRA DE PESQUISA */}
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
                                                placeholder="Pesquisar turma por nome, período, ano letivo, curso..."
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

                <div className="table-responsive">
                    <table className="table table-hover table-striped border">
                        <thead style={{backgroundColor:'var(--azul-escuro)',color:'var(--branco)'}}>
                            <tr>
                                <th className="col-2">Categoria</th>
                                <th className="col-2">Curso</th>
                                <th className="col-1 text-center">Ano</th>
                                <th className="col-1 text-center">Turma</th>
                                <th className="col-1 text-center">Período</th>
                                <th className="col-2 text-center">Ano Letivo</th>
                                <th className="col-1 text-center">Editar</th>
                                <th className="col-1 text-center">Excluir</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-5">
                                        <div className="spinner-border text-primary mx-auto mb-2" style={{width: '3rem', height: '3rem'}} role="status">
                                            <span className="visually-hidden">Carregando...</span>
                                        </div>
                                        <p className="text-muted mb-0">Carregando turmas...</p>
                                    </td>
                                </tr>
                            ) : semResultados ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-5">
                                        <MdSearch size={48} className="text-muted mb-3" />
                                        <p className="text-muted mb-2">Nenhuma turma encontrada para "{termoPesquisa}"</p>
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
                                    <td colSpan="8" className="text-center py-5">
                                        <i className="bi bi-inbox display-4 text-muted mb-3 d-block"></i>
                                        <p className="text-muted mb-3">Nenhuma turma encontrada</p>
                                        <button className="btn btn-outline-primary me-2" onClick={() => fetchData(true)}>
                                            <MdRefresh className="me-1" />
                                            Carregar turmas
                                        </button>
                                        <button className={`btn btn-sm ${Style.btnSubmit}`} onClick={abrirModalAdicionar}>
                                            <MdAdd className="me-1" />
                                            Adicionar
                                        </button>
                                    </td>
                                </tr>
                            ) : (
                                listaFiltrada.map((item) => (
                                    <tr key={item.idperiodo}>
                                        <td className="align-middle">{item.categoriacurso}</td>
                                        <td className="align-middle">{item.curso}</td>
                                        <td className="text-center align-middle">{item.anocurricular}º</td>
                                        <td className="text-center align-middle fw-semibold">{item.turma}</td>
                                        <td className="text-center align-middle">{item.periodo}</td>
                                        <td className="text-center align-middle">{item.anoletivo}</td>
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
                                                onClick={() => deletarTurma(item.idperiodo, item.turma)}
                                                disabled={loading || salvando || isConfirming}
                                                title={`Excluir ${item.turma}`}
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

            {/* MODAL DE EDIÇÃO */}
            {modalEditarAberto && (
                <div className="modal fade show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,.5)'}}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content shadow-lg border-0">
                            <div className="modal-header" style={{backgroundColor: 'var(--azul-escuro)',color:'var(--dourado)'}}>
                                <h5 className="modal-title mb-0">
                                    <MdEdit className="me-2 mb-1"/>
                                    Editar Turma: {dadosEdicao.turma}
                                </h5>
                                <button 
                                    type="button" 
                                    className="btn-close btn-close-white"
                                    onClick={fecharModalEditar}
                                    disabled={salvando || isConfirming}
                                />
                            </div>
                            
                            {/* Informações da turma sendo editada */}
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
                                    {/* Componente CategoriaCursoAno para edição */}
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
                                                required
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

            {/* MODAL DE ADICIONAR */}
            {modalAdicionarAberto && (
                <div className="modal fade show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,.5)'}}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content shadow-lg border-0">
                            <div className="modal-header" style={{backgroundColor: 'var(--azul-escuro)',color:'var(--dourado)'}}>
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
                                                placeholder="LCC1M,LCC2M,LCC3M..."
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