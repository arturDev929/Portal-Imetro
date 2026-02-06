import { useState, useEffect } from "react";
import Axios from "axios";
import { FaBook } from "react-icons/fa";
import { MdEdit, MdDeleteForever } from "react-icons/md";
import { FaChalkboardTeacher } from "react-icons/fa";
import { showErrorToast, showSuccessToast, useConfirmToast} from "./CustomToast";

function DisciplinaEdit() {
    const [listaDisciplina, setListaDisciplina] = useState([]);
    const [isModalOpen, setModalOpen] = useState(false);
    const [disciplinaSelecionada, setDisciplinaSelecionada] = useState(null);
    const [Editar, setEditar] = useState({
        iddisciplina: '',
        disciplina: ''
    });
    const { showConfirmToast, isConfirming } = useConfirmToast();

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

    const openModal = (disciplina) => {
        setDisciplinaSelecionada(disciplina);
        setEditar({
            disciplina: disciplina.disciplina,
            iddisciplina: disciplina.iddisciplina
        });
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditar({
            disciplina: '',
            iddisciplina: ''
        });
        setDisciplinaSelecionada(null);
    };

    const EditarDisciplina = (valores) => {
        setEditar((prevValue) => ({
            ...prevValue,
            [valores.target.name]: valores.target.value
        }));
    };

    const AtualizarDisciplina = () => {
        Axios.put(`http://localhost:8080/put/disciplina/${Editar.iddisciplina}`, {
            disciplina: Editar.disciplina,
            iddisciplina: Editar.iddisciplina
        }).then((response) => {
            showSuccessToast(
                "Sucesso",
                `${Editar.disciplina} foi atualizado com sucesso!`
            );
            const updateList = listaDisciplina.map((item) =>
                item.iddisciplina === Editar.iddisciplina ? { ...item, disciplina: Editar.disciplina } : item
            );
            setListaDisciplina(updateList);
            closeModal();
        }).catch((error) => {
            showErrorToast("Erro", "Erro ao atualizar a disciplina");
        });
    }

    const DeletarDisciplina = (disciplina) => {
        showConfirmToast(
            `Ao deletar esta disciplina irá desvincular a todos os cursos. Tem a certeza que pretendes deletar "${disciplina.disciplina}"?`,
            async () =>{
                try{
                    await Axios.delete(`http://localhost:8080/delete/disciplina/${disciplina.iddisciplina}`);
                    const updatedList = listaDisciplina.filter(
                        item => item.iddisciplina !== disciplina.iddisciplina
                    );
                    setListaDisciplina(updatedList);
                    showSuccessToast(
                        "Sucesso",
                        `Disciplina ${disciplina.disciplina} foi deletado com sucesso.`
                    )
                }catch (error){
                    showErrorToast(
                        "Erro!",
                        `Erro ao excluir a disciplina ${disciplina.disciplina}` 
                    )
                }
            },
            ()=>{

            },
            "Confirmar a Exclusão"
        )
    }

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
                                            <FaBook className="mb-1 me-2 text-primary" />
                                            {disciplina.disciplina}
                                        </td>
                                        <td className="text-center">
                                            <button
                                                className="btn btn-sm btn-outline-info"
                                                onClick=""
                                                title="Professores"
                                            >
                                                <FaChalkboardTeacher />
                                            </button>
                                        </td>
                                        <td className="text-center">
                                            <button
                                                className="btn btn-sm btn-outline-primary"
                                                onClick={() => openModal(disciplina)}
                                                disabled={isConfirming}
                                                title="Editar"
                                            >
                                                <MdEdit />
                                            </button>
                                        </td>
                                        <td className="text-center">
                                            <button 
                                                className="btn btn-sm btn-outline-danger"
                                                disabled={isConfirming}
                                                onClick={()=>DeletarDisciplina(disciplina)}
                                            >
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

                {/* Modal Bootstrap */}
                <div 
                    className={`modal fade ${isModalOpen ? 'show d-block' : ''}`} 
                    tabIndex="-1" 
                    style={{ display: isModalOpen ? 'block' : 'none', backgroundColor: isModalOpen ? 'rgba(0,0,0,0.5)' : 'transparent' }}
                >
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title d-flex align-items-center">
                                    <FaBook className="me-2" />
                                    {disciplinaSelecionada?.disciplina}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close btn-close-white"
                                    onClick={closeModal}
                                    aria-label="Fechar"
                                ></button>
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
                                            name="disciplina"
                                            value={Editar.disciplina}
                                            placeholder="Digite o nome da disciplina"
                                            onChange={EditarDisciplina}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <input
                                            type="hidden"
                                            className="form-control"
                                            name="iddisciplina"
                                            value={Editar.iddisciplina}
                                            onChange={EditarDisciplina}
                                        />
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
                                    onClick={AtualizarDisciplina}
                                    disabled={!Editar.disciplina.trim()}
                                >
                                    Salvar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DisciplinaEdit;