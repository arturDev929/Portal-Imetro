import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
    MdArrowBack, MdSave, MdEdit, MdCheckCircle, MdWarning, 
    MdCancel, MdSchool, MdAssignment, MdTimer, MdRefresh,
    MdInfo, MdAdd, MdDelete, MdGrade
} from "react-icons/md";
import { FaChartLine, FaUserGraduate, FaCalculator } from "react-icons/fa";
import TeacherLayout from "../layouts/TeacherLayout";
import api from "../service/api";
import { showErrorToast, showSuccessToast, showInfoToast } from "../components/global/CustomToast";

const colors = {
    primary: '#003366',
    primaryLight: '#0047AB',
    primaryDark: '#002244',
    gold: '#B8860B',
    grayLight: '#F5F5F5',
    white: '#FFFFFF',
    danger: '#e0474c',
    success: '#6B8E4C'
};

function NotasTurma() {
    const { idperiodo, iddisciplina } = useParams();
    const navigate = useNavigate();
    
    const [estudantes, setEstudantes] = useState([]);
    const [avaliacoes, setAvaliacoes] = useState([]);
    const [avaliacoesList, setAvaliacoesList] = useState([]);
    const [notasParciais, setNotasParciais] = useState({});
    const [notasExame, setNotasExame] = useState({});
    const [notasRecurso, setNotasRecurso] = useState({});
    const [notasExameEspecial, setNotasExameEspecial] = useState({});
    const [loading, setLoading] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [estadoDisciplina, setEstadoDisciplina] = useState(null);
    const [dispensa, setDispensa] = useState(false);
    const [modalAvaliacao, setModalAvaliacao] = useState(false);
    const [avaliacaoSelecionada, setAvaliacaoSelecionada] = useState(null);
    const [novaAvaliacao, setNovaAvaliacao] = useState({ estudante_id: null, avaliacao: '', nota: '' });
    const [estatisticas, setEstatisticas] = useState({ mediaContinua: 0, mediaParcial: 0, aprovados: 0, exame: 0, recurso: 0, exameEspecial: 0, reprovados: 0 });

    useEffect(() => {
        carregarDados();
        verificarEstadoDisciplina();
    }, [idperiodo, iddisciplina]);

    const verificarEstadoDisciplina = async () => {
        try {
            const response = await api.get(`/verificarEstadoDisciplina/${idperiodo}/${iddisciplina}`);
            if (response.data.success) {
                setEstadoDisciplina(response.data.estado);
                setDispensa(response.data.dispensa);
            }
        } catch (error) {
            console.error("Erro ao verificar estado da disciplina:", error);
        }
    };

    const carregarDados = async () => {
        try {
            setLoading(true);
            
            // Carregar estudantes com médias
            const estudantesRes = await api.get(`/estudantesTurma/${idperiodo}/${iddisciplina}`);
            if (estudantesRes.data.success) {
                setEstudantes(estudantesRes.data.data);
            }
            
            // Carregar avaliações contínuas
            const avaliacoesRes = await api.get(`/avaliacoesTurma/${idperiodo}/${iddisciplina}`);
            if (avaliacoesRes.data.success) {
                setAvaliacoesList(avaliacoesRes.data.data);
            }
            
            // Carregar notas parciais
            const notasRes = await api.get(`/notasParciaisTurma/${idperiodo}/${iddisciplina}`);
            if (notasRes.data.success) {
                const notasMap = {};
                const exameMap = {};
                const recursoMap = {};
                const exameEspecialMap = {};
                
                notasRes.data.data.forEach(item => {
                    notasMap[item.id_estudante] = item.nota_parcial || 0;
                    exameMap[item.id_estudante] = item.nota_exame || '';
                    recursoMap[item.id_estudante] = item.nota_recurso || '';
                    exameEspecialMap[item.id_estudante] = item.nota_exame_especial || '';
                });
                
                setNotasParciais(notasMap);
                setNotasExame(exameMap);
                setNotasRecurso(recursoMap);
                setNotasExameEspecial(exameEspecialMap);
                calcularEstatisticas(notasMap, notasRes.data.data);
            }
            
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
            showErrorToast("Erro", "Não foi possível carregar os dados");
        } finally {
            setLoading(false);
        }
    };

    const calcularEstatisticas = (notasMap, dados) => {
        const valoresParciais = Object.values(notasMap).filter(n => n > 0);
        const mediaContinua = estudantes.reduce((acc, e) => acc + (e.media_continua || 0), 0) / (estudantes.length || 1);
        const mediaParcial = valoresParciais.length > 0 ? valoresParciais.reduce((a, b) => a + b, 0) / valoresParciais.length : 0;
        
        const aprovados = dados.filter(d => d.aprovado === 1 && d.status_final !== 'Aprovado por Exame').length;
        const exame = dados.filter(d => d.status_final === 'Exame').length;
        const recurso = dados.filter(d => d.status_final === 'Recurso').length;
        const exameEspecial = dados.filter(d => d.status_final === 'Exame Especial').length;
        const reprovados = dados.filter(d => d.status_final === 'Reprovado' || d.status_final === 'Reprovado - Cadeirante').length;
        
        setEstatisticas({ mediaContinua, mediaParcial, aprovados, exame, recurso, exameEspecial, reprovados });
    };

    const handleNotaParcialChange = (idEstudante, valor) => {
        let nota = parseFloat(valor);
        if (isNaN(nota)) nota = "";
        if (nota > 20) nota = 20;
        if (nota < 0) nota = 0;
        setNotasParciais(prev => ({ ...prev, [idEstudante]: nota }));
    };

    const handleNotaExameChange = (idEstudante, valor) => {
        let nota = parseFloat(valor);
        if (isNaN(nota)) nota = "";
        if (nota > 20) nota = 20;
        if (nota < 0) nota = 0;
        setNotasExame(prev => ({ ...prev, [idEstudante]: nota }));
    };

    const handleNotaRecursoChange = (idEstudante, valor) => {
        let nota = parseFloat(valor);
        if (isNaN(nota)) nota = "";
        if (nota > 20) nota = 20;
        if (nota < 0) nota = 0;
        setNotasRecurso(prev => ({ ...prev, [idEstudante]: nota }));
    };

    const salvarNotaParcial = async (idEstudante) => {
        const nota = notasParciais[idEstudante];
        if (!nota && nota !== 0) {
            showErrorToast("Erro", "Informe uma nota válida");
            return;
        }
        
        setSalvando(true);
        try {
            const response = await api.post('/calcularNotaFinal', {
                id_estudante: idEstudante,
                idperiodo: parseInt(idperiodo),
                iddisciplina: parseInt(iddisciplina),
                nota_parcial: parseFloat(nota)
            });
            
            if (response.data.success) {
                showSuccessToast("Sucesso", `Nota calculada: ${response.data.data.nota_final_calculada.toFixed(1)} - ${response.data.data.status_final}`);
                await carregarDados();
            }
        } catch (error) {
            console.error("Erro ao salvar nota:", error);
            showErrorToast("Erro", "Não foi possível salvar a nota");
        } finally {
            setSalvando(false);
        }
    };

    const salvarNotaExame = async (idEstudante) => {
        const nota = notasExame[idEstudante];
        if (!nota && nota !== 0) {
            showErrorToast("Erro", "Informe uma nota válida");
            return;
        }
        
        setSalvando(true);
        try {
            const response = await api.post('/lancarNotaExame', {
                id_estudante: idEstudante,
                idperiodo: parseInt(idperiodo),
                iddisciplina: parseInt(iddisciplina),
                nota_exame: parseFloat(nota)
            });
            
            if (response.data.success) {
                showSuccessToast("Sucesso", response.data.message);
                await carregarDados();
            }
        } catch (error) {
            console.error("Erro ao salvar nota de exame:", error);
            showErrorToast("Erro", "Não foi possível salvar a nota");
        } finally {
            setSalvando(false);
        }
    };

    const salvarNotaRecurso = async (idEstudante) => {
        const nota = notasRecurso[idEstudante];
        if (!nota && nota !== 0) {
            showErrorToast("Erro", "Informe uma nota válida");
            return;
        }
        
        setSalvando(true);
        try {
            const response = await api.post('/lancarNotaRecurso', {
                id_estudante: idEstudante,
                idperiodo: parseInt(idperiodo),
                iddisciplina: parseInt(iddisciplina),
                nota_recurso: parseFloat(nota)
            });
            
            if (response.data.success) {
                showSuccessToast("Sucesso", response.data.message);
                await carregarDados();
            }
        } catch (error) {
            console.error("Erro ao salvar nota de recurso:", error);
            showErrorToast("Erro", "Não foi possível salvar a nota");
        } finally {
            setSalvando(false);
        }
    };

    const getStatusBadge = (estudante) => {
        const status = estudante.status_final;
        const aprovado = estudante.aprovado;
        
        if (aprovado === 1) {
            if (status?.includes('Dispensado')) {
                return <span className="badge" style={{ backgroundColor: colors.gold }}>🎓 Dispensado</span>;
            }
            if (status?.includes('Exame')) {
                return <span className="badge" style={{ backgroundColor: colors.success }}>✅ Aprovado por Exame</span>;
            }
            if (status?.includes('Recurso')) {
                return <span className="badge" style={{ backgroundColor: colors.success }}>✅ Aprovado por Recurso</span>;
            }
            return <span className="badge" style={{ backgroundColor: colors.success }}>✅ Aprovado</span>;
        }
        
        if (status === 'Exame') {
            return <span className="badge" style={{ backgroundColor: colors.gold }}>📝 Exame</span>;
        }
        if (status === 'Recurso') {
            return <span className="badge" style={{ backgroundColor: '#ff9800' }}>🔄 Recurso</span>;
        }
        if (status === 'Exame Especial') {
            return <span className="badge" style={{ backgroundColor: '#9c27b0' }}>⭐ Exame Especial</span>;
        }
        if (status === 'Reprovado - Cadeirante') {
            return <span className="badge" style={{ backgroundColor: colors.danger }}>🪑 Cadeirante</span>;
        }
        
        return <span className="badge" style={{ backgroundColor: colors.danger }}>❌ Reprovado</span>;
    };

    const getNotaFinalDisplay = (estudante) => {
        if (estudante.status_final?.includes('Recurso') && estudante.nota_recurso) {
            return estudante.nota_recurso.toFixed(1);
        }
        if (estudante.status_final?.includes('Exame Especial') && estudante.nota_exame_especial) {
            return estudante.nota_exame_especial.toFixed(1);
        }
        if (estudante.status_final === 'Exame' && estudante.nota_exame) {
            return estudante.nota_exame.toFixed(1);
        }
        if (estudante.nota_parcial && estudante.media_continua) {
            const notaFinal = (estudante.media_continua * 0.6) + (estudante.nota_parcial * 0.4);
            return notaFinal.toFixed(1);
        }
        return estudante.nota_final_calculada?.toFixed(1) || 'N/A';
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
                <style>{`
                    :root {
                        --azul-metropolitano: #003366;
                        --azul-claro: #0047AB;
                        --azul-escuro: #002244;
                        --dourado: #B8860B;
                        --cinza-claro: #F5F5F5;
                        --branco: #FFFFFF;
                        --danger: #e0474c;
                        --success: #6B8E4C;
                    }
                    .card-hover:hover { transform: translateY(-2px); transition: all 0.3s ease; box-shadow: 0 8px 25px rgba(0,0,0,0.1); }
                    .foto-estudante { width: 45px; height: 45px; border-radius: 50%; object-fit: cover; border: 2px solid var(--dourado); }
                    .nota-input { width: 80px; text-align: center; }
                    .table-status { font-size: 0.85rem; }
                `}</style>

                {/* Header */}
                <div className="row mb-4">
                    <div className="col-12">
                        <button className="btn btn-outline-secondary mb-3" onClick={() => navigate(-1)}>
                            <MdArrowBack className="me-2" /> Voltar
                        </button>
                        
                        <div className="d-flex justify-content-between align-items-center flex-wrap">
                            <div>
                                <h2 className="h4 mb-0" style={{ color: 'var(--azul-escuro)' }}>
                                    <FaCalculator className="me-2" style={{ color: 'var(--dourado)' }} />
                                    Sistema de Avaliações
                                </h2>
                                <p className="text-muted mt-2 mb-0">
                                    {dispensa ? '⚠️ Disciplina com Dispensa - Média ≥ 14 aprova direto' : '📋 Disciplina sem Dispensa - Segue fluxo normal'}
                                </p>
                            </div>
                            <button className="btn btn-outline-primary mt-2 mt-sm-0" onClick={carregarDados}>
                                <MdRefresh className="me-2" /> Atualizar
                            </button>
                        </div>
                    </div>
                </div>

                {/* Cards de Estatísticas */}
                <div className="row mb-4 g-3">
                    <div className="col-md-2">
                        <div className="card border-0 shadow-sm text-center">
                            <div className="card-body">
                                <small className="text-muted">Média AC</small>
                                <h4 className="mb-0" style={{ color: 'var(--azul-metropolitano)' }}>{estatisticas.mediaContinua.toFixed(1)}</h4>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-2">
                        <div className="card border-0 shadow-sm text-center">
                            <div className="card-body">
                                <small className="text-muted">Média Parcial</small>
                                <h4 className="mb-0" style={{ color: 'var(--azul-claro)' }}>{estatisticas.mediaParcial.toFixed(1)}</h4>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-2">
                        <div className="card border-0 shadow-sm text-center" style={{ backgroundColor: 'rgba(107, 142, 76, 0.1)' }}>
                            <div className="card-body">
                                <small className="text-muted">Aprovados</small>
                                <h4 className="mb-0" style={{ color: 'var(--success)' }}>{estatisticas.aprovados}</h4>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-2">
                        <div className="card border-0 shadow-sm text-center" style={{ backgroundColor: 'rgba(184, 134, 11, 0.1)' }}>
                            <div className="card-body">
                                <small className="text-muted">Exame</small>
                                <h4 className="mb-0" style={{ color: 'var(--dourado)' }}>{estatisticas.exame}</h4>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-2">
                        <div className="card border-0 shadow-sm text-center" style={{ backgroundColor: 'rgba(156, 39, 176, 0.1)' }}>
                            <div className="card-body">
                                <small className="text-muted">Recurso/EE</small>
                                <h4 className="mb-0" style={{ color: '#9c27b0' }}>{estatisticas.recurso + estatisticas.exameEspecial}</h4>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-2">
                        <div className="card border-0 shadow-sm text-center" style={{ backgroundColor: 'rgba(224, 71, 76, 0.1)' }}>
                            <div className="card-body">
                                <small className="text-muted">Reprovados</small>
                                <h4 className="mb-0" style={{ color: 'var(--danger)' }}>{estatisticas.reprovados}</h4>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabela de Notas */}
                <div className="row">
                    <div className="col-12">
                        <div className="card border-0 shadow-sm">
                            <div className="card-header" style={{ backgroundColor: 'var(--cinza-claro)', borderBottom: `2px solid var(--dourado)` }}>
                                <h6 className="mb-0" style={{ color: 'var(--azul-escuro)' }}>Lançamento de Notas</h6>
                            </div>
                            <div className="card-body p-0">
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0">
                                        <thead style={{ backgroundColor: 'var(--azul-escuro)', color: 'white' }}>
                                            <tr>
                                                <th style={{ width: '60px' }}>#</th>
                                                <th style={{ width: '60px' }}>Foto</th>
                                                <th>Nº Estudante</th>
                                                <th>Nome</th>
                                                <th className="text-center">AC (60%)</th>
                                                <th className="text-center">Parcial (40%)</th>
                                                <th className="text-center">Nota Final</th>
                                                <th className="text-center">Exame</th>
                                                <th className="text-center">Recurso</th>
                                                <th className="text-center">Status</th>
                                                <th className="text-center">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {estudantes.map((estudante, index) => {
                                                const precisaExame = estudante.status_final === 'Exame';
                                                const precisaRecurso = estudante.status_final === 'Recurso';
                                                const precisaExameEspecial = estudante.status_final === 'Exame Especial';
                                                
                                                return (
                                                    <tr key={estudante.id_estudante}>
                                                        <td>{index + 1}</td>
                                                        <td>
                                                            <img
                                                                src={estudante.foto_estudante ? `http://localhost:8080/api/img/estudantes/${estudante.foto_estudante}` : '/default-avatar.png'}
                                                                className="foto-estudante"
                                                                alt={estudante.nome_estudante}
                                                                onError={(e) => { e.target.src = '/default-avatar.png'; }}
                                                            />
                                                        </td>
                                                        <td className="fw-bold">{estudante.numero_estudante}</td>
                                                        <td>{estudante.nome_estudante}</td>
                                                        <td className="text-center">
                                                            <span className="badge" style={{ backgroundColor: 'var(--azul-metropolitano)' }}>
                                                                {estudante.media_continua?.toFixed(1) || '0.0'}
                                                            </span>
                                                        </td>
                                                        <td className="text-center">
                                                            <input
                                                                type="number"
                                                                className="form-control form-control-sm nota-input mx-auto"
                                                                step="0.5"
                                                                min="0"
                                                                max="20"
                                                                value={notasParciais[estudante.id_estudante] !== undefined ? notasParciais[estudante.id_estudante] : (estudante.nota_parcial || '')}
                                                                onChange={(e) => handleNotaParcialChange(estudante.id_estudante, e.target.value)}
                                                                disabled={salvando || estudante.aprovado === 1}
                                                                style={{ textAlign: 'center' }}
                                                            />
                                                        </td>
                                                        <td className="text-center">
                                                            <strong style={{ color: getNotaFinalDisplay(estudante) >= 14 ? 'var(--success)' : 'var(--danger)' }}>
                                                                {getNotaFinalDisplay(estudante)}
                                                            </strong>
                                                        </td>
                                                        <td className="text-center">
                                                            {precisaExame ? (
                                                                <div className="d-flex gap-1 justify-content-center">
                                                                    <input
                                                                        type="number"
                                                                        className="form-control form-control-sm nota-input"
                                                                        step="0.5"
                                                                        min="0"
                                                                        max="20"
                                                                        placeholder="Exame"
                                                                        value={notasExame[estudante.id_estudante] !== undefined ? notasExame[estudante.id_estudante] : (estudante.nota_exame || '')}
                                                                        onChange={(e) => handleNotaExameChange(estudante.id_estudante, e.target.value)}
                                                                        disabled={salvando}
                                                                    />
                                                                    <button
                                                                        className="btn btn-sm btn-success"
                                                                        onClick={() => salvarNotaExame(estudante.id_estudante)}
                                                                        disabled={salvando || !notasExame[estudante.id_estudante]}
                                                                        title="Salvar nota de exame"
                                                                    >
                                                                        <MdSave size={16} />
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <span className="text-muted">-</span>
                                                            )}
                                                        </td>
                                                        <td className="text-center">
                                                            {precisaRecurso ? (
                                                                <div className="d-flex gap-1 justify-content-center">
                                                                    <input
                                                                        type="number"
                                                                        className="form-control form-control-sm nota-input"
                                                                        step="0.5"
                                                                        min="0"
                                                                        max="20"
                                                                        placeholder="Recurso"
                                                                        value={notasRecurso[estudante.id_estudante] !== undefined ? notasRecurso[estudante.id_estudante] : (estudante.nota_recurso || '')}
                                                                        onChange={(e) => handleNotaRecursoChange(estudante.id_estudante, e.target.value)}
                                                                        disabled={salvando}
                                                                    />
                                                                    <button
                                                                        className="btn btn-sm btn-warning"
                                                                        onClick={() => salvarNotaRecurso(estudante.id_estudante)}
                                                                        disabled={salvando || !notasRecurso[estudante.id_estudante]}
                                                                        title="Salvar nota de recurso"
                                                                    >
                                                                        <MdSave size={16} />
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <span className="text-muted">-</span>
                                                            )}
                                                        </td>
                                                        <td className="text-center">{getStatusBadge(estudante)}</td>
                                                        <td className="text-center">
                                                            {!estudante.aprovado && !precisaExame && !precisaRecurso && !precisaExameEspecial && (
                                                                <button
                                                                    className="btn btn-sm"
                                                                    style={{ backgroundColor: 'var(--azul-metropolitano)', color: 'white' }}
                                                                    onClick={() => salvarNotaParcial(estudante.id_estudante)}
                                                                    disabled={salvando || !notasParciais[estudante.id_estudante]}
                                                                >
                                                                    <MdSave size={16} className="me-1" /> Salvar
                                                                </button>
                                                            )}
                                                            {precisaExame && notasExame[estudante.id_estudante] && (
                                                                <span className="text-success small">✓ Aguardando</span>
                                                            )}
                                                            {estudante.aprovado === 1 && (
                                                                <MdCheckCircle size={20} style={{ color: 'var(--success)' }} />
                                                            )}
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

                {/* Legenda */}
                <div className="row mt-4">
                    <div className="col-12">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body">
                                <h6 className="mb-3" style={{ color: 'var(--azul-escuro)' }}>
                                    <MdInfo className="me-2" /> Legenda do Sistema de Avaliação
                                </h6>
                                <div className="row g-3">
                                    <div className="col-md-3">
                                        <div className="d-flex align-items-center gap-2">
                                            <span className="badge" style={{ backgroundColor: 'var(--success)' }}>✅</span>
                                            <span>Aprovado (Nota Final ≥ 14)</span>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="d-flex align-items-center gap-2">
                                            <span className="badge" style={{ backgroundColor: 'var(--dourado)' }}>📝</span>
                                            <span>Exame (Nota Final &lt; 14)</span>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="d-flex align-items-center gap-2">
                                            <span className="badge" style={{ backgroundColor: '#ff9800' }}>🔄</span>
                                            <span>Recurso (Nota Exame &lt; 10)</span>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="d-flex align-items-center gap-2">
                                            <span className="badge" style={{ backgroundColor: '#9c27b0' }}>⭐</span>
                                            <span>Exame Especial (Nota Recurso &lt; 10)</span>
                                        </div>
                                    </div>
                                </div>
                                <hr />
                                <div className="row">
                                    <div className="col-md-6">
                                        <p className="mb-1"><strong>Fórmula de Cálculo:</strong></p>
                                        <p className="text-muted small mb-0">Nota Final = (Média das Avaliações Contínuas × 60%) + (Nota Parcial × 40%)</p>
                                    </div>
                                    <div className="col-md-6">
                                        <p className="mb-1"><strong>Fluxo de Aprovação:</strong></p>
                                        <p className="text-muted small mb-0">Aprovado (≥14) → Exame (≥10) → Recurso (≥10) → Exame Especial (≥10) → Reprovado/Cadeirante</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </TeacherLayout>
    );
}

export default NotasTurma;