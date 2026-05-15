import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MdArrowBack, MdAdd, MdDelete, MdEdit, MdSave, MdClose } from "react-icons/md";
import { FaBook, FaCalendarAlt } from "react-icons/fa";
import TeacherLayout from "../layouts/TeacherLayout";
import api from "../service/api";
import { showErrorToast, showSuccessToast } from "../components/global/CustomToast";

function AulasTurma() {
    const { idperiodo, iddisciplina } = useParams();
    const navigate = useNavigate();
    const [aulas, setAulas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalAberto, setModalAberto] = useState(false);
    const [editando, setEditando] = useState(null);
    const [formData, setFormData] = useState({
        data_aula: new Date().toISOString().split('T')[0],
        conteudo: '',
        observacoes: ''
    });
    const [salvando, setSalvando] = useState(false);

    useEffect(() => {
        carregarAulas();
    }, [idperiodo, iddisciplina]);

    const carregarAulas = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/aulasTurma/${idperiodo}/${iddisciplina}`);
            if (response.data.success) {
                setAulas(response.data.data);
            }
        } catch (error) {
            console.error("Erro ao carregar aulas:", error);
            showErrorToast("Erro", "Não foi possível carregar as aulas");
        } finally {
            setLoading(false);
        }
    };

    const abrirModal = (aula = null) => {
        if (aula) {
            setEditando(aula);
            setFormData({
                data_aula: aula.data_aula.split('T')[0],
                conteudo: aula.conteudo || '',
                observacoes: aula.observacoes || ''
            });
        } else {
            setEditando(null);
            setFormData({
                data_aula: new Date().toISOString().split('T')[0],
                conteudo: '',
                observacoes: ''
            });
        }
        setModalAberto(true);
    };

    const fecharModal = () => {
        setModalAberto(false);
        setEditando(null);
        setFormData({
            data_aula: new Date().toISOString().split('T')[0],
            conteudo: '',
            observacoes: ''
        });
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const salvarAula = async () => {
        if (!formData.data_aula) {
            showErrorToast("Erro", "Informe a data da aula");
            return;
        }

        setSalvando(true);
        try {
            const response = await api.post('/aula', {
                idperiodo: parseInt(idperiodo),
                iddisciplina: parseInt(iddisciplina),
                data_aula: formData.data_aula,
                conteudo: formData.conteudo,
                observacoes: formData.observacoes
            });

            if (response.data.success) {
                showSuccessToast("Sucesso", response.data.message);
                fecharModal();
                carregarAulas();
            }
        } catch (error) {
            console.error("Erro ao salvar aula:", error);
            showErrorToast("Erro", "Não foi possível salvar a aula");
        } finally {
            setSalvando(false);
        }
    };

    const deletarAula = async (idAula) => {
        if (window.confirm("Tem certeza que deseja excluir esta aula?")) {
            try {
                const response = await api.delete(`/aula/${idAula}`);
                if (response.data.success) {
                    showSuccessToast("Sucesso", response.data.message);
                    carregarAulas();
                }
            } catch (error) {
                console.error("Erro ao deletar aula:", error);
                showErrorToast("Erro", "Não foi possível deletar a aula");
            }
        }
    };

    const formatarData = (dataString) => {
        const data = new Date(dataString);
        return data.toLocaleDateString('pt-BR');
    };

    if (loading) {
        return (
            <TeacherLayout>
                <div className="container-fluid py-4 text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Carregando...</span>
                    </div>
                </div>
            </TeacherLayout>
        );
    }

    return (
        <TeacherLayout>
            <div className="container-fluid px-4 py-4">
                {/* Header */}
                <div className="row mb-4">
                    <div className="col-12">
                        <button 
                            className="btn btn-outline-secondary mb-3"
                            onClick={() => navigate(-1)}
                        >
                            <MdArrowBack className="me-2" />
                            Voltar
                        </button>
                        
                        <div className="d-flex justify-content-between align-items-center flex-wrap">
                            <div>
                                <h2 className="h4 mb-0" style={{ color: 'var(--azul-escuro)' }}>
                                    <FaBook className="me-2" />
                                    Plano de Aulas
                                </h2>
                                <p className="text-muted mt-2 mb-0">
                                    Gerencie o conteúdo programático das aulas
                                </p>
                            </div>
                            <button 
                                className="btn btn-primary mt-2 mt-sm-0"
                                onClick={() => abrirModal()}
                            >
                                <MdAdd className="me-2" />
                                Nova Aula
                            </button>
                        </div>
                    </div>
                </div>

                {/* Lista de Aulas */}
                <div className="row">
                    <div className="col-12">
                        {aulas.length === 0 ? (
                            <div className="card border-0 shadow-sm">
                                <div className="card-body text-center py-5">
                                    <FaBook size={48} className="text-muted mb-3" />
                                    <p className="text-muted mb-0">Nenhuma aula registrada ainda.</p>
                                    <button 
                                        className="btn btn-outline-primary mt-3"
                                        onClick={() => abrirModal()}
                                    >
                                        <MdAdd className="me-2" />
                                        Registrar Primeira Aula
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="timeline">
                                {aulas.map((aula, index) => (
                                    <div key={aula.id_aula} className="card border-0 shadow-sm mb-3">
                                        <div className="card-body">
                                            <div className="d-flex justify-content-between align-items-start">
                                                <div>
                                                    <h6 className="mb-2">
                                                        <FaCalendarAlt className="me-2 text-primary" />
                                                        {formatarData(aula.data_aula)}
                                                    </h6>
                                                    {aula.conteudo && (
                                                        <p className="mb-2">
                                                            <strong>Conteúdo:</strong><br />
                                                            {aula.conteudo}
                                                        </p>
                                                    )}
                                                    {aula.observacoes && (
                                                        <p className="mb-0 text-muted small">
                                                            <strong>Observações:</strong> {aula.observacoes}
                                                        </p>
                                                    )}
                                                </div>
                                                <div>
                                                    <button
                                                        className="btn btn-sm btn-outline-warning me-2"
                                                        onClick={() => abrirModal(aula)}
                                                    >
                                                        <MdEdit />
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => deletarAula(aula.id_aula)}
                                                    >
                                                        <MdDelete />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Modal Nova/Editar Aula */}
                {modalAberto && (
                    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content shadow-lg border-0">
                                <div className="modal-header" style={{ backgroundColor: 'var(--azul-escuro)', color: 'var(--dourado)' }}>
                                    <h5 className="modal-title mb-0">
                                        {editando ? 'Editar Aula' : 'Nova Aula'}
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn-close btn-close-white"
                                        onClick={fecharModal}
                                        disabled={salvando}
                                    />
                                </div>

                                <div className="modal-body p-4">
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Data da Aula *</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            name="data_aula"
                                            value={formData.data_aula}
                                            onChange={handleChange}
                                            disabled={salvando}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Conteúdo Ministrado</label>
                                        <textarea
                                            className="form-control"
                                            name="conteudo"
                                            rows="4"
                                            value={formData.conteudo}
                                            onChange={handleChange}
                                            placeholder="Descreva o conteúdo abordado nesta aula..."
                                            disabled={salvando}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Observações</label>
                                        <textarea
                                            className="form-control"
                                            name="observacoes"
                                            rows="2"
                                            value={formData.observacoes}
                                            onChange={handleChange}
                                            placeholder="Observações adicionais..."
                                            disabled={salvando}
                                        />
                                    </div>
                                </div>

                                <div className="modal-footer border-0 justify-content-between p-4">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={fecharModal}
                                        disabled={salvando}
                                    >
                                        <MdClose className="me-2" />
                                        Cancelar
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-primary px-4"
                                        onClick={salvarAula}
                                        disabled={salvando}
                                    >
                                        {salvando ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" />
                                                Salvando...
                                            </>
                                        ) : (
                                            <>
                                                <MdSave className="me-2" />
                                                Salvar
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style jsx="true">{`
                .timeline {
                    position: relative;
                }
                .timeline::before {
                    content: '';
                    position: absolute;
                    left: 20px;
                    top: 0;
                    bottom: 0;
                    width: 2px;
                    background: var(--azul-escuro);
                    opacity: 0.2;
                }
                .card {
                    position: relative;
                    margin-left: 50px;
                }
                .card::before {
                    content: '';
                    position: absolute;
                    left: -30px;
                    top: 20px;
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    background: var(--azul-escuro);
                    border: 2px solid white;
                    box-shadow: 0 0 0 2px var(--azul-escuro);
                }
            `}</style>
        </TeacherLayout>
    );
}

export default AulasTurma;