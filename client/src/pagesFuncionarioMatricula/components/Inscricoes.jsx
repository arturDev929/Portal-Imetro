import api from "../../service/api";
import { useState, useEffect } from "react";
import Style from "../../pagesAdm/components/DepartamentosEdit.module.css";
import { FaBackspace, FaInfoCircle } from "react-icons/fa";
import { GrStatusGood } from "react-icons/gr";
import { VscDebugReverseContinue, VscError } from "react-icons/vsc";
import { MdPerson, MdLocationOn, MdPhone, MdEmail, MdAttachFile } from "react-icons/md";
import { RiContactsBook3Line, RiReservedLine } from "react-icons/ri";
import {FaUniversity } from "react-icons/fa";
import { showSuccessToast, showErrorToast} from "../../components/global/CustomToast";
import { ModalDetail } from "./ModalDetail";
import { FaBackward } from "react-icons/fa6";
import { IoBackspace, IoLinkSharp, IoReturnDownBack, IoReturnDownBackSharp } from "react-icons/io5";

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

    const handleReverter = async (estudanteId, estudanteNome) => {
        setLoading(true);
        try {
            const response = await api.put(`/put/estudanteInscritoReverter/${estudanteId}`);
            
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
                        {    
                            filtroStatus==="Reprovado"&&(
                                 <th className="col-1 text-center">Reverter</th>
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
                                    :filtroStatus==="Reprovado"?
                                    <>
                                    <td className="text-center">
                                        <button 
                                            className={`btn btn-sm ${Style.btnReverter}`}
                                            onClick={() => handleReverter(estudante.id_estudanteInscricao, estudante.nome_estudanteInscricao)}
                                            title="Reverter Reprovação"
                                            disabled={loading}
                                        >
                                            <IoReturnDownBackSharp />
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
        </div>
    );
}

export default Inscricoes;
