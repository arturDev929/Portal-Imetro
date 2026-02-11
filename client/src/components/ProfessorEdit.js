import { useState, useEffect } from 'react';
import Axios from 'axios';
import { FaInfoCircle } from "react-icons/fa";
import { MdDeleteForever, MdEdit } from "react-icons/md";
import { FaBook } from "react-icons/fa";
import { CiCircleMinus } from "react-icons/ci";
import {showSuccessToast, useConfirmToast, showErrorToast} from './CustomToast';

function ProfessorEdit() {
    const [professores, setProfessores] = useState([]);
    const [professorSelecionado, setProfessorSelecionado] = useState(null);
    const [professorSelecionado2, setProfessorSelecionado2] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalOpenInfo, setModalOpenInfo] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { showConfirmToast, isConfirmToast } = useConfirmToast();

    useEffect(() => {
        const fetchProfessores = async () => {
            try {
                setLoading(true);
                const response = await Axios.get('http://localhost:8080/get/Professores');
                setProfessores(response.data);
                setError(null);
            } catch (err) {
                console.error('Erro ao buscar professores:', err);
                setError('Erro ao carregar professores');
            } finally {
                setLoading(false);
            }
        };

        fetchProfessores();
        
        const interval = setInterval(fetchProfessores, 100000);
        
        return () => {
            if (interval) clearInterval(interval);
        };
    }, []);

    useEffect(() => {
        if (modalOpen || modalOpenInfo) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [modalOpen, modalOpenInfo]);

    const openModal = (professor) => {
        setProfessorSelecionado(professor);
        setModalOpen(true);
        Axios.get(`http://localhost:8080/get/professorVinculadoDisciplinas/${professor.idprofessor}`)
            .then((response) => {
                setProfessorSelecionado((prev) => ({
                    ...prev,
                    disciplinas: response.data,
                }));
            })
            .catch((err) => {
                console.error('Erro ao buscar disciplinas do professor:', err);
                setError('Erro ao carregar disciplinas do professor');
            });
    };

    const closeModal = () => {
        setModalOpen(false);
        setTimeout(() => setProfessorSelecionado(null), 300);
    };

    const openModalInfo = async (professor) => {
        setProfessorSelecionado2(professor);
        setModalOpenInfo(true);
        
        try {
            const response = await Axios.get(`http://localhost:8080/get/InformacoesProfessor/${professor.idprofessor}`);
            
            setProfessorSelecionado2({
                ...professor,
                ...response.data
            });
            
        } catch (err) {
            console.error('Erro ao buscar informações do professor:', err);
            showErrorToast('Erro ao carregar informações do professor');
        }
    };

    const closeModalInfo = () => {
        setModalOpenInfo(false);
        setTimeout(() => setProfessorSelecionado2(null), 300);
    };

    const handleDelete = (disciplina) => {
        showConfirmToast(
            `Tem certeza que deseja Desvincular ${disciplina.disciplina} do professor ${professorSelecionado.nomeprofessor}?`,
            async () => {
                try{
                    await Axios.delete(`http://localhost:8080/delete/desvincularProfessorDisciplina/${disciplina.iddisciplina}?idprofessor=${professorSelecionado.idprofessor}`);
                    
                    const updatedProfessor = professorSelecionado.disciplinas.filter(item => item.iddisciplina !== disciplina.iddisciplina);
                    
                    setProfessorSelecionado(prev => ({ ...prev, disciplinas: updatedProfessor }));
                    
                    showSuccessToast("Sucesso", `Disciplina ${disciplina.disciplina} desvinculada com sucesso!`);
                }catch(err){
                    console.error('Erro ao desvincular disciplina do professor:', err);
                    showErrorToast('Erro ao desvincular disciplina do professor');
                }
            },
            () => {},
            "Desvincular"
        );
    };

    return (
        <div>
            <div className="table-responsive">
                {loading && <div className="text-center">Carregando...</div>}
                {error && <div className="alert alert-danger">{error}</div>}
                
                <table className="table table-hover table-striped border">
                    <thead className="table-primary">
                        <tr>
                            <th className="col-1">Foto</th>
                            <th className="col-7">Nome</th>
                            <th className="col-1 text-center">Disciplinas</th>
                            <th className="col-1 text-center">Info</th>
                            <th className="col-1 text-center">Editar</th>
                            <th className="col-1 text-center">Apagar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {!loading && professores && professores.length > 0 ? (
                            professores.map((prof) => (
                                <tr key={`prof-${prof.idprofessor}`}>
                                    <td>
                                        <img 
                                            src={prof.fotoUrl || '/default-avatar.png'} 
                                            alt={`Foto de ${prof.nomeprofessor}`} 
                                            className="img-fluid rounded-circle" 
                                            style={{ width: '35px', height: '35px', objectFit: 'cover' }} 
                                            onError={(e) => {
                                                e.target.src = '/default-avatar.png';
                                            }}
                                        />
                                    </td>
                                    <td className="align-middle">{prof.nomeprofessor}</td>
                                    <td className="text-center align-middle">
                                        <button 
                                            onClick={() => openModal(prof)}
                                            className="btn btn-sm btn-outline-secondary"
                                            title="Ver disciplinas"
                                        >
                                            <FaBook />
                                        </button>
                                    </td>
                                    <td className="text-center align-middle">
                                        <button 
                                            onClick={() => openModalInfo(prof)}
                                            className="btn btn-sm btn-outline-info" 
                                            title="Informações"
                                        >
                                            <FaInfoCircle />
                                        </button>
                                    </td>
                                    <td className="text-center align-middle">
                                        <button className="btn btn-sm btn-outline-primary" title="Editar">
                                            <MdEdit />
                                        </button>
                                    </td>
                                    <td className="text-center align-middle">
                                        <button className="btn btn-sm btn-outline-danger" title="Excluir">
                                            <MdDeleteForever />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            !loading && (
                                <tr>
                                    <td colSpan="6" className="text-center">
                                        Nenhum professor cadastrado.
                                    </td>
                                </tr>
                            )
                        )}
                    </tbody>
                </table>

                {/* Modal de Disciplinas */}
                {modalOpen && professorSelecionado && (
                    <div className="modal fade show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,.5)'}}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content shadow-lg border-0">
                                <div className="modal-header bg-gradient bg-primary text-white">
                                    <h5 className="modal-title mb-0">
                                        <FaBook className="me-2" />
                                        Disciplinas do Professor {professorSelecionado.nomeprofessor}
                                    </h5>
                                    <button 
                                        type="button" 
                                        className="btn-close btn-close-white"
                                        onClick={closeModal}
                                    />
                                </div>
                                <div className="modal-body">
                                    {professorSelecionado.disciplinas && professorSelecionado.disciplinas.length > 0 ? (
                                        <div className="row">
                                            {professorSelecionado.disciplinas.map((disciplina) => (
                                                <div key={disciplina.iddisciplina} className="col-md-6 mb-1">
                                                    <div className="p-2 border rounded bg-light justify-content-between d-flex align-items-center">
                                                        <small className="mb-0">{disciplina.disciplina}</small>
                                                        <button 
                                                            className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1"
                                                            disabled={isConfirmToast}
                                                            onClick={() => handleDelete(disciplina)}
                                                        >
                                                            <CiCircleMinus size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-4">
                                            <p className="text-muted mb-0">
                                                Nenhuma disciplina atribuída a este professor.
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <div className="modal-footer border-0">
                                    <button 
                                        type="button" 
                                        className="btn btn-outline-secondary"
                                        onClick={closeModal}
                                    >
                                        Fechar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL DE INFORMAÇÕES - COM LINK PARA DOWNLOAD DO PDF */}
                {modalOpenInfo && professorSelecionado2 && (
                    <div className="modal fade show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,.5)'}}>
                        <div className="modal-dialog modal-xl modal-dialog-scrollable">
                            <div className="modal-content shadow-lg border-0">
                                
                                {/* HEADER */}
                                <div className="modal-header bg-gradient bg-primary text-white">
                                    <h5 className="modal-title mb-0 d-flex align-items-center">
                                        <FaInfoCircle className="me-2" />
                                        Informações Detalhadas do Professor {professorSelecionado2.nomeprofessor}
                                    </h5>
                                    <button 
                                        type="button" 
                                        className="btn-close btn-close-white"
                                        onClick={closeModalInfo}
                                    />
                                </div>

                                {/* BODY */}
                                <div className="modal-body">
                                    <div className="container-fluid">
                                        
                                        {/* FOTO E CÓDIGO */}
                                        <div className="row mb-4">
                                            <div className="col-md-2 d-flex justify-content-center">
                                                <div className="text-center">
                                                    <img 
                                                        src={professorSelecionado2.fotoUrl || '/default-avatar.png'} 
                                                        className="rounded-circle bg-light d-flex align-items-center justify-content-center border" 
                                                        style={{ width: '120px', height: '120px', objectFit: 'cover' }} 
                                                        alt={professorSelecionado2.nomeprofessor} 
                                                    />
                                                    <h6 className="mt-2 mb-0">
                                                        Código: {professorSelecionado2.codigoprofessor || 'N/I'}
                                                    </h6>
                                                </div>
                                            </div>
                                            <div className="col-md-10">
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <div className="mb-2">
                                                            <strong className="text-primary">Nome Completo:</strong>
                                                            <p className="mb-0">{professorSelecionado2.nomeprofessor || 'Não informado'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="mb-2">
                                                            <strong className="text-primary">Gênero:</strong>
                                                            <p className="mb-0">{professorSelecionado2.generoprofessor || 'Não informado'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="mb-2">
                                                            <strong className="text-primary">Nacionalidade:</strong>
                                                            <p className="mb-0">{professorSelecionado2.nacionalidadeprofessor || 'Não informado'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <hr className="my-4" />

                                        {/* DADOS PESSOAIS */}
                                        <h6 className="text-primary fw-bold mb-3">
                                            <FaInfoCircle className="me-2" />
                                            Dados Pessoais
                                        </h6>
                                        
                                        <div className="row mb-4">
                                            <div className="col-md-3">
                                                <div className="mb-2">
                                                    <strong>Estado Civil:</strong>
                                                    <p className="mb-0">{professorSelecionado2.estadocivilprofessor || 'Não informado'}</p>
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="mb-2">
                                                    <strong>Nome do Pai:</strong>
                                                    <p className="mb-0">{professorSelecionado2.nomepaiprofessor || 'Não informado'}</p>
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="mb-2">
                                                    <strong>Nome da Mãe:</strong>
                                                    <p className="mb-0">{professorSelecionado2.nomemaeprofessor || 'Não informado'}</p>
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="mb-2">
                                                    <strong>Nº do BI:</strong>
                                                    <p className="mb-0">{professorSelecionado2.nbiprofessor || 'Não informado'}</p>
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="mb-2">
                                                    <strong>Data de Nascimento:</strong>
                                                    <p className="mb-0">{professorSelecionado2.datanascimentoFormatada || 'Não informada'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* DOCUMENTO DE IDENTIFICAÇÃO (PDF) - CORRIGIDO */}
                                        <div className="row mb-4">
                                            <div className="col-md-12">
                                                <div className="p-3 bg-light rounded">
                                                    <strong className="d-block mb-2">Documento de Identificação (BI / CV):</strong>
                                                    {professorSelecionado2.curriculoUrl ? (
                                                        <div className="text-center">
                                                            <a 
                                                                href={professorSelecionado2.curriculoUrl} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                className="btn btn-primary"
                                                            >
                                                                <i className="bi bi-file-pdf me-2"></i>
                                                                Visualizar Documento
                                                            </a>
                                                            <p className="text-muted mt-2 small">
                                                                Clique no botão para abrir o PDF em nova aba
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted">Nenhum documento anexado</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <hr className="my-4" />

                                        {/* CONTATO E RESIDÊNCIA */}
                                        <h6 className="text-primary fw-bold mb-3">
                                            Contato e Residência
                                        </h6>
                                        
                                        <div className="row mb-4">
                                            <div className="col-md-4">
                                                <div className="mb-2">
                                                    <strong>Residência:</strong>
                                                    <p className="mb-0">{professorSelecionado2.residenciaprofessor || 'Não informado'}</p>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="mb-2">
                                                    <strong>Telefone:</strong>
                                                    <p className="mb-0">{professorSelecionado2.telefoneprofessor || 'Não informado'}</p>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="mb-2">
                                                    <strong>WhatsApp:</strong>
                                                    <p className="mb-0">{professorSelecionado2.whatsappprofessor || 'Não informado'}</p>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="mb-2">
                                                    <strong>Email:</strong>
                                                    <p className="mb-0">{professorSelecionado2.emailprofessor || 'Não informado'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <hr className="my-4" />

                                        {/* DADOS PROFISSIONAIS */}
                                        <h6 className="text-primary fw-bold mb-3">
                                            Dados Profissionais
                                        </h6>
                                        
                                        <div className="row mb-4">
                                            <div className="col-md-3">
                                                <div className="mb-2">
                                                    <strong>Anos de Experiência:</strong>
                                                    <p className="mb-0">{professorSelecionado2.anoexperienciaprofessor || 'Não informado'}</p>
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="mb-2">
                                                    <strong>Titularidade:</strong>
                                                    <p className="mb-0">{professorSelecionado2.titulacaoprofessor || 'Não informado'}</p>
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="mb-2">
                                                    <strong>Data de Admissão:</strong>
                                                    <p className="mb-0">{professorSelecionado2.dataadmissaoFormatada || 'Não informada'}</p>
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="mb-2">
                                                    <strong>Condições:</strong>
                                                    <p className="mb-0">{professorSelecionado2.condicoesprofessor || 'Não informado'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <hr className="my-4" />

                                        {/* DADOS BANCÁRIOS E SAÚDE */}
                                        <h6 className="text-primary fw-bold mb-3">
                                            Dados Bancários e Saúde
                                        </h6>
                                        
                                        <div className="row mb-4">
                                            <div className="col-md-3">
                                                <div className="mb-2">
                                                    <strong>IBAN:</strong>
                                                    <p className="mb-0">{professorSelecionado2.ibanprofessor || 'Não informado'}</p>
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="mb-2">
                                                    <strong>Tipo Sanguíneo:</strong>
                                                    <p className="mb-0">{professorSelecionado2.tiposanguineoprofessor || 'Não informado'}</p>
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="mb-2">
                                                    <strong>Contacto de Emergência:</strong>
                                                    <p className="mb-0">{professorSelecionado2.contactoemergenciaprofessor || 'Não informado'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* DISCIPLINAS
                                        {professorSelecionado2.disciplinas && professorSelecionado2.disciplinas.length > 0 && (
                                            <>
                                                <hr className="my-4" />
                                                <h6 className="text-primary fw-bold mb-3">
                                                    <FaBook className="me-2" />
                                                    Disciplinas Ministradas
                                                </h6>
                                                <div className="row mb-4">
                                                    {professorSelecionado2.disciplinas.map((disciplina) => (
                                                        <div key={disciplina.iddisciplina} className="col-md-4 mb-2">
                                                            <span className="badge bg-light text-dark p-2 border">
                                                                {disciplina.disciplina}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        )} */}

                                    </div>
                                </div>

                                {/* FOOTER */}
                                <div className="modal-footer border-0">
                                    <button 
                                        type="button" 
                                        className="btn btn-outline-secondary"
                                        onClick={closeModalInfo}
                                    >
                                        Fechar
                                    </button>
                                </div>

                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProfessorEdit;