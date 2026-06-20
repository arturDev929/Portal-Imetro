import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
    MdEdit, MdDeleteForever, MdRefresh, MdSearch, MdAdd, MdPerson, MdPhone,
    MdLock, MdPhotoCamera, MdEmail, MdAttachFile, MdVisibility
} from "react-icons/md";
import { FaIdCard, FaUserTie } from "react-icons/fa";
import { IoMdPersonAdd } from "react-icons/io";
import { showSuccessToast, showErrorToast, useConfirmToast } from "../../components/global/CustomToast";
import Style from "./DepartamentosEdit.module.css";
import Api from "../../service/api";
import Table from '../../components/global/Table';

const API_TIMEOUT = 30000;

function FuncionarioEdit() {
    // Estados principais
    const [lista, setLista] = useState([]);
    const [listaFiltrada, setListaFiltrada] = useState([]);
    const [termoPesquisa, setTermoPesquisa] = useState('');
    const [loading, setLoading] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null);
    const [user, setUser] = useState(null);
    const { showConfirmToast, isConfirming } = useConfirmToast();

    // Estados dos modais
    const [modalAdicionarAberto, setModalAdicionarAberto] = useState(false);
    const [modalEditarAberto, setModalEditarAberto] = useState(false);
    const [modalVisualizarAberto, setModalVisualizarAberto] = useState(false);
    const [modalSenhaGeradaAberto, setModalSenhaGeradaAberto] = useState(false);

    // Estados de cargos e documentos
    const [cargos, setCargos] = useState([]);
    const [fotoPreview, setFotoPreview] = useState(null);
    const [fotoArquivo, setFotoArquivo] = useState(null);
    const [documentos, setDocumentos] = useState([]);
    const [documentosPreview, setDocumentosPreview] = useState([]);
    const [titulosDocumentos, setTitulosDocumentos] = useState([]);
    const [funcionarioSelecionado, setFuncionarioSelecionado] = useState(null);
    const [documentosFuncionario, setDocumentosFuncionario] = useState([]);
    const [carregandoDocumentos, setCarregandoDocumentos] = useState(false);
    const [documentosExistentes, setDocumentosExistentes] = useState([]);
    const [documentosParaRemover, setDocumentosParaRemover] = useState([]);
    const [novosDocumentos, setNovosDocumentos] = useState([]);
    const [novosDocumentosPreview, setNovosDocumentosPreview] = useState([]);
    const [novosDocumentosTitulos, setNovosDocumentosTitulos] = useState([]);
    
    // Estado para a senha gerada (para exibir no modal)
    const [senhaGerada, setSenhaGerada] = useState('');
    const [funcionarioSenhaGerada, setFuncionarioSenhaGerada] = useState(null);

    // Dados dos formulários
    const [dadosNovoFuncionario, setDadosNovoFuncionario] = useState({
        nome: "", contacto: "", bi: "", cargo: "", email: "", idAdm: ""
    });
    
    const [dadosEdicao, setDadosEdicao] = useState({
        id_func: '', nome: '', contacto: '', bi: '', cargo: '', idAdm: '', email: '', foto: null
    });

    // Carregar usuário logado
    useEffect(() => {
        const usuarioSalvo = localStorage.getItem("usuarioLogado");
        if (usuarioSalvo) setUser(JSON.parse(usuarioSalvo));
    }, []);

    // Carregar cargos
    useEffect(() => {
        Api.get(`/cargosDisponiveis`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        }).then(response => setCargos(response.data || [])).catch(console.error);
    }, []);

    // Configuração do API client
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
                return Promise.reject(error);
            }
        );
        return client;
    }, []);

    // Buscar funcionários
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
            if (mostrarNotificacao && dados.length > 0) {
                showSuccessToast("Sucesso", "Dados atualizados", { 
                    "Quantidade": `${dados.length} funcionário(s)` 
                });
            }
        } catch (error) {
            console.error("Erro ao buscar funcionários:", error);
            showErrorToast("Erro", "Não foi possível carregar os funcionários");
        } finally {
            setLoading(false);
        }
    }, [apiClient]);

    // Filtrar funcionários
    useEffect(() => {
        if (termoPesquisa.trim() === '') {
            setListaFiltrada(lista);
        } else {
            const filtrados = lista.filter(item => 
                item.nome?.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
                item.bi?.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
                item.contacto?.includes(termoPesquisa) ||
                item.email?.toLowerCase().includes(termoPesquisa.toLowerCase())
            );
            setListaFiltrada(filtrados);
        }
    }, [lista, termoPesquisa]);

    // ========== FUNÇÕES PARA GERAR SENHA ==========
    const gerarSenhaFuncionario = useCallback(async (id, nome) => {
        // Mostrar confirmação antes de gerar
        showConfirmToast(
            `Gerar nova senha para ${nome}?`,
            async () => {
                try {
                    const response = await Api.put(
                        `/funcionario/senha/${id}`,
                        {},
                        {
                            headers: { 
                                Authorization: `Bearer ${localStorage.getItem("token")}`
                            }
                        }
                    );
                    
                    if (response.data.success) {
                        // Armazenar a senha gerada para exibir
                        setSenhaGerada(response.data.senha_gerada || '');
                        setFuncionarioSenhaGerada({ id, nome });
                        setModalSenhaGeradaAberto(true);
                        
                        showSuccessToast(
                            "Senha Gerada com Sucesso", 
                            `Nova senha para ${nome} foi gerada e enviada por email`,
                            { "Status": "Concluído" }
                        );
                        
                        // Recarregar a lista para atualizar status
                        await fetchFuncionarios(false);
                    }
                } catch (error) {
                    console.error("Erro ao gerar senha:", error);
                    showErrorToast("Erro", "Não foi possível gerar a nova senha. Tente novamente.");
                }
            },
            null,
            "Confirmar Geração de Senha"
        );
    }, [showConfirmToast, fetchFuncionarios]);

    // ========== FUNÇÕES DOS MODAIS ==========
    const abrirModalAdicionar = useCallback(() => {
        setDadosNovoFuncionario({ 
            nome: "", contacto: "", bi: "", cargo: "", email: "", idAdm: user?.id || "" 
        });
        setFotoPreview(null);
        setFotoArquivo(null);
        setDocumentos([]);
        setDocumentosPreview([]);
        setTitulosDocumentos([]);
        setModalAdicionarAberto(true);
    }, [user]);

    const fecharModalAdicionar = useCallback(() => {
        if (!salvando) {
            setModalAdicionarAberto(false);
            setDadosNovoFuncionario({ nome: "", contacto: "", bi: "", cargo: "", email: "", idAdm: "" });
            setFotoPreview(null);
            setFotoArquivo(null);
            setDocumentos([]);
            setDocumentosPreview([]);
            setTitulosDocumentos([]);
        }
    }, [salvando]);

    const abrirModalVisualizar = useCallback(async (funcionario) => {
        try {
            setCarregandoDocumentos(true);
            setFuncionarioSelecionado(funcionario);
            const [infoRes, docsRes] = await Promise.all([
                apiClient.get(`/funcionario/info/${funcionario.id_func}`),
                apiClient.get(`/funcionario/documentos/${funcionario.id_func}`)
            ]);
            if (infoRes.data.success) {
                setFuncionarioSelecionado(prev => ({ ...prev, ...infoRes.data.funcionario }));
            }
            if (docsRes.data.success) {
                setDocumentosFuncionario(docsRes.data.documentos);
            }
            setModalVisualizarAberto(true);
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
            showErrorToast("Erro", "Não foi possível carregar os dados");
        } finally {
            setCarregandoDocumentos(false);
        }
    }, [apiClient]);

    const abrirModalEditar = useCallback(async (funcionario) => {
        try {
            setCarregandoDocumentos(true);
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
            
            const docsRes = await apiClient.get(`/funcionario/documentos/${funcionario.id_func}`);
            if (docsRes.data.success) {
                setDocumentosExistentes(docsRes.data.documentos);
            }
            
            setDocumentosParaRemover([]);
            setNovosDocumentos([]);
            setNovosDocumentosPreview([]);
            setNovosDocumentosTitulos([]);
            setModalEditarAberto(true);
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
            showErrorToast("Erro", "Não foi possível carregar os dados");
        } finally {
            setCarregandoDocumentos(false);
        }
    }, [user, apiClient]);

    // ========== FUNÇÕES DE FOTO E DOCUMENTOS ==========
    const handleFotoChange = useCallback((e) => {
        const file = e.target.files[0];
        if (file) {
            setFotoArquivo(file);
            const reader = new FileReader();
            reader.onloadend = () => setFotoPreview(reader.result);
            reader.readAsDataURL(file);
        }
    }, []);

    const handleDocumentosChange = useCallback((e) => {
        const files = Array.from(e.target.files);
        const novosDocs = [], novosPreviews = [], novoTitulos = [];
        
        for (const file of files) {
            if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
                novosDocs.push(file);
                novosPreviews.push({ name: file.name, type: file.type });
                novoTitulos.push(file.name.replace(/\.[^/.]+$/, ''));
            } else {
                showErrorToast("Erro", `Formato inválido: ${file.name}`);
            }
        }
        setDocumentos(prev => [...prev, ...novosDocs]);
        setDocumentosPreview(prev => [...prev, ...novosPreviews]);
        setTitulosDocumentos(prev => [...prev, ...novoTitulos]);
    }, []);

    const handleTituloDocumentoChange = useCallback((index, titulo) => {
        setTitulosDocumentos(prev => { 
            const novos = [...prev]; 
            novos[index] = titulo; 
            return novos; 
        });
    }, []);

    const removerDocumento = useCallback((index) => {
        setDocumentos(prev => prev.filter((_, i) => i !== index));
        setDocumentosPreview(prev => prev.filter((_, i) => i !== index));
        setTitulosDocumentos(prev => prev.filter((_, i) => i !== index));
    }, []);

    const handleNovosDocumentosChange = useCallback((e) => {
        const files = Array.from(e.target.files);
        const novosDocs = [], novosPreviews = [], novoTitulos = [];
        
        for (const file of files) {
            if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
                novosDocs.push(file);
                novosPreviews.push({ name: file.name, type: file.type });
                novoTitulos.push(file.name.replace(/\.[^/.]+$/, ''));
            }
        }
        setNovosDocumentos(prev => [...prev, ...novosDocs]);
        setNovosDocumentosPreview(prev => [...prev, ...novosPreviews]);
        setNovosDocumentosTitulos(prev => [...prev, ...novoTitulos]);
    }, []);

    const removerNovoDocumento = useCallback((index) => {
        setNovosDocumentos(prev => prev.filter((_, i) => i !== index));
        setNovosDocumentosPreview(prev => prev.filter((_, i) => i !== index));
        setNovosDocumentosTitulos(prev => prev.filter((_, i) => i !== index));
    }, []);

    const marcarDocumentoParaRemover = useCallback((docId) => {
        setDocumentosParaRemover(prev => [...prev, docId]);
        setDocumentosExistentes(prev => prev.filter(doc => doc.id_doc !== docId));
    }, []);

    // ========== FUNÇÕES DE CRUD ==========
    const adicionarFuncionario = useCallback(async (e) => {
        e.preventDefault();
        if (!dadosNovoFuncionario.nome?.trim()) {
            return showErrorToast("Validação", "Preencha o nome do funcionário");
        }
        if (!dadosNovoFuncionario.email?.trim()) {
            return showErrorToast("Validação", "Preencha o email do funcionário");
        }
        
        setSalvando(true);
        try {
            const formData = new FormData();
            Object.entries(dadosNovoFuncionario).forEach(([key, value]) => {
                if (value) formData.append(key, value);
            });
            if (fotoArquivo) formData.append('foto', fotoArquivo);
            
            documentos.forEach((doc, i) => {
                formData.append('documentos', doc);
                formData.append('documentos_titulo', titulosDocumentos[i] || doc.name);
            });

            const response = await Api.post(`/registrarfuncionario`, formData, {
                headers: { 
                    'Content-Type': 'multipart/form-data', 
                    Authorization: `Bearer ${localStorage.getItem("token")}` 
                }
            });

            if (response.data.sucesso) {
                showSuccessToast("Sucesso", response.data.mensagem || "Funcionário registrado com sucesso!");
                await fetchFuncionarios(false);
                fecharModalAdicionar();
            } else {
                showErrorToast("Erro", response.data.mensagem || "Erro ao registrar funcionário");
            }
        } catch (error) {
            console.error("Erro ao adicionar:", error);
            showErrorToast("Erro", error.response?.data?.mensagem || "Não foi possível registrar o funcionário");
        } finally {
            setSalvando(false);
        }
    }, [dadosNovoFuncionario, fotoArquivo, documentos, titulosDocumentos, fetchFuncionarios, fecharModalAdicionar]);

    const salvarEdicao = useCallback(async (e) => {
        e.preventDefault();
        if (!dadosEdicao.nome?.trim()) {
            return showErrorToast("Validação", "Preencha o nome do funcionário");
        }
        
        setSalvando(true);
        try {
            const formData = new FormData();
            formData.append('nome', dadosEdicao.nome);
            formData.append('contacto', dadosEdicao.contacto || '');
            formData.append('bi', dadosEdicao.bi || '');
            formData.append('cargo', dadosEdicao.cargo || '');
            formData.append('idAdm', user?.id || '');
            formData.append('email', dadosEdicao.email || '');
            
            if (fotoArquivo) formData.append('foto', fotoArquivo);
            
            documentosParaRemover.forEach(docId => {
                formData.append('documentos_remover', docId);
            });
            
            novosDocumentos.forEach((doc, i) => {
                formData.append('documentos', doc);
                formData.append('documentos_titulo', novosDocumentosTitulos[i] || doc.name);
            });

            const response = await Api.put(`/funcionario/${dadosEdicao.id_func}`, formData, {
                headers: { 
                    'Content-Type': 'multipart/form-data', 
                    Authorization: `Bearer ${localStorage.getItem("token")}` 
                }
            });

            if (response.data.success) {
                showSuccessToast("Sucesso", response.data.message || "Funcionário atualizado com sucesso!");
                await fetchFuncionarios(false);
                setModalEditarAberto(false);
            } else {
                showErrorToast("Erro", response.data.message || "Erro ao atualizar funcionário");
            }
        } catch (error) {
            console.error("Erro ao editar:", error);
            showErrorToast("Erro", error.response?.data?.message || "Não foi possível atualizar o funcionário");
        } finally {
            setSalvando(false);
        }
    }, [dadosEdicao, user, fotoArquivo, documentosParaRemover, novosDocumentos, novosDocumentosTitulos, fetchFuncionarios]);

    const desativarFuncionario = useCallback((id, nome) => {
        showConfirmToast(
            `Desativar ${nome}?`, 
            async () => {
                try {
                    const response = await Api.put(
                        `/funcionario/desativar/${id}`, 
                        {},
                        {
                            headers: { 
                                Authorization: `Bearer ${localStorage.getItem("token")}` 
                            }
                        }
                    );
                    if (response.status === 200) {
                        await fetchFuncionarios(false);
                        showSuccessToast("Sucesso", `Funcionário ${nome} foi desativado`);
                    }
                } catch (error) {
                    console.error("Erro ao desativar:", error);
                    showErrorToast("Erro", "Não foi possível desativar o funcionário");
                }
            }, 
            null, 
            "Confirmar Desativação"
        );
    }, [showConfirmToast, fetchFuncionarios]);

    // Carregar dados iniciais
    useEffect(() => { 
        fetchFuncionarios(false); 
    }, [fetchFuncionarios]);

    // ========== RENDERIZAÇÃO DA TABELA ==========
    const headers = ['Foto', 'Nome', 'Contacto', 'BI', 'Email', 'Cargo', 'Senha', 'Editar', 'Status'];

    const renderRow = useCallback((item) => (
        <tr key={item.id_func}>
            <td className="align-middle text-center" style={{ cursor: 'pointer' }} 
                onClick={() => abrirModalVisualizar(item)}>
                {item.foto_url ? (
                    <img 
                        src={item.foto_url} 
                        alt={item.nome} 
                        style={{ 
                            width: '40px', 
                            height: '40px', 
                            borderRadius: '50%', 
                            objectFit: 'cover' 
                        }} 
                    />
                ) : (
                    <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '50%', 
                        backgroundColor: '#e0e0e0', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center' 
                    }}>
                        <MdPerson size={20} color="#999" />
                    </div>
                )}
            </td>
            <td className="align-middle fw-semibold" style={{ color: 'var(--azul-escuro)' }}>
                <MdPerson className="me-2 mb-1"/>{item.nome}
            </td>
            <td className="align-middle">
                <MdPhone className="me-2 mb-1" style={{ color: 'var(--azul-escuro)' }}/>
                {item.contacto || 'N/I'}
            </td>
            <td className="align-middle">
                <FaIdCard className="me-2 mb-1" style={{ color: 'var(--azul-escuro)' }}/>
                {item.bi || 'N/I'}
            </td>
            <td className="align-middle">
                <MdEmail className="me-2 mb-1" style={{ color: 'var(--azul-escuro)' }}/>
                {item.email || 'N/I'}
            </td>
            <td className="align-middle">
                <span className="badge bg-primary">{item.cargo || 'N/I'}</span>
            </td>
            <td className="text-center">
                <button 
                    className={`btn btn-sm ${Style.btnOutros}`} 
                    onClick={() => gerarSenhaFuncionario(item.id_func, item.nome)}
                    disabled={loading || salvando || isConfirming}
                    title="Gerar nova senha para este funcionário"
                >
                    <MdLock />
                </button>
            </td>
            <td className="text-center">
                <button 
                    className={`btn btn-sm ${Style.btnEditar}`} 
                    onClick={() => abrirModalEditar(item)} 
                    disabled={loading || salvando || isConfirming}
                    title="Editar informações do funcionário"
                >
                    <MdEdit />
                </button>
            </td>
            <td className="text-center">
                {item.status === 'Ativo' ? (
                    <button 
                        className={`btn btn-sm ${Style.btnDeletar}`} 
                        onClick={() => desativarFuncionario(item.id_func, item.nome)} 
                        disabled={loading || salvando || isConfirming}
                        title="Desativar funcionário"
                    >
                        <MdDeleteForever />
                    </button>
                ) : (
                    <span className="badge bg-secondary">Inativo</span>
                )}
            </td>
        </tr>
    ), [loading, salvando, isConfirming, abrirModalVisualizar, abrirModalEditar, desativarFuncionario, gerarSenhaFuncionario]);

    // ========== RENDER PRINCIPAL ==========
    return (
        <div className="row mb-4">
            <div className="col-12">
                {/* Cabeçalho */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2 className="h4 mb-0" style={{ color: 'var(--azul-escuro)' }}>
                        <FaUserTie className="me-2 mb-2"/>
                        Funcionários
                    </h2>
                    <div className="d-flex gap-2">
                        {ultimaAtualizacao && (
                            <small className="text-muted align-self-end">
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
                        >
                            <MdAdd className="me-1" />
                            Novo Funcionário
                        </button>
                    </div>
                </div>

                {/* Barra de Pesquisa */}
                <div className="row mb-4">
                    <div className="col-md-8 mx-auto">
                        <div className="card shadow-sm border-0">
                            <div className="card-body p-3">
                                <div className="input-group">
                                    <span className="input-group-text border-end-0" 
                                        style={{ backgroundColor: 'var(--cinza-claro)' }}>
                                        <MdSearch size={20} />
                                    </span>
                                    <input 
                                        type="text" 
                                        className="form-control border-start-0 ps-0" 
                                        placeholder="Pesquisar por nome, BI, contacto ou email..." 
                                        value={termoPesquisa} 
                                        onChange={(e) => setTermoPesquisa(e.target.value)} 
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
                                            onClick={() => setTermoPesquisa('')} 
                                            style={{ 
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
                    </div>
                </div>

                {/* Tabela de Funcionários */}
                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status"></div>
                        <p className="mt-2">Carregando funcionários...</p>
                    </div>
                ) : listaFiltrada.length === 0 ? (
                    <div className="text-center py-5">
                        <MdPerson size={48} className="text-muted mb-3" />
                        <p className="text-muted">
                            {termoPesquisa ? 'Nenhum funcionário encontrado com este filtro' : 'Nenhum funcionário cadastrado'}
                        </p>
                        {termoPesquisa && (
                            <button 
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => setTermoPesquisa('')}
                            >
                                Limpar filtro
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="table-responsive">
                        <Table 
                            headers={headers} 
                            data={listaFiltrada} 
                            renderRow={renderRow} 
                            className="table table-hover table-striped border" 
                        />
                    </div>
                )}
            </div>

            {/* ========== MODAL ADICIONAR FUNCIONÁRIO ========== */}
            {modalAdicionarAberto && (
                <div className="modal fade show d-block" tabIndex="-1" 
                    style={{ backgroundColor: 'rgba(0,0,0,.5)' }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content">
                            <div className="modal-header" 
                                style={{ backgroundColor: 'var(--azul-escuro)', color: 'var(--dourado)' }}>
                                <h5>
                                    <IoMdPersonAdd className="me-2" />
                                    Registrar Novo Funcionário
                                </h5>
                                <button 
                                    className="btn-close btn-close-white" 
                                    onClick={fecharModalAdicionar} 
                                    disabled={salvando}
                                />
                            </div>
                            <form onSubmit={adicionarFuncionario}>
                                <div className="modal-body">
                                    <div className="row">
                                        <div className="col-md-12 mb-3">
                                            <input 
                                                type="text" 
                                                name="nome" 
                                                placeholder="Nome completo *" 
                                                className="form-control" 
                                                value={dadosNovoFuncionario.nome} 
                                                onChange={(e) => setDadosNovoFuncionario({ 
                                                    ...dadosNovoFuncionario, 
                                                    nome: e.target.value 
                                                })} 
                                                required 
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <input 
                                                type="text" 
                                                name="contacto" 
                                                placeholder="Contacto" 
                                                className="form-control" 
                                                value={dadosNovoFuncionario.contacto} 
                                                onChange={(e) => setDadosNovoFuncionario({ 
                                                    ...dadosNovoFuncionario, 
                                                    contacto: e.target.value 
                                                })} 
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <input 
                                                type="text" 
                                                name="bi" 
                                                placeholder="BI" 
                                                className="form-control" 
                                                value={dadosNovoFuncionario.bi} 
                                                onChange={(e) => setDadosNovoFuncionario({ 
                                                    ...dadosNovoFuncionario, 
                                                    bi: e.target.value 
                                                })} 
                                            />
                                        </div>
                                        <div className="col-md-12 mb-3">
                                            <input 
                                                type="email" 
                                                name="email" 
                                                placeholder="Email *" 
                                                className="form-control" 
                                                value={dadosNovoFuncionario.email} 
                                                onChange={(e) => setDadosNovoFuncionario({ 
                                                    ...dadosNovoFuncionario, 
                                                    email: e.target.value 
                                                })} 
                                                required 
                                            />
                                        </div>
                                        <div className="col-md-12 mb-3">
                                            <select 
                                                className="form-control" 
                                                value={dadosNovoFuncionario.cargo} 
                                                onChange={(e) => setDadosNovoFuncionario({ 
                                                    ...dadosNovoFuncionario, 
                                                    cargo: e.target.value 
                                                })} 
                                                required
                                            >
                                                <option value="">Selecione o cargo *</option>
                                                {cargos.map(c => (
                                                    <option key={c.id_cargo} value={c.cargo}>
                                                        {c.cargo}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        
                                        {/* Upload de Foto */}
                                        <div className="col-md-12 mb-3">
                                            <label className="form-label">Foto do Funcionário</label>
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                className="form-control" 
                                                onChange={handleFotoChange} 
                                            />
                                        </div>
                                        {fotoPreview && (
                                            <div className="col-md-12 mb-3 text-center">
                                                <img 
                                                    src={fotoPreview} 
                                                    alt="Preview" 
                                                    style={{ 
                                                        width: '100px', 
                                                        height: '100px', 
                                                        borderRadius: '50%', 
                                                        objectFit: 'cover' 
                                                    }} 
                                                />
                                            </div>
                                        )}
                                        
                                        {/* Upload de Documentos */}
                                        <div className="col-md-12 mb-3">
                                            <label className="form-label">Documentos</label>
                                            <input 
                                                type="file" 
                                                multiple 
                                                accept=".pdf,.jpg,.jpeg,.png" 
                                                className="form-control" 
                                                onChange={handleDocumentosChange} 
                                            />
                                            <small className="text-muted">
                                                Formatos aceitos: PDF, JPG, JPEG, PNG
                                            </small>
                                        </div>
                                        {documentosPreview.map((doc, i) => (
                                            <div key={i} className="col-md-12 mb-2">
                                                <div className="d-flex gap-2">
                                                    <input 
                                                        type="text" 
                                                        placeholder="Título do documento *" 
                                                        className="form-control" 
                                                        value={titulosDocumentos[i] || ''} 
                                                        onChange={(e) => handleTituloDocumentoChange(i, e.target.value)} 
                                                        required 
                                                    />
                                                    <button 
                                                        type="button" 
                                                        className="btn btn-danger" 
                                                        onClick={() => removerDocumento(i)}
                                                    >
                                                        Remover
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button 
                                        type="button" 
                                        className={`btn ${Style.btnCancelar}`} 
                                        onClick={fecharModalAdicionar}
                                        disabled={salvando}
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        type="submit" 
                                        className={`btn ${Style.btnSubmit}`} 
                                        disabled={salvando}
                                    >
                                        {salvando ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" />
                                                Registrando...
                                            </>
                                        ) : "Registrar"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* ========== MODAL EDITAR FUNCIONÁRIO ========== */}
            {modalEditarAberto && (
                <div className="modal fade show d-block" tabIndex="-1" 
                    style={{ backgroundColor: 'rgba(0,0,0,.5)' }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content">
                            <div className="modal-header" 
                                style={{ backgroundColor: 'var(--azul-escuro)', color: 'var(--dourado)' }}>
                                <h5>
                                    <MdEdit className="me-2" />
                                    Editar {dadosEdicao.nome}
                                </h5>
                                <button 
                                    className="btn-close btn-close-white" 
                                    onClick={() => setModalEditarAberto(false)}
                                    disabled={salvando}
                                />
                            </div>
                            <form onSubmit={salvarEdicao}>
                                <div className="modal-body">
                                    <div className="row">
                                        <div className="col-md-12 mb-3">
                                            <label className="form-label">Nome *</label>
                                            <input 
                                                type="text" 
                                                name="nome" 
                                                className="form-control" 
                                                value={dadosEdicao.nome} 
                                                onChange={(e) => setDadosEdicao({ 
                                                    ...dadosEdicao, 
                                                    nome: e.target.value 
                                                })} 
                                                required 
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Contacto</label>
                                            <input 
                                                type="text" 
                                                name="contacto" 
                                                className="form-control" 
                                                value={dadosEdicao.contacto} 
                                                onChange={(e) => setDadosEdicao({ 
                                                    ...dadosEdicao, 
                                                    contacto: e.target.value 
                                                })} 
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">BI</label>
                                            <input 
                                                type="text" 
                                                name="bi" 
                                                className="form-control" 
                                                value={dadosEdicao.bi} 
                                                onChange={(e) => setDadosEdicao({ 
                                                    ...dadosEdicao, 
                                                    bi: e.target.value 
                                                })} 
                                            />
                                        </div>
                                        <div className="col-md-12 mb-3">
                                            <label className="form-label">Email</label>
                                            <input 
                                                type="email" 
                                                name="email" 
                                                className="form-control" 
                                                value={dadosEdicao.email} 
                                                onChange={(e) => setDadosEdicao({ 
                                                    ...dadosEdicao, 
                                                    email: e.target.value 
                                                })} 
                                            />
                                        </div>
                                        <div className="col-md-12 mb-3">
                                            <label className="form-label">Cargo *</label>
                                            <select 
                                                className="form-control" 
                                                value={dadosEdicao.cargo} 
                                                onChange={(e) => setDadosEdicao({ 
                                                    ...dadosEdicao, 
                                                    cargo: e.target.value 
                                                })} 
                                                required
                                            >
                                                <option value="">Selecione o cargo</option>
                                                {cargos.map(c => (
                                                    <option key={c.id_cargo} value={c.cargo}>
                                                        {c.cargo}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Gerenciamento de Senha no Modal de Edição */}
                                        <div className="col-md-12 mb-3">
                                            <div className="card bg-light">
                                                <div className="card-body">
                                                    <h6 className="mb-3">
                                                        <MdLock className="me-2" />
                                                        Gerenciar Senha
                                                    </h6>
                                                    <button 
                                                        type="button" 
                                                        className="btn btn-warning w-100"
                                                        onClick={() => {
                                                            if (dadosEdicao.id_func) {
                                                                gerarSenhaFuncionario(
                                                                    dadosEdicao.id_func, 
                                                                    dadosEdicao.nome
                                                                );
                                                            }
                                                        }}
                                                        disabled={salvando}
                                                    >
                                                        <MdLock className="me-2" />
                                                        Gerar Nova Senha
                                                    </button>
                                                    <small className="text-muted d-block mt-2">
                                                        Uma nova senha aleatória será gerada e enviada 
                                                        para o email do funcionário
                                                    </small>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Upload de Foto */}
                                        <div className="col-md-12 mb-3">
                                            <label className="form-label">Foto</label>
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                className="form-control" 
                                                onChange={(e) => { 
                                                    const file = e.target.files[0]; 
                                                    if (file) { 
                                                        setFotoArquivo(file); 
                                                        const reader = new FileReader(); 
                                                        reader.onloadend = () => setFotoPreview(reader.result); 
                                                        reader.readAsDataURL(file); 
                                                    } 
                                                }} 
                                            />
                                        </div>
                                        {fotoPreview && (
                                            <div className="col-md-12 mb-3 text-center">
                                                <img 
                                                    src={fotoPreview} 
                                                    alt="Preview" 
                                                    style={{ 
                                                        width: '100px', 
                                                        height: '100px', 
                                                        borderRadius: '50%', 
                                                        objectFit: 'cover' 
                                                    }} 
                                                />
                                            </div>
                                        )}
                                        
                                        {/* Documentos Atuais */}
                                        {documentosExistentes.length > 0 && (
                                            <div className="col-md-12 mb-3">
                                                <h6>Documentos Atuais ({documentosExistentes.length})</h6>
                                                {documentosExistentes.map(doc => (
                                                    <div key={doc.id_doc} 
                                                        className="d-flex justify-content-between align-items-center mb-2 p-2 border rounded">
                                                        <div>
                                                            <strong>{doc.titulo}</strong>
                                                            <br/>
                                                            <small>
                                                                {new Date(doc.data_upload).toLocaleDateString('pt-BR')}
                                                            </small>
                                                        </div>
                                                        <button 
                                                            type="button" 
                                                            className="btn btn-sm btn-danger"
                                                            onClick={() => marcarDocumentoParaRemover(doc.id_doc)}
                                                        >
                                                            Remover
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        
                                        {/* Adicionar Novos Documentos */}
                                        <div className="col-md-12 mb-3">
                                            <h6>Adicionar Novos Documentos</h6>
                                            <input 
                                                type="file" 
                                                multiple 
                                                accept=".pdf,.jpg,.jpeg,.png" 
                                                className="form-control" 
                                                onChange={handleNovosDocumentosChange} 
                                            />
                                            <small className="text-muted">
                                                Formatos aceitos: PDF, JPG, JPEG, PNG
                                            </small>
                                            
                                            {novosDocumentosPreview.map((doc, i) => (
                                                <div key={i} className="d-flex gap-2 mt-2">
                                                    <input 
                                                        type="text" 
                                                        placeholder="Título do documento *" 
                                                        className="form-control" 
                                                        value={novosDocumentosTitulos[i] || ''} 
                                                        onChange={(e) => {
                                                            const novos = [...novosDocumentosTitulos];
                                                            novos[i] = e.target.value;
                                                            setNovosDocumentosTitulos(novos);
                                                        }} 
                                                        required 
                                                    />
                                                    <button 
                                                        type="button" 
                                                        className="btn btn-danger"
                                                        onClick={() => removerNovoDocumento(i)}
                                                    >
                                                        Remover
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button 
                                        type="button" 
                                        className={`btn ${Style.btnCancelar}`} 
                                        onClick={() => setModalEditarAberto(false)}
                                        disabled={salvando}
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        type="submit" 
                                        className={`btn ${Style.btnSubmit}`} 
                                        disabled={salvando}
                                    >
                                        {salvando ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" />
                                                Salvando...
                                            </>
                                        ) : "Salvar"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* ========== MODAL VISUALIZAR FUNCIONÁRIO ========== */}
            {modalVisualizarAberto && funcionarioSelecionado && (
                <div className="modal fade show d-block" tabIndex="-1" 
                    style={{ backgroundColor: 'rgba(0,0,0,.5)' }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content">
                            <div className="modal-header" 
                                style={{ backgroundColor: 'var(--azul-escuro)', color: 'var(--dourado)' }}>
                                <h5>
                                    <MdPerson className="me-2" />
                                    Informações do Funcionário
                                </h5>
                                <button 
                                    className="btn-close btn-close-white" 
                                    onClick={() => setModalVisualizarAberto(false)}
                                />
                            </div>
                            <div className="modal-body">
                                {carregandoDocumentos ? (
                                    <div className="text-center py-5">
                                        <div className="spinner-border text-primary" role="status" />
                                        <p className="mt-2">Carregando informações...</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="row">
                                            <div className="col-md-3 text-center">
                                                {funcionarioSelecionado.foto_url ? (
                                                    <img 
                                                        src={funcionarioSelecionado.foto_url} 
                                                        alt={funcionarioSelecionado.nome}
                                                        style={{ 
                                                            width: '120px', 
                                                            height: '120px', 
                                                            borderRadius: '50%', 
                                                            objectFit: 'cover' 
                                                        }} 
                                                    />
                                                ) : (
                                                    <div style={{ 
                                                        width: '120px', 
                                                        height: '120px', 
                                                        borderRadius: '50%', 
                                                        backgroundColor: '#ccc', 
                                                        margin: 'auto',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}>
                                                        <MdPerson size={48} color="#666" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="col-md-9">
                                                <h3>{funcionarioSelecionado.nome}</h3>
                                                <p><strong>BI:</strong> {funcionarioSelecionado.bi || 'N/I'}</p>
                                                <p><strong>Contacto:</strong> {funcionarioSelecionado.contacto || 'N/I'}</p>
                                                <p><strong>Email:</strong> {funcionarioSelecionado.email || 'N/I'}</p>
                                                <p><strong>Cargo:</strong> {funcionarioSelecionado.cargo || 'N/I'}</p>
                                                <p>
                                                    <strong>Status:</strong> 
                                                    <span className={`badge ${funcionarioSelecionado.status === 'Ativo' ? 'bg-success' : 'bg-danger'} ms-2`}>
                                                        {funcionarioSelecionado.status || 'N/I'}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                        <hr />
                                        <h5>
                                            Documentos ({documentosFuncionario.length})
                                        </h5>
                                        {documentosFuncionario.length === 0 ? (
                                            <p className="text-muted">Nenhum documento anexado</p>
                                        ) : (
                                            documentosFuncionario.map(doc => (
                                                <div key={doc.id_doc} 
                                                    className="d-flex justify-content-between align-items-center mb-2 p-2 border rounded">
                                                    <div>
                                                        <strong>{doc.titulo}</strong>
                                                        <br/>
                                                        <small>
                                                            Enviado em: {new Date(doc.data_upload).toLocaleString('pt-BR')}
                                                        </small>
                                                    </div>
                                                    <a 
                                                        href={doc.doc_url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="btn btn-sm btn-primary"
                                                    >
                                                        <MdVisibility className="me-1" />
                                                        Visualizar
                                                    </a>
                                                </div>
                                            ))
                                        )}
                                    </>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button 
                                    type="button" 
                                    className={`btn ${Style.btnCancelar}`}
                                    onClick={() => setModalVisualizarAberto(false)}
                                >
                                    Fechar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ========== MODAL SENHA GERADA ========== */}
            {modalSenhaGeradaAberto && funcionarioSenhaGerada && (
                <div className="modal fade show d-block" tabIndex="-1" 
                    style={{ backgroundColor: 'rgba(0,0,0,.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header" 
                                style={{ backgroundColor: 'var(--azul-escuro)', color: 'var(--dourado)' }}>
                                <h5>
                                    <MdLock className="me-2" />
                                    Senha Gerada com Sucesso
                                </h5>
                                <button 
                                    className="btn-close btn-close-white" 
                                    onClick={() => setModalSenhaGeradaAberto(false)}
                                />
                            </div>
                            <div className="modal-body text-center py-4">
                                <div className="mb-3">
                                    <div className="display-1 text-success mb-3">✓</div>
                                    <h5>Nova senha gerada para:</h5>
                                    <h4 className="text-primary">{funcionarioSenhaGerada.nome}</h4>
                                </div>
                                
                                <div className="alert alert-info">
                                    <p className="mb-1">
                                        <strong>Senha:</strong>
                                    </p>
                                    <div className="bg-white p-3 rounded border">
                                        <code style={{ 
                                            fontSize: '24px', 
                                            fontWeight: 'bold',
                                            letterSpacing: '2px'
                                        }}>
                                            {senhaGerada}
                                        </code>
                                    </div>
                                </div>
                                
                                <p className="text-muted mt-3">
                                    <MdEmail className="me-2" />
                                    A senha foi enviada para o email do funcionário
                                </p>
                                
                                <div className="alert alert-warning small">
                                    <strong>Atenção:</strong> Guarde esta senha em segurança. 
                                    O funcionário poderá alterá-la após o primeiro login.
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button 
                                    type="button" 
                                    className={`btn ${Style.btnSubmit}`}
                                    onClick={() => {
                                        setModalSenhaGeradaAberto(false);
                                        // Opcional: copiar senha para área de transferência
                                        navigator.clipboard?.writeText(senhaGerada);
                                        showSuccessToast("Copiado!", "Senha copiada para a área de transferência");
                                    }}
                                >
                                    Copiar Senha
                                </button>
                                <button 
                                    type="button" 
                                    className={`btn ${Style.btnCancelar}`}
                                    onClick={() => setModalSenhaGeradaAberto(false)}
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

export default FuncionarioEdit;