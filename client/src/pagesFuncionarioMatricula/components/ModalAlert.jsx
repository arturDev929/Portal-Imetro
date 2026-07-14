// src/pagesFuncionarioMatricula/components/ModalAlert.jsx
import Style from "../../pagesAdm/components/DepartamentosEdit.module.css";
import { VscError } from "react-icons/vsc";
import { GrStatusGood } from "react-icons/gr";

export const ModalAlert = ({ closeModal, infoEstudante, handleReverter, loading }) => {

    const estudante = {
        id: infoEstudante?.id_estudanteInscricao || infoEstudante?.id_est,
        nome: infoEstudante?.nome_estudanteInscricao || infoEstudante?.nome,
        status: infoEstudante?.estado_estudanteInscrito || infoEstudante?.status,
        codigo: infoEstudante?.numeroInscricao_estudanteInscricao || infoEstudante?.codigo,
        curso: infoEstudante?.curso
    };

    return (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,.5)' }}>
            <div className="modal-dialog modal-dialog-centered modal-md">
                <div className="modal-content shadow-lg border-0">
                    <div className="modal-header" style={{ backgroundColor: 'var(--azul-escuro)', color: 'var(--dourado)' }}>
                        <h5 className="modal-title mb-0">
                            <VscError className="me-2" />
                            Confirmar Reversão
                        </h5>
                        <button
                            type="button"
                            className="btn-close btn-close-white"
                            onClick={closeModal}
                        />
                    </div>
                    <div className="modal-body">
                        <div className="text-center py-3">
                            <VscError size={48} className="text-warning mb-3" />
                            <h5>Tem certeza que deseja reverter a reprovação de:</h5>
                            <h4 className="fw-bold" style={{ color: 'var(--azul-escuro)' }}>
                                {estudante.nome}
                            </h4>
                            <div className="mt-2">
                                <span className="badge bg-danger me-2">Status atual: {estudante.status}</span>
                                <span className="badge bg-warning text-dark">Novo status: Pendente</span>
                            </div>
                            {estudante.codigo && (
                                <p className="text-muted mt-2">
                                    <strong>Código:</strong> {estudante.codigo}
                                </p>
                            )}
                            {estudante.curso && (
                                <p className="text-muted">
                                    <strong>Curso:</strong> {estudante.curso}
                                </p>
                            )}
                            <p className="text-muted mt-3 small">
                                Esta ação irá reverter o status para <strong>Pendente</strong> e permitirá uma nova avaliação.
                            </p>
                        </div>
                    </div>
                    <div className="modal-footer border-0 justify-content-center">
                        <button
                            type="button"
                            className={`btn ${Style.btnCancelar}`}
                            onClick={closeModal}
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            className={`btn ${Style.btnReverter}`}
                            onClick={() => handleReverter(estudante.id, estudante.nome)}
                            disabled={loading}
                        >
                            <GrStatusGood className="me-2" />
                            Confirmar Reversão
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};