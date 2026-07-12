// src/pagesFuncionarioMatricula/Home.jsx
import FuncionarioLayout from "../layouts/FuncionarioLayout";
import { useEffect, useState } from "react";
import Inscricoes from "./components/Inscricoes";
import { FaUserCheck, FaUserTimes, FaUserPlus } from 'react-icons/fa';
import { IoMdPerson } from "react-icons/io";
import Style from "../pagesAdm/GestaoCursoAdm.module.css";
import api from "../service/api";

function HomeFuncionarioM() {
    const [user, setUser] = useState(null);
    const [userId, setUserId] = useState(null);
    const [secaoAtiva, setSecaoAtiva] = useState("Pendente");
    const [inscritos, setInscritos] = useState([]);
    const [estatisticas, setEstatisticas] = useState(null);

    useEffect(() => {
        const usuarioSalvo = localStorage.getItem("usuarioLogado");
        if (usuarioSalvo) {
            try {
                const userData = JSON.parse(usuarioSalvo);
                setUser(userData);
                const id = userData.id || userData.id_user || userData.userId || userData.id_usuario;
                setUserId(id);
                console.log("User ID no Home:", id);
            } catch (e) {
                console.error("Erro ao parsear usuário:", e);
            }
        }
    }, []);

    useEffect(() => {
        RequestData();
        carregarEstatisticas();
    }, []);

    async function RequestData() {
        try {
            const data = await api.get("/EstudantesInscritos");
            console.log("Dados recebidos:", data.data);
            setInscritos(data.data);
        } catch (error) {
            console.error("Erro ao buscar dados:", error);
        }
    }

    async function carregarEstatisticas() {
        try {
            const response = await api.get("/EstatisticasInscricoes");
            setEstatisticas(response.data);
        } catch (error) {
            console.error("Erro ao buscar estatísticas:", error);
        }
    }

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
            titulo: "Estudantes Não Admitidos",
            icone: FaUserTimes,
            status: "Não Admitido",
            count: estatisticas?.nao_admitidos || 0
        }
    ];

    return (
        <FuncionarioLayout>
            <div className="row mb-4">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h2 style={{ color: 'var(--azul-escuro)', fontWeight: '600' }}>
                                Dashboard de Estudantes
                            </h2>
                            {user && (
                                <p className="text-muted mb-0">
                                    Bem-vindo, {user.nome || user.name} | Gestão de inscrições e matrículas
                                    {userId && <span className="ms-2 text-primary">(ID: {userId})</span>}
                                </p>
                            )}
                        </div>
                        <div className="badge p-3" style={{ backgroundColor: 'var(--azul-escuro)' }}>
                            <IoMdPerson size={24} color="white" />
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
                                <h2 className="fw-bold" style={{ color: 'var(--azul-escuro)' }}>
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
                            {secao.titulo}
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
                                    <h4 className="mb-0" style={{ color: 'var(--azul-escuro)' }}>
                                        {secao.titulo} ({secao.count})
                                    </h4>
                                </div>
                                <Inscricoes filtroStatus={secao.status} />
                            </div>
                        )
                    ))}
                </div>
            </div>
        </FuncionarioLayout>
    );
}

export default HomeFuncionarioM;