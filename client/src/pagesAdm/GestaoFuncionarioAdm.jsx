import { useState, useEffect } from "react";
import Axios from "axios";
import SidebarAdm from "../components/SidebarAdm";
import NavbarAdm from "../components/NavbarAdm";
import Style from "./GestaoCursoAdm.module.css";
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { 
  FaUsers, FaPhone, FaChartBar, FaChartPie,
  FaClock, FaUserSlash, FaExclamationTriangle, FaUserTie
} from 'react-icons/fa';
import { IoMdPeople } from "react-icons/io";
import FuncionarioEdit from "../components/FuncionarioEdit";
import FuncionarioRemovidosEdit from "../components/FuncionarioRemovidosEdit";

function GestaoFuncionariosAdm() {
    const [user, setUser] = useState(null);
    const [totalFuncionarios, setTotalFuncionarios] = useState(0);
    // const [funcionariosComBI, setFuncionariosComBI] = useState(0);
    // const [funcionariosComContacto, setFuncionariosComContacto] = useState(0);
    const [loading, setLoading] = useState(true);
    const [ultimaAtualizacao, setUltimaAtualizacao] = useState(new Date());
    const [funcionariosRecentes, setFuncionariosRecentes] = useState([]);
    const [totalFuncionariosDesativados, setTotalFuncionariosDesativados] = useState(0);
    const [funcionariosDesativados, setFuncionariosDesativados] = useState([]);
    const [dadosGrafico, setDadosGrafico] = useState([]);
    const [erroDesativados, setErroDesativados] = useState(false);
    const [dadosComparativos, setDadosComparativos] = useState([]);
    const [dadosCargos, setDadosCargos] = useState([]);
    const [secaoAtiva, setSecaoAtiva] = useState("geral");

    const COLORS = ['#003366', '#B8860B', '#4A90E2', '#50C878', '#DC143C', '#FF8C00', '#9370DB', '#20B2AA'];

    useEffect(() => {
        const usuarioSalvo = localStorage.getItem("usuarioLogado");
        if (usuarioSalvo) {
            setUser(JSON.parse(usuarioSalvo));
        }
    }, []);

    useEffect(() => {
        const fetchDadosFuncionarios = () => {
            setLoading(true);
            setErroDesativados(false);
            
            Axios.get('http://localhost:8080/get/estatisticasFuncionarios')
                .then(response => {
                    setTotalFuncionarios(response.data.totalFuncionarios || 0);
                    // setFuncionariosComBI(response.data.funcionariosComBI || 0);
                    // setFuncionariosComContacto(response.data.funcionariosComContacto || 0);
                    setUltimaAtualizacao(new Date());
                })
                .catch(error => {
                    console.error('Erro ao buscar estatísticas:', error);
                });

            Axios.get('http://localhost:8080/get/estatisticasFuncionariosDesativados')
                .then(response => {
                    setTotalFuncionariosDesativados(response.data.totalFuncionariosDesativados || 0);
                })
                .catch(error => {
                    console.error('Erro ao buscar estatísticas de desativados:', error);
                    setErroDesativados(true);
                });

            Axios.get('http://localhost:8080/get/dashboardFuncionarios')
                .then(response => {
                    if (response.data && response.data.dadosGrafico) {
                        setDadosGrafico(response.data.dadosGrafico);
                        setDadosComparativos([
                            {
                                nome: 'Ativos',
                                quantidade: response.data.ativos,
                                percentual: response.data.percentAtivos
                            },
                            {
                                nome: 'Desativados',
                                quantidade: response.data.desativados,
                                percentual: response.data.percentDesativados
                            }
                        ]);
                    }
                })
                .catch(error => {
                    console.log("Erro no dashboard:", error);
                });

            Axios.get('http://localhost:8080/get/cargosFuncionarios')
                .then(response => {
                    setDadosCargos(response.data || []);
                })
                .catch(error => {
                    console.log("Erro ao buscar cargos:", error);
                });

            Axios.get('http://localhost:8080/get/funcionarios')
                .then(response => {
                    const recentes = response.data
                        .sort((a, b) => b.id_funcionario - a.id_funcionario)
                        .slice(0, 5);
                    setFuncionariosRecentes(recentes);
                })
                .catch(error => console.log("Erro funcionários recentes:", error));

            Axios.get('http://localhost:8080/get/funcionariosDesativados')
                .then(response => {
                    setFuncionariosDesativados(response.data || []);
                })
                .catch(error => console.log("Erro lista desativados:", error));

            setLoading(false);
        };

        fetchDadosFuncionarios();
        const interval = setInterval(fetchDadosFuncionarios, 30000);
        
        return () => {
            clearInterval(interval);
        };
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
                <main className="p-4" style={{ backgroundColor: 'var(--cinza-claro)' }}>
                    <div className="row mb-4">
                        <div className="col-12">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h2 style={{ color: 'var(--azul-escuro)', fontWeight: '600' }}>
                                        Dashboard de Funcionários
                                    </h2>
                                    <p className="text-muted mb-0">
                                        Bem-vindo, {user ? user.nome : 'Administrador'} | Gestão do corpo administrativo
                                    </p>
                                </div>
                                <div className="d-flex align-items-center gap-3">
                                    <div className="text-muted small">
                                        <FaClock className="me-1" />
                                        Última atualização: {ultimaAtualizacao.toLocaleString('pt-BR')}
                                    </div>
                                    <div className="badge p-3" style={{ backgroundColor: 'var(--azul-escuro)' }}>
                                        <FaUsers size={24} color="white" />
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
                                className={`btn w-100 ${secaoAtiva === "funcionarios" ? `${Style.botoesGestaoCurso}`  : `${Style.botoesGestaoCursoD}`}`}
                                onClick={() => setSecaoAtiva("funcionarios")}
                            >
                                <FaUserTie className="me-2 mb-1" />
                                Gestão de Funcionários
                            </button>
                        </div>
                        <div className="col-md-2">
                            <button 
                                className={`btn w-100 ${secaoAtiva === "funcionariosRemovidos" ? `${Style.botoesGestaoCurso}`  : `${Style.botoesGestaoCursoD}`}`}
                                onClick={() => setSecaoAtiva("funcionariosRemovidos")}
                            >
                                <FaUserSlash className="me-2 mb-1" />
                                Funcionários Removidos
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
                                                    <h6 className="text-white-50 mb-2">Total de Funcionários</h6>
                                                    <h2 className="text-white mb-0" style={{ fontSize: '2.5rem', fontWeight: '700' }}>
                                                        {totalFuncionarios}
                                                    </h2>
                                                </div>
                                                <div className="bg-white bg-opacity-25 p-3 rounded-circle">
                                                    <IoMdPeople size={28} color="white" />
                                                </div>
                                            </div>
                                            <p className="text-white-50 small mb-0">Funcionários ativos</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-3">
                                    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '15px', background: 'linear-gradient(135deg, #DC143C 0%, #FF4500 100%)' }}>
                                        <div className="card-body">
                                            <div className="d-flex justify-content-between align-items-start mb-3">
                                                <div>
                                                    <h6 className="text-white-50 mb-2">Funcionários Desativados</h6>
                                                    <h2 className="text-white mb-0" style={{ fontSize: '2.5rem', fontWeight: '700' }}>
                                                        {totalFuncionariosDesativados}
                                                    </h2>
                                                </div>
                                                <div className="bg-white bg-opacity-25 p-3 rounded-circle">
                                                    <FaUserSlash size={28} color="white" />
                                                </div>
                                            </div>
                                            <p className="text-white-50 small mb-0">Total de inativos</p>
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
                                                    Distribuição de Funcionários
                                                </h5>
                                            </div>
                                            <p className="text-muted small mb-0">Percentual de ativos vs desativados</p>
                                        </div>
                                        <div className="card-body">
                                            {dadosGrafico.length > 0 ? (
                                                <ResponsiveContainer width="100%" height={350}>
                                                    <PieChart>
                                                        <Pie
                                                            data={dadosGrafico}
                                                            cx="50%"
                                                            cy="50%"
                                                            labelLine={true}
                                                            label={({ nome, percent }) => `${nome}: ${(percent * 100).toFixed(0)}%`}
                                                            outerRadius={120}
                                                            fill="#8884d8"
                                                            dataKey="valor"
                                                        >
                                                            {dadosGrafico.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={entry.cor || COLORS[index % COLORS.length]} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip />
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

                                <div className="col-md-6">
                                    <div className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                                        <div className="card-header bg-white border-0 pt-4 px-4">
                                            <div className="d-flex align-items-center gap-2">
                                                <FaChartBar size={20} color="#003366" />
                                                <h5 className="mb-0" style={{ color: 'var(--azul-escuro)', fontWeight: '600' }}>
                                                    Comparativo de Status
                                                </h5>
                                            </div>
                                            <p className="text-muted small mb-0">Quantidade por status</p>
                                        </div>
                                        <div className="card-body">
                                            {dadosComparativos.length > 0 ? (
                                                <ResponsiveContainer width="100%" height={350}>
                                                    <BarChart data={dadosComparativos} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                                        <XAxis dataKey="nome" />
                                                        <YAxis />
                                                        <Tooltip />
                                                        <Legend />
                                                        <Bar dataKey="quantidade" fill="#003366" name="Total de Funcionários">
                                                            {dadosComparativos.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={index === 0 ? '#003366' : '#DC143C'} />
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

                            <div className="row g-4 mb-4">
                                <div className="col-md-6">
                                    <div className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                                        <div className="card-header bg-white border-0 pt-4 px-4">
                                            <div className="d-flex align-items-center gap-2">
                                                <FaChartBar size={20} color="#4A90E2" />
                                                <h5 className="mb-0" style={{ color: 'var(--azul-escuro)', fontWeight: '600' }}>
                                                    Distribuição por Cargo
                                                </h5>
                                            </div>
                                            <p className="text-muted small mb-0">Funcionários ativos por cargo</p>
                                        </div>
                                        <div className="card-body">
                                            {dadosCargos.length > 0 ? (
                                                <ResponsiveContainer width="100%" height={350}>
                                                    <BarChart data={dadosCargos} margin={{ top: 20, right: 30, left: 20, bottom: 70 }} layout="vertical">
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                                        <XAxis type="number" />
                                                        <YAxis type="category" dataKey="cargo" width={180} interval={0} />
                                                        <Tooltip />
                                                        <Legend />
                                                        <Bar dataKey="quantidade" fill="#4A90E2" name="Total de Funcionários">
                                                            {dadosCargos.map((entry, index) => (
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

                                <div className="col-md-6">
                                    <div className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                                        <div className="card-header bg-white border-0 pt-4 px-4">
                                            <h5 className="mb-0" style={{ color: 'var(--azul-escuro)', fontWeight: '600' }}>
                                                Funcionários Recentes
                                            </h5>
                                            <p className="text-muted small mb-0">Últimos 5 funcionários cadastrados</p>
                                        </div>
                                        <div className="card-body">
                                            <div className="table-responsive">
                                                <table className="table table-hover">
                                                    <thead>
                                                        <tr>
                                                            <th>ID</th>
                                                            <th>Nome</th>
                                                            <th>Contacto</th>
                                                            <th>Cargo</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {funcionariosRecentes.length > 0 ? (
                                                            funcionariosRecentes.map((func, index) => (
                                                                <tr key={func.id_funcionario || index}>
                                                                    <td><span className="badge bg-secondary">#{func.id_funcionario}</span></td>
                                                                    <td><FaUserTie className="me-2" />{func.nome_funcionario || 'N/A'}</td>
                                                                    <td><FaPhone className="me-2" />{func.contacto_funcionario || 'N/A'}</td>
                                                                    <td><span className="badge bg-primary">{func.cargo || 'N/A'}</span></td>
                                                                </tr>
                                                            ))
                                                        ) : (
                                                            <tr><td colSpan="4" className="text-center">Nenhum funcionário cadastrado</td></tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="row mt-4">
                                <div className="col-12">
                                    <div className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                                        <div className="card-header bg-white border-0 pt-4 px-4">
                                            <h5 className="mb-0" style={{ color: 'var(--azul-escuro)', fontWeight: '600' }}>
                                                Funcionários Desativados
                                            </h5>
                                            <p className="text-muted small mb-0">Lista de funcionários com estado 'Desativado'</p>
                                        </div>
                                        <div className="card-body">
                                            {erroDesativados ? (
                                                <div className="text-center py-4">
                                                    <FaExclamationTriangle size={40} color="#DC143C" />
                                                    <p className="text-muted mt-3">Erro ao carregar dados</p>
                                                </div>
                                            ) : (
                                                <div className="table-responsive">
                                                    <table className="table table-hover">
                                                        <thead>
                                                            <tr>
                                                                <th>ID</th>
                                                                <th>Nome</th>
                                                                <th>Contacto</th>
                                                                <th>BI</th>
                                                                <th>Cargo</th>
                                                                <th>Status</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {funcionariosDesativados.length > 0 ? (
                                                                funcionariosDesativados.map((func) => (
                                                                    <tr key={func.id_funcionario}>
                                                                        <td>#{func.id_funcionario}</td>
                                                                        <td>{func.nome_funcionario}</td>
                                                                        <td>{func.contacto_funcionario}</td>
                                                                        <td>{func.bi_funcionario}</td>
                                                                        <td><span className="badge bg-secondary">{func.cargo}</span></td>
                                                                        <td><span className="badge bg-danger">Desativado</span></td>
                                                                    </tr>
                                                                ))
                                                            ) : (
                                                                <tr><td colSpan="6" className="text-center">Nenhum funcionário desativado</td></tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {secaoAtiva === "funcionarios" && <FuncionarioEdit />}
                    {secaoAtiva === "funcionariosRemovidos" && <FuncionarioRemovidosEdit />}
                </main>
            </div>
        </div>
    );
}

export default GestaoFuncionariosAdm;