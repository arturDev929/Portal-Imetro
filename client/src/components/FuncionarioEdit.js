import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { 
    MdEdit, 
    MdDeleteForever, 
    MdRefresh, 
    MdSearch,
    MdAdd,
    MdPerson,
    MdPhone,
    MdLock
} from "react-icons/md";
import { FaIdCard, FaUserTie } from "react-icons/fa";
import { IoMdPersonAdd } from "react-icons/io";
import { showSuccessToast, showErrorToast, useConfirmToast } from "./CustomToast";
import Style from "./DepartamentosEdit.module.css";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";
const API_TIMEOUT = 30000;

function FuncionarioEdit() {
    const [lista, setLista] = useState([]);
    const [listaFiltrada, setListaFiltrada] = useState([]);
    const [termoPesquisa, setTermoPesquisa] = useState('');
    const [loading, setLoading] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null);
    const [modalAdicionarAberto, setModalAdicionarAberto] = useState(false);
    const [modalEditarAberto, setModalEditarAberto] = useState(false);
    const [modalSenhaAberto, setModalSenhaAberto] = useState(false);
    const [cargos, setCargos] = useState([]);
    
    const [dadosNovoFuncionario, setDadosNovoFuncionario] = useState({
        nome_funcionario: "",
        contacto_funcionario: "",
        bi_funcionario: "",
        cargo_funcionario: "",
        idAdm: ""
    });
    
    const [dadosEdicao, setDadosEdicao] = useState({
        id_funcionario: '',
        nome_funcionario: '',
        contacto_funcionario: '',
        bi_funcionario: '',
        cargo_funcionario: '',
        idAdm: ''
    });

    const [dadosSenha, setDadosSenha] = useState({
        id_funcionario: '',
        nome_funcionario: '',
        nova_senha: '',
        confirmar_senha: ''
    });

    const [user, setUser] = useState(null);
    const { showConfirmToast, isConfirming } = useConfirmToast();

    useEffect(() => {
        const usuarioSalvo = localStorage.getItem("usuarioLogado");
        if (usuarioSalvo) {
            setUser(JSON.parse(usuarioSalvo));
        }
    }, []);

    useEffect(() => {
        axios.get(`${API_BASE_URL}/get/cargosDisponiveis`)
            .then(response => {
                setCargos(response.data || []);
            })
            .catch(error => {
                console.error("Erro ao buscar cargos:", error);
            });
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

    const fetchFuncionarios = useCallback(async (mostrarNotificacao = false) => {
        try {
            setLoading(true);
            const response = await apiClient.get('/get/funcionarios');
            setLista(response.data || []);
            setListaFiltrada(response.data || []);
            setUltimaAtualizacao(new Date().toLocaleTimeString('pt-BR'));
            
            if (mostrarNotificacao && response.data && response.data.length > 0) {
                showSuccessToast(
                    "Sucesso",
                    "Dados atualizados com sucesso",
                    { "Quantidade": `${response.data.length} funcionário(s)` }
                );
            }
        } catch (error) {
            console.error("Erro ao buscar funcionários:", error);
        } finally {
            setLoading(false);
        }
    }, [apiClient]);

    const handlePesquisa = useCallback((e) => {
        const termo = e.target.value;
        setTermoPesquisa(termo);
    }, []);

    const limparPesquisa = useCallback(() => {
        setTermoPesquisa('');
        setListaFiltrada(lista);
    }, [lista]);

    useEffect(() => {
        if (termoPesquisa.trim() === '') {
            setListaFiltrada(lista);
        } else {
            const filtrados = lista.filter(item => 
                item.nome_funcionario?.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
                (item.bi_funcionario && item.bi_funcionario.toLowerCase().includes(termoPesquisa.toLowerCase())) ||
                (item.contacto_funcionario && item.contacto_funcionario.includes(termoPesquisa))
            );
            setListaFiltrada(filtrados);
        }
    }, [lista, termoPesquisa]);

    const abrirModalAdicionar = useCallback(() => {
        setDadosNovoFuncionario({
            nome_funcionario: "",
            contacto_funcionario: "",
            bi_funcionario: "",
            cargo_funcionario: "",
            idAdm: user?.id || ""
        });
        setModalAdicionarAberto(true);
    }, [user]);

    const fecharModalAdicionar = useCallback(() => {
        if (!salvando) {
            setModalAdicionarAberto(false);
            setDadosNovoFuncionario({
                nome_funcionario: "",
                contacto_funcionario: "",
                bi_funcionario: "",
                cargo_funcionario: "",
                idAdm: ""
            });
        }
    }, [salvando]);

    const handleNovoFuncionarioInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setDadosNovoFuncionario((prev) => ({
            ...prev,
            [name]: value
        }));
    }, []);

    const adicionarFuncionario = useCallback(async (e) => {
        e?.preventDefault();
        
        if (!user?.id) {
            showErrorToast("Acesso Negado", "Administrador não autenticado!");
            return;
        }

        if (!dadosNovoFuncionario.nome_funcionario?.trim()) {
            showErrorToast("Validação", "Preencha o nome do funcionário");
            return;
        }

        if (!dadosNovoFuncionario.contacto_funcionario?.trim()) {
            showErrorToast("Validação", "Preencha o contacto do funcionário");
            return;
        }

        if (!dadosNovoFuncionario.bi_funcionario?.trim()) {
            showErrorToast("Validação", "Preencha o BI do funcionário");
            return;
        }

        if (!dadosNovoFuncionario.cargo_funcionario?.trim()) {
            showErrorToast("Validação", "Selecione o cargo do funcionário");
            return;
        }

        setSalvando(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/post/registrarfuncionario`, {
                ...dadosNovoFuncionario,
                idAdm: user.id
            });

            if (response.data.sucesso) {
                showSuccessToast(
                    "Funcionário Registrado com Sucesso!",
                    response.data.mensagem,
                    {
                        "Nome": response.data.dados?.nome,
                        "Cargo": response.data.dados?.cargo,
                        "Senha": response.data.dados?.senha_original
                    }
                );
                
                await fetchFuncionarios(false);
                fecharModalAdicionar();
            } else {
                showErrorToast("Erro", response.data.mensagem || "Erro ao registrar funcionário");
            }
        } catch (error) {
            console.error("Erro ao adicionar funcionário:", error);
            showErrorToast("Erro", error.response?.data?.mensagem || "Não foi possível registrar o funcionário");
        } finally {
            setSalvando(false);
        }
    }, [dadosNovoFuncionario, user, fetchFuncionarios, fecharModalAdicionar]);

    const abrirModalEditar = useCallback(async (funcionario) => {
        try {
            setDadosEdicao({
                id_funcionario: funcionario.id_funcionario,
                nome_funcionario: funcionario.nome_funcionario || '',
                contacto_funcionario: funcionario.contacto_funcionario || '',
                bi_funcionario: funcionario.bi_funcionario || '',
                cargo_funcionario: funcionario.cargo || '',
                idAdm: funcionario.idAdm || ''
            });
            setModalEditarAberto(true);
        } catch (error) {
            console.error("Erro ao preparar edição:", error);
            showErrorToast("Erro", "Não foi possível carregar os dados para edição");
        }
    }, []);

    const abrirModalSenha = useCallback((funcionario) => {
        setDadosSenha({
            id_funcionario: funcionario.id_funcionario,
            nome_funcionario: funcionario.nome_funcionario,
            nova_senha: '',
            confirmar_senha: ''
        });
        setModalSenhaAberto(true);
    }, []);

    const fecharModalSenha = useCallback(() => {
        setModalSenhaAberto(false);
        setDadosSenha({
            id_funcionario: '',
            nome_funcionario: '',
            nova_senha: '',
            confirmar_senha: ''
        });
    }, []);

    const handleSenhaChange = useCallback((e) => {
        const { name, value } = e.target;
        setDadosSenha(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setDadosEdicao(prev => ({ ...prev, [name]: value }));
    }, []);

    const salvarEdicao = useCallback(async (e) => {
        e?.preventDefault();
        
        if (!dadosEdicao.nome_funcionario?.trim()) {
            showErrorToast("Validação", "Preencha o nome do funcionário");
            return;
        }

        if (!dadosEdicao.cargo_funcionario?.trim()) {
            showErrorToast("Validação", "Selecione o cargo do funcionário");
            return;
        }

        setSalvando(true);
        try {
            const response = await apiClient.put(`/put/funcionario/${dadosEdicao.id_funcionario}`, {
                nome_funcionario: dadosEdicao.nome_funcionario,
                contacto_funcionario: dadosEdicao.contacto_funcionario,
                bi_funcionario: dadosEdicao.bi_funcionario,
                cargo_funcionario: dadosEdicao.cargo_funcionario,
                idAdm: dadosEdicao.idAdm
            });

            if (response.data.success) {
                showSuccessToast(
                    "Sucesso",
                    response.data.message,
                    { "Funcionário": dadosEdicao.nome_funcionario }
                );
                
                await fetchFuncionarios(false);
                fecharModalEditar();
            } else {
                showErrorToast("Erro", response.data.error || "Erro ao atualizar funcionário");
            }
        } catch (error) {
            console.error("Erro ao atualizar funcionário:", error);
            showErrorToast("Erro", error.response?.data?.error || "Não foi possível atualizar o funcionário");
        } finally {
            setSalvando(false);
        }
    }, [dadosEdicao, apiClient, fetchFuncionarios]);

    const salvarNovaSenha = useCallback(async (e) => {
        e?.preventDefault();
        
        if (!dadosSenha.nova_senha?.trim()) {
            showErrorToast("Validação", "Preencha a nova senha");
            return;
        }

        if (dadosSenha.nova_senha !== dadosSenha.confirmar_senha) {
            showErrorToast("Validação", "As senhas não coincidem");
            return;
        }

        if (dadosSenha.nova_senha.length < 4) {
            showErrorToast("Validação", "A senha deve ter pelo menos 4 caracteres");
            return;
        }

        setSalvando(true);
        try {
            const response = await apiClient.put(`/put/funcionario/senha/${dadosSenha.id_funcionario}`, {
                senha_funcionario: dadosSenha.nova_senha
            });

            if (response.data.success) {
                showSuccessToast(
                    "Sucesso",
                    response.data.message,
                    { "Funcionário": dadosSenha.nome_funcionario }
                );
                
                fecharModalSenha();
            } else {
                showErrorToast("Erro", response.data.error || "Erro ao alterar senha");
            }
        } catch (error) {
            console.error("Erro ao alterar senha:", error);
            showErrorToast("Erro", error.response?.data?.error || "Não foi possível alterar a senha");
        } finally {
            setSalvando(false);
        }
    }, [dadosSenha, apiClient, fecharModalSenha]);

    const desativarFuncionario = (id, nome) => {
        showConfirmToast(
            `Tens a certeza que pretendes desativar o funcionário ${nome}?`,
            async () => {
                try {
                    const response = await axios.put(`http://localhost:8080/put/funcionario/desativar/${id}`);
                    
                    if (response.status === 200) {
                        await fetchFuncionarios(false);
                        showSuccessToast(`Funcionário ${nome} desativado com sucesso!`);
                    }
                } catch (error) {
                    console.error("Erro ao desativar funcionário:", error);
                    if (error.response) {
                        showErrorToast(error.response.data.error || `Erro ao desativar funcionário ${nome}`);
                    } else if (error.request) {
                        showErrorToast("Erro de conexão com o servidor");
                    } else {
                        showErrorToast(`Erro ao desativar funcionário ${nome}`);
                    }
                }
            },
            null,
            "Confirmar Desativação"
        );
    };

    const fecharModalEditar = useCallback(() => {
        setModalEditarAberto(false);
        setDadosEdicao({
            id_funcionario: '',
            nome_funcionario: '',
            contacto_funcionario: '',
            bi_funcionario: '',
            cargo_funcionario: '',
            idAdm: ''
        });
    }, []);

    useEffect(() => {
        fetchFuncionarios(false);
    }, [fetchFuncionarios]);

    const isEmpty = lista.length === 0 && !loading;
    const semResultados = !loading && listaFiltrada.length === 0 && termoPesquisa !== '';

    return (
        <div className="row mb-4">
            <div className="col-12">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2 className="h4 mb-0" style={{color:'var(--azul-escuro)'}}>
                        <FaUserTie className="me-2 mb-2"/>
                        Funcionários
                    </h2>
                    <div className="d-flex gap-2">
                        {ultimaAtualizacao && (
                            <small className="text-muted align-self-end small">
                                Atualizado: {ultimaAtualizacao}
                            </small>
                        )}
                        <button 
                            className={`btn btn-sm ${Style.AtulizarDepartamento}`}
                            onClick={() => fetchFuncionarios(true)}
                            disabled={loading || isConfirming}
                            title="Atualizar lista"
                        >
                            <MdRefresh />
                        </button>
                        <button
                            className={`btn btn-sm ${Style.btnSubmit}`}
                            onClick={abrirModalAdicionar}
                            disabled={loading || salvando || isConfirming}
                            title="Adicionar novo funcionário"
                        >
                            <MdAdd className="me-1" />
                            Novo Funcionário
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
                                            <span className="input-group-text border-end-0" style={{backgroundColor:'var(--cinza-claro)'}}>
                                                <MdSearch className="text-muted" size={20} />
                                            </span>
                                            <input
                                                type="text"
                                                className="form-control border-start-0 ps-0"
                                                placeholder="Pesquisar funcionário por nome, BI ou contacto..."
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
                                            {listaFiltrada.length} {listaFiltrada.length === 1 ? 'funcionário encontrado' : 'funcionários encontrados'}
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
                                <th className="col-3">Nome</th>
                                <th className="col-2">Contacto</th>
                                <th className="col-2">BI</th>
                                <th className="col-2">Cargo</th>
                                <th className="col-1 text-center">Senha</th>
                                <th className="col-1 text-center">Editar</th>
                                <th className="col-1 text-center">Desativar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-5">
                                        <div className="spinner-border text-primary mx-auto mb-2" style={{width: '3rem', height: '3rem'}} role="status">
                                            <span className="visually-hidden">Carregando...</span>
                                        </div>
                                        <p className="text-muted mb-0">Carregando funcionários...</p>
                                    </td>
                                </tr>
                            ) : semResultados ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-5">
                                        <MdSearch size={48} className="text-muted mb-3" />
                                        <p className="text-muted mb-2">Nenhum funcionário encontrado para "{termoPesquisa}"</p>
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
                                        <p className="text-muted mb-3">Nenhum funcionário encontrado</p>
                                        <button className="btn btn-outline-primary" onClick={() => fetchFuncionarios(true)}>
                                            <MdRefresh className="me-1" />
                                            Carregar funcionários
                                        </button>
                                    </td>
                                </tr>
                            ) : (
                                listaFiltrada.map((item) => (
                                    <tr key={item.id_funcionario}>
                                        <td className="align-middle fw-semibold" style={{color:'var(--azul-escuro)'}}>
                                            <MdPerson className="me-2 mb-1"/>{item.nome_funcionario}
                                        </td>
                                        <td className="align-middle">
                                            <MdPhone className="me-2 mb-1" style={{color:'var(--azul-escuro)'}}/>
                                            {item.contacto_funcionario || 'N/I'}
                                        </td>
                                        <td className="align-middle">
                                            <FaIdCard className="me-2 mb-1" style={{color:'var(--azul-escuro)'}}/>
                                            {item.bi_funcionario || 'N/I'}
                                        </td>
                                        <td className="align-middle">
                                            <span className="badge bg-primary">{item.cargo || 'N/I'}</span>
                                        </td>
                                        <td className="text-center">
                                            <button 
                                                className={`btn btn-sm ${Style.btnOutros}`}
                                                onClick={() => abrirModalSenha(item)}
                                                disabled={loading || salvando || isConfirming}
                                                title={`Alterar senha de ${item.nome_funcionario}`}
                                            >
                                                <MdLock />
                                            </button>
                                        </td>
                                        <td className="text-center">
                                            <button 
                                                className={`btn btn-sm ${Style.btnEditar}`}
                                                onClick={() => abrirModalEditar(item)}
                                                disabled={loading || salvando || isConfirming}
                                                title={`Editar ${item.nome_funcionario}`}
                                            >
                                                <MdEdit />
                                            </button>
                                        </td>
                                        <td className="text-center">
                                            <button 
                                                className={`btn btn-sm ${Style.btnDeletar}`}
                                                onClick={() => desativarFuncionario(item.id_funcionario, item.nome_funcionario)}
                                                disabled={loading || salvando || isConfirming}
                                                title={`Desativar ${item.nome_funcionario}`}
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

            {modalAdicionarAberto && (
                <div className="modal fade show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,.5)'}}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content shadow-lg border-0">
                            <div className="modal-header" style={{backgroundColor:'var(--azul-escuro)',color:'var(--dourado)'}}>
                                <h5 className="modal-title mb-0">
                                    <IoMdPersonAdd className="me-2" />
                                    Registrar Novo Funcionário
                                </h5>
                                <button 
                                    type="button" 
                                    className="btn-close btn-close-white"
                                    onClick={fecharModalAdicionar}
                                    disabled={salvando || isConfirming}
                                />
                            </div>
                            <form onSubmit={adicionarFuncionario}>
                                <div className="modal-body">
                                    <div className="container-fluid">
                                        <div className="row">
                                            <div className="col-md-12 mb-3">
                                                <label className="form-label small text-muted mb-1">Nome Completo *</label>
                                                <div className="input-group">
                                                    <span className="input-group-text"><MdPerson /></span>
                                                    <input 
                                                        type="text" 
                                                        placeholder="Nome Completo..." 
                                                        className="form-control shadow-sm" 
                                                        name="nome_funcionario" 
                                                        value={dadosNovoFuncionario.nome_funcionario}
                                                        onChange={handleNovoFuncionarioInputChange}
                                                        disabled={salvando || isConfirming}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label small text-muted mb-1">Contacto *</label>
                                                <div className="input-group">
                                                    <span className="input-group-text"><MdPhone /></span>
                                                    <input 
                                                        type="text" 
                                                        placeholder="Contacto..." 
                                                        className="form-control shadow-sm" 
                                                        name="contacto_funcionario" 
                                                        value={dadosNovoFuncionario.contacto_funcionario}
                                                        onChange={handleNovoFuncionarioInputChange}
                                                        disabled={salvando || isConfirming}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label small text-muted mb-1">BI *</label>
                                                <div className="input-group">
                                                    <span className="input-group-text"><FaIdCard /></span>
                                                    <input 
                                                        type="text" 
                                                        placeholder="Nº do BI..." 
                                                        className="form-control shadow-sm" 
                                                        name="bi_funcionario" 
                                                        value={dadosNovoFuncionario.bi_funcionario}
                                                        onChange={handleNovoFuncionarioInputChange}
                                                        disabled={salvando || isConfirming}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            
                                            <div className="col-md-12 mb-3">
                                                <label className="form-label small text-muted mb-1">Cargo *</label>
                                                <select
                                                    className="form-control shadow-sm"
                                                    name="cargo_funcionario"
                                                    value={dadosNovoFuncionario.cargo_funcionario}
                                                    onChange={handleNovoFuncionarioInputChange}
                                                    disabled={salvando || isConfirming}
                                                    required
                                                >
                                                    <option value="">Selecione um cargo...</option>
                                                    {cargos.map(cargo => (
                                                        <option key={cargo.id_cargo} value={cargo.cargo}>{cargo.cargo}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            
                                            <div className="col-md-12 mb-3">
                                                <div className="alert alert-info">
                                                    <small>
                                                        <strong>Nota:</strong> Uma senha será gerada automaticamente para o funcionário.
                                                    </small>
                                                </div>
                                            </div>
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
                                        disabled={salvando || isConfirming || !dadosNovoFuncionario.nome_funcionario?.trim()}
                                    >
                                        {salvando ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Registrando...
                                            </>
                                        ) : (
                                            'Registrar Funcionário'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {modalEditarAberto && (
                <div className="modal fade show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,.5)'}}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content shadow-lg border-0">
                            <div className="modal-header" style={{backgroundColor:'var(--azul-escuro)',color:'var(--dourado)'}}>
                                <h5 className="modal-title mb-0">
                                    <MdEdit className="me-2" />
                                    Editar Funcionário - {dadosEdicao.nome_funcionario}
                                </h5>
                                <button 
                                    type="button" 
                                    className="btn-close btn-close-white"
                                    onClick={fecharModalEditar}
                                    disabled={salvando || isConfirming}
                                />
                            </div>
                            <form onSubmit={salvarEdicao}>
                                <div className="modal-body">
                                    <div className="container-fluid">
                                        <div className="row">
                                            <div className="col-md-12 mb-3">
                                                <label className="form-label small text-muted mb-1">Nome Completo *</label>
                                                <div className="input-group">
                                                    <span className="input-group-text"><MdPerson /></span>
                                                    <input 
                                                        type="text" 
                                                        className="form-control shadow-sm" 
                                                        name="nome_funcionario" 
                                                        value={dadosEdicao.nome_funcionario}
                                                        onChange={handleInputChange}
                                                        placeholder="Nome Completo"
                                                        disabled={salvando || isConfirming}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label small text-muted mb-1">Contacto *</label>
                                                <div className="input-group">
                                                    <span className="input-group-text"><MdPhone /></span>
                                                    <input 
                                                        type="text" 
                                                        className="form-control shadow-sm" 
                                                        name="contacto_funcionario" 
                                                        value={dadosEdicao.contacto_funcionario}
                                                        onChange={handleInputChange}
                                                        placeholder="Contacto"
                                                        disabled={salvando || isConfirming}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label small text-muted mb-1">BI *</label>
                                                <div className="input-group">
                                                    <span className="input-group-text"><FaIdCard /></span>
                                                    <input 
                                                        type="text" 
                                                        className="form-control shadow-sm" 
                                                        name="bi_funcionario" 
                                                        value={dadosEdicao.bi_funcionario}
                                                        onChange={handleInputChange}
                                                        placeholder="Nº do BI"
                                                        disabled={salvando || isConfirming}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            
                                            <div className="col-md-12 mb-3">
                                                <label className="form-label small text-muted mb-1">Cargo *</label>
                                                <select
                                                    className="form-control shadow-sm"
                                                    name="cargo_funcionario"
                                                    value={dadosEdicao.cargo_funcionario}
                                                    onChange={handleInputChange}
                                                    disabled={salvando || isConfirming}
                                                    required
                                                >
                                                    <option value="">Selecione um cargo...</option>
                                                    {cargos.map(cargo => (
                                                        <option key={cargo.id_cargo} value={cargo.cargo}>{cargo.cargo}</option>
                                                    ))}
                                                </select>
                                            </div>
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
                                        className={`btn ${Style.btnSubmit}`}
                                        disabled={salvando || isConfirming || !dadosEdicao.nome_funcionario?.trim()}
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

            {modalSenhaAberto && (
                <div className="modal fade show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,.5)'}}>
                    <div className="modal-dialog modal-dialog-centered modal-md">
                        <div className="modal-content shadow-lg border-0">
                            <div className="modal-header" style={{backgroundColor:'var(--azul-escuro)',color:'var(--dourado)'}}>
                                <h5 className="modal-title mb-0">
                                    <MdLock className="me-2" />
                                    Alterar Senha - {dadosSenha.nome_funcionario}
                                </h5>
                                <button 
                                    type="button" 
                                    className="btn-close btn-close-white"
                                    onClick={fecharModalSenha}
                                    disabled={salvando || isConfirming}
                                />
                            </div>
                            <form onSubmit={salvarNovaSenha}>
                                <div className="modal-body">
                                    <div className="container-fluid">
                                        <div className="row">
                                            <div className="col-md-12 mb-3">
                                                <label className="form-label small text-muted mb-1">Nova Senha *</label>
                                                <div className="input-group">
                                                    <span className="input-group-text"><MdLock /></span>
                                                    <input 
                                                        type="password" 
                                                        className="form-control shadow-sm" 
                                                        name="nova_senha" 
                                                        value={dadosSenha.nova_senha}
                                                        onChange={handleSenhaChange}
                                                        placeholder="Digite a nova senha"
                                                        disabled={salvando || isConfirming}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            
                                            <div className="col-md-12 mb-3">
                                                <label className="form-label small text-muted mb-1">Confirmar Senha *</label>
                                                <div className="input-group">
                                                    <span className="input-group-text"><MdLock /></span>
                                                    <input 
                                                        type="password" 
                                                        className="form-control shadow-sm" 
                                                        name="confirmar_senha" 
                                                        value={dadosSenha.confirmar_senha}
                                                        onChange={handleSenhaChange}
                                                        placeholder="Confirme a nova senha"
                                                        disabled={salvando || isConfirming}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer border-0">
                                    <button 
                                        type="button" 
                                        className={`btn ${Style.btnCancelar}`}
                                        onClick={fecharModalSenha}
                                        disabled={salvando || isConfirming}
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        type="submit" 
                                        className={`btn ${Style.btnSubmit}`}
                                        disabled={salvando || isConfirming || !dadosSenha.nova_senha?.trim()}
                                    >
                                        {salvando ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Alterando...
                                            </>
                                        ) : (
                                            'Alterar Senha'
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

export default FuncionarioEdit;