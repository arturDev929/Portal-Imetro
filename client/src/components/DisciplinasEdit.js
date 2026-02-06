import { useState, useEffect } from "react";
import Axios from "axios";
import { FaBook } from "react-icons/fa";
import { MdEdit, MdDeleteForever } from "react-icons/md";
import { FaChalkboardTeacher } from "react-icons/fa";

function DisciplinaEdit() {
    const [listaDisciplina, setListaDisciplina] = useState([]);
    const [isModalOpen, setModalOpen] = useState(false);
    const [disciplinaSelecionada, setDisciplinaSelecionada] = useState(null);

    useEffect(() => {
        const fetchData = () => {
            Axios.get('http://localhost:8080/get/Disciplinas').then((response) => {
                setListaDisciplina(response.data);
            });
        };
        fetchData();
        const interval = setInterval(fetchData, 2000);
        return () => {
            clearInterval(interval);
        };
    }, []);

    // Fechar modal com tecla ESC
    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === 'Escape' && isModalOpen) {
                closeModal();
            }
        };

        window.addEventListener('keydown', handleEsc);
        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [isModalOpen]);

    // Prevenir scroll do body quando modal aberto
    useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }

        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isModalOpen]);

    const openModal = (disciplina) => {
        setDisciplinaSelecionada(disciplina);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setDisciplinaSelecionada(null);
    };

    return (
        <div className="row mb-4">
            <div className="col-12">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2 className="h4 mb-0 text-primary">
                        <FaBook className="mb-2 me-2" />
                        Disciplinas/Cadeiras
                    </h2>
                </div>
                <div className="d-flex col-12 table-responsive">
                    <table className="table table-hover table-striped">
                        <thead className="table-primary">
                            <tr>
                                <th className="col-9">Nome</th>
                                <th className="col-1 text-center">PF's</th>
                                <th className="col-1 text-center">Editar</th>
                                <th className="col-1 text-center">Apagar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {listaDisciplina && listaDisciplina.length > 0 ? (
                                listaDisciplina.map((disciplina) => (
                                    <tr key={disciplina.iddisciplina}>
                                        <td>
                                            <FaBook className="mb-1 me-2" />
                                            {disciplina.disciplina}
                                        </td>
                                        <td className="text-center">
                                            <FaChalkboardTeacher />
                                        </td>
                                        <td className="text-center">
                                            <button
                                                className="btn btn-link p-0"
                                                onClick={() => openModal(disciplina)}
                                                title="Editar disciplina"
                                            >
                                                <MdEdit />
                                            </button>
                                        </td>
                                        <td className="text-center">
                                            <button className="btn btn-link p-0">
                                                <MdDeleteForever />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="text-center text-muted">
                                        Nenhuma disciplina cadastrada
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {isModalOpen && (
                    <div className="modal-overlay" onClick={closeModal}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2 className="modal-title">
                                    <FaBook className="me-2" />
                                    {disciplinaSelecionada?.disciplina}
                                </h2>
                                <button
                                    type="button"
                                    className="btn-close-modal"
                                    onClick={closeModal}
                                    aria-label="Fechar"
                                >
                                    &times;
                                </button>
                            </div>

                            <div className="modal-body">
                                <form>
                                    <div className="mb-3">
                                        <label htmlFor="nomeDisciplina" className="form-label">
                                            Nome da Disciplina
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="nomeDisciplina"
                                            placeholder="Digite o nome da disciplina"
                                            defaultValue={disciplinaSelecionada?.disciplina || ''}
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="codigoDisciplina" className="form-label">
                                            Código
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="codigoDisciplina"
                                            placeholder="Ex: MAT101"
                                            defaultValue={disciplinaSelecionada?.codigo || ''}
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="professorDisciplina" className="form-label">
                                            <FaChalkboardTeacher className="me-1" />
                                            Professor Responsável
                                        </label>
                                        <select className="form-select" id="professorDisciplina">
                                            <option value="">Selecione um professor</option>
                                            <option value="1">Professor João Silva</option>
                                            <option value="2">Professora Maria Santos</option>
                                            <option value="3">Professor Carlos Oliveira</option>
                                        </select>
                                    </div>
                                </form>
                            </div>

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={closeModal}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => {
                                        console.log('Salvando disciplina:', disciplinaSelecionada);
                                        closeModal();
                                    }}
                                >
                                    {disciplinaSelecionada ? 'Salvar Alterações' : 'Criar Disciplina'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <style jsx>{`
                    .modal-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background-color: rgba(0, 0, 0, 0.5);
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        z-index: 1050;
                    }
                    
                    .modal-content {
                        background: white;
                        width: 90%;
                        max-width: 500px;
                        border-radius: 8px;
                        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                        overflow: hidden;
                    }
                    
                    .modal-header {
                        padding: 1rem;
                        background: #007bff;
                        color: white;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    
                    .modal-title {
                        margin: 0;
                        font-size: 1.25rem;
                        display: flex;
                        align-items: center;
                    }
                    
                    .btn-close-modal {
                        background: none;
                        border: none;
                        color: white;
                        font-size: 1.5rem;
                        cursor: pointer;
                        padding: 0;
                        width: 30px;
                        height: 30px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    
                    .modal-body {
                        padding: 1.5rem;
                        max-height: 60vh;
                        overflow-y: auto;
                    }
                    
                    .modal-footer {
                        padding: 1rem;
                        background: #f8f9fa;
                        border-top: 1px solid #dee2e6;
                        display: flex;
                        justify-content: flex-end;
                        gap: 0.5rem;
                    }
                    
                    @media (max-width: 576px) {
                        .modal-content {
                            width: 95%;
                            margin: 0.5rem;
                        }
                    }
                `}</style>
            </div>
        </div>
    );
}

export default DisciplinaEdit;