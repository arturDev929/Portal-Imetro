// src/pagesTeacher/Seguranca.jsx
import FuncionarioLayout from "../layouts/FuncionarioLayout";
import { useEffect, useState } from "react";
import { FaLock, FaKey, FaSave, FaEye, FaEyeSlash } from 'react-icons/fa';
import { MdSecurity, MdPassword } from 'react-icons/md';
import Style from "../pagesAdm/GestaoCursoAdm.module.css";
import api from "../service/api";
import { showSuccessToast, showErrorToast } from "../components/global/CustomToast";

function Seguranca() {
    const [user, setUser] = useState(null);
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [mostrarSenhaAtual, setMostrarSenhaAtual] = useState(false);
    const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
    const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
    const [formData, setFormData] = useState({
        senhaAtual: '',
        novaSenha: '',
        confirmarSenha: ''
    });
    const [erros, setErros] = useState({});

    useEffect(() => {
        const usuarioSalvo = localStorage.getItem("usuarioLogado");
        if (usuarioSalvo) {
            try {
                const userData = JSON.parse(usuarioSalvo);
                setUser(userData);
                const id = userData.id || userData.id_user || userData.userId || userData.id_usuario;
                setUserId(id);
            } catch (e) {
                console.error("Erro ao parsear usuário:", e);
            }
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (erros[name]) {
            setErros(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const validarFormulario = () => {
        const novosErros = {};

        if (!formData.senhaAtual || formData.senhaAtual.length < 6) {
            novosErros.senhaAtual = "Senha atual é obrigatória (mínimo 6 caracteres)";
        }

        if (!formData.novaSenha || formData.novaSenha.length < 6) {
            novosErros.novaSenha = "Nova senha é obrigatória (mínimo 6 caracteres)";
        }

        if (formData.novaSenha !== formData.confirmarSenha) {
            novosErros.confirmarSenha = "As senhas não coincidem";
        }

        if (formData.senhaAtual === formData.novaSenha) {
            novosErros.novaSenha = "A nova senha deve ser diferente da senha atual";
        }

        setErros(novosErros);
        return Object.keys(novosErros).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validarFormulario()) {
            showErrorToast("Por favor, corrija os erros no formulário");
            return;
        }

        if (!userId) {
            showErrorToast("Usuário não identificado. Faça login novamente.");
            return;
        }

        setLoading(true);
        try {
            const response = await api.put('/alterarSenha', {
                id_user: userId,
                senhaAtual: formData.senhaAtual,
                novaSenha: formData.novaSenha
            });

            if (response.data.success) {
                showSuccessToast(response.data.message || "Senha alterada com sucesso!");
                setFormData({
                    senhaAtual: '',
                    novaSenha: '',
                    confirmarSenha: ''
                });
                setErros({});
            } else {
                showErrorToast(response.data.error || "Erro ao alterar senha");
            }
        } catch (error) {
            console.error("Erro ao alterar senha:", error);
            showErrorToast(error.response?.data?.mensagem || "Erro ao processar solicitação");
        } finally {
            setLoading(false);
        }
    };

    const toggleMostrarSenha = (campo) => {
        if (campo === 'senhaAtual') setMostrarSenhaAtual(!mostrarSenhaAtual);
        if (campo === 'novaSenha') setMostrarNovaSenha(!mostrarNovaSenha);
        if (campo === 'confirmarSenha') setMostrarConfirmarSenha(!mostrarConfirmarSenha);
    };

    return (
        <FuncionarioLayout>
            <div className="row mb-4">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h2 style={{ color: 'var(--azul-escuro)', fontWeight: '600' }}>
                                <FaLock className="me-2" />
                                Segurança
                            </h2>
                            {user && (
                                <p className="text-muted mb-0">
                                    Bem-vindo, {user.nome || user.name} | Alterar sua senha
                                </p>
                            )}
                        </div>
                        <div className="badge p-3" style={{ backgroundColor: 'var(--azul-escuro)' }}>
                            <MdSecurity size={24} color="white" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-12">
                    <div className="card shadow-sm border-0">
                        <div className="card-body p-4">
                            <h5 className="mb-3" style={{ color: 'var(--azul-escuro)' }}>
                                <MdPassword className="me-2" />
                                Alterar Senha
                            </h5>

                            <form onSubmit={handleSubmit}>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold">Senha Atual *</label>
                                        <div className="input-group">
                                            <span className="input-group-text"><FaKey /></span>
                                            <input
                                                type={mostrarSenhaAtual ? "text" : "password"}
                                                name="senhaAtual"
                                                className={`form-control ${erros.senhaAtual ? 'is-invalid' : ''}`}
                                                placeholder="Digite sua senha atual"
                                                value={formData.senhaAtual}
                                                onChange={handleChange}
                                                disabled={loading}
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary"
                                                onClick={() => toggleMostrarSenha('senhaAtual')}
                                                disabled={loading}
                                            >
                                                {mostrarSenhaAtual ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                        {erros.senhaAtual && (
                                            <div className="text-danger small mt-1">{erros.senhaAtual}</div>
                                        )}
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label fw-bold">Nova Senha *</label>
                                        <div className="input-group">
                                            <span className="input-group-text"><FaKey /></span>
                                            <input
                                                type={mostrarNovaSenha ? "text" : "password"}
                                                name="novaSenha"
                                                className={`form-control ${erros.novaSenha ? 'is-invalid' : ''}`}
                                                placeholder="Digite a nova senha (mín. 6 caracteres)"
                                                value={formData.novaSenha}
                                                onChange={handleChange}
                                                disabled={loading}
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary"
                                                onClick={() => toggleMostrarSenha('novaSenha')}
                                                disabled={loading}
                                            >
                                                {mostrarNovaSenha ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                        {erros.novaSenha && (
                                            <div className="text-danger small mt-1">{erros.novaSenha}</div>
                                        )}
                                        <div className="form-text">
                                            A senha deve ter no mínimo 6 caracteres
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label fw-bold">Confirmar Nova Senha *</label>
                                        <div className="input-group">
                                            <span className="input-group-text"><FaKey /></span>
                                            <input
                                                type={mostrarConfirmarSenha ? "text" : "password"}
                                                name="confirmarSenha"
                                                className={`form-control ${erros.confirmarSenha ? 'is-invalid' : ''}`}
                                                placeholder="Confirme a nova senha"
                                                value={formData.confirmarSenha}
                                                onChange={handleChange}
                                                disabled={loading}
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary"
                                                onClick={() => toggleMostrarSenha('confirmarSenha')}
                                                disabled={loading}
                                            >
                                                {mostrarConfirmarSenha ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                        {erros.confirmarSenha && (
                                            <div className="text-danger small mt-1">{erros.confirmarSenha}</div>
                                        )}
                                    </div>

                                    <div className="col-12 mt-4">
                                        <div className="d-flex justify-content-end">
                                            <button
                                                type="submit"
                                                className={`btn ${Style.botoesGestaoCurso}`}
                                                disabled={loading}
                                            >
                                                {loading ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" />
                                                        Alterando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <FaSave className="me-2" />
                                                        Alterar Senha
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </FuncionarioLayout>
    );
}

export default Seguranca;