import { RiContactsBook3Line } from "react-icons/ri";
import Style from "../../pagesAdm/components/DepartamentosEdit.module.css";
import { VscError } from "react-icons/vsc";
import { GrStatusGood } from "react-icons/gr";
import { MdAttachFile, MdEmail, MdPerson, MdPhone } from "react-icons/md";
import { FaInfoCircle, FaUniversity } from "react-icons/fa";

export const ModalAlert=({closeModal,infoEstudante,handleReverter,filtroStatus,loading})=>{
    return <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,.5)' }}>
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
                                   
                                </div>
                            </div>
                           
                        </div>
                    </div>
                </div>
}