import { useEffect, useState, useCallback, useMemo } from "react";
import { MdEdit, MdDeleteForever, MdRefresh, MdSearch, MdAdd } from "react-icons/md";
import { IoMdBusiness } from "react-icons/io";
import axios from "axios";
import { showSuccessToast, showErrorToast, showInfoToast, useConfirmToast } from "./CustomToast";
import Style from "./DepartamentosEdit.module.css"

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";
const API_TIMEOUT = 5000;

function Departamento() {
    const [lista, setLista] = useState([]);
    const [listaFiltrada, setListaFiltrada] = useState([]);
    const [termoPesquisa, setTermoPesquisa] = useState('');
    const [loading, setLoading] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [dadosEdicao, setDadosEdicao] = useState({
        idcategoriacurso: '',
        categoriacurso: ''
    });
    const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null);
    const [modalAdicionarAberto, setModalAdicionarAberto] = useState(false);
    const [novoDepartamento, setNovoDepartamento] = useState('');
    const [user, setUser] = useState()
    
    const { showConfirmToast, isConfirming } = useConfirmToast();

    useEffect(() => {
        const usuarioSalvo = localStorage.getItem("usuarioLogado");
        if (usuarioSalvo) {
            setUser(JSON.parse(usuarioSalvo));
        }
    }, []);

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
                // Mostra mensagem de erro do backend se disponível
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

    // Fetch data SEM polling automático
    const fetchData = useCallback(async (mostrarNotificacao = false) => {
        try {
            setLoading(true);
            const response = await apiClient.get('/get/categoriaCurso');
            setLista(response.data || []);
            setListaFiltrada(response.data || []);
            setUltimaAtualizacao(new Date().toLocaleTimeString('pt-BR'));
            
            // Só mostra notificação se explicitamente solicitado (botão de atualizar)
            if (mostrarNotificacao && response.data && response.data.length > 0) {
                showSuccessToast(
                    "Sucesso",
                    "Dados atualizados com sucesso",
                    { "Quantidade": `${response.data.length} departamento(s)` }
                );
            }
        } catch (error) {
            console.error("Erro ao buscar dados:", error);
            // A mensagem de erro já foi tratada no interceptor
        } finally {
            setLoading(false);
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
                item.categoriacurso.toLowerCase().includes(termo.toLowerCase()) ||
                (item.idcategoriacurso && item.idcategoriacurso.toString().includes(termo))
            );
            setListaFiltrada(filtrados);
        }
    }, [lista]);

    // Limpar pesquisa
    const limparPesquisa = useCallback(() => {
        setTermoPesquisa('');
        setListaFiltrada(lista);
    }, [lista]);

    // Carrega apenas uma vez na montagem do componente SEM notificação
    useEffect(() => {
        fetchData(false); // false = não mostrar notificação
    }, [fetchData]);

    // Atualiza lista filtrada quando a lista original muda
    useEffect(() => {
        if (termoPesquisa.trim() === '') {
            setListaFiltrada(lista);
        } else {
            const filtrados = lista.filter(item => 
                item.categoriacurso.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
                (item.idcategoriacurso && item.idcategoriacurso.toString().includes(termoPesquisa))
            );
            setListaFiltrada(filtrados);
        }
    }, [lista, termoPesquisa]);

    const adicionarItemLocal = useCallback((novoItem) => {
        setLista(prev => [...prev, novoItem]);
    }, []);

    const atualizarItemLocal = useCallback((id, novoNome) => {
        setLista(prev => {
            const updatedList = prev.map(item => 
                item.idcategoriacurso === id 
                    ? { ...item, categoriacurso: novoNome }
                    : item
            );
            return updatedList;
        });
    }, []);

    const removerItemLocal = useCallback((id) => {
        setLista(prev => {
            const updatedList = prev.filter(item => item.idcategoriacurso !== id);
            return updatedList;
        });
    }, []);

    const abrirModalEditar = useCallback((item) => {
        setDadosEdicao({
            idcategoriacurso: item.idcategoriacurso,
            categoriacurso: item.categoriacurso || ''
        });
    }, []);

    const fecharModal = useCallback(() => {
        if (!salvando) {
            setDadosEdicao({ idcategoriacurso: '', categoriacurso: '' });
        }
    }, [salvando]);

    const toggleModal = useCallback((abrir = true, item = null) => {
        if (abrir && item) {
            abrirModalEditar(item);
        } else {
            fecharModal();
        }
    }, [abrirModalEditar, fecharModal]);

    const abrirModalAdicionar = useCallback(() => {
        setModalAdicionarAberto(true);
        setNovoDepartamento('');
    }, []);

    const fecharModalAdicionar = useCallback(() => {
        if (!salvando) {
            setModalAdicionarAberto(false);
            setNovoDepartamento('');
        }
    }, [salvando]);

    const salvarEdicao = useCallback(async (e) => {
        e?.preventDefault();
        
        // Validação mínima no front (só para não enviar vazio)
        const nome = dadosEdicao.categoriacurso?.trim();
        if (!nome) {
            showErrorToast("Validação", "Preencha o nome do departamento");
            return;
        }

        setSalvando(true);
        try {
            const response = await apiClient.put(`/put/categoriaCurso/${dadosEdicao.idcategoriacurso}`, {
                categoriacurso: nome
            });

            // Usa a mensagem do backend
            showSuccessToast(
                "Sucesso",
                response.data.message || "Departamento atualizado",
                { "Novo nome": response.data.categoriacurso }
            );
            
            atualizarItemLocal(dadosEdicao.idcategoriacurso, nome);
            fecharModal();
        } catch (error) {
            // A mensagem de erro já foi tratada no interceptor
            console.error("Erro ao editar:", error);
        } finally {
            setSalvando(false);
        }
    }, [dadosEdicao, apiClient, atualizarItemLocal, fecharModal]);

    const salvarNovoDepartamento = useCallback(async (e) => {
        e?.preventDefault();
        
        const nome = novoDepartamento?.trim();
        if (!nome) {
            showErrorToast("Validação", "Preencha o nome do departamento");
            return;
        }

        setSalvando(true);
        try {
            const response = await apiClient.post('/post/registrercategoria', {
                categoriacurso: nome,
                idAdm: user.id
            });

            showSuccessToast(
                "Sucesso",
                response.data.message || "Departamento adicionado com sucesso",
                { "Nome": response.data.categoriacurso || nome }
            );

            if (response.data.departamento) {
                adicionarItemLocal(response.data.departamento);
            } else {
                
                fetchData(false);
            }
            
            fecharModalAdicionar();
        } catch (error) {
            
            console.error("Erro ao adicionar:", error);
        } finally {
            setSalvando(false);
        }
    }, [novoDepartamento, apiClient, adicionarItemLocal, fetchData, fecharModalAdicionar]);

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setDadosEdicao(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleNovoDepartamentoChange = useCallback((e) => {
        setNovoDepartamento(e.target.value);
    }, []);

    const deletarDepartamento = useCallback(async (id, nome) => {
        showConfirmToast(
            `Tem certeza que deseja excluir o departamento "${nome}"? Esta ação não pode ser desfeita.`,
            async () => {
                try {
                    showInfoToast("Processando", "Excluindo departamento...");
                    
                    const response = await apiClient.delete(`/delete/categoriaCurso/${id}`);
                    
                    
                    showSuccessToast(
                        "Sucesso",
                        response.data.message || "Departamento excluído",
                    );
                    
                    removerItemLocal(id);
                } catch (error) {
                    
                    console.error("Erro ao deletar:", error);
                }
            },
            null,
            "Confirmar Exclusão"
        );
    }, [apiClient, removerItemLocal, showConfirmToast]);

    // States derivados
    const isEmpty = lista.length === 0 && !loading;
    const showModal = dadosEdicao.idcategoriacurso !== '';
    const semResultados = !loading && listaFiltrada.length === 0 && termoPesquisa !== '';

    return ( 
        <div className="row mb-4">
            <div className="col-12">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2 className="h4 mb-0" style={{color:'var(--azul-escuro)'}}>
                        <IoMdBusiness className="me-2 mb-2" />
                        Departamentos
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
                            title="Adicionar novo departamento"
                        >
                            <MdAdd className="me-1" />
                            Novo
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
                                                placeholder="Pesquisar departamento por nome ou código..."
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
                                                    className="btn btn-outline-secondary border-start-0" 
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
                                            {listaFiltrada.length} {listaFiltrada.length === 1 ? 'departamento encontrado' : 'departamentos encontrados'}
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
                                <th className="col-7">Nome</th>
                                <th className="col-2 text-center">Editar</th>
                                <th className="col-2 text-center">Apagar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-5">
                                        <div className="spinner-border text-primary mx-auto mb-2" style={{width: '3rem', height: '3rem'}} role="status">
                                            <span className="visually-hidden">Carregando...</span>
                                        </div>
                                        <p className="text-muted mb-0">Carregando departamentos...</p>
                                    </td>
                                </tr>
                            ) : semResultados ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-5">
                                        <MdSearch size={48} className="text-muted mb-3" />
                                        <p className="text-muted mb-2">Nenhum departamento encontrado para "{termoPesquisa}"</p>
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
                                    <td colSpan="4" className="text-center py-5">
                                        <i className="bi bi-inbox display-4 text-muted mb-3 d-block"></i>
                                        <p className="text-muted mb-3">Nenhum departamento encontrado</p>
                                        <button className="btn btn-outline-primary me-2" onClick={() => fetchData(true)}>
                                            <MdRefresh className="me-1" />
                                            Carregar departamentos
                                        </button>
                                        <button className="btn btn-success" onClick={abrirModalAdicionar}>
                                            <MdAdd className="me-1" />
                                            Adicionar
                                        </button>
                                    </td>
                                </tr>
                            ) : (
                                listaFiltrada.map((item) => (
                                    <tr key={item.idcategoriacurso}>
                                        <td className="align-middle fw-semibold" style={{color:'var(--azul-escuro)'}}><IoMdBusiness className="me-2 mb-2" />{item.categoriacurso}</td>
                                        <td className="text-center">
                                            <button 
                                                className={`btn btn-sm ${Style.btnEditar}`}
                                                onClick={() => toggleModal(true, item)}
                                                disabled={loading || salvando || isConfirming}
                                                title={`Editar ${item.categoriacurso}`}
                                            >
                                                <MdEdit />
                                            </button>
                                        </td>
                                        <td className="text-center">
                                            <button 
                                                className={`btn btn-sm ${Style.btnDeletar}`}
                                                onClick={() => deletarDepartamento(item.idcategoriacurso, item.categoriacurso)}
                                                disabled={loading || salvando || isConfirming}
                                                title={`Excluir ${item.categoriacurso}`}
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
            {showModal && (
                <div className="modal fade show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,.5)'}}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content shadow-lg border-0">
                            <div className="modal-header" style={{backgroundColor: 'var(--azul-escuro)',color:'var(--dourado)'}}>
                                <h5 className="modal-title mb-0">
                                    <MdEdit className="me-2 mb-1"/>
                                    Editar Departamento
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
                                    <div className="mb-3">
                                        <input 
                                            type="text" 
                                            className="form-control form-control-lg shadow-sm"
                                            name="categoriacurso"
                                            value={dadosEdicao.categoriacurso}
                                            onChange={handleInputChange}
                                            placeholder="Digite o novo nome"
                                            autoFocus
                                            disabled={salvando || isConfirming}
                                            maxLength={100}
                                            required
                                        />
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
                                        className={`btn px-4 ${Style.btnSubmit}`}
                                        disabled={salvando || isConfirming || !dadosEdicao.categoriacurso.trim()}
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
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content shadow-lg border-0">
                            <div className="modal-header" style={{backgroundColor: 'var(--azul-escuro)',color:'var(--dourado)'}}>
                                <h5 className="modal-title mb-0">
                                    <MdAdd className="me-2" />
                                    Adicionar Novo Departamento
                                </h5>
                                <button 
                                    type="button" 
                                    className="btn-close btn-close-white"
                                    onClick={fecharModalAdicionar}
                                    disabled={salvando || isConfirming}
                                />
                            </div>
                            <form onSubmit={salvarNovoDepartamento}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <input 
                                            type="text" 
                                            className="form-control form-control-lg shadow-sm"
                                            value={novoDepartamento}
                                            onChange={handleNovoDepartamentoChange}
                                            placeholder="Digite o nome do departamento"
                                            autoFocus
                                            disabled={salvando || isConfirming}
                                            maxLength={100}
                                            required
                                        />
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
                                        disabled={salvando || isConfirming || !novoDepartamento.trim()}
                                        
                                    >
                                        {salvando ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Adicionando...
                                            </>
                                        ) : (
                                            'Adicionar Departamento'
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

export default Departamento;