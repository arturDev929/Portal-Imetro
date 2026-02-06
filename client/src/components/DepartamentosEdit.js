import { useEffect, useState, useCallback, useMemo } from "react";
import { MdEdit, MdDeleteForever, MdRefresh } from "react-icons/md";
import axios from "axios";
import { showSuccessToast, showErrorToast, showInfoToast, useConfirmToast } from "./CustomToast";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";
const API_TIMEOUT = 5000;

function Departamento() {
    const [lista, setLista] = useState([]);
    const [loading, setLoading] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [dadosEdicao, setDadosEdicao] = useState({
        idcategoriacurso: '',
        categoriacurso: ''
    });
    const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null);
    
    const { showConfirmToast, isConfirming } = useConfirmToast();

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

    // Carrega apenas uma vez na montagem do componente SEM notificação
    useEffect(() => {
        fetchData(false); // false = não mostrar notificação
    }, [fetchData]);

    const atualizarItemLocal = useCallback((id, novoNome) => {
        setLista(prev => prev.map(item => 
            item.idcategoriacurso === id 
                ? { ...item, categoriacurso: novoNome }
                : item
        ));
    }, []);

    const removerItemLocal = useCallback((id) => {
        setLista(prev => prev.filter(item => item.idcategoriacurso !== id));
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

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setDadosEdicao(prev => ({ ...prev, [name]: value }));
    }, []);

    const deletarDepartamento = useCallback(async (id, nome) => {
        showConfirmToast(
            `Tem certeza que deseja excluir o departamento "${nome}"? Esta ação não pode ser desfeita.`,
            async () => {
                try {
                    showInfoToast("Processando", "Excluindo departamento...");
                    
                    const response = await apiClient.delete(`/delete/categoriaCurso/${id}`);
                    
                    // Usa a mensagem do backend
                    showSuccessToast(
                        "Sucesso",
                        response.data.message || "Departamento excluído",
                    );
                    
                    removerItemLocal(id);
                } catch (error) {
                    // A mensagem de erro já foi tratada no interceptor
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

    return (
        <div className="row mb-4">
            <div className="col-12">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2 className="h4 mb-0 text-primary">
                        <i className="bi bi-building me-2 text-primary"></i>
                        Departamentos
                    </h2>
                    <div className="d-flex gap-2">
                        {ultimaAtualizacao && (
                            <small className="text-muted align-self-end small">
                                Atualizado: {ultimaAtualizacao}
                            </small>
                        )}
                        <button 
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => fetchData(true)}
                            disabled={loading || isConfirming}
                            title="Atualizar lista"
                        >
                            <MdRefresh />
                        </button>
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table table-hover table-striped border">
                        <thead className="table-primary">
                            <tr>
                                <th className="col-8">Nome</th>
                                <th className="col-2 text-center">Editar</th>
                                <th className="col-2 text-center">Apagar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="3" className="text-center py-5">
                                        <div className="spinner-border text-primary mx-auto mb-2" style={{width: '3rem', height: '3rem'}} role="status">
                                            <span className="visually-hidden">Carregando...</span>
                                        </div>
                                        <p className="text-muted mb-0">Carregando departamentos...</p>
                                    </td>
                                </tr>
                            ) : isEmpty ? (
                                <tr>
                                    <td colSpan="3" className="text-center py-5">
                                        <i className="bi bi-inbox display-4 text-muted mb-3 d-block"></i>
                                        <p className="text-muted mb-3">Nenhum departamento encontrado</p>
                                        <button className="btn btn-outline-primary" onClick={() => fetchData(true)}>
                                            <MdRefresh className="me-1" />
                                            Carregar departamentos
                                        </button>
                                    </td>
                                </tr>
                            ) : (
                                lista.map((item) => (
                                    <tr key={item.idcategoriacurso}>
                                        <td className="align-middle fw-semibold">{item.categoriacurso}</td>
                                        <td className="text-center">
                                            <button 
                                                className="btn btn-sm btn-outline-primary"
                                                onClick={() => toggleModal(true, item)}
                                                disabled={loading || salvando || isConfirming}
                                                title={`Editar ${item.categoriacurso}`}
                                            >
                                                <MdEdit />
                                            </button>
                                        </td>
                                        <td className="text-center">
                                            <button 
                                                className="btn btn-sm btn-outline-danger"
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


            {showModal && (
                <div className="modal fade show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,.5)'}}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content shadow-lg border-0">
                            <div className="modal-header bg-gradient bg-primary text-white">
                                <h5 className="modal-title mb-0">
                                    <i className="bi bi-pencil-square me-2"></i>
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
                                        <label className="form-label fw-semibold">
                                            <i className="bi bi-building me-1 text-primary"></i>
                                            Nome do Departamento
                                        </label>
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
                                        className="btn btn-outline-secondary"
                                        onClick={() => toggleModal(false)}
                                        disabled={salvando || isConfirming}
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="btn btn-primary px-4"
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
        </div>
    );
}

export default Departamento;