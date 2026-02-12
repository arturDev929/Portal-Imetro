import { useState, useEffect } from 'react';
import Axios from 'axios';
import { FaInfoCircle, FaSearch } from "react-icons/fa";
import { MdDeleteForever, MdEdit } from "react-icons/md";
import { FaBook } from "react-icons/fa";
import { CiCircleMinus } from "react-icons/ci";
import { showSuccessToast, useConfirmToast, showErrorToast } from './CustomToast';
import { FaCameraRotate } from "react-icons/fa6";

function ProfessorEdit() {
    const [professores, setProfessores] = useState([]);
    const [professoresFiltrados, setProfessoresFiltrados] = useState([]);
    const [termoPesquisa, setTermoPesquisa] = useState('');
    const [professorSelecionado, setProfessorSelecionado] = useState(null);
    const [professorSelecionado2, setProfessorSelecionado2] = useState(null);
    const [professorSelecionadoEdit, setProfessorSelecionadoEdit] = useState({
        fotoUrl: '',
        codigoprofessor: '',
        nomeprofessor: '',
        generoprofessor: '',
        nacionalidadeprofessor: '',
        estadocivilprofessor: '',
        nomepaiprofessor:'',
        nomemaeprofessor:'',
        nbiprofessor:'',
        datanascimentoprofessor:'',
        residenciaprofessor:'',
        telefoneprofessor:'',
        whatsappprofessor: '',
        emailprofessor:  '',
        anoexperienciaprofessor: '',
        titulacaoprofessor:  '',
        dataadmissaoprofessor:   '',
        condicoesprofessor:  '',
        ibanprofessor:  '',
        tipocontratoprofessor:  '',
        tiposanguineoprofessor: '',
        contactoemergenciaprofessor: '',
        curriculoUrl: ''
    });
    const [modalOpen, setModalOpen] = useState(false);
    const [modalOpenInfo, setModalOpenInfo] = useState(false);
    const [modalOpenEdit, setModalOpenEdit] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { showConfirmToast, isConfirmToast } = useConfirmToast();

    useEffect(() => {
        const fetchProfessores = async () => {
            try {
                setLoading(true);
                const response = await Axios.get('http://localhost:8080/get/Professores');
                setProfessores(response.data);
                setProfessoresFiltrados(response.data);
                setError(null);
            } catch (err) {
                console.error('Erro ao buscar professores:', err);
                setError('Erro ao carregar professores');
            } finally {
                setLoading(false);
            }
        };

        fetchProfessores();

        const interval = setInterval(fetchProfessores, 100000);

        return () => {
            if (interval) clearInterval(interval);
        };
    }, []);

    // Função de pesquisa
    const handlePesquisa = (e) => {
        const termo = e.target.value;
        setTermoPesquisa(termo);

        if (termo.trim() === '') {
            setProfessoresFiltrados(professores);
        } else {
            const filtrados = professores.filter(prof =>
                prof.nomeprofessor.toLowerCase().includes(termo.toLowerCase()) ||
                (prof.codigoprofessor && prof.codigoprofessor.toLowerCase().includes(termo.toLowerCase()))
            );
            setProfessoresFiltrados(filtrados);
        }
    };

    // Limpar pesquisa
    const limparPesquisa = () => {
        setTermoPesquisa('');
        setProfessoresFiltrados(professores);
    };

    useEffect(() => {
        if (modalOpen || modalOpenInfo || modalOpenEdit) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [modalOpen, modalOpenInfo, modalOpenEdit]);

    const openModal = (professor) => {
        setProfessorSelecionado(professor);
        setModalOpen(true);
        Axios.get(`http://localhost:8080/get/professorVinculadoDisciplinas/${professor.idprofessor}`)
            .then((response) => {
                setProfessorSelecionado((prev) => ({
                    ...prev,
                    disciplinas: response.data,
                }));
            })
            .catch((err) => {
                console.error('Erro ao buscar disciplinas do professor:', err);
                setError('Erro ao carregar disciplinas do professor');
            });
    };

    const closeModal = () => {
        setModalOpen(false);
        setTimeout(() => setProfessorSelecionado(null), 300);
    };

    const openModalInfo = async (professor) => {
        setProfessorSelecionado2(professor);
        setModalOpenInfo(true);

        try {
            const response = await Axios.get(`http://localhost:8080/get/InformacoesProfessor/${professor.idprofessor}`);

            setProfessorSelecionado2({
                ...professor,
                ...response.data
            });

        } catch (err) {
            console.error('Erro ao buscar informações do professor:', err);
            showErrorToast('Erro ao carregar informações do professor');
        }
    };

    const closeModalInfo = () => {
        setModalOpenInfo(false);
        setTimeout(() => setProfessorSelecionado2(null), 300);
    };

    const openModalEdit = async (professor) => {
        try {
            const response = await Axios.get(`http://localhost:8080/get/InformacoesProfessor/${professor.idprofessor}`);
            const infoCompletas = response.data;
            
            setProfessorSelecionadoEdit({
                ...professor,
                ...infoCompletas,
                fotoUrl: professor.fotoUrl,
                codigoprofessor: professor.codigoprofessor || infoCompletas.codigoprofessor || '',
                nomeprofessor: professor.nomeprofessor || infoCompletas.nomeprofessor || '',
                generoprofessor: professor.generoprofessor || infoCompletas.generoprofessor || '',
                nacionalidadeprofessor: professor.nacionalidadeprofessor || infoCompletas.nacionalidadeprofessor || '',
                estadocivilprofessor: professor.estadocivilprofessor || infoCompletas.estadocivilprofessor || '',
                nomepaiprofessor: professor.nomepaiprofessor || infoCompletas.nomepaiprofessor || '',
                nomemaeprofessor: professor.nomemaeprofessor || infoCompletas.nomemaeprofessor || '',
                nbiprofessor: professor.nbiprofessor || infoCompletas.nbiprofessor || '',
                datanascimentoprofessor: professor.datanascimentoprofessor || infoCompletas.datanascimentoprofessor || '',
                residenciaprofessor: professor.residenciaprofessor || infoCompletas.residenciaprofessor || '',
                telefoneprofessor: professor.telefoneprofessor || infoCompletas.telefoneprofessor || '',
                whatsappprofessor: professor.whatsappprofessor || infoCompletas.whatsappprofessor || '',
                emailprofessor: professor.emailprofessor || infoCompletas.emailprofessor || '',
                anoexperienciaprofessor: professor.anoexperienciaprofessor || infoCompletas.anoexperienciaprofessor || '',
                titulacaoprofessor: professor.titulacaoprofessor || infoCompletas.titulacaoprofessor || '',
                dataadmissaoprofessor: professor.dataadmissaoprofessor || infoCompletas.dataadmissaoprofessor ||  '',
                condicoesprofessor: professor.condicoesprofessor || infoCompletas.condicoesprofessor || '',
                ibanprofessor: professor.ibanprofessor || infoCompletas.ibanprofessor || '',
                tipocontratoprofessor: professor.tipocontratoprofessor || infoCompletas.tipocontratoprofessor || '',
                tiposanguineoprofessor: professor.tiposanguineoprofessor || infoCompletas.tiposanguineoprofessor || '',
                contactoemergenciaprofessor: professor.contactoemergenciaprofessor || infoCompletas.contactoemergenciaprofessor || '',
                curriculoUrl: professor.curriculoUrl || infoCompletas.curriculoUrl || null
            });
            setModalOpenEdit(true);
        } catch (err) {
            console.error('Erro ao buscar informações do professor para edição:', err);
            showErrorToast('Erro ao carregar dados do professor para edição');
        }
    };

    const closeModalEdit = () => {
        setModalOpenEdit(false);
        setTimeout(() => setProfessorSelecionadoEdit({
            foto: '',
            codigoprofessor: '',
            nomeprofessor: '',
            generoprofessor: '',
            nacionalidadeprofessor: '',
            estadocivilprofessor: '',
            nomepaiprofessor:'',
            nomemaeprofessor:'',
            nbiprofessor:'',
            datanascimentoprofessor:'',
            residenciaprofessor:'',
            telefoneprofessor:'',
            whatsappprofessor: '',
            emailprofessor:  '',
            anoexperienciaprofessor: '',
            titulacaoprofessor:  '',
            dataadmissaoprofessor:   '',
            condicoesprofessor:  '',
            ibanprofessor:  '',
            tipocontratoprofessor:  '',
            tiposanguineoprofessor: '',
            contactoemergenciaprofessor: '',
            curriculoUrl: ''
        }), 300);
    };

    const EditarProfessor = (value) => {
        setProfessorSelecionadoEdit((prevValue)=>({
            ...prevValue,
            [value.target.name]: value.target.value
        }))
    }

    const AtualizarProfessor = () => {
        console.log('Dados a serem enviados para atualização:', professorSelecionadoEdit.fotoprofessor, professorSelecionadoEdit.bipdfprofessor);
        Axios.put(`http://localhost:8080/put/atulizarprofessor/${professorSelecionadoEdit.idprofessor}`,{
                fotoprofessor: professorSelecionadoEdit.fotoprofessor,
                bipdfprofessor: professorSelecionadoEdit.bipdfprofessor,
                codigoprofessor: professorSelecionadoEdit.codigoprofessor ,
                nomeprofessor: professorSelecionadoEdit.nomeprofessor,
                generoprofessor: professorSelecionadoEdit.generoprofessor ,
                nacionalidadeprofessor: professorSelecionadoEdit.nacionalidadeprofessor,
                estadocivilprofessor: professorSelecionadoEdit.estadocivilprofessor,
                nomepaiprofessor: professorSelecionadoEdit.nomepaiprofessor,
                nomemaeprofessor: professorSelecionadoEdit.nomemaeprofessor,
                nbiprofessor: professorSelecionadoEdit.nbiprofessor,
                datanascimentoprofessor: professorSelecionadoEdit.datanascimentoprofessor,
                residenciaprofessor: professorSelecionadoEdit.residenciaprofessor,
                telefoneprofessor: professorSelecionadoEdit.telefoneprofessor,
                whatsappprofessor: professorSelecionadoEdit.whatsappprofessor,
                emailprofessor: professorSelecionadoEdit.emailprofessor,
                anoexperienciaprofessor: professorSelecionadoEdit.anoexperienciaprofessor,
                titulacaoprofessor: professorSelecionadoEdit.titulacaoprofessor,
                dataadmissaoprofessor: professorSelecionadoEdit.dataadmissaoprofessor,
                condicoesprofessor: professorSelecionadoEdit.condicoesprofessor,
                ibanprofessor: professorSelecionadoEdit.ibanprofessor,
                tipocontratoprofessor: professorSelecionadoEdit.tipocontratoprofessor,
                tiposanguineoprofessor: professorSelecionadoEdit.tiposanguineoprofessor,
                contactoemergenciaprofessor: professorSelecionadoEdit.contactoemergenciaprofessor,
                foto: professorSelecionadoEdit.foto,
                curriculo: professorSelecionadoEdit.curriculo

        }).then((response)=>{
            showSuccessToast("Sucesso", "Professor atualizado com sucesso!");
            closeModalEdit();
        })
    }

    const handleDelete = (disciplina) => {
        showConfirmToast(
            `Tem certeza que deseja Desvincular ${disciplina.disciplina} do professor ${professorSelecionado.nomeprofessor}?`,
            async () => {
                try {
                    await Axios.delete(`http://localhost:8080/delete/desvincularProfessorDisciplina/${disciplina.iddisciplina}?idprofessor=${professorSelecionado.idprofessor}`);

                    const updatedProfessor = professorSelecionado.disciplinas.filter(item => item.iddisciplina !== disciplina.iddisciplina);

                    setProfessorSelecionado(prev => ({ ...prev, disciplinas: updatedProfessor }));

                    showSuccessToast("Sucesso", `Disciplina ${disciplina.disciplina} desvinculada com sucesso!`);
                } catch (err) {
                    console.error('Erro ao desvincular disciplina do professor:', err);
                    showErrorToast('Erro ao desvincular disciplina do professor');
                }
            },
            () => { },
            "Desvincular"
        );
    };

    return (
        <div>
            <div className="row mb-4">
                <div className="col-md-8 mx-auto">
                    <div className="card shadow-sm border-0">
                        <div className="card-body p-3">
                            <div className="d-flex align-items-center gap-2">
                                <div className="position-relative flex-grow-1">
                                    <div className="input-group">
                                        <span className="input-group-text bg-white border-end-0">
                                            <FaSearch className="text-muted" />
                                        </span>
                                        <input
                                            type="text"
                                            className="form-control border-start-0 ps-0"
                                            placeholder="Pesquisar professor por nome ou código..."
                                            value={termoPesquisa}
                                            onChange={handlePesquisa}
                                            style={{
                                                borderLeft: 'none',
                                                boxShadow: 'none'
                                            }}
                                        />
                                        {termoPesquisa && (
                                            <button
                                                className="btn btn-outline-secondary border-start-0"
                                                type="button"
                                                onClick={limparPesquisa}
                                                style={{ borderLeft: 'none' }}
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* INDICADOR DE RESULTADOS */}
                            {!loading && termoPesquisa && (
                                <div className="mt-2 text-muted small">
                                    <span className="badge bg-light text-dark p-2">
                                        {professoresFiltrados.length} {professoresFiltrados.length === 1 ? 'professor encontrado' : 'professores encontrados'}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="table-responsive">
                {loading && <div className="text-center">Carregando...</div>}
                {error && <div className="alert alert-danger">{error}</div>}

                <table className="table table-hover table-striped border">
                    <thead className="table-primary">
                        <tr>
                            <th className="col-1">Foto</th>
                            <th className="col-7">Nome</th>
                            <th className="col-1 text-center">Disciplinas</th>
                            <th className="col-1 text-center">Info</th>
                            <th className="col-1 text-center">Editar</th>
                            <th className="col-1 text-center">Apagar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {!loading && professoresFiltrados && professoresFiltrados.length > 0 ? (
                            professoresFiltrados.map((prof) => (
                                <tr key={`prof-${prof.idprofessor}`}>
                                    <td>
                                        <img
                                            src={prof.fotoUrl || '/default-avatar.png'}
                                            alt={`Foto de ${prof.nomeprofessor}`}
                                            className="img-fluid rounded-circle"
                                            style={{ width: '35px', height: '35px', objectFit: 'cover' }}
                                            onError={(e) => {
                                                e.target.src = '/default-avatar.png';
                                            }}
                                        />
                                    </td>
                                    <td className="align-middle">
                                        <div className="d-flex flex-column">
                                            <span>{prof.nomeprofessor}</span>
                                            {prof.codigoprofessor && (
                                                <small className="text-muted">
                                                    Código: {prof.codigoprofessor}
                                                </small>
                                            )}
                                        </div>
                                    </td>
                                    <td className="text-center align-middle">
                                        <button
                                            onClick={() => openModal(prof)}
                                            className="btn btn-sm btn-outline-secondary"
                                            title="Ver disciplinas"
                                        >
                                            <FaBook />
                                        </button>
                                    </td>
                                    <td className="text-center align-middle">
                                        <button
                                            onClick={() => openModalInfo(prof)}
                                            className="btn btn-sm btn-outline-info"
                                            title="Informações"
                                        >
                                            <FaInfoCircle />
                                        </button>
                                    </td>
                                    <td className="text-center align-middle">
                                        <button
                                            className="btn btn-sm btn-outline-primary"
                                            title="Editar"
                                            onClick={() => openModalEdit(prof)}
                                        >
                                            <MdEdit />
                                        </button>
                                    </td>
                                    <td className="text-center align-middle">
                                        <button className="btn btn-sm btn-outline-danger" title="Excluir">
                                            <MdDeleteForever />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            !loading && (
                                <tr>
                                    <td colSpan="6" className="text-center py-4">
                                        {termoPesquisa ? (
                                            <div className="text-muted">
                                                <FaSearch className="mb-2" size={24} />
                                                <p className="mb-0">Nenhum professor encontrado para "{termoPesquisa}"</p>
                                                <button
                                                    className="btn btn-link mt-2"
                                                    onClick={limparPesquisa}
                                                >
                                                    Limpar pesquisa
                                                </button>
                                            </div>
                                        ) : (
                                            <span>Nenhum professor cadastrado.</span>
                                        )}
                                    </td>
                                </tr>
                            )
                        )}
                    </tbody>
                </table>
                {modalOpen && professorSelecionado && (
                    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,.5)' }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content shadow-lg border-0">
                                <div className="modal-header bg-gradient bg-primary text-white">
                                    <h5 className="modal-title mb-0">
                                        <FaBook className="me-2" />
                                        Disciplinas do Professor {professorSelecionado.nomeprofessor}
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn-close btn-close-white"
                                        onClick={closeModal}
                                    />
                                </div>
                                <div className="modal-body">
                                    {professorSelecionado.disciplinas && professorSelecionado.disciplinas.length > 0 ? (
                                        <div className="row">
                                            {professorSelecionado.disciplinas.map((disciplina) => (
                                                <div key={disciplina.iddisciplina} className="col-md-6 mb-1">
                                                    <div className="p-2 border rounded bg-light justify-content-between d-flex align-items-center">
                                                        <small className="mb-0">{disciplina.disciplina}</small>
                                                        <button
                                                            className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1"
                                                            disabled={isConfirmToast}
                                                            onClick={() => handleDelete(disciplina)}
                                                        >
                                                            <CiCircleMinus size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-4">
                                            <p className="text-muted mb-0">
                                                Nenhuma disciplina atribuída a este professor.
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <div className="modal-footer border-0">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={closeModal}
                                    >
                                        Fechar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {modalOpenInfo && professorSelecionado2 && (
                    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,.5)' }}>
                        <div className="modal-dialog modal-xl modal-dialog-scrollable">
                            <div className="modal-content shadow-lg border-0">
                                <div className="modal-header bg-gradient bg-primary text-white">
                                    <h5 className="modal-title mb-0 d-flex align-items-center">
                                        <FaInfoCircle className="me-2" />
                                        Informações Detalhadas do Professor {professorSelecionado2.nomeprofessor}
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn-close btn-close-white"
                                        onClick={closeModalInfo}
                                    />
                                </div>
                                <div className="modal-body">
                                    <div className="container-fluid">
                                        <div className="row mb-4">
                                            <div className="col-md-2 d-flex justify-content-center">
                                                <div className="text-center">
                                                    <img
                                                        src={professorSelecionado2.fotoUrl || '/default-avatar.png'}
                                                        className="rounded-circle bg-light d-flex align-items-center justify-content-center border"
                                                        style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                                                        alt={professorSelecionado2.nomeprofessor}
                                                    />
                                                    <h6 className="mt-2 mb-0">
                                                        Código: {professorSelecionado2.codigoprofessor || 'N/I'}
                                                    </h6>
                                                </div>
                                            </div>
                                            <div className="col-md-10">
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <div className="mb-2">
                                                            <strong className="text-primary">Nome Completo:</strong>
                                                            <p className="mb-0">{professorSelecionado2.nomeprofessor || 'Não informado'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="mb-2">
                                                            <strong className="text-primary">Gênero:</strong>
                                                            <p className="mb-0">{professorSelecionado2.generoprofessor || 'Não informado'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="mb-2">
                                                            <strong className="text-primary">Nacionalidade:</strong>
                                                            <p className="mb-0">{professorSelecionado2.nacionalidadeprofessor || 'Não informado'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <hr className="my-4" />
                                        <h6 className="text-primary fw-bold mb-3">
                                            <FaInfoCircle className="me-2" />
                                            Dados Pessoais
                                        </h6>
                                        <div className="row mb-4">
                                            <div className="col-md-3">
                                                <div className="mb-2">
                                                    <strong>Estado Civil:</strong>
                                                    <p className="mb-0">{professorSelecionado2.estadocivilprofessor || 'Não informado'}</p>
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="mb-2">
                                                    <strong>Nome do Pai:</strong>
                                                    <p className="mb-0">{professorSelecionado2.nomepaiprofessor || 'Não informado'}</p>
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="mb-2">
                                                    <strong>Nome da Mãe:</strong>
                                                    <p className="mb-0">{professorSelecionado2.nomemaeprofessor || 'Não informado'}</p>
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="mb-2">
                                                    <strong>Nº do BI:</strong>
                                                    <p className="mb-0">{professorSelecionado2.nbiprofessor || 'Não informado'}</p>
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="mb-2">
                                                    <strong>Data de Nascimento:</strong>
                                                    <p className="mb-0">{professorSelecionado2.datanascimentoFormatada || 'Não informada'}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row mb-4">
                                            <div className="col-md-12">
                                                <div className="p-3 bg-light rounded">
                                                    <strong className="d-block mb-2">Documento de Identificação (BI / CV):</strong>
                                                    {professorSelecionado2.curriculoUrl ? (
                                                        <div className="text-center">
                                                            <a
                                                                href={professorSelecionado2.curriculoUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="btn btn-primary"
                                                            >
                                                                <i className="bi bi-file-pdf me-2"></i>
                                                                Visualizar Documento
                                                            </a>
                                                            <p className="text-muted mt-2 small">
                                                                Clique no botão para abrir o PDF em nova aba
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted">Nenhum documento anexado</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <hr className="my-4" />
                                        <h6 className="text-primary fw-bold mb-3">
                                            Contato e Residência
                                        </h6>
                                        <div className="row mb-4">
                                            <div className="col-md-4">
                                                <div className="mb-2">
                                                    <strong>Residência:</strong>
                                                    <p className="mb-0">{professorSelecionado2.residenciaprofessor || 'Não informado'}</p>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="mb-2">
                                                    <strong>Telefone:</strong>
                                                    <p className="mb-0">{professorSelecionado2.telefoneprofessor || 'Não informado'}</p>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="mb-2">
                                                    <strong>WhatsApp:</strong>
                                                    <p className="mb-0">{professorSelecionado2.whatsappprofessor || 'Não informado'}</p>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="mb-2">
                                                    <strong>Email:</strong>
                                                    <p className="mb-0">{professorSelecionado2.emailprofessor || 'Não informado'}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <hr className="my-4" />
                                        <h6 className="text-primary fw-bold mb-3">
                                            Dados Profissionais
                                        </h6>
                                        <div className="row mb-4">
                                            <div className="col-md-3">
                                                <div className="mb-2">
                                                    <strong>Anos de Experiência:</strong>
                                                    <p className="mb-0">{professorSelecionado2.anoexperienciaprofessor || 'Não informado'}</p>
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="mb-2">
                                                    <strong>Titularidade:</strong>
                                                    <p className="mb-0">{professorSelecionado2.titulacaoprofessor || 'Não informado'}</p>
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="mb-2">
                                                    <strong>Data de Admissão:</strong>
                                                    <p className="mb-0">{professorSelecionado2.dataadmissaoFormatada || 'Não informada'}</p>
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="mb-2">
                                                    <strong>Tipo Contrato:</strong>
                                                    <p className="mb-0">{professorSelecionado2.tipocontratoprofessor || 'Não informado'}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <hr className="my-4" />
                                        <h6 className="text-primary fw-bold mb-3">
                                            Dados Bancários e Saúde
                                        </h6>
                                        <div className="row mb-4">
                                            <div className="col-md-3">
                                                <div className="mb-2">
                                                    <strong>IBAN:</strong>
                                                    <p className="mb-0">{professorSelecionado2.ibanprofessor || 'Não informado'}</p>
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="mb-2">
                                                    <strong>Tipo Sanguíneo:</strong>
                                                    <p className="mb-0">{professorSelecionado2.tiposanguineoprofessor || 'Não informado'}</p>
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="mb-2">
                                                    <strong>Condições:</strong>
                                                    <p className="mb-0">{professorSelecionado2.condicoesprofessor || 'Não informado'}</p>
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="mb-2">
                                                    <strong>Contacto de Emergência:</strong>
                                                    <p className="mb-0">{professorSelecionado2.contactoemergenciaprofessor || 'Não informado'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer border-0">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={closeModalInfo}
                                    >
                                        Fechar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {modalOpenEdit && professorSelecionadoEdit && (
                    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,.5)' }}>
                        <div className="modal-dialog modal-xl modal-dialog-scrollable">
                            <div className="modal-content shadow-lg border-0">
                                <div className="modal-header bg-gradient bg-primary text-white">
                                    <h5 className="modal-title mb-0 d-flex align-items-center">
                                        <FaInfoCircle className="me-2" />
                                        Editar Detalhadas do Professor {professorSelecionadoEdit.nomeprofessor}
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn-close btn-close-white"
                                        onClick={closeModalEdit}
                                    />
                                </div>
                                <div className="modal-body">
                                    <div className="container-fluid">
                                        <div className="row mb-4">
                                            <div className="col-md-2 d-flex justify-content-center">
                                                <div className="text-center">
                                                    <div className="position-relative">
                                                        <img
                                                            src={professorSelecionadoEdit.fotoUrl}
                                                            className="rounded-circle bg-light d-flex align-items-center justify-content-center border"
                                                            style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                                                            alt={professorSelecionadoEdit.nomeprofessor}
                                                        />
                                                        <label
                                                            htmlFor="foto"
                                                            className="position-absolute bottom-0 end-0 bg-white rounded-circle p-2 shadow-sm"
                                                            style={{ cursor: 'pointer', transform: 'translate(-160%, -25%)' }}
                                                        >
                                                            <FaCameraRotate />
                                                        </label>
                                                        <input
                                                            type="file"
                                                            className="d-none"
                                                            id="foto"
                                                            name="foto"
                                                            accept="image/*"
                                                            // value={professorSelecionadoEdit?.fotoUrl}
                                                            onChange={EditarProfessor}
                                                        />
                                                    </div>
                                                    <div className="mt-2">
                                                        <label htmlFor="codigoprofessor" className="form-label small">Código:</label>
                                                        <input
                                                            type="text"
                                                            className="form-control form-control-sm text-center"
                                                            id="codigoprofessor"
                                                            name="codigoprofessor"
                                                            placeholder="Código"
                                                            value={professorSelecionadoEdit?.codigoprofessor || ''}
                                                            onChange={EditarProfessor}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-10">
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <div className="mb-2">
                                                            <label htmlFor="nomeprofessor" className="form-label fw-bold text-primary">Nome Completo:</label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                id="nomeprofessor"
                                                                name="nomeprofessor"
                                                                value={professorSelecionadoEdit?.nomeprofessor}
                                                                onChange={EditarProfessor}
                                                                placeholder="Nome completo"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="mb-2">
                                                            <label htmlFor="generoprofessor" className="form-label fw-bold text-primary">Gênero:</label>
                                                            <select
                                                                className="form-select"
                                                                id="generoprofessor"
                                                                name="generoprofessor"
                                                                value={professorSelecionadoEdit?.generoprofessor}
                                                                onChange={EditarProfessor}
                                                            >
                                                                <option value="">Selecione</option>
                                                                <option value="Masculino">Masculino</option>
                                                                <option value="Feminino">Feminino</option>
                                                                <option value="Outro">Outro</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="mb-2">
                                                            <label htmlFor="nacionalidadeprofessor" className="form-label fw-bold text-primary">Nacionalidade:</label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                id="nacionalidadeprofessor"
                                                                name="nacionalidadeprofessor"
                                                                value={professorSelecionadoEdit?.nacionalidadeprofessor}
                                                                onChange={EditarProfessor}
                                                                placeholder="Nacionalidade"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <hr className="my-4" />

                                        {/* DADOS PESSOAIS */}
                                        <h6 className="text-primary fw-bold mb-3">
                                            <FaInfoCircle className="me-2" />
                                            Dados Pessoais
                                        </h6>

                                        <div className="row mb-4">
                                            <div className="col-md-3">
                                                <div className="mb-2">
                                                    <label htmlFor="estadocivilprofessor" className="form-label fw-bold">Estado Civil:</label>
                                                    <select
                                                        className="form-select"
                                                        id="estadocivilprofessor"
                                                        name="estadocivilprofessor"
                                                        value={professorSelecionadoEdit?.estadocivilprofessor}
                                                        onChange={EditarProfessor}
                                                    >
                                                        <option value="">Selecione</option>
                                                        <option value="Solteiro(a)">Solteiro(a)</option>
                                                        <option value="Casado(a)">Casado(a)</option>
                                                        <option value="Divorciado(a)">Divorciado(a)</option>
                                                        <option value="Viúvo(a)">Viúvo(a)</option>
                                                        <option value="União de Facto">União de Facto</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="mb-2">
                                                    <label htmlFor="nomepaiprofessor" className="form-label fw-bold">Nome do Pai:</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="nomepaiprofessor"
                                                        name="nomepaiprofessor"
                                                        value={professorSelecionadoEdit?.nomepaiprofessor}
                                                        onChange={EditarProfessor}
                                                        placeholder="Nome do pai"
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="mb-2">
                                                    <label htmlFor="nomemaeprofessor" className="form-label fw-bold">Nome da Mãe:</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="nomemaeprofessor"
                                                        name="nomemaeprofessor"
                                                        value={professorSelecionadoEdit?.nomemaeprofessor}
                                                        onChange={EditarProfessor}
                                                        placeholder="Nome da mãe"
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="mb-2">
                                                    <label htmlFor="nbiprofessor" className="form-label fw-bold">Nº do BI:</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="nbiprofessor"
                                                        name="nbiprofessor"
                                                        value={professorSelecionadoEdit?.nbiprofessor}
                                                        onChange={EditarProfessor}
                                                        placeholder="Número do BI"
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="mb-2">
                                                    <label htmlFor="datanascimento" className="form-label fw-bold">Data de Nascimento:</label>
                                                    <input
                                                        type="date"
                                                        className="form-control"
                                                        id="datanascimento"
                                                        name="datanascimento"
                                                        value={professorSelecionadoEdit?.datanascimentoprofessor}
                                                        onChange={EditarProfessor}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* DOCUMENTO DE IDENTIFICAÇÃO (PDF) */}
                                        <div className="row mb-4">
                                            <div className="col-md-12">
                                                <div className="p-3 bg-light rounded">
                                                    <label className="fw-bold mb-2">Documento de Identificação (BI / CV):</label>
                                                    {professorSelecionadoEdit.curriculoUrl ? (
                                                        <div className="d-flex align-items-center gap-3">
                                                            <a
                                                                href={professorSelecionadoEdit.curriculoUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="btn btn-primary"
                                                            >
                                                                <i className="bi bi-file-pdf me-2"></i>
                                                                Visualizar Documento
                                                            </a>
                                                            <div className="flex-grow-1">
                                                                <input
                                                                    type="file"
                                                                    className="form-control"
                                                                    id="curriculo"
                                                                    name="curriculo"
                                                                    accept=".pdf,.doc,.docx"
                                                                    // value={professorSelecionadoEdit?.curriculoUrl}
                                                                    onChange={EditarProfessor}
                                                                />
                                                                <small className="text-muted">Faça upload de um novo documento para substituir</small>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <input
                                                                type="file"
                                                                className="form-control"
                                                                id="curriculo"
                                                                name="curriculo"
                                                                accept=".pdf,.doc,.docx"
                                                            />
                                                            <small className="text-muted">Nenhum documento anexado. Faça upload do BI ou CV.</small>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <hr className="my-4" />

                                        {/* CONTATO E RESIDÊNCIA */}
                                        <h6 className="text-primary fw-bold mb-3">
                                            Contato e Residência
                                        </h6>

                                        <div className="row mb-4">
                                            <div className="col-md-4">
                                                <div className="mb-2">
                                                    <label htmlFor="residenciaprofessor" className="form-label fw-bold">Residência:</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="residenciaprofessor"
                                                        name="residenciaprofessor"
                                                        value={professorSelecionadoEdit?.residenciaprofessor || ''}
                                                        onChange={EditarProfessor}
                                                        placeholder="Endereço completo"
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="mb-2">
                                                    <label htmlFor="telefoneprofessor" className="form-label fw-bold">Telefone:</label>
                                                    <input
                                                        type="tel"
                                                        className="form-control"
                                                        id="telefoneprofessor"
                                                        name="telefoneprofessor"
                                                        value={professorSelecionadoEdit?.telefoneprofessor || ''}
                                                        onChange={EditarProfessor}
                                                        placeholder="Número de telefone"
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="mb-2">
                                                    <label htmlFor="whatsappprofessor" className="form-label fw-bold">WhatsApp:</label>
                                                    <input
                                                        type="tel"
                                                        className="form-control"
                                                        id="whatsappprofessor"
                                                        name="whatsappprofessor"
                                                        value={professorSelecionadoEdit?.whatsappprofessor || ''}
                                                        onChange={EditarProfessor}
                                                        placeholder="Número do WhatsApp"
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="mb-2">
                                                    <label htmlFor="emailprofessor" className="form-label fw-bold">Email:</label>
                                                    <input
                                                        type="email"
                                                        className="form-control"
                                                        id="emailprofessor"
                                                        name="emailprofessor"
                                                        value={professorSelecionadoEdit?.emailprofessor || ''}
                                                        onChange={EditarProfessor}
                                                        placeholder="E-mail"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <hr className="my-4" />

                                        {/* DADOS PROFISSIONAIS */}
                                        <h6 className="text-primary fw-bold mb-3">
                                            Dados Profissionais
                                        </h6>

                                        <div className="row mb-4">
                                            <div className="col-md-3">
                                                <div className="mb-2">
                                                    <label htmlFor="anoexperienciaprofessor" className="form-label fw-bold">Anos de Experiência:</label>
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        id="anoexperienciaprofessor"
                                                        name="anoexperienciaprofessor"
                                                        value={professorSelecionadoEdit?.anoexperienciaprofessor || ''}
                                                        onChange={EditarProfessor}
                                                        placeholder="0"
                                                        min="0"
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="mb-2">
                                                    <label htmlFor="titulacaoprofessor" className="form-label fw-bold">Titularidade:</label>
                                                    <select
                                                        className="form-select"
                                                        id="titulacaoprofessor"
                                                        name="titulacaoprofessor"
                                                        value={professorSelecionadoEdit?.titulacaoprofessor || ''}
                                                        onChange={EditarProfessor}
                                                    >
                                                        <option value="">Selecione</option>
                                                        <option value="Licenciatura">Licenciatura</option>
                                                        <option value="Mestrado">Mestrado</option>
                                                        <option value="Doutoramento">Doutoramento</option>
                                                        <option value="Pós-Doutoramento">Pós-Doutoramento</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="mb-2">
                                                    <label htmlFor="dataadmissao" className="form-label fw-bold">Data de Admissão</label>
                                                    <input
                                                        type="date"
                                                        className="form-control"
                                                        id="dataadmissao"
                                                        name="dataadmissao"
                                                        value={professorSelecionadoEdit?.dataadmissaoprofessor || ''}
                                                        onChange={EditarProfessor}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="mb-2">
                                                    <label htmlFor="tipocontratoprofessor" className="form-label fw-bold">Tipo Contrato:</label>
                                                    <select
                                                        className="form-select"
                                                        id="tipocontratoprofessor"
                                                        name="tipocontratoprofessor"
                                                        value={professorSelecionadoEdit?.tipocontratoprofessor || ''}
                                                        onChange={EditarProfessor}
                                                    >
                                                        <option value="">Selecione</option>
                                                        <option value="Efetivo">Efetivo</option>
                                                        <option value="Contratado">Contratado</option>
                                                        <option value="Substituto">Substituto</option>
                                                        <option value="Estagiário">Estagiário</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <hr className="my-4" />

                                        {/* DADOS BANCÁRIOS E SAÚDE */}
                                        <h6 className="text-primary fw-bold mb-3">
                                            Dados Bancários e Saúde
                                        </h6>

                                        <div className="row mb-4">
                                            <div className="col-md-3">
                                                <div className="mb-2">
                                                    <label htmlFor="ibanprofessor" className="form-label fw-bold">IBAN:</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="ibanprofessor"
                                                        name="ibanprofessor"
                                                        value={professorSelecionadoEdit?.ibanprofessor || ''}
                                                        onChange={EditarProfessor}
                                                        placeholder="IBAN"
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="mb-2">
                                                    <label htmlFor="tiposanguineoprofessor" className="form-label fw-bold">Tipo Sanguíneo:</label>
                                                    <select
                                                        className="form-select"
                                                        id="tiposanguineoprofessor"
                                                        name="tiposanguineoprofessor"
                                                        value={professorSelecionadoEdit?.tiposanguineoprofessor || ''}
                                                        onChange={EditarProfessor}
                                                    >
                                                        <option value="">Selecione</option>
                                                        <option value="A+">A+</option>
                                                        <option value="A-">A-</option>
                                                        <option value="B+">B+</option>
                                                        <option value="B-">B-</option>
                                                        <option value="AB+">AB+</option>
                                                        <option value="AB-">AB-</option>
                                                        <option value="O+">O+</option>
                                                        <option value="O-">O-</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="mb-2">
                                                    <label htmlFor="condicoesprofessor" className="form-label fw-bold">Condições:</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="condicoesprofessor"
                                                        name="condicoesprofessor"
                                                        value={professorSelecionadoEdit?.condicoesprofessor || ''}
                                                        onChange={EditarProfessor}
                                                        placeholder="Condições do professor"
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="mb-2">
                                                    <label htmlFor="contactoemergenciaprofessor" className="form-label fw-bold">Contacto de Emergência:</label>
                                                    <input
                                                        type="tel"
                                                        className="form-control"
                                                        id="contactoemergenciaprofessor"
                                                        name="contactoemergenciaprofessor"
                                                        value={professorSelecionadoEdit?.contactoemergenciaprofessor || ''}
                                                        onChange={EditarProfessor}
                                                        placeholder="Contato de emergência"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer border-0">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={closeModalEdit}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={AtualizarProfessor}
                                        disabled={!professorSelecionadoEdit.nomeprofessor}
                                    >
                                        Salvar Alterações
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

export default ProfessorEdit;