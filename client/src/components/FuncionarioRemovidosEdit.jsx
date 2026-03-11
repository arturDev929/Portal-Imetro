import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { 
    MdRefresh, 
    MdSearch,
    MdPerson,
    MdPhone,
    MdDeleteForever
} from "react-icons/md";
import {
    GrStatusGood
} from "react-icons/gr"
import { FaIdCard, FaUserTie } from "react-icons/fa";
import { showSuccessToast, showErrorToast, useConfirmToast } from "./CustomToast";
import Style from "./DepartamentosEdit.module.css";

const API_URL = process.env.REACT_APP_API_URL;
const API_TIMEOUT = 30000;

function FuncionarioRemovidosEdit() {
    const [lista, setLista] = useState([]);
    const [listaFiltrada, setListaFiltrada] = useState([]);
    const [termoPesquisa, setTermoPesquisa] = useState('');
    const [loading, setLoading] = useState(false);
    const { showConfirmToast, isConfirming } = useConfirmToast();

    const apiClient = useMemo(() => {
        const client = axios.create({
            baseURL: API_URL,
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
            const response = await apiClient.get('/get/funcionariosDesativados');
            setLista(response.data || []);
            setListaFiltrada(response.data || []);
            
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

    const ativarFuncionario = (id, nome) => {
        showConfirmToast(
            `Tens a certeza que pretendes ativar o funcionário ${nome}?`,
            async () => {
                try {
                    const response = await axios.put(`${API_URL}/put/funcionario/ativar/${id}`);
                    
                    if (response.status === 200) {
                        await fetchFuncionarios(false);
                        showSuccessToast(`Funcionário ${nome} ativado com sucesso!`);
                    }
                } catch (error) {
                    console.error("Erro ao ativar funcionário:", error);
                    if (error.response) {
                        showErrorToast(error.response.data.error || `Erro ao ativar funcionário ${nome}`);
                    } else if (error.request) {
                        showErrorToast("Erro de conexão com o servidor");
                    } else {
                        showErrorToast(`Erro ao ativar funcionário ${nome}`);
                    }
                }
            },
            null,
            "Confirmar Ativação"
        );
    };

    const excluirPermanente = (id, nome) => {
        showConfirmToast(
            `Tens a certeza que pretendes EXCLUIR PERMANENTEMENTE o funcionário ${nome}? Esta ação não pode ser desfeita.`,
            async () => {
                try {
                    const response = await axios.delete(`${API_URL}/delete/funcionario/permanent/${id}`);
                    
                    if (response.status === 200) {
                        await fetchFuncionarios(false);
                        showSuccessToast(`Funcionário ${nome} excluído permanentemente!`);
                    }
                } catch (error) {
                    console.error("Erro ao excluir funcionário:", error);
                    if (error.response) {
                        showErrorToast(error.response.data.error || `Erro ao excluir funcionário ${nome}`);
                    } else if (error.request) {
                        showErrorToast("Erro de conexão com o servidor");
                    } else {
                        showErrorToast(`Erro ao excluir funcionário ${nome}`);
                    }
                }
            },
            null,
            "Confirmar Exclusão Permanente"
        );
    };

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
                        Funcionários Removidos
                    </h2>
                    <div className="d-flex gap-2">
                        <button 
                            className={`btn btn-sm ${Style.AtulizarDepartamento}`}
                            onClick={() => fetchFuncionarios(true)}
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
                                <th className="col-3">Cargo</th>
                                <th className="col-1 text-center">Ativar</th>
                                <th className="col-1 text-center">Excluir</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-5">
                                        <div className="spinner-border text-primary mx-auto mb-2" style={{width: '3rem', height: '3rem'}} role="status">
                                            <span className="visually-hidden">Carregando...</span>
                                        </div>
                                        <p className="text-muted mb-0">Carregando funcionários...</p>
                                    </td>
                                </tr>
                            ) : semResultados ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-5">
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
                                    <td colSpan="7" className="text-center py-5">
                                        <i className="bi bi-inbox display-4 text-muted mb-3 d-block"></i>
                                        <p className="text-muted mb-3">Nenhum funcionário desativado encontrado</p>
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
                                            <MdPhone className="me-1" style={{color:'var(--azul-escuro)'}}/>
                                            {item.contacto_funcionario || 'N/I'}
                                        </td>
                                        <td className="align-middle">
                                            <FaIdCard className="me-1" style={{color:'var(--azul-escuro)'}}/>
                                            {item.bi_funcionario || 'N/I'}
                                        </td>
                                        <td className="align-middle">
                                            <span className="badge bg-secondary">{item.cargo || 'N/I'}</span>
                                        </td>
                                        <td className="text-center">
                                            <button 
                                                className={`btn btn-sm ${Style.btnAdd}`}
                                                onClick={() => ativarFuncionario(item.id_funcionario, item.nome_funcionario)}
                                                disabled={loading || isConfirming}
                                                title={`Ativar ${item.nome_funcionario}`}
                                            >
                                                <GrStatusGood />
                                            </button>
                                        </td>
                                        <td className="text-center">
                                            <button 
                                                className={`btn btn-sm ${Style.btnDeletar}`}
                                                onClick={() => excluirPermanente(item.id_funcionario, item.nome_funcionario)}
                                                disabled={loading || isConfirming}
                                                title={`Excluir permanentemente ${item.nome_funcionario}`}
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
        </div>
    );
}

export default FuncionarioRemovidosEdit;