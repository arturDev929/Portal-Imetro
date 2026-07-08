import { useState, useEffect } from "react";
import api from "../service/api";
import AdminLayout from "../layouts/AdminLayout";
import Style from "./GestaoCursoAdm.module.css";
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar,
  ScatterChart, Scatter
} from 'recharts';
import { 
  FaUniversity, FaBook, FaLayerGroup, FaGraduationCap,
  FaClock, FaChartBar, FaChartPie, FaChartLine, FaUsers,
  FaChalkboardTeacher, FaUserGraduate, FaRegClock
} from 'react-icons/fa';
import CursoEdit from "./components/CursosEdit";
import DepartamentoEdit from "./components/DepartamentosEdit";
import DisciplinasEdit from "./components/DisciplinasEdit";
import { MdAdd, MdFlightClass, MdRefresh, MdSchool, MdAssignment } from "react-icons/md";
import OutrosRegistros from "./components/OutrosRegistros";
import TurmasAdm from "./components/TurmasAdm";

function GestaoCursoAdm() {
    const [user, setUser] = useState(null);
    const [departamento, setDepartamento] = useState(0);
    const [licenciatura, setLicenciatura] = useState(0);
    const [disciplina, setDisciplina] = useState(0);
    const [dadosGrafico, setDadosGrafico] = useState([]);
    const [dadosComparativos, setDadosComparativos] = useState([]);
    const [dadosDisciplinasPorCurso, setDadosDisciplinasPorCurso] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ultimaAtualizacao, setUltimaAtualizacao] = useState(new Date());
    
    // ==================== ESTADOS PARA TURMAS ====================
    const [totalTurmas, setTotalTurmas] = useState(0);
    const [totalPeriodos, setTotalPeriodos] = useState(0);
    const [totalTurmasAtivas, setTotalTurmasAtivas] = useState(0);
    const [totalTurmasDesativadas, setTotalTurmasDesativadas] = useState(0);
    const [totalTurmasSemAno, setTotalTurmasSemAno] = useState(0);
    const [dadosTurmasPorCurso, setDadosTurmasPorCurso] = useState([]);
    const [dadosTurmasPorPeriodo, setDadosTurmasPorPeriodo] = useState([]);
    const [dadosTurmasPorAnoLetivo, setDadosTurmasPorAnoLetivo] = useState([]);
    const [loadingTurmas, setLoadingTurmas] = useState(false);
    
    const [secaoAtiva, setSecaoAtiva] = useState("geral");

    const COLORS = ['#003366', '#B8860B', '#4A90E2', '#50C878', '#DC143C', '#FF8C00', '#9370DB', '#20B2AA', '#FF69B4', '#CD5C5C'];

    useEffect(() => {
        const fetchDepartamento = () => {
            api.get(`/totalcategoriacurso`)
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
            api.get(`/totallicenciaturas`)
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
            api.get(`/totaldisciplina`)
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
            api.get(`/dadosGraficosCategoria`)
                .then(response => {
                    const dadosFormatados = response.data.map((item) => ({
                        cursos: item.total_cursos,
                        departamento: item.categoria,
                        valor: item.total_cursos
                    }));
                    
                    setDadosGrafico(dadosFormatados);
                    
                    const totalCursos = response.data.reduce((acc, curr) => acc + curr.total_cursos, 0);
                    const comparativo = response.data.map((item) => ({
                        departamento: item.categoria,
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

    useEffect(() => {
        const fetchDisciplinasPorCurso = () => {
            api.get(`/totalDisciplinasPorCurso`)
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

    // ==================== BUSCAR DADOS DE TURMAS ====================
    useEffect(() => {
        const fetchDadosTurmas = async () => {
            setLoadingTurmas(true);
            try {
                const response = await api.get('/turmasCompletas');
                const dados = response.data || [];
                
                const ativas = dados.filter(item => item.status_anoletivo === 'Ativo');
                const desativadas = dados.filter(item => item.status_anoletivo === 'Desativado');
                const semAno = dados.filter(item => item.status_anoletivo === 'Sem Ano Letivo' || !item.anoletivo);
                
                setTotalTurmas(dados.length);
                setTotalTurmasAtivas(ativas.length);
                setTotalTurmasDesativadas(desativadas.length);
                setTotalTurmasSemAno(semAno.length);
                
                const periodosUnicos = new Set(dados.map(item => item.id_periodo));
                setTotalPeriodos(periodosUnicos.size);
                
                const turmasPorCurso = dados.reduce((acc, item) => {
                    const key = item.curso || 'Sem curso';
                    if (!acc[key]) {
                        acc[key] = { curso: key, total: 0, ativas: 0, desativadas: 0, semAno: 0 };
                    }
                    acc[key].total++;
                    if (item.status_anoletivo === 'Ativo') acc[key].ativas++;
                    else if (item.status_anoletivo === 'Desativado') acc[key].desativadas++;
                    else acc[key].semAno++;
                    return acc;
                }, {});
                
                const dadosTurmasPorCursoArray = Object.values(turmasPorCurso)
                    .sort((a, b) => b.total - a.total)
                    .slice(0, 10);
                setDadosTurmasPorCurso(dadosTurmasPorCursoArray);
                
                const turmasPorPeriodo = dados.reduce((acc, item) => {
                    const key = item.periodo || 'Sem período';
                    if (!acc[key]) {
                        acc[key] = { periodo: key, total: 0 };
                    }
                    acc[key].total++;
                    return acc;
                }, {});
                
                const dadosTurmasPorPeriodoArray = Object.values(turmasPorPeriodo)
                    .sort((a, b) => b.total - a.total);
                setDadosTurmasPorPeriodo(dadosTurmasPorPeriodoArray);
                
                const turmasPorAnoLetivo = dados.reduce((acc, item) => {
                    const key = item.anoletivo || 'Sem ano letivo';
                    if (!acc[key]) {
                        acc[key] = { ano: key, total: 0 };
                    }
                    acc[key].total++;
                    return acc;
                }, {});
                
                const dadosTurmasPorAnoLetivoArray = Object.values(turmasPorAnoLetivo)
                    .sort((a, b) => {
                        if (a.ano === 'Sem ano letivo') return 1;
                        if (b.ano === 'Sem ano letivo') return -1;
                        return b.ano.localeCompare(a.ano);
                    })
                    .slice(0, 8);
                setDadosTurmasPorAnoLetivo(dadosTurmasPorAnoLetivoArray);
                
            } catch (error) {
                console.error("Erro ao buscar dados de turmas:", error);
            } finally {
                setLoadingTurmas(false);
            }
        };
        
        fetchDadosTurmas();
        const interval = setInterval(fetchDadosTurmas, 60000);
        
        return () => {
            clearInterval(interval);
        }
    }, []);

    if (loading) {
        return (
            <div className={`container-fluid ${Style.gestaoCursos} p-0 m-0`}>
                <div className="col-md-9 ms-md-auto col-lg-10 px-0">
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
        <AdminLayout>
            <div style={{ backgroundColor: 'var(--cinza-claro)' }}>
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
                                className={`btn w-100 ${secaoAtiva === "departamentos" ? `${Style.botoesGestaoCurso}`  : `${Style.botoesGestaoCursoD}`}`}
                                onClick={() => setSecaoAtiva("departamentos")}
                            >
                                <FaLayerGroup className="me-2 mb-1" />
                                Departamentos
                            </button>
                        </div>
                        <div className="col-md-2">
                            <button 
                                className={`btn w-100 ${secaoAtiva === "cursos" ? `${Style.botoesGestaoCurso}`  : `${Style.botoesGestaoCursoD}`}`}
                                onClick={() => setSecaoAtiva("cursos")}
                            >
                                <FaGraduationCap className="me-2 mb-1" />
                                Licenciaturas
                            </button>
                        </div>
                        <div className="col-md-2">
                            <button 
                                className={`btn w-100 ${secaoAtiva === "disciplinas" ? `${Style.botoesGestaoCurso}`  : `${Style.botoesGestaoCursoD}`}`}
                                onClick={() => setSecaoAtiva("disciplinas")}
                                style={{ padding: '12px', fontWeight: '500' }}
                            >
                                <FaBook className="me-2 mb-1" />
                                Disciplinas
                            </button>
                        </div>
                        <div className="col-md-2">
                            <button 
                                className={`btn w-100 ${secaoAtiva === "turmas" ? `${Style.botoesGestaoCurso}`  : `${Style.botoesGestaoCursoD}`}`}
                                onClick={() => setSecaoAtiva("turmas")}
                                style={{ padding: '12px', fontWeight: '500' }}
                            >
                                <MdFlightClass className="me-2 mb-1" />
                                Turmas
                                {totalTurmas > 0 && (
                                    <span className="badge bg-danger ms-1">{totalTurmas}</span>
                                )}
                            </button>
                        </div>
                        <div className="col-md-2">
                            <button 
                                className={`btn w-100 ${secaoAtiva === "outros" ? `${Style.botoesGestaoCurso}`  : `${Style.botoesGestaoCursoD}`}`}
                                onClick={() => setSecaoAtiva("outros")}
                                style={{ padding: '12px', fontWeight: '500' }}
                            >
                                <MdAdd className="me-2 mb-1" />
                                Outros Registros
                            </button>
                        </div>
                    </div>

                    {secaoAtiva === "geral" && (
                        <>
                            <div className="row mb-4 g-3">
                                <div className="col-md-3">
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
                                                    <FaLayerGroup size={28} />
                                                </div>
                                            </div>
                                            <p className="text-white-50 small mb-0">Unidades acadêmicas ativas</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-3">
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
                                                    <FaGraduationCap size={28} />
                                                </div>
                                            </div>
                                            <p className="text-white-50 small mb-0">Cursos oferecidos pela instituição</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-3">
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
                                                    <FaBook size={28} />
                                                </div>
                                            </div>
                                            <p className="text-white-50 small mb-0">Componentes curriculares ofertados</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-3">
                                    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '15px', background: 'linear-gradient(135deg, #50C878 0%, #6DD89A 100%)' }}>
                                        <div className="card-body">
                                            <div className="d-flex justify-content-between align-items-start mb-3">
                                                <div>
                                                    <h6 className="text-white-50 mb-2">Total de Turmas</h6>
                                                    <h2 className="text-white mb-0" style={{ fontSize: '2.5rem', fontWeight: '700' }}>
                                                        {totalTurmas}
                                                    </h2>
                                                </div>
                                                <div className="bg-white bg-opacity-25 p-3 rounded-circle">
                                                    <FaChalkboardTeacher size={28} />
                                                </div>
                                            </div>
                                            <p className="text-white-50 small mb-0">
                                                {totalTurmasAtivas} ativas • {totalTurmasDesativadas} desativadas
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

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

                            {/* ==================== SEÇÃO DE TURMAS NO PAINEL GERAL ==================== */}
                            <div className="row g-4 mb-4">
                                <div className="col-12">
                                    <div className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                                        <div className="card-header bg-white border-0 pt-4 px-4">
                                            <div className="d-flex align-items-center justify-content-between">
                                                <div className="d-flex align-items-center gap-2">
                                                    <FaChalkboardTeacher size={20} color="#003366" />
                                                    <h5 className="mb-0" style={{ color: 'var(--azul-escuro)', fontWeight: '600' }}>
                                                        Estatísticas de Turmas
                                                    </h5>
                                                </div>
                                                <button 
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={() => setSecaoAtiva("turmas")}
                                                >
                                                    <MdFlightClass className="me-1" />
                                                    Gerenciar Turmas
                                                </button>
                                            </div>
                                            <p className="text-muted small mb-0">Visão geral das turmas cadastradas</p>
                                        </div>
                                        <div className="card-body">
                                            <div className="row g-3 mb-4">
                                                <div className="col-md-3">
                                                    <div className="p-3 rounded-3 text-center" style={{ backgroundColor: '#f8f9fa' }}>
                                                        <h3 className="mb-1" style={{ color: '#003366' }}>{totalTurmas}</h3>
                                                        <small className="text-muted">Total de Turmas</small>
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="p-3 rounded-3 text-center" style={{ backgroundColor: '#e8f5e9' }}>
                                                        <h3 className="mb-1" style={{ color: '#2e7d32' }}>{totalTurmasAtivas}</h3>
                                                        <small className="text-muted">Turmas Ativas</small>
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="p-3 rounded-3 text-center" style={{ backgroundColor: '#fce4ec' }}>
                                                        <h3 className="mb-1" style={{ color: '#c62828' }}>{totalTurmasDesativadas}</h3>
                                                        <small className="text-muted">Turmas Desativadas</small>
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="p-3 rounded-3 text-center" style={{ backgroundColor: '#fff3e0' }}>
                                                        <h3 className="mb-1" style={{ color: '#e65100' }}>{totalTurmasSemAno}</h3>
                                                        <small className="text-muted">Sem Ano Letivo</small>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="row">
                                                <div className="col-md-6">
                                                    <h6 className="mb-3" style={{ color: '#003366' }}>
                                                        <FaChartBar className="me-2" />
                                                        Turmas por Período
                                                    </h6>
                                                    <ResponsiveContainer width="100%" height={200}>
                                                        <BarChart data={dadosTurmasPorPeriodo}>
                                                            <CartesianGrid strokeDasharray="3 3" />
                                                            <XAxis dataKey="periodo" tick={{ fontSize: 11 }} />
                                                            <YAxis tick={{ fontSize: 11 }} />
                                                            <Tooltip />
                                                            <Bar dataKey="total" fill="#003366" name="Total de Turmas" radius={[5,5,0,0]}>
                                                                {dadosTurmasPorPeriodo.map((entry, index) => (
                                                                    <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                                                                ))}
                                                            </Bar>
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                                <div className="col-md-6">
                                                    <h6 className="mb-3" style={{ color: '#003366' }}>
                                                        <FaChartPie className="me-2" />
                                                        Turmas por Ano Letivo
                                                    </h6>
                                                    <ResponsiveContainer width="100%" height={200}>
                                                        <PieChart>
                                                            <Pie
                                                                data={dadosTurmasPorAnoLetivo}
                                                                cx="50%"
                                                                cy="50%"
                                                                labelLine={false}
                                                                label={({ ano, percent }) => `${ano}: ${(percent * 100).toFixed(0)}%`}
                                                                outerRadius={80}
                                                                fill="#8884d8"
                                                                dataKey="total"
                                                                labelStyle={{ fontSize: '9px' }}
                                                            >
                                                                {dadosTurmasPorAnoLetivo.map((entry, index) => (
                                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                                ))}
                                                            </Pie>
                                                            <Tooltip />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>

                                            {dadosTurmasPorCurso.length > 0 && (
                                                <div className="mt-4">
                                                    <h6 className="mb-3" style={{ color: '#003366' }}>
                                                        <FaGraduationCap className="me-2" />
                                                        Turmas por Curso (Top 10)
                                                    </h6>
                                                    <div className="table-responsive">
                                                        <table className="table table-sm table-hover">
                                                            <thead>
                                                                <tr>
                                                                    <th>#</th>
                                                                    <th>Curso</th>
                                                                    <th className="text-center">Total</th>
                                                                    <th className="text-center">Ativas</th>
                                                                    <th className="text-center">Desativadas</th>
                                                                    <th className="text-center">Sem Ano</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {dadosTurmasPorCurso.map((item, index) => (
                                                                    <tr key={index}>
                                                                        <td>{index + 1}º</td>
                                                                        <td>{item.curso}</td>
                                                                        <td className="text-center fw-bold">{item.total}</td>
                                                                        <td className="text-center text-success">{item.ativas || 0}</td>
                                                                        <td className="text-center text-danger">{item.desativadas || 0}</td>
                                                                        <td className="text-center text-warning">{item.semAno || 0}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

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
                                            <div className="row mt-2">
                                                <div className="col-12">
                                                    <p className="small mb-0 text-muted">
                                                        <span style={{ color: '#003366', fontWeight: 'bold' }}>●</span> 
                                                        <strong> Estatísticas de Turmas:</strong> Visão geral de turmas por período, ano letivo e curso
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {secaoAtiva === "departamentos" && (
                        <DepartamentoEdit />
                    )}

                    {secaoAtiva === "cursos" && (
                        <CursoEdit />
                    )}

                    {secaoAtiva === "disciplinas" && (
                        <DisciplinasEdit />
                    )}
                    
                    {secaoAtiva === "turmas" && (
                        <TurmasAdm />
                    )}
                    
                    {secaoAtiva === "outros" && (
                        <OutrosRegistros />
                    )}
            </div>
        </AdminLayout>
    );
}

export default GestaoCursoAdm;