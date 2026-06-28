import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    MdRefresh,
    MdSearch,
    MdPerson
} from "react-icons/md";
import {
    GrStatusGood
} from "react-icons/gr";
import { showSuccessToast, showErrorToast, useConfirmToast } from "../../components/global/CustomToast";
import Style from "./DepartamentosEdit.module.css";
import Table from "../../components/global/Table";
import Api from "../../service/api";

const API_TIMEOUT = 30000;

function ProfessorRemovidosEdit() {
    // Estados principais
    const [lista, setLista] = useState([]);
    const [listaFiltrada, setListaFiltrada] = useState([]);
    const [termoPesquisa, setTermoPesquisa] = useState('');
    const [loading, setLoading] = useState(false);
    const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null);
    const { showConfirmToast, isConfirming } = useConfirmToast();

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

    // Buscar professores desativados (Eliminados)
    const fetchProfessores = useCallback(async (mostrarNotificacao = false) => {
        try {
            setLoading(true);
            const response = await apiClient.get('/ProfessoresDesativado');
            
            const dados = response.data.map(prof => ({
                id_professor: prof.id_professor,
                nome: prof.nome,
                codigo: prof.codigo,
                fotoUrl: prof.fotoUrl
            }));
            
            setLista(dados);
            setListaFiltrada(dados);
            setUltimaAtualizacao(new Date().toLocaleTimeString('pt-BR'));

            if (mostrarNotificacao && dados.length > 0) {
                showSuccessToast(
                    "Sucesso",
                    "Dados atualizados com sucesso",
                    { "Quantidade": `${dados.length} professor(es) eliminado(s)` }
                );
            } else if (mostrarNotificacao && dados.length === 0) {
                showSuccessToast("Informação", "Nenhum professor eliminado encontrado");
            }
        } catch (error) {
            console.error("Erro ao buscar professores eliminados:", error);
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
        } finally {
            setLoading(false);
        }
    }, [apiClient]);

    // Filtrar professores
    useEffect(() => {
        if (termoPesquisa.trim() === '') {
            setListaFiltrada(lista);
        } else {
            const filtrados = lista.filter(item =>
                item.nome?.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
                item.codigo?.toLowerCase().includes(termoPesquisa.toLowerCase())
            );
            setListaFiltrada(filtrados);
        }
    }, [lista, termoPesquisa]);

    // Ativar professor (recuperar)
    const ativarProfessor = useCallback((id, nome) => {
        showConfirmToast(
            `Tens a certeza que pretendes ativar o professor ${nome}?`,
            async () => {
                try {
                    const response = await Api.put(
                        `/professor/ativar/${id}`,
                        {},
                        {
                            headers: { 
                                Authorization: `Bearer ${localStorage.getItem("token")}` 
                            }
                        }
                    );

                    if (response.status === 200) {
                        await fetchProfessores(false);
                        showSuccessToast("Sucesso", `Professor ${nome} ativado com sucesso!`);
                    }
                } catch (error) {
                    console.error("Erro ao ativar professor:", error);
                    if (error.response) {
                        showErrorToast("Erro", error.response.data.error || `Erro ao ativar professor ${nome}`);
                    } else if (error.request) {
                        showErrorToast("Erro", "Erro de conexão com o servidor");
                    } else {
                        showErrorToast("Erro", `Erro ao ativar professor ${nome}`);
                    }
                }
            },
            null,
            "Confirmar Ativação"
        );
    }, [showConfirmToast, fetchProfessores]);

    // Carregar dados iniciais
    useEffect(() => {
        fetchProfessores(false);
    }, [fetchProfessores]);

    // Verificações de estado
    const isEmpty = lista.length === 0 && !loading;
    const semResultados = !loading && listaFiltrada.length === 0 && termoPesquisa !== '';

    // Headers da tabela
    const headers = ['Foto', 'Nome', 'Código', 'Ativar'];

    // Renderizar linha da tabela
    const renderRow = useCallback((item) => (
        <tr key={item.id_professor}>
            <td className="align-middle text-center">
                <div 
                    style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '50%', 
                        backgroundColor: '#e0e0e0', 
                        overflow: 'hidden',
                        margin: '0 auto'
                    }}
                >
                    {item.fotoUrl ? (
                        <img 
                            src={item.fotoUrl} 
                            alt={item.nome} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                            <MdPerson size={20} color="#999" />
                        </div>
                    )}
                </div>
            </td>
            <td className="align-middle fw-semibold" style={{ color: 'var(--azul-escuro)' }}>
                <MdPerson className="me-2 mb-1" />
                {item.nome}
            </td>
            <td className="align-middle">
                <code style={{ backgroundColor: '#f5f5f5', padding: '2px 6px', borderRadius: '4px' }}>
                    {item.codigo || 'N/I'}
                </code>
            </td>
            <td className="text-center">
                <button
                    className={`btn btn-sm ${Style.btnSubmit}`}
                    onClick={() => ativarProfessor(item.id_professor, item.nome)}
                    disabled={loading || isConfirming}
                    title={`Ativar ${item.nome}`}
                >
                    <GrStatusGood />
                </button>
            </td>
        </tr>
    ), [ativarProfessor, loading, isConfirming]);

    // Renderizar conteúdo principal
    const renderConteudo = () => {
        if (loading) {
            return (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary mx-auto mb-2" style={{width: '3rem', height: '3rem'}} role="status">
                        <span className="visually-hidden">Carregando...</span>
                    </div>
                    <p className="text-muted mb-0">Carregando professores eliminados...</p>
                </div>
            );
        }

        if (semResultados) {
            return (
                <div className="text-center py-5">
                    <MdSearch size={48} className="text-muted mb-3" />
                    <p className="text-muted mb-2">Nenhum professor encontrado para "{termoPesquisa}"</p>
                    <button 
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => setTermoPesquisa('')}
                    >
                        Limpar pesquisa
                    </button>
                </div>
            );
        }

        if (isEmpty) {
            return (
                <div className="text-center py-5">
                    <MdPerson size={48} className="text-muted mb-3" />
                    <p className="text-muted mb-3">Nenhum professor eliminado encontrado</p>
                    <button 
                        className="btn btn-outline-primary" 
                        onClick={() => fetchProfessores(true)}
                        disabled={loading}
                    >
                        <MdRefresh className="me-1" />
                        {loading ? 'Carregando...' : 'Carregar professores'}
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
                {listaFiltrada.length > 0 && (
                    <div className="mt-3 text-muted small">
                        Total: {listaFiltrada.length} professor(es) eliminado(s)
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="row mb-4">
            <div className="col-12">
                {/* Cabeçalho */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2 className="h4 mb-0" style={{ color: 'var(--azul-escuro)' }}>
                        <MdPerson className="me-2 mb-2" />
                        Professores Eliminados
                    </h2>
                    <div className="d-flex gap-2">
                        {ultimaAtualizacao && (
                            <small className="text-muted align-self-end">
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
                    </div>
                </div>

                {/* Barra de Pesquisa */}
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
                                        placeholder="Pesquisar professor por nome ou código..." 
                                        value={termoPesquisa} 
                                        onChange={(e) => setTermoPesquisa(e.target.value)} 
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
                                            onClick={() => setTermoPesquisa('')} 
                                            disabled={loading}
                                            style={{ 
                                                backgroundColor: 'var(--danger)', 
                                                color: 'var(--branco)' 
                                            }}
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>

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
                {renderConteudo()}
            </div>
        </div>
    );
}

export default ProfessorRemovidosEdit;