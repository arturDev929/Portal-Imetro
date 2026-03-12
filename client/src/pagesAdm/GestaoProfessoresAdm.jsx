// GestaoProfessoresAdm.js
import { useState, useEffect } from "react";
import { api } from "../service/api";
import SidebarAdm from "../components/SidebarAdm";
import NavbarAdm from "../components/NavbarAdm";
import Style from "./GestaoCursoAdm.module.css";
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar,
  ScatterChart, Scatter
} from 'recharts';
import { 
  FaChalkboardTeacher, FaBook, FaUserGraduate,
  FaChartBar, FaChartPie, FaChartLine,
  FaClock, FaUserSlash, FaExclamationTriangle
} from 'react-icons/fa';
import { IoMdPerson, IoMdPeople } from "react-icons/io"
import { FaGraduationCap } from "react-icons/fa"
import ProfessorEdit from "../components/ProfessorEdit";
import ProfessorRemovidosEdit from "../components/ProfessorRemovidosEdit";

function GestaoProfessoresAdm() {
    const [user, setUser] = useState(null);
    const [totalProfessores, setTotalProfessores] = useState(0);
    const [professoresComTitulacao, setProfessoresComTitulacao] = useState(0);
    const [professoresComFoto, setProfessoresComFoto] = useState(0);
    const [professoresVinculados, setProfessoresVinculados] = useState(0);
    const [dadosGrafico, setDadosGrafico] = useState([]);
    const [dadosComparativos, setDadosComparativos] = useState([]);
    const [dadosProfessoresPorTitulacao, setDadosProfessoresPorTitulacao] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ultimaAtualizacao, setUltimaAtualizacao] = useState(new Date());
    const [professoresRecentes, setProfessoresRecentes] = useState([]);
    const [disciplinasMaisMinistradas, setDisciplinasMaisMinistradas] = useState([]);
    const [professoresSemDisciplina, setProfessoresSemDisciplina] = useState([]);
    
    // NOVOS ESTADOS PARA PROFESSORES DESATIVADOS
    const [totalProfessoresDesativados, setTotalProfessoresDesativados] = useState(0);
    const [professoresDesativados, setProfessoresDesativados] = useState([]);
    const [dadosGraficoDesativados, setDadosGraficoDesativados] = useState([]);
    const [desativadosComTitulacao, setDesativadosComTitulacao] = useState(0);
    const [erroDesativados, setErroDesativados] = useState(false);
    
    // Estado para controlar qual seção está visível
    const [secaoAtiva, setSecaoAtiva] = useState("geral"); // geral, professores

    const COLORS = ['#003366', '#B8860B', '#4A90E2', '#50C878', '#DC143C', '#FF8C00', '#9370DB', '#20B2AA', '#FF69B4', '#CD5C5C'];

    const API_URL = process.env.REACT_APP_API_URL;

    useEffect(() => {
        const usuarioSalvo = localStorage.getItem("usuarioLogado");
        if (usuarioSalvo) {
            setUser(JSON.parse(usuarioSalvo));
        }
    }, []);

    useEffect(() => {
        const fetchDadosProfessores = () => {
            setLoading(true);
            setErroDesativados(false);
            
            api.get(`/get/estatisticasProfessores`)
                .then(response => {
                    setTotalProfessores(response.data.totalProfessores || 0);
                    setProfessoresComTitulacao(response.data.professoresComTitulacao || 0);
                    setProfessoresComFoto(response.data.professoresComFoto || 0);
                    setUltimaAtualizacao(new Date());
                })
                .catch(error => {
                    console.error('Erro ao buscar estatísticas:', error);
                });

            api.get(`/get/estatisticasProfessoresDesativados`)
                .then(response => {
                    setTotalProfessoresDesativados(response.data.totalProfessoresDesativados || 0);
                    setDesativadosComTitulacao(response.data.desativadosComTitulacao || 0);
                })
                .catch(error => {
                    console.error('Erro ao buscar estatísticas de desativados:', error);
                    setErroDesativados(true);
                });

            api.get(`/get/distribuicaoTitulacao`)
                .then(response => {
                    const dadosFormatados = response.data.map((item, index) => ({
                        titulacao: item.titulacao || 'Não informado',
                        quantidade: item.quantidade || 0,
                        valor: item.quantidade || 0
                    }));
                    
                    setDadosProfessoresPorTitulacao(dadosFormatados);
                    
                    const total = dadosFormatados.reduce((acc, curr) => acc + curr.quantidade, 0);
                    const comparativo = dadosFormatados.map((item) => ({
                        titulacao: item.titulacao,
                        proporcao: total > 0 ? ((item.quantidade / total) * 100).toFixed(1) : 0,
                        peso: item.quantidade
                    }));
                    setDadosComparativos(comparativo);
                    
                    setDadosGrafico(dadosFormatados);
                })
                .catch(error => {
                    setDadosGrafico([]);
                });

            api.get(`/get/distribuicaoTitulacaoDesativados`)
                .then(response => {
                    if (response.data && response.data.length > 0) {
                        const dadosFormatados = response.data.map((item, index) => ({
                            titulacao: item.titulacao || 'Não informado',
                            quantidade: item.quantidade || 0,
                            valor: item.quantidade || 0
                        }));
                        setDadosGraficoDesativados(dadosFormatados);
                    } else {
                        setDadosGraficoDesativados([]);
                    }
                })
                .catch(error => {
                    console.log("Erro na distribuição desativados:", error);
                    setDadosGraficoDesativados([]);
                });

            api.get(`/get/Professores`)
                .then(response => {
                    const recentes = response.data
                        .sort((a, b) => new Date(b.dataadmissaoprofessor) - new Date(a.dataadmissaoprofessor))
                        .slice(0, 5);
                    setProfessoresRecentes(recentes);
                })
                .catch(error => console.log("Erro professores recentes:", error));

            api.get(`/get/disciplinasMaisMinistradas`)
                .then(response => {
                    setDisciplinasMaisMinistradas(response.data || []);
                })
                .catch(error => console.log("Erro disciplinas:", error));

            api.get(`/get/professoresSemDisciplinas`)
                .then(response => {
                    setProfessoresSemDisciplina(response.data || []);
                    setProfessoresVinculados(totalProfessores - (response.data?.length || 0));
                })
                .catch(error => console.log("Erro sem disciplina:", error));

            api.get(`/get/professoresDesativados`)
                .then(response => {
                    setProfessoresDesativados(response.data || []);
                })
                .catch(error => console.log("Erro lista desativados:", error));

            setLoading(false);
        };

        fetchDadosProfessores();
        const interval = setInterval(fetchDadosProfessores, 30000);
        
        return () => {
            clearInterval(interval);
        };
    }, [totalProfessores]);

    if (loading) {
        return (
            <div className={`container-fluid ${Style.gestaoCursos} p-0 m-0`}>
                <SidebarAdm />
                <div className="col-md-9 ms-md-auto col-lg-10 px-0">
                    <NavbarAdm />
                    <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
                        <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
                            <span className="visually-hidden">Carregando...</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`container-fluid ${Style.gestaoCursos} p-0 m-0`}>
            <SidebarAdm />
            <div className="col-md-9 ms-md-auto col-lg-10 px-0">
                <NavbarAdm />
                <main className="p-4" style={{ backgroundColor: 'var(--cinza-claro)' }}>
                    {/* Header Section */}
                    <div className="row mb-4">
                        <div className="col-12">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h2 style={{ color: 'var(--azul-escuro)', fontWeight: '600' }}>
                                        Dashboard de Professores
                                    </h2>
                                    <p className="text-muted mb-0">
                                        Bem-vindo, {user ? user.nome : 'Administrador'} | Análise completa do corpo docente
                                    </p>
                                </div>
                                <div className="d-flex align-items-center gap-3">
                                    <div className="text-muted small">
                                        <FaClock className="me-1" />
                                        Última atualização: {ultimaAtualizacao.toLocaleString('pt-BR')}
                                    </div>
                                    <div className="badge p-3" style={{ backgroundColor: 'var(--azul-escuro)' }}>
                                        <FaChalkboardTeacher size={24} color="white" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Botões de Navegação */}
                    <div className="row mb-4 g-2">
                        <div className="col-md-2">
                            <button 
                                className={`btn w-100 ${secaoAtiva === "geral" ? `${Style.botoesGestaoCurso}`  : `${Style.botoesGestaoCursoD}`}`}
                                onClick={() => setSecaoAtiva("geral")}
                            >
                                <FaChartBar className="me-2 mb-1" />
                                Painel Geral
                            </button>
                        </div>
                        <div className="col-md-2">
                            <button 
                                className={`btn w-100 ${secaoAtiva === "professores" ? `${Style.botoesGestaoCurso}`  : `${Style.botoesGestaoCursoD}`}`}
                                onClick={() => setSecaoAtiva("professores")}
                            >
                                <FaUserGraduate className="me-2 mb-1" />
                                Professores
                            </button>
                        </div>
                        <div className="col-md-2">
                            <button 
                                className={`btn w-100 ${secaoAtiva === "ProfessorRemovidosEdit" ? `${Style.botoesGestaoCurso}`  : `${Style.botoesGestaoCursoD}`}`}
                                onClick={() => setSecaoAtiva("ProfessorRemovidosEdit")}
                            >
                                <FaUserGraduate className="me-2 mb-1" />
                                Prof. Removidos
                            </button>
                        </div>
                    </div>

                    {/* Seção Painel Geral */}
                    {secaoAtiva === "geral" && (
                        <>
                            {/* Cards Estatísticos */}
                            <div className="row mb-4 g-3">
                                {/* Card Total Professores */}
                                <div className="col-md-3">
                                    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '15px', background: 'linear-gradient(135deg, #003366 0%, #1a4d80 100%)' }}>
                                        <div className="card-body">
                                            <div className="d-flex justify-content-between align-items-start mb-3">
                                                <div>
                                                    <h6 className="text-white-50 mb-2">Total de Professores</h6>
                                                    <h2 className="text-white mb-0" style={{ fontSize: '2.5rem', fontWeight: '700' }}>
                                                        {totalProfessores}
                                                    </h2>
                                                </div>
                                                <div className="bg-white bg-opacity-25 p-3 rounded-circle">
                                                    <IoMdPeople size={28} color="white" />
                                                </div>
                                            </div>
                                            <p className="text-white-50 small mb-0">Corpo docente ativo</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Card Com Titulação */}
                                <div className="col-md-3">
                                    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '15px', background: 'linear-gradient(135deg, #B8860B 0%, #DAA520 100%)' }}>
                                        <div className="card-body">
                                            <div className="d-flex justify-content-between align-items-start mb-3">
                                                <div>
                                                    <h6 className="text-white-50 mb-2">Com Titulação</h6>
                                                    <h2 className="text-white mb-0" style={{ fontSize: '2.5rem', fontWeight: '700' }}>
                                                        {professoresComTitulacao}
                                                    </h2>
                                                </div>
                                                <div className="bg-white bg-opacity-25 p-3 rounded-circle">
                                                    <FaGraduationCap size={28} color="white" />
                                                </div>
                                            </div>
                                            <p className="text-white-50 small mb-0">Pós-graduados e especialistas</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Card Vinculados */}
                                <div className="col-md-3">
                                    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '15px', background: 'linear-gradient(135deg, #4A90E2 0%, #6AA6E8 100%)' }}>
                                        <div className="card-body">
                                            <div className="d-flex justify-content-between align-items-start mb-3">
                                                <div>
                                                    <h6 className="text-white-50 mb-2">Vinculados a Disciplinas</h6>
                                                    <h2 className="text-white mb-0" style={{ fontSize: '2.5rem', fontWeight: '700' }}>
                                                        {professoresVinculados}
                                                    </h2>
                                                </div>
                                                <div className="bg-white bg-opacity-25 p-3 rounded-circle">
                                                    <FaBook size={28} color="white" />
                                                </div>
                                            </div>
                                            <p className="text-white-50 small mb-0">Ministrando disciplinas</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Card Com Foto */}
                                <div className="col-md-3">
                                    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '15px', background: 'linear-gradient(135deg, #50C878 0%, #6AD88C 100%)' }}>
                                        <div className="card-body">
                                            <div className="d-flex justify-content-between align-items-start mb-3">
                                                <div>
                                                    <h6 className="text-white-50 mb-2">Com Foto</h6>
                                                    <h2 className="text-white mb-0" style={{ fontSize: '2.5rem', fontWeight: '700' }}>
                                                        {professoresComFoto}
                                                    </h2>
                                                </div>
                                                <div className="bg-white bg-opacity-25 p-3 rounded-circle">
                                                    <IoMdPerson size={28} color="white" />
                                                </div>
                                            </div>
                                            <p className="text-white-50 small mb-0">Perfil completo</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* GRÁFICO 1 - Pizza (Distribuição por Titulação) */}
                            <div className="row g-4 mb-4">
                                <div className="col-md-6">
                                    <div className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                                        <div className="card-header bg-white border-0 pt-4 px-4">
                                            <div className="d-flex align-items-center gap-2">
                                                <FaChartPie size={20} color="#B8860B" />
                                                <h5 className="mb-0" style={{ color: 'var(--azul-escuro)', fontWeight: '600' }}>
                                                    Gráfico 1: Distribuição por Titulação (Ativos)
                                                </h5>
                                            </div>
                                            <p className="text-muted small mb-0">Percentual de professores ativos por nível de formação</p>
                                        </div>
                                        <div className="card-body">
                                            {dadosProfessoresPorTitulacao.length > 0 ? (
                                                <ResponsiveContainer width="100%" height={350}>
                                                    <PieChart>
                                                        <Pie
                                                            data={dadosProfessoresPorTitulacao}
                                                            cx="50%"
                                                            cy="50%"
                                                            labelLine={true}
                                                            label={({ titulacao, percent }) => `${titulacao}: ${(percent * 100).toFixed(0)}%`}
                                                            outerRadius={120}
                                                            fill="#8884d8"
                                                            dataKey="quantidade"
                                                            labelStyle={{ fontSize: '10px', fill: '#333' }}
                                                        >
                                                            {dadosProfessoresPorTitulacao.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip 
                                                            content={({ active, payload }) => {
                                                                if (active && payload && payload.length) {
                                                                    const data = payload[0].payload;
                                                                    const total = dadosProfessoresPorTitulacao.reduce((acc, curr) => acc + curr.quantidade, 0);
                                                                    const percentual = total > 0 ? ((data.quantidade / total) * 100).toFixed(1) : 0;
                                                                    
                                                                    return (
                                                                        <div style={{
                                                                            backgroundColor: '#fff',
                                                                            border: 'none',
                                                                            borderRadius: '8px',
                                                                            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                                                                            fontSize: '12px',
                                                                            padding: '10px 14px'
                                                                        }}>
                                                                            <p style={{ margin: 0, fontWeight: 'bold', color: '#003366' }}>
                                                                                {data.titulacao}
                                                                            </p>
                                                                            <p style={{ margin: '5px 0 0 0', color: '#666' }}>
                                                                                Professores Ativos: <strong>{data.quantidade}</strong>
                                                                            </p>
                                                                            <p style={{ margin: '2px 0 0 0', color: '#B8860B' }}>
                                                                                Participação: <strong>{percentual}%</strong>
                                                                            </p>
                                                                        </div>
                                                                    );
                                                                }
                                                                return null;
                                                            }}
                                                        />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            ) : (
                                                <div className="d-flex justify-content-center align-items-center" style={{ height: '350px' }}>
                                                    <p className="text-muted">Nenhum dado disponível</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* GRÁFICO 2 - Barras (Professores por Titulação) */}
                                <div className="col-md-6">
                                    <div className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                                        <div className="card-header bg-white border-0 pt-4 px-4">
                                            <div className="d-flex align-items-center gap-2">
                                                <FaChartBar size={20} color="#003366" />
                                                <h5 className="mb-0" style={{ color: 'var(--azul-escuro)', fontWeight: '600' }}>
                                                    Gráfico 2: Volume por Titulação (Ativos)
                                                </h5>
                                            </div>
                                            <p className="text-muted small mb-0">Quantidade absoluta por nível de formação</p>
                                        </div>
                                        <div className="card-body">
                                            {dadosProfessoresPorTitulacao.length > 0 ? (
                                                <ResponsiveContainer width="100%" height={350}>
                                                    <BarChart data={dadosProfessoresPorTitulacao} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                                        <XAxis dataKey="titulacao" tick={{ fill: '#666', fontSize: 12 }} />
                                                        <YAxis tick={{ fill: '#666', fontSize: 12 }} />
                                                        <Tooltip 
                                                            contentStyle={{ 
                                                                backgroundColor: '#fff',
                                                                border: 'none',
                                                                borderRadius: '8px',
                                                                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                                                            }}
                                                        />
                                                        <Legend />
                                                        <Bar dataKey="quantidade" fill="#003366" name="Total de Professores Ativos" radius={[5,5,0,0]}>
                                                            {dadosProfessoresPorTitulacao.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                            ))}
                                                        </Bar>
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            ) : (
                                                <div className="d-flex justify-content-center align-items-center" style={{ height: '350px' }}>
                                                    <p className="text-muted">Nenhum dado disponível</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* GRÁFICO 3 - Scatter (Relação Peso vs Proporção) */}
                            <div className="row g-4 mb-4">
                                <div className="col-md-6">
                                    <div className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                                        <div className="card-header bg-white border-0 pt-4 px-4">
                                            <div className="d-flex align-items-center gap-2">
                                                <FaChartLine size={20} color="#50C878" />
                                                <h5 className="mb-0" style={{ color: 'var(--azul-escuro)', fontWeight: '600' }}>
                                                    Gráfico 3: Análise de Peso e Proporção
                                                </h5>
                                            </div>
                                            <p className="text-muted small mb-0">Relação entre quantidade e participação percentual</p>
                                        </div>
                                        <div className="card-body">
                                            {dadosComparativos.length > 0 ? (
                                                <ResponsiveContainer width="100%" height={350}>
                                                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                                        <XAxis 
                                                            type="number" 
                                                            dataKey="peso" 
                                                            name="Professores" 
                                                            unit=" prof" 
                                                            tick={{ fill: '#666', fontSize: 12 }}
                                                            label={{ value: 'Quantidade de Professores', position: 'bottom', fill: '#666', fontSize: 11 }}
                                                        />
                                                        <YAxis 
                                                            type="number" 
                                                            dataKey="proporcao" 
                                                            name="Participação" 
                                                            unit="%" 
                                                            tick={{ fill: '#666', fontSize: 12 }}
                                                            label={{ value: 'Participação (%)', angle: -90, position: 'left', fill: '#666', fontSize: 11 }}
                                                        />
                                                        <Tooltip 
                                                            cursor={{ strokeDasharray: '3 3' }}
                                                            content={({ active, payload }) => {
                                                                if (active && payload && payload.length) {
                                                                    const data = payload[0].payload;
                                                                    return (
                                                                        <div style={{
                                                                            backgroundColor: '#fff',
                                                                            border: 'none',
                                                                            borderRadius: '8px',
                                                                            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                                                                            fontSize: '12px',
                                                                            padding: '10px 14px'
                                                                        }}>
                                                                            <p style={{ margin: 0, fontWeight: 'bold', color: '#003366' }}>
                                                                                {data.titulacao}
                                                                            </p>
                                                                            <p style={{ margin: '5px 0 0 0', color: '#666' }}>
                                                                                Professores: <strong>{data.peso}</strong>
                                                                            </p>
                                                                            <p style={{ margin: '2px 0 0 0', color: '#B8860B' }}>
                                                                                Participação: <strong>{data.proporcao}%</strong>
                                                                            </p>
                                                                        </div>
                                                                    );
                                                                }
                                                                return null;
                                                            }}
                                                        />
                                                        <Legend />
                                                        <Scatter 
                                                            name="Titulações" 
                                                            data={dadosComparativos} 
                                                            fill="#003366" 
                                                            shape="circle"
                                                        >
                                                            {dadosComparativos.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                            ))}
                                                        </Scatter>
                                                    </ScatterChart>
                                                </ResponsiveContainer>
                                            ) : (
                                                <div className="d-flex justify-content-center align-items-center" style={{ height: '350px' }}>
                                                    <p className="text-muted">Nenhum dado disponível</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* GRÁFICO 4 - Disciplinas Mais Ministradas */}
                                <div className="col-md-6">
                                    <div className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                                        <div className="card-header bg-white border-0 pt-4 px-4">
                                            <div className="d-flex align-items-center gap-2">
                                                <FaBook size={20} color="#4A90E2" />
                                                <h5 className="mb-0" style={{ color: 'var(--azul-escuro)', fontWeight: '600' }}>
                                                    Gráfico 4: Disciplinas Mais Ministradas
                                                </h5>
                                            </div>
                                            <p className="text-muted small mb-0">Top 10 disciplinas com mais professores</p>
                                        </div>
                                        <div className="card-body">
                                            {disciplinasMaisMinistradas.length > 0 ? (
                                                <ResponsiveContainer width="100%" height={350}>
                                                    <BarChart 
                                                        data={disciplinasMaisMinistradas.slice(0, 10)} 
                                                        margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                                                        layout="vertical"
                                                    >
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                                        <XAxis type="number" tick={{ fill: '#666', fontSize: 12 }} />
                                                        <YAxis 
                                                            type="category" 
                                                            dataKey="disciplina" 
                                                            width={150}
                                                            tick={{ fill: '#666', fontSize: 11 }}
                                                            interval={0}
                                                        />
                                                        <Tooltip 
                                                            contentStyle={{ 
                                                                backgroundColor: '#fff',
                                                                border: 'none',
                                                                borderRadius: '8px',
                                                                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                                                            }}
                                                            formatter={(value) => [`${value} professores`, 'Total']}
                                                        />
                                                        <Legend />
                                                        <Bar 
                                                            dataKey="totalProfessores" 
                                                            fill="#4A90E2" 
                                                            name="Total de Professores"
                                                            radius={[0, 5, 5, 0]}
                                                        >
                                                            {disciplinasMaisMinistradas.slice(0, 10).map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                            ))}
                                                        </Bar>
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            ) : (
                                                <div className="d-flex justify-content-center align-items-center" style={{ height: '350px' }}>
                                                    <p className="text-muted">Nenhum dado disponível</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* NOVO GRÁFICO 5 - Professores Desativados */}
                            <div className="row g-4 mb-4">
                                <div className="col-md-6">
                                    <div className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                                        <div className="card-header bg-white border-0 pt-4 px-4">
                                            <div className="d-flex align-items-center gap-2">
                                                <FaUserSlash size={20} color="#DC143C" />
                                                <h5 className="mb-0" style={{ color: 'var(--azul-escuro)', fontWeight: '600' }}>
                                                    Gráfico 5: Professores Desativados por Titulação
                                                </h5>
                                            </div>
                                            <p className="text-muted small mb-0">Distribuição de professores com estado 'Desativado'</p>
                                        </div>
                                        <div className="card-body">
                                            {erroDesativados ? (
                                                <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: '350px' }}>
                                                    <FaExclamationTriangle size={40} color="#DC143C" />
                                                    <p className="text-muted mt-3">Erro ao carregar dados de professores desativados</p>
                                                </div>
                                            ) : dadosGraficoDesativados.length > 0 ? (
                                                <ResponsiveContainer width="100%" height={350}>
                                                    <PieChart>
                                                        <Pie
                                                            data={dadosGraficoDesativados}
                                                            cx="50%"
                                                            cy="50%"
                                                            labelLine={true}
                                                            label={({ titulacao, percent }) => `${titulacao}: ${(percent * 100).toFixed(0)}%`}
                                                            outerRadius={120}
                                                            fill="#8884d8"
                                                            dataKey="quantidade"
                                                            labelStyle={{ fontSize: '10px', fill: '#333' }}
                                                        >
                                                            {dadosGraficoDesativados.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip 
                                                            content={({ active, payload }) => {
                                                                if (active && payload && payload.length) {
                                                                    const data = payload[0].payload;
                                                                    const total = dadosGraficoDesativados.reduce((acc, curr) => acc + curr.quantidade, 0);
                                                                    const percentual = total > 0 ? ((data.quantidade / total) * 100).toFixed(1) : 0;
                                                                    
                                                                    return (
                                                                        <div style={{
                                                                            backgroundColor: '#fff',
                                                                            border: 'none',
                                                                            borderRadius: '8px',
                                                                            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                                                                            fontSize: '12px',
                                                                            padding: '10px 14px'
                                                                        }}>
                                                                            <p style={{ margin: 0, fontWeight: 'bold', color: '#DC143C' }}>
                                                                                {data.titulacao}
                                                                            </p>
                                                                            <p style={{ margin: '5px 0 0 0', color: '#666' }}>
                                                                                Professores Desativados: <strong>{data.quantidade}</strong>
                                                                            </p>
                                                                            <p style={{ margin: '2px 0 0 0', color: '#B8860B' }}>
                                                                                Participação: <strong>{percentual}%</strong>
                                                                            </p>
                                                                        </div>
                                                                    );
                                                                }
                                                                return null;
                                                            }}
                                                        />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            ) : (
                                                <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: '350px' }}>
                                                    <FaUserSlash size={40} color="#ccc" />
                                                    <p className="text-muted mt-3">Nenhum professor desativado encontrado</p>
                                                    <small className="text-muted">Os professores desativados aparecerão aqui</small>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Card de Resumo de Desativados */}
                                <div className="col-md-6">
                                    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '15px', background: 'linear-gradient(135deg, #DC143C 0%, #FF4500 100%)' }}>
                                        <div className="card-body d-flex flex-column justify-content-center">
                                            <div className="d-flex justify-content-between align-items-start mb-3">
                                                <div>
                                                    <h6 className="text-white-50 mb-2">Total de Professores Desativados</h6>
                                                    <h2 className="text-white mb-0" style={{ fontSize: '3.5rem', fontWeight: '700' }}>
                                                        {totalProfessoresDesativados}
                                                    </h2>
                                                </div>
                                                <div className="bg-white bg-opacity-25 p-3 rounded-circle">
                                                    <IoMdPeople size={32} color="white" />
                                                </div>
                                            </div>
                                            <p className="text-white-50 small mb-2">Com titulação: {desativadosComTitulacao}</p>
                                            <p className="text-white-50 small mb-0">Professores que não fazem mais parte do corpo docente</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tabela de Professores Desativados */}
                            <div className="row mt-4">
                                <div className="col-12">
                                    <div className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                                        <div className="card-header bg-white border-0 pt-4 px-4">
                                            <h5 className="mb-0" style={{ color: 'var(--azul-escuro)', fontWeight: '600' }}>
                                                Professores Desativados
                                            </h5>
                                            <p className="text-muted small mb-0">Lista de professores com estado 'Desativado'</p>
                                        </div>
                                        <div className="card-body">
                                            <div className="table-responsive">
                                                <table className="table table-hover">
                                                    <thead>
                                                        <tr>
                                                            <th>Foto</th>
                                                            <th>Nome</th>
                                                            <th>Titulação</th>
                                                            <th>Data Admissão</th>
                                                            <th>Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {professoresDesativados.length > 0 ? (
                                                            professoresDesativados.map((prof, index) => (
                                                                <tr key={prof.idprofessor || index}>
                                                                    <td>
                                                                        <img 
                                                                            src={prof.fotoUrl || "https://via.placeholder.com/40?text=Sem+Foto"}
                                                                            alt={prof.nomeprofessor}
                                                                            className="rounded-circle"
                                                                            style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                                                            onError={(e) => {
                                                                                e.target.src = "https://via.placeholder.com/40?text=Sem+Foto";
                                                                            }}
                                                                        />
                                                                    </td>
                                                                    <td style={{ fontWeight: '500' }}>
                                                                        {prof.nomeprofessor || 'N/A'}
                                                                    </td>
                                                                    <td>
                                                                        <span className="badge bg-secondary">
                                                                            {prof.titulacaoprofessor || 'Não informado'}
                                                                        </span>
                                                                    </td>
                                                                    <td>
                                                                        {prof.dataadmissaoprofessor 
                                                                            ? new Date(prof.dataadmissaoprofessor).toLocaleDateString('pt-BR')
                                                                            : 'N/A'}
                                                                    </td>
                                                                    <td>
                                                                        <span className="badge bg-danger">Desativado</span>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        ) : (
                                                            <tr>
                                                                <td colSpan="5" className="text-center py-3">
                                                                    Nenhum professor desativado encontrado
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Ranking e Tabelas */}
                            <div className="row mt-4">
                                {/* Professores Recentes */}
                                <div className="col-md-6 mb-4">
                                    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
                                        <div className="card-header bg-white border-0 pt-4 px-4">
                                            <h5 className="mb-0" style={{ color: 'var(--azul-escuro)', fontWeight: '600' }}>
                                                Professores Recentemente Admitidos
                                            </h5>
                                            <p className="text-muted small mb-0">Últimos 5 professores cadastrados</p>
                                        </div>
                                        <div className="card-body">
                                            <div className="table-responsive">
                                                <table className="table table-hover">
                                                    <thead>
                                                        <tr>
                                                            <th>Foto</th>
                                                            <th>Nome</th>
                                                            <th>Titulação</th>
                                                            <th>Data Admissão</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {professoresRecentes.length > 0 ? (
                                                            professoresRecentes.map((prof, index) => (
                                                                <tr key={prof.idprofessor || index}>
                                                                    <td>
                                                                        <img 
                                                                            src={prof.fotoUrl || "https://via.placeholder.com/40"}
                                                                            alt={prof.nomeprofessor}
                                                                            className="rounded-circle"
                                                                            style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                                                            onError={(e) => {
                                                                                e.target.src = "https://via.placeholder.com/40?text=Sem+Foto";
                                                                            }}
                                                                        />
                                                                    </td>
                                                                    <td style={{ fontWeight: '500' }}>
                                                                        {prof.nomeprofessor || 'N/A'}
                                                                    </td>
                                                                    <td>
                                                                        <span className="badge bg-primary">
                                                                            {prof.titulacaoprofessor || 'Não informado'}
                                                                        </span>
                                                                    </td>
                                                                    <td>
                                                                        {prof.dataadmissaoprofessor 
                                                                            ? new Date(prof.dataadmissaoprofessor).toLocaleDateString('pt-BR')
                                                                            : 'N/A'}
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        ) : (
                                                            <tr>
                                                                <td colSpan="4" className="text-center py-3">
                                                                    Nenhum professor cadastrado
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Professores Sem Disciplina */}
                                <div className="col-md-6 mb-4">
                                    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
                                        <div className="card-header bg-white border-0 pt-4 px-4">
                                            <h5 className="mb-0" style={{ color: 'var(--azul-escuro)', fontWeight: '600' }}>
                                                Professores sem Disciplina Vinculada
                                            </h5>
                                            <p className="text-muted small mb-0">Docentes aguardando atribuição</p>
                                        </div>
                                        <div className="card-body">
                                            <div className="table-responsive">
                                                <table className="table table-hover">
                                                    <thead>
                                                        <tr>
                                                            <th>#</th>
                                                            <th>Nome</th>
                                                            <th>Titulação</th>
                                                            <th>Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {professoresSemDisciplina.length > 0 ? (
                                                            professoresSemDisciplina.slice(0, 8).map((prof, index) => (
                                                                <tr key={prof.idprofessor || index}>
                                                                    <td>
                                                                        <span className={`badge bg-${index < 3 ? 'warning' : 'secondary'} text-dark`}>
                                                                            {index + 1}
                                                                        </span>
                                                                    </td>
                                                                    <td style={{ color: COLORS[index % COLORS.length], fontWeight: '500' }}>
                                                                        {prof.nomeprofessor || 'N/A'}
                                                                    </td>
                                                                    <td>
                                                                        {prof.titulacaoprofessor || 'Não informado'}
                                                                    </td>
                                                                    <td>
                                                                        <span className="badge bg-danger">Sem disciplina</span>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        ) : (
                                                            <tr>
                                                                <td colSpan="4" className="text-center py-3">
                                                                    Todos os professores possuem disciplinas vinculadas
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Ranking de Disciplinas */}
                            <div className="row mt-2">
                                <div className="col-12">
                                    <div className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                                        <div className="card-header bg-white border-0 pt-4 px-4">
                                            <h5 className="mb-0" style={{ color: 'var(--azul-escuro)', fontWeight: '600' }}>
                                                Ranking de Disciplinas por Número de Professores
                                            </h5>
                                            <p className="text-muted small mb-0">As 10 disciplinas com mais docentes</p>
                                        </div>
                                        <div className="card-body">
                                            <div className="table-responsive">
                                                <table className="table table-hover">
                                                    <thead>
                                                        <tr>
                                                            <th>#</th>
                                                            <th>Disciplina</th>
                                                            <th className="text-center">Total de Professores</th>
                                                            <th className="text-center">Participação</th>
                                                            <th>Professores</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {disciplinasMaisMinistradas.length > 0 ? (
                                                            disciplinasMaisMinistradas.slice(0, 10).map((item, index) => {
                                                                const totalGeral = disciplinasMaisMinistradas.reduce((acc, curr) => acc + curr.totalProfessores, 0);
                                                                const percentual = totalGeral > 0 ? ((item.totalProfessores / totalGeral) * 100).toFixed(1) : 0;
                                                                
                                                                return (
                                                                    <tr key={item.iddisciplina || index}>
                                                                        <td>
                                                                            <span className={`badge bg-${index < 3 ? 'warning' : 'secondary'} text-dark`} style={{ fontSize: '14px', padding: '8px 12px' }}>
                                                                                {index + 1}º
                                                                            </span>
                                                                        </td>
                                                                        <td style={{ color: COLORS[index % COLORS.length], fontWeight: '500' }}>
                                                                            {item.disciplina}
                                                                        </td>
                                                                        <td className="text-center fw-bold">{item.totalProfessores}</td>
                                                                        <td className="text-center">
                                                                            <div className="d-flex align-items-center justify-content-center gap-2">
                                                                                <span style={{ minWidth: '45px' }}>{percentual}%</span>
                                                                                <div className="progress" style={{ width: '100px', height: '8px' }}>
                                                                                    <div 
                                                                                        className="progress-bar" 
                                                                                        style={{ 
                                                                                            width: `${percentual}%`,
                                                                                            backgroundColor: COLORS[index % COLORS.length]
                                                                                        }}
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                        <td>
                                                                            <small className="text-muted" title={item.professoresNomes}>
                                                                                {item.professoresNomes?.length > 50 
                                                                                    ? item.professoresNomes.substring(0, 50) + '...' 
                                                                                    : item.professoresNomes || 'N/A'}
                                                                            </small>
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })
                                                        ) : (
                                                            <tr>
                                                                <td colSpan="5" className="text-center py-3">
                                                                    Nenhum dado disponível
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Legenda dos Gráficos */}
                            <div className="row mt-4">
                                <div className="col-12">
                                    <div className="card border-0 shadow-sm" style={{ borderRadius: '15px', backgroundColor: '#f8f9fa' }}>
                                        <div className="card-body">
                                            <h6 className="mb-3" style={{ color: 'var(--azul-escuro)' }}>O que cada gráfico revela:</h6>
                                            <div className="row">
                                                <div className="col-md-2">
                                                    <p className="small mb-2">
                                                        <span style={{ color: '#B8860B', fontWeight: 'bold' }}>●</span> 
                                                        <strong> Gráfico 1:</strong> Distribuição % ativos
                                                    </p>
                                                </div>
                                                <div className="col-md-2">
                                                    <p className="small mb-2">
                                                        <span style={{ color: '#003366', fontWeight: 'bold' }}>●</span> 
                                                        <strong> Gráfico 2:</strong> Volume ativos
                                                    </p>
                                                </div>
                                                <div className="col-md-2">
                                                    <p className="small mb-2">
                                                        <span style={{ color: '#50C878', fontWeight: 'bold' }}>●</span> 
                                                        <strong> Gráfico 3:</strong> Peso vs proporção
                                                    </p>
                                                </div>
                                                <div className="col-md-2">
                                                    <p className="small mb-2">
                                                        <span style={{ color: '#4A90E2', fontWeight: 'bold' }}>●</span> 
                                                        <strong> Gráfico 4:</strong> Disciplinas top 10
                                                    </p>
                                                </div>
                                                <div className="col-md-2">
                                                    <p className="small mb-2">
                                                        <span style={{ color: '#DC143C', fontWeight: 'bold' }}>●</span> 
                                                        <strong> Gráfico 5:</strong> Desativados
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Seção Gestão de Professores */}
                    {secaoAtiva === "professores" && (
                        <ProfessorEdit />
                    )}
                    {secaoAtiva === "ProfessorRemovidosEdit" && (
                        <ProfessorRemovidosEdit />
                    )}
                </main>
            </div>
        </div>
    );
}

export default GestaoProfessoresAdm;