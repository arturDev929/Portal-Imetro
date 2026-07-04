import { useEffect, useState, useCallback, useMemo } from "react";
import { 
    MdEdit, MdDeleteForever, MdRefresh, MdSearch, MdAdd, MdPersonAdd, 
    MdVisibility, MdPerson, MdBook, MdRemoveCircle, MdCalendarToday 
} from "react-icons/md";
import { MdFlightClass } from "react-icons/md";
import api from "../../service/api";
import { showSuccessToast, showErrorToast, showInfoToast, useConfirmToast } from "../../components/global/CustomToast";
import CategoriaCursoAno from "./CategoriaCursoAno";
import Style from "./DepartamentosEdit.module.css"
import Table from "../../components/global/Table";

const API_TIMEOUT = 5000;

function TurmasAdm() {
    const [lista, setLista] = useState([]);
    const [listaFiltrada, setListaFiltrada] = useState([]);
    const [termoPesquisa, setTermoPesquisa] = useState('');
    const [loading, setLoading] = useState(false);
    const [salvando, setSalvando] = useState(false);
    
    // Estado para edição - CORRIGIDO
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
    const [modalAdicionarAberto, setModalAdicionarAberto] = useState(false);
    const [modalEditarAberto, setModalEditarAberto] = useState(false);

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
            headers: { 'Content-Type': 'application/json' }
        });

        client.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.data?.mensagem) {
                    showErrorToast("Erro", error.response.data.mensagem);
                } else if (error.response?.data?.message) {
                    showErrorToast("Erro", error.response.data.message);
                } else if (error.response?.data?.error) {
                    showErrorToast("Erro", error.response.data.error);
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

    // BUSCAR DADOS
    const fetchData = useCallback(async (mostrarNotificacao = false) => {
        try {
            setLoading(true);
            const response = await apiClient.get('/turmasComAnoLetivo');
            
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
                id_periodo_original: item.id_periodo_original || item.id_periodo
            }));
            
            setLista(dadosMapeados);
            setListaFiltrada(dadosMapeados);
            setUltimaAtualizacao(new Date().toLocaleTimeString('pt-BR'));

            if (mostrarNotificacao && dadosMapeados.length > 0) {
                showSuccessToast(
                    "Sucesso",
                    "Dados atualizados com sucesso",
                    { "Quantidade": `${dadosMapeados.length} turma(s)` }
                );
            }
        } catch (error) {
            console.error("Erro ao buscar dados:", error);
            showErrorToast("Erro", "Não foi possível carregar as turmas");
        } finally {
            setLoading(false);
        }
    }, [apiClient]);

    // BUSCAR DISCIPLINAS DA TURMA
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

    // BUSCAR PROFESSORES POR DISCIPLINA
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

    // BUSCAR PROFESSORES DA TURMA
    const fetchProfessoresTurma = useCallback(async (idperiodo, anoletivo = null) => {
        setCarregandoProfessoresTurma(true);
        try {
            const url = anoletivo 
                ? `/professoresPorTurma/${idperiodo}/${anoletivo}`
                : `/professoresPorTurma/${idperiodo}`;
            
            const response = await apiClient.get(url);
            if (response.data && response.data.length > 0) {
                setProfessoresTurma(response.data);
            } else {
                setProfessoresTurma([]);
                showInfoToast("Info", "Esta turma não possui professores atribuídos para o ano letivo selecionado");
            }
        } catch (error) {
            console.error("Erro ao buscar professores da turma:", error);
            setProfessoresTurma([]);
            showErrorToast("Erro", "Não foi possível carregar os professores da turma");
        } finally {
            setCarregandoProfessoresTurma(false);
        }
    }, [apiClient]);

    // BUSCAR ANOS LETIVOS DA TURMA
    const fetchAnosLetivosTurma = useCallback(async (idperiodo) => {
        try {
            const response = await apiClient.get(`/anosLetivosPorTurma/${idperiodo}`);
            if (response.data && response.data.length > 0) {
                setAnosLetivosDisponiveis(response.data);
                setAnoLetivoSelecionado(response.data[0].anoletivo);
                return response.data[0].anoletivo;
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

    // REMOVER PROFESSOR DA TURMA
    const removerProfessorTurma = useCallback(async (idDp, nomeProfessor, disciplinaNome) => {
        showConfirmToast(
            `Tem certeza que deseja remover o professor "${nomeProfessor}" da disciplina "${disciplinaNome}" deste ano letivo?`,
            async () => {
                try {
                    showInfoToast("Processando", `Removendo professor "${nomeProfessor}"...`);

                    const response = await apiClient.delete(`/removerProfessorTurma/${idDp}`);

                    showSuccessToast(
                        "Sucesso",
                        response.data.message || `Professor "${nomeProfessor}" removido com sucesso`
                    );

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

    // PESQUISAR
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
                item.categoriacurso?.toLowerCase().includes(termo.toLowerCase()) ||
                item.anocurricular?.toString().includes(termo)
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
                item.categoriacurso?.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
                item.anocurricular?.toString().includes(termoPesquisa)
            );
            setListaFiltrada(filtrados);
        }
    }, [lista, termoPesquisa]);

    const removerItemLocal = useCallback((id) => {
        setLista(prev => {
            const updatedList = prev.filter(item => item.id_periodo !== id);
            return updatedList;
        });
        setListaFiltrada(prev => {
            const updatedList = prev.filter(item => item.id_periodo !== id);
            return updatedList;
        });
    }, []);

    // ==================== FUNÇÕES DE EDIÇÃO - CORRIGIDAS ====================
    
    // ABRIR MODAL DE EDIÇÃO
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

    // FECHAR MODAL DE EDIÇÃO
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

    // HANDLE CHANGE PARA CategoriaCursoAno - CORRIGIDO
    const handleCategoriaCursoAnoEditChange = useCallback((data) => {
        setDadosEdicao(prev => ({
            ...prev,
            idcategoriacurso: data.id_categoria || '',
            idcurso: data.id_curso || '',
            idanocurricular: data.id_anocurricular || ''
        }));
    }, []);

    // HANDLE CHANGE PARA INPUTS
    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setDadosEdicao(prev => ({ ...prev, [name]: value }));
    }, []);

    // SALVAR EDIÇÃO - CORRIGIDO
    const salvarEdicao = useCallback(async (e) => {
        e?.preventDefault();

        // VALIDAÇÕES
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

        setSalvando(true);
        try {
            const payload = {
                id_anocurricular: dadosEdicao.idanocurricular,
                id_curso: dadosEdicao.idcurso,
                id_categoria: dadosEdicao.idcategoriacurso,
                turma: dadosEdicao.turma.trim(),
                periodo: dadosEdicao.periodo,
                idAdm: user.id,
                id_anoletivo: dadosEdicao.id_anoletivo || null
            };

            console.log('Enviando para edição:', payload);

            const response = await apiClient.put(`/periodo/${dadosEdicao.idperiodo}`, payload);

            showSuccessToast(
                "Sucesso",
                response.data.mensagem || "Turma atualizada com sucesso"
            );

            await fetchData(false);
            fecharModalEditar();
        } catch (error) {
            console.error("Erro ao editar:", error);

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

    // ==================== FUNÇÕES DE ADIÇÃO ====================
    
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

    const handleNovaTurmaChange = useCallback((e) => {
        const { name, value } = e.target;
        setNovaTurma(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleCategoriaCursoAnoChange = useCallback((data) => {
        setCategoriaCursoAnoData(data);
    }, []);

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

        if (!novaTurma.periodo) {
            showErrorToast("Validação", "Selecione o período");
            return;
        }

        if (!novaTurma.anoletivo?.trim()) {
            showErrorToast("Validação", "Informe o ano letivo");
            return;
        }

        setSalvando(true);
        try {
            const response = await apiClient.post('/registrarPeriodo', {
                id_anocurricular: categoriaCursoAnoData.idanocurricular,
                id_curso: categoriaCursoAnoData.idcurso,
                id_categoria: categoriaCursoAnoData.idcategoriacurso,
                turma: novaTurma.turma,
                periodo: novaTurma.periodo,
                anoletivo: novaTurma.anoletivo,
                idAdm: user.id
            });

            showSuccessToast(
                "Sucesso",
                response.data.mensagem || "Turma adicionada com sucesso"
            );

            await fetchData(false);
            fecharModalAdicionar();
        } catch (error) {
            console.error("Erro ao adicionar turma:", error);
            if (error.response?.data?.mensagem) {
                showErrorToast("Erro", error.response.data.mensagem);
            } else {
                showErrorToast("Erro", "Não foi possível adicionar a turma");
            }
        } finally {
            setSalvando(false);
        }
    }, [novaTurma, categoriaCursoAnoData, apiClient, user, fetchData, fecharModalAdicionar]);

    // ==================== FUNÇÃO DE DELETAR ====================
    
    const deletarTurma = useCallback(async (id, nome) => {
        showConfirmToast(
            `Tem certeza que deseja excluir a turma "${nome}"? Esta ação não pode ser desfeita.`,
            async () => {
                try {
                    showInfoToast("Processando", "Excluindo turma...");

                    const response = await apiClient.delete(`/periodo/${id}`);

                    showSuccessToast(
                        "Sucesso",
                        response.data?.mensagem || "Turma excluída com sucesso"
                    );

                    removerItemLocal(id);
                } catch (error) {
                    console.error("Erro detalhado ao deletar:", {
                        mensagem: error.message,
                        resposta: error.response?.data,
                        status: error.response?.status,
                        config: error.config
                    });

                    if (error.response?.data?.mensagem) {
                        showErrorToast("Erro", error.response.data.mensagem);
                    } else if (error.response?.status === 404) {
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

    // ==================== RENDERIZAÇÃO ====================
    
    const isEmpty = lista.length === 0 && !loading;
    const semResultados = !loading && listaFiltrada.length === 0 && termoPesquisa !== '';

    const headers = ['Categoria', 'Curso', 'Ano', 'Turma', 'Período', 'Ano Letivo', 'Professores', 'Atribuir', 'Editar', 'Excluir'];

    const renderRow = (item) => (
        <tr key={`${item.id_periodo}-${item.anoletivo}`}>
            <td className="align-middle">{item.categoriacurso || '-'}</td>
            <td className="align-middle">{item.curso || '-'}</td>
            <td className="text-center align-middle">{item.anocurricular ? `${item.anocurricular}º` : '-'}</td>
            <td className="text-center align-middle fw-semibold">{item.turma || '-'}</td>
            <td className="text-center align-middle">{item.periodo || '-'}</td>
            <td className="text-center align-middle">{item.anoletivo || '-'}</td>
            <td className="text-center">
                <button
                    className={`btn btn-sm ${Style.btnVisualizar}`}
                    onClick={() => abrirModalVisualizar(item)}
                    disabled={loading || isConfirming}
                    title={`Ver professores de ${item.turma}`}
                >
                    <MdVisibility size={18} />
                </button>
            </td>
            <td className="text-center">
                <button
                    className={`btn btn-sm ${Style.btnProfessor}`}
                    onClick={() => abrirModalProfessor(item)}
                    disabled={loading || salvando || isConfirming}
                    title={`Atribuir professor para ${item.turma}`}
                >
                    <MdPersonAdd size={18} />
                </button>
            </td>
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
                    onClick={() => deletarTurma(item.id_periodo, item.turma)}
                    disabled={loading || salvando || isConfirming}
                    title={`Excluir ${item.turma}`}
                >
                    <MdDeleteForever />
                </button>
            </td>
        </tr>
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
                        Limpar pesquisa
                    </button>
                </div>
            );
        }

        if (isEmpty) {
            return (
                <div className="text-center py-5">
                    <i className="bi bi-inbox display-4 text-muted mb-3 d-block"></i>
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

    return (
        <div className="row mb-4">
            <div className="col-12">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2 className="h4 mb-0" style={{ color: 'var(--azul-escuro)' }}>
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
                    </div>
                </div>

                <div className="row mb-4">
                    <div className="col-md-8 mx-auto">
                        <div className="card shadow-sm border-0">
                            <div className="card-body p-3">
                                <div className="d-flex align-items-center gap-2">
                                    <div className="position-relative flex-grow-1">
                                        <div className="input-group">
                                            <span className="input-group-text border-end-0" style={{ backgroundColor: 'var(--cinza-claro)' }}>
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

            {/* ==================== MODAL DE EDIÇÃO - CORRIGIDO ==================== */}
            {modalEditarAberto && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,.5)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content shadow-lg border-0">
                            <div className="modal-header" style={{ backgroundColor: 'var(--azul-escuro)', color: 'var(--dourado)' }}>
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

                                    {/* DEBUG - Mostrar dados que serão enviados */}
                                    <div className="alert alert-info mt-3">
                                        <small>
                                            <strong>Dados a serem enviados:</strong><br />
                                            ID Período: {dadosEdicao.idperiodo}<br />
                                            Categoria: {dadosEdicao.idcategoriacurso || 'Não selecionado'}<br />
                                            Curso: {dadosEdicao.idcurso || 'Não selecionado'}<br />
                                            Ano Curricular: {dadosEdicao.idanocurricular || 'Não selecionado'}<br />
                                            Turma: {dadosEdicao.turma || 'Não preenchido'}<br />
                                            Período: {dadosEdicao.periodo || 'Não selecionado'}<br />
                                            Ano Letivo: {dadosEdicao.anoletivo || 'Não preenchido'}
                                        </small>
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
                                        disabled={salvando || isConfirming || !dadosEdicao.turma.trim() || !dadosEdicao.idcurso}
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

            {/* ==================== MODAL DE VISUALIZAÇÃO DE PROFESSORES ==================== */}
            {modalVisualizarAberto && turmaVisualizar && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,.5)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content shadow-lg border-0">
                            <div className="modal-header" style={{ backgroundColor: 'var(--azul-escuro)', color: 'var(--dourado)' }}>
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
                                                                        className={`btn btn-sm ${Style.btnDeletar}`}
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
                                    className={`btn ${Style.btnCancelar}`}
                                    onClick={fecharModalVisualizar}
                                    disabled={carregandoProfessoresTurma || isConfirming}
                                >
                                    Fechar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ==================== MODAL DE ATRIBUIÇÃO DE PROFESSOR ==================== */}
            {modalProfessorAberto && turmaSelecionada && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content shadow-lg border-0">
                            <div className="modal-header" style={{ backgroundColor: 'var(--azul-escuro)', color: 'var(--dourado)' }}>
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
                                        className={`btn ${Style.btnCancelar}`}
                                        onClick={fecharModalProfessor}
                                        disabled={salvando || isConfirming}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className={`btn px-4 ${Style.btnSubmit}`}
                                        disabled={salvando || !disciplinaSelecionada || !professorSelecionado || disciplinasTurma.length === 0}
                                    >
                                        {salvando ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Atribuindo...
                                            </>
                                        ) : (
                                            'Atribuir Professor'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* ==================== MODAL DE ADIÇÃO ==================== */}
            {modalAdicionarAberto && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,.5)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content shadow-lg border-0">
                            <div className="modal-header" style={{ backgroundColor: 'var(--azul-escuro)', color: 'var(--dourado)' }}>
                                <h5 className="modal-title mb-0">
                                    <MdAdd className="me-2 mb-1" />
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
                                    <CategoriaCursoAno
                                        onChange={handleCategoriaCursoAnoChange}
                                        disabled={salvando || isConfirming}
                                    />

                                    <div className="row mt-3">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label fw-bold">Turma *</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="turma"
                                                value={novaTurma.turma}
                                                onChange={handleNovaTurmaChange}
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
                                            <label className="form-label fw-bold">Ano Letivo *</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="anoletivo"
                                                value={novaTurma.anoletivo}
                                                onChange={handleNovaTurmaChange}
                                                placeholder="Ex: 2024-2025"
                                                pattern="\d{4}-\d{4}"
                                                title="Formato: YYYY-YYYY (ex: 2024-2025)"
                                                disabled={salvando || isConfirming}
                                                required
                                            />
                                            <small className="text-muted d-block">Formato: 2024-2025</small>
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
                                        disabled={salvando || isConfirming || !novaTurma.turma.trim() || !novaTurma.periodo || !novaTurma.anoletivo.trim()}
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