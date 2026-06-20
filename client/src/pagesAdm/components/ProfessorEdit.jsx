import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
    MdEdit, MdDeleteForever, MdRefresh, MdSearch, MdAdd, MdPerson, MdPhone,
    MdLock, MdPhotoCamera, MdEmail, MdAttachFile, MdVisibility,
    MdCalendarToday, MdBloodtype, MdSchool, MdRemoveRedEye, MdClose,
    MdCheckCircle, MdCancel, MdInfo, MdFileUpload, MdClear, MdContentCopy
} from "react-icons/md";
import { FaIdCard, FaChalkboardTeacher, FaUniversity, FaFileContract, FaWhatsapp } from "react-icons/fa";
import { IoMdPersonAdd } from "react-icons/io";
import { showSuccessToast, showErrorToast, useConfirmToast } from "../../components/global/CustomToast";
import Style from "./DepartamentosEdit.module.css";
import Api from "../../service/api";
import Table from '../../components/global/Table';

const API_TIMEOUT = 30000;

function ProfessorEdit() {
    const [lista, setLista] = useState([]);
    const [listaFiltrada, setListaFiltrada] = useState([]);
    const [termoPesquisa, setTermoPesquisa] = useState('');
    const [loading, setLoading] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null);
    const [modalAdicionarAberto, setModalAdicionarAberto] = useState(false);
    const [modalEditarAberto, setModalEditarAberto] = useState(false);
    const [modalVisualizarAberto, setModalVisualizarAberto] = useState(false);
    const [modalSenhaGeradaAberto, setModalSenhaGeradaAberto] = useState(false);
    const [contratos, setContratos] = useState([]);
    const [fotoPreview, setFotoPreview] = useState(null);
    const [fotoArquivo, setFotoArquivo] = useState(null);
    const [documentos, setDocumentos] = useState([]);
    const [documentosPreview, setDocumentosPreview] = useState([]);
    const [titulosDocumentos, setTitulosDocumentos] = useState([]);
    const [professorSelecionado, setProfessorSelecionado] = useState(null);
    const [documentosProfessor, setDocumentosProfessor] = useState([]);
    const [carregandoDocumentos, setCarregandoDocumentos] = useState(false);
    const [documentosExistentes, setDocumentosExistentes] = useState([]);
    const [documentosParaRemover, setDocumentosParaRemover] = useState([]);
    const [novosDocumentos, setNovosDocumentos] = useState([]);
    const [novosDocumentosPreview, setNovosDocumentosPreview] = useState([]);
    const [novosDocumentosTitulos, setNovosDocumentosTitulos] = useState([]);
    const [abaAtiva, setAbaAtiva] = useState('dados');
    
    // Estado para a senha gerada
    const [senhaGerada, setSenhaGerada] = useState('');
    const [professorSenhaGerada, setProfessorSenhaGerada] = useState(null);
    
    const [dadosNovoProfessor, setDadosNovoProfessor] = useState({
        nome: "", genero: "", nacionalidade: "", nomepai: "", nomemae: "", 
        contacto: "", whatsapp: "", bi: "", email: "", contactoemergencia: "",
        anoexperienca: "", titulacao: "", iban: "", tiposangue: "",
        data_nascimento: "", data_admissao: "", estadocivil: "", id_contrato: "", id_user: ""
    });
    
    const [dadosEdicao, setDadosEdicao] = useState({
        id_professor: '', nome: '', genero: '', nacionalidade: '', nomepai: '', nomemae: '',
        contacto: '', whatsapp: '', bi: '', email: '', contactoemergencia: '',
        anoexperienca: '', titulacao: '', iban: '', tiposangue: '',
        data_nascimento: '', data_admissao: '', estadocivil: '', id_contrato: '', foto: null
    });

    const [user, setUser] = useState(null);
    const { showConfirmToast, isConfirming } = useConfirmToast();

    useEffect(() => {
        const usuarioSalvo = localStorage.getItem("usuarioLogado");
        if (usuarioSalvo) setUser(JSON.parse(usuarioSalvo));
    }, []);

    const apiClient = useMemo(() => {
        const client = Api.create({
            timeout: API_TIMEOUT,
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem("token")}` }
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

    const fetchContratos = useCallback(async () => {
        try {
            const response = await apiClient.get('/contratos');
            setContratos(response.data || []);
        } catch (error) {
            console.error("Erro ao buscar contratos:", error);
        }
    }, [apiClient]);

    const fetchProfessores = useCallback(async (mostrarNotificacao = false) => {
        try {
            setLoading(true);
            const response = await apiClient.get('/professores');
            const dados = response.data.map(prof => ({
                id_professor: prof.id_professor, 
                nome: prof.nome, 
                genero: prof.genero,
                nacionalidade: prof.nacionalidade, 
                nomepai: prof.nomepai, 
                nomemae: prof.nomemae,
                bi: prof.bi, 
                contacto: prof.contacto, 
                whatsapp: prof.whatsapp, 
                email: prof.email,
                contactoemergencia: prof.contactoemergencia, 
                anoexperienca: prof.anoexperienca,
                titulacao: prof.titulacao, 
                iban: prof.iban, 
                tiposangue: prof.tiposangue,
                codigo: prof.codigo, 
                status: prof.status, 
                data_nascimento: prof.data_nascimento,
                data_admissao: prof.data_admissao, 
                estadocivil: prof.estadocivil,
                foto: prof.foto, 
                fotoUrl: prof.fotoUrl, 
                id_contrato: prof.id_contrato,
                contrato: prof.contrato
            }));
            setLista(dados);
            setListaFiltrada(dados);
            setUltimaAtualizacao(new Date().toLocaleTimeString('pt-BR'));
            if (mostrarNotificacao && dados.length > 0) {
                showSuccessToast("Sucesso", `${dados.length} professores carregados`);
            }
        } catch (error) {
            console.error("Erro ao buscar professores:", error);
            showErrorToast("Erro", "Não foi possível carregar os professores");
        } finally {
            setLoading(false);
        }
    }, [apiClient]);

    // ========== FUNÇÃO PARA GERAR SENHA AUTOMATICAMENTE ==========
    const gerarSenhaProfessor = useCallback(async (id, nome) => {
        showConfirmToast(
            `Gerar nova senha para o professor ${nome}?`,
            async () => {
                try {
                    const response = await Api.put(
                        `/professor/senha/${id}`,
                        {},
                        {
                            headers: { 
                                Authorization: `Bearer ${localStorage.getItem("token")}`
                            }
                        }
                    );
                    
                    if (response.data.success) {
                        setSenhaGerada(response.data.senha_gerada || '');
                        setProfessorSenhaGerada({ id, nome });
                        setModalSenhaGeradaAberto(true);
                        
                        showSuccessToast(
                            "Senha Gerada com Sucesso", 
                            `Nova senha para ${nome} foi gerada e enviada por email`
                        );
                        
                        await fetchProfessores(false);
                    }
                } catch (error) {
                    console.error("Erro ao gerar senha:", error);
                    if (error.response?.status === 404) {
                        showErrorToast("Erro", "Rota não encontrada. Verifique a URL da API.");
                    } else if (error.response?.status === 401) {
                        showErrorToast("Erro", "Sessão expirada. Faça login novamente.");
                    } else {
                        showErrorToast("Erro", error.response?.data?.error || "Não foi possível gerar a nova senha");
                    }
                }
            },
            null,
            "Confirmar Geração de Senha"
        );
    }, [showConfirmToast, fetchProfessores]);

    useEffect(() => {
        fetchProfessores(false);
        fetchContratos();
    }, [fetchProfessores, fetchContratos]);

    useEffect(() => {
        if (termoPesquisa.trim() === '') {
            setListaFiltrada(lista);
        } else {
            const filtrados = lista.filter(item => 
                item.nome?.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
                item.bi?.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
                item.contacto?.includes(termoPesquisa) ||
                item.email?.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
                item.codigo?.toLowerCase().includes(termoPesquisa.toLowerCase())
            );
            setListaFiltrada(filtrados);
        }
    }, [lista, termoPesquisa]);

    const abrirModalAdicionar = useCallback(() => {
        setDadosNovoProfessor({ 
            nome: "", genero: "", nacionalidade: "", nomepai: "", nomemae: "", 
            contacto: "", whatsapp: "", bi: "", email: "", contactoemergencia: "",
            anoexperienca: "", titulacao: "", iban: "", tiposangue: "",
            data_nascimento: "", data_admissao: "", estadocivil: "", id_contrato: "", 
            id_user: user?.id || "" 
        });
        setFotoPreview(null);
        setFotoArquivo(null);
        setDocumentos([]);
        setDocumentosPreview([]);
        setTitulosDocumentos([]);
        setAbaAtiva('dados');
        setModalAdicionarAberto(true);
    }, [user]);

    const fecharModalAdicionar = useCallback(() => {
        if (!salvando) {
            setModalAdicionarAberto(false);
            setDadosNovoProfessor({ 
                nome: "", genero: "", nacionalidade: "", nomepai: "", nomemae: "", 
                contacto: "", whatsapp: "", bi: "", email: "", contactoemergencia: "",
                anoexperienca: "", titulacao: "", iban: "", tiposangue: "",
                data_nascimento: "", data_admissao: "", estadocivil: "", id_contrato: "", id_user: "" 
            });
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
            if (file.size > 5 * 1024 * 1024) {
                showErrorToast("Erro", "A foto não pode exceder 5MB");
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
        const novosDocs = [], novosPreviews = [], novoTitulos = [];
        for (const file of files) {
            if (file.size > 10 * 1024 * 1024) {
                showErrorToast("Erro", `O documento ${file.name} excede 10MB`);
                continue;
            }
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

    const copiarCodigo = useCallback((codigo) => {
        navigator.clipboard.writeText(codigo);
        showSuccessToast("Copiado!", "Código copiado");
    }, []);

    const adicionarProfessor = useCallback(async (e) => {
        e.preventDefault();
        
        if (!dadosNovoProfessor.nome?.trim()) {
            showErrorToast("Validação", "Preencha o nome do professor");
            return;
        }
        
        if (!dadosNovoProfessor.id_contrato) {
            showErrorToast("Validação", "Selecione o tipo de contrato");
            return;
        }
        
        setSalvando(true);
        try {
            const formData = new FormData();
            Object.entries(dadosNovoProfessor).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== "") {
                    formData.append(key, value);
                }
            });
            if (fotoArquivo) formData.append('foto', fotoArquivo);
            documentos.forEach((doc, i) => {
                formData.append('documentos', doc);
                formData.append('documentos_titulo', titulosDocumentos[i] || doc.name);
            });

            const response = await Api.post(`/registrarProfessor`, formData, {
                headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${localStorage.getItem("token")}` }
            });

            if (response.data.sucesso) {
                showSuccessToast("Sucesso", response.data.mensagem);
                await fetchProfessores(false);
                fecharModalAdicionar();
            } else {
                showErrorToast("Erro", response.data.mensagem || "Não foi possível registrar");
            }
        } catch (error) {
            console.error("Erro ao registrar professor:", error);
            showErrorToast("Erro", error.response?.data?.mensagem || "Não foi possível registrar o professor");
        } finally {
            setSalvando(false);
        }
    }, [dadosNovoProfessor, fotoArquivo, documentos, titulosDocumentos, fetchProfessores, fecharModalAdicionar]);

    const abrirModalVisualizar = useCallback(async (professor) => {
        try {
            setCarregandoDocumentos(true);
            setProfessorSelecionado(professor);
            
            const response = await apiClient.get(`/professorInfo/${professor.id_professor}`);
            
            if (response.data) {
                setProfessorSelecionado(response.data);
                setDocumentosProfessor(response.data.documentos || []);
            }
            setModalVisualizarAberto(true);
        } catch (error) {
            console.error("Erro ao carregar dados do professor:", error);
            showErrorToast("Erro", "Não foi possível carregar os dados");
        } finally {
            setCarregandoDocumentos(false);
        }
    }, [apiClient]);

    // ========== FUNÇÃO ABRIR MODAL EDIÇÃO ==========
    const abrirModalEditar = useCallback(async (professor) => {
        console.log("=== ABRINDO MODAL DE EDIÇÃO ===");
        console.log("Professor selecionado:", professor);
        
        try {
            setCarregandoDocumentos(true);
            
            // Preencher os dados do formulário com os dados do professor
            setDadosEdicao({
                id_professor: professor.id_professor, 
                nome: professor.nome || '', 
                genero: professor.genero || '',
                nacionalidade: professor.nacionalidade || '', 
                nomepai: professor.nomepai || '', 
                nomemae: professor.nomemae || '',
                contacto: professor.contacto || '', 
                whatsapp: professor.whatsapp || '', 
                bi: professor.bi || '',
                email: professor.email || '', 
                contactoemergencia: professor.contactoemergencia || '',
                anoexperienca: professor.anoexperienca || '', 
                titulacao: professor.titulacao || '',
                iban: professor.iban || '', 
                tiposangue: professor.tiposangue || '',
                data_nascimento: professor.data_nascimento || '', 
                data_admissao: professor.data_admissao || '',
                estadocivil: professor.estadocivil || '', 
                id_contrato: professor.id_contrato || '', 
                foto: professor.foto
            });
            
            // Setar a foto preview
            setFotoPreview(professor.fotoUrl);
            setFotoArquivo(null);
            
            // Buscar documentos do professor
            try {
                console.log("Buscando documentos para o professor ID:", professor.id_professor);
                
                const response = await apiClient.get(`/professorDocumentos/${professor.id_professor}`);
                console.log("Resposta da API de documentos:", response.data);
                
                if (response.data && response.data.success) {
                    const documentos = response.data.documentos || [];
                    console.log("Documentos encontrados:", documentos.length);
                    setDocumentosExistentes(documentos);
                } else {
                    console.log("Nenhum documento encontrado");
                    setDocumentosExistentes([]);
                }
            } catch (error) {
                console.error("Erro ao buscar documentos:", error);
                setDocumentosExistentes([]);
            }
            
            // Resetar estados de documentos novos
            setDocumentosParaRemover([]);
            setNovosDocumentos([]);
            setNovosDocumentosPreview([]);
            setNovosDocumentosTitulos([]);
            
            // Resetar a aba ativa para 'dados'
            setAbaAtiva('dados');
            
            console.log("Abrindo modal de edição...");
            
            // Abrir o modal
            setModalEditarAberto(true);
            
        } catch (error) {
            console.error("Erro ao carregar dados para edição:", error);
            showErrorToast("Erro", "Não foi possível carregar os dados para edição");
            setModalEditarAberto(true);
        } finally {
            setCarregandoDocumentos(false);
        }
    }, [apiClient]);

    // ========== FUNÇÕES DE DOCUMENTOS PARA EDIÇÃO ==========
    const handleNovosDocumentosChange = useCallback((e) => {
        const files = Array.from(e.target.files);
        const novosDocs = [], novosPreviews = [], novoTitulos = [];
        for (const file of files) {
            if (file.size > 10 * 1024 * 1024) {
                showErrorToast("Erro", `O documento ${file.name} excede 10MB`);
                continue;
            }
            if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
                novosDocs.push(file);
                novosPreviews.push({ name: file.name, type: file.type });
                novoTitulos.push(file.name.replace(/\.[^/.]+$/, ''));
            } else {
                showErrorToast("Erro", `Formato inválido: ${file.name}`);
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
        console.log("Removendo documento ID:", docId);
        if (!docId) {
            showErrorToast("Erro", "ID do documento inválido");
            return;
        }
        
        setDocumentosParaRemover(prev => [...prev, docId]);
        setDocumentosExistentes(prev => prev.filter(doc => doc.id_ficheiro !== docId));
        
        showSuccessToast("Sucesso", "Documento marcado para remoção");
    }, []);

    // ========== FUNÇÃO SALVAR EDIÇÃO ==========
    const salvarEdicao = useCallback(async (e) => {
        e.preventDefault();
        
        console.log("=== SALVANDO EDIÇÃO ===");
        console.log("Dados de edição:", dadosEdicao);
        console.log("Documentos para remover:", documentosParaRemover);
        console.log("Novos documentos:", novosDocumentos.length);
        
        if (!dadosEdicao.nome?.trim()) {
            showErrorToast("Validação", "Preencha o nome do professor");
            return;
        }
        
        setSalvando(true);
        try {
            const formData = new FormData();
            
            // Adicionar todos os campos do formulário
            Object.entries(dadosEdicao).forEach(([key, value]) => {
                if (value !== undefined && value !== null && key !== 'id_professor' && value !== "") {
                    formData.append(key, value);
                }
            });
            
            // Adicionar foto se houver
            if (fotoArquivo) {
                formData.append('foto', fotoArquivo);
            }
            
            // Adicionar documentos para remover
            documentosParaRemover.forEach(docId => {
                if (docId) {
                    formData.append('documentos_remover[]', docId);
                }
            });
            
            // Adicionar novos documentos
            novosDocumentos.forEach((doc, i) => {
                formData.append('documentos[]', doc);
                formData.append('documentos_titulo[]', novosDocumentosTitulos[i] || doc.name);
            });

            console.log("Enviando requisição PUT para:", `/atualizarprofessor/${dadosEdicao.id_professor}`);
            
            const response = await Api.put(`/atualizarprofessor/${dadosEdicao.id_professor}`, formData, {
                headers: { 
                    'Content-Type': 'multipart/form-data', 
                    Authorization: `Bearer ${localStorage.getItem("token")}` 
                }
            });

            console.log("Resposta da API:", response.data);

            if (response.data.success) {
                showSuccessToast("Sucesso", response.data.message || "Professor atualizado com sucesso!");
                await fetchProfessores(false);
                setModalEditarAberto(false);
                
                // Resetar estados
                setDocumentosExistentes([]);
                setDocumentosParaRemover([]);
                setNovosDocumentos([]);
                setNovosDocumentosPreview([]);
                setNovosDocumentosTitulos([]);
            } else {
                showErrorToast("Erro", response.data.message || "Não foi possível atualizar");
            }
        } catch (error) {
            console.error("Erro ao salvar edição:", error);
            showErrorToast("Erro", error.response?.data?.message || "Não foi possível atualizar o professor");
        } finally {
            setSalvando(false);
        }
    }, [dadosEdicao, fotoArquivo, documentosParaRemover, novosDocumentos, novosDocumentosTitulos, fetchProfessores]);

    const desativarProfessor = useCallback((id, nome) => {
        showConfirmToast(`Deseja realmente desativar o professor ${nome}?`, async () => {
            try {
                const response = await Api.put(`/professor/desativar/${id}`, {}, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                });
                if (response.status === 200) {
                    await fetchProfessores(false);
                    showSuccessToast("Sucesso", `Professor ${nome} desativado`);
                }
            } catch (error) {
                console.error("Erro ao desativar professor:", error);
                showErrorToast("Erro", "Não foi possível desativar o professor");
            }
        }, null, "Confirmar Desativação");
    }, [showConfirmToast, fetchProfessores]);

    const headers = ['Foto', 'Nome', 'Código', 'Visualizar', 'Senha', 'Editar', 'Desativar'];

    const renderRow = useCallback((item) => (
        <tr key={item.id_professor}>
            <td className="align-middle text-center">
                <div 
                    style={{ width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', backgroundColor: '#e0e0e0', overflow: 'hidden', margin: '0 auto' }}
                    onClick={() => abrirModalVisualizar(item)}
                >
                    {item.fotoUrl ? (
                        <img src={item.fotoUrl} alt={item.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                            <MdPerson size={20} color="#999" />
                        </div>
                    )}
                </div>
            </td>
            <td className="align-middle fw-semibold" style={{ color: 'var(--azul-escuro)' }}>
                {item.nome}
                <br/>
            </td>
            <td className="align-middle">
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <code style={{ backgroundColor: '#f5f5f5', padding: '2px 6px', borderRadius: '4px' }}>{item.codigo || 'N/I'}</code>
                    {item.codigo && (
                        <MdContentCopy 
                            size={14} 
                            style={{ color: '#999', cursor: 'pointer' }}
                            onClick={() => copiarCodigo(item.codigo)}
                            title="Copiar código"
                        />
                    )}
                </div>
            </td>
            <td className="text-center">
                <button 
                    className={`btn btn-sm ${Style.btnVisualizar}`} 
                    onClick={() => abrirModalVisualizar(item)} 
                    disabled={loading || salvando || isConfirming}
                    title="Visualizar informações"
                >
                    <MdRemoveRedEye />
                </button>
            </td>
            <td className="text-center">
                <button 
                    className={`btn btn-sm ${Style.btnOutros}`} 
                    onClick={() => gerarSenhaProfessor(item.id_professor, item.nome)} 
                    disabled={loading || salvando || isConfirming}
                    title="Gerar nova senha"
                >
                    <MdLock />
                </button>
            </td>
            <td className="text-center">
                <button 
                    className={`btn btn-sm ${Style.btnEditar}`} 
                    onClick={() => {
                        console.log("Botão EDITAR clicado para:", item.nome);
                        abrirModalEditar(item);
                    }} 
                    disabled={loading || salvando || isConfirming}
                    title="Editar professor"
                >
                    <MdEdit />
                </button>
            </td>
            <td className="text-center">
                <button 
                    className={`btn btn-sm ${Style.btnDeletar}`} 
                    onClick={() => desativarProfessor(item.id_professor, item.nome)} 
                    disabled={loading || salvando || isConfirming}
                    title="Desativar professor"
                >
                    <MdDeleteForever />
                </button>
            </td>
        </tr>
    ), [loading, salvando, isConfirming, abrirModalVisualizar, abrirModalEditar, desativarProfessor, copiarCodigo, gerarSenhaProfessor]);

    const Abas = ({ abaAtiva, setAbaAtiva }) => (
        <div className="d-flex border-bottom mb-4">
            <button
                type="button"
                className={`btn btn-link text-decoration-none px-3 py-2 ${abaAtiva === 'dados' ? 'fw-bold border-bottom border-2' : 'text-muted'}`}
                onClick={() => setAbaAtiva('dados')}
                style={{ borderBottomColor: abaAtiva === 'dados' ? 'var(--dourado)' : 'transparent' }}
            >
                <MdPerson className="me-2" /> Dados Pessoais
            </button>
            <button
                type="button"
                className={`btn btn-link text-decoration-none px-3 py-2 ${abaAtiva === 'documentos' ? 'fw-bold border-bottom border-2' : 'text-muted'}`}
                onClick={() => setAbaAtiva('documentos')}
                style={{ borderBottomColor: abaAtiva === 'documentos' ? 'var(--dourado)' : 'transparent' }}
            >
                <MdAttachFile className="me-2" /> Documentos
            </button>
        </div>
    );

    return (
        <div className="row mb-4">
            <div className="col-12">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2 className="h4 mb-0" style={{ color: 'var(--azul-escuro)' }}>
                        <FaChalkboardTeacher className="me-2 mb-2"/>Professores
                    </h2>
                    <div className="d-flex gap-2">
                        {ultimaAtualizacao && <small className="text-muted align-self-end">Atualizado: {ultimaAtualizacao}</small>}
                        <button className={`btn btn-sm ${Style.AtulizarDepartamento}`} onClick={() => fetchProfessores(true)} disabled={loading || isConfirming}>
                            <MdRefresh />
                        </button>
                        <button className={`btn btn-sm ${Style.btnSubmit}`} onClick={abrirModalAdicionar} disabled={loading || salvando || isConfirming}>
                            <MdAdd className="me-1" />Novo Professor
                        </button>
                    </div>
                </div>

                <div className="row mb-4">
                    <div className="col-md-8 mx-auto">
                        <div className="card shadow-sm border-0">
                            <div className="card-body p-3">
                                <div className="input-group">
                                    <span className="input-group-text border-end-0" style={{ backgroundColor: 'var(--cinza-claro)' }}>
                                        <MdSearch size={20} />
                                    </span>
                                    <input 
                                        type="text" 
                                        className="form-control border-start-0 ps-0" 
                                        placeholder="Pesquisar professor por nome, BI, contacto, email ou código..." 
                                        value={termoPesquisa} 
                                        onChange={(e) => setTermoPesquisa(e.target.value)} 
                                        style={{ borderLeft: 'none', boxShadow: 'none', backgroundColor: 'var(--cinza-claro)', padding: '10px' }}
                                    />
                                    {termoPesquisa && (
                                        <button className="btn border-start-0" onClick={() => setTermoPesquisa('')} style={{ backgroundColor: 'var(--danger)', color: 'var(--branco)' }}>
                                            ✕
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status"></div>
                        <p>Carregando...</p>
                    </div>
                ) : listaFiltrada.length === 0 ? (
                    <div className="text-center py-5">
                        <p>Nenhum professor encontrado</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <Table headers={headers} data={listaFiltrada} renderRow={renderRow} className="table table-hover table-striped border" />
                    </div>
                )}
            </div>

            {/* Modal Visualizar Professor */}
            {modalVisualizarAberto && professorSelecionado && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,.5)' }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content">
                            <div className="modal-header" style={{ backgroundColor: 'var(--azul-escuro)', color: 'var(--dourado)' }}>
                                <h5><MdPerson className="me-2" />Informações do Professor</h5>
                                <button className="btn-close btn-close-white" onClick={() => setModalVisualizarAberto(false)} />
                            </div>
                            <div className="modal-body">
                                {carregandoDocumentos ? (
                                    <div className="text-center py-5">
                                        <div className="spinner-border text-primary"></div>
                                        <p>Carregando...</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="row mb-4">
                                            <div className="col-md-3 text-center">
                                                <div style={{ width: '120px', height: '120px', borderRadius: '50%', backgroundColor: '#ccc', margin: 'auto', overflow: 'hidden' }}>
                                                    {professorSelecionado.fotoUrl ? (
                                                        <img src={professorSelecionado.fotoUrl} alt={professorSelecionado.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : (
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                                            <MdPerson size={50} color="#666" />
                                                        </div>
                                                    )}
                                                </div>
                                                <span className={`badge mt-2 ${professorSelecionado.status === 'Ativo' ? 'bg-success' : 'bg-danger'}`}>
                                                    {professorSelecionado.status || 'Ativo'}
                                                </span>
                                            </div>
                                            <div className="col-md-9">
                                                <h3>{professorSelecionado.nome}</h3>
                                                <div className="row mt-3">
                                                    <div className="col-md-6">
                                                        <p><strong>Código:</strong> {professorSelecionado.codigo || 'N/I'}</p>
                                                        <p><FaIdCard className="me-2" /> <strong>BI:</strong> {professorSelecionado.bi || 'N/I'}</p>
                                                        <p><MdPhone className="me-2" /> <strong>Contacto:</strong> {professorSelecionado.contacto || 'N/I'}</p>
                                                        {professorSelecionado.whatsapp && (
                                                            <p><FaWhatsapp className="me-2" /> <strong>WhatsApp:</strong> {professorSelecionado.whatsapp}</p>
                                                        )}
                                                        <p><MdEmail className="me-2" /> <strong>Email:</strong> {professorSelecionado.email || 'N/I'}</p>
                                                        <p><strong>Contacto Emergência:</strong> {professorSelecionado.contactoemergencia || 'N/I'}</p>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <p><strong>Gênero:</strong> {professorSelecionado.genero || 'N/I'}</p>
                                                        <p><strong>Estado Civil:</strong> {professorSelecionado.estadocivil || 'N/I'}</p>
                                                        <p><strong>Nacionalidade:</strong> {professorSelecionado.nacionalidade || 'N/I'}</p>
                                                        <p><strong>Nome do Pai:</strong> {professorSelecionado.nomepai || 'N/I'}</p>
                                                        <p><strong>Nome da Mãe:</strong> {professorSelecionado.nomemae || 'N/I'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <hr />
                                        
                                        <div className="row">
                                            <div className="col-md-6">
                                                <h6 className="mb-3">Informações Acadêmicas</h6>
                                                <p><MdSchool className="me-2" /> <strong>Titulação:</strong> {professorSelecionado.titulacao || 'N/I'}</p>
                                                <p><strong>Anos de Experiência:</strong> {professorSelecionado.anoexperienca || '0'} anos</p>
                                                <p><FaFileContract className="me-2" /> <strong>Contrato:</strong> {professorSelecionado.contrato || 'N/I'}</p>
                                            </div>
                                            <div className="col-md-6">
                                                <h6 className="mb-3">Informações Pessoais</h6>
                                                <p><MdBloodtype className="me-2" /> <strong>Tipo Sanguíneo:</strong> {professorSelecionado.tiposangue || 'N/I'}</p>
                                                <p><MdCalendarToday className="me-2" /> <strong>Data Nascimento:</strong> {professorSelecionado.data_nascimento ? new Date(professorSelecionado.data_nascimento).toLocaleDateString() : 'N/I'}</p>
                                                <p><MdCalendarToday className="me-2" /> <strong>Data Admissão:</strong> {professorSelecionado.data_admissao ? new Date(professorSelecionado.data_admissao).toLocaleDateString() : 'N/I'}</p>
                                                <p><FaUniversity className="me-2" /> <strong>IBAN:</strong> {professorSelecionado.iban || 'N/I'}</p>
                                            </div>
                                        </div>
                                        
                                        <hr />
                                        
                                        <h5 className="mb-3">Documentos ({documentosProfessor.length})</h5>
                                        {documentosProfessor.length === 0 ? (
                                            <p className="text-muted">Nenhum documento anexado</p>
                                        ) : (
                                            <div className="row">
                                                {documentosProfessor.map(doc => (
                                                    <div key={doc.id_ficheiro} className="col-md-6 mb-3">
                                                        <div className="card">
                                                            <div className="card-body">
                                                                <h6 className="card-title">{doc.titulo || 'Documento'}</h6>
                                                                <p className="card-text small text-muted">
                                                                    <MdAttachFile className="me-1" />
                                                                    {doc.ficheiro || 'Arquivo'}<br/>
                                                                    Data: {doc.data_actualizacao ? new Date(doc.data_actualizacao).toLocaleString() : 'N/I'}
                                                                    <br/>
                                                                    Status: <span className={`badge ${doc.status === 1 ? 'bg-success' : 'bg-secondary'}`}>
                                                                        {doc.status === 1 ? 'Ativo' : 'Inativo'}
                                                                    </span>
                                                                </p>
                                                                {doc.doc_url && (
                                                                    <a href={doc.doc_url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-primary">
                                                                        <MdVisibility className="me-1" /> Visualizar
                                                                    </a>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button className={`btn ${Style.btnCancelar}`} onClick={() => setModalVisualizarAberto(false)}>
                                    Fechar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Adicionar Professor */}
            {modalAdicionarAberto && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,.5)' }}>
                    <div className="modal-dialog modal-dialog-centered modal-xl">
                        <div className="modal-content">
                            <div className="modal-header" style={{ backgroundColor: 'var(--azul-escuro)', color: 'var(--dourado)' }}>
                                <h5><IoMdPersonAdd className="me-2" />Registrar Professor</h5>
                                <button className="btn-close btn-close-white" onClick={fecharModalAdicionar} />
                            </div>
                            <form onSubmit={adicionarProfessor}>
                                <div className="modal-body">
                                    <Abas abaAtiva={abaAtiva} setAbaAtiva={setAbaAtiva} />
                                    
                                    {abaAtiva === 'dados' && (
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Nome completo *</label>
                                                <input type="text" className="form-control" value={dadosNovoProfessor.nome} onChange={(e) => setDadosNovoProfessor({ ...dadosNovoProfessor, nome: e.target.value })} required />
                                            </div>
                                            <div className="col-md-3 mb-3">
                                                <label className="form-label">Gênero *</label>
                                                <select className="form-control" value={dadosNovoProfessor.genero} onChange={(e) => setDadosNovoProfessor({ ...dadosNovoProfessor, genero: e.target.value })} required>
                                                    <option value="">Selecione</option>
                                                    <option value="Masculino">Masculino</option>
                                                    <option value="Feminino">Feminino</option>
                                                    <option value="Outro">Outro</option>
                                                </select>
                                            </div>
                                            <div className="col-md-3 mb-3">
                                                <label className="form-label">Estado Civil</label>
                                                <select className="form-control" value={dadosNovoProfessor.estadocivil} onChange={(e) => setDadosNovoProfessor({ ...dadosNovoProfessor, estadocivil: e.target.value })}>
                                                    <option value="">Selecione</option>
                                                    <option value="Solteiro">Solteiro</option>
                                                    <option value="Casado">Casado</option>
                                                    <option value="Divorciado">Divorciado</option>
                                                    <option value="Viúvo">Viúvo</option>
                                                    <option value="União Estável">União Estável</option>
                                                </select>
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Nacionalidade</label>
                                                <input type="text" className="form-control" value={dadosNovoProfessor.nacionalidade} onChange={(e) => setDadosNovoProfessor({ ...dadosNovoProfessor, nacionalidade: e.target.value })} />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Nome do Pai</label>
                                                <input type="text" className="form-control" value={dadosNovoProfessor.nomepai} onChange={(e) => setDadosNovoProfessor({ ...dadosNovoProfessor, nomepai: e.target.value })} />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Nome da Mãe</label>
                                                <input type="text" className="form-control" value={dadosNovoProfessor.nomemae} onChange={(e) => setDadosNovoProfessor({ ...dadosNovoProfessor, nomemae: e.target.value })} />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">BI *</label>
                                                <input type="text" className="form-control" value={dadosNovoProfessor.bi} onChange={(e) => setDadosNovoProfessor({ ...dadosNovoProfessor, bi: e.target.value })} required />
                                            </div>
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label">Contacto *</label>
                                                <input type="text" className="form-control" value={dadosNovoProfessor.contacto} onChange={(e) => setDadosNovoProfessor({ ...dadosNovoProfessor, contacto: e.target.value })} required />
                                            </div>
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label">WhatsApp</label>
                                                <input type="text" className="form-control" value={dadosNovoProfessor.whatsapp} onChange={(e) => setDadosNovoProfessor({ ...dadosNovoProfessor, whatsapp: e.target.value })} />
                                            </div>
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label">Contacto Emergência</label>
                                                <input type="text" className="form-control" value={dadosNovoProfessor.contactoemergencia} onChange={(e) => setDadosNovoProfessor({ ...dadosNovoProfessor, contactoemergencia: e.target.value })} />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Email *</label>
                                                <input type="email" className="form-control" value={dadosNovoProfessor.email} onChange={(e) => setDadosNovoProfessor({ ...dadosNovoProfessor, email: e.target.value })} required />
                                            </div>
                                            <div className="col-md-3 mb-3">
                                                <label className="form-label">Anos Experiência</label>
                                                <input type="number" className="form-control" value={dadosNovoProfessor.anoexperienca} onChange={(e) => setDadosNovoProfessor({ ...dadosNovoProfessor, anoexperienca: e.target.value })} />
                                            </div>
                                            <div className="col-md-3 mb-3">
                                                <label className="form-label">Titulação</label>
                                                <input type="text" className="form-control" value={dadosNovoProfessor.titulacao} onChange={(e) => setDadosNovoProfessor({ ...dadosNovoProfessor, titulacao: e.target.value })} />
                                            </div>
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label">IBAN</label>
                                                <input type="text" placeholder="AO06000600000052757230254" className="form-control" value={dadosNovoProfessor.iban} onChange={(e) => setDadosNovoProfessor({ ...dadosNovoProfessor, iban: e.target.value })} />
                                            </div>
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label">Tipo Sanguíneo</label>
                                                <select className="form-control" value={dadosNovoProfessor.tiposangue} onChange={(e) => setDadosNovoProfessor({ ...dadosNovoProfessor, tiposangue: e.target.value })}>
                                                    <option value="">Selecione</option>
                                                    <option value="A+">A+</option>
                                                    <option value="A-">A-</option>
                                                    <option value="B+">B+</option>
                                                    <option value="B-">B-</option>
                                                    <option value="AB+">AB+</option>
                                                    <option value="AB-">AB-</option>
                                                    <option value="O+">O+</option>
                                                    <option value="O-">O-</option>
                                                </select>
                                            </div>
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label">Data Nascimento *</label>
                                                <input type="date" className="form-control" value={dadosNovoProfessor.data_nascimento} onChange={(e) => setDadosNovoProfessor({ ...dadosNovoProfessor, data_nascimento: e.target.value })} required />
                                            </div>
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label">Data Admissão *</label>
                                                <input type="date" className="form-control" value={dadosNovoProfessor.data_admissao} onChange={(e) => setDadosNovoProfessor({ ...dadosNovoProfessor, data_admissao: e.target.value })} required />
                                            </div>
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label">Tipo de Contrato *</label>
                                                <select className="form-control" value={dadosNovoProfessor.id_contrato} onChange={(e) => setDadosNovoProfessor({ ...dadosNovoProfessor, id_contrato: e.target.value })} required>
                                                    <option value="">Selecione</option>
                                                    {contratos.map(contrato => (
                                                        <option key={contrato.id_contrato} value={contrato.id_contrato}>
                                                            {contrato.contrato}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="col-md-12 mb-3">
                                                <label className="form-label">Foto do Professor</label>
                                                <input type="file" accept="image/*" className="form-control" onChange={handleFotoChange} />
                                                <small className="text-muted d-block">Formatos: JPG, PNG. Máximo 5MB</small>
                                            </div>
                                            {fotoPreview && (
                                                <div className="col-md-12 mb-3 text-center">
                                                    <img src={fotoPreview} alt="Preview" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }} />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    
                                    {abaAtiva === 'documentos' && (
                                        <div>
                                            <div className="mb-3">
                                                <label className="form-label">Documentos (PDF/Imagem)</label>
                                                <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" className="form-control" onChange={handleDocumentosChange} />
                                                <small className="text-muted">Formatos: PDF, JPG, PNG. Máximo 10MB por arquivo</small>
                                            </div>
                                            {documentosPreview.map((doc, i) => (
                                                <div key={i} className="d-flex gap-2 mb-2">
                                                    <input type="text" placeholder="Título do documento" className="form-control" value={titulosDocumentos[i] || ''} onChange={(e) => handleTituloDocumentoChange(i, e.target.value)} required />
                                                    <button type="button" className="btn btn-danger" onClick={() => removerDocumento(i)}>Remover</button>
                                                </div>
                                            ))}
                                            {documentosPreview.length === 0 && (
                                                <div className="text-center py-4 text-muted">
                                                    <MdAttachFile size={32} />
                                                    <p className="mt-2">Nenhum documento selecionado</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className={`btn ${Style.btnCancelar}`} onClick={fecharModalAdicionar}>Cancelar</button>
                                    <button type="submit" className={`btn ${Style.btnSubmit}`} disabled={salvando}>
                                        {salvando ? "Registrando..." : "Registrar"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* ========== MODAL EDIÇÃO COMPLETO ========== */}
            {modalEditarAberto && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,.5)' }}>
                    <div className="modal-dialog modal-dialog-centered modal-xl">
                        <div className="modal-content">
                            <div className="modal-header" style={{ backgroundColor: 'var(--azul-escuro)', color: 'var(--dourado)' }}>
                                <h5><MdEdit className="me-2" />Editar Professor</h5>
                                <button 
                                    className="btn-close btn-close-white" 
                                    onClick={() => {
                                        console.log("Fechando modal de edição");
                                        setModalEditarAberto(false);
                                    }} 
                                    disabled={salvando}
                                />
                            </div>
                            <form onSubmit={salvarEdicao}>
                                <div className="modal-body">
                                    <Abas abaAtiva={abaAtiva} setAbaAtiva={setAbaAtiva} />
                                    
                                    {abaAtiva === 'dados' && (
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Nome *</label>
                                                <input 
                                                    type="text" 
                                                    className="form-control" 
                                                    value={dadosEdicao.nome} 
                                                    onChange={(e) => setDadosEdicao({ ...dadosEdicao, nome: e.target.value })} 
                                                    required 
                                                />
                                            </div>
                                            <div className="col-md-3 mb-3">
                                                <label className="form-label">Gênero</label>
                                                <select 
                                                    className="form-control" 
                                                    value={dadosEdicao.genero} 
                                                    onChange={(e) => setDadosEdicao({ ...dadosEdicao, genero: e.target.value })}
                                                >
                                                    <option value="">Selecione</option>
                                                    <option value="Masculino">Masculino</option>
                                                    <option value="Feminino">Feminino</option>
                                                    <option value="Outro">Outro</option>
                                                </select>
                                            </div>
                                            <div className="col-md-3 mb-3">
                                                <label className="form-label">Estado Civil</label>
                                                <select 
                                                    className="form-control" 
                                                    value={dadosEdicao.estadocivil} 
                                                    onChange={(e) => setDadosEdicao({ ...dadosEdicao, estadocivil: e.target.value })}
                                                >
                                                    <option value="">Selecione</option>
                                                    <option value="Solteiro">Solteiro</option>
                                                    <option value="Casado">Casado</option>
                                                    <option value="Divorciado">Divorciado</option>
                                                    <option value="Viúvo">Viúvo</option>
                                                    <option value="União Estável">União Estável</option>
                                                </select>
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Nacionalidade</label>
                                                <input 
                                                    type="text" 
                                                    className="form-control" 
                                                    value={dadosEdicao.nacionalidade} 
                                                    onChange={(e) => setDadosEdicao({ ...dadosEdicao, nacionalidade: e.target.value })} 
                                                />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Nome do Pai</label>
                                                <input 
                                                    type="text" 
                                                    className="form-control" 
                                                    value={dadosEdicao.nomepai} 
                                                    onChange={(e) => setDadosEdicao({ ...dadosEdicao, nomepai: e.target.value })} 
                                                />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Nome da Mãe</label>
                                                <input 
                                                    type="text" 
                                                    className="form-control" 
                                                    value={dadosEdicao.nomemae} 
                                                    onChange={(e) => setDadosEdicao({ ...dadosEdicao, nomemae: e.target.value })} 
                                                />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">BI</label>
                                                <input 
                                                    type="text" 
                                                    className="form-control" 
                                                    value={dadosEdicao.bi} 
                                                    onChange={(e) => setDadosEdicao({ ...dadosEdicao, bi: e.target.value })} 
                                                />
                                            </div>
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label">Contacto</label>
                                                <input 
                                                    type="text" 
                                                    className="form-control" 
                                                    value={dadosEdicao.contacto} 
                                                    onChange={(e) => setDadosEdicao({ ...dadosEdicao, contacto: e.target.value })} 
                                                />
                                            </div>
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label">WhatsApp</label>
                                                <input 
                                                    type="text" 
                                                    className="form-control" 
                                                    value={dadosEdicao.whatsapp} 
                                                    onChange={(e) => setDadosEdicao({ ...dadosEdicao, whatsapp: e.target.value })} 
                                                />
                                            </div>
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label">Contacto Emergência</label>
                                                <input 
                                                    type="text" 
                                                    className="form-control" 
                                                    value={dadosEdicao.contactoemergencia} 
                                                    onChange={(e) => setDadosEdicao({ ...dadosEdicao, contactoemergencia: e.target.value })} 
                                                />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Email</label>
                                                <input 
                                                    type="email" 
                                                    className="form-control" 
                                                    value={dadosEdicao.email} 
                                                    onChange={(e) => setDadosEdicao({ ...dadosEdicao, email: e.target.value })} 
                                                />
                                            </div>
                                            <div className="col-md-3 mb-3">
                                                <label className="form-label">Anos Experiência</label>
                                                <input 
                                                    type="number" 
                                                    className="form-control" 
                                                    value={dadosEdicao.anoexperienca} 
                                                    onChange={(e) => setDadosEdicao({ ...dadosEdicao, anoexperienca: e.target.value })} 
                                                />
                                            </div>
                                            <div className="col-md-3 mb-3">
                                                <label className="form-label">Titulação</label>
                                                <input 
                                                    type="text" 
                                                    className="form-control" 
                                                    value={dadosEdicao.titulacao} 
                                                    onChange={(e) => setDadosEdicao({ ...dadosEdicao, titulacao: e.target.value })} 
                                                />
                                            </div>
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label">IBAN</label>
                                                <input 
                                                    type="text" 
                                                    className="form-control" 
                                                    value={dadosEdicao.iban} 
                                                    onChange={(e) => setDadosEdicao({ ...dadosEdicao, iban: e.target.value })} 
                                                />
                                            </div>
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label">Tipo Sanguíneo</label>
                                                <select 
                                                    className="form-control" 
                                                    value={dadosEdicao.tiposangue} 
                                                    onChange={(e) => setDadosEdicao({ ...dadosEdicao, tiposangue: e.target.value })}
                                                >
                                                    <option value="">Selecione</option>
                                                    <option value="A+">A+</option>
                                                    <option value="A-">A-</option>
                                                    <option value="B+">B+</option>
                                                    <option value="B-">B-</option>
                                                    <option value="AB+">AB+</option>
                                                    <option value="AB-">AB-</option>
                                                    <option value="O+">O+</option>
                                                    <option value="O-">O-</option>
                                                </select>
                                            </div>
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label">Data Nascimento</label>
                                                <input 
                                                    type="date" 
                                                    className="form-control" 
                                                    value={dadosEdicao.data_nascimento} 
                                                    onChange={(e) => setDadosEdicao({ ...dadosEdicao, data_nascimento: e.target.value })} 
                                                />
                                            </div>
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label">Data Admissão</label>
                                                <input 
                                                    type="date" 
                                                    className="form-control" 
                                                    value={dadosEdicao.data_admissao} 
                                                    onChange={(e) => setDadosEdicao({ ...dadosEdicao, data_admissao: e.target.value })} 
                                                />
                                            </div>
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label">Tipo de Contrato</label>
                                                <select 
                                                    className="form-control" 
                                                    value={dadosEdicao.id_contrato} 
                                                    onChange={(e) => setDadosEdicao({ ...dadosEdicao, id_contrato: e.target.value })}
                                                >
                                                    <option value="">Selecione</option>
                                                    {contratos.map(contrato => (
                                                        <option key={contrato.id_contrato} value={contrato.id_contrato}>
                                                            {contrato.contrato}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Seção para Gerar Senha no Modal de Edição */}
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
                                                                if (dadosEdicao.id_professor) {
                                                                    gerarSenhaProfessor(
                                                                        dadosEdicao.id_professor, 
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
                                                            para o email do professor
                                                        </small>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-md-12 mb-3">
                                                <label className="form-label">Foto</label>
                                                <input 
                                                    type="file" 
                                                    accept="image/*" 
                                                    className="form-control" 
                                                    onChange={(e) => { 
                                                        const file = e.target.files[0]; 
                                                        if (file) { 
                                                            if (file.size <= 5 * 1024 * 1024) {
                                                                setFotoArquivo(file); 
                                                                const reader = new FileReader(); 
                                                                reader.onloadend = () => setFotoPreview(reader.result); 
                                                                reader.readAsDataURL(file);
                                                            } else {
                                                                showErrorToast("Erro", "A foto não pode exceder 5MB");
                                                            }
                                                        } 
                                                    }} 
                                                />
                                            </div>
                                            {fotoPreview && (
                                                <div className="col-md-12 mb-3 text-center">
                                                    <img src={fotoPreview} alt="Preview" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }} />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    
                                    {abaAtiva === 'documentos' && (
                                        <div>
                                            <div className="mb-4">
                                                <div className="d-flex justify-content-between align-items-center mb-3">
                                                    <h6 className="mb-0">Documentos Atuais</h6>
                                                    <span className="badge bg-primary">{documentosExistentes.length}</span>
                                                </div>
                                                
                                                {carregandoDocumentos ? (
                                                    <div className="text-center py-4">
                                                        <div className="spinner-border text-primary" role="status" />
                                                        <p className="mt-2 text-muted">Carregando documentos...</p>
                                                    </div>
                                                ) : documentosExistentes.length === 0 ? (
                                                    <div className="text-center py-4 bg-light rounded">
                                                        <MdAttachFile size={40} className="text-muted mb-2" />
                                                        <p className="text-muted mb-0">Nenhum documento anexado</p>
                                                    </div>
                                                ) : (
                                                    <div className="list-group">
                                                        {documentosExistentes.map((doc) => (
                                                            <div key={doc.id_ficheiro} className="list-group-item d-flex justify-content-between align-items-center">
                                                                <div className="d-flex align-items-center">
                                                                    <div className="me-3">
                                                                        <MdAttachFile size={24} className="text-primary" />
                                                                    </div>
                                                                    <div>
                                                                        <strong>{doc.ficheiro || 'Documento'}</strong>
                                                                        <br/>
                                                                        <small className="text-muted">
                                                                            📅 {doc.data_actualizacao ? new Date(doc.data_actualizacao).toLocaleDateString('pt-BR') : 'Data não disponível'}
                                                                            {doc.status !== undefined && (
                                                                                <span className={`ms-2 badge ${doc.status === 1 ? 'bg-success' : 'bg-secondary'}`}>
                                                                                    {doc.status === 1 ? 'Ativo' : 'Inativo'}
                                                                                </span>
                                                                            )}
                                                                        </small>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    {doc.doc_url && (
                                                                        <a 
                                                                            href={doc.doc_url} 
                                                                            target="_blank" 
                                                                            rel="noopener noreferrer" 
                                                                            className="btn btn-sm btn-outline-primary me-2"
                                                                            title="Visualizar documento"
                                                                        >
                                                                            <MdVisibility />
                                                                        </a>
                                                                    )}
                                                                    <button 
                                                                        type="button" 
                                                                        className="btn btn-sm btn-outline-danger"
                                                                        onClick={() => {
                                                                            if (doc.id_ficheiro) {
                                                                                marcarDocumentoParaRemover(doc.id_ficheiro);
                                                                            } else {
                                                                                showErrorToast("Erro", "Não foi possível identificar o documento");
                                                                            }
                                                                        }}
                                                                        title="Remover documento"
                                                                    >
                                                                        <MdDeleteForever />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <hr />
                                            
                                            <div>
                                                <h6 className="mb-3">Adicionar Novos Documentos</h6>
                                                <div className="border rounded p-3 bg-light">
                                                    <div className="mb-3">
                                                        <input 
                                                            type="file" 
                                                            multiple 
                                                            accept=".pdf,.jpg,.jpeg,.png" 
                                                            className="form-control" 
                                                            onChange={handleNovosDocumentosChange} 
                                                            id="novosDocumentos"
                                                        />
                                                        <label htmlFor="novosDocumentos" className="form-label mt-2">
                                                            <small className="text-muted">
                                                                <MdFileUpload className="me-1" />
                                                                Formatos: PDF, JPG, JPEG, PNG | Máximo 10MB por arquivo
                                                            </small>
                                                        </label>
                                                    </div>
                                                    
                                                    {novosDocumentosPreview.length > 0 && (
                                                        <div className="mt-3">
                                                            <h6 className="mb-2">Novos Documentos Selecionados ({novosDocumentosPreview.length})</h6>
                                                            {novosDocumentosPreview.map((doc, i) => (
                                                                <div key={i} className="d-flex gap-2 mb-2">
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
                                                                        title="Remover este documento"
                                                                    >
                                                                        <MdClear />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="modal-footer">
                                    <button 
                                        type="button" 
                                        className={`btn ${Style.btnCancelar}`} 
                                        onClick={() => {
                                            console.log("Cancelando edição");
                                            setModalEditarAberto(false);
                                        }}
                                        disabled={salvando}
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        type="submit" 
                                        className={`btn ${Style.btnSubmit}`} 
                                        disabled={salvando}
                                    >
                                        {salvando ? "Salvando..." : "Salvar"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* ========== MODAL SENHA GERADA ========== */}
            {modalSenhaGeradaAberto && professorSenhaGerada && (
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
                                    <h4 className="text-primary">{professorSenhaGerada.nome}</h4>
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
                                    A senha foi enviada para o email do professor
                                </p>
                                
                                <div className="alert alert-warning small">
                                    <strong>Atenção:</strong> Guarde esta senha em segurança. 
                                    O professor poderá alterá-la após o primeiro login.
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button 
                                    type="button" 
                                    className={`btn ${Style.btnSubmit}`}
                                    onClick={() => {
                                        setModalSenhaGeradaAberto(false);
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

export default ProfessorEdit;