// src/pagesFuncionarioMatricula/Home.jsx
import FuncionarioLayout from "../layouts/FuncionarioLayout";
import { useEffect, useState, useCallback, useRef } from "react";
import Inscricoes from "./components/Inscricoes";
import { FaUserCheck, FaUserTimes, FaUserPlus, FaSync } from 'react-icons/fa';
import { IoMdPerson } from "react-icons/io";
import { BsClockHistory } from "react-icons/bs";
import Style from "../pagesAdm/GestaoCursoAdm.module.css";
import api from "../service/api";

function HomeFuncionarioM() {
    // States principais
    const [user, setUser] = useState(null);
    const [userId, setUserId] = useState(null);
    const [secaoAtiva, setSecaoAtiva] = useState("Pendente");
    const [inscritos, setInscritos] = useState([]);
    const [estatisticas, setEstatisticas] = useState(null);
    
    // States de controle
    const [loading, setLoading] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [error, setError] = useState(null);
    const [updateCount, setUpdateCount] = useState(0);
    
    // Refs
    const intervalRef = useRef(null);
    const isMountedRef = useRef(true);

    // Carregar usuário do localStorage
    useEffect(() => {
        try {
            const usuarioSalvo = localStorage.getItem("usuarioLogado");
            if (usuarioSalvo) {
                const userData = JSON.parse(usuarioSalvo);
                setUser(userData);
                const id = userData.id || userData.id_user || userData.userId || userData.id_usuario;
                setUserId(id);
            }
        } catch (e) {
            // Erro ao carregar usuário
        }
    }, []);

    // Função para buscar dados
    const fetchData = useCallback(async (showLoading = true) => {
        if (!isMountedRef.current) return;
        
        if (showLoading) {
            setLoading(true);
        }
        setError(null);

        try {
            const [inscritosResponse, estatisticasResponse] = await Promise.all([
                api.get("/EstudantesInscritos"),
                api.get("/EstatisticasInscricoes")
            ]);

            if (!isMountedRef.current) return;

            setInscritos(inscritosResponse.data || []);
            setEstatisticas(estatisticasResponse.data || {});
            setLastUpdate(new Date());
            setUpdateCount(prev => prev + 1);
        } catch (error) {
            if (!isMountedRef.current) return;
            
            setError("Erro ao carregar dados. Tentando novamente...");
            
            // Se falhar, tenta usar dados mockados para teste
            if (process.env.NODE_ENV === 'development') {
                setEstatisticas({
                    total: 0,
                    pendentes: 0,
                    admitidos: 0,
                    nao_admitidos: 0,
                    matriculados: 0
                });
                setInscritos([]);
            }
        } finally {
            if (isMountedRef.current) {
                setLoading(false);
            }
        }
    }, []);

    // Inicialização
    useEffect(() => {
        isMountedRef.current = true;

        // Buscar dados iniciais
        fetchData(true);

        // Configurar polling (atualização a cada 10 segundos)
        intervalRef.current = setInterval(() => {
            if (isMountedRef.current) {
                fetchData(false);
            }
        }, 90000);

        // Cleanup
        return () => {
            isMountedRef.current = false;
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [fetchData]);

    // Formatar hora
    const formatTime = (date) => {
        if (!date) return 'Nunca';
        return date.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    // Definição das seções
    const secoes = [
        {
            cor: "#003366",
            titulo: "Estudantes Inscritos",
            icone: FaUserPlus,
            status: "Pendente",
            count: estatisticas?.pendentes || 0
        },
        {
            cor: "#28a745",
            titulo: "Estudantes Admitidos",
            icone: FaUserCheck,
            status: "Admitido",
            count: estatisticas?.admitidos || 0
        },
        {
            cor: "#dc3545",
            titulo: "Não Admitidos",
            icone: FaUserTimes,
            status: "Não Admitido",
            count: estatisticas?.nao_admitidos || 0
        }
    ];

    // Se não tiver usuário, mostra loading
    if (!user) {
        return (
            <FuncionarioLayout>
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                    <div className="text-center">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Carregando...</span>
                        </div>
                        <p className="mt-3">Carregando dados do usuário...</p>
                    </div>
                </div>
            </FuncionarioLayout>
        );
    }

    return (
        <FuncionarioLayout>
            {/* Header */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
                        <div>
                            <h2 style={{ color: '#003366', fontWeight: '600' }}>
                                Dashboard de Estudantes
                            </h2>
                            <p className="text-muted mb-1">
                                Bem-vindo, <strong>{user.nome || user.name}</strong> | Gestão de inscrições e matrículas
                            </p>
                            
                            {/* Status Bar */}
                            <div className="d-flex align-items-center gap-3 mt-2 flex-wrap">
                                <div className="d-flex align-items-center gap-2">
                                    <BsClockHistory className="text-muted" />
                                    <small className="text-muted">
                                        Última atualização: <strong>{formatTime(lastUpdate)}</strong>
                                    </small>
                                </div>

                                {loading && (
                                    <div className="d-flex align-items-center gap-2">
                                        <div className="spinner-border spinner-border-sm text-primary" role="status">
                                            <span className="visually-hidden">Carregando...</span>
                                        </div>
                                        <small className="text-primary">Atualizando...</small>
                                    </div>
                                )}

                                {error && (
                                    <div className="d-flex align-items-center gap-2 text-danger">
                                        <span>⚠️</span>
                                        <small>{error}</small>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="d-flex align-items-center gap-2">
                            <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => fetchData(true)}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                        Atualizando
                                    </>
                                ) : (
                                    <>
                                        <FaSync className="me-1" />
                                        Atualizar
                                    </>
                                )}
                            </button>
                            
                            <div className="badge p-3" style={{ backgroundColor: '#003366' }}>
                                <IoMdPerson size={24} color="white" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cards de estatísticas */}
            {estatisticas && (
                <div className="row mb-4 g-3">
                    <div className="col-md-3">
                        <div className="card bg-light border-0 shadow-sm">
                            <div className="card-body text-center">
                                <h5 className="text-muted">Total</h5>
                                <h2 className="fw-bold" style={{ color: '#003366' }}>
                                    {estatisticas.total || 0}
                                </h2>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card bg-light border-0 shadow-sm">
                            <div className="card-body text-center">
                                <h5 className="text-muted">Admitidos</h5>
                                <h2 className="fw-bold text-success">
                                    {estatisticas.admitidos || 0}
                                </h2>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card bg-light border-0 shadow-sm">
                            <div className="card-body text-center">
                                <h5 className="text-muted">Matriculados</h5>
                                <h2 className="fw-bold text-primary">
                                    {estatisticas.matriculados || 0}
                                </h2>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card bg-light border-0 shadow-sm">
                            <div className="card-body text-center">
                                <h5 className="text-muted">Não Admitidos</h5>
                                <h2 className="fw-bold text-danger">
                                    {estatisticas.nao_admitidos || 0}
                                </h2>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Botões de navegação */}
            <div className="row mb-4 g-2">
                {secoes.map((secao) => (
                    <div className="col-md-2" key={secao.status}>
                        <button
                            className={`btn w-100 position-relative ${secaoAtiva === secao.status ? Style.botoesGestaoCurso : Style.botoesGestaoCursoD}`}
                            onClick={() => setSecaoAtiva(secao.status)}
                        >
                            <secao.icone className="me-2 mb-1" />
                            <span className="d-none d-md-inline">{secao.titulo}</span>
                            <span className="d-md-none">{secao.status}</span>
                            {secao.count > 0 && (
                                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                    {secao.count}
                                </span>
                            )}
                        </button>
                    </div>
                ))}
            </div>

            {/* Lista de estudantes */}
            <div className="row">
                <div className="col-12">
                    {secoes.map((secao) => (
                        secaoAtiva === secao.status && (
                            <div key={secao.status}>
                                <div className="d-flex align-items-center gap-2 mb-3">
                                    <secao.icone size={20} color={secao.cor} className="me-2" />
                                    <h4 className="mb-0" style={{ color: '#003366' }}>
                                        {secao.titulo} ({secao.count})
                                    </h4>
                                </div>
                                <Inscricoes 
                                    key={`${secao.status}-${lastUpdate?.getTime()}`}
                                    filtroStatus={secao.status} 
                                />
                            </div>
                        )
                    ))}
                </div>
            </div>
        </FuncionarioLayout>
    );
}

export default HomeFuncionarioM;