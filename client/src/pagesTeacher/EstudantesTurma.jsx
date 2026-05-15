import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MdArrowBack, MdSearch, MdEmail, MdPhone, MdPerson, MdFileDownload } from "react-icons/md";
import { FaUserGraduate, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import TeacherLayout from "../layouts/TeacherLayout";
import api from "../service/api";
import { showErrorToast, showSuccessToast } from "../components/global/CustomToast";
import * as XLSX from 'xlsx';

function EstudantesTurma() {
    const { idperiodo, iddisciplina } = useParams();
    const navigate = useNavigate();
    const [estudantes, setEstudantes] = useState([]);
    const [estudantesFiltrados, setEstudantesFiltrados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [termoPesquisa, setTermoPesquisa] = useState("");
    const [notasEditando, setNotasEditando] = useState({});

    useEffect(() => {
        carregarEstudantes();
    }, [idperiodo, iddisciplina]);

    const carregarEstudantes = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/estudantesTurma/${idperiodo}/${iddisciplina}`);
            if (response.data.success) {
                setEstudantes(response.data.data);
                setEstudantesFiltrados(response.data.data);
            }
        } catch (error) {
            console.error("Erro ao carregar estudantes:", error);
            showErrorToast("Erro", "Não foi possível carregar os estudantes");
        } finally {
            setLoading(false);
        }
    };

    const handlePesquisa = (e) => {
        const termo = e.target.value.toLowerCase();
        setTermoPesquisa(termo);
        
        const filtrados = estudantes.filter(estudante =>
            estudante.nome_estudante.toLowerCase().includes(termo) ||
            estudante.numero_estudante.includes(termo) ||
            estudante.bi_estudante.toLowerCase().includes(termo)
        );
        setEstudantesFiltrados(filtrados);
    };

    const getStatusBadge = (situacao) => {
        switch (situacao) {
            case 'Matriculado':
                return <span className="badge bg-success"><FaCheckCircle className="me-1" /> Matriculado</span>;
            case 'Trancado':
                return <span className="badge bg-warning"><FaTimesCircle className="me-1" /> Trancado</span>;
            case 'Desistente':
                return <span className="badge bg-danger">Desistente</span>;
            case 'Concluido':
                return <span className="badge bg-info">Concluído</span>;
            default:
                return <span className="badge bg-secondary">{situacao}</span>;
        }
    };

    const getNotaColor = (nota) => {
        if (!nota) return "text-secondary";
        if (nota >= 14) return "text-success fw-bold";
        if (nota >= 10) return "text-warning fw-bold";
        return "text-danger fw-bold";
    };

    const getPresencaColor = (percentual) => {
        if (!percentual) return "text-secondary";
        if (percentual >= 75) return "text-success";
        if (percentual >= 50) return "text-warning";
        return "text-danger";
    };

    const exportarExcel = () => {
        const dadosExportar = estudantes.map(est => ({
            "Nº Estudante": est.numero_estudante,
            "Nome": est.nome_estudante,
            "BI": est.bi_estudante,
            "Contacto": est.contacto_estudante,
            "Email": est.email_estudante,
            "Sexo": est.sexo_estudante,
            "Situação": est.situacao,
            "Nota Final": est.nota_final || "N/A",
            "Percentual Presença": est.percentual_presenca ? `${est.percentual_presenca.toFixed(1)}%` : "N/A"
        }));
        
        const ws = XLSX.utils.json_to_sheet(dadosExportar);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Estudantes");
        XLSX.writeFile(wb, `estudantes_turma_${idperiodo}.xlsx`);
        showSuccessToast("Sucesso", "Arquivo exportado com sucesso");
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
                                    <FaUserGraduate className="me-2" />
                                    Lista de Estudantes
                                </h2>
                                <p className="text-muted mt-2 mb-0">
                                    Total de {estudantes.length} estudante(s) matriculado(s)
                                </p>
                            </div>
                            <button 
                                className="btn btn-success mt-2 mt-sm-0"
                                onClick={exportarExcel}
                            >
                                <MdFileDownload className="me-2" />
                                Exportar Excel
                            </button>
                        </div>
                    </div>
                </div>

                {/* Barra de Pesquisa */}
                <div className="row mb-4">
                    <div className="col-md-6 mx-auto">
                        <div className="input-group">
                            <span className="input-group-text bg-white">
                                <MdSearch size={20} />
                            </span>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Pesquisar por nome, número ou BI..."
                                value={termoPesquisa}
                                onChange={handlePesquisa}
                            />
                        </div>
                    </div>
                </div>

                {/* Lista de Estudantes */}
                <div className="row g-4">
                    {estudantesFiltrados.length === 0 ? (
                        <div className="col-12 text-center py-5">
                            <p className="text-muted">Nenhum estudante encontrado</p>
                        </div>
                    ) : (
                        estudantesFiltrados.map((estudante) => (
                            <div className="col-md-6 col-lg-4" key={estudante.id_estudante}>
                                <div className="card border-0 shadow-sm h-100">
                                    <div className="card-body">
                                        <div className="d-flex align-items-center mb-3">
                                            <div className="flex-shrink-0">
                                                <img
                                                    src={estudante.foto_estudante || '/default-avatar.png'}
                                                    className="rounded-circle"
                                                    style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                                    alt={estudante.nome_estudante}
                                                    onError={(e) => { e.target.src = '/default-avatar.png'; }}
                                                />
                                            </div>
                                            <div className="flex-grow-1 ms-3">
                                                <h6 className="mb-1">{estudante.nome_estudante}</h6>
                                                <p className="text-muted small mb-0">
                                                    Nº: {estudante.numero_estudante}
                                                </p>
                                                {getStatusBadge(estudante.situacao)}
                                            </div>
                                        </div>

                                        <hr />

                                        <div className="mb-2">
                                            <MdPerson className="me-2 text-primary" />
                                            <small>{estudante.sexo_estudante}</small>
                                        </div>
                                        <div className="mb-2">
                                            <MdEmail className="me-2 text-primary" />
                                            <small>{estudante.email_estudante}</small>
                                        </div>
                                        <div className="mb-3">
                                            <MdPhone className="me-2 text-primary" />
                                            <small>{estudante.contacto_estudante}</small>
                                        </div>

                                        <hr />

                                        <div className="row text-center">
                                            <div className="col-6">
                                                <div className="border-end">
                                                    <small className="text-muted">Nota Final</small>
                                                    <h5 className={`mb-0 ${getNotaColor(estudante.nota_final)}`}>
                                                        {estudante.nota_final ? estudante.nota_final.toFixed(1) : "N/A"}
                                                    </h5>
                                                </div>
                                            </div>
                                            <div className="col-6">
                                                <small className="text-muted">Presença</small>
                                                <h5 className={`mb-0 ${getPresencaColor(estudante.percentual_presenca)}`}>
                                                    {estudante.percentual_presenca ? `${estudante.percentual_presenca.toFixed(1)}%` : "N/A"}
                                                </h5>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </TeacherLayout>
    );
}

export default EstudantesTurma;