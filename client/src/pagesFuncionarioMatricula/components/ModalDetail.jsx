import { RiContactsBook3Line } from "react-icons/ri";
import Style from "../../pagesAdm/components/DepartamentosEdit.module.css";
import { VscError } from "react-icons/vsc";
import { GrStatusGood } from "react-icons/gr";
import { MdEmail, MdPerson, MdPhone, MdAttachFile, MdDownload } from "react-icons/md";
import { FaInfoCircle, FaUniversity, FaFilePdf, FaFileImage, FaFileWord } from "react-icons/fa";
import { motion } from "framer-motion";

export const ModalDetail = ({
    closeModal,
    infoEstudante,
    handleAceitar,
    handleRecusar,
    handleReverter,
    filtroStatus,
    loading
}) => {

    const getDocumentIcon = (titulo, docUrl) => {
        if (!docUrl) return <MdAttachFile className="me-2" />;
        const ext = docUrl.split('.').pop()?.toLowerCase();
        if (ext === 'pdf') return <FaFilePdf className="me-2" style={{ color: '#dc3545' }} />;
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return <FaFileImage className="me-2" style={{ color: '#28a745' }} />;
        if (['doc', 'docx'].includes(ext)) return <FaFileWord className="me-2" style={{ color: '#007bff' }} />;
        return <MdAttachFile className="me-2" />;
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'Pendente': { class: 'bg-warning text-dark', label: 'Pendente' },
            'Aprovado': { class: 'bg-success', label: 'Aprovado' },
            'Reprovado': { class: 'bg-danger', label: 'Reprovado' },
            'Admitido': { class: 'bg-info', label: 'Admitido' },
            'Não Admitido': { class: 'bg-danger', label: 'Não Admitido' },
            'Matriculado': { class: 'bg-primary', label: 'Matriculado' }
        };
        return statusMap[status] || { class: 'bg-secondary', label: status || 'Não definido' };
    };

    const statusInfo = getStatusBadge(infoEstudante?.estado_estudanteInscrito || infoEstudante?.status);

    // Dados do estudante
    const estudante = {
        id: infoEstudante?.id_estudanteInscricao || infoEstudante?.id_est,
        nome: infoEstudante?.nome_estudanteInscricao || infoEstudante?.nome,
        contacto: infoEstudante?.contacto_estudanteInscricao || infoEstudante?.contacto,
        genero: infoEstudante?.sexo_estudanteInscricao || infoEstudante?.genero,
        email: infoEstudante?.email_estudanteInscricao || infoEstudante?.email,
        bi: infoEstudante?.bi_estudanteInscricao || infoEstudante?.bi,
        status: infoEstudante?.estado_estudanteInscrito || infoEstudante?.status,
        codigo: infoEstudante?.numeroInscricao_estudanteInscricao || infoEstudante?.codigo,
        nota: infoEstudante?.nota_estudanteInscricao || infoEstudante?.nota,
        foto: infoEstudante?.foto_estudanteInscricao || infoEstudante?.foto,
        fotoUrl: infoEstudante?.fotoUrl,
        curso: infoEstudante?.curso,
        periodo: infoEstudante?.periodo_estudanteInscricao || infoEstudante?.periodo,
        documentos: infoEstudante?.documentos || []
    };

    return (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,.5)' }}>
            <motion.div
                animate={{ opacity: 1, transition: { duration: 0.3 } }}
                initial={{ opacity: 0 }}
                className="modal-dialog modal-dialog-centered modal-lg"
            >
                <div className="modal-content shadow-lg border-0">
                    {/* Header */}
                    <div className="modal-header" style={{ backgroundColor: 'var(--azul-escuro)', color: 'var(--dourado)' }}>
                        <h5 className="modal-title mb-0">
                            <FaInfoCircle className="me-2" />
                            Informações do Estudante - {estudante.nome}
                        </h5>
                        <button
                            type="button"
                            className="btn-close btn-close-white"
                            onClick={closeModal}
                        />
                    </div>

                    {/* Body */}
                    <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                        <div className="container-fluid">
                            {/* Foto e informações básicas */}
                            <div className="row mb-4">
                                <div className="col-md-3 text-center">
                                    <img
                                        src={estudante.fotoUrl || '/default-avatar.png'}
                                        className="rounded-circle border"
                                        style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                                        alt={estudante.nome}
                                    />
                                    <h6 className="mt-2 mb-0" style={{ color: 'var(--azul-escuro)' }}>
                                        Código: {estudante.codigo || 'N/I'}
                                    </h6>
                                    <span className={`badge mt-1 ${statusInfo.class}`}>
                                        {statusInfo.label}
                                    </span>
                                    {estudante.nota && (
                                        <p className="mt-1 mb-0">
                                            <strong>Nota:</strong> {estudante.nota}
                                        </p>
                                    )}
                                </div>
                                <div className="col-md-9">
                                    <div className="card bg-light border-0">
                                        <div className="card-body">
                                            <h6 className="card-title" style={{ color: 'var(--azul-escuro)' }}>
                                                <MdPerson className="me-2" />
                                                Dados Pessoais
                                            </h6>
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <p className="mb-1"><strong>Nome Completo:</strong> {estudante.nome || 'Não informado'}</p>
                                                    <p className="mb-1"><strong>Gênero:</strong> {estudante.genero || 'Não informado'}</p>
                                                    <p className="mb-1"><strong>Nº do BI:</strong> {estudante.bi || 'Não informado'}</p>
                                                </div>
                                                <div className="col-md-6">
                                                    <p className="mb-1"><strong>Email:</strong> {estudante.email || 'Não informado'}</p>
                                                    <p className="mb-1"><strong>Telefone:</strong> {estudante.contacto || 'Não informado'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <hr className="my-4" />

                            {/* Contato */}
                            <h6 className="mb-3" style={{ color: 'var(--azul-escuro)' }}>
                                <RiContactsBook3Line className="me-2" />
                                Contato
                            </h6>
                            <div className="row mb-4">
                                <div className="col-md-6">
                                    <div className="card bg-light border-0 h-100">
                                        <div className="card-body">
                                            <p className="mb-1"><MdPhone className="me-1" /> <strong>Telefone:</strong></p>
                                            <p className="mb-0">{estudante.contacto || 'Não informado'}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="card bg-light border-0 h-100">
                                        <div className="card-body">
                                            <p className="mb-1"><MdEmail className="me-1" /> <strong>Email:</strong></p>
                                            <p className="mb-0">{estudante.email || 'Não informado'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <hr className="my-4" />

                            {/* Dados Acadêmicos */}
                            <h6 className="mb-3" style={{ color: 'var(--azul-escuro)' }}>
                                <FaUniversity className="me-2" />
                                Dados Acadêmicos
                            </h6>
                            <div className="row mb-4">
                                <div className="col-md-6">
                                    <div className="card bg-light border-0">
                                        <div className="card-body">
                                            <strong>Curso:</strong>
                                            <p className="mb-0 mt-1">{estudante.curso || 'Não informado'}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="card bg-light border-0">
                                        <div className="card-body">
                                            <strong>Período:</strong>
                                            <p className="mb-0 mt-1">{estudante.periodo || 'Não informado'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <hr className="my-4" />

                            {/* Documentos */}
                            <h6 className="mb-3" style={{ color: 'var(--azul-escuro)' }}>
                                <MdAttachFile className="me-2" />
                                Documentos do Estudante
                            </h6>
                            <div className="row mb-4">
                                <div className="col-12">
                                    {estudante.documentos && estudante.documentos.length > 0 ? (
                                        <div className="row g-3">
                                            {estudante.documentos.map((doc, index) => (
                                                <div key={doc.id_fei || index} className="col-md-6 col-lg-4">
                                                    <div className="card bg-light border-0 h-100">
                                                        <div className="card-body d-flex align-items-center">
                                                            {getDocumentIcon(doc.titulo, doc.docUrl)}
                                                            <div className="flex-grow-1 ms-2">
                                                                <p className="mb-0 fw-bold text-truncate" style={{ maxWidth: '150px' }}>
                                                                    {doc.titulo}
                                                                </p>
                                                                <a
                                                                    href={doc.docUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="btn btn-sm btn-outline-primary mt-1"
                                                                >
                                                                    <MdDownload className="me-1" />
                                                                    Visualizar
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="alert alert-info text-center">
                                            <MdAttachFile className="me-2" />
                                            Nenhum documento anexado
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer - Ações */}
                    {filtroStatus === "Pendente" && (
                        <div className="modal-footer border-0">
                            <div className="d-flex gap-2 flex-wrap">
                                <button
                                    type="button"
                                    className={`btn ${Style.btnAdd}`}
                                    onClick={() => handleAceitar(estudante.id, estudante.nome)}
                                    disabled={loading}
                                >
                                    <GrStatusGood className="me-2" />
                                    Aceitar Inscrição
                                </button>
                                <button
                                    type="button"
                                    className={`btn ${Style.btnDeletar}`}
                                    onClick={() => handleRecusar(estudante.id, estudante.nome)}
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
                    )}

                    {(filtroStatus === "Reprovado" || filtroStatus === "Não Admitido") && (
                        <div className="modal-footer border-0">
                            <div className="d-flex gap-2 flex-wrap">
                                <button
                                    type="button"
                                    className={`btn ${Style.btnReverter}`}
                                    onClick={() => handleReverter(estudante.id, estudante.nome)}
                                    disabled={loading}
                                >
                                    <VscError className="me-2" />
                                    Reverter Reprovação
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
                    )}

                    {(filtroStatus === "Aprovado" || filtroStatus === "Admitido" || filtroStatus === "Matriculado") && (
                        <div className="modal-footer border-0">
                            <div className="d-flex gap-2 flex-wrap">
                                <button
                                    type="button"
                                    className={`btn ${Style.btnCancelar}`}
                                    onClick={closeModal}
                                >
                                    Fechar
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};