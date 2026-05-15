import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MdArrowBack, MdPeople, MdAssignment, MdCalendarToday, MdBarChart, MdSettings } from "react-icons/md";
import TeacherLayout from "../layouts/TeacherLayout";
import api from "../service/api";
import { showErrorToast } from "../components/global/CustomToast";
import Style from "../pagesAdm/components/DepartamentosEdit.module.css";

function GerenciarTurma() {
    const { idperiodo, iddisciplina, turma, disciplina } = useParams();
    const navigate = useNavigate();
    const [estatisticas, setEstatisticas] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        carregarEstatisticas();
    }, [idperiodo, iddisciplina]);

    const carregarEstatisticas = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/estatisticasTurma/${idperiodo}/${iddisciplina}`);
            if (response.data.success) {
                setEstatisticas(response.data.data);
            }
        } catch (error) {
            console.error("Erro ao carregar estatísticas:", error);
            showErrorToast("Erro", "Não foi possível carregar as estatísticas");
        } finally {
            setLoading(false);
        }
    };

    const menuItems = [
        {
            titulo: "Estudantes",
            icone: <MdPeople size={32} />,
            descricao: "Visualize e gerencie os alunos matriculados",
            cor: "primary",
            rota: "estudantes",
            bg: "bg-primary bg-opacity-10"
        },
        {
            titulo: "Notas",
            icone: <MdAssignment size={32} />,
            descricao: "Lançamento e consulta de notas",
            cor: "success",
            rota: "notas",
            bg: "bg-success bg-opacity-10"
        },
        {
            titulo: "Presenças",
            icone: <MdCalendarToday size={32} />,
            descricao: "Registro de frequência dos alunos",
            cor: "info",
            rota: "presencas",
            bg: "bg-info bg-opacity-10"
        },
        {
            titulo: "Relatórios",
            icone: <MdBarChart size={32} />,
            descricao: "Estatísticas e desempenho da turma",
            cor: "warning",
            rota: "relatorios",
            bg: "bg-warning bg-opacity-10"
        },
        {
            titulo: "Configurações",
            icone: <MdSettings size={32} />,
            descricao: "Configurações da disciplina",
            cor: "secondary",
            rota: "configuracoes",
            bg: "bg-secondary bg-opacity-10"
        }
    ];

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
                                    {disciplina}
                                </h2>
                                <p className="text-muted mt-2 mb-0">
                                    Turma: <strong>{turma}</strong> | 
                                    Período: <strong>{idperiodo}</strong>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cards de Estatísticas */}
                <div className="row mb-4 g-3">
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <p className="text-muted mb-1">Total de Alunos</p>
                                        <h3 className="mb-0 fw-bold">
                                            {loading ? "..." : estatisticas?.total_alunos || 0}
                                        </h3>
                                    </div>
                                    <div className="bg-primary bg-opacity-10 rounded-3 p-3">
                                        <MdPeople size={24} className="text-primary" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <p className="text-muted mb-1">Média Geral</p>
                                        <h3 className="mb-0 fw-bold">
                                            {loading ? "..." : (estatisticas?.media_geral || 0).toFixed(1)}
                                        </h3>
                                    </div>
                                    <div className="bg-success bg-opacity-10 rounded-3 p-3">
                                        <MdAssignment size={24} className="text-success" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <p className="text-muted mb-1">Total de Aulas</p>
                                        <h3 className="mb-0 fw-bold">
                                            {loading ? "..." : estatisticas?.total_aulas || 0}
                                        </h3>
                                    </div>
                                    <div className="bg-info bg-opacity-10 rounded-3 p-3">
                                        <MdCalendarToday size={24} className="text-info" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <p className="text-muted mb-1">Presença Média</p>
                                        <h3 className="mb-0 fw-bold">
                                            {loading ? "..." : 
                                                estatisticas?.total_alunos > 0 
                                                    ? ((estatisticas?.alunos_presentes / estatisticas?.total_alunos) * 100).toFixed(1) 
                                                    : 0
                                            }%
                                        </h3>
                                    </div>
                                    <div className="bg-warning bg-opacity-10 rounded-3 p-3">
                                        <MdBarChart size={24} className="text-warning" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Menu de Gestão */}
                <div className="row g-4">
                    {menuItems.map((item, index) => (
                        <div className="col-md-6 col-lg-4" key={index}>
                            <div 
                                className="card border-0 shadow-sm h-100 cursor-pointer"
                                style={{ cursor: 'pointer' }}
                                onClick={() => navigate(`/professor/gerenciar-turma/${idperiodo}/${iddisciplina}/${item.rota}`)}
                            >
                                <div className="card-body text-center p-4">
                                    <div className={`${item.bg} rounded-circle p-3 d-inline-block mb-3`}>
                                        <div style={{ color: `var(--${item.cor})` }}>
                                            {item.icone}
                                        </div>
                                    </div>
                                    <h5 className="mb-2">{item.titulo}</h5>
                                    <p className="text-muted mb-0 small">{item.descricao}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style jsx="true">{`
                .cursor-pointer {
                    transition: all 0.3s ease;
                }
                .cursor-pointer:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important;
                }
            `}</style>
        </TeacherLayout>
    );
}

export default GerenciarTurma;