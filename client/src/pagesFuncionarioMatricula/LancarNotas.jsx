// src/pagesFuncionarioMatricula/LancarNotas.jsx
import FuncionarioLayout from "../layouts/FuncionarioLayout";
import { useEffect, useState, useMemo, useCallback } from "react";
import Style from "../pagesAdm/GestaoCursoAdm.module.css";
import api from "../service/api";

function LancarNotasM() {
    const [user, setUser] = useState(null);
    const [cursos, setCursos] = useState([]);
    const [cursoSelecionado, setCursoSelecionado] = useState("");
    const [estudantes, setEstudantes] = useState([]);
    const [termoPesquisa, setTermoPesquisa] = useState("");
    const [notas, setNotas] = useState({});
    const [notasOriginal, setNotasOriginal] = useState({});
    const [modoEdicao, setModoEdicao] = useState(false);
    const [loading, setLoading] = useState(false);
    const [mensagem, setMensagem] = useState({ texto: "", tipo: "" });
    const [salvando, setSalvando] = useState(false);
    const [filtroStatus, setFiltroStatus] = useState("todos");
    const [progresso, setProgresso] = useState({ atual: 0, total: 0 });

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
            setCursos(response.data || []);
        } catch (error) {
            setMensagem({ texto: "Erro ao carregar cursos", tipo: "error" });
            setTimeout(() => setMensagem({ texto: "", tipo: "" }), 3000);
        }
    }

    async function carregarEstudantes(cursoId) {
        setLoading(true);
        try {
            const response = await api.get(`/EstudantesByCurso/${cursoId}`);
            const dados = response.data || [];
            setEstudantes(dados);

            const notasIniciais = {};
            dados.forEach(est => {
                const id = est.id_estudanteInscricao || est.id_est;
                const notaValue = est.nota_estudanteInscricao || est.nota;
                if (notaValue !== undefined && notaValue !== null && notaValue !== "") {
                    notasIniciais[id] = notaValue.toString();
                } else {
                    notasIniciais[id] = "";
                }
            });
            setNotas(notasIniciais);
            setNotasOriginal(notasIniciais);
            setTermoPesquisa("");
            setFiltroStatus("todos");
            setProgresso({ atual: 0, total: 0 });
        } catch (error) {
            setMensagem({ texto: "Erro ao carregar estudantes", tipo: "error" });
            setTimeout(() => setMensagem({ texto: "", tipo: "" }), 3000);
        } finally {
            setLoading(false);
        }
    }

    const handleCursoChange = (e) => {
        const cursoId = e.target.value;
        setCursoSelecionado(cursoId);
        setModoEdicao(false);
        if (cursoId) {
            carregarEstudantes(cursoId);
        } else {
            setEstudantes([]);
            setNotas({});
            setNotasOriginal({});
            setTermoPesquisa("");
        }
    };

    const getStatusNota = useCallback((nota) => {
        if (nota === "" || nota === null || nota === undefined) {
            return { texto: "Nao lancada", cor: "#6c757d" };
        }
        const notaNum = parseFloat(nota);
        if (isNaN(notaNum)) {
            return { texto: "Nao lancada", cor: "#6c757d" };
        }
        if (notaNum >= 10) return { texto: "Aprovado", cor: "#28a745" };
        return { texto: "Reprovado", cor: "#dc3545" };
    }, []);

    const estudantesFiltrados = useMemo(() => {
        if (!estudantes || !estudantes.length) return [];

        let filtrados = [...estudantes];

        if (termoPesquisa && termoPesquisa.trim() !== "") {
            const termoLower = termoPesquisa.toLowerCase().trim();
            filtrados = filtrados.filter(estudante => {
                const nome = (estudante.nome_estudanteInscricao || estudante.nome || "").toString().toLowerCase();
                const codigo = (estudante.numeroInscricao_estudanteInscricao || estudante.codigo || "").toString().toLowerCase();
                return nome.includes(termoLower) || codigo.includes(termoLower);
            });
        }

        if (filtroStatus !== "todos") {
            filtrados = filtrados.filter(estudante => {
                const id = estudante.id_estudanteInscricao || estudante.id_est;
                const nota = notas[id];
                const status = getStatusNota(nota);
                
                if (filtroStatus === "aprovado") {
                    return status.texto === "Aprovado";
                } else if (filtroStatus === "reprovado") {
                    return status.texto === "Reprovado";
                } else if (filtroStatus === "nao_lancado") {
                    return status.texto === "Nao lancada";
                }
                return true;
            });
        }

        return filtrados;
    }, [estudantes, termoPesquisa, filtroStatus, notas, getStatusNota]);

    const handleNotaChange = (estudanteId, value) => {
        let notaValida = value;
        if (value !== "") {
            const num = parseFloat(value);
            if (!isNaN(num)) {
                if (num < 0) notaValida = "0";
                if (num > 20) notaValida = "20";
                if (num.toString().includes('.')) {
                    notaValida = num.toFixed(1);
                }
            }
        }
        setNotas(prev => ({ ...prev, [estudanteId]: notaValida }));
    };

    const habilitarEdicaoGlobal = () => {
        setModoEdicao(true);
        setMensagem({ texto: "Modo de edicao ativado. Faca as alteracoes e clique em Salvar Todas", tipo: "info" });
        setTimeout(() => setMensagem({ texto: "", tipo: "" }), 5000);
    };

    const cancelarEdicao = () => {
        setModoEdicao(false);
        setNotas(notasOriginal);
        setProgresso({ atual: 0, total: 0 });
        setMensagem({ texto: "Alteracoes canceladas", tipo: "info" });
        setTimeout(() => setMensagem({ texto: "", tipo: "" }), 3000);
    };

    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const salvarTodasNotas = async () => {
        const notasParaSalvar = estudantes.map(estudante => {
            const id = estudante.id_estudanteInscricao || estudante.id_est;
            const nota = notas[id];
            const codigo = estudante.numeroInscricao_estudanteInscricao || estudante.codigo;
            
            return {
                id,
                codigo,
                nota: nota !== "" ? parseFloat(nota) : null
            };
        });

        // Filtrar apenas os que têm nota para salvar
        const notasComValor = notasParaSalvar.filter(item => item.nota !== null);

        if (notasComValor.length === 0) {
            setMensagem({ 
                texto: "Nenhuma nota para salvar", 
                tipo: "info" 
            });
            setTimeout(() => setMensagem({ texto: "", tipo: "" }), 3000);
            return;
        }

        // Validar notas
        const notasInvalidas = notasComValor.filter(item => 
            isNaN(item.nota) || item.nota < 0 || item.nota > 20
        );

        if (notasInvalidas.length > 0) {
            setMensagem({ 
                texto: `Existem ${notasInvalidas.length} nota(s) inválida(s). Use valores entre 0 e 20.`, 
                tipo: "error" 
            });
            setTimeout(() => setMensagem({ texto: "", tipo: "" }), 5000);
            return;
        }

        setSalvando(true);
        setLoading(true);
        setProgresso({ atual: 0, total: notasComValor.length });

        try {
            // Criar array de promessas com delay entre elas
            const promessas = notasComValor.map(async (item, index) => {
                // Adicionar delay progressivo para não sobrecarregar o servidor
                await delay(index * 150); // 150ms entre cada requisição
                
                try {
                    const response = await api.put(`/estudanteInscritoNota/${item.codigo}`, { 
                        nota: item.nota 
                    });
                    setProgresso(prev => ({ ...prev, atual: index + 1 }));
                    return {
                        success: true,
                        codigo: item.codigo,
                        data: response.data
                    };
                } catch (error) {
                    console.error(`Erro ao salvar nota do estudante ${item.codigo}:`, error);
                    setProgresso(prev => ({ ...prev, atual: index + 1 }));
                    return {
                        success: false,
                        codigo: item.codigo,
                        error: error.response?.data?.error || "Erro ao salvar"
                    };
                }
            });

            // Usar Promise.allSettled para capturar todas as respostas (sucesso e erro)
            const resultados = await Promise.allSettled(promessas);
            
            // Processar os resultados
            const sucessos = [];
            const erros = [];

            resultados.forEach((resultado) => {
                if (resultado.status === 'fulfilled' && resultado.value.success) {
                    sucessos.push(resultado.value);
                } else if (resultado.status === 'fulfilled' && !resultado.value.success) {
                    erros.push(resultado.value);
                } else if (resultado.status === 'rejected') {
                    erros.push({
                        success: false,
                        error: "Erro na requisição",
                        details: resultado.reason
                    });
                }
            });

            // Exibir mensagem baseada nos resultados
            if (erros.length === 0) {
                setMensagem({ 
                    texto: `Todas as ${sucessos.length} nota(s) foram salvas com sucesso!`, 
                    tipo: "success" 
                });
                setModoEdicao(false);
                setNotasOriginal(notas);
                await carregarEstudantes(cursoSelecionado);
            } else if (sucessos.length > 0) {
                setMensagem({ 
                    texto: `${sucessos.length} nota(s) salvas com sucesso. ${erros.length} erro(s) ao salvar.`, 
                    tipo: "warning" 
                });
                // Recarregar para mostrar o que foi salvo
                await carregarEstudantes(cursoSelecionado);
            } else {
                setMensagem({ 
                    texto: `Erro ao salvar as notas. Verifique os dados e tente novamente.`, 
                    tipo: "error" 
                });
            }

            // Log detalhado dos erros
            if (erros.length > 0) {
                console.error("Erros ao salvar notas:", erros);
            }

        } catch (error) {
            console.error("Erro geral ao salvar notas:", error);
            setMensagem({ 
                texto: "Erro ao processar as requisições. Tente novamente.", 
                tipo: "error" 
            });
        } finally {
            setLoading(false);
            setSalvando(false);
            setTimeout(() => {
                setMensagem({ texto: "", tipo: "" });
                setProgresso({ atual: 0, total: 0 });
            }, 5000);
        }
    };

    const temAlteracoes = () => {
        return JSON.stringify(notas) !== JSON.stringify(notasOriginal);
    };

    const limparPesquisa = () => {
        setTermoPesquisa("");
        setFiltroStatus("todos");
    };

    const contarPorStatus = (status) => {
        if (!estudantes || !estudantes.length) return 0;
        return estudantes.filter(estudante => {
            const id = estudante.id_estudanteInscricao || estudante.id_est;
            const nota = notas[id];
            const statusNota = getStatusNota(nota);
            return statusNota.texto === status;
        }).length;
    };

    return (
        <FuncionarioLayout>
            <div className="row mb-4">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h2 style={{ color: 'var(--azul-escuro)', fontWeight: '600' }}>
                                Lancamento de Notas
                            </h2>
                            {user && (
                                <p className="text-muted mb-0">
                                    Bem-vindo, {user.nome} | Lancamento de notas por curso
                                </p>
                            )}
                        </div>
                        <div className="badge p-3" style={{ backgroundColor: 'var(--azul-escuro)' }}>
                            Notas
                        </div>
                    </div>
                </div>
            </div>

            {mensagem.texto && (
                <div className="row mb-3">
                    <div className="col-12">
                        <div className={`alert alert-${mensagem.tipo === "success" ? "success" : mensagem.tipo === "info" ? "info" : mensagem.tipo === "warning" ? "warning" : "danger"} text-center`}>
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
                        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
                            <div className="d-flex align-items-center gap-2 flex-wrap">
                                <h4 className="mb-0" style={{ color: 'var(--azul-escuro)' }}>
                                    Lancar Notas dos Estudantes
                                </h4>
                                <span className="badge bg-secondary ms-2">
                                    Total: {estudantes.length}
                                </span>
                                <span className="badge bg-success ms-1">
                                    Aprovados: {contarPorStatus("Aprovado")}
                                </span>
                                <span className="badge bg-danger ms-1">
                                    Reprovados: {contarPorStatus("Reprovado")}
                                </span>
                                <span className="badge bg-secondary ms-1">
                                    Nao lancados: {contarPorStatus("Nao lancada")}
                                </span>
                            </div>
                            <div className="d-flex gap-2 mt-2 mt-md-0">
                                {!modoEdicao ? (
                                    <button
                                        className={`btn ${Style.botoesGestaoCurso}`}
                                        onClick={habilitarEdicaoGlobal}
                                        disabled={loading || estudantes.length === 0}
                                    >
                                        Editar Todas
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            className="btn btn-success"
                                            onClick={salvarTodasNotas}
                                            disabled={loading || salvando || !temAlteracoes()}
                                            style={{ backgroundColor: '#28a745', borderColor: '#28a745', color: 'white' }}
                                        >
                                            {salvando ? "Salvando..." : "Salvar Todas"}
                                        </button>
                                        <button
                                            className="btn btn-secondary"
                                            onClick={cancelarEdicao}
                                            disabled={loading || salvando}
                                        >
                                            Cancelar
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Barra de progresso */}
                        {progresso.total > 0 && (
                            <div className="mb-3">
                                <div className="progress" style={{ height: '25px' }}>
                                    <div 
                                        className="progress-bar progress-bar-striped progress-bar-animated"
                                        role="progressbar"
                                        style={{ 
                                            width: `${(progresso.atual / progresso.total) * 100}%`,
                                            backgroundColor: '#007bff'
                                        }}
                                    >
                                        {progresso.atual}/{progresso.total} - {Math.round((progresso.atual / progresso.total) * 100)}%
                                    </div>
                                </div>
                                <small className="text-muted">
                                    Salvando notas... {progresso.atual} de {progresso.total}
                                </small>
                            </div>
                        )}

                        <div className="row mb-3">
                            <div className="col-md-7">
                                <div className="input-group">
                                    <span className="input-group-text" style={{ backgroundColor: 'var(--azul-escuro)', color: 'white' }}>
                                        Buscar
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Pesquisar por nome ou codigo do estudante..."
                                        value={termoPesquisa}
                                        onChange={(e) => setTermoPesquisa(e.target.value)}
                                        style={{ borderColor: 'var(--azul-escuro)' }}
                                    />
                                    {termoPesquisa && (
                                        <button
                                            className="btn btn-outline-secondary"
                                            type="button"
                                            onClick={limparPesquisa}
                                        >
                                            Limpar
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="col-md-5 mt-2 mt-md-0">
                                <div className="input-group">
                                    <span className="input-group-text" style={{ backgroundColor: 'var(--azul-escuro)', color: 'white' }}>
                                        Filtrar
                                    </span>
                                    <select
                                        className="form-select"
                                        value={filtroStatus}
                                        onChange={(e) => setFiltroStatus(e.target.value)}
                                        style={{ borderColor: 'var(--azul-escuro)' }}
                                    >
                                        <option value="todos">Todos os Status ({estudantes.length})</option>
                                        <option value="aprovado">Aprovados ({contarPorStatus("Aprovado")})</option>
                                        <option value="reprovado">Reprovados ({contarPorStatus("Reprovado")})</option>
                                        <option value="nao_lancado">Nao Lancados ({contarPorStatus("Nao lancada")})</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {termoPesquisa && (
                            <div className="alert alert-info mb-3">
                                Resultados: {estudantesFiltrados.length} estudante(s) encontrado(s) para "{termoPesquisa}"
                            </div>
                        )}

                        {modoEdicao && (
                            <div className="alert alert-warning">
                                <i className="bi bi-info-circle me-2"></i>
                                Modo de edicao ativo: Voce pode editar todas as notas. Clique em "Salvar Todas" para confirmar ou "Cancelar" para descartar as alteracoes.
                                {temAlteracoes() && (
                                    <span className="ms-2 badge bg-warning text-dark">
                                        {Object.keys(notas).filter(id => notas[id] !== notasOriginal[id]).length} alteracoes pendentes
                                    </span>
                                )}
                            </div>
                        )}

                        {loading && !salvando ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Carregando...</span>
                                </div>
                            </div>
                        ) : estudantes.length === 0 ? (
                            <div className="alert alert-info text-center">
                                Nenhum estudante admitido ou aprovado encontrado para este curso.
                            </div>
                        ) : estudantesFiltrados.length === 0 ? (
                            <div className="alert alert-warning text-center">
                                Nenhum estudante encontrado com os filtros aplicados.
                                <button className="btn btn-link" onClick={limparPesquisa}>
                                    Limpar filtros
                                </button>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead style={{ backgroundColor: 'var(--azul-escuro)', color: 'white' }}>
                                        <tr>
                                            <th>#</th>
                                            <th>Nome do Estudante</th>
                                            <th>Codigo</th>
                                            <th>Nota</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {estudantesFiltrados.map((estudante, index) => {
                                            const id = estudante.id_estudanteInscricao || estudante.id_est;
                                            const notaAtual = notas[id] || "";
                                            const status = getStatusNota(notaAtual);
                                            const notaOriginal = notasOriginal[id] || "";
                                            const foiAlterada = notaAtual !== notaOriginal;

                                            let rowClass = '';
                                            if (!modoEdicao) {
                                                if (status.texto === "Aprovado") rowClass = 'table-success';
                                                else if (status.texto === "Reprovado") rowClass = 'table-danger';
                                                else rowClass = 'table-secondary';
                                            } else if (foiAlterada) {
                                                rowClass = 'table-warning';
                                            }

                                            return (
                                                <tr key={id} className={rowClass}>
                                                    <td>{index + 1}</td>
                                                    <td className="fw-bold">
                                                        {estudante.nome_estudanteInscricao || estudante.nome || "N/A"}
                                                    </td>
                                                    <td>{estudante.numeroInscricao_estudanteInscricao || estudante.codigo || "N/A"}</td>
                                                    <td style={{ width: "200px" }}>
                                                        {modoEdicao ? (
                                                            <input
                                                                type="number"
                                                                className={`form-control ${foiAlterada ? 'border-warning' : ''}`}
                                                                step="0.1"
                                                                min="0"
                                                                max="20"
                                                                value={notaAtual || ""}
                                                                onChange={(e) => handleNotaChange(id, e.target.value)}
                                                                placeholder="0 a 20"
                                                                style={{ width: "120px" }}
                                                                disabled={salvando}
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
                                                        {foiAlterada && modoEdicao && (
                                                            <span className="ms-2 text-warning">*</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                    {modoEdicao && (
                                        <tfoot style={{ backgroundColor: '#f8f9fa' }}>
                                            <tr>
                                                <td colSpan="5" className="text-center">
                                                    <small className="text-muted">
                                                        * Campos em amarelo indicam alteracoes pendentes
                                                    </small>
                                                </td>
                                            </tr>
                                        </tfoot>
                                    )}
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
                            Selecione um curso para comecar a lancar as notas
                        </div>
                    </div>
                </div>
            )}
        </FuncionarioLayout>
    );
}

export default LancarNotasM;