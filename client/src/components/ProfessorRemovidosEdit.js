import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { 
    MdRefresh, 
    MdSearch,
    MdPerson,
    MdEmail,
    MdPhone,
    MdLocationOn,
    MdAttachFile,
    MdBook
} from "react-icons/md";
import {
    GrStatusGood
} from "react-icons/gr"
import { 
    FaBook, 
    FaInfoCircle, 
    FaHeartbeat, 
    FaUniversity,
    FaBriefcase,
} from "react-icons/fa";
import { RiContactsBook3Line } from "react-icons/ri";
import { showSuccessToast, showErrorToast, useConfirmToast } from "./CustomToast";
import Style from "./DepartamentosEdit.module.css";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";
const API_TIMEOUT = 30000;

function ProfessorRemovidosEdit() {
    const [lista, setLista] = useState([]);
    const [listaFiltrada, setListaFiltrada] = useState([]);
    const [termoPesquisa, setTermoPesquisa] = useState('');
    const [loading, setLoading] = useState(false);
    // Estados para modais
    const [modalInfoAberto, setModalInfoAberto] = useState(false);
    const [modalDisciplinasAberto, setModalDisciplinasAberto] = useState(false);
    // Estados para dados selecionados
    const [professorSelecionado, setProfessorSelecionado] = useState(null);
    const [professorSelecionadoInfo, setProfessorSelecionadoInfo] = useState(null);
    const [disciplinasProfessor, setDisciplinasProfessor] = useState([]);
    const [loadingDisciplinas, setLoadingDisciplinas] = useState(false);
    // const [user, setUser] = useState(null);
    const { showConfirmToast, isConfirming } = useConfirmToast();

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
            const response = await apiClient.get('/get/ProfessoresDesativados');
            setLista(response.data || []);
            setListaFiltrada(response.data || []);
            
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

    const ativarProfessor = (id, nome) => {
        showConfirmToast(
            `Tens a certeza que pretendes Ativar o professor ${nome}?`,
            async () => {
                try {
                    const response = await axios.put(`http://localhost:8080/put/professor/ativar/${id}`);
                    
                    if (response.status === 200) {
                        await fetchProfessores(false);
                        showSuccessToast(`Professor ${nome} ativado com sucesso!`);
                    }
                } catch (error) {
                    console.error("Erro ao ativar professor:", error);
                    if (error.response) {
                        showErrorToast(error.response.data.error || `Erro ao ativar professor ${nome}`);
                    } else if (error.request) {
                        showErrorToast("Erro de conexão com o servidor");
                    } else {
                        showErrorToast(`Erro ao ativar professor ${nome}`);
                    }
                }
            },
            null,
            "Confirmar Ativação"
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
                        Professores Removidos
                    </h2>
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
                                <th className="col-4">Nome</th>
                                <th className="col-2">Titulação</th>
                                <th className="col-2">Código</th>
                                <th className="col-1 text-center">Disciplinas</th>
                                <th className="col-1 text-center">Info</th>
                                <th className="col-1 text-center">Ativar</th>
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
                                        <td className="align-middle fw-semibold" style={{color:'var(--azul-escuro)'}}>
                                            {item.titulacaoprofessor}
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
                                                className={`btn btn-sm ${Style.btnAdd}`}
                                                onClick={() => ativarProfessor(item.idprofessor, item.nomeprofessor)}
                                                disabled={loading || isConfirming}
                                                title={`Ativar ${item.nomeprofessor}`}
                                            >
                                                <GrStatusGood />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

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
        </div>
    );
}

export default ProfessorRemovidosEdit;