import FuncionarioLayout from "../layouts/FuncionarioLayout";
import { useEffect, useState } from "react";
import { FaSave, FaEdit, FaCheckCircle, FaChartLine } from 'react-icons/fa';
import Style from "../pagesAdm/GestaoCursoAdm.module.css";

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
        // Sem requisição - cursos vazio
    }, []);

    async function carregarCursos() {
        // Sem requisição
    }

    async function carregarEstudantes(cursoId) {
        // Sem requisição - apenas simulando loading
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
        }, 500);
    }

    const handleCursoChange = (e) => {
        const cursoId = e.target.value;
        setCursoSelecionado(cursoId);
        if (cursoId) {
            carregarEstudantes(cursoId);
        } else {
            setEstudantes([]);
        }
    };

    const handleNotaChange = (estudanteId, value) => {
        // Validar nota entre 0 e 10
        let notaValida = value;
        if (value !== "") {
            const num = parseFloat(value);
            if (num < 0) notaValida = "0";
            if (num > 10) notaValida = "10";
        }
        setNotas(prev => ({ ...prev, [estudanteId]: notaValida }));
    };

    const habilitarEdicao = (estudanteId) => {
        setModoEdicao(prev => ({ ...prev, [estudanteId]: true }));
    };

    const salvarNota = async (estudanteId) => {
        const nota = notas[estudanteId];
        
        if (nota === "" || nota === null) {
            setMensagem({ texto: "Por favor, insira uma nota válida (0 a 10)", tipo: "error" });
            setTimeout(() => setMensagem({ texto: "", tipo: "" }), 3000);
            return;
        }

        const notaNum = parseFloat(nota);
        if (isNaN(notaNum) || notaNum < 0 || notaNum > 10) {
            setMensagem({ texto: "Nota inválida. Use valores entre 0 e 10", tipo: "error" });
            setTimeout(() => setMensagem({ texto: "", tipo: "" }), 3000);
            return;
        }

        setLoading(true);
        
        // Simular salvamento
        setTimeout(() => {
            setModoEdicao(prev => ({ ...prev, [estudanteId]: false }));
            setMensagem({ texto: "Nota lançada com sucesso!", tipo: "success" });
            setTimeout(() => setMensagem({ texto: "", tipo: "" }), 3000);
            setLoading(false);
        }, 500);
    };

    const getStatusNota = (nota) => {
        if (nota === "" || nota === null) return { texto: "Não lançada", cor: "#dc3545" };
        const notaNum = parseFloat(nota);
        if (notaNum >= 7) return { texto: "Aprovado", cor: "#28a745" };
        if (notaNum >= 5) return { texto: "Recuperação", cor: "#ffc107" };
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

            {/* Mensagem de feedback */}
            {mensagem.texto && (
                <div className="row mb-3">
                    <div className="col-12">
                        <div className={`alert alert-${mensagem.tipo === "success" ? "success" : "danger"} text-center`}>
                            {mensagem.texto}
                        </div>
                    </div>
                </div>
            )}

            {/* Seleção de Curso */}
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
                            <option key={curso.id} value={curso.id}>
                                {curso.nome}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Lista de Estudantes */}
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
                                Nenhum estudante encontrado para este curso.
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead style={{ backgroundColor: 'var(--azul-escuro)', color: 'white' }}>
                                        <tr>
                                            <th>#</th>
                                            <th>Nome do Estudante</th>
                                            <th>Nota Atual</th>
                                            <th>Status</th>
                                            <th>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {estudantes.map((estudante, index) => {
                                            const status = getStatusNota(notas[estudante.id]);
                                            return (
                                                <tr key={estudante.id}>
                                                    <td>{index + 1}</td>
                                                    <td className="fw-bold">{estudante.nome}</td>
                                                    <td style={{ width: "150px" }}>
                                                        {modoEdicao[estudante.id] ? (
                                                            <input
                                                                type="number"
                                                                className="form-control"
                                                                step="0.1"
                                                                min="0"
                                                                max="10"
                                                                value={notas[estudante.id] || ""}
                                                                onChange={(e) => handleNotaChange(estudante.id, e.target.value)}
                                                                placeholder="0 a 10"
                                                                style={{ width: "100px" }}
                                                            />
                                                        ) : (
                                                            <span className="fw-bold">
                                                                {notas[estudante.id] ? parseFloat(notas[estudante.id]).toFixed(1) : "—"}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <span className="badge" style={{ backgroundColor: status.cor }}>
                                                            {status.texto}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {!modoEdicao[estudante.id] ? (
                                                            <button
                                                                className={`btn btn-sm ${Style.botoesGestaoCurso}`}
                                                                onClick={() => habilitarEdicao(estudante.id)}
                                                            >
                                                                <FaEdit className="me-1" /> Editar
                                                            </button>
                                                        ) : (
                                                            <button
                                                                className={`btn btn-sm ${Style.botoesGestaoCurso}`}
                                                                onClick={() => salvarNota(estudante.id)}
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

            {/* Instruções */}
            {!cursoSelecionado && (
                <div className="row">
                    <div className="col-12">
                        <div className="alert alert-info text-center">
                            <FaCheckCircle size={20} className="me-2" />
                            Selecione um curso para começar a lançar as notas
                        </div>
                    </div>
                </div>
            )}
        </FuncionarioLayout>
    );
}

export default LancarNotasM;