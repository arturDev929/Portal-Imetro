import { useState, useEffect } from "react";
import Axios from "axios";
import { FaBook } from "react-icons/fa";
import { MdEdit, MdDeleteForever } from "react-icons/md";
import { FaChalkboardTeacher } from "react-icons/fa";
import { showErrorToast, showSuccessToast, useConfirmToast} from "./CustomToast";
import { CiCircleMinus, CiCirclePlus} from "react-icons/ci";
import img from "../img/professores/professor_27296899_foto_1769625055915.jpeg"

function DisciplinaEdit() {
    const [listaDisciplina, setListaDisciplina] = useState([]);
    const [isModalOpen, setModalOpen] = useState(false);
    const [isModalOpenProfessor, setIsModalOpenProfessor] = useState(false)
    const [disciplinaSelecionada, setDisciplinaSelecionada] = useState(null);
    const [professor, setprofessor] = useState(null)
    const [Editar, setEditar] = useState({
        iddisciplina: '',
        disciplina: ''
    });
    const [professoresVinculados, setProfessoresVinculados] = useState([]);
    const [professoresDisponiveis, setProfessoresDisponiveis] = useState([]);
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

    useEffect(()=>{
        if(isModalOpenProfessor){
            document.body.style.overflow='hiden';
        }else{
            document.body.style.overflow='auto';
        }
        return ()=>{
            document.body.style.overflow='auto';
        }
    },[isModalOpenProfessor]);

    const openModalProfessor = (disciplina)=>{
        setprofessor(disciplina)
        setIsModalOpenProfessor(true)
        
        // Buscar professores VINCULADOS
        Axios.get(`http://localhost:8080/get/professorVinculado/${disciplina.iddisciplina}`)
            .then((response)=>{
                setProfessoresVinculados(response.data)
            })
            .catch((error)=>{
                console.error("Erro ao buscar professores vinculados:", error);
                showErrorToast("Erro", "Não foi possível carregar os professores vinculados");
            })
        
        // Buscar professores DISPONÍVEIS
        Axios.get(`http://localhost:8080/get/professorDisponivel/${disciplina.iddisciplina}`)
            .then((response)=>{
                setProfessoresDisponiveis(response.data)
            })
            .catch((error)=>{
                console.error("Erro ao buscar professores disponíveis:", error);
                showErrorToast("Erro", "Não foi possível carregar os professores disponíveis");
            })
    }

    // Função para vincular professor
    const vincularProfessor = (professorId) => {
        console.log("Vinculando professor com ID:", professorId, "à disciplina ID:", professor.iddisciplina);
        Axios.post('http://localhost:8080/post/vincularProfessor', {
            iddisciplina: professor.iddisciplina,
            idprofessor: professorId
        })
        .then((response) => {
            showSuccessToast("Sucesso", "Professor vinculado com sucesso!");
            
            // Atualizar listas
            const professorParaVincular = professoresDisponiveis.find(p => p.idprofessor === professorId);
            
            // Remover da lista de disponíveis
            setProfessoresDisponiveis(prev => prev.filter(p => p.idprofessor !== professorId));
            
            // Adicionar na lista de vinculados
            setProfessoresVinculados(prev => [...prev, {
                ...professorParaVincular,
                iddisciplina: professor.iddisciplina,
                disciplina: professor.disciplina
            }]);
        })
        .catch((error) => {
            showErrorToast("Erro", "Não foi possível vincular o professor");
        });
    };

    const getProfessorImagem = (professor)=>{
        if(professor.fotoUrl){
            return professor.fotoUrl
        }
        if (professor.fotoprofessor) {
            return `http://localhost:8080/api/img/professores/${professor.fotoprofessor}`;
        }
    }

    // Função para desvincular professor
    const desvincularProfessor = (idprofessor) => {
        console.log("Desvinculando professor com ID de vínculo:", idprofessor);
        Axios.delete(`http://localhost:8080/delete/desvincularProfessor/${idprofessor}`)
        .then((response) => {
            showSuccessToast("Sucesso", "Professor desvinculado com sucesso!");
            const professorParaDesvincular = professoresVinculados.find(p => p.idprofessor === idprofessor);
            
            // Remover da lista de vinculados
            setProfessoresVinculados(prev => prev.filter(p => p.idprofessor !== idprofessor));
            
            // Adicionar na lista de disponíveis (removendo campos extras)
            const { iddisciplina, disciplina, iddisc_prof, ...professorLimpo } = professorParaDesvincular;
            setProfessoresDisponiveis(prev => [...prev, professorLimpo]);
        })
        .catch((error) => {
            showErrorToast("Erro", "Não foi possível desvincular o professor");
        });
    };

    const closeModalProfessor = () =>{
        setIsModalOpenProfessor(false)
        setprofessor(null)
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
                                                onClick={()=>openModalProfessor(disciplina)}
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

                {/* Modal professor */}
                {isModalOpenProfessor && (
                    <div 
                        className={`modal fade ${isModalOpenProfessor ? 'show d-block' : ''}`} 
                        tabIndex="-1" 
                        style={{ 
                            display: isModalOpenProfessor ? 'block' : 'none', 
                            backgroundColor: isModalOpenProfessor ? 'rgba(0,0,0,0.5)' : 'transparent' 
                        }}
                    >
                        <div className="modal-dialog modal-dialog-centered modal-lg">
                            <div className="modal-content">
                                <div className="modal-header bg-primary text-white">
                                    <h5 className="modal-title">
                                        Professores Vinculados a disciplina de {professor?.disciplina}
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn-close btn-close-white"
                                        onClick={closeModalProfessor}
                                        aria-label="Fechar"
                                    ></button>
                                </div>

                                <div className="modal-body">
                                    <div className="row">
                                        {/* Lado Esquerdo - Professores Vinculados */}
                                        <div className="col-12 col-md-6 border-end">
                                            <h4 className="text-center mb-4">Professores Vinculados</h4>
                                            <div className="professores-list">
                                                {professoresVinculados && professoresVinculados.length > 0 ? (
                                                    professoresVinculados.map((prof) => (
                                                        <div key={prof.idprofessor} className="professor-item d-flex align-items-center justify-content-between p-3 border-bottom">
                                                            <div className="d-flex align-items-center">
                                                                <img 
                                                                    src={getProfessorImagem(prof)}
                                                                    alt={prof.nomeprofessor} 
                                                                    className="rounded-circle me-3"
                                                                    style={{width: '50px', height: '50px', objectFit: 'cover'}}
                                                                />
                                                                <div>
                                                                    <h6 className="mb-0">{prof.nomeprofessor}</h6>
                                                                    <small className="text-muted">{prof.titulacaoprofessor}</small>
                                                                </div>
                                                            </div>
                                                            <button 
                                                                className="btn btn-white btn-sm d-flex align-items-center gap-1"
                                                                onClick={() => desvincularProfessor(prof.idprofessor)}
                                                                title="Remover vinculação"
                                                            >
                                                                <CiCircleMinus className="text-danger" size={30}/>
                                                            </button>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-center text-muted p-3">
                                                        Nenhum professor vinculado
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Lado Direito - Professores Disponíveis */}
                                        <div className="col-12 col-md-6">
                                            <h4 className="text-center mb-4">Professores Disponíveis</h4>
                                            <div className="professores-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                                {professoresDisponiveis && professoresDisponiveis.length > 0 ? (
                                                    professoresDisponiveis.map((prof) => (
                                                        <div key={prof.idprofessor} className="professor-item d-flex align-items-center justify-content-between p-3 border-bottom">
                                                            <div className="d-flex align-items-center">
                                                                <img 
                                                                    src={getProfessorImagem(prof)}
                                                                    alt={prof.nomeprofessor} 
                                                                    className="rounded-circle me-3"
                                                                    style={{width: '50px', height: '50px', objectFit: 'cover'}}
                                                                />
                                                                <div>
                                                                    <h6 className="mb-0">{prof.nomeprofessor}</h6>
                                                                    <small className="text-muted">{prof.titulacaoprofessor}</small>
                                                                </div>
                                                            </div>
                                                            <button 
                                                                className="btn btn-white btn-sm d-flex align-items-center gap-1"
                                                                onClick={() => vincularProfessor(prof.idprofessor)}
                                                                title="Vincular professor"
                                                            >
                                                                <CiCirclePlus className="text-success" size={30}/>
                                                            </button>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-center text-muted p-3">
                                                        Nenhum professor disponível
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={closeModalProfessor}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={closeModalProfessor}
                                    >
                                        Salvar
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

export default DisciplinaEdit;