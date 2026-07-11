import FuncionarioLayout from "../layouts/FuncionarioLayout";
import { useEffect, useState } from "react";
import { FaSave, FaEdit, FaChartLine, FaCheckCircle } from 'react-icons/fa';
import Style from "../pagesAdm/GestaoCursoAdm.module.css";
import api from "../service/api";

function LancarNotasM() {
    const [user, setUser] = useState(null);
    const [cursos, setCursos] = useState([]);
    const [cursoSelecionado, setCursoSelecionado] = useState("");
    const [estudantes, setEstudantes] = useState([]);
    const [notas, setNotas] = useState({});
    const [modoEdicao, setModoEdicao] = useState({});
    const [loading, setLoading] = useState(false);
    const [mensagem, setMensagem] = useState({ texto: "", tipo: "" });

    useEffect(() => {
        const usuarioSalvo = localStorage.getItem("usuarioLogado");
        if (usuarioSalvo) {
            setUser(JSON.parse(usuarioSalvo));
        }
        carregarCursos();
    }, []);

    async function carregarCursos() {
        try {
            const response = await api.get("/cursos");
            setCursos(response.data);
        } catch (error) {
            console.error("Erro ao carregar cursos:", error);
            setMensagem({ texto: "Erro ao carregar cursos", tipo: "error" });
            setTimeout(() => setMensagem({ texto: "", tipo: "" }), 3000);
        }
    }

    async function carregarEstudantes(cursoId) {
        setLoading(true);
        try {
            const response = await api.get(`/EstudantesByCurso/${cursoId}`);
            setEstudantes(response.data);

            const notasIniciais = {};
            response.data.forEach(est => {
                const notaValue = est.nota_estudanteInscricao || est.nota;
                if (notaValue !== undefined && notaValue !== null) {
                    notasIniciais[est.id_estudanteInscricao || est.id_est] = notaValue.toString();
                }
            });
            setNotas(notasIniciais);
        } catch (error) {
            console.error("Erro ao carregar estudantes:", error);
            setMensagem({ texto: "Erro ao carregar estudantes", tipo: "error" });
            setTimeout(() => setMensagem({ texto: "", tipo: "" }), 3000);
        } finally {
            setLoading(false);
        }
    }

    const handleCursoChange = (e) => {
        const cursoId = e.target.value;
        setCursoSelecionado(cursoId);
        if (cursoId) {
            carregarEstudantes(cursoId);
        } else {
            setEstudantes([]);
            setNotas({});
        }
    };

    const handleNotaChange = (estudanteId, value) => {
        let notaValida = value;
        if (value !== "") {
            const num = parseFloat(value);
            if (num < 0) notaValida = "0";
            if (num > 20) notaValida = "20";
        }
        setNotas(prev => ({ ...prev, [estudanteId]: notaValida }));
    };

    const habilitarEdicao = (estudanteId) => {
        setModoEdicao(prev => ({ ...prev, [estudanteId]: true }));
    };

    const salvarNota = async (estudanteId) => {
        const nota = notas[estudanteId];

        if (nota === "" || nota === null || nota === undefined) {
            setMensagem({ texto: "Por favor, insira uma nota válida (0 a 20)", tipo: "error" });
            setTimeout(() => setMensagem({ texto: "", tipo: "" }), 3000);
            return;
        }

        const notaNum = parseFloat(nota);
        if (isNaN(notaNum) || notaNum < 0 || notaNum > 20) {
            setMensagem({ texto: "Nota inválida. Use valores entre 0 e 20", tipo: "error" });
            setTimeout(() => setMensagem({ texto: "", tipo: "" }), 3000);
            return;
        }

        setLoading(true);

        try {
            const estudante = estudantes.find(est =>
                (est.id_estudanteInscricao || est.id_est) === estudanteId
            );
            const codigo = estudante?.numeroInscricao_estudanteInscricao || estudante?.codigo;

            if (!codigo) {
                setMensagem({ texto: "Código do estudante não encontrado", tipo: "error" });
                setTimeout(() => setMensagem({ texto: "", tipo: "" }), 3000);
                setLoading(false);
                return;
            }

            const response = await api.put(`/estudanteInscritoNota/${codigo}`, { nota: notaNum });

            if (response.data.success) {
                setModoEdicao(prev => ({ ...prev, [estudanteId]: false }));
                setMensagem({ texto: response.data.message || "Nota lançada com sucesso!", tipo: "success" });
                setTimeout(() => setMensagem({ texto: "", tipo: "" }), 3000);
                carregarEstudantes(cursoSelecionado);
            } else {
                setMensagem({ texto: response.data.error || "Erro ao salvar nota", tipo: "error" });
                setTimeout(() => setMensagem({ texto: "", tipo: "" }), 3000);
            }
        } catch (error) {
            console.error("Erro ao salvar nota:", error);
            setMensagem({ texto: error.response?.data?.error || "Erro ao processar solicitação", tipo: "error" });
            setTimeout(() => setMensagem({ texto: "", tipo: "" }), 3000);
        } finally {
            setLoading(false);
        }
    };

    const getStatusNota = (nota) => {
        if (nota === "" || nota === null || nota === undefined) {
            return { texto: "Não lançada", cor: "#dc3545" };
        }
        const notaNum = parseFloat(nota);
        if (notaNum >= 14) return { texto: "Aprovado", cor: "#28a745" };
        if (notaNum >= 10) return { texto: "Recuperação", cor: "#ffc107" };
        return { texto: "Reprovado", cor: "#dc3545" };
    };

    return (
        <FuncionarioLayout>
            <div className="row mb-4">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h2 style={{ color: 'var(--azul-escuro)', fontWeight: '600' }}>
                                Lançamento de Notas
                            </h2>
                            {user && (
                                <p className="text-muted mb-0">
                                    Bem-vindo, {user.nome} | Lançamento de notas por curso
                                </p>
                            )}
                        </div>
                        <div className="badge p-3" style={{ backgroundColor: 'var(--azul-escuro)' }}>
                            <FaChartLine size={24} color="white" />
                        </div>
                    </div>
                </div>
            </div>

            {mensagem.texto && (
                <div className="row mb-3">
                    <div className="col-12">
                        <div className={`alert alert-${mensagem.tipo === "success" ? "success" : "danger"} text-center`}>
                            {mensagem.texto}
                        </div>
                    </div>
                </div>
            )}

            <div className="row mb-4">
                <div className="col-md-6">
                    <label className="form-label fw-bold" style={{ color: 'var(--azul-escuro)' }}>
                        Selecione o Curso
                    </label>
                    <select
                        className="form-select"
                        value={cursoSelecionado}
                        onChange={handleCursoChange}
                        style={{ borderColor: 'var(--azul-escuro)' }}
                    >
                        <option value="">-- Selecione um curso --</option>
                        {cursos.map(curso => (
                            <option key={curso.id_curso} value={curso.id_curso}>
                                {curso.curso}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {cursoSelecionado && (
                <div className="row">
                    <div className="col-12">
                        <div className="d-flex align-items-center gap-2 mb-3">
                            <FaEdit size={20} color="var(--azul-escuro)" />
                            <h4 className="mb-0" style={{ color: 'var(--azul-escuro)' }}>
                                Lançar Notas dos Estudantes
                            </h4>
                        </div>

                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Carregando...</span>
                                </div>
                            </div>
                        ) : estudantes.length === 0 ? (
                            <div className="alert alert-info text-center">
                                <FaCheckCircle className="me-2" />
                                Nenhum estudante admitido ou aprovado encontrado para este curso.
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead style={{ backgroundColor: 'var(--azul-escuro)', color: 'white' }}>
                                        <tr>
                                            <th>#</th>
                                            <th>Nome do Estudante</th>
                                            <th>Código</th>
                                            <th>Nota Atual</th>
                                            <th>Status</th>
                                            <th>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {estudantes.map((estudante, index) => {
                                            const id = estudante.id_estudanteInscricao || estudante.id_est;
                                            const notaAtual = notas[id];
                                            const status = getStatusNota(notaAtual);
                                            return (
                                                <tr key={id}>
                                                    <td>{index + 1}</td>
                                                    <td className="fw-bold">{estudante.nome_estudanteInscricao || estudante.nome}</td>
                                                    <td>{estudante.numeroInscricao_estudanteInscricao || estudante.codigo}</td>
                                                    <td style={{ width: "150px" }}>
                                                        {modoEdicao[id] ? (
                                                            <input
                                                                type="number"
                                                                className="form-control"
                                                                step="0.1"
                                                                min="0"
                                                                max="20"
                                                                value={notaAtual || ""}
                                                                onChange={(e) => handleNotaChange(id, e.target.value)}
                                                                placeholder="0 a 20"
                                                                style={{ width: "100px" }}
                                                            />
                                                        ) : (
                                                            <span className="fw-bold">
                                                                {notaAtual ? parseFloat(notaAtual).toFixed(1) : "—"}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <span className="badge" style={{ backgroundColor: status.cor }}>
                                                            {status.texto}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {!modoEdicao[id] ? (
                                                            <button
                                                                className={`btn btn-sm ${Style.botoesGestaoCurso}`}
                                                                onClick={() => habilitarEdicao(id)}
                                                                disabled={loading}
                                                            >
                                                                <FaEdit className="me-1" /> Editar
                                                            </button>
                                                        ) : (
                                                            <button
                                                                className={`btn btn-sm ${Style.botoesGestaoCurso}`}
                                                                onClick={() => salvarNota(id)}
                                                                disabled={loading}
                                                            >
                                                                <FaSave className="me-1" /> Salvar
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {!cursoSelecionado && (
                <div className="row">
                    <div className="col-12">
                        <div className="alert alert-info text-center">
                            <FaChartLine size={20} className="me-2" />
                            Selecione um curso para começar a lançar as notas
                        </div>
                    </div>
                </div>
            )}
        </FuncionarioLayout>
    );
}

export default LancarNotasM;