import { useState, useEffect } from "react";
import Axios from "axios";
import SidebarAdm from "../components/SidebarAdm";
import NavbarAdm from "../components/NavbarAdm";
import Style from "./GestaoCursoAdm.module.css";
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar,
  ScatterChart, Scatter
} from 'recharts';
import { 
  FaUniversity, FaBook, FaLayerGroup, FaGraduationCap,
  FaClock, FaChartBar, FaChartPie, FaChartLine
} from 'react-icons/fa';
import CursoEdit from "../components/CursosEdit"
import DepartamentoEdit from "../components/DepartamentosEdit"
import DisciplinasEdit from "../components/DisciplinasEdit"
import { MdAdd } from "react-icons/md";
import OutrosRegistros from "../components/OutrosRegistros";

function HomeAdm() {
    const [user, setUser] = useState(null);
    const [departamento, setDepartamento] = useState(0);
    const [licenciatura, setLicenciatura] = useState(0);
    const [disciplina, setDisciplina] = useState(0);
    const [dadosGrafico, setDadosGrafico] = useState([]);
    const [dadosComparativos, setDadosComparativos] = useState([]);
    const [dadosDisciplinasPorCurso, setDadosDisciplinasPorCurso] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ultimaAtualizacao, setUltimaAtualizacao] = useState(new Date());
    
    // Estado para controlar qual seção está visível
    const [secaoAtiva, setSecaoAtiva] = useState("geral"); // geral, departamentos, cursos, disciplinas

    const COLORS = ['#003366', '#B8860B', '#4A90E2', '#50C878', '#DC143C', '#FF8C00', '#9370DB', '#20B2AA', '#FF69B4', '#CD5C5C'];

    useEffect(() => {
        const fetchDepartamento = () => {
            Axios.get('http://localhost:8080/get/totalcategoriacurso')
                .then(response => {
                    setDepartamento(response.data[0]?.total_categorias || 0);
                    setUltimaAtualizacao(new Date());
                    setLoading(false);
                })
                .catch(error => {
                    console.error('Erro ao buscar departamento:', error);
                    setLoading(false);
                });
        }
        
        fetchDepartamento();
        const interval = setInterval(fetchDepartamento, 30000);
        
        return () => {
            clearInterval(interval);
        }
    }, []);

    useEffect(() => {
        const usuarioSalvo = localStorage.getItem("usuarioLogado");
        if (usuarioSalvo) {
            setUser(JSON.parse(usuarioSalvo));
        }
    }, []);

    useEffect(()=>{
        const fetchDataLicenciatura = () =>{
            Axios.get('http://localhost:8080/get/totallicenciaturas')
                .then(response => {
                    setLicenciatura(response.data[0]?.total_licenciaturas || 0);
                })
                .catch(error => {
                    console.log(error)
                })
        }
        fetchDataLicenciatura()
        const interval = setInterval(fetchDataLicenciatura, 30000);
        return () =>{
            clearInterval(interval)
        }
    },[]);

    useEffect(()=>{
        const fetchDataDisciplina = () =>{
            Axios.get('http://localhost:8080/get/totaldisciplina')
                .then(response => {
                    setDisciplina(response.data[0]?.total_disciplinas || 0);
                })
                .catch(error => {
                    console.log(error)
                })
        }
        fetchDataDisciplina()
        const interval = setInterval(fetchDataDisciplina, 30000);
        return () =>{
            clearInterval(interval)
        }
    },[]);

    useEffect(() => {
        const fetchDataGraficos = () => {
            Axios.get('http://localhost:8080/get/dadosGraficosCategoria')
                .then(response => {
                    const dadosFormatados = response.data.map((item) => ({
                        cursos: item.total_cursos,
                        departamento: item.categoriacurso,
                        valor: item.total_cursos
                    }));
                    
                    setDadosGrafico(dadosFormatados);
                    
                    // Dados para gráfico comparativo de proporções
                    const totalCursos = response.data.reduce((acc, curr) => acc + curr.total_cursos, 0);
                    const comparativo = response.data.map((item) => ({
                        departamento: item.categoriacurso,
                        proporcao: ((item.total_cursos / totalCursos) * 100).toFixed(1),
                        peso: item.total_cursos
                    }));
                    setDadosComparativos(comparativo);
                })
                .catch(error => {
                    console.log(error);
                    setDadosGrafico([]);
                });
        }
        
        fetchDataGraficos();
        const interval = setInterval(fetchDataGraficos, 30000);
        
        return () => {
            clearInterval(interval);
        }
    }, []);

    // useEffect para buscar disciplinas por curso
    useEffect(() => {
        const fetchDisciplinasPorCurso = () => {
            Axios.get('http://localhost:8080/get/totalDisciplinasPorCurso')
                .then(response => {
                    setDadosDisciplinasPorCurso(response.data);
                })
                .catch(error => {
                    console.log("Erro ao buscar disciplinas por curso:", error);
                    setDadosDisciplinasPorCurso([]);
                });
        }
        
        fetchDisciplinasPorCurso();
        const interval = setInterval(fetchDisciplinasPorCurso, 30000);
        
        return () => {
            clearInterval(interval);
        }
    }, []);

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
                <main className="p-4" style={{ backgroundColor: '#f8f9fa' }}>
                    {/* Header Section */}
                    <div className="row mb-4">
                        <div className="col-12">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h2 style={{ color: 'var(--azul-escuro)', fontWeight: '600' }}>
                                        Dashboard de Cursos
                                    </h2>
                                    <p className="text-muted mb-0">
                                        Bem-vindo, {user ? user.nome : 'Administrador'} | Análise completa
                                    </p>
                                </div>
                                <div className="d-flex align-items-center gap-3">
                                    <div className="text-muted small">
                                        <FaClock className="me-1" />
                                        Última atualização: {ultimaAtualizacao.toLocaleString('pt-BR')}
                                    </div>
                                    <div className="badge p-3" style={{ backgroundColor: 'var(--azul-escuro)' }}>
                                        <FaUniversity size={24} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Botões de Navegação */}
                    <div className="row mb-4 g-2">
                        <div className="col-md-3">
                            <button 
                                className={`btn w-100 ${secaoAtiva === "geral" ? `${Style.botoesGestaoCurso}`  : `${Style.botoesGestaoCursoD}`}`}
                                onClick={() => setSecaoAtiva("geral")}
                            >
                                <FaChartBar className="me-2" />
                                Painel Geral de Cursos
                            </button>
                        </div>
                        <div className="col-md-2">
                            <button 
                                className={`btn w-100 ${secaoAtiva === "departamentos" ? `${Style.botoesGestaoCurso}`  : `${Style.botoesGestaoCursoD}`}`}
                                onClick={() => setSecaoAtiva("departamentos")}
                            >
                                <FaLayerGroup className="me-2" />
                                Departamentos
                            </button>
                        </div>
                        <div className="col-md-3">
                            <button 
                                className={`btn w-100 ${secaoAtiva === "cursos" ? `${Style.botoesGestaoCurso}`  : `${Style.botoesGestaoCursoD}`}`}
                                onClick={() => setSecaoAtiva("cursos")}
                            >
                                <FaGraduationCap className="me-2" />
                                Licenciaturas/Cursos
                            </button>
                        </div>
                        <div className="col-md-2">
                            <button 
                                className={`btn w-100 ${secaoAtiva === "disciplinas" ? `${Style.botoesGestaoCurso}`  : `${Style.botoesGestaoCursoD}`}`}
                                onClick={() => setSecaoAtiva("disciplinas")}
                                style={{ padding: '12px', fontWeight: '500' }}
                            >
                                <FaBook className="me-2" />
                                Disciplinas
                            </button>
                        </div>
                        <div className="col-md-2">
                            <button 
                                className={`btn w-100 ${secaoAtiva === "outros" ? `${Style.botoesGestaoCurso}`  : `${Style.botoesGestaoCursoD}`}`}
                                onClick={() => setSecaoAtiva("outros")}
                                style={{ padding: '12px', fontWeight: '500' }}
                            >
                                <MdAdd className="me-2" />
                                Outros Registros
                            </button>
                        </div>
                    </div>

                    {/* Seção Painel Geral (todos os gráficos) */}
                    {secaoAtiva === "geral" && (
                        <>
                            {/* Cards Estatísticos */}
                            <div className="row mb-4 g-3">
                                {/* Card Departamentos */}
                                <div className="col-md-4">
                                    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '15px', background: 'linear-gradient(135deg, #003366 0%, #1a4d80 100%)' }}>
                                        <div className="card-body">
                                            <div className="d-flex justify-content-between align-items-start mb-3">
                                                <div>
                                                    <h6 className="text-white-50 mb-2">Departamentos</h6>
                                                    <h2 className="text-white mb-0" style={{ fontSize: '2.5rem', fontWeight: '700' }}>
                                                        {departamento}
                                                    </h2>
                                                </div>
                                                <div className="bg-white bg-opacity-25 p-3 rounded-circle">
                                                    <FaLayerGroup size={28} color="white" />
                                                </div>
                                            </div>
                                            <p className="text-white-50 small mb-0">Unidades acadêmicas ativas</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Card Licenciaturas (Cursos) */}
                                <div className="col-md-4">
                                    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '15px', background: 'linear-gradient(135deg, #B8860B 0%, #DAA520 100%)' }}>
                                        <div className="card-body">
                                            <div className="d-flex justify-content-between align-items-start mb-3">
                                                <div>
                                                    <h6 className="text-white-50 mb-2">Total de Cursos</h6>
                                                    <h2 className="text-white mb-0" style={{ fontSize: '2.5rem', fontWeight: '700' }}>
                                                        {licenciatura}
                                                    </h2>
                                                </div>
                                                <div className="bg-white bg-opacity-25 p-3 rounded-circle">
                                                    <FaGraduationCap size={28} color="white" />
                                                </div>
                                            </div>
                                            <p className="text-white-50 small mb-0">Cursos oferecidos pela instituição</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Card Disciplinas */}
                                <div className="col-md-4">
                                    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '15px', background: 'linear-gradient(135deg, #4A90E2 0%, #6AA6E8 100%)' }}>
                                        <div className="card-body">
                                            <div className="d-flex justify-content-between align-items-start mb-3">
                                                <div>
                                                    <h6 className="text-white-50 mb-2">Disciplinas</h6>
                                                    <h2 className="text-white mb-0" style={{ fontSize: '2.5rem', fontWeight: '700' }}>
                                                        {disciplina}
                                                    </h2>
                                                </div>
                                                <div className="bg-white bg-opacity-25 p-3 rounded-circle">
                                                    <FaBook size={28} color="white" />
                                                </div>
                                            </div>
                                            <p className="text-white-50 small mb-0">Componentes curriculares ofertados</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* GRÁFICO 1 - Pizza (Distribuição Percentual) */}
                            <div className="row g-4 mb-4">
                                <div className="col-md-6">
                                    <div className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                                        <div className="card-header bg-white border-0 pt-4 px-4">
                                            <div className="d-flex align-items-center gap-2">
                                                <FaChartPie size={20} color="#B8860B" />
                                                <h5 className="mb-0" style={{ color: 'var(--azul-escuro)', fontWeight: '600' }}>
                                                    Gráfico 1: Distribuição Percentual de Cursos
                                                </h5>
                                            </div>
                                            <p className="text-muted small mb-0">Participação de cada departamento no total de cursos</p>
                                        </div>
                                        <div className="card-body">
                                            <ResponsiveContainer width="100%" height={350}>
                                                <PieChart>
                                                    <Pie
                                                        data={dadosGrafico}
                                                        cx="50%"
                                                        cy="50%"
                                                        labelLine={true}
                                                        label={({ departamento, percent }) => `${departamento}: ${(percent * 100).toFixed(0)}%`}
                                                        outerRadius={120}
                                                        fill="#8884d8"
                                                        dataKey="cursos"
                                                        labelStyle={{ fontSize: '10px', fill: '#333' }}
                                                    >
                                                        {dadosGrafico.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip 
                                                        content={({ active, payload }) => {
                                                            if (active && payload && payload.length) {
                                                                const data = payload[0].payload;
                                                                const totalCursos = dadosGrafico.reduce((acc, curr) => acc + curr.cursos, 0);
                                                                const percentual = ((data.cursos / totalCursos) * 100).toFixed(1);
                                                                
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
                                                                            {data.departamento}
                                                                        </p>
                                                                        <p style={{ margin: '5px 0 0 0', color: '#666' }}>
                                                                            Cursos: <strong>{data.cursos}</strong>
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
                                        </div>
                                    </div>
                                </div>

                                {/* GRÁFICO 2 - Barras (Cursos por Departamento) */}
                                <div className="col-md-6">
                                    <div className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                                        <div className="card-header bg-white border-0 pt-4 px-4">
                                            <div className="d-flex align-items-center gap-2">
                                                <FaChartBar size={20} color="#003366" />
                                                <h5 className="mb-0" style={{ color: 'var(--azul-escuro)', fontWeight: '600' }}>
                                                    Gráfico 2: Volume de Cursos por Departamento
                                                </h5>
                                            </div>
                                            <p className="text-muted small mb-0">Quantidade absoluta de cursos em cada unidade</p>
                                        </div>
                                        <div className="card-body">
                                            <ResponsiveContainer width="100%" height={350}>
                                                <BarChart data={dadosGrafico} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                                    <XAxis dataKey="departamento" tick={{ fill: '#666', fontSize: 12 }} />
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
                                                    <Bar dataKey="cursos" fill="#003366" name="Total de Cursos" radius={[5,5,0,0]}>
                                                        {dadosGrafico.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
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
                                            <p className="text-muted small mb-0">Relação entre quantidade de cursos e participação percentual</p>
                                        </div>
                                        <div className="card-body">
                                            <ResponsiveContainer width="100%" height={350}>
                                                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                                    <XAxis 
                                                        type="number" 
                                                        dataKey="peso" 
                                                        name="Cursos" 
                                                        unit=" cursos" 
                                                        tick={{ fill: '#666', fontSize: 12 }}
                                                        label={{ value: 'Quantidade de Cursos', position: 'bottom', fill: '#666', fontSize: 11 }}
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
                                                                            {data.departamento}
                                                                        </p>
                                                                        <p style={{ margin: '5px 0 0 0', color: '#666' }}>
                                                                            Cursos: <strong>{data.peso}</strong>
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
                                                        name="Departamentos" 
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
                                        </div>
                                    </div>
                                </div>

                                {/* GRÁFICO 4 - Disciplinas por Curso (Barras Horizontais) */}
                                <div className="col-md-6">
                                    <div className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                                        <div className="card-header bg-white border-0 pt-4 px-4">
                                            <div className="d-flex align-items-center gap-2">
                                                <FaBook size={20} color="#4A90E2" />
                                                <h5 className="mb-0" style={{ color: 'var(--azul-escuro)', fontWeight: '600' }}>
                                                    Gráfico 4: Total de Disciplinas por Curso
                                                </h5>
                                            </div>
                                            <p className="text-muted small mb-0">Quantidade de disciplinas em cada curso (Top 10)</p>
                                        </div>
                                        <div className="card-body">
                                            <ResponsiveContainer width="100%" height={350}>
                                                <BarChart 
                                                    data={dadosDisciplinasPorCurso.slice(0, 10)} 
                                                    margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                                                    layout="vertical"
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                                    <XAxis type="number" tick={{ fill: '#666', fontSize: 12 }} />
                                                    <YAxis 
                                                        type="category" 
                                                        dataKey="curso" 
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
                                                        formatter={(value) => [`${value} disciplinas`, 'Total']}
                                                    />
                                                    <Legend />
                                                    <Bar 
                                                        dataKey="total_disciplinas" 
                                                        fill="#4A90E2" 
                                                        name="Total de Disciplinas"
                                                        radius={[0, 5, 5, 0]}
                                                    >
                                                        {dadosDisciplinasPorCurso.slice(0, 10).map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Ranking de Cursos por Número de Disciplinas */}
                            <div className="row mt-4">
                                <div className="col-12">
                                    <div className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                                        <div className="card-header bg-white border-0 pt-4 px-4">
                                            <h5 className="mb-0" style={{ color: 'var(--azul-escuro)', fontWeight: '600' }}>
                                                Ranking de Cursos por Número de Disciplinas
                                            </h5>
                                            <p className="text-muted small mb-0">Os 10 cursos com mais disciplinas</p>
                                        </div>
                                        <div className="card-body">
                                            <div className="table-responsive">
                                                <table className="table table-hover">
                                                    <thead>
                                                        <tr>
                                                            <th>#</th>
                                                            <th>Curso</th>
                                                            <th className="text-center">Total de Disciplinas</th>
                                                            <th className="text-center">Participação no Total</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {dadosDisciplinasPorCurso.slice(0, 10).map((item, index) => {
                                                            const totalGeral = dadosDisciplinasPorCurso.reduce((acc, curr) => acc + curr.total_disciplinas, 0);
                                                            const percentual = totalGeral > 0 ? ((item.total_disciplinas / totalGeral) * 100).toFixed(1) : 0;
                                                            
                                                            return (
                                                                <tr key={item.idcurso}>
                                                                    <td>
                                                                        <span className={`badge bg-${index < 3 ? 'warning' : 'secondary'} text-dark`} style={{ fontSize: '14px', padding: '8px 12px' }}>
                                                                            {index + 1}º
                                                                        </span>
                                                                    </td>
                                                                    <td style={{ color: COLORS[index % COLORS.length], fontWeight: '500' }}>
                                                                        {item.curso}
                                                                    </td>
                                                                    <td className="text-center fw-bold">{item.total_disciplinas}</td>
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
                                                                </tr>
                                                            );
                                                        })}
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
                                                <div className="col-md-3">
                                                    <p className="small mb-2">
                                                        <span style={{ color: '#B8860B', fontWeight: 'bold' }}>●</span> 
                                                        <strong> Gráfico 1 (Pizza):</strong> Distribuição percentual de cursos por departamento
                                                    </p>
                                                </div>
                                                <div className="col-md-3">
                                                    <p className="small mb-2">
                                                        <span style={{ color: '#003366', fontWeight: 'bold' }}>●</span> 
                                                        <strong> Gráfico 2 (Barras):</strong> Volume absoluto de cursos por departamento
                                                    </p>
                                                </div>
                                                <div className="col-md-3">
                                                    <p className="small mb-2">
                                                        <span style={{ color: '#50C878', fontWeight: 'bold' }}>●</span> 
                                                        <strong> Gráfico 3 (Dispersão):</strong> Relação peso vs proporção dos departamentos
                                                    </p>
                                                </div>
                                                <div className="col-md-3">
                                                    <p className="small mb-2">
                                                        <span style={{ color: '#4A90E2', fontWeight: 'bold' }}>●</span> 
                                                        <strong> Gráfico 4 (Barras Horizontais):</strong> Disciplinas por Curso (Top 10)
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Seção Departamentos */}
                    {secaoAtiva === "departamentos" && (
                        <DepartamentoEdit />
                    )}

                    {/* Seção Cursos */}
                    {secaoAtiva === "cursos" && (
                        <CursoEdit />
                    )}

                    {/* Seção Disciplinas */}
                    {secaoAtiva === "disciplinas" && (
                        <DisciplinasEdit />
                    )}
                    {secaoAtiva === "outros" && (
                        <OutrosRegistros />
                    )}
                </main>
            </div>
        </div>
    );
}

export default HomeAdm;