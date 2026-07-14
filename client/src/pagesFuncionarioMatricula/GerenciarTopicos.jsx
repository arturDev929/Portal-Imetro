// src/pagesFuncionarioMatricula/GerenciarTopicos.jsx
import FuncionarioLayout from "../layouts/FuncionarioLayout";
import { useEffect, useState } from "react";
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaFilePdf, FaUpload, FaDownload } from 'react-icons/fa';
import { MdTopic } from 'react-icons/md';
import Style from "../pagesAdm/GestaoCursoAdm.module.css";
import api from "../service/api";
import { showSuccessToast, showErrorToast } from "../components/global/CustomToast";

function GerenciarTopicos() {
    const [user, setUser] = useState(null);
    const [userId, setUserId] = useState(null);
    const [topicos, setTopicos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modoEdicao, setModoEdicao] = useState(null);
    const [novoTopico, setNovoTopico] = useState("");
    const [arquivoTopico, setArquivoTopico] = useState(null);
    const [nomeArquivo, setNomeArquivo] = useState("");
    const [topicoEditando, setTopicoEditando] = useState("");
    const [mensagem, setMensagem] = useState({ texto: "", tipo: "" });

    useEffect(() => {
        const usuarioSalvo = localStorage.getItem("usuarioLogado");
        if (usuarioSalvo) {
            try {
                const userData = JSON.parse(usuarioSalvo);
                setUser(userData);
                const id = userData.id || userData.id_user || userData.userId || userData.id_usuario;
                setUserId(id);
            } catch (e) {
                // Erro ao parsear usuário
            }
        }
        carregarTopicos();
    }, []);

    async function carregarTopicos() {
        setLoading(true);
        try {
            const response = await api.get("/topico");
            if (response.data.success) {
                // Se a API retornar um array, use response.data.data
                // Se retornar um único objeto, coloque em um array
                const dados = response.data.data;
                if (Array.isArray(dados)) {
                    setTopicos(dados);
                } else if (dados) {
                    setTopicos([dados]);
                } else {
                    setTopicos([]);
                }
            } else {
                setTopicos([]);
            }
        } catch (error) {
            setTopicos([]);
        } finally {
            setLoading(false);
        }
    }

    const handleArquivoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type !== 'application/pdf') {
                showErrorToast("Por favor, selecione um arquivo PDF");
                e.target.value = '';
                return;
            }
            if (file.size > 10 * 1024 * 1024) {
                showErrorToast("O arquivo deve ter no máximo 10MB");
                e.target.value = '';
                return;
            }
            setArquivoTopico(file);
            setNomeArquivo(file.name);
        }
    };

    async function handleSalvarTopico() {
        if (!novoTopico || novoTopico.trim() === "") {
            setMensagem({ texto: "Digite um tópico válido", tipo: "error" });
            setTimeout(() => setMensagem({ texto: "", tipo: "" }), 3000);
            return;
        }

        if (!arquivoTopico) {
            setMensagem({ texto: "Selecione um arquivo PDF para o tópico", tipo: "error" });
            setTimeout(() => setMensagem({ texto: "", tipo: "" }), 3000);
            return;
        }

        if (!userId) {
            showErrorToast("Usuário não identificado. Faça login novamente.");
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("topico", novoTopico.trim());
            formData.append("id_user", userId);
            formData.append("arquivo", arquivoTopico);

            const response = await api.post("/topico", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                showSuccessToast(response.data.message || "Tópico salvo com sucesso!");
                setNovoTopico("");
                setArquivoTopico(null);
                setNomeArquivo("");
                document.getElementById('arquivoInput').value = '';
                await carregarTopicos();
                setMensagem({ texto: response.data.message || "Tópico salvo com sucesso!", tipo: "success" });
                setTimeout(() => setMensagem({ texto: "", tipo: "" }), 3000);
            } else {
                showErrorToast(response.data.error || "Erro ao salvar tópico");
                setMensagem({ texto: response.data.error || "Erro ao salvar tópico", tipo: "error" });
                setTimeout(() => setMensagem({ texto: "", tipo: "" }), 3000);
            }
        } catch (error) {
            showErrorToast("Erro ao processar solicitação");
            setMensagem({ texto: "Erro ao processar solicitação", tipo: "error" });
            setTimeout(() => setMensagem({ texto: "", tipo: "" }), 3000);
        } finally {
            setLoading(false);
        }
    }

    async function handleAtualizarTopico(id) {
        if (!topicoEditando || topicoEditando.trim() === "") {
            setMensagem({ texto: "Digite um tópico válido", tipo: "error" });
            setTimeout(() => setMensagem({ texto: "", tipo: "" }), 3000);
            return;
        }

        setLoading(true);
        try {
            const response = await api.put(`/topico/${id}`, { 
                topico: topicoEditando.trim(),
                id_user: userId
            });

            if (response.data.success) {
                showSuccessToast(response.data.message || "Tópico atualizado com sucesso!");
                setModoEdicao(null);
                setTopicoEditando("");
                await carregarTopicos();
                setMensagem({ texto: response.data.message || "Tópico atualizado com sucesso!", tipo: "success" });
                setTimeout(() => setMensagem({ texto: "", tipo: "" }), 3000);
            } else {
                showErrorToast(response.data.error || "Erro ao atualizar tópico");
                setMensagem({ texto: response.data.error || "Erro ao atualizar tópico", tipo: "error" });
                setTimeout(() => setMensagem({ texto: "", tipo: "" }), 3000);
            }
        } catch (error) {
            showErrorToast("Erro ao processar solicitação");
            setMensagem({ texto: "Erro ao processar solicitação", tipo: "error" });
            setTimeout(() => setMensagem({ texto: "", tipo: "" }), 3000);
        } finally {
            setLoading(false);
        }
    }

    async function handleDeletarTopico(id) {
        if (!window.confirm("Tem certeza que deseja deletar este tópico?")) return;

        setLoading(true);
        try {
            const response = await api.delete(`/topico/${id}`);

            if (response.data.success) {
                showSuccessToast(response.data.message || "Tópico deletado com sucesso!");
                await carregarTopicos();
                setMensagem({ texto: response.data.message || "Tópico deletado com sucesso!", tipo: "success" });
                setTimeout(() => setMensagem({ texto: "", tipo: "" }), 3000);
            } else {
                showErrorToast(response.data.error || "Erro ao deletar tópico");
                setMensagem({ texto: response.data.error || "Erro ao deletar tópico", tipo: "error" });
                setTimeout(() => setMensagem({ texto: "", tipo: "" }), 3000);
            }
        } catch (error) {
            showErrorToast("Erro ao processar solicitação");
            setMensagem({ texto: "Erro ao processar solicitação", tipo: "error" });
            setTimeout(() => setMensagem({ texto: "", tipo: "" }), 3000);
        } finally {
            setLoading(false);
        }
    }

    const iniciarEdicao = (topico) => {
        setModoEdicao(topico.id_topicoexame);
        setTopicoEditando(topico.topico);
    };

    const cancelarEdicao = () => {
        setModoEdicao(null);
        setTopicoEditando("");
    };

    // Função para baixar o arquivo
    const baixarArquivo = (nomeArquivo) => {
        if (!nomeArquivo) return;
        window.open(`${api.defaults.baseURL}/topico/arquivo/${nomeArquivo}`, '_blank');
    };

    // Função para mostrar o nome do arquivo
    const getNomeExibicao = (topico) => {
        // Se tiver nome_original, mostra ele
        if (topico.nome_original) {
            return topico.nome_original;
        }
        // Senão, mostra o nome do arquivo (pode ser o nome único)
        if (topico.arquivo) {
            // Tenta extrair o nome original do caminho
            return topico.arquivo;
        }
        return "Sem arquivo";
    };

    return (
        <FuncionarioLayout>
            <div className="row mb-4">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h2 style={{ color: 'var(--azul-escuro)', fontWeight: '600' }}>
                                <MdTopic className="me-2" />
                                Gerenciamento de Tópicos
                            </h2>
                            {user && (
                                <p className="text-muted mb-0">
                                    Bem-vindo, {user.nome || user.name} | Gerencie os tópicos do exame de inscrição
                                </p>
                            )}
                        </div>
                        <div className="badge p-3" style={{ backgroundColor: 'var(--azul-escuro)' }}>
                            <MdTopic size={24} color="white" />
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

            <div className="row">
                <div className="col-12">
                    <div className="card shadow-sm border-0">
                        <div className="card-body p-4">
                            {/* Formulário para criar novo tópico */}
                            <div className="row g-3 align-items-end">
                                <div className="col-md-4">
                                    <label className="form-label fw-bold" style={{ color: 'var(--azul-escuro)' }}>
                                        Título do Tópico
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Ex: Exame de Admissão 2026"
                                        value={novoTopico}
                                        onChange={(e) => setNovoTopico(e.target.value)}
                                        disabled={loading}
                                    />
                                </div>
                                <div className="col-md-5">
                                    <label className="form-label fw-bold" style={{ color: 'var(--azul-escuro)' }}>
                                        Arquivo PDF
                                    </label>
                                    <div className="input-group">
                                        <input
                                            type="file"
                                            className="d-none"
                                            id="arquivoInput"
                                            accept=".pdf"
                                            onChange={handleArquivoChange}
                                            disabled={loading}
                                        />
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Selecione um arquivo PDF"
                                            value={nomeArquivo}
                                            readOnly
                                        />
                                        <button
                                            className="btn btn-outline-secondary"
                                            type="button"
                                            onClick={() => document.getElementById('arquivoInput').click()}
                                            disabled={loading}
                                        >
                                            <FaUpload />
                                        </button>
                                    </div>
                                    {nomeArquivo && (
                                        <small className="text-success">
                                            <FaFilePdf className="me-1" />
                                            {nomeArquivo} ({(arquivoTopico?.size / 1024).toFixed(1)} KB)
                                        </small>
                                    )}
                                </div>
                                <div className="col-md-3">
                                    <button
                                        className={`btn w-100 ${Style.botoesGestaoCurso}`}
                                        onClick={handleSalvarTopico}
                                        disabled={loading || !novoTopico.trim() || !arquivoTopico || !userId}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" />
                                                Salvando...
                                            </>
                                        ) : (
                                            <>
                                                <FaPlus className="me-2" />
                                                Adicionar Tópico
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <hr className="my-4" />

                            {/* Lista de tópicos */}
                            <h5 className="mb-3" style={{ color: 'var(--azul-escuro)' }}>
                                Tópicos Ativos
                            </h5>

                            {loading && topicos.length === 0 ? (
                                <div className="text-center py-4">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Carregando...</span>
                                    </div>
                                </div>
                            ) : topicos.length === 0 ? (
                                <div className="alert alert-info text-center">
                                    <MdTopic className="me-2" />
                                    Nenhum tópico cadastrado. Crie um novo tópico acima.
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover">
                                        <thead style={{ backgroundColor: 'var(--azul-escuro)', color: 'white' }}>
                                            <tr>
                                                <th>#</th>
                                                <th>Tópico</th>
                                                <th>Arquivo</th>
                                                <th>Data de Criação</th>
                                                <th>Status</th>
                                                <th className="text-center">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {topicos.map((topico, index) => (
                                                <tr key={topico.id_topicoexame}>
                                                    <td>{index + 1}</td>
                                                    <td>
                                                        {modoEdicao === topico.id_topicoexame ? (
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                value={topicoEditando}
                                                                onChange={(e) => setTopicoEditando(e.target.value)}
                                                                disabled={loading}
                                                            />
                                                        ) : (
                                                            <span className="fw-bold">{topico.topico}</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        {topico.arquivo ? (
                                                            <div className="d-flex align-items-center gap-2">
                                                                <FaFilePdf className="text-danger" />
                                                                <span className="text-truncate" style={{ maxWidth: "150px" }}>
                                                                    {getNomeExibicao(topico)}
                                                                </span>
                                                                <button
                                                                    className="btn btn-sm btn-outline-primary"
                                                                    onClick={() => baixarArquivo(topico.arquivo)}
                                                                    title="Baixar arquivo"
                                                                >
                                                                    <FaDownload />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted">Nenhum arquivo</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        {topico.data_criacao 
                                                            ? new Date(topico.data_criacao).toLocaleDateString('pt-BR')
                                                            : 'N/A'}
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${topico.status === 'Ativo' ? 'bg-success' : 'bg-secondary'}`}>
                                                            {topico.status || 'Ativo'}
                                                        </span>
                                                    </td>
                                                    <td className="text-center">
                                                        {modoEdicao === topico.id_topicoexame ? (
                                                            <div className="d-flex gap-1 justify-content-center">
                                                                <button
                                                                    className={`btn btn-sm ${Style.botoesGestaoCurso}`}
                                                                    onClick={() => handleAtualizarTopico(topico.id_topicoexame)}
                                                                    disabled={loading || !topicoEditando.trim()}
                                                                    title="Salvar"
                                                                >
                                                                    <FaSave />
                                                                </button>
                                                                <button
                                                                    className={`btn btn-sm ${Style.btnCancelar}`}
                                                                    onClick={cancelarEdicao}
                                                                    disabled={loading}
                                                                    title="Cancelar"
                                                                >
                                                                    <FaTimes />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="d-flex gap-1 justify-content-center">
                                                                <button
                                                                    className={`btn btn-sm ${Style.btnOutros}`}
                                                                    onClick={() => iniciarEdicao(topico)}
                                                                    disabled={loading}
                                                                    title="Editar"
                                                                >
                                                                    <FaEdit />
                                                                </button>
                                                                <button
                                                                    className={`btn btn-sm ${Style.btnDeletar}`}
                                                                    onClick={() => handleDeletarTopico(topico.id_topicoexame)}
                                                                    disabled={loading}
                                                                    title="Deletar"
                                                                >
                                                                    <FaTrash />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </FuncionarioLayout>
    );
}

export default GerenciarTopicos;