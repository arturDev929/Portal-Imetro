// ProfessorEdit.js - Versão unificada com design consistente
import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { 
    MdEdit, 
    MdDeleteForever, 
    MdRefresh, 
    MdSearch,
    MdAdd,
    MdBook,
    MdPerson,
    MdEmail,
    MdPhone,
    MdLocationOn,
    MdAttachFile,
    MdCameraAlt,
    MdOutlineLocalHospital,
    MdAddCircleOutline
} from "react-icons/md";
import { 
    FaBook, 
    FaInfoCircle, 
    FaIdCard, 
    FaHeartbeat, 
    FaUniversity,
    FaBriefcase,
} from "react-icons/fa";
import { RiContactsBook3Line } from "react-icons/ri";
import { IoMdPersonAdd } from "react-icons/io";
import SelectDisciplina from "./SelectDisciplina";
import SelectProfessor from "./SelectProfessor";
import { showSuccessToast, showErrorToast, showInfoToast, useConfirmToast } from "./CustomToast";
import Style from "./DepartamentosEdit.module.css";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";
const API_TIMEOUT = 30000;

function ProfessorEdit() {
    const [lista, setLista] = useState([]);
    const [listaFiltrada, setListaFiltrada] = useState([]);
    const [termoPesquisa, setTermoPesquisa] = useState('');
    const [loading, setLoading] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null);
    
    // Estados para modais
    const [modalAdicionarAberto, setModalAdicionarAberto] = useState(false);
    const [modalInfoAberto, setModalInfoAberto] = useState(false);
    const [modalDisciplinasAberto, setModalDisciplinasAberto] = useState(false);
    const [modalEditarAberto, setModalEditarAberto] = useState(false);
    const [modalAdicionarDisciplinaAberto, setModalAdicionarDisciplinaAberto] = useState(false);
    
    // Estados para dados selecionados
    const [professorSelecionado, setProfessorSelecionado] = useState(null);
    const [professorSelecionadoInfo, setProfessorSelecionadoInfo] = useState(null);
    const [disciplinasProfessor, setDisciplinasProfessor] = useState([]);
    const [loadingDisciplinas, setLoadingDisciplinas] = useState(false);
    const [removendoDisciplina, setRemovendoDisciplina] = useState(null);
    
    // Estados para adicionar disciplina
    const [iddisciplina, setIdDisciplina] = useState("");
    const [idprofessor, setIdProfessor] = useState("");
    
    // Estado para novo professor
    const [dadosNovoProfessor, setDadosNovoProfessor] = useState({
        fotoprofessor: null,
        nomeprofessore: "",
        genero: "",
        nacionalidadeprofessor: "",
        estadocivilprofessor: "",
        nomepaiprofessor: "",
        nomemaeprofessor: "",
        biprofessor: "",
        datanascimentoprofessor: "",
        bipdfprofessor: null,
        residenciaprofessor: "",
        telefoneprofessor: "",
        whatsappprofessor: "",
        emailprofessor: "",
        anoexprienciaprofessor: "",
        titulacaoprofessor: "",
        dataadmissaprofessor: "",
        tipocontratoprofessor: "",
        ibanprofessor: "",
        tiposanguineoprofessor: "",
        condicoesprofessor: "",
        contactoemergenciaprofessor: ""
    });
    
    // Estado para edição
    const [dadosEdicao, setDadosEdicao] = useState({
        idprofessor: '',
        codigoprofessor: '',
        nomeprofessor: '',
        generoprofessor: '',
        nacionalidadeprofessor: '',
        estadocivilprofessor: '',
        nomepaiprofessor: '',
        nomemaeprofessor: '',
        nbiprofessor: '',
        datanascimentoprofessor: '',
        residenciaprofessor: '',
        telefoneprofessor: '',
        whatsappprofessor: '',
        emailprofessor: '',
        anoexperienciaprofessor: '',
        titulacaoprofessor: '',
        dataadmissaoprofessor: '',
        condicoesprofessor: '',
        ibanprofessor: '',
        tipocontratoprofessor: '',
        tiposanguineoprofessor: '',
        contactoemergenciaprofessor: '',
        fotoUrl: '',
        curriculoUrl: ''
    });

    const [user, setUser] = useState(null);
    const { showConfirmToast, isConfirming } = useConfirmToast();

    useEffect(() => {
        const usuarioSalvo = localStorage.getItem("usuarioLogado");
        if (usuarioSalvo) {
            setUser(JSON.parse(usuarioSalvo));
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

    const fetchProfessores = useCallback(async (mostrarNotificacao = false) => {
        try {
            setLoading(true);
            const response = await apiClient.get('/get/Professores');
            setLista(response.data || []);
            setListaFiltrada(response.data || []);
            setUltimaAtualizacao(new Date().toLocaleTimeString('pt-BR'));
            
            if (mostrarNotificacao && response.data && response.data.length > 0) {
                showSuccessToast(
                    "Sucesso",
                    "Dados atualizados com sucesso",
                    { "Quantidade": `${response.data.length} professor(es)` }
                );
            }
        } catch (error) {
            console.error("Erro ao buscar professores:", error);
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
                item.nomeprofessor?.toLowerCase().includes(termo.toLowerCase()) ||
                (item.codigoprofessor && item.codigoprofessor.toLowerCase().includes(termo.toLowerCase()))
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
                item.nomeprofessor?.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
                (item.codigoprofessor && item.codigoprofessor.toLowerCase().includes(termoPesquisa.toLowerCase()))
            );
            setListaFiltrada(filtrados);
        }
    }, [lista, termoPesquisa]);

    const fetchDisciplinasProfessor = useCallback(async (idProfessor, nomeProfessor) => {
        if (!idProfessor) return;
        
        try {
            setLoadingDisciplinas(true);
            setProfessorSelecionado({ idprofessor: idProfessor, nomeprofessor: nomeProfessor });
            
            const response = await apiClient.get(`/get/professorVinculadoDisciplinas/${idProfessor}`);
            setDisciplinasProfessor(response.data || []);
            setModalDisciplinasAberto(true);
        } catch (error) {
            console.error("Erro ao buscar disciplinas do professor:", error);
            showErrorToast("Erro", "Não foi possível carregar as disciplinas do professor");
        } finally {
            setLoadingDisciplinas(false);
        }
    }, [apiClient]);

    const fetchInfoProfessor = useCallback(async (professor) => {
        try {
            setLoading(true);
            const response = await apiClient.get(`/get/InformacoesProfessor/${professor.idprofessor}`);
            setProfessorSelecionadoInfo({
                ...professor,
                ...response.data
            });
            setModalInfoAberto(true);
        } catch (error) {
            console.error("Erro ao buscar informações do professor:", error);
            showErrorToast("Erro", "Não foi possível carregar as informações do professor");
        } finally {
            setLoading(false);
        }
    }, [apiClient]);

    const abrirModalAdicionar = useCallback(() => {
        setDadosNovoProfessor({
            fotoprofessor: null,
            nomeprofessore: "",
            genero: "",
            nacionalidadeprofessor: "",
            estadocivilprofessor: "",
            nomepaiprofessor: "",
            nomemaeprofessor: "",
            biprofessor: "",
            datanascimentoprofessor: "",
            bipdfprofessor: null,
            residenciaprofessor: "",
            telefoneprofessor: "",
            whatsappprofessor: "",
            emailprofessor: "",
            anoexprienciaprofessor: "",
            titulacaoprofessor: "",
            dataadmissaprofessor: "",
            tipocontratoprofessor: "",
            ibanprofessor: "",
            tiposanguineoprofessor: "",
            condicoesprofessor: "",
            contactoemergenciaprofessor: ""
        });
        setModalAdicionarAberto(true);
    }, []);

    const fecharModalAdicionar = useCallback(() => {
        if (!salvando) {
            setModalAdicionarAberto(false);
            setDadosNovoProfessor({
                fotoprofessor: null,
                nomeprofessore: "",
                genero: "",
                nacionalidadeprofessor: "",
                estadocivilprofessor: "",
                nomepaiprofessor: "",
                nomemaeprofessor: "",
                biprofessor: "",
                datanascimentoprofessor: "",
                bipdfprofessor: null,
                residenciaprofessor: "",
                telefoneprofessor: "",
                whatsappprofessor: "",
                emailprofessor: "",
                anoexprienciaprofessor: "",
                titulacaoprofessor: "",
                dataadmissaprofessor: "",
                tipocontratoprofessor: "",
                ibanprofessor: "",
                tiposanguineoprofessor: "",
                condicoesprofessor: "",
                contactoemergenciaprofessor: ""
            });
        }
    }, [salvando]);

    const handleNovoProfessorInputChange = useCallback((e) => {
        const { name, value, files } = e.target;
        
        if (files && files[0]) {
            setDadosNovoProfessor((prev) => ({
                ...prev,
                [name]: files[0]
            }));
        } else {
            setDadosNovoProfessor((prev) => ({
                ...prev,
                [name]: value
            }));
        }
    }, []);

    const adicionarProfessor = useCallback(async (e) => {
        e?.preventDefault();
        
        if (!user?.id) {
            showErrorToast("Acesso Negado", "Administrador não autenticado!");
            return;
        }

        if (!dadosNovoProfessor.nomeprofessore?.trim()) {
            showErrorToast("Validação", "Preencha o nome do professor");
            return;
        }

        setSalvando(true);
        try {
            const formData = new FormData();
            
            Object.keys(dadosNovoProfessor).forEach(key => {
                if (dadosNovoProfessor[key] !== null && dadosNovoProfessor[key] !== undefined && dadosNovoProfessor[key] !== "") {
                    formData.append(key, dadosNovoProfessor[key]);
                }
            });
            
            formData.append('idAdm', user.id);

            const response = await axios.post(`${API_BASE_URL}/post/registrarprofessor`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            if (response.data.sucesso) {
                const codigoProfessor = response.data.dados?.codigoProfessor;
                const codigoAcesso = response.data.dados?.codigoAcesso;
                
                showSuccessToast(
                    "Professor Registrado com Sucesso!",
                    "Professor registrado com sucesso.",
                    {
                        "Código do Professor": codigoProfessor,
                        "Senha de Acesso": codigoAcesso
                    }
                );
                
                await fetchProfessores(false);
                fecharModalAdicionar();
            }
        } catch (error) {
            console.error("Erro ao adicionar professor:", error);
            showErrorToast("Erro", "Não foi possível registrar o professor");
        } finally {
            setSalvando(false);
        }
    }, [dadosNovoProfessor, user, fetchProfessores, fecharModalAdicionar]);

    const abrirModalEditar = useCallback(async (professor) => {
        try {
            setLoading(true);
            const response = await apiClient.get(`/get/InformacoesProfessor/${professor.idprofessor}`);
            const infoCompletas = response.data;
            
            setDadosEdicao({
                idprofessor: professor.idprofessor,
                codigoprofessor: professor.codigoprofessor || infoCompletas.codigoprofessor || '',
                nomeprofessor: professor.nomeprofessor || infoCompletas.nomeprofessor || '',
                generoprofessor: professor.generoprofessor || infoCompletas.generoprofessor || '',
                nacionalidadeprofessor: professor.nacionalidadeprofessor || infoCompletas.nacionalidadeprofessor || '',
                estadocivilprofessor: professor.estadocivilprofessor || infoCompletas.estadocivilprofessor || '',
                nomepaiprofessor: professor.nomepaiprofessor || infoCompletas.nomepaiprofessor || '',
                nomemaeprofessor: professor.nomemaeprofessor || infoCompletas.nomemaeprofessor || '',
                nbiprofessor: professor.nbiprofessor || infoCompletas.nbiprofessor || '',
                datanascimentoprofessor: professor.datanascimentoprofessor || infoCompletas.datanascimentoprofessor || '',
                residenciaprofessor: professor.residenciaprofessor || infoCompletas.residenciaprofessor || '',
                telefoneprofessor: professor.telefoneprofessor || infoCompletas.telefoneprofessor || '',
                whatsappprofessor: professor.whatsappprofessor || infoCompletas.whatsappprofessor || '',
                emailprofessor: professor.emailprofessor || infoCompletas.emailprofessor || '',
                anoexperienciaprofessor: professor.anoexperienciaprofessor || infoCompletas.anoexperienciaprofessor || '',
                titulacaoprofessor: professor.titulacaoprofessor || infoCompletas.titulacaoprofessor || '',
                dataadmissaoprofessor: professor.dataadmissaoprofessor || infoCompletas.dataadmissaoprofessor || '',
                condicoesprofessor: professor.condicoesprofessor || infoCompletas.condicoesprofessor || '',
                ibanprofessor: professor.ibanprofessor || infoCompletas.ibanprofessor || '',
                tipocontratoprofessor: professor.tipocontratoprofessor || infoCompletas.tipocontratoprofessor || '',
                tiposanguineoprofessor: professor.tiposanguineoprofessor || infoCompletas.tiposanguineoprofessor || '',
                contactoemergenciaprofessor: professor.contactoemergenciaprofessor || infoCompletas.contactoemergenciaprofessor || '',
                fotoUrl: professor.fotoUrl || infoCompletas.fotoUrl || '',
                curriculoUrl: professor.curriculoUrl || infoCompletas.curriculoUrl || null
            });
            setModalEditarAberto(true);
        } catch (error) {
            console.error("Erro ao buscar informações para edição:", error);
            showErrorToast("Erro", "Não foi possível carregar os dados para edição");
        } finally {
            setLoading(false);
        }
    }, [apiClient]);

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setDadosEdicao(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleFotoChange = useCallback((e, isNovo = false) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (isNovo) {
                    setDadosNovoProfessor(prev => ({ ...prev, fotoprofessor: file }));
                } else {
                    setDadosEdicao(prev => ({ ...prev, fotoUrl: reader.result }));
                }
            };
            reader.readAsDataURL(file);
        }
    }, []);

    const handleDataNascimentoChange = useCallback((e) => {
        setDadosEdicao(prev => ({ ...prev, datanascimentoprofessor: e.target.value }));
    }, []);

    const handleDataAdmissaoChange = useCallback((e) => {
        setDadosEdicao(prev => ({ ...prev, dataadmissaoprofessor: e.target.value }));
    }, []);

    const salvarEdicao = useCallback(async (e) => {
        e?.preventDefault();
        
        if (!dadosEdicao.nomeprofessor?.trim()) {
            showErrorToast("Validação", "Preencha o nome do professor");
            return;
        }

        setSalvando(true);
        try {
            await apiClient.put(`/put/atulizarprofessor/${dadosEdicao.idprofessor}`, {
                codigoprofessor: dadosEdicao.codigoprofessor,
                nomeprofessor: dadosEdicao.nomeprofessor,
                generoprofessor: dadosEdicao.generoprofessor,
                nacionalidadeprofessor: dadosEdicao.nacionalidadeprofessor,
                estadocivilprofessor: dadosEdicao.estadocivilprofessor,
                nomepaiprofessor: dadosEdicao.nomepaiprofessor,
                nomemaeprofessor: dadosEdicao.nomemaeprofessor,
                nbiprofessor: dadosEdicao.nbiprofessor,
                datanascimentoprofessor: dadosEdicao.datanascimentoprofessor,
                residenciaprofessor: dadosEdicao.residenciaprofessor,
                telefoneprofessor: dadosEdicao.telefoneprofessor,
                whatsappprofessor: dadosEdicao.whatsappprofessor,
                emailprofessor: dadosEdicao.emailprofessor,
                anoexperienciaprofessor: dadosEdicao.anoexperienciaprofessor,
                titulacaoprofessor: dadosEdicao.titulacaoprofessor,
                dataadmissaoprofessor: dadosEdicao.dataadmissaoprofessor,
                condicoesprofessor: dadosEdicao.condicoesprofessor,
                ibanprofessor: dadosEdicao.ibanprofessor,
                tipocontratoprofessor: dadosEdicao.tipocontratoprofessor,
                tiposanguineoprofessor: dadosEdicao.tiposanguineoprofessor,
                contactoemergenciaprofessor: dadosEdicao.contactoemergenciaprofessor,
                foto: dadosEdicao.fotoUrl,
                curriculo: dadosEdicao.curriculoUrl
            });

            showSuccessToast(
                "Sucesso",
                "Professor atualizado com sucesso",
                { "Professor": dadosEdicao.nomeprofessor }
            );
            
            await fetchProfessores(false);
            fecharModalEditar();
        } catch (error) {
            console.error("Erro ao atualizar professor:", error);
            showErrorToast("Erro", "Não foi possível atualizar o professor");
        } finally {
            setSalvando(false);
        }
    }, [dadosEdicao, apiClient, fetchProfessores]);

    const abrirModalAdicionarDisciplina = useCallback(() => {
        setModalAdicionarDisciplinaAberto(true);
    }, []);

    const fecharModalAdicionarDisciplina = useCallback(() => {
        setModalAdicionarDisciplinaAberto(false);
        setIdDisciplina("");
        setIdProfessor("");
    }, []);

    const adicionarDisciplinaProfessor = useCallback(async (e) => {
        e?.preventDefault();
        
        if (!iddisciplina || !idprofessor) {
            showErrorToast("Seleção Incompleta", "Por favor, selecione uma disciplina e um professor.");
            return;
        }
        
        setSalvando(true);
        
        try {
            const response = await fetch(`${API_BASE_URL}/post/registrerDisciplinaProfessor`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    iddisciplina,
                    idprofessor
                }),
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.mensagem || 'Erro ao adicionar disciplina ao professor');
            }
            
            if (data.sucesso) {
                showSuccessToast(
                    data.titulo || "Disciplina Adicionada",
                    data.mensagem || "Disciplina adicionada ao professor com sucesso.",
                    {
                        "Professor": data.dados?.professor_nome,
                        "Disciplina": data.dados?.disciplina_nome
                    }
                );
                fecharModalAdicionarDisciplina();
            } else {
                showErrorToast(data.titulo || "Erro", data.mensagem);
            }
            
        } catch (error) {
            console.error("Erro:", error);
            showErrorToast("Erro no Processamento", error.message);
        } finally {
            setSalvando(false);
        }
    }, [iddisciplina, idprofessor, fecharModalAdicionarDisciplina]);

    const removerDisciplina = useCallback(async (iddisciplina, disciplinaNome, idProfessor, professorNome) => {
        showConfirmToast(
            `Tem certeza que deseja desvincular a disciplina "${disciplinaNome}" do professor ${professorNome}?`,
            async () => {
                try {
                    setRemovendoDisciplina(iddisciplina);
                    showInfoToast("Processando", `Removendo disciplina...`);

                    await apiClient.delete(`/delete/desvincularProfessorDisciplina/${iddisciplina}?idprofessor=${idProfessor}`);
                    
                    showSuccessToast(
                        "Sucesso",
                        "Disciplina desvinculada com sucesso",
                        { "Disciplina": disciplinaNome }
                    );

                    const response = await apiClient.get(`/get/professorVinculadoDisciplinas/${idProfessor}`);
                    setDisciplinasProfessor(response.data || []);
                    
                } catch (error) {
                    console.error("Erro ao remover disciplina:", error);
                    showErrorToast("Erro", "Não foi possível desvincular a disciplina");
                } finally {
                    setRemovendoDisciplina(null);
                }
            },
            null,
            "Confirmar Desvinculação"
        );
    }, [apiClient, showConfirmToast]);

    const deletarProfessor = (id, nome) => {
    showConfirmToast(
        `Tens a certeza que pretendes eliminar o professor ${nome}?`,
        async () => {
            try {
                const response = await axios.put(`http://localhost:8080/put/professor/desativar/${id}`);
                
                if (response.status === 200) {
                    // Recarrega a lista completa do servidor
                    await fetchProfessores(false);
                    showSuccessToast(`Professor ${nome} desativado com sucesso!`);
                }
            } catch (error) {
                console.error("Erro ao desativar professor:", error);
                if (error.response) {
                    showErrorToast(error.response.data.error || `Erro ao desativar professor ${nome}`);
                } else if (error.request) {
                    showErrorToast("Erro de conexão com o servidor");
                } else {
                    showErrorToast(`Erro ao desativar professor ${nome}`);
                }
            }
        }
    );
};

    const fecharModalInfo = useCallback(() => {
        setModalInfoAberto(false);
        setProfessorSelecionadoInfo(null);
    }, []);

    const fecharModalDisciplinas = useCallback(() => {
        setModalDisciplinasAberto(false);
        setDisciplinasProfessor([]);
        setProfessorSelecionado(null);
    }, []);

    const fecharModalEditar = useCallback(() => {
        setModalEditarAberto(false);
        setDadosEdicao({
            idprofessor: '',
            codigoprofessor: '',
            nomeprofessor: '',
            generoprofessor: '',
            nacionalidadeprofessor: '',
            estadocivilprofessor: '',
            nomepaiprofessor: '',
            nomemaeprofessor: '',
            nbiprofessor: '',
            datanascimentoprofessor: '',
            residenciaprofessor: '',
            telefoneprofessor: '',
            whatsappprofessor: '',
            emailprofessor: '',
            anoexperienciaprofessor: '',
            titulacaoprofessor: '',
            dataadmissaoprofessor: '',
            condicoesprofessor: '',
            ibanprofessor: '',
            tipocontratoprofessor: '',
            tiposanguineoprofessor: '',
            contactoemergenciaprofessor: '',
            fotoUrl: '',
            curriculoUrl: ''
        });
    }, []);

    useEffect(() => {
        fetchProfessores(false);
    }, [fetchProfessores]);

    const isEmpty = lista.length === 0 && !loading;
    const semResultados = !loading && listaFiltrada.length === 0 && termoPesquisa !== '';

    return (
        <div className="row mb-4">
            <div className="col-12">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2 className="h4 mb-0" style={{color:'var(--azul-escuro)'}}>
                        <MdPerson className="me-2 mb-2"/>
                        Professores
                    </h2>
                    <div className="d-flex gap-2">
                        {ultimaAtualizacao && (
                            <small className="text-muted align-self-end small">
                                Atualizado: {ultimaAtualizacao}
                            </small>
                        )}
                        <button 
                            className={`btn btn-sm ${Style.AtulizarDepartamento}`}
                            onClick={() => fetchProfessores(true)}
                            disabled={loading || isConfirming}
                            title="Atualizar lista"
                        >
                            <MdRefresh />
                        </button>
                        <button
                            className={`btn btn-sm ${Style.btnSubmit}`}
                            onClick={abrirModalAdicionar}
                            disabled={loading || salvando || isConfirming}
                            title="Adicionar novo professor"
                        >
                            <MdAdd className="me-1" />
                            Novo Professor
                        </button>
                        <button
                            className={`btn btn-sm ${Style.btnOutros}`}
                            onClick={abrirModalAdicionarDisciplina}
                            disabled={loading || salvando || isConfirming}
                            title="Adicionar disciplina a professor"
                        >
                            <MdAddCircleOutline className="me-1" />
                            Vincular Disciplina
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
                                                placeholder="Pesquisar professor por nome ou código..."
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
                                            {listaFiltrada.length} {listaFiltrada.length === 1 ? 'professor encontrado' : 'professores encontrados'}
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
                                <th className="col-1">Foto</th>
                                <th className="col-5">Nome</th>
                                <th className="col-2">Código</th>
                                <th className="col-1 text-center">Disciplinas</th>
                                <th className="col-1 text-center">Info</th>
                                <th className="col-1 text-center">Editar</th>
                                <th className="col-1 text-center">Apagar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-5">
                                        <div className="spinner-border text-primary mx-auto mb-2" style={{width: '3rem', height: '3rem'}} role="status">
                                            <span className="visually-hidden">Carregando...</span>
                                        </div>
                                        <p className="text-muted mb-0">Carregando professores...</p>
                                    </td>
                                </tr>
                            ) : semResultados ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-5">
                                        <MdSearch size={48} className="text-muted mb-3" />
                                        <p className="text-muted mb-2">Nenhum professor encontrado para "{termoPesquisa}"</p>
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
                                    <td colSpan="7" className="text-center py-5">
                                        <i className="bi bi-inbox display-4 text-muted mb-3 d-block"></i>
                                        <p className="text-muted mb-3">Nenhum professor encontrado</p>
                                        <button className="btn btn-outline-primary" onClick={() => fetchProfessores(true)}>
                                            <MdRefresh className="me-1" />
                                            Carregar professores
                                        </button>
                                    </td>
                                </tr>
                            ) : (
                                listaFiltrada.map((item) => (
                                    <tr key={item.idprofessor}>
                                        <td className="align-middle">
                                            <img
                                                src={item.fotoUrl || '/default-avatar.png'}
                                                alt={`Foto de ${item.nomeprofessor}`}
                                                className="img-fluid rounded-circle"
                                                style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                                onError={(e) => {
                                                    e.target.src = '/default-avatar.png';
                                                }}
                                            />
                                        </td>
                                        <td className="align-middle fw-semibold" style={{color:'var(--azul-escuro)'}}>
                                            <MdPerson className="me-2 mb-1"/>{item.nomeprofessor}
                                        </td>
                                        <td className="align-middle text-muted">
                                            <small>{item.codigoprofessor || 'N/I'}</small>
                                        </td>
                                        <td className="text-center">
                                            <button 
                                                className={`btn btn-sm ${Style.btnOutros}`}
                                                onClick={() => fetchDisciplinasProfessor(item.idprofessor, item.nomeprofessor)}
                                                disabled={loading || loadingDisciplinas || isConfirming}
                                                title={`Ver disciplinas de ${item.nomeprofessor}`}
                                            >
                                                <FaBook />
                                            </button>
                                        </td>
                                        <td className="text-center">
                                            <button 
                                                className={`btn btn-sm ${Style.btnOutros}`}
                                                onClick={() => fetchInfoProfessor(item)}
                                                disabled={loading || isConfirming}
                                                title={`Informações de ${item.nomeprofessor}`}
                                            >
                                                <FaInfoCircle />
                                            </button>
                                        </td>
                                        <td className="text-center">
                                            <button 
                                                className={`btn btn-sm ${Style.btnEditar}`}
                                                onClick={() => abrirModalEditar(item)}
                                                disabled={loading || salvando || isConfirming}
                                                title={`Editar ${item.nomeprofessor}`}
                                            >
                                                <MdEdit />
                                            </button>
                                        </td>
                                        <td className="text-center">
                                            <button 
                                                className={`btn btn-sm ${Style.btnDeletar}`}
                                                onClick={() => deletarProfessor(item.idprofessor,item.nomeprofessor)}
                                                disabled={loading || salvando || isConfirming}
                                                title={`Excluir ${item.nomeprofessor}`}
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

            {/* Modal de Adicionar Professor */}
            {modalAdicionarAberto && (
                <div className="modal fade show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,.5)'}}>
                    <div className="modal-dialog modal-dialog-centered modal-xl">
                        <div className="modal-content shadow-lg border-0">
                            <div className="modal-header" style={{backgroundColor:'var(--azul-escuro)',color:'var(--dourado)'}}>
                                <h5 className="modal-title mb-0">
                                    <IoMdPersonAdd className="me-2" />
                                    Registrar Novo Professor
                                </h5>
                                <button 
                                    type="button" 
                                    className="btn-close btn-close-white"
                                    onClick={fecharModalAdicionar}
                                    disabled={salvando || isConfirming}
                                />
                            </div>
                            <form onSubmit={adicionarProfessor} encType="multipart/form-data">
                                <div className="modal-body" style={{maxHeight: '70vh', overflowY: 'auto'}}>
                                    <div className="container-fluid">
                                        {/* Dados Pessoais */}
                                        <h6 className="mb-3" style={{color:'var(--azul-escuro)'}}>
                                            <IoMdPersonAdd className="me-2" />
                                            Dados Pessoais
                                        </h6>
                                        
                                        <div className="row">
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label small text-muted mb-1">Foto do Professor</label>
                                                <input 
                                                    type="file" 
                                                    className="form-control shadow-sm" 
                                                    name="fotoprofessor" 
                                                    accept="image/*" 
                                                    onChange={handleNovoProfessorInputChange}
                                                    disabled={salvando || isConfirming}
                                                />
                                            </div>
                                            
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label small text-muted mb-1">Nome Completo *</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="Nome Completo..." 
                                                    className="form-control shadow-sm" 
                                                    name="nomeprofessore" 
                                                    value={dadosNovoProfessor.nomeprofessore}
                                                    onChange={handleNovoProfessorInputChange}
                                                    disabled={salvando || isConfirming}
                                                    required
                                                />
                                            </div>
                                            
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label small text-muted mb-1">Gênero *</label>
                                                <select 
                                                    className="form-control shadow-sm" 
                                                    name="genero"
                                                    value={dadosNovoProfessor.genero}
                                                    onChange={handleNovoProfessorInputChange}
                                                    disabled={salvando || isConfirming}
                                                    required
                                                >
                                                    <option value="">Selecione o gênero</option>
                                                    <option value="Masculino">Masculino</option>
                                                    <option value="Feminino">Feminino</option>
                                                </select>
                                            </div>
                                            
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label small text-muted mb-1">Nacionalidade</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="Nacionalidade..." 
                                                    className="form-control shadow-sm" 
                                                    name="nacionalidadeprofessor"
                                                    value={dadosNovoProfessor.nacionalidadeprofessor}
                                                    onChange={handleNovoProfessorInputChange}
                                                    disabled={salvando || isConfirming}
                                                />
                                            </div>

                                            <div className="col-md-4 mb-3">
                                                <label className="form-label small text-muted mb-1">Estado Civil</label>
                                                <select 
                                                    className="form-control shadow-sm" 
                                                    name="estadocivilprofessor"
                                                    value={dadosNovoProfessor.estadocivilprofessor}
                                                    onChange={handleNovoProfessorInputChange}
                                                    disabled={salvando || isConfirming}
                                                >
                                                    <option value="">Selecione o estado civil</option>
                                                    <option value="Solteiro(a)">Solteiro(a)</option>
                                                    <option value="Casado(a)">Casado(a)</option>
                                                    <option value="Divorciado(a)">Divorciado(a)</option>
                                                    <option value="Viúvo(a)">Viúvo(a)</option>
                                                </select>
                                            </div>
                                            
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label small text-muted mb-1">Nome do Pai</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="Nome do Pai..." 
                                                    className="form-control shadow-sm" 
                                                    name="nomepaiprofessor"
                                                    value={dadosNovoProfessor.nomepaiprofessor}
                                                    onChange={handleNovoProfessorInputChange}
                                                    disabled={salvando || isConfirming}
                                                />
                                            </div>
                                            
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label small text-muted mb-1">Nome da Mãe</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="Nome da Mãe..." 
                                                    className="form-control shadow-sm" 
                                                    name="nomemaeprofessor"
                                                    value={dadosNovoProfessor.nomemaeprofessor}
                                                    onChange={handleNovoProfessorInputChange}
                                                    disabled={salvando || isConfirming}
                                                />
                                            </div>
                                            
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label small text-muted mb-1">Nº do B.I *</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="Nº B.I..." 
                                                    className="form-control shadow-sm" 
                                                    name="biprofessor"
                                                    value={dadosNovoProfessor.biprofessor}
                                                    onChange={handleNovoProfessorInputChange}
                                                    disabled={salvando || isConfirming}
                                                    required
                                                />
                                            </div>
                                            
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label small text-muted mb-1">Data de Nascimento</label>
                                                <input 
                                                    type="date" 
                                                    className="form-control shadow-sm" 
                                                    name="datanascimentoprofessor" 
                                                    value={dadosNovoProfessor.datanascimentoprofessor}
                                                    onChange={handleNovoProfessorInputChange}
                                                    disabled={salvando || isConfirming}
                                                />
                                            </div>
                                            
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label small text-muted mb-1">B.I Frente e Verso/Curriculum Vitae (PDF)</label>
                                                <input 
                                                    type="file" 
                                                    className="form-control shadow-sm" 
                                                    name="bipdfprofessor" 
                                                    accept=".pdf,application/pdf" 
                                                    onChange={handleNovoProfessorInputChange}
                                                    disabled={salvando || isConfirming}
                                                />
                                            </div>
                                        </div>

                                        {/* Dados de Contato */}
                                        <h6 className="mb-3 mt-4" style={{color:'var(--azul-escuro)'}}>
                                            <RiContactsBook3Line className="me-2" />
                                            Dados de Contato
                                        </h6>
                                        
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label small text-muted mb-1">Residência</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="Residência..." 
                                                    className="form-control shadow-sm"
                                                    name="residenciaprofessor"
                                                    value={dadosNovoProfessor.residenciaprofessor}
                                                    onChange={handleNovoProfessorInputChange}
                                                    disabled={salvando || isConfirming}
                                                />
                                            </div>
                                            
                                            <div className="col-md-3 mb-3">
                                                <label className="form-label small text-muted mb-1">Telefone</label>
                                                <input 
                                                    type="tel" 
                                                    placeholder="Telefone..." 
                                                    className="form-control shadow-sm" 
                                                    name="telefoneprofessor"
                                                    value={dadosNovoProfessor.telefoneprofessor}
                                                    onChange={handleNovoProfessorInputChange}
                                                    disabled={salvando || isConfirming}
                                                />
                                            </div>
                                            
                                            <div className="col-md-3 mb-3">
                                                <label className="form-label small text-muted mb-1">WhatsApp</label>
                                                <input 
                                                    type="tel" 
                                                    placeholder="WhatsApp..." 
                                                    className="form-control shadow-sm" 
                                                    name="whatsappprofessor"
                                                    value={dadosNovoProfessor.whatsappprofessor}
                                                    onChange={handleNovoProfessorInputChange}
                                                    disabled={salvando || isConfirming}
                                                />
                                            </div>
                                            
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label small text-muted mb-1">Email</label>
                                                <input 
                                                    type="email" 
                                                    placeholder="Email..." 
                                                    className="form-control shadow-sm" 
                                                    name="emailprofessor"
                                                    value={dadosNovoProfessor.emailprofessor}
                                                    onChange={handleNovoProfessorInputChange}
                                                    disabled={salvando || isConfirming}
                                                />
                                            </div>
                                            
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label small text-muted mb-1">Contacto de Emergência</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="Contacto de Emergência..." 
                                                    className="form-control shadow-sm"
                                                    name="contactoemergenciaprofessor"
                                                    value={dadosNovoProfessor.contactoemergenciaprofessor}
                                                    onChange={handleNovoProfessorInputChange}
                                                    disabled={salvando || isConfirming}
                                                />
                                            </div>
                                        </div>

                                        {/* Dados Profissionais */}
                                        <h6 className="mb-3 mt-4" style={{color:'var(--azul-escuro)'}}>
                                            <FaBriefcase className="me-2" />
                                            Dados Profissionais
                                        </h6>
                                        
                                        <div className="row">
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label small text-muted mb-1">Anos de Experiência</label>
                                                <input 
                                                    type="number" 
                                                    placeholder="Anos de Experiência..." 
                                                    className="form-control shadow-sm" 
                                                    name="anoexprienciaprofessor"
                                                    value={dadosNovoProfessor.anoexprienciaprofessor}
                                                    onChange={handleNovoProfessorInputChange}
                                                    min="1"
                                                    max="50"
                                                    step="1"
                                                    disabled={salvando || isConfirming}
                                                />
                                            </div>
                                            
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label small text-muted mb-1">Titulação</label>
                                                <select 
                                                    className="form-control shadow-sm" 
                                                    name="titulacaoprofessor"
                                                    value={dadosNovoProfessor.titulacaoprofessor}
                                                    onChange={handleNovoProfessorInputChange}
                                                    disabled={salvando || isConfirming}
                                                >
                                                    <option value="">Selecione o Titulo</option>
                                                    <option value="Licenciatura">Licenciatura</option>
                                                    <option value="Mestrado">Mestrado</option>
                                                    <option value="Doutoramento">Doutoramento</option>
                                                    <option value="Pós-Doutoramento">Pós-Doutoramento</option>
                                                </select>
                                            </div>
                                            
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label small text-muted mb-1">Data de Admissão</label>
                                                <input 
                                                    type="date" 
                                                    className="form-control shadow-sm" 
                                                    name="dataadmissaprofessor"
                                                    value={dadosNovoProfessor.dataadmissaprofessor}
                                                    onChange={handleNovoProfessorInputChange}
                                                    disabled={salvando || isConfirming}
                                                />
                                            </div>
                                            
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label small text-muted mb-1">Tipo de Contrato</label>
                                                <select 
                                                    className="form-control shadow-sm" 
                                                    name="tipocontratoprofessor"
                                                    value={dadosNovoProfessor.tipocontratoprofessor}
                                                    onChange={handleNovoProfessorInputChange}
                                                    disabled={salvando || isConfirming}
                                                >
                                                    <option value="">Selecione o tipo de Contrato</option>
                                                    <option value="Efetivo">Efetivo</option>
                                                    <option value="Contratado">Contratado</option>
                                                    <option value="Substituto">Substituto</option>
                                                    <option value="Estagiário">Estagiário</option>
                                                </select>
                                            </div>
                                            
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label small text-muted mb-1">IBAN</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="IBAN..." 
                                                    className="form-control shadow-sm" 
                                                    name="ibanprofessor"
                                                    value={dadosNovoProfessor.ibanprofessor}
                                                    onChange={handleNovoProfessorInputChange}
                                                    disabled={salvando || isConfirming}
                                                />
                                            </div>
                                        </div>

                                        {/* Dados de Saúde */}
                                        <h6 className="mb-3 mt-4" style={{color:'var(--azul-escuro)'}}>
                                            <MdOutlineLocalHospital className="me-2" />
                                            Dados de Saúde
                                        </h6>
                                        
                                        <div className="row">
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label small text-muted mb-1">Tipo Sanguíneo</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="Tipo Sanguíneo..." 
                                                    className="form-control shadow-sm" 
                                                    name="tiposanguineoprofessor"
                                                    value={dadosNovoProfessor.tiposanguineoprofessor}
                                                    onChange={handleNovoProfessorInputChange}
                                                    disabled={salvando || isConfirming}
                                                />
                                            </div>
                                            
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label small text-muted mb-1">Condições de Saúde/Alergia</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="Condições de Saúde/Alergia..." 
                                                    className="form-control shadow-sm" 
                                                    name="condicoesprofessor"
                                                    value={dadosNovoProfessor.condicoesprofessor}
                                                    onChange={handleNovoProfessorInputChange}
                                                    disabled={salvando || isConfirming}
                                                />
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
                                        disabled={salvando || isConfirming || !dadosNovoProfessor.nomeprofessore?.trim()}
                                    >
                                        {salvando ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Registrando...
                                            </>
                                        ) : (
                                            'Registrar Professor'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Adicionar Disciplina ao Professor */}
            {modalAdicionarDisciplinaAberto && (
                <div className="modal fade show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,.5)'}}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content shadow-lg border-0">
                            <div className="modal-header" style={{backgroundColor:'var(--azul-escuro)',color:'var(--dourado)'}}>
                                <h5 className="modal-title mb-0">
                                    <MdAddCircleOutline className="me-2" />
                                    Adicionar Disciplina ao Professor
                                </h5>
                                <button 
                                    type="button" 
                                    className="btn-close btn-close-white"
                                    onClick={fecharModalAdicionarDisciplina}
                                    disabled={salvando || isConfirming}
                                />
                            </div>
                            <form onSubmit={adicionarDisciplinaProfessor}>
                                <div className="modal-body">
                                    <div className="row g-3">
                                        <div className="col-12">
                                            <SelectDisciplina 
                                                onChange={(e) => setIdDisciplina(e.target.value)} 
                                                value={iddisciplina} 
                                                name="iddisciplina" 
                                                disabled={salvando || isConfirming}
                                            />
                                        </div>
                                        <div className="col-12">
                                            <SelectProfessor 
                                                onChange={(e) => setIdProfessor(e.target.value)} 
                                                value={idprofessor} 
                                                name="idprofessor" 
                                                disabled={salvando || isConfirming}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer border-0">
                                    <button 
                                        type="button" 
                                        className={`btn ${Style.btnCancelar}`}
                                        onClick={fecharModalAdicionarDisciplina}
                                        disabled={salvando || isConfirming}
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        type="submit" 
                                        className={`btn ${Style.btnSubmit}`}
                                        disabled={salvando || isConfirming || !iddisciplina || !idprofessor}
                                    >
                                        {salvando ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Processando...
                                            </>
                                        ) : (
                                            'Adicionar Disciplina'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Disciplinas do Professor */}
            {modalDisciplinasAberto && professorSelecionado && (
                <div className="modal fade show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,.5)'}}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content shadow-lg border-0">
                            <div className="modal-header" style={{backgroundColor:'var(--azul-escuro)',color:'var(--dourado)'}}>
                                <h5 className="modal-title mb-0">
                                    <FaBook className="me-2" />
                                    Disciplinas do Professor {professorSelecionado.nomeprofessor}
                                </h5>
                                <button 
                                    type="button" 
                                    className="btn-close btn-close-white"
                                    onClick={fecharModalDisciplinas}
                                    disabled={loadingDisciplinas || isConfirming}
                                />
                            </div>
                            <div className="modal-body">
                                {loadingDisciplinas ? (
                                    <div className="text-center py-4">
                                        <div className="spinner-border text-primary mb-3" role="status">
                                            <span className="visually-hidden">Carregando...</span>
                                        </div>
                                        <p className="text-muted">Carregando disciplinas...</p>
                                    </div>
                                ) : disciplinasProfessor.length > 0 ? (
                                    <div className="row">
                                        {disciplinasProfessor.map((disciplina) => (
                                            <div key={disciplina.iddisciplina} className="col-md-6 mb-2">
                                                <div className="p-3 border rounded d-flex justify-content-between align-items-center" 
                                                     style={{backgroundColor:'var(--cinza-claro)'}}>
                                                    <div className="d-flex align-items-center">
                                                        <MdBook className="me-2" style={{color:'var(--azul-escuro)'}} />
                                                        <span className="fw-semibold" style={{color:'var(--azul-escuro)'}}>
                                                            {disciplina.disciplina}
                                                        </span>
                                                    </div>
                                                    <button
                                                        className={`btn btn-sm ${Style.btnDeletar}`}
                                                        onClick={() => removerDisciplina(
                                                            disciplina.iddisciplina, 
                                                            disciplina.disciplina,
                                                            professorSelecionado.idprofessor,
                                                            professorSelecionado.nomeprofessor
                                                        )}
                                                        disabled={removendoDisciplina === disciplina.iddisciplina || isConfirming}
                                                        title="Desvincular disciplina"
                                                    >
                                                        {removendoDisciplina === disciplina.iddisciplina ? (
                                                            <span className="spinner-border spinner-border-sm"></span>
                                                        ) : (
                                                            <MdDeleteForever />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-4" style={{color:'var(--azul-escuro)'}}>
                                        <MdBook size={48} className="text-muted mb-3" />
                                        <p className="mb-0">Nenhuma disciplina atribuída a este professor.</p>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer border-0">
                                <button 
                                    type="button" 
                                    className={`btn ${Style.btnCancelar}`}
                                    onClick={fecharModalDisciplinas}
                                >
                                    Fechar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Informações do Professor */}
            {modalInfoAberto && professorSelecionadoInfo && (
                <div className="modal fade show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,.5)'}}>
                    <div className="modal-dialog modal-dialog-centered modal-xl">
                        <div className="modal-content shadow-lg border-0">
                            <div className="modal-header" style={{backgroundColor:'var(--azul-escuro)',color:'var(--dourado)'}}>
                                <h5 className="modal-title mb-0">
                                    <FaInfoCircle className="me-2" />
                                    Informações do Professor - {professorSelecionadoInfo.nomeprofessor}
                                </h5>
                                <button 
                                    type="button" 
                                    className="btn-close btn-close-white"
                                    onClick={fecharModalInfo}
                                />
                            </div>
                            <div className="modal-body" style={{maxHeight: '70vh', overflowY: 'auto'}}>
                                <div className="container-fluid">
                                    {/* Foto e Identificação */}
                                    <div className="row mb-4">
                                        <div className="col-md-2 text-center">
                                            <img
                                                src={professorSelecionadoInfo.fotoUrl || '/default-avatar.png'}
                                                className="rounded-circle border"
                                                style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                                                alt={professorSelecionadoInfo.nomeprofessor}
                                            />
                                            <h6 className="mt-2 mb-0" style={{color:'var(--azul-escuro)'}}>
                                                Código: {professorSelecionadoInfo.codigoprofessor || 'N/I'}
                                            </h6>
                                        </div>
                                        <div className="col-md-10">
                                            <div className="card bg-light border-0">
                                                <div className="card-body">
                                                    <h6 className="card-title" style={{color:'var(--azul-escuro)'}}>
                                                        <MdPerson className="me-2" />
                                                        Dados Pessoais
                                                    </h6>
                                                    <div className="row">
                                                        <div className="col-md-6">
                                                            <p className="mb-1"><strong>Nome Completo:</strong> {professorSelecionadoInfo.nomeprofessor || 'Não informado'}</p>
                                                            <p className="mb-1"><strong>Gênero:</strong> {professorSelecionadoInfo.generoprofessor || 'Não informado'}</p>
                                                            <p className="mb-1"><strong>Nacionalidade:</strong> {professorSelecionadoInfo.nacionalidadeprofessor || 'Não informado'}</p>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <p className="mb-1"><strong>Estado Civil:</strong> {professorSelecionadoInfo.estadocivilprofessor || 'Não informado'}</p>
                                                            <p className="mb-1"><strong>Data Nascimento:</strong> {professorSelecionadoInfo.datanascimentoFormatada || 'Não informada'}</p>
                                                            <p className="mb-1"><strong>Nº do BI:</strong> {professorSelecionadoInfo.nbiprofessor || 'Não informado'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <hr className="my-4" />

                                    {/* Contato e Residência */}
                                    <h6 className="mb-3" style={{color:'var(--azul-escuro)'}}>
                                        <RiContactsBook3Line className="me-2" />
                                        Contato e Residência
                                    </h6>
                                    <div className="row mb-4">
                                        <div className="col-md-4">
                                            <div className="card bg-light border-0 h-100">
                                                <div className="card-body">
                                                    <p className="mb-1"><MdLocationOn className="me-1" /> <strong>Residência:</strong></p>
                                                    <p className="mb-0">{professorSelecionadoInfo.residenciaprofessor || 'Não informado'}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="card bg-light border-0 h-100">
                                                <div className="card-body">
                                                    <p className="mb-1"><MdPhone className="me-1" /> <strong>Telefone:</strong></p>
                                                    <p className="mb-0">{professorSelecionadoInfo.telefoneprofessor || 'Não informado'}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="card bg-light border-0 h-100">
                                                <div className="card-body">
                                                    <p className="mb-1"><MdEmail className="me-1" /> <strong>Email:</strong></p>
                                                    <p className="mb-0">{professorSelecionadoInfo.emailprofessor || 'Não informado'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <hr className="my-4" />

                                    {/* Dados Profissionais */}
                                    <h6 className="mb-3" style={{color:'var(--azul-escuro)'}}>
                                        <FaBriefcase className="me-2" />
                                        Dados Profissionais
                                    </h6>
                                    <div className="row mb-4">
                                        <div className="col-md-3">
                                            <div className="card bg-light border-0">
                                                <div className="card-body">
                                                    <strong>Anos de Experiência:</strong>
                                                    <p className="mb-0 mt-1">{professorSelecionadoInfo.anoexperienciaprofessor || '0'}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="card bg-light border-0">
                                                <div className="card-body">
                                                    <strong>Titularidade:</strong>
                                                    <p className="mb-0 mt-1">{professorSelecionadoInfo.titulacaoprofessor || 'Não informado'}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="card bg-light border-0">
                                                <div className="card-body">
                                                    <strong>Data Admissão:</strong>
                                                    <p className="mb-0 mt-1">{professorSelecionadoInfo.dataadmissaoFormatada || 'Não informada'}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="card bg-light border-0">
                                                <div className="card-body">
                                                    <strong>Tipo Contrato:</strong>
                                                    <p className="mb-0 mt-1">{professorSelecionadoInfo.tipocontratoprofessor || 'Não informado'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <hr className="my-4" />

                                    {/* Dados Bancários e Saúde */}
                                    <h6 className="mb-3" style={{color:'var(--azul-escuro)'}}>
                                        <FaUniversity className="me-2" />/<FaHeartbeat className="me-2" />
                                        Dados Bancários e Saúde
                                    </h6>
                                    <div className="row mb-4">
                                        <div className="col-md-4">
                                            <div className="card bg-light border-0">
                                                <div className="card-body">
                                                    <strong>IBAN:</strong>
                                                    <p className="mb-0 mt-1">{professorSelecionadoInfo.ibanprofessor || 'Não informado'}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="card bg-light border-0">
                                                <div className="card-body">
                                                    <strong>Tipo Sanguíneo:</strong>
                                                    <p className="mb-0 mt-1">{professorSelecionadoInfo.tiposanguineoprofessor || 'Não informado'}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="card bg-light border-0">
                                                <div className="card-body">
                                                    <strong>Contacto Emergência:</strong>
                                                    <p className="mb-0 mt-1">{professorSelecionadoInfo.contactoemergenciaprofessor || 'Não informado'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Documentos */}
                                    <h6 className="mb-3" style={{color:'var(--azul-escuro)'}}>
                                        <MdAttachFile className="me-2" />
                                        Documentos
                                    </h6>
                                    <div className="row mb-4">
                                        <div className="col-md-12">
                                            <div className="card bg-light border-0">
                                                <div className="card-body">
                                                    {professorSelecionadoInfo.curriculoUrl ? (
                                                        <a
                                                            href={professorSelecionadoInfo.curriculoUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="btn btn-primary"
                                                        >
                                                            <MdAttachFile className="me-2" />
                                                            Visualizar Documento (BI/CV)
                                                        </a>
                                                    ) : (
                                                        <span className="text-muted">Nenhum documento anexado</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer border-0">
                                <button 
                                    type="button" 
                                    className={`btn ${Style.btnCancelar}`}
                                    onClick={fecharModalInfo}
                                >
                                    Fechar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Edição */}
            {modalEditarAberto && (
                <div className="modal fade show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,.5)'}}>
                    <div className="modal-dialog modal-dialog-centered modal-xl">
                        <div className="modal-content shadow-lg border-0">
                            <div className="modal-header" style={{backgroundColor:'var(--azul-escuro)',color:'var(--dourado)'}}>
                                <h5 className="modal-title mb-0">
                                    <MdEdit className="me-2" />
                                    Editar Professor - {dadosEdicao.nomeprofessor}
                                </h5>
                                <button 
                                    type="button" 
                                    className="btn-close btn-close-white"
                                    onClick={fecharModalEditar}
                                    disabled={salvando || isConfirming}
                                />
                            </div>
                            <form onSubmit={salvarEdicao}>
                                <div className="modal-body" style={{maxHeight: '70vh', overflowY: 'auto'}}>
                                    <div className="container-fluid">
                                        {/* Foto */}
                                        <div className="row mb-4">
                                            <div className="col-md-12 text-center">
                                                <div className="position-relative d-inline-block">
                                                    <img
                                                        src={dadosEdicao.fotoUrl || '/default-avatar.png'}
                                                        className="rounded-circle border"
                                                        style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                                                        alt={dadosEdicao.nomeprofessor}
                                                    />
                                                    <label
                                                        htmlFor="fotoProfessor"
                                                        className="position-absolute bottom-0 end-0 bg-white rounded-circle p-2 shadow-sm"
                                                        style={{ cursor: 'pointer', transform: 'translate(-10%, -10%)' }}
                                                    >
                                                        <MdCameraAlt style={{color:'var(--azul-escuro)'}} />
                                                    </label>
                                                    <input
                                                        type="file"
                                                        className="d-none"
                                                        id="fotoProfessor"
                                                        accept="image/*"
                                                        onChange={(e) => handleFotoChange(e, false)}
                                                        disabled={salvando || isConfirming}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Identificação Básica */}
                                        <h6 className="mb-3" style={{color:'var(--azul-escuro)'}}>
                                            <MdPerson className="me-2" />
                                            Identificação Básica
                                        </h6>
                                        <div className="row">
                                            <div className="col-md-4 mb-3">
                                                <input
                                                    type="text"
                                                    className="form-control shadow-sm"
                                                    name="codigoprofessor"
                                                    value={dadosEdicao.codigoprofessor}
                                                    onChange={handleInputChange}
                                                    placeholder="Código do Professor"
                                                    disabled={salvando || isConfirming}
                                                />
                                            </div>
                                            <div className="col-md-8 mb-3">
                                                <input
                                                    type="text"
                                                    className="form-control shadow-sm"
                                                    name="nomeprofessor"
                                                    value={dadosEdicao.nomeprofessor}
                                                    onChange={handleInputChange}
                                                    placeholder="Nome Completo *"
                                                    disabled={salvando || isConfirming}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* Dados Pessoais */}
                                        <h6 className="mb-3" style={{color:'var(--azul-escuro)'}}>
                                            <FaIdCard className="me-2" />
                                            Dados Pessoais
                                        </h6>
                                        <div className="row">
                                            <div className="col-md-3 mb-3">
                                                <select
                                                    className="form-select shadow-sm"
                                                    name="generoprofessor"
                                                    value={dadosEdicao.generoprofessor}
                                                    onChange={handleInputChange}
                                                    disabled={salvando || isConfirming}
                                                >
                                                    <option value="">Gênero</option>
                                                    <option value="Masculino">Masculino</option>
                                                    <option value="Feminino">Feminino</option>
                                                    <option value="Outro">Outro</option>
                                                </select>
                                            </div>
                                            <div className="col-md-3 mb-3">
                                                <input
                                                    type="text"
                                                    className="form-control shadow-sm"
                                                    name="nacionalidadeprofessor"
                                                    value={dadosEdicao.nacionalidadeprofessor}
                                                    onChange={handleInputChange}
                                                    placeholder="Nacionalidade"
                                                    disabled={salvando || isConfirming}
                                                />
                                            </div>
                                            <div className="col-md-3 mb-3">
                                                <select
                                                    className="form-select shadow-sm"
                                                    name="estadocivilprofessor"
                                                    value={dadosEdicao.estadocivilprofessor}
                                                    onChange={handleInputChange}
                                                    disabled={salvando || isConfirming}
                                                >
                                                    <option value="">Estado Civil</option>
                                                    <option value="Solteiro(a)">Solteiro(a)</option>
                                                    <option value="Casado(a)">Casado(a)</option>
                                                    <option value="Divorciado(a)">Divorciado(a)</option>
                                                    <option value="Viúvo(a)">Viúvo(a)</option>
                                                </select>
                                            </div>
                                            <div className="col-md-3 mb-3">
                                                <input
                                                    type="date"
                                                    className="form-control shadow-sm"
                                                    name="datanascimentoprofessor"
                                                    value={dadosEdicao.datanascimentoprofessor}
                                                    onChange={handleDataNascimentoChange}
                                                    disabled={salvando || isConfirming}
                                                />
                                            </div>
                                            <div className="col-md-4 mb-3">
                                                <input
                                                    type="text"
                                                    className="form-control shadow-sm"
                                                    name="nomepaiprofessor"
                                                    value={dadosEdicao.nomepaiprofessor}
                                                    onChange={handleInputChange}
                                                    placeholder="Nome do Pai"
                                                    disabled={salvando || isConfirming}
                                                />
                                            </div>
                                            <div className="col-md-4 mb-3">
                                                <input
                                                    type="text"
                                                    className="form-control shadow-sm"
                                                    name="nomemaeprofessor"
                                                    value={dadosEdicao.nomemaeprofessor}
                                                    onChange={handleInputChange}
                                                    placeholder="Nome da Mãe"
                                                    disabled={salvando || isConfirming}
                                                />
                                            </div>
                                            <div className="col-md-4 mb-3">
                                                <input
                                                    type="text"
                                                    className="form-control shadow-sm"
                                                    name="nbiprofessor"
                                                    value={dadosEdicao.nbiprofessor}
                                                    onChange={handleInputChange}
                                                    placeholder="Nº do BI"
                                                    disabled={salvando || isConfirming}
                                                />
                                            </div>
                                        </div>

                                        {/* Contato e Residência */}
                                        <h6 className="mb-3" style={{color:'var(--azul-escuro)'}}>
                                            <RiContactsBook3Line className="me-2" />
                                            Contato e Residência
                                        </h6>
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <input
                                                    type="text"
                                                    className="form-control shadow-sm"
                                                    name="residenciaprofessor"
                                                    value={dadosEdicao.residenciaprofessor}
                                                    onChange={handleInputChange}
                                                    placeholder="Residência"
                                                    disabled={salvando || isConfirming}
                                                />
                                            </div>
                                            <div className="col-md-3 mb-3">
                                                <input
                                                    type="tel"
                                                    className="form-control shadow-sm"
                                                    name="telefoneprofessor"
                                                    value={dadosEdicao.telefoneprofessor}
                                                    onChange={handleInputChange}
                                                    placeholder="Telefone"
                                                    disabled={salvando || isConfirming}
                                                />
                                            </div>
                                            <div className="col-md-3 mb-3">
                                                <input
                                                    type="tel"
                                                    className="form-control shadow-sm"
                                                    name="whatsappprofessor"
                                                    value={dadosEdicao.whatsappprofessor}
                                                    onChange={handleInputChange}
                                                    placeholder="WhatsApp"
                                                    disabled={salvando || isConfirming}
                                                />
                                            </div>
                                            <div className="col-md-4 mb-3">
                                                <input
                                                    type="email"
                                                    className="form-control shadow-sm"
                                                    name="emailprofessor"
                                                    value={dadosEdicao.emailprofessor}
                                                    onChange={handleInputChange}
                                                    placeholder="Email"
                                                    disabled={salvando || isConfirming}
                                                />
                                            </div>
                                            <div className="col-md-4 mb-3">
                                                <input
                                                    type="text"
                                                    className="form-control shadow-sm"
                                                    name="contactoemergenciaprofessor"
                                                    value={dadosEdicao.contactoemergenciaprofessor}
                                                    onChange={handleInputChange}
                                                    placeholder="Contacto de Emergência"
                                                    disabled={salvando || isConfirming}
                                                />
                                            </div>
                                        </div>

                                        {/* Dados Profissionais */}
                                        <h6 className="mb-3" style={{color:'var(--azul-escuro)'}}>
                                            <FaBriefcase className="me-2" />
                                            Dados Profissionais
                                        </h6>
                                        <div className="row">
                                            <div className="col-md-3 mb-3">
                                                <input
                                                    type="number"
                                                    className="form-control shadow-sm"
                                                    name="anoexperienciaprofessor"
                                                    value={dadosEdicao.anoexperienciaprofessor}
                                                    onChange={handleInputChange}
                                                    placeholder="Anos de Experiência"
                                                    min="0"
                                                    disabled={salvando || isConfirming}
                                                />
                                            </div>
                                            <div className="col-md-3 mb-3">
                                                <select
                                                    className="form-select shadow-sm"
                                                    name="titulacaoprofessor"
                                                    value={dadosEdicao.titulacaoprofessor}
                                                    onChange={handleInputChange}
                                                    disabled={salvando || isConfirming}
                                                >
                                                    <option value="">Titularidade</option>
                                                    <option value="Licenciatura">Licenciatura</option>
                                                    <option value="Mestrado">Mestrado</option>
                                                    <option value="Doutoramento">Doutoramento</option>
                                                    <option value="Pós-Doutoramento">Pós-Doutoramento</option>
                                                </select>
                                            </div>
                                            <div className="col-md-3 mb-3">
                                                <input
                                                    type="date"
                                                    className="form-control shadow-sm"
                                                    name="dataadmissaoprofessor"
                                                    value={dadosEdicao.dataadmissaoprofessor}
                                                    onChange={handleDataAdmissaoChange}
                                                    disabled={salvando || isConfirming}
                                                />
                                            </div>
                                            <div className="col-md-3 mb-3">
                                                <select
                                                    className="form-select shadow-sm"
                                                    name="tipocontratoprofessor"
                                                    value={dadosEdicao.tipocontratoprofessor}
                                                    onChange={handleInputChange}
                                                    disabled={salvando || isConfirming}
                                                >
                                                    <option value="">Tipo Contrato</option>
                                                    <option value="Efetivo">Efetivo</option>
                                                    <option value="Contratado">Contratado</option>
                                                    <option value="Substituto">Substituto</option>
                                                    <option value="Estagiário">Estagiário</option>
                                                </select>
                                            </div>
                                            <div className="col-md-4 mb-3">
                                                <input
                                                    type="text"
                                                    className="form-control shadow-sm"
                                                    name="ibanprofessor"
                                                    value={dadosEdicao.ibanprofessor}
                                                    onChange={handleInputChange}
                                                    placeholder="IBAN"
                                                    disabled={salvando || isConfirming}
                                                />
                                            </div>
                                        </div>

                                        {/* Dados de Saúde */}
                                        <h6 className="mb-3" style={{color:'var(--azul-escuro)'}}>
                                            <MdOutlineLocalHospital className="me-2" />
                                            Dados de Saúde
                                        </h6>
                                        <div className="row">
                                            <div className="col-md-4 mb-3">
                                                <select
                                                    className="form-select shadow-sm"
                                                    name="tiposanguineoprofessor"
                                                    value={dadosEdicao.tiposanguineoprofessor}
                                                    onChange={handleInputChange}
                                                    disabled={salvando || isConfirming}
                                                >
                                                    <option value="">Tipo Sanguíneo</option>
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
                                                <input
                                                    type="text"
                                                    className="form-control shadow-sm"
                                                    name="condicoesprofessor"
                                                    value={dadosEdicao.condicoesprofessor}
                                                    onChange={handleInputChange}
                                                    placeholder="Condições Especiais"
                                                    disabled={salvando || isConfirming}
                                                />
                                            </div>
                                        </div>

                                        {/* Documentos */}
                                        <h6 className="mb-3" style={{color:'var(--azul-escuro)'}}>
                                            <MdAttachFile className="me-2" />
                                            Documentos
                                        </h6>
                                        <div className="row">
                                            <div className="col-md-12 mb-3">
                                                <div className="card bg-light border-0">
                                                    <div className="card-body">
                                                        {dadosEdicao.curriculoUrl && (
                                                            <a
                                                                href={dadosEdicao.curriculoUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="btn btn-outline-primary mb-3"
                                                            >
                                                                <MdAttachFile className="me-2" />
                                                                Visualizar Documento Atual
                                                            </a>
                                                        )}
                                                        <input
                                                            type="file"
                                                            className="form-control"
                                                            accept=".pdf,.doc,.docx"
                                                            onChange={(e) => {
                                                                const file = e.target.files[0];
                                                                if (file) {
                                                                    const reader = new FileReader();
                                                                    reader.onloadend = () => {
                                                                        setDadosEdicao(prev => ({
                                                                            ...prev,
                                                                            curriculoUrl: reader.result
                                                                        }));
                                                                    };
                                                                    reader.readAsDataURL(file);
                                                                }
                                                            }}
                                                            disabled={salvando || isConfirming}
                                                        />
                                                        <small className="text-muted d-block mt-2">
                                                            Formatos aceitos: PDF, DOC, DOCX
                                                        </small>
                                                    </div>
                                                </div>
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
                                        disabled={salvando || isConfirming || !dadosEdicao.nomeprofessor?.trim()}
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
        </div>
    );
}

export default ProfessorEdit;