import { useState, useEffect, useCallback } from "react";
import Axios from "axios";
import { FaBook } from "react-icons/fa";
import { MdEdit, MdDeleteForever, MdSearch, MdRefresh, MdAdd } from "react-icons/md";
import { FaChalkboardTeacher } from "react-icons/fa";
import { showErrorToast, showSuccessToast, useConfirmToast} from "./CustomToast";
import { CiCircleMinus, CiCirclePlus} from "react-icons/ci";
import Style from "./DepartamentosEdit.module.css"

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";
const API_TIMEOUT = 5000;

function DisciplinaEdit() {
    const [listaDisciplina, setListaDisciplina] = useState([]);
    const [listaFiltrada, setListaFiltrada] = useState([]);
    const [termoPesquisa, setTermoPesquisa] = useState('');
    const [isModalOpen, setModalOpen] = useState(false);
    const [isModalOpenProfessor, setIsModalOpenProfessor] = useState(false);
    const [disciplinaSelecionada, setDisciplinaSelecionada] = useState(null);
    const [professor, setProfessor] = useState(null);
    const [Editar, setEditar] = useState({
        iddisciplina: '',
        disciplina: ''
    });
    const [professoresVinculados, setProfessoresVinculados] = useState([]);
    const [professoresDisponiveis, setProfessoresDisponiveis] = useState([]);
    const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null);
    const [loading, setLoading] = useState(false);
    const [salvando, setSalvando] = useState(false);
    
    // Estado para o modal de adicionar
    const [modalAdicionarAberto, setModalAdicionarAberto] = useState(false);
    const [dadosNovaDisciplina, setDadosNovaDisciplina] = useState({
        disciplina: ''
    });
    const [user, setUser] = useState()
    useEffect(() => {
        const usuarioSalvo = localStorage.getItem("usuarioLogado");
        if (usuarioSalvo) {
            setUser(JSON.parse(usuarioSalvo));
        }
    }, []);
    const { showConfirmToast, isConfirming } = useConfirmToast();

    const fetchDisciplinas = useCallback(async (mostrarNotificacao = false) => {
        try {
            setLoading(true);
            const response = await Axios.get(`${API_BASE_URL}/get/Disciplinas`);
            setListaDisciplina(response.data);
            setListaFiltrada(response.data);
            setUltimaAtualizacao(new Date().toLocaleTimeString('pt-BR'));
            
            if (mostrarNotificacao && response.data && response.data.length > 0) {
                showSuccessToast(
                    "Sucesso",
                    "Dados atualizados com sucesso",
                    { "Quantidade": `${response.data.length} disciplina(s)` }
                );
            }
        } catch (error) {
            console.error("Erro ao buscar disciplinas:", error);
            showErrorToast("Erro", "Não foi possível carregar as disciplinas");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDisciplinas(false);
    }, [fetchDisciplinas]);

    // Função de pesquisa
    const handlePesquisa = useCallback((e) => {
        const termo = e.target.value;
        setTermoPesquisa(termo);
        
        if (termo.trim() === '') {
            setListaFiltrada(listaDisciplina);
        } else {
            const filtrados = listaDisciplina.filter(item => 
                item.disciplina.toLowerCase().includes(termo.toLowerCase())
            );
            setListaFiltrada(filtrados);
        }
    }, [listaDisciplina]);

    // Limpar pesquisa
    const limparPesquisa = useCallback(() => {
        setTermoPesquisa('');
        setListaFiltrada(listaDisciplina);
    }, [listaDisciplina]);

    // Atualiza lista filtrada quando a lista original muda
    useEffect(() => {
        if (termoPesquisa.trim() === '') {
            setListaFiltrada(listaDisciplina);
        } else {
            const filtrados = listaDisciplina.filter(item => 
                item.disciplina.toLowerCase().includes(termoPesquisa.toLowerCase())
            );
            setListaFiltrada(filtrados);
        }
    }, [listaDisciplina, termoPesquisa]);

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
        setSalvando(true);
        Axios.put(`${API_BASE_URL}/put/disciplina/${Editar.iddisciplina}`, {
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
        }).finally(() => {
            setSalvando(false);
        });
    }

    const DeletarDisciplina = (disciplina) => {
        showConfirmToast(
            `Ao deletar esta disciplina irá desvincular a todos os cursos. Tem a certeza que pretendes deletar "${disciplina.disciplina}"?`,
            async () =>{
                try{
                    await Axios.delete(`${API_BASE_URL}/delete/disciplina/${disciplina.iddisciplina}`);
                    const updatedList = listaDisciplina.filter(
                        item => item.iddisciplina !== disciplina.iddisciplina
                    );
                    setListaDisciplina(updatedList);
                    showSuccessToast(
                        "Sucesso",
                        `Disciplina ${disciplina.disciplina} foi deletada com sucesso.`
                    )
                }catch (error){
                    showErrorToast(
                        "Erro!",
                        `Erro ao excluir a disciplina ${disciplina.disciplina}` 
                    )
                }
            },
            null,
            "Confirmar a Exclusão"
        )
    }

    useEffect(()=>{
        if(isModalOpenProfessor){
            document.body.style.overflow='hidden';
        }else{
            document.body.style.overflow='auto';
        }
        return ()=>{
            document.body.style.overflow='auto';
        }
    },[isModalOpenProfessor]);

    const openModalProfessor = (disciplina) => {
        setProfessor(disciplina);
        setIsModalOpenProfessor(true);
        
        Axios.get(`${API_BASE_URL}/get/professorVinculado/${disciplina.iddisciplina}`)
            .then((response)=>{
                setProfessoresVinculados(response.data)
            })
            .catch((error)=>{
                console.error("Erro ao buscar professores vinculados:", error);
                showErrorToast("Erro", "Não foi possível carregar os professores vinculados");
            })
        
        Axios.get(`${API_BASE_URL}/get/professorDisponivel/${disciplina.iddisciplina}`)
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
        Axios.post(`${API_BASE_URL}/post/vincularProfessor`, {
            iddisciplina: professor.iddisciplina,
            idprofessor: professorId
        })
        .then((response) => {
            showSuccessToast("Sucesso", "Professor vinculado com sucesso!");
            
            const professorParaVincular = professoresDisponiveis.find(p => p.idprofessor === professorId);
            
            setProfessoresDisponiveis(prev => prev.filter(p => p.idprofessor !== professorId));
            
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
            return `${API_BASE_URL}/api/img/professores/${professor.fotoprofessor}`;
        }
        return '/default-avatar.png';
    }

    // Função para desvincular professor
    const desvincularProfessor = (idprofessor) => {
        Axios.delete(`${API_BASE_URL}/delete/desvincularProfessor/${idprofessor}`)
        .then((response) => {
            showSuccessToast("Sucesso", "Professor desvinculado com sucesso!");
            const professorParaDesvincular = professoresVinculados.find(p => p.idprofessor === idprofessor);

            setProfessoresVinculados(prev => prev.filter(p => p.idprofessor !== idprofessor));

            const { iddisciplina, disciplina, iddisc_prof, ...professorLimpo } = professorParaDesvincular;
            setProfessoresDisponiveis(prev => [...prev, professorLimpo]);
        })
        .catch((error) => {
            showErrorToast("Erro", "Não foi possível desvincular o professor");
        });
    };

    const closeModalProfessor = () =>{
        setIsModalOpenProfessor(false);
        setProfessor(null);
    }

    // Funções para abrir/fechar modal de adicionar
    const abrirModalAdicionar = useCallback(() => {
        setDadosNovaDisciplina({
            disciplina: ''
        });
        setModalAdicionarAberto(true);
    }, []);

    const fecharModalAdicionar = useCallback(() => {
        if (!salvando) {
            setModalAdicionarAberto(false);
            setDadosNovaDisciplina({
                disciplina: ''
            });
        }
    }, [salvando]);

    const handleNovaDisciplinaInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setDadosNovaDisciplina(prev => ({ ...prev, [name]: value }));
    }, []);

    // States derivados
    const semResultados = listaFiltrada.length === 0 && termoPesquisa !== '';
    const isEmpty = listaDisciplina.length === 0 && !loading;

    const adicionarDisciplina = async (e) => {
    e.preventDefault();
    
    const nome = dadosNovaDisciplina.disciplina?.trim();
    
    if (!nome) {
        showErrorToast("Validação", "Preencha o nome da disciplina");
        return;
    }

    setSalvando(true);
    
    try {
        const response = await Axios.post('http://localhost:8080/post/registrardisciplina', {
            disciplina: nome,
            idAdm: user.id
        });
        
        showSuccessToast(
            "Sucesso",
            `Disciplina "${nome}" foi adicionada com sucesso!`
        );
        
        // Adicionar à lista local
        const novaDisciplina = {
            iddisciplina: response.data.iddisciplina || Date.now(),
            disciplina: nome
        };
        
        setListaDisciplina(prev => [...prev, novaDisciplina]);
        setListaFiltrada(prev => [...prev, novaDisciplina]);
        
        fecharModalAdicionar();
        
        // Recarregar do servidor para garantir
        await fetchDisciplinas(false);
        
    } catch (error) {
        console.error("Erro ao adicionar disciplina:", error);
        
        if (error.response?.data?.error) {
            showErrorToast("Erro", error.response.data.error);
        } else if (error.response?.data?.message) {
            showErrorToast("Erro", error.response.data.message);
        } else {
            showErrorToast("Erro", "Não foi possível adicionar a disciplina");
        }
    } finally {
        setSalvando(false);
    }
};

    return (
        <div className="row mb-4">
            <div className="col-12">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2 className="h4 mb-0" style={{color:'var(--azul-escuro)'}}>
                        <FaBook className="mb-2 me-2" />
                        Disciplinas/Cadeiras
                    </h2>
                    <div className="d-flex gap-2">
                        {ultimaAtualizacao && (
                            <small className="text-muted align-self-end small">
                                Atualizado: {ultimaAtualizacao}
                            </small>
                        )}
                        <button 
                            className={`btn btn-sm ${Style.AtulizarDepartamento}`}
                            onClick={() => fetchDisciplinas(true)}
                            disabled={loading || isConfirming}
                            title="Atualizar lista"
                        >
                            <MdRefresh />
                        </button>
                        <button
                            className={`btn btn-sm ${Style.btnSubmit}`}
                            onClick={abrirModalAdicionar}
                            disabled={loading || salvando || isConfirming}
                            title="Adicionar nova disciplina"
                        >
                            <MdAdd className="me-1" />
                            Nova Disciplina
                        </button>
                    </div>
                </div>

                {/* BARRA DE PESQUISA */}
                <div className="row mb-4">
                    <div className="col-md-8 mx-auto">
                        <div className="card shadow-sm border-0">
                            <div className="card-body p-3">
                                <div className="d-flex align-items-center gap-2">
                                    <div className="position-relative flex-grow-1">
                                        <div className="input-group">
                                            <span className="input-group-text border-end-0" style={{backgroundColor:'var(--cinza-claro)'}}>
                                                <MdSearch className="text-muted" size={20} />
                                            </span>
                                            <input
                                                type="text"
                                                className="form-control border-start-0 ps-0"
                                                placeholder="Pesquisar disciplina por nome..."
                                                value={termoPesquisa}
                                                onChange={handlePesquisa}
                                                disabled={loading}
                                                style={{ 
                                                    borderLeft: 'none',
                                                    boxShadow: 'none',
                                                    backgroundColor: 'var(--cinza-claro)',
                                                    padding:'10px'
                                                }}
                                            />
                                            {termoPesquisa && (
                                                <button 
                                                    className="btn border-start-0" 
                                                    type="button"
                                                    onClick={limparPesquisa}
                                                    disabled={loading}
                                                    style={{ 
                                                        borderLeft: 'none',
                                                        backgroundColor: 'var(--danger)',
                                                        color:'var(--branco)'
                                                    }}
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* INDICADOR DE RESULTADOS */}
                                {!loading && termoPesquisa && listaFiltrada.length > 0 && (
                                    <div className="mt-2 text-muted small">
                                        <span className="badge bg-light text-dark p-2">
                                            {listaFiltrada.length} {listaFiltrada.length === 1 ? 'disciplina encontrada' : 'disciplinas encontradas'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="d-flex col-12 table-responsive">
                    <table className="table table-hover table-striped border">
                        <thead style={{backgroundColor:'var(--azul-escuro)',color:'var(--branco)'}}>
                            <tr>
                                <th className="col-9">Nome</th>
                                <th className="col-1 text-center">PF's</th>
                                <th className="col-1 text-center">Editar</th>
                                <th className="col-1 text-center">Apagar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-5">
                                        <div className="spinner-border text-primary mx-auto mb-2" style={{width: '3rem', height: '3rem'}} role="status">
                                            <span className="visually-hidden">Carregando...</span>
                                        </div>
                                        <p className="text-muted mb-0">Carregando disciplinas...</p>
                                    </td>
                                </tr>
                            ) : semResultados ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-5">
                                        <MdSearch size={48} className="text-muted mb-3" />
                                        <p className="text-muted mb-2">Nenhuma disciplina encontrada para "{termoPesquisa}"</p>
                                        <button 
                                            className="btn btn-outline-primary btn-sm"
                                            onClick={limparPesquisa}
                                        >
                                            Limpar pesquisa
                                        </button>
                                    </td>
                                </tr>
                            ) : isEmpty ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-5">
                                        <i className="bi bi-inbox display-4 text-muted mb-3 d-block"></i>
                                        <p className="text-muted mb-3">Nenhuma disciplina encontrada</p>
                                        <button className="btn btn-outline-primary" onClick={() => fetchDisciplinas(true)}>
                                            <MdRefresh className="me-1" />
                                            Carregar disciplinas
                                        </button>
                                    </td>
                                </tr>
                            ) : (
                                listaFiltrada.map((disciplina) => (
                                    <tr key={disciplina.iddisciplina}>
                                        <td className="align-middle fw-semibold" style={{color:'var(--azul-escuro)'}}>
                                            <FaBook className="mb-1 me-2" style={{color:'var(--azul-escuro)'}} />
                                            {disciplina.disciplina}
                                        </td>
                                        <td className="text-center">
                                            <button
                                                className={`btn btn-sm ${Style.btnOutros}`}
                                                onClick={() => openModalProfessor(disciplina)}
                                                disabled={loading || isConfirming}
                                                title="Professores"
                                            >
                                                <FaChalkboardTeacher />
                                            </button>
                                        </td>
                                        <td className="text-center">
                                            <button
                                                className={`btn btn-sm ${Style.btnEditar}`}
                                                onClick={() => openModal(disciplina)}
                                                disabled={loading || salvando || isConfirming}
                                                title="Editar"
                                            >
                                                <MdEdit />
                                            </button>
                                        </td>
                                        <td className="text-center">
                                            <button 
                                                className={`btn btn-sm ${Style.btnDeletar}`}
                                                disabled={loading || isConfirming}
                                                onClick={() => DeletarDisciplina(disciplina)}
                                                title="Excluir"
                                            >
                                                <MdDeleteForever />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Modal de Adicionar Nova Disciplina */}
                {modalAdicionarAberto && (
                    <div className="modal fade show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,.5)'}}>
                        <div className="modal-dialog modal-dialog-centered modal-lg">
                            <div className="modal-content shadow-lg border-0">
                                <div className="modal-header" style={{backgroundColor: 'var(--azul-escuro)',color:'var(--dourado)'}}>
                                    <h5 className="modal-title mb-0">
                                        <MdAdd className="me-2 mb-1"/>
                                        Adicionar Nova Disciplina
                                    </h5>
                                    <button 
                                        type="button" 
                                        className="btn-close btn-close-white"
                                        onClick={fecharModalAdicionar}
                                        disabled={salvando || isConfirming}
                                    />
                                </div>
                                <form onSubmit={adicionarDisciplina}>
                                    <div className="modal-body">
                                        <div className="row">
                                            <div className="col-12 mb-3">
                                                <input 
                                                    type="text" 
                                                    className="form-control form-control-lg shadow-sm"
                                                    id="novaDisciplina"
                                                    name="disciplina"
                                                    value={dadosNovaDisciplina.disciplina}
                                                    onChange={handleNovaDisciplinaInputChange}
                                                    placeholder="Digite o nome da disciplina"
                                                    autoFocus
                                                    disabled={salvando || isConfirming}
                                                    maxLength={100}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="modal-footer border-0">
                                        <button 
                                            type="button" 
                                            className={`btn ${Style.btnCancelar}`}
                                            onClick={fecharModalAdicionar}
                                            disabled={salvando || isConfirming}
                                        >
                                            Cancelar
                                        </button>
                                        <button 
                                            type="submit" 
                                            className={`btn ${Style.btnSubmit}`}
                                            disabled={salvando || isConfirming || !dadosNovaDisciplina.disciplina.trim()}
                                        >
                                            {salvando ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                                    Adicionando...
                                                </>
                                            ) : (
                                                'Adicionar Disciplina'
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de Edição */}
                {isModalOpen && (
                    <div className="modal fade show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,.5)'}}>
                        <div className="modal-dialog modal-dialog-centered modal-lg">
                            <div className="modal-content shadow-lg border-0">
                                <div className="modal-header" style={{backgroundColor: 'var(--azul-escuro)',color:'var(--dourado)'}}>
                                    <h5 className="modal-title mb-0">
                                        <FaBook className="me-2 mb-1" />
                                        {disciplinaSelecionada?.disciplina}
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn-close btn-close-white"
                                        onClick={closeModal}
                                        disabled={salvando || isConfirming}
                                    />
                                </div>

                                <div className="modal-body">
                                    <form>
                                        <div className="mb-3">
                                            <input
                                                type="text"
                                                className="form-control form-control-lg"
                                                id="nomeDisciplina"
                                                name="disciplina"
                                                value={Editar.disciplina}
                                                placeholder="Digite o nome da disciplina"
                                                onChange={EditarDisciplina}
                                                disabled={salvando || isConfirming}
                                            />
                                        </div>
                                        <input
                                            type="hidden"
                                            name="iddisciplina"
                                            value={Editar.iddisciplina}
                                            onChange={EditarDisciplina}
                                        />
                                    </form>
                                </div>

                                <div className="modal-footer border-0">
                                    <button
                                        type="button"
                                        className={`btn ${Style.btnCancelar}`}
                                        onClick={closeModal}
                                        disabled={salvando || isConfirming}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="button"
                                        className={`btn ${Style.btnSubmit}`}
                                        onClick={AtualizarDisciplina}
                                        disabled={salvando || isConfirming || !Editar.disciplina.trim()}
                                    >
                                        {salvando ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Salvando...
                                            </>
                                        ) : (
                                            'Salvar'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal professor */}
                {isModalOpenProfessor && (
                    <div className="modal fade show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,.5)'}}>
                        <div className="modal-dialog modal-dialog-centered modal-xl">
                            <div className="modal-content shadow-lg border-0">
                                <div className="modal-header" style={{backgroundColor: 'var(--azul-escuro)',color:'var(--dourado)'}}>
                                    <h5 className="modal-title">
                                        <FaChalkboardTeacher className="me-2 mb-1" />
                                        Professores Vinculados a disciplina de {professor?.disciplina}
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn-close btn-close-white"
                                        onClick={closeModalProfessor}
                                        disabled={isConfirming}
                                    />
                                </div>

                                <div className="modal-body">
                                    <div className="row">
                                        {/* Lado Esquerdo - Professores Vinculados */}
                                        <div className="col-12 col-md-6 border-end">
                                            <h4 className="text-center mb-4" style={{color:'var(--azul-escuro)'}}>Professores Vinculados</h4>
                                            <div className="professores-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                                {professoresVinculados && professoresVinculados.length > 0 ? (
                                                    professoresVinculados.map((prof) => (
                                                        <div key={prof.idprofessor} className="professor-item d-flex align-items-center justify-content-between p-3 border-bottom">
                                                            <div className="d-flex align-items-center">
                                                                <img 
                                                                    src={getProfessorImagem(prof)}
                                                                    alt={prof.nomeprofessor} 
                                                                    className="rounded-circle me-3"
                                                                    style={{width: '60px', height: '60px', objectFit: 'cover', border: '2px solid var(--azul-escuro)'}}
                                                                />
                                                                <div>
                                                                    <h6 className="mb-0" style={{color:'var(--azul-escuro)'}}>{prof.nomeprofessor}</h6>
                                                                    <small className="text-muted">{prof.titulacaoprofessor}</small>
                                                                </div>
                                                            </div>
                                                            <button 
                                                                className={`btn btn-sm ${Style.btnDeletar}`}
                                                                onClick={() => desvincularProfessor(prof.idprofessor)}
                                                                disabled={isConfirming}
                                                                title="Remover vinculação"
                                                            >
                                                                <CiCircleMinus size={24}/>
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
                                            <h4 className="text-center mb-4" style={{color:'var(--azul-escuro)'}}>Professores Disponíveis</h4>
                                            <div className="professores-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                                {professoresDisponiveis && professoresDisponiveis.length > 0 ? (
                                                    professoresDisponiveis.map((prof) => (
                                                        <div key={prof.idprofessor} className="professor-item d-flex align-items-center justify-content-between p-3 border-bottom">
                                                            <div className="d-flex align-items-center">
                                                                <img 
                                                                    src={getProfessorImagem(prof)}
                                                                    alt={prof.nomeprofessor} 
                                                                    className="rounded-circle me-3"
                                                                    style={{width: '60px', height: '60px', objectFit: 'cover', border: '2px solid var(--azul-escuro)'}}
                                                                />
                                                                <div>
                                                                    <h6 className="mb-0" style={{color:'var(--azul-escuro)'}}>{prof.nomeprofessor}</h6>
                                                                    <small className="text-muted">{prof.titulacaoprofessor}</small>
                                                                </div>
                                                            </div>
                                                            <button 
                                                                className={`btn btn-sm ${Style.btnAdd}`}
                                                                onClick={() => vincularProfessor(prof.idprofessor)}
                                                                disabled={isConfirming}
                                                                title="Vincular professor"
                                                            >
                                                                <CiCirclePlus size={24}/>
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

                                <div className="modal-footer border-0">
                                    <button
                                        type="button"
                                        className={`btn ${Style.btnCancelar}`}
                                        onClick={closeModalProfessor}
                                        disabled={isConfirming}
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

export default DisciplinaEdit;