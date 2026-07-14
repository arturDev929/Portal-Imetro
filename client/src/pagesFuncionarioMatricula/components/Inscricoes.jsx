// src/pagesFuncionarioMatricula/components/Inscricoes.jsx
import api from "../../service/api";
import { useState, useEffect } from "react";
import Style from "../../pagesAdm/components/DepartamentosEdit.module.css";
import { FaInfoCircle } from "react-icons/fa";
import { GrStatusGood } from "react-icons/gr";
import { VscError } from "react-icons/vsc";
import { showSuccessToast, showErrorToast } from "../../components/global/CustomToast";
import { ModalDetail } from "./ModalDetail";
import { ModalAlert } from "./ModalAlert";
import { IoReturnDownBackSharp } from "react-icons/io5";

function Inscricoes({ filtroStatus }) {
    const [EstudantesInscritos, setEstudantesInscritos] = useState([]);
    const [modalEstudante, setModalEstudante] = useState(false);
    const [modalAlert, setModalAlert] = useState(false);
    const [infoEstudante, setInfoEstudante] = useState(null);
    const [loading, setLoading] = useState(false);
    const [estudanteParaReverter, setEstudanteParaReverter] = useState(null);

    useEffect(() => {
        const fetchdados = () => {
            api.get(`/EstudantesByStatus/${filtroStatus}`)
                .then((response) => {
                    setEstudantesInscritos(response.data);
                })
                .catch(error => {
                    showErrorToast("Erro ao carregar lista de inscrições");
                });
        };
        fetchdados();
        const interval = setInterval(fetchdados, 30000);
        return () => clearInterval(interval);
    }, [filtroStatus]);

    useEffect(() => {
        if (modalEstudante || modalAlert) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => document.body.style.overflow = 'auto';
    }, [modalEstudante, modalAlert]);

    const openModal = (informacao) => {
        setInfoEstudante(informacao);
        setModalEstudante(true);
    };

    const closeModal = () => {
        setModalEstudante(false);
        setModalAlert(false);
        setInfoEstudante(null);
        setEstudanteParaReverter(null);
    };

    const handleAceitar = async (estudanteId, estudanteNome) => {
        setLoading(true);
        try {
            const response = await api.put(`/estudanteInscritoAceitar/${estudanteId}`);

            if (response.data.success) {
                showSuccessToast(response.data.message || `Inscrição de ${estudanteNome} aceita com sucesso!`);
                setEstudantesInscritos(prev =>
                    prev.filter(est => est.id_estudanteInscricao !== estudanteId)
                );
                if (infoEstudante?.id_estudanteInscricao === estudanteId) closeModal();
            } else {
                showErrorToast(response.data.error || "Erro ao aceitar inscrição");
            }
        } catch (error) {
            showErrorToast(error.response?.data?.error || "Erro ao processar solicitação");
        } finally {
            setLoading(false);
        }
    };

    const handleReverter = async (estudanteId, estudanteNome) => {
        setLoading(true);
        try {
            const response = await api.put(`/estudanteInscritoReverter/${estudanteId}`);

            if (response.data.success) {
                showSuccessToast(response.data.message || `Inscrição de ${estudanteNome} revertida com sucesso!`);
                setEstudantesInscritos(prev =>
                    prev.filter(est => est.id_estudanteInscricao !== estudanteId)
                );
                if (infoEstudante?.id_estudanteInscricao === estudanteId) closeModal();
            } else {
                showErrorToast(response.data.error || "Erro ao reverter inscrição");
            }
        } catch (error) {
            showErrorToast(error.response?.data?.error || "Erro ao processar solicitação");
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
                setEstudantesInscritos(prev =>
                    prev.filter(est => est.id_estudanteInscricao !== estudanteId)
                );
                if (infoEstudante?.id_estudanteInscricao === estudanteId) closeModal();
            } else {
                showErrorToast(response.data.error || "Erro ao recusar inscrição");
            }
        } catch (error) {
            showErrorToast(error.response?.data?.error || "Erro ao processar solicitação");
        } finally {
            setLoading(false);
        }
    };

    const openReverterModal = (estudante) => {
        setEstudanteParaReverter(estudante);
        setModalAlert(true);
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'Pendente': 'bg-warning',
            'Aprovado': 'bg-success',
            'Reprovado': 'bg-danger',
            'Admitido': 'bg-info',
            'Não Admitido': 'bg-danger',
            'Matriculado': 'bg-primary'
        };
        return statusMap[status] || 'bg-secondary';
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
                        <th className="col-2">Nome</th>
                        <th className="col-2">Código</th>
                        <th className="col-2 text-center">Curso</th>
                        <th className="col-1 text-center">Status</th>
                        <th className="col-1 text-center">Info</th>
                        {filtroStatus === "Pendente" && (
                            <>
                                <th className="col-1 text-center">Aceitar</th>
                                <th className="col-1 text-center">Recusar</th>
                            </>
                        )}
                        {(filtroStatus === "Reprovado" || filtroStatus === "Não Admitido") && (
                            <th className="col-1 text-center">Reverter</th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {EstudantesInscritos && EstudantesInscritos.length > 0 ? (
                        EstudantesInscritos.map((estudante) => (
                            <tr key={estudante.id_estudanteInscricao || estudante.id_est}>
                                <td>
                                    <img
                                        src={estudante.fotoUrl || '/default-avatar.png'}
                                        alt={estudante.nome_estudanteInscricao || estudante.nome}
                                        className="img-fluid rounded-circle"
                                        style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                    />
                                </td>
                                <td>{estudante.nome_estudanteInscricao || estudante.nome}</td>
                                <td>{estudante.numeroInscricao_estudanteInscricao || estudante.codigo}</td>
                                <td className="text-center">{estudante.curso}</td>
                                <td className="text-center">
                                    <span className={`badge ${getStatusBadge(estudante.estado_estudanteInscrito || estudante.status)}`}>
                                        {estudante.estado_estudanteInscrito || estudante.status || 'Pendente'}
                                    </span>
                                </td>
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
                                {filtroStatus === "Pendente" && (
                                    <>
                                        <td className="text-center">
                                            <button
                                                className={`btn btn-sm ${Style.btnAdd}`}
                                                onClick={() => handleAceitar(
                                                    estudante.id_estudanteInscricao || estudante.id_est,
                                                    estudante.nome_estudanteInscricao || estudante.nome
                                                )}
                                                title="Aceitar inscrição"
                                                disabled={loading}
                                            >
                                                <GrStatusGood />
                                            </button>
                                        </td>
                                        <td className="text-center">
                                            <button
                                                className={`btn btn-sm ${Style.btnDeletar}`}
                                                onClick={() => handleRecusar(
                                                    estudante.id_estudanteInscricao || estudante.id_est,
                                                    estudante.nome_estudanteInscricao || estudante.nome
                                                )}
                                                title="Recusar inscrição"
                                                disabled={loading}
                                            >
                                                <VscError />
                                            </button>
                                        </td>
                                    </>
                                )}
                                {(filtroStatus === "Reprovado" || filtroStatus === "Não Admitido") && (
                                    <td className="text-center">
                                        <button
                                            className={`btn btn-sm ${Style.btnReverter}`}
                                            onClick={() => openReverterModal(estudante)}
                                            title="Reverter Reprovação"
                                            disabled={loading}
                                        >
                                            <IoReturnDownBackSharp />
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="9" className="text-center py-4">
                                <span className="text-muted">Nenhum estudante encontrado com status "{filtroStatus}"</span>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {modalEstudante && infoEstudante && (
                <ModalDetail
                    closeModal={closeModal}
                    handleAceitar={handleAceitar}
                    handleRecusar={handleRecusar}
                    handleReverter={handleReverter}
                    loading={loading}
                    filtroStatus={filtroStatus}
                    infoEstudante={infoEstudante}
                />
            )}

            {modalAlert && estudanteParaReverter && (
                <ModalAlert
                    closeModal={closeModal}
                    handleReverter={handleReverter}
                    loading={loading}
                    infoEstudante={estudanteParaReverter}
                />
            )}
        </div>
    );
}

export default Inscricoes;