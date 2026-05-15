import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MdArrowBack, MdBarChart, MdFileDownload } from "react-icons/md";
import { FaChartLine, FaChartPie, FaChartBar } from "react-icons/fa";
import TeacherLayout from "../layouts/TeacherLayout";
import api from "../service/api";
import { showErrorToast } from "../components/global/CustomToast";
import * as XLSX from 'xlsx';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

function RelatoriosTurma() {
    const { idperiodo, iddisciplina } = useParams();
    const navigate = useNavigate();
    const [relatorios, setRelatorios] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        carregarRelatorios();
    }, [idperiodo, iddisciplina]);

    const carregarRelatorios = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/relatoriosTurma/${idperiodo}/${iddisciplina}`);
            if (response.data.success) {
                setRelatorios(response.data.data);
            }
        } catch (error) {
            console.error("Erro ao carregar relatórios:", error);
            showErrorToast("Erro", "Não foi possível carregar os relatórios");
        } finally {
            setLoading(false);
        }
    };

    const exportarRelatorioCompleto = () => {
        if (!relatorios) return;

        const dadosExportar = [
            { "Métrica": "Total de Alunos", "Valor": relatorios.estatisticas.total_alunos },
            { "Métrica": "Média Geral", "Valor": relatorios.estatisticas.media_geral?.toFixed(2) || 0 },
            { "Métrica": "Total de Aulas", "Valor": relatorios.estatisticas.total_aulas },
            { "Métrica": "Total de Presenças", "Valor": relatorios.estatisticas.total_presencas }
        ];

        const wsEstatisticas = XLSX.utils.json_to_sheet(dadosExportar);
        const wsDistribuicao = XLSX.utils.json_to_sheet(relatorios.distribuicao_notas);
        const wsFrequencia = XLSX.utils.json_to_sheet(relatorios.frequencia_alunos);
        
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, wsEstatisticas, "Estatísticas");
        XLSX.utils.book_append_sheet(wb, wsDistribuicao, "Distribuição Notas");
        XLSX.utils.book_append_sheet(wb, wsFrequencia, "Frequência Alunos");
        
        XLSX.writeFile(wb, `relatorio_turma_${idperiodo}.xlsx`);
    };

    // Dados para gráfico de distribuição de notas
    const notasChartData = {
        labels: relatorios?.distribuicao_notas?.map(d => d.status) || [],
        datasets: [{
            label: 'Quantidade de Alunos',
            data: relatorios?.distribuicao_notas?.map(d => d.quantidade) || [],
            backgroundColor: ['#28a745', '#ffc107', '#dc3545'],
            borderRadius: 8
        }]
    };

    // Dados para gráfico de frequência (Top 10)
    const frequenciaChartData = {
        labels: relatorios?.frequencia_alunos?.slice(0, 10).map(a => a.nome_estudante.split(' ')[0]) || [],
        datasets: [{
            label: 'Percentual de Presença (%)',
            data: relatorios?.frequencia_alunos?.slice(0, 10).map(a => a.percentual || 0) || [],
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top' },
            title: { display: true }
        }
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
                                    <MdBarChart className="me-2" />
                                    Relatórios da Turma
                                </h2>
                                <p className="text-muted mt-2 mb-0">
                                    Análise detalhada de desempenho e frequência
                                </p>
                            </div>
                            <button 
                                className="btn btn-success mt-2 mt-sm-0"
                                onClick={exportarRelatorioCompleto}
                            >
                                <MdFileDownload className="me-2" />
                                Exportar Relatório
                            </button>
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
                                        <p className="text-muted mb-1">Total Alunos</p>
                                        <h3 className="mb-0 fw-bold">{relatorios?.estatisticas?.total_alunos || 0}</h3>
                                    </div>
                                    <div className="bg-primary bg-opacity-10 rounded-3 p-3">
                                        <FaChartLine size={24} className="text-primary" />
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
                                        <h3 className="mb-0 fw-bold">{relatorios?.estatisticas?.media_geral?.toFixed(1) || 0}</h3>
                                    </div>
                                    <div className="bg-success bg-opacity-10 rounded-3 p-3">
                                        <FaChartBar size={24} className="text-success" />
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
                                        <p className="text-muted mb-1">Total Aulas</p>
                                        <h3 className="mb-0 fw-bold">{relatorios?.estatisticas?.total_aulas || 0}</h3>
                                    </div>
                                    <div className="bg-info bg-opacity-10 rounded-3 p-3">
                                        <FaChartLine size={24} className="text-info" />
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
                                        <p className="text-muted mb-1">Taxa Presença Média</p>
                                        <h3 className="mb-0 fw-bold">
                                            {relatorios?.frequencia_alunos?.length > 0
                                                ? (relatorios.frequencia_alunos.reduce((acc, a) => acc + (a.percentual || 0), 0) / relatorios.frequencia_alunos.length).toFixed(1)
                                                : 0}%
                                        </h3>
                                    </div>
                                    <div className="bg-warning bg-opacity-10 rounded-3 p-3">
                                        <FaChartPie size={24} className="text-warning" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Gráficos */}
                <div className="row mb-4 g-4">
                    <div className="col-md-6">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-header bg-white">
                                <h6 className="mb-0">Distribuição de Notas</h6>
                            </div>
                            <div className="card-body" style={{ height: '350px' }}>
                                <Pie data={notasChartData} options={chartOptions} />
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-header bg-white">
                                <h6 className="mb-0">Top 10 - Percentual de Presença</h6>
                            </div>
                            <div className="card-body" style={{ height: '350px' }}>
                                <Bar data={frequenciaChartData} options={chartOptions} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabela de Frequência Detalhada */}
                <div className="row">
                    <div className="col-12">
                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-white">
                                <h6 className="mb-0">Detalhamento de Frequência por Aluno</h6>
                            </div>
                            <div className="card-body p-0">
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th>#</th>
                                                <th>Nome do Estudante</th>
                                                <th>Nº Estudante</th>
                                                <th>Presenças</th>
                                                <th>Total Aulas</th>
                                                <th>Percentual</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {relatorios?.frequencia_alunos?.map((aluno, index) => (
                                                <tr key={index}>
                                                    <td>{index + 1}</td>
                                                    <td>{aluno.nome_estudante}</td>
                                                    <td>{aluno.numero_estudante}</td>
                                                    <td>{aluno.presencas || 0}</td>
                                                    <td>{aluno.total_aulas_realizadas || 0}</td>
                                                    <td>
                                                        <div className="d-flex align-items-center">
                                                            <div className="flex-grow-1 me-2">
                                                                <div className="progress" style={{ height: '8px' }}>
                                                                    <div 
                                                                        className={`progress-bar ${(aluno.percentual || 0) >= 75 ? 'bg-success' : (aluno.percentual || 0) >= 50 ? 'bg-warning' : 'bg-danger'}`}
                                                                        style={{ width: `${aluno.percentual || 0}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <span className="small">{(aluno.percentual || 0).toFixed(1)}%</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </TeacherLayout>
    );
}

export default RelatoriosTurma;