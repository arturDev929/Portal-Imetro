import { useEffect, useState, useCallback, useMemo } from "react";
import { 
    MdEdit, MdDeleteForever, MdRefresh, MdSearch, MdAdd, MdPersonAdd, 
    MdVisibility, MdPerson, MdBook, MdRemoveCircle, MdCalendarToday,
    MdWarning, MdInfo, MdDelete, MdCancel, MdCheckCircle, MdRestore,
    MdSave, MdClose, MdOutlinePersonAdd, MdOutlineVisibility
} from "react-icons/md";
import { MdFlightClass } from "react-icons/md";
import api from "../../service/api";
import { showSuccessToast, showErrorToast, showInfoToast, useConfirmToast } from "../../components/global/CustomToast";
import CategoriaCursoAno from "./CategoriaCursoAno";
import Table from "../../components/global/Table";

const API_TIMEOUT = 5000;

function TurmasAdm() {
    const [lista, setLista] = useState([]);
    const [listaFiltrada, setListaFiltrada] = useState([]);
    const [termoPesquisa, setTermoPesquisa] = useState('');
    const [loading, setLoading] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [modoExibicao, setModoExibicao] = useState('ativas');
    
    const [dadosEdicao, setDadosEdicao] = useState({
        idperiodo: '',
        turma: '',
        periodo: '',
        anoletivo: '',
        idcurso: '',
        idanocurricular: '',
        idcategoriacurso: '',
        id_anoletivo: '',
        nomeCurso: '',
        nomeCategoria: '',
        anoCurricular: ''
    });
    
    const [modalProfessorAberto, setModalProfessorAberto] = useState(false);
    const [professorSelecionado, setProfessorSelecionado] = useState("");
    const [disciplinasTurma, setDisciplinasTurma] = useState([]);
    const [disciplinaSelecionada, setDisciplinaSelecionada] = useState("");
    const [turmaSelecionada, setTurmaSelecionada] = useState(null);
    const [carregandoDisciplinas, setCarregandoDisciplinas] = useState(false);
    const [carregandoProfessores, setCarregandoProfessores] = useState(false);
    const [professoresDisciplina, setProfessoresDisciplina] = useState([]);
    
    const [modalVisualizarAberto, setModalVisualizarAberto] = useState(false);
    const [professoresTurma, setProfessoresTurma] = useState([]);
    const [carregandoProfessoresTurma, setCarregandoProfessoresTurma] = useState(false);
    const [turmaVisualizar, setTurmaVisualizar] = useState(null);
    
    const [anoLetivoSelecionado, setAnoLetivoSelecionado] = useState("");
    const [anosLetivosDisponiveis, setAnosLetivosDisponiveis] = useState([]);
    
    const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null);
    const [modalEditarAberto, setModalEditarAberto] = useState(false);
    
    const [turmasDesativadas, setTurmasDesativadas] = useState([]);
    const [modalDesativadasAberto, setModalDesativadasAberto] = useState(false);
    const [carregandoDesativadas, setCarregandoDesativadas] = useState(false);

    // ==================== ESTADO PARA EXCLUSÃO DETALHADA ====================
    const [modalExclusaoDetalhada, setModalExclusaoDetalhada] = useState(false);
    const [dadosExclusao, setDadosExclusao] = useState(null);
    const [carregandoExclusao, setCarregandoExclusao] = useState(false);
    const [textoConfirmacao, setTextoConfirmacao] = useState('');

    // ==================== ESTADO PARA VER PROFESSORES POR SEMESTRE ====================
    const [modalProfessoresSemestre, setModalProfessoresSemestre] = useState(false);
    const [professoresPorSemestre, setProfessoresPorSemestre] = useState([]);
    const [carregandoProfSemestre, setCarregandoProfSemestre] = useState(false);

    const [user, setUser] = useState(null);
    const { showConfirmToast, isConfirming } = useConfirmToast();

    const periodos = ['Manhã', 'Tarde', 'Noite', 'Diurno'];

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
        const client = api.create({
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

    // ==================== DEFINIR getListaFiltradaPorModo ====================
    const getListaFiltradaPorModo = useCallback(() => {
        switch(modoExibicao) {
            case 'ativas':
                return lista.filter(item => item.anoletivo && item.status_anoletivo !== 'Desativado');
            case 'sem_ano':
                return lista.filter(item => !item.anoletivo || item.status_anoletivo === 'Sem Ano Letivo');
            case 'desativadas':
                return lista.filter(item => item.status_anoletivo === 'Desativado');
            default:
                return lista;
        }
    }, [lista, modoExibicao]);

    // ==================== REMOVER ITEM LOCAL ====================
    const removerItemLocal = useCallback((id) => {
        setLista(prev => {
            const updatedList = prev.filter(item => item.id_anoletivo !== id);
            return updatedList;
        });
        setListaFiltrada(prev => {
            const updatedList = prev.filter(item => item.id_anoletivo !== id);
            return updatedList;
        });
    }, []);

    // ==================== BUSCAR TODAS AS TURMAS ====================
    const fetchData = useCallback(async (mostrarNotificacao = false) => {
        try {
            setLoading(true);
            const response = await apiClient.get('/turmasCompletas');
            
            const dadosMapeados = (response.data || []).map(item => ({
                id_periodo: item.id_periodo,
                periodo: item.periodo || '',
                turma: item.turma || '',
                anoletivo: item.anoletivo || '',
                categoriacurso: item.categoriacurso || '',
                curso: item.curso || '',
                anocurricular: item.anocurricular || '',
                id_curso: item.id_curso || '',
                id_categoria: item.id_categoria || '',
                id_anocurricular: item.id_anocurricular || '',
                id_anoletivo: item.id_anoletivo || '',
                id_periodo_original: item.id_periodo_original || item.id_periodo,
                status_anoletivo: item.status_anoletivo || 'Sem Ano Letivo'
            }));
            
            setLista(dadosMapeados);
            setListaFiltrada(dadosMapeados);
            setUltimaAtualizacao(new Date().toLocaleTimeString('pt-BR'));

            const semAno = dadosMapeados.filter(item => item.status_anoletivo === 'Sem Ano Letivo' || !item.anoletivo);

            if (mostrarNotificacao && dadosMapeados.length > 0) {
                showSuccessToast(
                    "Sucesso",
                    "Dados atualizados com sucesso",
                    { 
                        "Total": `${dadosMapeados.length} turma(s)`,
                        "Com Ano Letivo": `${dadosMapeados.filter(t => t.anoletivo && t.status_anoletivo !== 'Desativado').length}`,
                        "Sem Ano Letivo": `${semAno.length}`
                    }
                );
            }
        } catch (error) {
            console.error("Erro ao buscar dados:", error);
            showErrorToast("Erro", "Não foi possível carregar as turmas");
        } finally {
            setLoading(false);
        }
    }, [apiClient]);

    // ==================== BUSCAR TURMAS DESATIVADAS ====================
    const fetchTurmasDesativadas = useCallback(async (mostrarNotificacao = false) => {
        setCarregandoDesativadas(true);
        try {
            const response = await apiClient.get('/turmasComAnoLetivoDesativado');
            setTurmasDesativadas(response.data || []);
            
            if (mostrarNotificacao) {
                showSuccessToast(
                    "Sucesso",
                    "Turmas desativadas carregadas",
                    { "Quantidade": `${response.data?.length || 0} turma(s)` }
                );
            }
        } catch (error) {
            console.error("Erro ao buscar turmas desativadas:", error);
            showErrorToast("Erro", "Não foi possível carregar as turmas desativadas");
            setTurmasDesativadas([]);
        } finally {
            setCarregandoDesativadas(false);
        }
    }, [apiClient]);

    // ==================== ATIVAR TURMA ====================
    const ativarTurma = useCallback(async (id_anoletivo, nome) => {
        if (!id_anoletivo) {
            showErrorToast("Erro", "Esta turma não possui ano letivo para ativar");
            return;
        }

        showConfirmToast(
            `Tem certeza que deseja ATIVAR a turma "${nome}"?`,
            async () => {
                try {
                    showInfoToast("Processando", `Ativando turma "${nome}"...`);

                    const response = await apiClient.put(`/periodo/ativar/${id_anoletivo}`);

                    showSuccessToast(
                        "Sucesso",
                        response.data?.message || `Turma "${nome}" ativada com sucesso`
                    );

                    setTurmasDesativadas(prev => prev.filter(t => t.id_anoletivo !== id_anoletivo));
                    await fetchData(false);
                    
                    const updatedDesativadas = turmasDesativadas.filter(t => t.id_anoletivo !== id_anoletivo);
                    if (updatedDesativadas.length === 0) {
                        setModalDesativadasAberto(false);
                    }
                } catch (error) {
                    console.error("Erro ao ativar turma:", error);
                    if (error.response?.data?.message) {
                        showErrorToast("Erro", error.response.data.message);
                    } else if (error.response?.status === 400) {
                        showErrorToast("Erro", error.response.data?.message || "Esta turma já está ativa");
                    } else {
                        showErrorToast(
                            "Erro ao ativar turma",
                            "Não foi possível ativar a turma. Tente novamente."
                        );
                    }
                }
            },
            null,
            "Confirmar Ativação"
        );
    }, [apiClient, fetchData, turmasDesativadas, showConfirmToast]);

    // ==================== ABRIR/FECHAR MODAL DESATIVADAS ====================
    const abrirModalDesativadas = useCallback(() => {
        setModalDesativadasAberto(true);
        fetchTurmasDesativadas(true);
    }, [fetchTurmasDesativadas]);

    const fecharModalDesativadas = useCallback(() => {
        setModalDesativadasAberto(false);
    }, []);

    // ==================== BUSCAR DISCIPLINAS DA TURMA ====================
    const fetchDisciplinasTurma = useCallback(async (idperiodo, anocurricular) => {
        setCarregandoDisciplinas(true);
        try {
            const response = await apiClient.get(`/disciplinasPorTurma/${idperiodo}/${anocurricular}`);
            if (response.data && response.data.length > 0) {
                setDisciplinasTurma(response.data);
            } else {
                setDisciplinasTurma([]);
                showInfoToast("Info", "Esta turma não possui disciplinas cadastradas para este ano");
            }
        } catch (error) {
            console.error("Erro ao buscar disciplinas:", error);
            setDisciplinasTurma([]);
            showErrorToast("Erro", "Não foi possível carregar as disciplinas da turma");
        } finally {
            setCarregandoDisciplinas(false);
        }
    }, [apiClient]);

    // ==================== BUSCAR PROFESSORES POR DISCIPLINA ====================
    const fetchProfessoresPorDisciplina = useCallback(async (iddisciplina) => {
        setCarregandoProfessores(true);
        setProfessorSelecionado("");
        try {
            const response = await apiClient.get(`/professoresPorDisciplina/${iddisciplina}`);
            if (response.data && response.data.length > 0) {
                setProfessoresDisciplina(response.data);
            } else {
                setProfessoresDisciplina([]);
                showInfoToast("Info", "Esta disciplina não possui professores vinculados");
            }
        } catch (error) {
            console.error("Erro ao buscar professores da disciplina:", error);
            setProfessoresDisciplina([]);
            showErrorToast("Erro", "Não foi possível carregar os professores da disciplina");
        } finally {
            setCarregandoProfessores(false);
        }
    }, [apiClient]);

    // ==================== BUSCAR PROFESSORES DA TURMA POR ANO LETIVO (CORRIGIDO) ====================
    const fetchProfessoresTurma = useCallback(async (idperiodo, anoletivo = null) => {
        setCarregandoProfessoresTurma(true);
        try {
            let url;
            if (anoletivo) {
                url = `/professoresPorTurma/${idperiodo}/${anoletivo}`;
            } else {
                url = `/professoresPorTurma/${idperiodo}`;
            }
            
            const response = await apiClient.get(url);
            console.log("Resposta da API de professores:", response.data);
            
            if (response.data && response.data.length > 0) {
                setProfessoresTurma(response.data);
                // Agrupar por semestre
                const agrupado = response.data.reduce((acc, prof) => {
                    const semestre = prof.semestre || 0;
                    if (!acc[semestre]) {
                        acc[semestre] = [];
                    }
                    acc[semestre].push(prof);
                    return acc;
                }, {});
                setProfessoresPorSemestre(agrupado);
            } else {
                setProfessoresTurma([]);
                setProfessoresPorSemestre({});
                if (anoletivo) {
                    showInfoToast("Info", `Esta turma não possui professores atribuídos para o ano letivo ${anoletivo}`);
                } else {
                    showInfoToast("Info", "Esta turma não possui professores atribuídos");
                }
            }
        } catch (error) {
            console.error("Erro ao buscar professores da turma:", error);
            setProfessoresTurma([]);
            setProfessoresPorSemestre({});
            showErrorToast("Erro", "Não foi possível carregar os professores da turma");
        } finally {
            setCarregandoProfessoresTurma(false);
        }
    }, [apiClient]);

    // ==================== BUSCAR ANOS LETIVOS DA TURMA ====================
    const fetchAnosLetivosTurma = useCallback(async (idperiodo) => {
        try {
            const response = await apiClient.get(`/anosLetivosTurma/${idperiodo}`);
            if (response.data && response.data.anos && response.data.anos.length > 0) {
                setAnosLetivosDisponiveis(response.data.anos);
                const anosOrdenados = [...response.data.anos].sort((a, b) => b.ano.localeCompare(a.ano));
                setAnoLetivoSelecionado(anosOrdenados[0].ano);
                return anosOrdenados[0].ano;
            } else {
                setAnosLetivosDisponiveis([]);
                setAnoLetivoSelecionado("");
                return null;
            }
        } catch (error) {
            console.error("Erro ao buscar anos letivos:", error);
            setAnosLetivosDisponiveis([]);
            setAnoLetivoSelecionado("");
            return null;
        }
    }, [apiClient]);

    // ==================== REMOVER PROFESSOR DA TURMA ====================
    const removerProfessorTurma = useCallback(async (idDp, nomeProfessor, disciplinaNome) => {
        showConfirmToast(
            `Tem certeza que deseja remover o professor "${nomeProfessor}" da disciplina "${disciplinaNome}"?`,
            async () => {
                try {
                    showInfoToast("Processando", `Removendo professor "${nomeProfessor}"...`);

                    const response = await apiClient.delete(`/removerProfessorTurma/${idDp}`);

                    showSuccessToast(
                        "Sucesso",
                        response.data.message || `Professor "${nomeProfessor}" removido com sucesso`
                    );

                    // Recarregar professores após remoção
                    await fetchProfessoresTurma(
                        turmaVisualizar?.id_periodo, 
                        anoLetivoSelecionado
                    );
                    
                    await fetchData(false);
                } catch (error) {
                    console.error("Erro ao remover professor:", error);

                    if (error.response?.data?.message) {
                        showErrorToast("Erro", error.response.data.message);
                    } else if (error.response?.data?.error) {
                        showErrorToast("Erro", error.response.data.error);
                    } else {
                        showErrorToast(
                            "Erro ao remover professor",
                            "Não foi possível remover o professor da turma. Tente novamente."
                        );
                    }
                }
            },
            null,
            "Confirmar Remoção"
        );
    }, [apiClient, fetchProfessoresTurma, turmaVisualizar, anoLetivoSelecionado, fetchData, showConfirmToast]);

    // ==================== BUSCAR INFORMAÇÕES PARA EXCLUSÃO ====================
    const fetchDeleteInfo = useCallback(async (id_periodo) => {
        setCarregandoExclusao(true);
        setDadosExclusao(null);
        setTextoConfirmacao('');
        
        try {
            const response = await apiClient.get(`/turmaDeleteInfo/${id_periodo}`);
            setDadosExclusao(response.data);
            setModalExclusaoDetalhada(true);
        } catch (error) {
            console.error("Erro ao buscar informações de exclusão:", error);
            showErrorToast("Erro", "Não foi possível carregar os dados da turma para exclusão");
        } finally {
            setCarregandoExclusao(false);
        }
    }, [apiClient]);

    // ==================== DELETAR TURMA COMPLETAMENTE ====================
    const deletarTurmaCompleta = useCallback(async () => {
        if (!dadosExclusao || !dadosExclusao.dados_gerais) {
            showErrorToast("Erro", "Dados da turma não disponíveis");
            return;
        }

        const nome = dadosExclusao.dados_gerais.turma || 'Turma sem nome';
        const idPeriodo = dadosExclusao.dados_gerais.id_periodo;

        if (textoConfirmacao !== nome) {
            showErrorToast("Confirmação inválida", `Digite exatamente o nome da turma: "${nome}"`);
            return;
        }

        showConfirmToast(
            `ATENÇÃO: Esta ação é irreversível! Todos os dados da turma "${nome}" serão permanentemente deletados. Deseja continuar?`,
            async () => {
                try {
                    showInfoToast("Processando", `Deletando turma "${nome}"...`);
                    
                    const response = await apiClient.delete(`/periodo/deletarCompleto/${idPeriodo}`);
                    
                    showSuccessToast(
                        "Sucesso",
                        response.data.message || `Turma "${nome}" deletada com sucesso`
                    );
                    
                    setModalExclusaoDetalhada(false);
                    setDadosExclusao(null);
                    setTextoConfirmacao('');
                    await fetchData(false);
                } catch (error) {
                    console.error("Erro ao deletar turma:", error);
                    if (error.response?.data?.error) {
                        showErrorToast("Erro", error.response.data.error);
                    } else {
                        showErrorToast(
                            "Erro ao deletar turma",
                            "Não foi possível deletar a turma. Tente novamente."
                        );
                    }
                }
            },
            null,
            "Confirmar Exclusão Permanente"
        );
    }, [dadosExclusao, textoConfirmacao, apiClient, fetchData, showConfirmToast]);

    // ==================== DESATIVAR TURMA ====================
    const desativarTurma = useCallback(async (id_anoletivo, nome) => {
        if (!id_anoletivo) {
            showErrorToast("Erro", "Esta turma não possui ano letivo para desativar");
            return;
        }

        showConfirmToast(
            `Tem certeza que deseja DESATIVAR o ano letivo da turma "${nome}"? Esta ação pode ser revertida.`,
            async () => {
                try {
                    showInfoToast("Processando", `Desativando turma "${nome}"...`);

                    const response = await apiClient.delete(`/periodo/desativar/${id_anoletivo}`);

                    showSuccessToast(
                        "Sucesso",
                        response.data?.message || `Turma "${nome}" desativada com sucesso`
                    );

                    removerItemLocal(id_anoletivo);
                    await fetchData(false);
                } catch (error) {
                    console.error("Erro detalhado ao desativar:", {
                        mensagem: error.message,
                        resposta: error.response?.data,
                        status: error.response?.status,
                        config: error.config
                    });

                    if (error.response?.data?.message) {
                        showErrorToast("Erro", error.response.data.message);
                    } else if (error.response?.status === 404) {
                        showErrorToast("Erro 404", "Rota não encontrada. Verifique o endpoint");
                    } else if (error.response?.status === 500) {
                        showErrorToast("Erro no servidor", error.response?.data?.error || "Erro interno do servidor");
                    } else {
                        showErrorToast(
                            "Erro ao desativar",
                            error.response?.data?.message || "Não foi possível desativar a turma"
                        );
                    }
                }
            },
            null,
            "Confirmar Desativação"
        );
    }, [apiClient, removerItemLocal, fetchData, showConfirmToast]);

    // ==================== ABRIR MODAL DE PROFESSORES POR SEMESTRE (CORRIGIDO) ====================
    const abrirModalProfessoresSemestre = useCallback(async (item) => {
        setCarregandoProfSemestre(true);
        setProfessoresPorSemestre({});
        setProfessoresTurma([]);
        setTurmaVisualizar(item);
        
        try {
            // Primeiro buscar os anos letivos disponíveis
            const anosResponse = await apiClient.get(`/anosLetivosTurma/${item.id_periodo}`);
            
            if (anosResponse.data && anosResponse.data.anos && anosResponse.data.anos.length > 0) {
                setAnosLetivosDisponiveis(anosResponse.data.anos);
                const anosOrdenados = [...anosResponse.data.anos].sort((a, b) => b.ano.localeCompare(a.ano));
                const anoSelecionado = anosOrdenados[0].ano;
                setAnoLetivoSelecionado(anoSelecionado);
                
                // Buscar professores para o ano letivo selecionado
                await fetchProfessoresTurma(item.id_periodo, anoSelecionado);
            } else {
                setAnosLetivosDisponiveis([]);
                setAnoLetivoSelecionado("");
                setProfessoresTurma([]);
                setProfessoresPorSemestre({});
                showInfoToast("Info", "Esta turma não possui anos letivos cadastrados");
            }
            
            setModalProfessoresSemestre(true);
        } catch (error) {
            console.error("Erro ao buscar professores:", error);
            showErrorToast("Erro", "Não foi possível carregar os professores da turma");
        } finally {
            setCarregandoProfSemestre(false);
        }
    }, [apiClient, fetchProfessoresTurma]);

    // ==================== VERIFICAR ANO LETIVO DUPLICADO ====================
    const verificarAnoLetivoDuplicado = useCallback(async (idPeriodo, ano) => {
        try {
            const response = await apiClient.get(`/verificarAnoLetivo/${idPeriodo}/${ano}`);
            return response.data;
        } catch (error) {
            console.error("Erro ao verificar ano letivo:", error);
            return { existe: false, erro: true };
        }
    }, [apiClient]);

    // ==================== PESQUISAR ====================
    const handlePesquisa = useCallback((e) => {
        const termo = e.target.value;
        setTermoPesquisa(termo);

        if (termo.trim() === '') {
            setListaFiltrada(getListaFiltradaPorModo());
        } else {
            const filtrados = getListaFiltradaPorModo().filter(item =>
                item.turma?.toLowerCase().includes(termo.toLowerCase()) ||
                item.periodo?.toLowerCase().includes(termo.toLowerCase()) ||
                item.anoletivo?.toString().includes(termo) ||
                item.curso?.toLowerCase().includes(termo.toLowerCase()) ||
                item.categoriacurso?.toLowerCase().includes(termo.toLowerCase()) ||
                item.anocurricular?.toString().includes(termo)
            );
            setListaFiltrada(filtrados);
        }
    }, [getListaFiltradaPorModo]);

    const limparPesquisa = useCallback(() => {
        setTermoPesquisa('');
        setListaFiltrada(getListaFiltradaPorModo());
    }, [getListaFiltradaPorModo]);

    // ==================== FILTROS DE EXIBIÇÃO ====================
    const getFiltroLabel = useCallback(() => {
        switch(modoExibicao) {
            case 'ativas': return 'Com Ano Letivo';
            case 'sem_ano': return 'Sem Ano Letivo';
            case 'desativadas': return 'Desativadas';
            default: return 'Todas';
        }
    }, [modoExibicao]);

    useEffect(() => {
        setListaFiltrada(getListaFiltradaPorModo());
    }, [lista, modoExibicao, getListaFiltradaPorModo]);

    useEffect(() => {
        fetchData(false);
    }, [fetchData]);

    // ==================== FUNÇÕES DE EDIÇÃO ====================
    const abrirModalEditar = useCallback((item) => {
        setDadosEdicao({
            idperiodo: item.id_periodo,
            turma: item.turma || '',
            periodo: item.periodo || '',
            anoletivo: item.anoletivo || '',
            idcurso: item.id_curso || '',
            idanocurricular: item.id_anocurricular || '',
            idcategoriacurso: item.id_categoria || '',
            id_anoletivo: item.id_anoletivo || '',
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
                id_anoletivo: '',
                nomeCurso: '',
                nomeCategoria: '',
                anoCurricular: ''
            });
        }
    }, [salvando]);

    const handleCategoriaCursoAnoEditChange = useCallback((data) => {
        setDadosEdicao(prev => ({
            ...prev,
            idcategoriacurso: data.id_categoria || '',
            idcurso: data.id_curso || '',
            idanocurricular: data.id_anocurricular || ''
        }));
    }, []);

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setDadosEdicao(prev => ({ ...prev, [name]: value }));
    }, []);

    // ==================== SALVAR EDIÇÃO CORRIGIDA ====================
    const salvarEdicao = useCallback(async (e) => {
        e?.preventDefault();

        // VALIDAÇÕES BÁSICAS
        if (!dadosEdicao.turma?.trim()) {
            showErrorToast("Validação", "Preencha o nome da turma");
            return;
        }

        if (!dadosEdicao.idcategoriacurso) {
            showErrorToast("Validação", "Selecione a categoria");
            return;
        }

        if (!dadosEdicao.idcurso) {
            showErrorToast("Validação", "Selecione o curso");
            return;
        }

        if (!dadosEdicao.idanocurricular) {
            showErrorToast("Validação", "Selecione o ano curricular");
            return;
        }

        if (!dadosEdicao.periodo) {
            showErrorToast("Validação", "Selecione o período");
            return;
        }

        // ==================== VALIDAÇÃO DE DUPLICIDADE DE NOME DA TURMA ====================
        try {
            const turmaDuplicada = lista.find(item => 
                item.id_periodo !== dadosEdicao.idperiodo &&
                item.turma?.toLowerCase() === dadosEdicao.turma.trim().toLowerCase() &&
                item.id_curso === dadosEdicao.idcurso &&
                item.periodo === dadosEdicao.periodo
            );

            if (turmaDuplicada) {
                showErrorToast(
                    "Turma Duplicada",
                    `Já existe uma turma com o nome "${dadosEdicao.turma}" no curso "${turmaDuplicada.curso}" no período "${turmaDuplicada.periodo}"`
                );
                return;
            }

            // ==================== ANO LETIVO PODE SER IGUAL ====================
            if (dadosEdicao.anoletivo && dadosEdicao.anoletivo.trim()) {
                const verificar = await verificarAnoLetivoDuplicado(
                    dadosEdicao.idperiodo,
                    dadosEdicao.anoletivo.trim()
                );
                
                if (verificar.existe) {
                    showInfoToast(
                        "Ano Letivo Existente",
                        `O ano letivo "${dadosEdicao.anoletivo}" já existe para esta turma. Será utilizado o existente.`
                    );
                }
            }

        } catch (error) {
            console.error("Erro ao validar duplicidade:", error);
            showErrorToast("Erro", "Erro ao validar dados da turma");
            return;
        }

        setSalvando(true);
        try {
            const payload = {
                id_anocurricular: dadosEdicao.idanocurricular,
                id_curso: dadosEdicao.idcurso,
                id_categoria: dadosEdicao.idcategoriacurso,
                turma: dadosEdicao.turma.trim(),
                periodo: dadosEdicao.periodo,
                idAdm: user?.id,
                id_anoletivo: dadosEdicao.id_anoletivo || null,
                anoletivo: dadosEdicao.anoletivo || null
            };

            const response = await apiClient.put(`/periodo/${dadosEdicao.idperiodo}`, payload);

            showSuccessToast(
                "Sucesso",
                response.data.message || "Turma atualizada com sucesso"
            );

            await fetchData(false);
            fecharModalEditar();
        } catch (error) {
            console.error("Erro ao editar:", error);

            if (error.response?.data?.mensagem) {
                showErrorToast("Erro", error.response.data.mensagem);
            } else if (error.response?.data?.message) {
                showErrorToast("Erro", error.response.data.message);
            } else {
                showErrorToast(
                    "Erro ao editar",
                    "Não foi possível atualizar a turma. Tente novamente."
                );
            }
        } finally {
            setSalvando(false);
        }
    }, [dadosEdicao, apiClient, fetchData, fecharModalEditar, user, lista, verificarAnoLetivoDuplicado]);

    // ==================== FUNÇÕES DE ATRIBUIÇÃO DE PROFESSOR ====================
    const abrirModalProfessor = useCallback(async (item) => {
        setTurmaSelecionada(item);
        setProfessorSelecionado("");
        setDisciplinaSelecionada("");
        setProfessoresDisciplina([]);
        
        if (item.anocurricular) {
            await fetchDisciplinasTurma(item.id_periodo, item.anocurricular);
        } else {
            showInfoToast("Info", "Esta turma não possui ano curricular definido");
            setDisciplinasTurma([]);
        }
        
        setModalProfessorAberto(true);
    }, [fetchDisciplinasTurma]);

    const handleDisciplinaChange = useCallback(async (e) => {
        const iddisciplina = e.target.value;
        setDisciplinaSelecionada(iddisciplina);
        setProfessorSelecionado("");
        if (iddisciplina) {
            await fetchProfessoresPorDisciplina(iddisciplina);
        } else {
            setProfessoresDisciplina([]);
        }
    }, [fetchProfessoresPorDisciplina]);

    const fecharModalProfessor = useCallback(() => {
        if (!salvando) {
            setModalProfessorAberto(false);
            setTurmaSelecionada(null);
            setProfessorSelecionado("");
            setDisciplinaSelecionada("");
            setDisciplinasTurma([]);
            setProfessoresDisciplina([]);
        }
    }, [salvando]);

    const salvarAtribuicaoProfessor = useCallback(async (e) => {
        e?.preventDefault();

        if (!turmaSelecionada) {
            showErrorToast("Erro", "Nenhuma turma selecionada");
            return;
        }

        if (!disciplinaSelecionada) {
            showErrorToast("Validação", "Selecione uma disciplina");
            return;
        }

        if (!professorSelecionado) {
            showErrorToast("Validação", "Selecione um professor");
            return;
        }

        if (!user || !user.id) {
            showErrorToast("Erro", "Usuário não autenticado");
            return;
        }

        setSalvando(true);
        try {
            const response = await apiClient.post('/atribuirProfessorTurma', {
                id_periodo: turmaSelecionada.id_periodo,
                id_disciplina: disciplinaSelecionada,
                id_professor: professorSelecionado,
                id_anoletivo: turmaSelecionada.id_anoletivo || null,
                idAdm: user.id
            });

            showSuccessToast(
                "Sucesso",
                response.data.message || "Professor atribuído com sucesso"
            );

            fecharModalProfessor();
            await fetchData(false);
        } catch (error) {
            console.error("Erro ao atribuir professor:", error);

            if (error.response?.data?.message) {
                showErrorToast("Erro", error.response.data.message);
            } else if (error.response?.data?.error) {
                showErrorToast("Erro", error.response.data.error);
            } else {
                showErrorToast(
                    "Erro ao atribuir professor",
                    "Não foi possível atribuir o professor. Tente novamente."
                );
            }
        } finally {
            setSalvando(false);
        }
    }, [turmaSelecionada, disciplinaSelecionada, professorSelecionado, user, apiClient, fecharModalProfessor, fetchData]);

    // ==================== FUNÇÕES DE VISUALIZAÇÃO ====================
    const abrirModalVisualizar = useCallback(async (item) => {
        setTurmaVisualizar(item);
        setProfessoresTurma([]);
        setAnosLetivosDisponiveis([]);
        setAnoLetivoSelecionado("");
        setModalVisualizarAberto(true);
        
        const anoLetivoPadrao = await fetchAnosLetivosTurma(item.id_periodo);
        
        if (anoLetivoPadrao) {
            await fetchProfessoresTurma(item.id_periodo, anoLetivoPadrao);
        }
    }, [fetchAnosLetivosTurma, fetchProfessoresTurma]);

    const handleAnoLetivoChange = useCallback(async (e) => {
        const ano = e.target.value;
        setAnoLetivoSelecionado(ano);
        if (turmaVisualizar && ano) {
            await fetchProfessoresTurma(turmaVisualizar.id_periodo, ano);
        }
    }, [turmaVisualizar, fetchProfessoresTurma]);

    const fecharModalVisualizar = useCallback(() => {
        setModalVisualizarAberto(false);
        setTurmaVisualizar(null);
        setProfessoresTurma([]);
        setAnosLetivosDisponiveis([]);
        setAnoLetivoSelecionado("");
    }, []);

    // ==================== RENDERIZAÇÃO ====================
    const isEmpty = lista.length === 0 && !loading;
    const semResultados = !loading && listaFiltrada.length === 0 && termoPesquisa !== '';

    const headers = ['Categoria', 'Curso', 'Ano', 'Turma', 'Período', 'Ano Letivo', 'Status', 'Professores', 'Atribuir', 'Editar', 'Desativar/Ativar', 'Excluir'];

    const renderRow = (item) => {
        const statusBadge = item.status_anoletivo === 'Ativo' ? 
            'bg-warning text-dark' : 
            item.status_anoletivo === 'Desativado' ? 'bg-secondary text-white' : 'bg-light text-dark border';
        
        const statusLabel = item.status_anoletivo || 'Sem Ano Letivo';

        const temAnoLetivo = item.anoletivo && item.id_anoletivo;
        const estaDesativada = item.status_anoletivo === 'Desativado';

        return (
            <tr key={`${item.id_periodo}-${item.anoletivo || 'semano'}`}>
                <td className="align-middle">{item.categoriacurso || '-'}</td>
                <td className="align-middle">{item.curso || '-'}</td>
                <td className="text-center align-middle">{item.anocurricular ? `${item.anocurricular}º` : '-'}</td>
                <td className="text-center align-middle fw-semibold">{item.turma || '-'}</td>
                <td className="text-center align-middle">{item.periodo || '-'}</td>
                <td className="text-center align-middle">{item.anoletivo || '-'}</td>
                <td className="text-center">
                    <span className={`badge ${statusBadge}`}>
                        {statusLabel}
                    </span>
                </td>
                <td className="text-center">
                    <button
                        className="btn btn-sm btn-primary"
                        onClick={() => abrirModalProfessoresSemestre(item)}
                        disabled={loading || isConfirming}
                        title="Ver professores por semestre"
                    >
                        <MdOutlineVisibility size={18} />
                    </button>
                </td>
                <td className="text-center">
                    <button
                        className="btn btn-sm btn-success"
                        onClick={() => abrirModalProfessor(item)}
                        disabled={loading || salvando || isConfirming}
                        title={`Atribuir professor para ${item.turma}`}
                    >
                        <MdOutlinePersonAdd size={18} />
                    </button>
                </td>
                <td className="text-center">
                    <button
                        className="btn btn-sm btn-warning"
                        onClick={() => abrirModalEditar(item)}
                        disabled={loading || salvando || isConfirming}
                        title={`Editar ${item.turma}`}
                    >
                        <MdEdit size={18} />
                    </button>
                </td>
                <td className="text-center">
                    {estaDesativada ? (
                        <button
                            className="btn btn-sm btn-success"
                            onClick={() => ativarTurma(item.id_anoletivo, item.turma)}
                            disabled={loading || salvando || isConfirming || !temAnoLetivo}
                            title={!temAnoLetivo ? 'Esta turma não tem ano letivo para ativar' : `Ativar ${item.turma}`}
                        >
                            <MdRestore size={18} />
                        </button>
                    ) : (
                        <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => desativarTurma(item.id_anoletivo, item.turma)}
                            disabled={loading || salvando || isConfirming || !temAnoLetivo}
                            title={!temAnoLetivo ? 'Esta turma não tem ano letivo para desativar' : `Desativar ${item.turma}`}
                        >
                            <MdRemoveCircle size={18} />
                        </button>
                    )}
                </td>
                <td className="text-center">
                    <button
                        className="btn btn-sm btn-danger"
                        onClick={() => fetchDeleteInfo(item.id_periodo)}
                        disabled={loading || salvando || isConfirming}
                        title={`Excluir permanentemente ${item.turma}`}
                    >
                        <MdDeleteForever size={18} />
                    </button>
                </td>
            </tr>
        );
    };

    // ==================== FILTROS UI ====================
    const renderFiltros = () => (
        <div className="btn-group mb-3 flex-wrap" role="group">
            <button
                className={`btn btn-sm ${modoExibicao === 'ativas' ? 'btn-warning' : 'btn-outline-primary'}`}
                onClick={() => setModoExibicao('ativas')}
            >
                <MdCheckCircle className="me-1" />
                Com Ano Letivo
                <span className="badge bg-light text-dark ms-1">
                    {lista.filter(i => i.anoletivo && i.status_anoletivo !== 'Desativado').length}
                </span>
            </button>
            <button
                className={`btn btn-sm ${modoExibicao === 'sem_ano' ? 'btn-secondary text-white' : 'btn-outline-warning'}`}
                onClick={() => setModoExibicao('sem_ano')}
            >
                <MdWarning className="me-1" />
                Sem Ano Letivo
                <span className="badge bg-light text-dark ms-1">
                    {lista.filter(i => !i.anoletivo || i.status_anoletivo === 'Sem Ano Letivo').length}
                </span>
            </button>
            <button
                className={`btn btn-sm ${modoExibicao === 'desativadas' ? 'btn-secondary text-white' : 'btn-outline-danger'}`}
                onClick={() => setModoExibicao('desativadas')}
            >
                <MdRemoveCircle className="me-1" />
                Desativadas
                <span className="badge bg-light text-dark ms-1">
                    {lista.filter(i => i.status_anoletivo === 'Desativado').length}
                </span>
            </button>
            <button
                className={`btn btn-sm ${modoExibicao === 'todas' ? 'btn-secondary' : 'btn-outline-secondary'}`}
                onClick={() => setModoExibicao('todas')}
            >
                <MdInfo className="me-1" />
                Todas
                <span className="badge bg-light text-dark ms-1">
                    {lista.length}
                </span>
            </button>
        </div>
    );

    const renderConteudo = () => {
        if (loading) {
            return (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary mx-auto mb-2" style={{width: '3rem', height: '3rem'}} role="status">
                        <span className="visually-hidden">Carregando...</span>
                    </div>
                    <p className="text-muted mb-0">Carregando turmas...</p>
                </div>
            );
        }

        if (semResultados) {
            return (
                <div className="text-center py-5">
                    <MdSearch size={48} className="text-muted mb-3" />
                    <p className="text-muted mb-2">Nenhuma turma encontrada para "{termoPesquisa}"</p>
                    <button 
                        className="btn btn-outline-primary btn-sm"
                        onClick={limparPesquisa}
                    >
                        <MdRefresh className="me-1" />
                        Limpar pesquisa
                    </button>
                </div>
            );
        }

        if (isEmpty) {
            return (
                <div className="text-center py-5">
                    <MdInfo size={48} className="text-muted mb-3" />
                    <p className="text-muted mb-3">Nenhuma turma encontrada</p>
                    <button className="btn btn-outline-primary" onClick={() => fetchData(true)}>
                        <MdRefresh className="me-1" />
                        Carregar turmas
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

    // ==================== MODAL DE EXCLUSÃO DETALHADA ====================
    const renderModalExclusao = () => {
        if (!modalExclusaoDetalhada || !dadosExclusao) return null;

        const { dados_gerais, professores_detalhados, total_professores, total_anos_letivos } = dadosExclusao;
        const nome = dados_gerais?.turma || 'Turma';

        return (
            <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,.5)' }}>
                <div className="modal-dialog modal-xl modal-dialog-centered">
                    <div className="modal-content shadow-lg border-0">
                        <div className="modal-header" style={{ backgroundColor: '#003366', color: '#D4AF37' }}>
                            <h5 className="modal-title mb-0">
                                <MdDeleteForever className="me-2 mb-1" />
                                Exclusão Permanente - {nome}
                            </h5>
                            <button
                                type="button"
                                className="btn-close btn-close-white"
                                onClick={() => {
                                    setModalExclusaoDetalhada(false);
                                    setDadosExclusao(null);
                                    setTextoConfirmacao('');
                                }}
                                disabled={carregandoExclusao || isConfirming}
                            />
                        </div>

                        <div className="modal-body">
                            {carregandoExclusao ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary mb-3" role="status">
                                        <span className="visually-hidden">Carregando...</span>
                                    </div>
                                    <p className="text-muted">Carregando dados da turma...</p>
                                </div>
                            ) : (
                                <>
                                    <div className="alert alert-danger">
                                        <MdWarning className="me-2" size={24} />
                                        <strong>Atenção!</strong> Esta ação é <strong>irreversível</strong> e deletará permanentemente:
                                        <ul className="mb-0 mt-2">
                                            <li>Turma: <strong>{dados_gerais?.turma || '-'}</strong></li>
                                            <li>Curso: <strong>{dados_gerais?.curso || '-'}</strong></li>
                                            <li>Período: <strong>{dados_gerais?.periodo || '-'}</strong></li>
                                            <li>
                                                {total_anos_letivos > 0 ? (
                                                    <span>
                                                        <strong>{total_anos_letivos}</strong> ano(s) letivo(s): 
                                                        {dados_gerais?.anos_letivos?.map(a => 
                                                            <span key={a.id_anoletivo} className="badge bg-secondary ms-1">
                                                                {a.ano} ({a.status})
                                                            </span>
                                                        )}
                                                    </span>
                                                ) : (
                                                    'Nenhum ano letivo associado'
                                                )}
                                            </li>
                                            <li>
                                                <strong>{total_professores || 0}</strong> professor(es) atribuído(s)
                                            </li>
                                        </ul>
                                    </div>

                                    {professores_detalhados && professores_detalhados.length > 0 && (
                                        <div className="card mb-3">
                                            <div className="card-header bg-light">
                                                <strong>Professores por Semestre</strong>
                                                <span className="badge bg-primary ms-2">{professores_detalhados.length}</span>
                                            </div>
                                            <div className="card-body p-0">
                                                <div className="table-responsive">
                                                    <table className="table table-sm table-hover mb-0">
                                                        <thead>
                                                            <tr>
                                                                <th>Semestre</th>
                                                                <th>Professor</th>
                                                                <th>Disciplina</th>
                                                                <th>Ano Letivo</th>
                                                                <th>Titulação</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {professores_detalhados.map((prof, idx) => (
                                                                <tr key={idx}>
                                                                    <td className="text-center">
                                                                        <span className="badge bg-info">
                                                                            {prof.semestre || 'N/A'}º
                                                                        </span>
                                                                    </td>
                                                                    <td>{prof.nome || '-'}</td>
                                                                    <td>{prof.disciplina || '-'}</td>
                                                                    <td>{prof.anoletivo || '-'}</td>
                                                                    <td>{prof.titulacao || '-'}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="card border-danger">
                                        <div className="card-header bg-danger text-white">
                                            <MdCheckCircle className="me-2" />
                                            Confirmação de Exclusão
                                        </div>
                                        <div className="card-body">
                                            <p className="text-danger">
                                                Para confirmar a exclusão, digite exatamente o nome da turma:
                                            </p>
                                            <div className="row">
                                                <div className="col-md-8">
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder={`Digite "${nome}" para confirmar`}
                                                        value={textoConfirmacao}
                                                        onChange={(e) => setTextoConfirmacao(e.target.value)}
                                                        disabled={carregandoExclusao || isConfirming}
                                                    />
                                                </div>
                                                <div className="col-md-4 text-end">
                                                    <button
                                                        className="btn btn-danger w-100"
                                                        onClick={deletarTurmaCompleta}
                                                        disabled={
                                                            textoConfirmacao !== nome || 
                                                            carregandoExclusao || 
                                                            isConfirming
                                                        }
                                                    >
                                                        <MdDeleteForever className="me-1" />
                                                        Confirmar Exclusão
                                                    </button>
                                                </div>
                                            </div>
                                            {textoConfirmacao && textoConfirmacao !== nome && (
                                                <small className="text-danger d-block mt-2">
                                                    O nome digitado não corresponde. Digite exatamente: "{nome}"
                                                </small>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="modal-footer border-0">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => {
                                    setModalExclusaoDetalhada(false);
                                    setDadosExclusao(null);
                                    setTextoConfirmacao('');
                                }}
                                disabled={carregandoExclusao || isConfirming}
                            >
                                <MdCancel className="me-1" />
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // ==================== MODAL DE PROFESSORES POR SEMESTRE (CORRIGIDO) ====================
    const renderModalProfessoresSemestre = () => {
        if (!modalProfessoresSemestre || !turmaVisualizar) return null;

        return (
            <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,.5)' }}>
                <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content shadow-lg border-0">
                        <div className="modal-header" style={{ backgroundColor: '#003366', color: '#D4AF37' }}>
                            <h5 className="modal-title mb-0">
                                <MdPerson className="me-2 mb-1" />
                                Professores por Semestre - {turmaVisualizar.turma}
                            </h5>
                            <button
                                type="button"
                                className="btn-close btn-close-white"
                                onClick={() => {
                                    setModalProfessoresSemestre(false);
                                    setProfessoresPorSemestre({});
                                    setProfessoresTurma([]);
                                    setTurmaVisualizar(null);
                                    setAnosLetivosDisponiveis([]);
                                    setAnoLetivoSelecionado("");
                                }}
                                disabled={carregandoProfSemestre || isConfirming}
                            />
                        </div>

                        <div className="modal-body">
                            {carregandoProfSemestre || carregandoProfessoresTurma ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-info mb-3" role="status">
                                        <span className="visually-hidden">Carregando...</span>
                                    </div>
                                    <p className="text-muted">Carregando professores...</p>
                                </div>
                            ) : (
                                <>
                                    {/* FILTRO DE ANO LETIVO */}
                                    {anosLetivosDisponiveis.length > 0 && (
                                        <div className="mb-3">
                                            <label className="form-label fw-bold">Selecione o Ano Letivo:</label>
                                            <select
                                                className="form-select form-select-sm"
                                                value={anoLetivoSelecionado}
                                                onChange={handleAnoLetivoChange}
                                                disabled={carregandoProfessoresTurma}
                                            >
                                                {anosLetivosDisponiveis.map((ano) => (
                                                    <option key={ano.id_anoletivo} value={ano.ano}>
                                                        {ano.ano} {ano.status === 'Desativado' ? '(Desativado)' : '(Ativo)'}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {Object.keys(professoresPorSemestre).length === 0 ? (
                                        <div className="text-center py-5">
                                            <MdPerson size={48} className="text-muted mb-3" />
                                            <p className="text-muted">
                                                {anosLetivosDisponiveis.length > 0 
                                                    ? `Nenhum professor atribuído para o ano letivo ${anoLetivoSelecionado}`
                                                    : 'Nenhum professor atribuído a esta turma'}
                                            </p>
                                            {anosLetivosDisponiveis.length > 0 && (
                                                <small className="text-muted d-block mt-2">
                                                    Clique no botão "Atribuir" para adicionar professores
                                                </small>
                                            )}
                                        </div>
                                    ) : (
                                        Object.keys(professoresPorSemestre)
                                            .sort((a, b) => Number(a) - Number(b))
                                            .map(semestre => (
                                                <div key={semestre} className="card mb-3">
                                                    <div className="card-header bg-light">
                                                        <strong>{semestre === '0' ? 'Sem Semestre Definido' : `${semestre}º Semestre`}</strong>
                                                        <span className="badge bg-primary ms-2">
                                                            {professoresPorSemestre[semestre].length}
                                                        </span>
                                                    </div>
                                                    <div className="card-body p-0">
                                                        <div className="table-responsive">
                                                            <table className="table table-sm table-hover mb-0">
                                                                <thead>
                                                                    <tr>
                                                                        <th>Professor</th>
                                                                        <th>Disciplina</th>
                                                                        <th>Ano Letivo</th>
                                                                        <th>Titulação</th>
                                                                        <th>Ação</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {professoresPorSemestre[semestre].map((prof, idx) => (
                                                                        <tr key={idx}>
                                                                            <td>
                                                                                <div className="d-flex align-items-center">
                                                                                    {prof.foto_url ? (
                                                                                        <img 
                                                                                            src={prof.foto_url} 
                                                                                            alt={prof.nome}
                                                                                            className="rounded-circle me-2"
                                                                                            style={{ width: '30px', height: '30px', objectFit: 'cover' }}
                                                                                        />
                                                                                    ) : (
                                                                                        <div className="bg-secondary rounded-circle d-flex align-items-center justify-content-center me-2" 
                                                                                             style={{ width: '30px', height: '30px' }}>
                                                                                            <MdPerson size={16} className="text-white" />
                                                                                        </div>
                                                                                    )}
                                                                                    {prof.nome || '-'}
                                                                                </div>
                                                                            </td>
                                                                            <td>{prof.disciplina || '-'}</td>
                                                                            <td>{prof.anoletivo || '-'}</td>
                                                                            <td>{prof.titulacao || '-'}</td>
                                                                            <td>
                                                                                <button
                                                                                    type="button"
                                                                                    className="btn btn-sm btn-danger"
                                                                                    onClick={() => removerProfessorTurma(
                                                                                        prof.id_dp, 
                                                                                        prof.nome, 
                                                                                        prof.disciplina
                                                                                    )}
                                                                                    disabled={isConfirming}
                                                                                    title={`Remover ${prof.nome} da turma`}
                                                                                >
                                                                                    <MdRemoveCircle size={16} />
                                                                                </button>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                    )}
                                </>
                            )}
                        </div>

                        <div className="modal-footer border-0">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => {
                                    setModalProfessoresSemestre(false);
                                    setProfessoresPorSemestre({});
                                    setProfessoresTurma([]);
                                    setTurmaVisualizar(null);
                                    setAnosLetivosDisponiveis([]);
                                    setAnoLetivoSelecionado("");
                                }}
                                disabled={carregandoProfSemestre || isConfirming}
                            >
                                <MdClose className="me-1" />
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // ==================== MODAL DE EDIÇÃO ====================
    const renderModalEditar = () => {
        if (!modalEditarAberto) return null;

        return (
            <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,.5)' }}>
                <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content shadow-lg border-0">
                        <div className="modal-header" style={{ backgroundColor: '#003366', color: '#D4AF37' }}>
                            <h5 className="modal-title mb-0">
                                <MdEdit className="me-2 mb-1" />
                                Editar Turma: {dadosEdicao.turma}
                            </h5>
                            <button
                                type="button"
                                className="btn-close btn-close-white"
                                onClick={fecharModalEditar}
                                disabled={salvando || isConfirming}
                            />
                        </div>

                        <div className="bg-light p-3 border-bottom">
                            <div className="row">
                                <div className="col-md-4">
                                    <small className="text-muted d-block">Categoria</small>
                                    <strong>{dadosEdicao.nomeCategoria || '-'}</strong>
                                </div>
                                <div className="col-md-4">
                                    <small className="text-muted d-block">Curso</small>
                                    <strong>{dadosEdicao.nomeCurso || '-'}</strong>
                                </div>
                                <div className="col-md-4">
                                    <small className="text-muted d-block">Ano Curricular</small>
                                    <strong>{dadosEdicao.anoCurricular ? `${dadosEdicao.anoCurricular}º Ano` : '-'}</strong>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={salvarEdicao}>
                            <div className="modal-body">
                                <CategoriaCursoAno
                                    onChange={handleCategoriaCursoAnoEditChange}
                                    initialValues={{
                                        id_categoria: dadosEdicao.idcategoriacurso,
                                        id_curso: dadosEdicao.idcurso,
                                        id_anocurricular: dadosEdicao.idanocurricular
                                    }}
                                    disabled={salvando || isConfirming}
                                />

                                <div className="row mt-3">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold">Turma *</label>
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
                                        <label className="form-label fw-bold">Período *</label>
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
                                        <label className="form-label fw-bold">Ano Letivo</label>
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
                                        />
                                        <small className="text-muted d-block">Formato: 2024-2025</small>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer border-0">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={fecharModalEditar}
                                    disabled={salvando || isConfirming}
                                >
                                    <MdCancel className="me-1" />
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-warning px-4"
                                    disabled={salvando || isConfirming || !dadosEdicao.turma.trim() || !dadosEdicao.idcurso}
                                >
                                    {salvando ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Salvando...
                                        </>
                                    ) : (
                                        <>
                                            <MdSave className="me-1" />
                                            Salvar Alterações
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    };

    // ==================== MODAL DE ATRIBUIÇÃO DE PROFESSOR ====================
    const renderModalProfessor = () => {
        if (!modalProfessorAberto || !turmaSelecionada) return null;

        return (
            <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,.5)' }}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content shadow-lg border-0">
                        <div className="modal-header" style={{ backgroundColor: '#003366', color: '#D4AF37' }}>
                            <h5 className="modal-title mb-0">
                                <MdPersonAdd className="me-2 mb-1" />
                                Atribuir Professor - {turmaSelecionada.turma}
                            </h5>
                            <button
                                type="button"
                                className="btn-close btn-close-white"
                                onClick={fecharModalProfessor}
                                disabled={salvando || isConfirming}
                            />
                        </div>

                        <div className="bg-light p-3 border-bottom">
                            <div className="row">
                                <div className="col-md-4">
                                    <small className="text-muted d-block">Turma</small>
                                    <strong>{turmaSelecionada.turma || '-'}</strong>
                                </div>
                                <div className="col-md-4">
                                    <small className="text-muted d-block">Curso</small>
                                    <strong>{turmaSelecionada.curso || '-'}</strong>
                                </div>
                                <div className="col-md-4">
                                    <small className="text-muted d-block">Período</small>
                                    <strong>{turmaSelecionada.periodo || '-'}</strong>
                                </div>
                            </div>
                            <div className="row mt-2">
                                <div className="col-md-6">
                                    <small className="text-muted d-block">Ano Letivo</small>
                                    <strong className="text-primary">{turmaSelecionada.anoletivo || '-'}</strong>
                                </div>
                                <div className="col-md-6">
                                    <small className="text-muted d-block">Ano Curricular</small>
                                    <strong>{turmaSelecionada.anocurricular || '-'}</strong>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={salvarAtribuicaoProfessor}>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">1. Selecione a Disciplina</label>
                                    <select
                                        className="form-select"
                                        value={disciplinaSelecionada}
                                        onChange={handleDisciplinaChange}
                                        disabled={salvando || carregandoDisciplinas}
                                        required
                                    >
                                        <option value="">Selecione uma disciplina</option>
                                        {carregandoDisciplinas && (
                                            <option value="" disabled>Carregando disciplinas...</option>
                                        )}
                                        {disciplinasTurma.length > 0 && disciplinasTurma.map((disc) => (
                                            <option key={disc.id_disciplina} value={disc.id_disciplina}>
                                                {disc.disciplina} - {disc.semestre}º Semestre
                                            </option>
                                        ))}
                                    </select>
                                    {disciplinasTurma.length === 0 && !carregandoDisciplinas && (
                                        <small className="text-danger d-block mt-1">
                                            Nenhuma disciplina cadastrada para esta turma.
                                        </small>
                                    )}
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">2. Selecione o Professor</label>
                                    <select
                                        className="form-select"
                                        value={professorSelecionado}
                                        onChange={(e) => setProfessorSelecionado(e.target.value)}
                                        disabled={salvando || carregandoProfessores || !disciplinaSelecionada}
                                        required
                                    >
                                        <option value="">Selecione um professor</option>
                                        {carregandoProfessores && (
                                            <option value="" disabled>Carregando professores...</option>
                                        )}
                                        {professoresDisciplina.length > 0 && professoresDisciplina.map((prof) => (
                                            <option key={prof.id_professor} value={prof.id_professor}>
                                                {prof.nome} - {prof.especialidade || 'Sem especialidade'}
                                            </option>
                                        ))}
                                    </select>
                                    {disciplinaSelecionada && !carregandoProfessores && professoresDisciplina.length === 0 && (
                                        <small className="text-warning d-block mt-1">
                                            Nenhum professor vinculado a esta disciplina.
                                        </small>
                                    )}
                                </div>

                                <div className="alert alert-info">
                                    <small>
                                        <strong>Nota:</strong> O professor será atribuído à turma <strong>{turmaSelecionada.turma}</strong> 
                                        para o ano letivo <strong>{turmaSelecionada.anoletivo}</strong>.
                                        Cada ano letivo pode ter professores diferentes para a mesma turma.
                                    </small>
                                </div>
                            </div>
                            <div className="modal-footer border-0">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={fecharModalProfessor}
                                    disabled={salvando || isConfirming}
                                >
                                    <MdCancel className="me-1" />
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-warning px-4"
                                    disabled={salvando || !disciplinaSelecionada || !professorSelecionado || disciplinasTurma.length === 0}
                                >
                                    {salvando ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Atribuindo...
                                        </>
                                    ) : (
                                        <>
                                            <MdPersonAdd className="me-1" />
                                            Atribuir Professor
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    };

    // ==================== MODAL DE VISUALIZAÇÃO DE PROFESSORES ====================
    const renderModalVisualizar = () => {
        if (!modalVisualizarAberto || !turmaVisualizar) return null;

        return (
            <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,.5)' }}>
                <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content shadow-lg border-0">
                        <div className="modal-header" style={{ backgroundColor: '#003366', color: '#D4AF37' }}>
                            <h5 className="modal-title mb-0">
                                <MdPerson className="me-2 mb-1" />
                                Professores da Turma: {turmaVisualizar.turma}
                            </h5>
                            <button
                                type="button"
                                className="btn-close btn-close-white"
                                onClick={fecharModalVisualizar}
                                disabled={carregandoProfessoresTurma || isConfirming}
                            />
                        </div>

                        <div className="bg-light p-3 border-bottom">
                            <div className="row">
                                <div className="col-md-4">
                                    <small className="text-muted d-block">Curso</small>
                                    <strong>{turmaVisualizar.curso || '-'}</strong>
                                </div>
                                <div className="col-md-4">
                                    <small className="text-muted d-block">Período</small>
                                    <strong>{turmaVisualizar.periodo || '-'}</strong>
                                </div>
                                <div className="col-md-4">
                                    <small className="text-muted d-block">Ano Curricular</small>
                                    <strong>{turmaVisualizar.anocurricular || '-'}</strong>
                                </div>
                            </div>
                            <div className="row mt-2">
                                <div className="col-md-12">
                                    <small className="text-muted d-block mb-1">Selecione o Ano Letivo</small>
                                    <select
                                        className="form-select form-select-sm"
                                        value={anoLetivoSelecionado}
                                        onChange={handleAnoLetivoChange}
                                        disabled={carregandoProfessoresTurma || anosLetivosDisponiveis.length === 0}
                                    >
                                        <option value="">Selecione um ano letivo</option>
                                        {anosLetivosDisponiveis.map((ano) => (
                                            <option key={ano.id_anoletivo || ano.anoletivo} value={ano.anoletivo}>
                                                {ano.anoletivo}
                                            </option>
                                        ))}
                                    </select>
                                    {anosLetivosDisponiveis.length === 0 && !carregandoProfessoresTurma && (
                                        <small className="text-warning d-block mt-1">
                                            Nenhum ano letivo cadastrado para esta turma
                                        </small>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="modal-body">
                            {carregandoProfessoresTurma ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-info mb-3" role="status">
                                        <span className="visually-hidden">Carregando...</span>
                                    </div>
                                    <p className="text-muted">Carregando professores...</p>
                                </div>
                            ) : professoresTurma.length === 0 ? (
                                <div className="text-center py-5">
                                    <MdPerson size={48} className="text-muted mb-3" />
                                    <p className="text-muted mb-0">Nenhum professor atribuído a esta turma para o ano letivo selecionado</p>
                                    <small className="text-muted">Clique no botão "Atribuir" para adicionar professores</small>
                                </div>
                            ) : (
                                <div className="row">
                                    {professoresTurma.map((prof) => (
                                        <div key={`${prof.id_professor}-${prof.id_dp}`} className="col-md-6 mb-3">
                                            <div className="card h-100 border shadow-sm">
                                                <div className="card-body">
                                                    <div className="d-flex align-items-start">
                                                        <div className="flex-shrink-0">
                                                            {prof.foto_url ? (
                                                                <img 
                                                                    src={prof.foto_url} 
                                                                    alt={prof.nome}
                                                                    className="rounded-circle"
                                                                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                                />
                                                            ) : (
                                                                <div className="bg-secondary rounded-circle d-flex align-items-center justify-content-center" 
                                                                     style={{ width: '50px', height: '50px' }}>
                                                                    <MdPerson size={24} className="text-white" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="ms-3 flex-grow-1">
                                                            <div className="d-flex justify-content-between align-items-start">
                                                                <div>
                                                                    <h6 className="mb-1">{prof.nome}</h6>
                                                                    {prof.titulacao && (
                                                                        <span className="badge bg-info text-white me-1">
                                                                            {prof.titulacao}
                                                                        </span>
                                                                    )}
                                                                    <span className="badge bg-success text-white me-1">
                                                                        Ano: {prof.anoletivo || 'N/A'}
                                                                    </span>
                                                                    {prof.disciplina && (
                                                                        <div className="mt-2">
                                                                            <MdBook className="me-1 text-primary" size={14} />
                                                                            <small className="text-muted">{prof.disciplina}</small>
                                                                        </div>
                                                                    )}
                                                                    {prof.email && (
                                                                        <div className="mt-1">
                                                                            <small className="text-muted">{prof.email}</small>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-danger"
                                                                    onClick={() => removerProfessorTurma(
                                                                        prof.id_dp, 
                                                                        prof.nome, 
                                                                        prof.disciplina
                                                                    )}
                                                                    disabled={isConfirming}
                                                                    title={`Remover ${prof.nome} da turma`}
                                                                >
                                                                    <MdRemoveCircle size={18} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="modal-footer border-0">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={fecharModalVisualizar}
                                disabled={carregandoProfessoresTurma || isConfirming}
                            >
                                <MdClose className="me-1" />
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // ==================== MODAL DE TURMAS DESATIVADAS ====================
    const renderModalDesativadas = () => {
        if (!modalDesativadasAberto) return null;

        return (
            <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,.5)' }}>
                <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content shadow-lg border-0">
                        <div className="modal-header" style={{ backgroundColor: '#003366', color: '#D4AF37' }}>
                            <h5 className="modal-title mb-0">
                                <MdRestore className="me-2 mb-1" />
                                Turmas com Ano Letivo Desativado
                            </h5>
                            <button
                                type="button"
                                className="btn-close btn-close-white"
                                onClick={fecharModalDesativadas}
                                disabled={carregandoDesativadas || isConfirming}
                            />
                        </div>

                        <div className="modal-body">
                            {carregandoDesativadas ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary mb-3" role="status">
                                        <span className="visually-hidden">Carregando...</span>
                                    </div>
                                    <p className="text-muted">Carregando turmas desativadas...</p>
                                </div>
                            ) : turmasDesativadas.length === 0 ? (
                                <div className="text-center py-5">
                                    <MdPerson size={48} className="text-muted mb-3" />
                                    <p className="text-muted mb-0">Nenhuma turma com ano letivo desativado</p>
                                    <small className="text-muted">Todas as turmas estão ativas</small>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover table-striped">
                                        <thead>
                                            <tr>
                                                <th>Categoria</th>
                                                <th>Curso</th>
                                                <th>Ano</th>
                                                <th>Turma</th>
                                                <th>Período</th>
                                                <th>Ano Letivo</th>
                                                <th className="text-center">Ação</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {turmasDesativadas.map((item) => (
                                                <tr key={`${item.id_periodo}-${item.anoletivo}`}>
                                                    <td className="align-middle">{item.categoriacurso || '-'}</td>
                                                    <td className="align-middle">{item.curso || '-'}</td>
                                                    <td className="text-center align-middle">{item.anocurricular ? `${item.anocurricular}º` : '-'}</td>
                                                    <td className="text-center align-middle fw-semibold">{item.turma || '-'}</td>
                                                    <td className="text-center align-middle">{item.periodo || '-'}</td>
                                                    <td className="text-center align-middle">
                                                        <span className="badge bg-danger">{item.anoletivo || '-'}</span>
                                                    </td>
                                                    <td className="text-center">
                                                        <button
                                                            className="btn btn-sm btn-success"
                                                            onClick={() => ativarTurma(
                                                                item.id_anoletivo,
                                                                item.turma
                                                            )}
                                                            disabled={isConfirming}
                                                            title={`Ativar ${item.turma}`}
                                                        >
                                                            <MdRestore size={18} className="me-1" />
                                                            Ativar
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr>
                                                <td colSpan="7" className="text-muted">
                                                    Total: {turmasDesativadas.length} turma(s) desativada(s)
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer border-0">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={fecharModalDesativadas}
                                disabled={carregandoDesativadas || isConfirming}
                            >
                                <MdClose className="me-1" />
                                Fechar
                            </button>
                            <button
                                type="button"
                                className="btn btn-warning"
                                onClick={() => fetchTurmasDesativadas(true)}
                                disabled={carregandoDesativadas || isConfirming}
                            >
                                <MdRefresh className="me-1" />
                                Atualizar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // ==================== RENDER PRINCIPAL ====================
    return (
        <div className="row mb-4">
            <div className="col-12">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2 className="h4 mb-0" style={{ color: '#003366' }}>
                        <MdFlightClass className="me-2 mb-2" />
                        Turmas - {getFiltroLabel()}
                    </h2>
                    <div className="d-flex gap-2">
                        {ultimaAtualizacao && (
                            <small className="text-muted align-self-end small">
                                Atualizado: {ultimaAtualizacao}
                            </small>
                        )}
                        <button
                            className="btn btn-sm btn-secondary"
                            onClick={abrirModalDesativadas}
                            disabled={loading || isConfirming}
                            title="Ver turmas desativadas"
                        >
                            <MdVisibility className="me-1" />
                            Desativadas
                            {turmasDesativadas.length > 0 && (
                                <span className="badge bg-danger ms-1">{turmasDesativadas.length}</span>
                            )}
                        </button>
                        <button
                            className="btn btn-sm btn-primary"
                            onClick={() => fetchData(true)}
                            disabled={loading || isConfirming}
                            title="Atualizar lista"
                        >
                            <MdRefresh size={18} />
                        </button>
                    </div>
                </div>

                {renderFiltros()}

                <div className="row mb-4">
                    <div className="col-md-8 mx-auto">
                        <div className="card shadow-sm border-0">
                            <div className="card-body p-3">
                                <div className="d-flex align-items-center gap-2">
                                    <div className="position-relative flex-grow-1">
                                        <div className="input-group">
                                            <span className="input-group-text border-end-0" style={{ backgroundColor: '#F5F5F5' }}>
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
                                                    backgroundColor: '#F5F5F5',
                                                    padding: '10px'
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
                                                        backgroundColor: '#003366',
                                                        color: '#FFFFFF'
                                                    }}
                                                >
                                                    <MdClose size={18} />
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

                {renderConteudo()}
            </div>

            {/* MODAIS */}
            {renderModalExclusao()}
            {renderModalProfessoresSemestre()}
            {renderModalEditar()}
            {renderModalProfessor()}
            {renderModalVisualizar()}
            {renderModalDesativadas()}
        </div>
    );
}

export default TurmasAdm;