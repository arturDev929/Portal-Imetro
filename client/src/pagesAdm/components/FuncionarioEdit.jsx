import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
    MdEdit, 
    MdDeleteForever, 
    MdRefresh, 
    MdSearch,
    MdAdd,
    MdPerson,
    MdPhone,
    MdLock,
    MdPhotoCamera,
    MdEmail,
    MdAttachFile
} from "react-icons/md";
import { FaIdCard, FaUserTie } from "react-icons/fa";
import { IoMdPersonAdd } from "react-icons/io";
import { showSuccessToast, showErrorToast, useConfirmToast } from "../../components/global/CustomToast";
import Style from "./DepartamentosEdit.module.css";
import Api from "../../service/api"
import Table from '../../components/global/Table'; 

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
    const [fotoPreview, setFotoPreview] = useState(null);
    const [fotoArquivo, setFotoArquivo] = useState(null);
    const [documentos, setDocumentos] = useState([]);
    const [documentosPreview, setDocumentosPreview] = useState([]);
    
    const [dadosNovoFuncionario, setDadosNovoFuncionario] = useState({
        nome_funcionario: "",
        contacto_funcionario: "",
        bi_funcionario: "",
        cargo_funcionario: "",
        email_funcionario: "",
        idAdm: ""
    });
    
    const [dadosEdicao, setDadosEdicao] = useState({
        id_func: '',
        nome: '',
        contacto: '',
        bi: '',
        cargo: '',
        idAdm: '',
        email: '',
        foto: null
    });

    const [dadosSenha, setDadosSenha] = useState({
        id_func: '',
        nome: '',
        nova_senha: '',
        confirmar_senha: ''
    });

    const [user, setUser] = useState(null);
    const { showConfirmToast, isConfirming } = useConfirmToast();

    useEffect(() => {
        const usuarioSalvo = localStorage.getItem("usuarioLogado");
        const token = localStorage.getItem("token");
        if (usuarioSalvo) {
            setUser(JSON.parse(usuarioSalvo));
        }
        if (!token) {
            showErrorToast("Acesso negado", "Faça login para acessar esta página.");
        }
    }, []);

    useEffect(() => {
        Api.get(`/cargosDisponiveis`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        })
            .then(response => {
                setCargos(response.data || []);
            })
            .catch(error => {
                console.error("Erro ao buscar cargos:", error);
            });
    }, []);

    const apiClient = useMemo(() => {
        const client = Api.create({
            timeout: API_TIMEOUT,
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        });

        client.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("usuarioLogado");
                    window.location.href = "/";
                }
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
            const response = await apiClient.get('/funcionarios');
            const dados = response.data.map(func => ({
                id_func: func.id_func,
                nome: func.nome,
                contacto: func.contacto,
                bi: func.bi,
                email: func.email,
                cargo: func.cargo,
                status: func.status,
                foto: func.foto,
                foto_url: func.foto_url
            }));
            setLista(dados);
            setListaFiltrada(dados);
            setUltimaAtualizacao(new Date().toLocaleTimeString('pt-BR'));
            
            if (mostrarNotificacao && dados && dados.length > 0) {
                showSuccessToast(
                    "Sucesso",
                    "Dados atualizados com sucesso",
                    { "Quantidade": `${dados.length} funcionário(s)` }
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
                item.nome?.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
                (item.bi && item.bi.toLowerCase().includes(termoPesquisa.toLowerCase())) ||
                (item.contacto && item.contacto.includes(termoPesquisa)) ||
                (item.email && item.email.toLowerCase().includes(termoPesquisa.toLowerCase()))
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
            email_funcionario: "",
            idAdm: user?.id || ""
        });
        setFotoPreview(null);
        setFotoArquivo(null);
        setDocumentos([]);
        setDocumentosPreview([]);
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
                email_funcionario: "",
                idAdm: ""
            });
            setFotoPreview(null);
            setFotoArquivo(null);
            setDocumentos([]);
            setDocumentosPreview([]);
        }
    }, [salvando]);

    const handleNovoFuncionarioInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setDadosNovoFuncionario((prev) => ({
            ...prev,
            [name]: value
        }));
    }, []);

    const handleFotoChange = useCallback((e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                showErrorToast("Erro", "A foto deve ser uma imagem (JPEG, PNG)");
                return;
            }
            setFotoArquivo(file);
            const reader = new FileReader();
            reader.onloadend = () => setFotoPreview(reader.result);
            reader.readAsDataURL(file);
        }
    }, []);

    const handleDocumentosChange = useCallback((e) => {
        const files = Array.from(e.target.files);
        const novosDocumentos = [];
        const novosPreviews = [];
        
        for (const file of files) {
            if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
                novosDocumentos.push(file);
                novosPreviews.push({ name: file.name, type: file.type });
            } else {
                showErrorToast("Erro", `Formato inválido: ${file.name}. Use PDF ou imagens.`);
            }
        }
        
        setDocumentos(prev => [...prev, ...novosDocumentos]);
        setDocumentosPreview(prev => [...prev, ...novosPreviews]);
    }, []);

    const removerDocumento = useCallback((index) => {
        setDocumentos(prev => prev.filter((_, i) => i !== index));
        setDocumentosPreview(prev => prev.filter((_, i) => i !== index));
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

        if (!dadosNovoFuncionario.email_funcionario?.trim()) {
            showErrorToast("Validação", "Preencha o email do funcionário");
            return;
        }

        setSalvando(true);
        try {
            const formData = new FormData();
            formData.append('nome_funcionario', dadosNovoFuncionario.nome_funcionario);
            formData.append('contacto_funcionario', dadosNovoFuncionario.contacto_funcionario);
            formData.append('bi_funcionario', dadosNovoFuncionario.bi_funcionario);
            formData.append('cargo_funcionario', dadosNovoFuncionario.cargo_funcionario);
            formData.append('email_funcionario', dadosNovoFuncionario.email_funcionario);
            formData.append('idAdm', user.id);
            if (fotoArquivo) {
                formData.append('foto', fotoArquivo);
            }
            documentos.forEach(doc => {
                formData.append('documentos', doc);
            });

            const response = await Api.post(`/registrarfuncionario`, formData, {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });

            if (response.data.sucesso) {
                showSuccessToast(
                    "Funcionário Registrado com Sucesso!",
                    response.data.mensagem,
                    {
                        "Nome": response.data.dados?.nome,
                        "Cargo": response.data.dados?.cargo,
                        "Email": response.data.dados?.email,
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
    }, [dadosNovoFuncionario, user, fetchFuncionarios, fecharModalAdicionar, fotoArquivo, documentos]);

    const abrirModalEditar = useCallback(async (funcionario) => {
        try {
            setDadosEdicao({
                id_func: funcionario.id_func,
                nome: funcionario.nome || '',
                contacto: funcionario.contacto || '',
                bi: funcionario.bi || '',
                email: funcionario.email || '',
                cargo: funcionario.cargo || '',
                idAdm: user?.id || '',
                foto: funcionario.foto
            });
            setFotoPreview(funcionario.foto_url);
            setFotoArquivo(null);
            setModalEditarAberto(true);
        } catch (error) {
            console.error("Erro ao preparar edição:", error);
            showErrorToast("Erro", "Não foi possível carregar os dados para edição");
        }
    }, [user]);

    const abrirModalSenha = useCallback((funcionario) => {
        setDadosSenha({
            id_func: funcionario.id_func,
            nome: funcionario.nome,
            nova_senha: '',
            confirmar_senha: ''
        });
        setModalSenhaAberto(true);
    }, []);

    const fecharModalSenha = useCallback(() => {
        setModalSenhaAberto(false);
        setDadosSenha({
            id_func: '',
            nome: '',
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

    const handleEdicaoFotoChange = useCallback((e) => {
        const file = e.target.files[0];
        if (file) {
            setFotoArquivo(file);
            const reader = new FileReader();
            reader.onloadend = () => setFotoPreview(reader.result);
            reader.readAsDataURL(file);
        }
    }, []);

    const salvarEdicao = useCallback(async (e) => {
        e?.preventDefault();
        
        if (!dadosEdicao.nome?.trim()) {
            showErrorToast("Validação", "Preencha o nome do funcionário");
            return;
        }

        if (!dadosEdicao.cargo?.trim()) {
            showErrorToast("Validação", "Selecione o cargo do funcionário");
            return;
        }

        setSalvando(true);
        try {
            const formData = new FormData();
            formData.append('nome_funcionario', dadosEdicao.nome);
            formData.append('contacto_funcionario', dadosEdicao.contacto);
            formData.append('bi_funcionario', dadosEdicao.bi);
            formData.append('cargo_funcionario', dadosEdicao.cargo);
            formData.append('idAdm', user?.id || '');
            if (fotoArquivo) {
                formData.append('foto', fotoArquivo);
            }

            const response = await Api.put(`/funcionario/${dadosEdicao.id_func}`, formData, {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });

            if (response.data.success) {
                showSuccessToast(
                    "Sucesso",
                    response.data.message,
                    { "Funcionário": dadosEdicao.nome }
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
    }, [dadosEdicao, user, fetchFuncionarios, fotoArquivo]);

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
            const response = await apiClient.put(`/funcionario/senha/${dadosSenha.id_func}`, {
                senha_funcionario: dadosSenha.nova_senha
            });

            if (response.data.success) {
                showSuccessToast(
                    "Sucesso",
                    response.data.message,
                    { "Funcionário": dadosSenha.nome }
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

    const desativarFuncionario = useCallback((id, nome) => {
        showConfirmToast(
            `Tens a certeza que pretendes desativar o funcionário ${nome}?`,
            async () => {
                try {
                    const response = await Api.put(`/funcionario/desativar/${id}`, {}, {
                        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                    });
                    
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
    }, [showConfirmToast, fetchFuncionarios]);

    const fecharModalEditar = useCallback(() => {
        setModalEditarAberto(false);
        setDadosEdicao({
            id_func: '',
            nome: '',
            contacto: '',
            bi: '',
            email: '',
            cargo: '',
            idAdm: '',
            foto: null
        });
        setFotoPreview(null);
        setFotoArquivo(null);
    }, []);

    useEffect(() => {
        fetchFuncionarios(false);
    }, [fetchFuncionarios]);

    const isEmpty = lista.length === 0 && !loading;
    const semResultados = !loading && listaFiltrada.length === 0 && termoPesquisa !== '';

    const headers = ['Foto', 'Nome', 'Contacto', 'BI', 'Email', 'Cargo', 'Senha', 'Editar', 'Desativar'];

    const renderRow = useCallback((item) => (
        <tr key={item.id_func}>
            <td className="align-middle text-center">
                {item.foto_url ? (
                    <img 
                        src={item.foto_url} 
                        alt={item.nome} 
                        style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                ) : (
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <MdPerson size={20} color="#999" />
                    </div>
                )}
            </td>
            <td className="align-middle fw-semibold" style={{color:'var(--azul-escuro)'}}>
                <MdPerson className="me-2 mb-1"/>{item.nome}
            </td>
            <td className="align-middle">
                <MdPhone className="me-2 mb-1" style={{color:'var(--azul-escuro)'}}/>
                {item.contacto || 'N/I'}
            </td>
            <td className="align-middle">
                <FaIdCard className="me-2 mb-1" style={{color:'var(--azul-escuro)'}}/>
                {item.bi || 'N/I'}
            </td>
            <td className="align-middle">
                <MdEmail className="me-2 mb-1" style={{color:'var(--azul-escuro)'}}/>
                {item.email || 'N/I'}
            </td>
            <td className="align-middle">
                <span className="badge bg-primary">{item.cargo || 'N/I'}</span>
            </td>
            <td className="text-center">
                <button 
                    className={`btn btn-sm ${Style.btnOutros}`}
                    onClick={() => abrirModalSenha(item)}
                    disabled={loading || salvando || isConfirming}
                    title={`Alterar senha de ${item.nome}`}
                >
                    <MdLock />
                </button>
            </td>
            <td className="text-center">
                <button 
                    className={`btn btn-sm ${Style.btnEditar}`}
                    onClick={() => abrirModalEditar(item)}
                    disabled={loading || salvando || isConfirming}
                    title={`Editar ${item.nome}`}
                >
                    <MdEdit />
                </button>
            </td>
            <td className="text-center">
                <button 
                    className={`btn btn-sm ${Style.btnDeletar}`}
                    onClick={() => desativarFuncionario(item.id_func, item.nome)}
                    disabled={loading || salvando || isConfirming}
                    title={`Desativar ${item.nome}`}
                >
                    <MdDeleteForever />
                </button>
            </td>
        </tr>
    ), [loading, salvando, isConfirming, abrirModalSenha, abrirModalEditar, desativarFuncionario]);

    const renderConteudo = () => {
        if (loading) {
            return (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary mx-auto mb-2" style={{width: '3rem', height: '3rem'}} role="status">
                        <span className="visually-hidden">Carregando...</span>
                    </div>
                    <p className="text-muted mb-0">Carregando funcionários...</p>
                </div>
            );
        }

        if (semResultados) {
            return (
                <div className="text-center py-5">
                    <MdSearch size={48} className="text-muted mb-3" />
                    <p className="text-muted mb-2">Nenhum funcionário encontrado para "{termoPesquisa}"</p>
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
                    <p className="text-muted mb-3">Nenhum funcionário encontrado</p>
                    <button className="btn btn-outline-primary" onClick={() => fetchFuncionarios(true)}>
                        <MdRefresh className="me-1" />
                        Carregar funcionários
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
                                                placeholder="Pesquisar funcionário por nome, BI, contacto ou email..."
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

                {renderConteudo()}
            </div>

            {/* Modal Adicionar */}
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
                                                <label className="form-label small text-muted mb-1">Email *</label>
                                                <div className="input-group">
                                                    <span className="input-group-text"><MdEmail /></span>
                                                    <input 
                                                        type="email" 
                                                        placeholder="Email do funcionário..." 
                                                        className="form-control shadow-sm" 
                                                        name="email_funcionario" 
                                                        value={dadosNovoFuncionario.email_funcionario}
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
                                                <label className="form-label small text-muted mb-1">Foto de Perfil</label>
                                                <div className="input-group">
                                                    <span className="input-group-text"><MdPhotoCamera /></span>
                                                    <input 
                                                        type="file" 
                                                        className="form-control shadow-sm" 
                                                        accept="image/jpeg,image/png,image/webp,image/gif"
                                                        onChange={handleFotoChange}
                                                        disabled={salvando || isConfirming}
                                                    />
                                                </div>
                                                {fotoPreview && (
                                                    <div className="mt-2 text-center">
                                                        <img 
                                                            src={fotoPreview} 
                                                            alt="Preview" 
                                                            style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }} 
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="col-md-12 mb-3">
                                                <label className="form-label small text-muted mb-1">Documentos (PDF, imagens)</label>
                                                <div className="input-group">
                                                    <span className="input-group-text"><MdAttachFile /></span>
                                                    <input 
                                                        type="file" 
                                                        className="form-control shadow-sm" 
                                                        accept=".pdf,.jpg,.jpeg,.png"
                                                        multiple
                                                        onChange={handleDocumentosChange}
                                                        disabled={salvando || isConfirming}
                                                    />
                                                </div>
                                                {documentosPreview.length > 0 && (
                                                    <div className="mt-2">
                                                        <small className="text-muted">Documentos anexados:</small>
                                                        <div className="list-group mt-1">
                                                            {documentosPreview.map((doc, index) => (
                                                                <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                                                                    <span>{doc.name}</span>
                                                                    <button 
                                                                        type="button" 
                                                                        className="btn btn-sm btn-danger"
                                                                        onClick={() => removerDocumento(index)}
                                                                    >
                                                                        <MdDeleteForever />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="col-md-12 mb-3">
                                                <div className="alert alert-info">
                                                    <small>
                                                        <strong>Nota:</strong> Uma senha será gerada automaticamente e enviada para o email do funcionário.
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

            {/* Modal Editar */}
            {modalEditarAberto && (
                <div className="modal fade show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,.5)'}}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content shadow-lg border-0">
                            <div className="modal-header" style={{backgroundColor:'var(--azul-escuro)',color:'var(--dourado)'}}>
                                <h5 className="modal-title mb-0">
                                    <MdEdit className="me-2" />
                                    Editar Funcionário - {dadosEdicao.nome}
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
                                                        name="nome" 
                                                        value={dadosEdicao.nome}
                                                        onChange={handleInputChange}
                                                        placeholder="Nome Completo"
                                                        disabled={salvando || isConfirming}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label small text-muted mb-1">Contacto</label>
                                                <div className="input-group">
                                                    <span className="input-group-text"><MdPhone /></span>
                                                    <input 
                                                        type="text" 
                                                        className="form-control shadow-sm" 
                                                        name="contacto" 
                                                        value={dadosEdicao.contacto}
                                                        onChange={handleInputChange}
                                                        placeholder="Contacto"
                                                        disabled={salvando || isConfirming}
                                                    />
                                                </div>
                                            </div>
                                            
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label small text-muted mb-1">BI</label>
                                                <div className="input-group">
                                                    <span className="input-group-text"><FaIdCard /></span>
                                                    <input 
                                                        type="text" 
                                                        className="form-control shadow-sm" 
                                                        name="bi" 
                                                        value={dadosEdicao.bi}
                                                        onChange={handleInputChange}
                                                        placeholder="Nº do BI"
                                                        disabled={salvando || isConfirming}
                                                    />
                                                </div>
                                            </div>

                                            <div className="col-md-12 mb-3">
                                                <label className="form-label small text-muted mb-1">Email</label>
                                                <div className="input-group">
                                                    <span className="input-group-text"><MdEmail /></span>
                                                    <input 
                                                        type="email" 
                                                        className="form-control shadow-sm" 
                                                        name="email" 
                                                        value={dadosEdicao.email}
                                                        onChange={handleInputChange}
                                                        placeholder="Email"
                                                        disabled={salvando || isConfirming}
                                                    />
                                                </div>
                                            </div>
                                            
                                            <div className="col-md-12 mb-3">
                                                <label className="form-label small text-muted mb-1">Cargo *</label>
                                                <select
                                                    className="form-control shadow-sm"
                                                    name="cargo"
                                                    value={dadosEdicao.cargo}
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

                                            <div className="col-md-12 mb-3">
                                                <label className="form-label small text-muted mb-1">Foto de Perfil</label>
                                                <div className="input-group">
                                                    <span className="input-group-text"><MdPhotoCamera /></span>
                                                    <input 
                                                        type="file" 
                                                        className="form-control shadow-sm" 
                                                        accept="image/jpeg,image/png,image/webp,image/gif"
                                                        onChange={handleEdicaoFotoChange}
                                                        disabled={salvando || isConfirming}
                                                    />
                                                </div>
                                                {fotoPreview && (
                                                    <div className="mt-2 text-center">
                                                        <img 
                                                            src={fotoPreview} 
                                                            alt="Preview" 
                                                            style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }} 
                                                        />
                                                    </div>
                                                )}
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
                                        disabled={salvando || isConfirming || !dadosEdicao.nome?.trim()}
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

            {/* Modal Senha */}
            {modalSenhaAberto && (
                <div className="modal fade show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,.5)'}}>
                    <div className="modal-dialog modal-dialog-centered modal-md">
                        <div className="modal-content shadow-lg border-0">
                            <div className="modal-header" style={{backgroundColor:'var(--azul-escuro)',color:'var(--dourado)'}}>
                                <h5 className="modal-title mb-0">
                                    <MdLock className="me-2" />
                                    Alterar Senha - {dadosSenha.nome}
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