import NavbarAdm from "../components/NavbarAdm";
import SidebarAdm from "../components/SidebarAdm";
import { IoMdStats } from "react-icons/io";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';
import axios from 'axios';
import ProfessorEdit from "../components/ProfessorEdit";

function GestaoProfessoresAdm() {
    const [estatisticas, setEstatisticas] = useState({});
    const [professoresPorDisciplina, setProfessoresPorDisciplina] = useState([]);
    const [professoresMaisAtivos, setProfessoresMaisAtivos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('geral');

    useEffect(() => {
        fetchEstatisticas();
    }, []);

    const fetchEstatisticas = async () => {
        try {
            setLoading(true);
            
            // Buscar todas as estatísticas simultaneamente
            const [
                estatisticasRes,
                professoresDisciplinaRes,
                professoresAtivosRes
            ] = await Promise.all([
                axios.get('http://localhost:8080/get/estatisticasProfessores'),
                axios.get('http://localhost:8080/get/professoresPorDisciplina'),
                axios.get('http://localhost:8080/get/professoresMaisAtivos')
            ]);

            // Verificar se os dados são válidos antes de atualizar o estado
            setEstatisticas(estatisticasRes.data || {});
            setProfessoresPorDisciplina(Array.isArray(professoresDisciplinaRes.data) ? professoresDisciplinaRes.data : []);
            setProfessoresMaisAtivos(Array.isArray(professoresAtivosRes.data) ? professoresAtivosRes.data : []);
            
            setLoading(false);
        } catch (error) {
            console.error('Erro ao buscar estatísticas:', error);
            // Definir valores padrão em caso de erro
            setEstatisticas({});
            setProfessoresPorDisciplina([]);
            setProfessoresMaisAtivos([]);
            setLoading(false);
        }
    };

    // Preparar dados para gráfico de professores por disciplina (top 20)
    const prepararDadosProfessoresDisciplina = () => {
        if (!Array.isArray(professoresPorDisciplina) || professoresPorDisciplina.length === 0) {
            return [];
        }
        
        return professoresPorDisciplina
            .filter(item => item && item.totalProfessores > 0)
            .sort((a, b) => (b.totalProfessores || 0) - (a.totalProfessores || 0))
            .slice(0, 20)
            .map(item => ({
                disciplina: item.disciplina && item.disciplina.length > 5 
                    ? item.disciplina.substring(0, 5) + '...' 
                    : (item.disciplina || 'N/A'),
                professores: item.totalProfessores || 0
            }));
    };

    // Preparar dados para gráfico de professores mais ativos
    const prepararDadosProfessoresAtivos = () => {
        if (!Array.isArray(professoresMaisAtivos) || professoresMaisAtivos.length === 0) {
            return [];
        }
        
        return professoresMaisAtivos
            .filter(item => item && item.idprofessor) // Filtrar apenas itens válidos
            .map(item => ({
                professor: item.nomeprofessor && item.nomeprofessor.length > 15 
                    ? item.nomeprofessor.substring(0, 15) + '...' 
                    : (item.nomeprofessor || 'Desconhecido'),
                disciplinas: item.totalDisciplinas || 0,
                titulacao: item.titulacaoprofessor || 'Não informada',
                id: item.idprofessor // Adicionar ID para key
            }));
    };

    // Renderizar gráfico de professores por disciplina
    const renderGraficoProfessoresDisciplina = () => {
        const dados = prepararDadosProfessoresDisciplina();
        
        if (loading) {
            return <div className="text-center py-4">Carregando dados...</div>;
        }
        
        if (dados.length === 0) {
            return <div className="text-center py-4">Nenhum dado disponível</div>;
        }

        return (
            <ResponsiveContainer width="100%" height={300}>
                <BarChart
                    data={dados}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                        dataKey="disciplina" 
                        angle={-45} 
                        textAnchor="end" 
                        height={60} 
                    />
                    <YAxis />
                    <Tooltip 
                        formatter={(value, name) => {
                            if (name === 'professores') return [value, 'Quantidade de Professores'];
                            return [value, name];
                        }}
                        labelFormatter={(value) => `Disciplina: ${value}`}
                    />
                    <Legend />
                    <Bar 
                        dataKey="professores" 
                        name="Quantidade de Professores" 
                        fill="#82ca9d" 
                        radius={[4, 4, 0, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>
        );
    };
    
    const getProfessorImagem = (professor) => {
        if(professor.fotoUrl){
            return professor.fotoUrl;
        }
        if (professor.fotoprofessor) {
            return `http://localhost:8080/api/img/professores/${professor.fotoprofessor}`;
        }
        // Retornar uma imagem padrão se não houver foto
        return "https://via.placeholder.com/50?text=Sem+Foto";
    }
    
    // Renderizar tabela de professores mais ativos
    const renderTabelaProfessoresAtivos = () => {
        if (loading) {
            return <div className="text-center py-4">Carregando dados...</div>;
        }
        
        if (!Array.isArray(professoresMaisAtivos) || professoresMaisAtivos.length === 0) {
            return <div className="text-center py-4">Nenhum dado disponível</div>;
        }

        const professoresFiltrados = professoresMaisAtivos
            .filter(item => item && item.idprofessor)
            .slice(0, 10); // Garantir apenas top 10

        return (
            <div className="table-responsive">
                <table className="table table-hover">
                    <thead>
                        <tr>
                            <th>Foto</th>
                            <th>Professor</th>
                            <th className="d-none d-md-table-cell">Titulação</th>
                            <th>Disciplinas Ministradas</th>
                            <th className="d-none d-md-table-cell">Lista de Disciplinas</th>
                        </tr>
                    </thead>
                    <tbody>
                        {professoresFiltrados.map((prof) => (
                            <tr key={prof.idprofessor}>
                                <td>
                                    <img 
                                        src={getProfessorImagem(prof)}
                                        alt={prof.nomeprofessor} 
                                        className="rounded-circle me-3"
                                        style={{width: '50px', height: '50px', objectFit: 'cover'}}
                                        onError={(e) => {
                                            e.target.src = "https://via.placeholder.com/50?text=Sem+Foto";
                                        }}
                                    />
                                </td>
                                <td>{prof.nomeprofessor || 'Desconhecido'}</td>
                                <td className="d-none d-md-table-cell">
                                    <span className="badge bg-primary">
                                        {prof.titulacaoprofessor || 'Não informada'}
                                    </span>
                                </td>
                                <td>
                                    <span className="badge bg-success" style={{ fontSize: '1.1em' }}>
                                        {prof.totalDisciplinas || 0}
                                    </span>
                                </td>
                                <td className="d-none d-md-table-cell">
                                    <small className="text-muted" title={prof.disciplinas}>
                                        {prof.disciplinas 
                                            ? (prof.disciplinas.length > 50 
                                                ? prof.disciplinas.substring(0, 100) + '...' 
                                                : prof.disciplinas)
                                            : 'Nenhuma disciplina'}
                                    </small>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    // Renderizar gráfico de desempenho dos professores
    const renderGraficoDesempenhoProfessores = () => {
        const dados = prepararDadosProfessoresAtivos();
        
        if (loading) {
            return <div className="text-center py-4">Carregando dados...</div>;
        }
        
        if (dados.length === 0) {
            return <div className="text-center py-4">Nenhum dado disponível</div>;
        }

        return (
            <ResponsiveContainer width="100%" height={350}>
                <BarChart
                    data={dados}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                        dataKey="professor" 
                        angle={-45} 
                        textAnchor="end" 
                        height={80}
                    />
                    <YAxis />
                    <Tooltip 
                        formatter={(value, name) => {
                            if (name === 'disciplinas') return [value, 'Nº de Disciplinas'];
                            return [value, name];
                        }}
                        labelFormatter={(value, payload) => {
                            if (payload && payload[0]) {
                                const titulacao = payload[0].payload.titulacao;
                                return `Professor: ${value} (${titulacao})`;
                            }
                            return value;
                        }}
                    />
                    <Legend />
                    <Bar 
                        dataKey="disciplinas" 
                        name="Número de Disciplinas" 
                        fill="#ffc107"
                        radius={[4, 4, 0, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>
        );
    };

    // Renderizar conteúdo baseado na view selecionada
    const renderContent = () => {
        switch(view) {
            case 'professores':
                return <ProfessorEdit />;
            
            case 'geral':
            default:
                return (
                    <>
                        <div className="row">
                            <div className="col-12 mb-4">
                                <h3 className="text-primary">
                                    <IoMdStats className="me-2 mb-2"/>
                                    Gestão de Professores - Dashboard
                                </h3>
                                <p className="text-muted">
                                    Visualize estatísticas e métricas sobre os professores
                                </p>
                            </div>
                        </div>

                        {/* Cards de estatísticas gerais */}
                        <div className="row mb-4">
                            <div className="col-md-4 mb-3">
                                <div className="card border-primary">
                                    <div className="card-body">
                                        <h5 className="card-title text-primary">Total de Professores</h5>
                                        <h2 className="card-text">
                                            {loading ? '...' : estatisticas.totalProfessores || 0}
                                        </h2>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4 mb-3">
                                <div className="card border-success">
                                    <div className="card-body">
                                        <h5 className="card-title text-success">Com Titulação</h5>
                                        <h2 className="card-text">
                                            {loading ? '...' : estatisticas.professoresComTitulacao || 0}
                                        </h2>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4 mb-3">
                                <div className="card border-warning">
                                    <div className="card-body">
                                        <h5 className="card-title text-warning">Vinculados à Disciplinas</h5>
                                        <h2 className="card-text">
                                            {loading ? '...' : estatisticas.professoresComTitulacao || 0}
                                        </h2>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CORREÇÃO AQUI: Gráficos lado a lado */}
                        <div className="row mb-4">
                            {/* Gráfico de professores por disciplina */}
                            <div className="col-md-6 mb-4">
                                <div className="card h-100">
                                    <div className="card-header bg-success text-white">
                                        <h5 className="mb-0">Professores por Disciplina (Top 20)</h5>
                                    </div>
                                    <div className="card-body">
                                        {renderGraficoProfessoresDisciplina()}
                                    </div>
                                </div>
                            </div>

                            {/* Gráfico de professores ativos */}
                            <div className="col-md-6 mb-4">
                                <div className="card h-100">
                                    <div className="card-header bg-warning">
                                        <h5 className="mb-0">Desempenho dos Professores Mais Ativos</h5>
                                    </div>
                                    <div className="card-body">
                                        {renderGraficoDesempenhoProfessores()}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tabela de professores mais ativos */}
                        <div className="row mt-4">
                            <div className="col-12">
                                <div className="card">
                                    <div className="card-header bg-info text-white">
                                        <h5 className="mb-0">Professores Mais Ativos</h5>
                                    </div>
                                    <div className="card-body">
                                        {renderTabelaProfessoresAtivos()}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Botão para atualizar dados
                        <div className="row mt-4">
                            <div className="col-12 text-end">
                                <button 
                                    className="btn btn-primary"
                                    onClick={fetchEstatisticas}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Atualizando...
                                        </>
                                    ) : 'Atualizar Dados'}
                                </button>
                            </div>
                        </div> */}
                    </>
                );
        }
    };

    return (
        <div>
            <div className="container-fluid">
                <SidebarAdm/>
                <div className="col-md-9 ms-md-auto col-lg-10 px-0">
                    <NavbarAdm/>
                    <main className="p-4">
                        {/* Botões de navegação */}
                        <div className="mb-4">
                            <div className="d-flex gap-2">
                                <button 
                                    className={`btn ${view === 'geral' ? 'btn-primary' : 'btn-outline-primary'}`}
                                    onClick={() => setView('geral')}
                                    style={{
                                        padding: '10px 20px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <IoMdStats />
                                    Geral
                                </button>
                                 
                                <button 
                                    className={`btn ${view === 'professores' ? 'btn-primary' : 'btn-outline-primary'}`}
                                    onClick={() => setView('professores')}
                                    style={{
                                        padding: '10px 20px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <IoMdStats />
                                    Professores
                                </button>
                            </div>
                        </div>

                        {/* Conteúdo dinâmico baseado na view selecionada */}
                        {renderContent()}
                    </main>
                </div>
            </div>
        </div>
    );
}

export default GestaoProfessoresAdm;