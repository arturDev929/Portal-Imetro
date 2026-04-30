import api from "../../service/api";
import { useState, useEffect } from "react";
import Style from "../../pagesAdm/components/DepartamentosEdit.module.css";
import { FaInfoCircle } from "react-icons/fa";
import { GrStatusGood } from "react-icons/gr";
import { VscError } from "react-icons/vsc";
import { MdPerson, MdLocationOn, MdPhone, MdEmail, MdAttachFile } from "react-icons/md";
import { RiContactsBook3Line } from "react-icons/ri";
import {FaUniversity } from "react-icons/fa";
import { showSuccessToast, showErrorToast} from "../../components/global/CustomToast";

function Inscricoes({ filtroStatus }) {
    const [EstudantesInscritos, setEstudantesInscritos] = useState([]);
    const [modalEstudante, setModalEstudante] = useState(false);
    const [infoEstudante, setInfoEstudante] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchdados = () => {
            api.get(`/EstudantesByStatus/${filtroStatus}`).then((response) => {
                setEstudantesInscritos(response.data);
            }).catch(error => {
                console.error("Erro ao buscar estudantes:", error);
                showErrorToast("Erro ao carregar lista de inscrições");
            });
        };
        fetchdados();
        const interval = setInterval(fetchdados, 30000);
        return () => {
            clearInterval(interval);
        };
    }, []);

    useEffect(() => {
        if (modalEstudante) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [modalEstudante]);

    const openModal = (informacao) => {
        setInfoEstudante(informacao);
        setModalEstudante(true);
    };

    const closeModal = () => {
        setModalEstudante(false);
        setInfoEstudante(null);
    };

    const handleAceitar = async (estudanteId, estudanteNome) => {
        setLoading(true);
        try {
            const response = await api.put(`/estudanteInscritoAceitar/${estudanteId}`);
            
            if (response.data.success) {
                showSuccessToast(response.data.message || `Inscrição de ${estudanteNome} aceita com sucesso!`);
                // Remover o estudante da lista
                setEstudantesInscritos(prevEstudantes => 
                    prevEstudantes.filter(est => est.id_estudanteInscricao !== estudanteId)
                );
                // Fechar modal se estiver aberto para este estudante
                if (infoEstudante?.id_estudanteInscricao === estudanteId) {
                    closeModal();
                }
            } else {
                showErrorToast(response.data.error || "Erro ao aceitar inscrição");
            }
        } catch (error) {
            console.error("Erro ao aceitar estudante:", error);
            const errorMessage = error.response?.data?.error || "Erro ao processar solicitação";
            showErrorToast(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleRecusar = async (estudanteId, estudanteNome) => {
        setLoading(true);
        try {
            const response = await api.put(`/estudanteInscritoRecusar/${estudanteId}`);
            
            if (response.data.success) {
                showSuccessToast(response.data.message || `Inscrição de ${estudanteNome} recusada com sucesso!`);

                setEstudantesInscritos(prevEstudantes => 
                    prevEstudantes.filter(est => est.id_estudanteInscricao !== estudanteId)
                );
                // Fechar modal se estiver aberto para este estudante
                if (infoEstudante?.id_estudanteInscricao === estudanteId) {
                    closeModal();
                }
            } else {
                showErrorToast(response.data.error || "Erro ao recusar inscrição");
            }
        } catch (error) {
            console.error("Erro ao recusar estudante:", error);
            const errorMessage = error.response?.data?.error || "Erro ao processar solicitação";
            showErrorToast(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="table-responsive">
            {loading && (
                <div className="position-fixed top-50 start-50 translate-middle z-3">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Carregando...</span>
                    </div>
                </div>
            )}
            
            <table className="table table-hover table-striped border">
                <thead style={{ backgroundColor: 'var(--azul-escuro)', color: 'var(--branco)' }}>
                    <tr>
                        <th className="col-1">Foto</th>
                        <th className="col-3">Nome</th>
                        <th className="col-2">Código Inscrição</th>
                        <th className="col-2 text-center">Curso</th>
                        <th className="col-1 text-center">Período</th>
                        <th className="col-1 text-center">Info</th>
                        {
                            filtroStatus === "Pendente" && (
                                <>
                                    <th className="col-1 text-center">Aceitar</th>
                                    <th className="col-1 text-center">Recusar</th>
                                </>
                            )
                        }
                        
                    </tr>
                </thead>
                <tbody>
                    {EstudantesInscritos && EstudantesInscritos.length > 0 ? (
                        EstudantesInscritos.map((estudante) => (
                            <tr key={estudante.id_estudanteInscricao}>
                                <td>
                                    <img
                                        src={estudante.fotoUrl || '/default-avatar.png'}
                                        alt={estudante.nome_estudanteInscricao}
                                        className="img-fluid rounded-circle"
                                        style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                    />
                                </td>
                                <td>{estudante.nome_estudanteInscricao}</td>
                                <td>{estudante.numeroInscricao_estudanteInscricao}</td>
                                <td className="text-center">{estudante.curso}</td>
                                <td className="text-center">{estudante.periodo_estudanteInscricao}</td>
                                <td className="text-center">
                                    <button 
                                        className={`btn btn-sm ${Style.btnOutros}`} 
                                        onClick={() => openModal(estudante)} 
                                        title="Informações"
                                        disabled={loading}
                                    >
                                        <FaInfoCircle />
                                    </button>
                                </td>
                                {
                                    filtroStatus==="Pendente"?
                                   <>
                                    <td className="text-center">
                                    <button 
                                        className={`btn btn-sm ${Style.btnAdd}`}
                                        onClick={() => handleAceitar(estudante.id_estudanteInscricao, estudante.nome_estudanteInscricao)}
                                        title="Aceitar inscrição"
                                        disabled={loading}
                                    >
                                        <GrStatusGood />
                                    </button>
                                </td>
                                <td className="text-center">
                                    <button 
                                        className={`btn btn-sm ${Style.btnDeletar}`}
                                        onClick={() => handleRecusar(estudante.id_estudanteInscricao, estudante.nome_estudanteInscricao)}
                                        title="Recusar inscrição"
                                        disabled={loading}
                                    >
                                        <VscError />
                                    </button>
                                </td>
                                   </>
                                    :<></>
                                }
                                
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="8" className="text-center">Nenhum dado encontrado</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Modal de informações do estudante */}
            {modalEstudante && infoEstudante && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,.5)' }}>
                    <div className="modal-dialog modal-dialog-centered modal-xl">
                        <div className="modal-content shadow-lg border-0">
                            <div className="modal-header" style={{ backgroundColor: 'var(--azul-escuro)', color: 'var(--dourado)' }}>
                                <h5 className="modal-title mb-0">
                                    <FaInfoCircle className="me-2" />
                                    Informações do Estudante - {infoEstudante.nome_estudanteInscricao}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close btn-close-white"
                                    onClick={closeModal}
                                />
                            </div>
                            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                                <div className="container-fluid">
                                    <div className="row mb-4">
                                        <div className="col-md-2 text-center">
                                            <img
                                                src={infoEstudante.fotoUrl || '/default-avatar.png'}
                                                className="rounded-circle border"
                                                style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                                                alt={infoEstudante.nome_estudanteInscricao}
                                            />
                                            <h6 className="mt-2 mb-0" style={{ color: 'var(--azul-escuro)' }}>
                                                Código: {infoEstudante.numeroInscricao_estudanteInscricao || 'N/I'}
                                            </h6>
                                        </div>
                                        <div className="col-md-10">
                                            <div className="card bg-light border-0">
                                                <div className="card-body">
                                                    <h6 className="card-title" style={{ color: 'var(--azul-escuro)' }}>
                                                        <MdPerson className="me-2" />
                                                        Dados Pessoais
                                                    </h6>
                                                    <div className="row">
                                                        <div className="col-md-6">
                                                            <p className="mb-1"><strong>Nome Completo:</strong> {infoEstudante.nome_estudanteInscricao || 'Não informado'}</p>
                                                            <p className="mb-1"><strong>Gênero:</strong> {infoEstudante.sexo_estudanteInscricao || 'Não informado'}</p>
                                                            <p className="mb-1"><strong>Nº do BI:</strong> {infoEstudante.bi_estudanteInscricao || 'Não informado'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <hr className="my-4" />

                                    <h6 className="mb-3" style={{ color: 'var(--azul-escuro)' }}>
                                        <RiContactsBook3Line className="me-2" />
                                        Contato
                                    </h6>
                                    <div className="row mb-4">
                                        <div className="col-md-6">
                                            <div className="card bg-light border-0 h-100">
                                                <div className="card-body">
                                                    <p className="mb-1"><MdPhone className="me-1" /> <strong>Telefone:</strong></p>
                                                    <p className="mb-0">{infoEstudante.contacto_estudanteInscricao || 'Não informado'}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="card bg-light border-0 h-100">
                                                <div className="card-body">
                                                    <p className="mb-1"><MdEmail className="me-1" /> <strong>Email:</strong></p>
                                                    <p className="mb-0">{infoEstudante.email_estudanteInscricao || 'Não informado'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <hr className="my-4" />

                                    <h6 className="mb-3" style={{ color: 'var(--azul-escuro)' }}>
                                        <FaUniversity className="me-2" />
                                        Dados Acadêmicos
                                    </h6>
                                    <div className="row mb-4">
                                        <div className="col-md-6">
                                            <div className="card bg-light border-0">
                                                <div className="card-body">
                                                    <strong>Curso:</strong>
                                                    <p className="mb-0 mt-1">{infoEstudante.curso || 'Não informado'}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="card bg-light border-0">
                                                <div className="card-body">
                                                    <strong>Período:</strong>
                                                    <p className="mb-0 mt-1">{infoEstudante.periodo_estudanteInscricao || 'Não informado'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <hr className="my-4" />

                                    <h6 className="mb-3" style={{ color: 'var(--azul-escuro)' }}>
                                        <MdAttachFile className="me-2" />
                                        Documentos de Inscrição (B.I e Certificado)
                                    </h6>
                                    <div className="row mb-4">
                                        <div className="col-md-12">
                                            <div className="card bg-light border-0">
                                                <div className="card-body">
                                                    {infoEstudante.docUrl ? (
                                                        <a
                                                            href={infoEstudante.docUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="btn btn-primary"
                                                        >
                                                            <MdAttachFile className="me-2" />
                                                            Visualizar Documentos
                                                        </a>
                                                    ) : (
                                                        <span className="text-muted">Nenhum documento anexado</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <h6 className="mb-3" style={{ color: 'var(--azul-escuro)' }}>
                                        <MdAttachFile className="me-2" />
                                        Comprovativo do Pagamento da Inscrição
                                    </h6>
                                    <div className="row mb-4">
                                        <div className="col-md-12">
                                            <div className="card bg-light border-0">
                                                <div className="card-body">
                                                    {infoEstudante.docInscricao ? (
                                                        <a
                                                            href={infoEstudante.docInscricao}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="btn btn-primary"
                                                        >
                                                            <MdAttachFile className="me-2" />
                                                            Visualizar Comprovativo
                                                        </a>
                                                    ) : (
                                                        <span className="text-muted">Nenhum comprovativo anexado</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {
                                filtroStatus==="Pendente"?
                                <div className="modal-footer border-0">
                                <div className="d-flex gap-2">
                                    <button
                                        type="button"
                                        className={`btn ${Style.btnAdd}`}
                                        onClick={() => handleAceitar(infoEstudante.id_estudanteInscricao, infoEstudante.nome_estudanteInscricao)}
                                        disabled={loading}
                                    >
                                        <GrStatusGood className="me-2" />
                                        Aceitar Inscrição
                                    </button>
                                    <button
                                        type="button"
                                        className={`btn ${Style.btnDeletar}`}
                                        onClick={() => handleRecusar(infoEstudante.id_estudanteInscricao, infoEstudante.nome_estudanteInscricao)}
                                        disabled={loading}
                                    >
                                        <VscError className="me-2" />
                                        Recusar Inscrição
                                    </button>
                                    <button
                                        type="button"
                                        className={`btn ${Style.btnCancelar}`}
                                        onClick={closeModal}
                                    >
                                        Fechar
                                    </button>
                                </div>
                            </div>
                                :<></>
                            }
                            
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Inscricoes;