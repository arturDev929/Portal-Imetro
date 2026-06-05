import { RiContactsBook3Line } from "react-icons/ri";
import Style from "../../pagesAdm/components/DepartamentosEdit.module.css";
import { VscError } from "react-icons/vsc";
import { GrStatusGood } from "react-icons/gr";
import { MdAttachFile, MdEmail, MdPerson, MdPhone } from "react-icons/md";
import { FaInfoCircle, FaUniversity } from "react-icons/fa";
import { motion } from "framer-motion";

export const ModalDetail=({closeModal,infoEstudante,handleAceitar,handleRecusar,handleReverter,filtroStatus,loading})=>{
    return <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,.5)' }}>
<<<<<<< HEAD
                    <motion.div animate={{ opacity: 1 ,transition: { duration: 0.5 } }}  initial={{ opacity: 0 }} className="modal-dialog modal-dialog-centered modal-xl">
=======
                    <motion.div animate={{ opacity: 1 ,transition: { duration: 0.5 } }} initial={{ opacity: 0 }} className="modal-dialog modal-dialog-centered modal-xl">
>>>>>>> eliseu_front2.0
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
                                filtroStatus==="Pendente"&&(
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
                                )
                            }
                            {
                                filtroStatus==="Reprovado"&&(
                                <div className="modal-footer border-0">
                                <div className="d-flex gap-2">

                                     <button
                                        type="button"
                                        className={`btn ${Style.btnReverter}`}
                                        onClick={() => handleReverter(infoEstudante.id_estudanteInscricao, infoEstudante.nome_estudanteInscricao)}
                                        disabled={loading}
                                    >
                                        <VscError className="me-2" />
                                        Reverter Reprovacao
                                    </button>

                                </div>
                            </div>
                                )
                            }
                        </div>
                    </motion.div>
                </div>
}