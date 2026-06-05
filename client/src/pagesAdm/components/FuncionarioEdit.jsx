import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
<<<<<<< HEAD
    MdEdit, MdDeleteForever, MdRefresh, MdSearch, MdAdd, MdPerson, MdPhone,
    MdLock, MdPhotoCamera, MdEmail, MdAttachFile, MdVisibility
=======
    MdEdit, 
    MdDeleteForever, 
    MdRefresh, 
    MdSearch,
    MdAdd,
    MdPerson,
    MdPhone,
    MdLock
>>>>>>> eliseu_front2.0
} from "react-icons/md";
import { FaIdCard, FaUserTie } from "react-icons/fa";
import { IoMdPersonAdd } from "react-icons/io";
import { showSuccessToast, showErrorToast, useConfirmToast } from "../../components/global/CustomToast";
import Style from "./DepartamentosEdit.module.css";
<<<<<<< HEAD
import Api from "../../service/api";
import Table from '../../components/global/Table';
=======
import Api from "../../service/api"
import Table from '../../components/global/Table'; 
>>>>>>> eliseu_front2.0

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
<<<<<<< HEAD
    const [modalVisualizarAberto, setModalVisualizarAberto] = useState(false);
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
    
    const [dadosNovoFuncionario, setDadosNovoFuncionario] = useState({
        nome: "", contacto: "", bi: "", cargo: "", email: "", idAdm: ""
    });
    
    const [dadosEdicao, setDadosEdicao] = useState({
        id_func: '', nome: '', contacto: '', bi: '', cargo: '', idAdm: '', email: '', foto: null
    });

    const [dadosSenha, setDadosSenha] = useState({
        id_func: '', nome: '', nova_senha: '', confirmar_senha: ''
=======
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
>>>>>>> eliseu_front2.0
    });

    const [user, setUser] = useState(null);
    const { showConfirmToast, isConfirming } = useConfirmToast();

    useEffect(() => {
        const usuarioSalvo = localStorage.getItem("usuarioLogado");
<<<<<<< HEAD
        if (usuarioSalvo) setUser(JSON.parse(usuarioSalvo));
    }, []);

    useEffect(() => {
        Api.get(`/cargosDisponiveis`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        }).then(response => setCargos(response.data || [])).catch(console.error);
=======
        if (usuarioSalvo) {
            setUser(JSON.parse(usuarioSalvo));
        }
    }, []);

    useEffect(() => {
        Api.get(`/cargosDisponiveis`)
            .then(response => {
                setCargos(response.data || []);
            })
            .catch(error => {
                console.error("Erro ao buscar cargos:", error);
            });
>>>>>>> eliseu_front2.0
    }, []);

    const apiClient = useMemo(() => {
        const client = Api.create({
            timeout: API_TIMEOUT,
<<<<<<< HEAD
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        client.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("usuarioLogado");
                    window.location.href = "/";
=======
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
>>>>>>> eliseu_front2.0
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
<<<<<<< HEAD
            const dados = response.data.map(func => ({
                id_func: func.id_func, nome: func.nome, contacto: func.contacto,
                bi: func.bi, email: func.email, cargo: func.cargo, status: func.status,
                foto: func.foto, foto_url: func.foto_url
            }));
            setLista(dados);
            setListaFiltrada(dados);
            setUltimaAtualizacao(new Date().toLocaleTimeString('pt-BR'));
            if (mostrarNotificacao && dados.length > 0) {
                showSuccessToast("Sucesso", "Dados atualizados", { "Quantidade": `${dados.length} funcionário(s)` });
            }
=======
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
>>>>>>> eliseu_front2.0
        } catch (error) {
            console.error("Erro ao buscar funcionários:", error);
        } finally {
            setLoading(false);
        }
    }, [apiClient]);

<<<<<<< HEAD
=======
    const handlePesquisa = useCallback((e) => {
        const termo = e.target.value;
        setTermoPesquisa(termo);
    }, []);

    const limparPesquisa = useCallback(() => {
        setTermoPesquisa('');
        setListaFiltrada(lista);
    }, [lista]);

>>>>>>> eliseu_front2.0
    useEffect(() => {
        if (termoPesquisa.trim() === '') {
            setListaFiltrada(lista);
        } else {
            const filtrados = lista.filter(item => 
<<<<<<< HEAD
                item.nome?.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
                item.bi?.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
                item.contacto?.includes(termoPesquisa) ||
                item.email?.toLowerCase().includes(termoPesquisa.toLowerCase())
=======
                item.nome_funcionario?.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
                (item.bi_funcionario && item.bi_funcionario.toLowerCase().includes(termoPesquisa.toLowerCase())) ||
                (item.contacto_funcionario && item.contacto_funcionario.includes(termoPesquisa))
>>>>>>> eliseu_front2.0
            );
            setListaFiltrada(filtrados);
        }
    }, [lista, termoPesquisa]);

    const abrirModalAdicionar = useCallback(() => {
<<<<<<< HEAD
        setDadosNovoFuncionario({ nome: "", contacto: "", bi: "", cargo: "", email: "", idAdm: user?.id || "" });
        setFotoPreview(null);
        setFotoArquivo(null);
        setDocumentos([]);
        setDocumentosPreview([]);
        setTitulosDocumentos([]);
=======
        setDadosNovoFuncionario({
            nome_funcionario: "",
            contacto_funcionario: "",
            bi_funcionario: "",
            cargo_funcionario: "",
            idAdm: user?.id || ""
        });
>>>>>>> eliseu_front2.0
        setModalAdicionarAberto(true);
    }, [user]);

    const fecharModalAdicionar = useCallback(() => {
        if (!salvando) {
            setModalAdicionarAberto(false);
<<<<<<< HEAD
            setDadosNovoFuncionario({ nome: "", contacto: "", bi: "", cargo: "", email: "", idAdm: "" });
            setFotoPreview(null);
            setFotoArquivo(null);
            setDocumentos([]);
            setDocumentosPreview([]);
            setTitulosDocumentos([]);
        }
    }, [salvando]);

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
        setTitulosDocumentos(prev => { const novos = [...prev]; novos[index] = titulo; return novos; });
    }, []);

    const removerDocumento = useCallback((index) => {
        setDocumentos(prev => prev.filter((_, i) => i !== index));
        setDocumentosPreview(prev => prev.filter((_, i) => i !== index));
        setTitulosDocumentos(prev => prev.filter((_, i) => i !== index));
    }, []);

    const adicionarFuncionario = useCallback(async (e) => {
        e.preventDefault();
        if (!dadosNovoFuncionario.nome?.trim()) return showErrorToast("Validação", "Preencha o nome");
        
        setSalvando(true);
        try {
            const formData = new FormData();
            Object.entries(dadosNovoFuncionario).forEach(([key, value]) => formData.append(key, value));
            if (fotoArquivo) formData.append('foto', fotoArquivo);
            documentos.forEach((doc, i) => {
                formData.append('documentos', doc);
                formData.append('documentos_titulo', titulosDocumentos[i] || doc.name);
            });

            const response = await Api.post(`/registrarfuncionario`, formData, {
                headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${localStorage.getItem("token")}` }
            });

            if (response.data.sucesso) {
                showSuccessToast("Sucesso", response.data.mensagem);
                await fetchFuncionarios(false);
                fecharModalAdicionar();
            }
        } catch (error) {
            showErrorToast("Erro", "Não foi possível registrar");
        } finally {
            setSalvando(false);
        }
    }, [dadosNovoFuncionario, fotoArquivo, documentos, titulosDocumentos, fetchFuncionarios, fecharModalAdicionar]);

    const abrirModalVisualizar = useCallback(async (funcionario) => {
        try {
            setCarregandoDocumentos(true);
            setFuncionarioSelecionado(funcionario);
            const [infoRes, docsRes] = await Promise.all([
                apiClient.get(`/funcionario/info/${funcionario.id_func}`),
                apiClient.get(`/funcionario/documentos/${funcionario.id_func}`)
            ]);
            if (infoRes.data.success) setFuncionarioSelecionado(prev => ({ ...prev, ...infoRes.data.funcionario }));
            if (docsRes.data.success) setDocumentosFuncionario(docsRes.data.documentos);
            setModalVisualizarAberto(true);
        } catch (error) {
            showErrorToast("Erro", "Não foi possível carregar os dados");
        } finally {
            setCarregandoDocumentos(false);
        }
    }, [apiClient]);

    const abrirModalEditar = useCallback(async (funcionario) => {
        try {
            setCarregandoDocumentos(true);
            setDadosEdicao({
                id_func: funcionario.id_func, nome: funcionario.nome || '', contacto: funcionario.contacto || '',
                bi: funcionario.bi || '', email: funcionario.email || '', cargo: funcionario.cargo || '',
                idAdm: user?.id || '', foto: funcionario.foto
            });
            setFotoPreview(funcionario.foto_url);
            setFotoArquivo(null);
            
            const docsRes = await apiClient.get(`/funcionario/documentos/${funcionario.id_func}`);
            if (docsRes.data.success) setDocumentosExistentes(docsRes.data.documentos);
            
            setDocumentosParaRemover([]);
            setNovosDocumentos([]);
            setNovosDocumentosPreview([]);
            setNovosDocumentosTitulos([]);
            setModalEditarAberto(true);
        } catch (error) {
            showErrorToast("Erro", "Não foi possível carregar os dados");
        } finally {
            setCarregandoDocumentos(false);
        }
    }, [user, apiClient]);

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

    const salvarEdicao = useCallback(async (e) => {
        e.preventDefault();
        if (!dadosEdicao.nome?.trim()) return showErrorToast("Validação", "Preencha o nome");
        
        setSalvando(true);
        try {
            const formData = new FormData();
            formData.append('nome', dadosEdicao.nome);
            formData.append('contacto', dadosEdicao.contacto);
            formData.append('bi', dadosEdicao.bi);
            formData.append('cargo', dadosEdicao.cargo);
            formData.append('idAdm', user?.id || '');
            if (fotoArquivo) formData.append('foto', fotoArquivo);
            
            documentosParaRemover.forEach(docId => formData.append('documentos_remover', docId));
            novosDocumentos.forEach((doc, i) => {
                formData.append('documentos', doc);
                formData.append('documentos_titulo', novosDocumentosTitulos[i] || doc.name);
            });

            const response = await Api.put(`/funcionario/${dadosEdicao.id_func}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${localStorage.getItem("token")}` }
            });

            if (response.data.success) {
                showSuccessToast("Sucesso", response.data.message);
                await fetchFuncionarios(false);
                setModalEditarAberto(false);
            }
        } catch (error) {
            showErrorToast("Erro", "Não foi possível atualizar");
        } finally {
            setSalvando(false);
        }
    }, [dadosEdicao, user, fotoArquivo, documentosParaRemover, novosDocumentos, novosDocumentosTitulos, fetchFuncionarios]);

    const abrirModalSenha = useCallback((funcionario) => {
        setDadosSenha({ id_func: funcionario.id_func, nome: funcionario.nome, nova_senha: '', confirmar_senha: '' });
        setModalSenhaAberto(true);
    }, []);

    const salvarNovaSenha = useCallback(async (e) => {
        e.preventDefault();
        if (dadosSenha.nova_senha !== dadosSenha.confirmar_senha) return showErrorToast("Validação", "Senhas não coincidem");
        if (dadosSenha.nova_senha.length < 4) return showErrorToast("Validação", "Mínimo 4 caracteres");
        
        setSalvando(true);
        try {
            const response = await apiClient.put(`/funcionario/senha/${dadosSenha.id_func}`, { senha_funcionario: dadosSenha.nova_senha });
            if (response.data.success) {
                showSuccessToast("Sucesso", response.data.message);
                setModalSenhaAberto(false);
            }
        } catch (error) {
            showErrorToast("Erro", "Não foi possível alterar a senha");
        } finally {
            setSalvando(false);
        }
    }, [dadosSenha, apiClient]);

    const desativarFuncionario = useCallback((id, nome) => {
        showConfirmToast(`Desativar ${nome}?`, async () => {
            const response = await Api.put(`/funcionario/desativar/${id}`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            if (response.status === 200) {
                await fetchFuncionarios(false);
                showSuccessToast(`Funcionário ${nome} desativado`);
            }
        }, null, "Confirmar Desativação");
    }, [showConfirmToast, fetchFuncionarios]);

    useEffect(() => { fetchFuncionarios(false); }, [fetchFuncionarios]);

    const headers = ['Foto', 'Nome', 'Contacto', 'BI', 'Email', 'Cargo', 'Senha', 'Editar', 'Desativar'];

    const renderRow = useCallback((item) => (
        <tr key={item.id_func}>
            <td className="align-middle text-center" style={{ cursor: 'pointer' }} onClick={() => abrirModalVisualizar(item)}>
                {item.foto_url ? (
                    <img src={item.foto_url} alt={item.nome} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <MdPerson size={20} color="#999" />
                    </div>
                )}
            </td>
            <td className="align-middle fw-semibold" style={{ color: 'var(--azul-escuro)' }}><MdPerson className="me-2 mb-1"/>{item.nome}</td>
            <td className="align-middle"><MdPhone className="me-2 mb-1" style={{ color: 'var(--azul-escuro)' }}/>{item.contacto || 'N/I'}</td>
            <td className="align-middle"><FaIdCard className="me-2 mb-1" style={{ color: 'var(--azul-escuro)' }}/>{item.bi || 'N/I'}</td>
            <td className="align-middle"><MdEmail className="me-2 mb-1" style={{ color: 'var(--azul-escuro)' }}/>{item.email || 'N/I'}</td>
            <td className="align-middle"><span className="badge bg-primary">{item.cargo || 'N/I'}</span></td>
            <td className="text-center">
                <button className={`btn btn-sm ${Style.btnOutros}`} onClick={() => abrirModalSenha(item)} disabled={loading || salvando || isConfirming}><MdLock /></button>
            </td>
            <td className="text-center">
                <button className={`btn btn-sm ${Style.btnEditar}`} onClick={() => abrirModalEditar(item)} disabled={loading || salvando || isConfirming}><MdEdit /></button>
            </td>
            <td className="text-center">
                <button className={`btn btn-sm ${Style.btnDeletar}`} onClick={() => desativarFuncionario(item.id_func, item.nome)} disabled={loading || salvando || isConfirming}><MdDeleteForever /></button>
            </td>
        </tr>
    ), [loading, salvando, isConfirming, abrirModalVisualizar, abrirModalSenha, abrirModalEditar, desativarFuncionario]);
=======
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
            const response = await Api.post(`/registrarfuncionario`, {
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
            const response = await apiClient.put(`/funcionario/${dadosEdicao.id_funcionario}`, {
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
            const response = await apiClient.put(`/funcionario/senha/${dadosSenha.id_funcionario}`, {
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

    const desativarFuncionario = useCallback((id, nome) => {
        showConfirmToast(
            `Tens a certeza que pretendes desativar o funcionário ${nome}?`,
            async () => {
                try {
                    const response = await Api.put(`/funcionario/desativar/${id}`);
                    
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

    const headers = ['Nome', 'Contacto', 'BI', 'Cargo', 'Senha', 'Editar', 'Desativar'];

    const renderRow = useCallback((item) => (
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
>>>>>>> eliseu_front2.0

    return (
        <div className="row mb-4">
            <div className="col-12">
                <div className="d-flex justify-content-between align-items-center mb-3">
<<<<<<< HEAD
                    <h2 className="h4 mb-0" style={{ color: 'var(--azul-escuro)' }}><FaUserTie className="me-2 mb-2"/>Funcionários</h2>
                    <div className="d-flex gap-2">
                        {ultimaAtualizacao && <small className="text-muted align-self-end">Atualizado: {ultimaAtualizacao}</small>}
                        <button className={`btn btn-sm ${Style.AtulizarDepartamento}`} onClick={() => fetchFuncionarios(true)} disabled={loading || isConfirming}><MdRefresh /></button>
                        <button className={`btn btn-sm ${Style.btnSubmit}`} onClick={abrirModalAdicionar} disabled={loading || salvando || isConfirming}><MdAdd className="me-1" />Novo Funcionário</button>
=======
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
>>>>>>> eliseu_front2.0
                    </div>
                </div>

                <div className="row mb-4">
                    <div className="col-md-8 mx-auto">
                        <div className="card shadow-sm border-0">
                            <div className="card-body p-3">
<<<<<<< HEAD
                                <div className="input-group">
                                    <span className="input-group-text border-end-0" style={{ backgroundColor: 'var(--cinza-claro)' }}><MdSearch size={20} /></span>
                                    <input type="text" className="form-control border-start-0 ps-0" placeholder="Pesquisar..." value={termoPesquisa} onChange={(e) => setTermoPesquisa(e.target.value)} style={{ borderLeft: 'none', boxShadow: 'none', backgroundColor: 'var(--cinza-claro)', padding: '10px' }}/>
                                    {termoPesquisa && <button className="btn border-start-0" onClick={() => setTermoPesquisa('')} style={{ backgroundColor: 'var(--danger)', color: 'var(--branco)' }}>✕</button>}
                                </div>
=======
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
>>>>>>> eliseu_front2.0
                            </div>
                        </div>
                    </div>
                </div>

<<<<<<< HEAD
                {loading ? (
                    <div className="text-center py-5"><div className="spinner-border text-primary" role="status"></div><p>Carregando...</p></div>
                ) : listaFiltrada.length === 0 ? (
                    <div className="text-center py-5"><p>Nenhum funcionário encontrado</p></div>
                ) : (
                    <div className="table-responsive"><Table headers={headers} data={listaFiltrada} renderRow={renderRow} className="table table-hover table-striped border" /></div>
                )}
            </div>

            {/* Modal Adicionar - simplificado */}
            {modalAdicionarAberto && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,.5)' }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content">
                            <div className="modal-header" style={{ backgroundColor: 'var(--azul-escuro)', color: 'var(--dourado)' }}>
                                <h5><IoMdPersonAdd className="me-2" />Registrar Funcionário</h5>
                                <button className="btn-close btn-close-white" onClick={fecharModalAdicionar} />
                            </div>
                            <form onSubmit={adicionarFuncionario}>
                                <div className="modal-body">
                                    <div className="row">
                                        <div className="col-md-12 mb-3"><input type="text" name="nome" placeholder="Nome" className="form-control" value={dadosNovoFuncionario.nome} onChange={(e) => setDadosNovoFuncionario({ ...dadosNovoFuncionario, nome: e.target.value })} required /></div>
                                        <div className="col-md-6 mb-3"><input type="text" name="contacto" placeholder="Contacto" className="form-control" value={dadosNovoFuncionario.contacto} onChange={(e) => setDadosNovoFuncionario({ ...dadosNovoFuncionario, contacto: e.target.value })} required /></div>
                                        <div className="col-md-6 mb-3"><input type="text" name="bi" placeholder="BI" className="form-control" value={dadosNovoFuncionario.bi} onChange={(e) => setDadosNovoFuncionario({ ...dadosNovoFuncionario, bi: e.target.value })} required /></div>
                                        <div className="col-md-12 mb-3"><input type="email" name="email" placeholder="Email" className="form-control" value={dadosNovoFuncionario.email} onChange={(e) => setDadosNovoFuncionario({ ...dadosNovoFuncionario, email: e.target.value })} required /></div>
                                        <div className="col-md-12 mb-3">
                                            <select className="form-control" value={dadosNovoFuncionario.cargo} onChange={(e) => setDadosNovoFuncionario({ ...dadosNovoFuncionario, cargo: e.target.value })} required>
                                                <option value="">Selecione o cargo</option>
                                                {cargos.map(c => <option key={c.id_cargo} value={c.cargo}>{c.cargo}</option>)}
                                            </select>
                                        </div>
                                        <div className="col-md-12 mb-3"><input type="file" accept="image/*" className="form-control" onChange={handleFotoChange} /></div>
                                        {fotoPreview && <div className="col-md-12 mb-3 text-center"><img src={fotoPreview} alt="Preview" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }} /></div>}
                                        <div className="col-md-12 mb-3"><input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" className="form-control" onChange={handleDocumentosChange} /></div>
                                        {documentosPreview.map((doc, i) => (
                                            <div key={i} className="col-md-12 mb-2">
                                                <div className="d-flex gap-2">
                                                    <input type="text" placeholder="Título do documento" className="form-control" value={titulosDocumentos[i] || ''} onChange={(e) => handleTituloDocumentoChange(i, e.target.value)} required />
                                                    <button type="button" className="btn btn-danger" onClick={() => removerDocumento(i)}>Remover</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className={`btn ${Style.btnCancelar}`} onClick={fecharModalAdicionar}>Cancelar</button>
                                    <button type="submit" className={`btn ${Style.btnSubmit}`} disabled={salvando}>{salvando ? "Registrando..." : "Registrar"}</button>
=======
                {renderConteudo()}
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
>>>>>>> eliseu_front2.0
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

<<<<<<< HEAD
            {/* Modal Editar - simplificado */}
            {modalEditarAberto && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,.5)' }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content">
                            <div className="modal-header" style={{ backgroundColor: 'var(--azul-escuro)', color: 'var(--dourado)' }}>
                                <h5><MdEdit className="me-2" />Editar {dadosEdicao.nome}</h5>
                                <button className="btn-close btn-close-white" onClick={() => setModalEditarAberto(false)} />
                            </div>
                            <form onSubmit={salvarEdicao}>
                                <div className="modal-body">
                                    <div className="row">
                                        <div className="col-md-12 mb-3"><input type="text" name="nome" className="form-control" value={dadosEdicao.nome} onChange={(e) => setDadosEdicao({ ...dadosEdicao, nome: e.target.value })} required /></div>
                                        <div className="col-md-6 mb-3"><input type="text" name="contacto" className="form-control" value={dadosEdicao.contacto} onChange={(e) => setDadosEdicao({ ...dadosEdicao, contacto: e.target.value })} /></div>
                                        <div className="col-md-6 mb-3"><input type="text" name="bi" className="form-control" value={dadosEdicao.bi} onChange={(e) => setDadosEdicao({ ...dadosEdicao, bi: e.target.value })} /></div>
                                        <div className="col-md-12 mb-3"><input type="email" name="email" className="form-control" value={dadosEdicao.email} onChange={(e) => setDadosEdicao({ ...dadosEdicao, email: e.target.value })} /></div>
                                        <div className="col-md-12 mb-3">
                                            <select className="form-control" value={dadosEdicao.cargo} onChange={(e) => setDadosEdicao({ ...dadosEdicao, cargo: e.target.value })} required>
                                                <option value="">Selecione o cargo</option>
                                                {cargos.map(c => <option key={c.id_cargo} value={c.cargo}>{c.cargo}</option>)}
                                            </select>
                                        </div>
                                        <div className="col-md-12 mb-3"><input type="file" accept="image/*" className="form-control" onChange={(e) => { const file = e.target.files[0]; if (file) { setFotoArquivo(file); const reader = new FileReader(); reader.onloadend = () => setFotoPreview(reader.result); reader.readAsDataURL(file); } }} /></div>
                                        {fotoPreview && <div className="col-md-12 mb-3 text-center"><img src={fotoPreview} alt="Preview" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }} /></div>}
                                        
                                        <div className="col-md-12 mb-3"><h6>Documentos Atuais</h6>
                                            {documentosExistentes.map(doc => (
                                                <div key={doc.id_doc} className="d-flex justify-content-between align-items-center mb-2 p-2 border rounded">
                                                    <div><strong>{doc.titulo}</strong><br/><small>{new Date(doc.data_upload).toLocaleDateString()}</small></div>
                                                    <button type="button" className="btn btn-sm btn-danger" onClick={() => marcarDocumentoParaRemover(doc.id_doc)}>Remover</button>
                                                </div>
                                            ))}
                                        </div>
                                        
                                        <div className="col-md-12 mb-3"><h6>Adicionar Novos Documentos</h6>
                                            <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" className="form-control" onChange={handleNovosDocumentosChange} />
                                            {novosDocumentosPreview.map((doc, i) => (
                                                <div key={i} className="d-flex gap-2 mt-2"><input type="text" placeholder="Título" className="form-control" value={novosDocumentosTitulos[i] || ''} onChange={(e) => { const novos = [...novosDocumentosTitulos]; novos[i] = e.target.value; setNovosDocumentosTitulos(novos); }} /><button type="button" className="btn btn-danger" onClick={() => removerNovoDocumento(i)}>Remover</button></div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className={`btn ${Style.btnCancelar}`} onClick={() => setModalEditarAberto(false)}>Cancelar</button>
                                    <button type="submit" className={`btn ${Style.btnSubmit}`} disabled={salvando}>{salvando ? "Salvando..." : "Salvar"}</button>
=======
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
>>>>>>> eliseu_front2.0
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

<<<<<<< HEAD
            {/* Modal Senha */}
            {modalSenhaAberto && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header" style={{ backgroundColor: 'var(--azul-escuro)', color: 'var(--dourado)' }}><h5><MdLock /> Alterar Senha - {dadosSenha.nome}</h5><button className="btn-close btn-close-white" onClick={() => setModalSenhaAberto(false)} /></div>
                            <form onSubmit={salvarNovaSenha}>
                                <div className="modal-body">
                                    <input type="password" name="nova_senha" className="form-control mb-3" placeholder="Nova senha" value={dadosSenha.nova_senha} onChange={(e) => setDadosSenha({ ...dadosSenha, nova_senha: e.target.value })} required />
                                    <input type="password" name="confirmar_senha" className="form-control" placeholder="Confirmar senha" value={dadosSenha.confirmar_senha} onChange={(e) => setDadosSenha({ ...dadosSenha, confirmar_senha: e.target.value })} required />
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className={`btn ${Style.btnCancelar}`} onClick={() => setModalSenhaAberto(false)}>Cancelar</button>
                                    <button type="submit" className={`btn ${Style.btnSubmit}`} disabled={salvando}>{salvando ? "Alterando..." : "Alterar"}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Visualizar */}
            {modalVisualizarAberto && funcionarioSelecionado && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,.5)' }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content">
                            <div className="modal-header" style={{ backgroundColor: 'var(--azul-escuro)', color: 'var(--dourado)' }}><h5><MdPerson /> Informações do Funcionário</h5><button className="btn-close btn-close-white" onClick={() => setModalVisualizarAberto(false)} /></div>
                            <div className="modal-body">
                                {carregandoDocumentos ? <div className="text-center">Carregando...</div> : (
                                    <>
                                        <div className="row">
                                            <div className="col-md-3 text-center">
                                                {funcionarioSelecionado.foto_url ? <img src={funcionarioSelecionado.foto_url} style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover' }} /> : <div style={{ width: '120px', height: '120px', borderRadius: '50%', backgroundColor: '#ccc', margin: 'auto' }} />}
                                            </div>
                                            <div className="col-md-9">
                                                <h3>{funcionarioSelecionado.nome}</h3>
                                                <p><strong>BI:</strong> {funcionarioSelecionado.bi}</p>
                                                <p><strong>Contacto:</strong> {funcionarioSelecionado.contacto}</p>
                                                <p><strong>Email:</strong> {funcionarioSelecionado.email}</p>
                                                <p><strong>Cargo:</strong> {funcionarioSelecionado.cargo}</p>
                                                <p><strong>Status:</strong> <span className={`badge ${funcionarioSelecionado.status === 'Ativo' ? 'bg-success' : 'bg-danger'}`}>{funcionarioSelecionado.status}</span></p>
                                            </div>
                                        </div>
                                        <hr />
                                        <h5>Documentos ({documentosFuncionario.length})</h5>
                                        {documentosFuncionario.map(doc => (
                                            <div key={doc.id_doc} className="d-flex justify-content-between align-items-center mb-2 p-2 border rounded">
                                                <div><strong>{doc.titulo}</strong><br/><small>{new Date(doc.data_upload).toLocaleString()}</small></div>
                                                <a href={doc.doc_url} target="_blank" className="btn btn-sm btn-primary">Visualizar</a>
                                            </div>
                                        ))}
                                    </>
                                )}
                            </div>
=======
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
>>>>>>> eliseu_front2.0
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default FuncionarioEdit;