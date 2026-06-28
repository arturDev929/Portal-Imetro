import { useState, useEffect, useCallback } from "react";
import api, { baseURL } from "../../service/api";
import { FaBook } from "react-icons/fa";
import { MdEdit, MdDeleteForever, MdSearch, MdRefresh, MdAdd } from "react-icons/md";
import { FaChalkboardTeacher } from "react-icons/fa";
import { showErrorToast, showSuccessToast, useConfirmToast } from "../../components/global/CustomToast";
import { CiCircleMinus, CiCirclePlus } from "react-icons/ci";
import Style from "./DepartamentosEdit.module.css";
import Table from "../../components/global/Table";

function DisciplinasEdit() {
    const [listaDisciplina, setListaDisciplina] = useState([]);
    const [listaFiltrada, setListaFiltrada] = useState([]);
    const [termoPesquisa, setTermoPesquisa] = useState('');
    const [isModalOpen, setModalOpen] = useState(false);
    const [isModalOpenProfessor, setIsModalOpenProfessor] = useState(false);
    const [disciplinaSelecionada, setDisciplinaSelecionada] = useState(null);
    const [professor, setProfessor] = useState(null);
    const [Editar, setEditar] = useState({ iddisciplina: '', disciplina: '' });
    const [professoresVinculados, setProfessoresVinculados] = useState([]);
    const [professoresDisponiveis, setProfessoresDisponiveis] = useState([]);
    const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null);
    const [loading, setLoading] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [loadingProfessores, setLoadingProfessores] = useState(false);
    const [vinculando, setVinculando] = useState(null);
    const [desvinculando, setDesvinculando] = useState(null);
    const [modalAdicionarAberto, setModalAdicionarAberto] = useState(false);
    const [dadosNovaDisciplina, setDadosNovaDisciplina] = useState({ disciplina: '' });
    const [user, setUser] = useState(null);
    const { showConfirmToast, isConfirming } = useConfirmToast();

    useEffect(() => {
        const usuarioSalvo = localStorage.getItem("usuarioLogado");
        if (usuarioSalvo) {
            try {
                setUser(JSON.parse(usuarioSalvo));
            } catch (error) {
                console.error("Erro ao parsear usuário:", error);
                setUser(null);
            }
        }
    }, []);

    const fetchDisciplinas = useCallback(async (mostrarNotificacao = false) => {
        try {
            setLoading(true);
            const response = await api.get(`/Disciplinas`);

            const dadosMapeados = response.data.map(item => ({
                iddisciplina: item.id_disciplina,
                disciplina: item.disciplina
            }));

            setListaDisciplina(dadosMapeados);
            setListaFiltrada(dadosMapeados);
            setUltimaAtualizacao(new Date().toLocaleTimeString('pt-BR'));

            if (mostrarNotificacao && dadosMapeados.length > 0) {
                showSuccessToast("Sucesso", "Dados atualizados com sucesso", { "Quantidade": `${dadosMapeados.length} disciplina(s)` });
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

    const handlePesquisa = useCallback((e) => {
        const termo = e.target.value;
        setTermoPesquisa(termo);
        if (termo.trim() === '') {
            setListaFiltrada(listaDisciplina);
        } else {
            setListaFiltrada(listaDisciplina.filter(item =>
                item.disciplina.toLowerCase().includes(termo.toLowerCase())
            ));
        }
    }, [listaDisciplina]);

    const limparPesquisa = useCallback(() => {
        setTermoPesquisa('');
        setListaFiltrada(listaDisciplina);
    }, [listaDisciplina]);

    useEffect(() => {
        if (termoPesquisa.trim() === '') {
            setListaFiltrada(listaDisciplina);
        } else {
            setListaFiltrada(listaDisciplina.filter(item =>
                item.disciplina.toLowerCase().includes(termoPesquisa.toLowerCase())
            ));
        }
    }, [listaDisciplina, termoPesquisa]);

    // ✅ Função centralizada para recarregar professores do servidor
    const recarregarProfessores = useCallback(async (iddisciplina) => {
        setLoadingProfessores(true);
        try {
            const [vinculadosRes, disponiveisRes] = await Promise.all([
                api.get(`/professorVinculado/${iddisciplina}`),
                api.get(`/professorDisponivel/${iddisciplina}`)
            ]);

            setProfessoresVinculados(vinculadosRes.data.map(item => ({
                idprofessor: item.id_professor,
                nomeprofessor: item.nome,
                titulacaoprofessor: item.titulacao,
                fotoprofessor: item.foto,
                fotoUrl: item.fotoUrl,
                disciplina: item.disciplina,
                iddisciplina: item.id_disciplina
            })));

            setProfessoresDisponiveis(disponiveisRes.data.map(item => ({
                idprofessor: item.id_professor,
                nomeprofessor: item.nome,
                titulacaoprofessor: item.titulacao,
                fotoprofessor: item.foto,
                fotoUrl: item.fotoUrl
            })));
        } catch (error) {
            console.error("Erro ao recarregar professores:", error);
            showErrorToast("Erro", "Não foi possível atualizar a lista de professores");
        } finally {
            setLoadingProfessores(false);
        }
    }, []);

    const openModal = (disciplina) => {
        setDisciplinaSelecionada(disciplina);
        setEditar({ disciplina: disciplina.disciplina, iddisciplina: disciplina.iddisciplina });
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditar({ disciplina: '', iddisciplina: '' });
        setDisciplinaSelecionada(null);
    };

    const EditarDisciplina = (valores) => {
        setEditar(prev => ({ ...prev, [valores.target.name]: valores.target.value }));
    };

    const AtualizarDisciplina = () => {
        setSalvando(true);
        api.put(`/disciplina/${Editar.iddisciplina}`, { disciplina: Editar.disciplina })
            .then((response) => {
                showSuccessToast("Sucesso", response.data.message || `${Editar.disciplina} foi atualizado com sucesso!`);
                const updateList = listaDisciplina.map(item =>
                    item.iddisciplina === Editar.iddisciplina ? { ...item, disciplina: Editar.disciplina } : item
                );
                setListaDisciplina(updateList);
                setListaFiltrada(updateList);
                closeModal();
            })
            .catch((error) => {
                console.error("Erro ao atualizar disciplina:", error);
                showErrorToast("Erro", error.response?.data?.error || "Erro ao atualizar a disciplina");
            })
            .finally(() => setSalvando(false));
    };

    const DeletarDisciplina = (disciplina) => {
        showConfirmToast(
            `Ao deletar esta disciplina irá desvincular a todos os cursos. Tem a certeza que pretendes deletar "${disciplina.disciplina}"?`,
            async () => {
                try {
                    const response = await api.delete(`/disciplina/${disciplina.iddisciplina}`);
                    const updatedList = listaDisciplina.filter(item => item.iddisciplina !== disciplina.iddisciplina);
                    setListaDisciplina(updatedList);
                    setListaFiltrada(updatedList);
                    showSuccessToast("Sucesso", response.data.message || `Disciplina ${disciplina.disciplina} foi deletada com sucesso.`);
                } catch (error) {
                    console.error("Erro ao excluir disciplina:", error);
                    showErrorToast("Erro!", error.response?.data?.error || `Erro ao excluir a disciplina ${disciplina.disciplina}`);
                }
            },
            null,
            "Confirmar a Exclusão"
        );
    };

    useEffect(() => {
        document.body.style.overflow = isModalOpenProfessor ? 'hidden' : 'auto';
        return () => { document.body.style.overflow = 'auto'; };
    }, [isModalOpenProfessor]);

    const openModalProfessor = async (disciplina) => {
        setProfessor(disciplina);
        setIsModalOpenProfessor(true);
        await recarregarProfessores(disciplina.iddisciplina);
    };

    // ✅ Vincular: chama API e recarrega do servidor
    const vincularProfessor = async (professorId) => {
        if (!user || !user.id) {
            showErrorToast("Erro", "Usuário não autenticado");
            return;
        }

        setVinculando(professorId);
        try {
            const response = await api.post(`/vincularProfessor`, {
                idprofessor: professorId,
                iddisciplina: professor.iddisciplina,
                idAdm: user.id
            });

            showSuccessToast("Sucesso", response.data.mensagem || "Professor vinculado com sucesso!");
            await recarregarProfessores(professor.iddisciplina);
        } catch (error) {
            console.error("Erro ao vincular professor:", error);
            showErrorToast("Erro", error.response?.data?.mensagem || "Não foi possível vincular o professor");
        } finally {
            setVinculando(null);
        }
    };

    // ✅ Desvincular: chama API e recarrega do servidor
    const desvincularProfessor = (prof) => {
        showConfirmToast(
            `Tens a certeza que pretendes desvincular o professor ${prof.nomeprofessor} da disciplina de ${prof.disciplina}?`,
            async () => {
                setDesvinculando(prof.idprofessor);
                try {
                    await api.delete(`/desvincularProfessor/${prof.iddisciplina}/${prof.idprofessor}`);
                    showSuccessToast("Sucesso!", `Professor ${prof.nomeprofessor} foi desvinculado da disciplina de ${prof.disciplina}`);
                    await recarregarProfessores(professor.iddisciplina);
                } catch (error) {
                    console.error("Erro ao desvincular professor:", error);
                    showErrorToast("Erro", "Não foi possível desvincular o professor");
                } finally {
                    setDesvinculando(null);
                }
            }
        );
    };

    const getProfessorImagem = (prof) => {
        if (prof.fotoUrl) return prof.fotoUrl;
        if (prof.fotoprofessor) return `${baseURL}/api/img/professores/${prof.fotoprofessor}`;
        return '/default-avatar.png';
    };

    const closeModalProfessor = () => {
        setIsModalOpenProfessor(false);
        setProfessor(null);
        setProfessoresVinculados([]);
        setProfessoresDisponiveis([]);
    };

    const abrirModalAdicionar = useCallback(() => {
        setDadosNovaDisciplina({ disciplina: '' });
        setModalAdicionarAberto(true);
    }, []);

    const fecharModalAdicionar = useCallback(() => {
        if (!salvando) {
            setModalAdicionarAberto(false);
            setDadosNovaDisciplina({ disciplina: '' });
        }
    }, [salvando]);

    const handleNovaDisciplinaInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setDadosNovaDisciplina(prev => ({ ...prev, [name]: value }));
    }, []);

    const adicionarDisciplina = async (e) => {
        e.preventDefault();

        if (!user || !user.id) {
            showErrorToast("Erro", "Usuário não autenticado");
            return;
        }

        const nome = dadosNovaDisciplina.disciplina?.trim();
        if (!nome) {
            showErrorToast("Validação", "Preencha o nome da disciplina");
            return;
        }

        setSalvando(true);
        try {
            const response = await api.post(`/registrardisciplina`, {
                disciplina: nome,
                idAdm: user.id
            });

            showSuccessToast("Sucesso", response.data.mensagem || `Disciplina "${nome}" foi adicionada com sucesso!`);
            fecharModalAdicionar();
            await fetchDisciplinas(false);
        } catch (error) {
            console.error("Erro ao adicionar disciplina:", error);
            showErrorToast("Erro", error.response?.data?.mensagem || error.response?.data?.error || "Não foi possível adicionar a disciplina");
        } finally {
            setSalvando(false);
        }
    };

    const semResultados = listaFiltrada.length === 0 && termoPesquisa !== '';
    const isEmpty = listaDisciplina.length === 0 && !loading;

    const headers = ['Nome da Disciplina', 'Professores', 'Editar', 'Apagar'];

    const renderRow = useCallback((disciplina) => (
        <tr key={disciplina.iddisciplina}>
            <td className="align-middle fw-semibold" style={{ color: 'var(--azul-escuro)' }}>
                <FaBook className="mb-1 me-2" style={{ color: 'var(--azul-escuro)' }} />
                {disciplina.disciplina}
            </td>
            <td>
                <button
                    className={`btn btn-sm ${Style.btnOutros}`}
                    onClick={() => openModalProfessor(disciplina)}
                    disabled={loading || isConfirming}
                    title="Professores"
                >
                    <FaChalkboardTeacher />
                </button>
            </td>
            <td>
                <button
                    className={`btn btn-sm ${Style.btnEditar}`}
                    onClick={() => openModal(disciplina)}
                    disabled={loading || salvando || isConfirming}
                    title="Editar"
                >
                    <MdEdit />
                </button>
            </td>
            <td>
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
    ), [loading, salvando, isConfirming]);

    const renderConteudo = () => {
        if (loading) {
            return (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary mx-auto mb-2" style={{ width: '3rem', height: '3rem' }} role="status">
                        <span className="visually-hidden">Carregando...</span>
                    </div>
                    <p className="text-muted mb-0">Carregando disciplinas...</p>
                </div>
            );
        }

        if (semResultados) {
            return (
                <div className="text-center py-5">
                    <MdSearch size={48} className="text-muted mb-3" />
                    <p className="text-muted mb-2">Nenhuma disciplina encontrada para "{termoPesquisa}"</p>
                    <button className="btn btn-outline-primary btn-sm" onClick={limparPesquisa}>
                        Limpar pesquisa
                    </button>
                </div>
            );
        }

        if (isEmpty) {
            return (
                <div className="text-center py-5">
                    <i className="bi bi-inbox display-4 text-muted mb-3 d-block"></i>
                    <p className="text-muted mb-3">Nenhuma disciplina encontrada</p>
                    <button className="btn btn-outline-primary" onClick={() => fetchDisciplinas(true)}>
                        <MdRefresh className="me-1" />
                        Carregar disciplinas
                    </button>
                </div>
            );
        }

        return (
            <div className="table-responsive">
                <Table
                    headers={headers}
                    data={listaFiltrada}
                    renderRow={renderRow}
                    className="table table-hover table-striped border"
                />
            </div>
        );
    };

    return (
        <div className="row mb-4">
            <div className="col-12">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2 className="h4 mb-0" style={{ color: 'var(--azul-escuro)' }}>
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

                <div className="row mb-4">
                    <div className="col-md-8 mx-auto">
                        <div className="card shadow-sm border-0">
                            <div className="card-body p-3">
                                <div className="d-flex align-items-center gap-2">
                                    <div className="position-relative flex-grow-1">
                                        <div className="input-group">
                                            <span className="input-group-text border-end-0" style={{ backgroundColor: 'var(--cinza-claro)' }}>
                                                <MdSearch className="text-muted" size={20} />
                                            </span>
                                            <input
                                                type="text"
                                                className="form-control border-start-0 ps-0"
                                                placeholder="Pesquisar disciplina por nome..."
                                                value={termoPesquisa}
                                                onChange={handlePesquisa}
                                                disabled={loading}
                                                style={{ borderLeft: 'none', boxShadow: 'none', backgroundColor: 'var(--cinza-claro)', padding: '10px' }}
                                            />
                                            {termoPesquisa && (
                                                <button
                                                    className="btn border-start-0"
                                                    type="button"
                                                    onClick={limparPesquisa}
                                                    disabled={loading}
                                                    style={{ borderLeft: 'none', backgroundColor: 'var(--danger)', color: 'var(--branco)' }}
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

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

                {renderConteudo()}

                {modalAdicionarAberto && (
                    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,.5)' }}>
                        <div className="modal-dialog modal-dialog-centered modal-lg">
                            <div className="modal-content shadow-lg border-0">
                                <div className="modal-header" style={{ backgroundColor: 'var(--azul-escuro)', color: 'var(--dourado)' }}>
                                    <h5 className="modal-title mb-0">
                                        <MdAdd className="me-2 mb-1" />
                                        Adicionar Nova Disciplina
                                    </h5>
                                    <button type="button" className="btn-close btn-close-white" onClick={fecharModalAdicionar} disabled={salvando || isConfirming} />
                                </div>
                                <form onSubmit={adicionarDisciplina}>
                                    <div className="modal-body">
                                        <div className="col-12 mb-3">
                                            <input
                                                type="text"
                                                className="form-control form-control-lg shadow-sm"
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
                                    <div className="modal-footer border-0">
                                        <button type="button" className={`btn ${Style.btnCancelar}`} onClick={fecharModalAdicionar} disabled={salvando || isConfirming}>
                                            Cancelar
                                        </button>
                                        <button type="submit" className={`btn ${Style.btnSubmit}`} disabled={salvando || isConfirming || !dadosNovaDisciplina.disciplina.trim()}>
                                            {salvando ? <><span className="spinner-border spinner-border-sm me-2"></span>Adicionando...</> : 'Adicionar Disciplina'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {isModalOpen && (
                    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,.5)' }}>
                        <div className="modal-dialog modal-dialog-centered modal-lg">
                            <div className="modal-content shadow-lg border-0">
                                <div className="modal-header" style={{ backgroundColor: 'var(--azul-escuro)', color: 'var(--dourado)' }}>
                                    <h5 className="modal-title mb-0">
                                        <FaBook className="me-2 mb-1" />
                                        {disciplinaSelecionada?.disciplina}
                                    </h5>
                                    <button type="button" className="btn-close btn-close-white" onClick={closeModal} disabled={salvando || isConfirming} />
                                </div>
                                <div className="modal-body">
                                    <form>
                                        <div className="mb-3">
                                            <input
                                                type="text"
                                                className="form-control form-control-lg"
                                                name="disciplina"
                                                value={Editar.disciplina}
                                                placeholder="Digite o nome da disciplina"
                                                onChange={EditarDisciplina}
                                                disabled={salvando || isConfirming}
                                            />
                                        </div>
                                    </form>
                                </div>
                                <div className="modal-footer border-0">
                                    <button type="button" className={`btn ${Style.btnCancelar}`} onClick={closeModal} disabled={salvando || isConfirming}>
                                        Cancelar
                                    </button>
                                    <button type="button" className={`btn ${Style.btnSubmit}`} onClick={AtualizarDisciplina} disabled={salvando || isConfirming || !Editar.disciplina.trim()}>
                                        {salvando ? <><span className="spinner-border spinner-border-sm me-2"></span>Salvando...</> : 'Salvar'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {isModalOpenProfessor && (
                    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,.5)' }}>
                        <div className="modal-dialog modal-dialog-centered modal-xl">
                            <div className="modal-content shadow-lg border-0">
                                <div className="modal-header" style={{ backgroundColor: 'var(--azul-escuro)', color: 'var(--dourado)' }}>
                                    <h5 className="modal-title">
                                        <FaChalkboardTeacher className="me-2 mb-1" />
                                        Professores Vinculados a disciplina de {professor?.disciplina}
                                    </h5>
                                    <button type="button" className="btn-close btn-close-white" onClick={closeModalProfessor} disabled={isConfirming || loadingProfessores} />
                                </div>

                                <div className="modal-body">
                                    {loadingProfessores ? (
                                        <div className="text-center py-5">
                                            <div className="spinner-border text-primary mb-3" style={{ width: '2.5rem', height: '2.5rem' }} role="status">
                                                <span className="visually-hidden">Carregando...</span>
                                            </div>
                                            <p className="text-muted mb-0">A actualizar professores...</p>
                                        </div>
                                    ) : (
                                        <div className="row">
                                            <div className="col-12 col-md-6 border-end">
                                                <h4 className="text-center mb-4" style={{ color: 'var(--azul-escuro)' }}>Professores Vinculados</h4>
                                                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                                    {professoresVinculados.length > 0 ? (
                                                        professoresVinculados.map((prof) => (
                                                            <div key={prof.idprofessor} className="d-flex align-items-center justify-content-between p-3 border-bottom">
                                                                <div className="d-flex align-items-center">
                                                                    <img
                                                                        src={getProfessorImagem(prof)}
                                                                        alt={prof.nomeprofessor}
                                                                        className="rounded-circle me-3"
                                                                        style={{ width: '60px', height: '60px', objectFit: 'cover', border: '2px solid var(--azul-escuro)' }}
                                                                        onError={(e) => { e.target.onerror = null; e.target.src = '/default-avatar.png'; }}
                                                                    />
                                                                    <div>
                                                                        <h6 className="mb-0" style={{ color: 'var(--azul-escuro)' }}>{prof.nomeprofessor}</h6>
                                                                        <small className="text-muted">{prof.titulacaoprofessor}</small>
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    className={`btn btn-sm ${Style.btnDeletar}`}
                                                                    onClick={() => desvincularProfessor(prof)}
                                                                    disabled={isConfirming || desvinculando === prof.idprofessor}
                                                                    title="Remover vinculação"
                                                                >
                                                                    {desvinculando === prof.idprofessor
                                                                        ? <span className="spinner-border spinner-border-sm"></span>
                                                                        : <CiCircleMinus size={24} />}
                                                                </button>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="text-center text-muted p-3">Nenhum professor vinculado</div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="col-12 col-md-6">
                                                <h4 className="text-center mb-4" style={{ color: 'var(--azul-escuro)' }}>Professores Disponíveis</h4>
                                                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                                    {professoresDisponiveis.length > 0 ? (
                                                        professoresDisponiveis.map((prof) => (
                                                            <div key={prof.idprofessor} className="d-flex align-items-center justify-content-between p-3 border-bottom">
                                                                <div className="d-flex align-items-center">
                                                                    <img
                                                                        src={getProfessorImagem(prof)}
                                                                        alt={prof.nomeprofessor}
                                                                        className="rounded-circle me-3"
                                                                        style={{ width: '60px', height: '60px', objectFit: 'cover', border: '2px solid var(--azul-escuro)' }}
                                                                        onError={(e) => { e.target.onerror = null; e.target.src = '/default-avatar.png'; }}
                                                                    />
                                                                    <div>
                                                                        <h6 className="mb-0" style={{ color: 'var(--azul-escuro)' }}>{prof.nomeprofessor}</h6>
                                                                        <small className="text-muted">{prof.titulacaoprofessor}</small>
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    className={`btn btn-sm ${Style.btnAdd}`}
                                                                    onClick={() => vincularProfessor(prof.idprofessor)}
                                                                    disabled={isConfirming || vinculando === prof.idprofessor}
                                                                    title="Vincular professor"
                                                                >
                                                                    {vinculando === prof.idprofessor
                                                                        ? <span className="spinner-border spinner-border-sm"></span>
                                                                        : <CiCirclePlus size={24} />}
                                                                </button>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="text-center text-muted p-3">Nenhum professor disponível</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="modal-footer border-0">
                                    <button type="button" className={`btn ${Style.btnCancelar}`} onClick={closeModalProfessor} disabled={isConfirming || loadingProfessores}>
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

export default DisciplinasEdit;