// src/pagesTeacher/Configuracoes.jsx
import FuncionarioLayout from "../layouts/FuncionarioLayout";
import { useEffect, useState } from "react";
import { FaUser, FaSave, FaEdit, FaUserCircle, FaPhone, FaEnvelope, FaIdCard } from 'react-icons/fa';
import { MdPerson, MdEmail, MdPhone, MdBadge } from 'react-icons/md';
import Style from "../pagesAdm/GestaoCursoAdm.module.css";
import api from "../service/api";
import { showSuccessToast, showErrorToast } from "../components/global/CustomToast";

function Configuracoes() {
    const [user, setUser] = useState(null);
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [editando, setEditando] = useState(false);
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        contacto: '',
        bi: '',
        foto: null
    });
    const [fotoPreview, setFotoPreview] = useState(null);
    const [erros, setErros] = useState({});

    useEffect(() => {
        const usuarioSalvo = localStorage.getItem("usuarioLogado");
        if (usuarioSalvo) {
            try {
                const userData = JSON.parse(usuarioSalvo);
                setUser(userData);
                const id = userData.id || userData.id_user || userData.userId || userData.id_usuario;
                setUserId(id);
                
                // Preencher formulário com dados do usuário
                setFormData({
                    nome: userData.nome || userData.name || '',
                    email: userData.email || '',
                    contacto: userData.contacto || userData.telefone || '',
                    bi: userData.bi || userData.identificacao || '',
                    foto: null
                });
                
                if (userData.foto) {
                    setFotoPreview(`${window.location.origin}/api/img/usuarios/${userData.foto}`);
                }
            } catch (e) {
                // Erro ao parsear usuário
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

    const handleFotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                showErrorToast("Por favor, selecione uma imagem válida");
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                showErrorToast("A imagem deve ter no máximo 5MB");
                return;
            }
            setFormData(prev => ({
                ...prev,
                foto: file
            }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setFotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const validarFormulario = () => {
        const novosErros = {};

        if (!formData.nome || formData.nome.trim().length < 3) {
            novosErros.nome = "Nome completo é obrigatório (mínimo 3 caracteres)";
        }

        if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
            novosErros.email = "Email válido é obrigatório";
        }

        if (!formData.contacto || formData.contacto.trim().length < 9) {
            novosErros.contacto = "Contacto é obrigatório (mínimo 9 dígitos)";
        }

        setErros(novosErros);
        return Object.keys(novosErros).length === 0;
    };

    const handleSalvar = async () => {
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
            const formDataToSend = new FormData();
            formDataToSend.append("id_user", userId);
            formDataToSend.append("nome", formData.nome.trim());
            formDataToSend.append("email", formData.email.trim().toLowerCase());
            formDataToSend.append("contacto", formData.contacto.trim());
            formDataToSend.append("bi", formData.bi?.trim() || '');
            
            if (formData.foto) {
                formDataToSend.append("foto", formData.foto);
            }

            const response = await api.put("/atualizarUsuario", formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                showSuccessToast(response.data.message || "Dados atualizados com sucesso!");
                
                // Atualizar dados no localStorage
                const usuarioSalvo = localStorage.getItem("usuarioLogado");
                if (usuarioSalvo) {
                    const userData = JSON.parse(usuarioSalvo);
                    const updatedUser = {
                        ...userData,
                        nome: formData.nome.trim(),
                        email: formData.email.trim().toLowerCase(),
                        contacto: formData.contacto.trim(),
                        bi: formData.bi?.trim() || userData.bi,
                        foto: response.data.foto || userData.foto
                    };
                    localStorage.setItem("usuarioLogado", JSON.stringify(updatedUser));
                    setUser(updatedUser);
                }
                
                setEditando(false);
            } else {
                showErrorToast(response.data.error || "Erro ao atualizar dados");
            }
        } catch (error) {
            showErrorToast(error.response?.data?.mensagem || "Erro ao processar solicitação");
        } finally {
            setLoading(false);
        }
    };

    const cancelarEdicao = () => {
        setEditando(false);
        // Restaurar dados originais
        if (user) {
            setFormData({
                nome: user.nome || user.name || '',
                email: user.email || '',
                contacto: user.contacto || user.telefone || '',
                bi: user.bi || user.identificacao || '',
                foto: null
            });
            if (user.foto) {
                setFotoPreview(`${window.location.origin}/api/img/usuarios/${user.foto}`);
            } else {
                setFotoPreview(null);
            }
        }
        setErros({});
    };

    return (
        <FuncionarioLayout>
            <div className="row mb-4">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h2 style={{ color: 'var(--azul-escuro)', fontWeight: '600' }}>
                                <FaUser className="me-2" />
                                Configurações
                            </h2>
                            {user && (
                                <p className="text-muted mb-0">
                                    Bem-vindo, {user.nome || user.name} | Edite suas informações pessoais
                                </p>
                            )}
                        </div>
                        <div className="badge p-3" style={{ backgroundColor: 'var(--azul-escuro)' }}>
                            <FaUser size={24} color="white" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-12">
                    <div className="card shadow-sm border-0">
                        <div className="card-body p-4">
                            {/* Foto */}
                            <div className="row mb-4">
                                <div className="col-12 text-center">
                                    <div className="position-relative d-inline-block">
                                        <div
                                            className="rounded-circle border-2 border-primary d-flex align-items-center justify-content-center"
                                            style={{
                                                width: '120px',
                                                height: '120px',
                                                backgroundColor: '#f8f9fa',
                                                overflow: 'hidden',
                                                cursor: editando ? 'pointer' : 'default'
                                            }}
                                            onClick={() => editando && document.getElementById('fotoInput').click()}
                                        >
                                            {fotoPreview ? (
                                                <img
                                                    src={fotoPreview}
                                                    alt="Preview"
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <FaUserCircle size={60} color="#6c757d" />
                                            )}
                                        </div>
                                        {editando && (
                                            <>
                                                <input
                                                    id="fotoInput"
                                                    type="file"
                                                    accept="image/*"
                                                    className="d-none"
                                                    onChange={handleFotoChange}
                                                    disabled={loading}
                                                />
                                                <button
                                                    type="button"
                                                    className="btn btn-primary btn-sm position-absolute bottom-0 end-0 rounded-circle"
                                                    onClick={() => document.getElementById('fotoInput').click()}
                                                    style={{ transform: 'translate(25%, 25%)' }}
                                                    disabled={loading}
                                                >
                                                    <FaEdit size={12} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                    <p className="text-muted mt-2 small">
                                        {editando ? "Clique no ícone de edição para trocar a foto" : "Modo de visualização"}
                                    </p>
                                </div>
                            </div>

                            <hr />

                            {/* Formulário */}
                            <form onSubmit={(e) => { e.preventDefault(); handleSalvar(); }}>
                                <div className="row g-4">
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold">
                                            <MdPerson className="me-1" />
                                            Nome Completo *
                                        </label>
                                        <input
                                            type="text"
                                            name="nome"
                                            className={`form-control ${erros.nome ? 'is-invalid' : ''}`}
                                            value={formData.nome}
                                            onChange={handleChange}
                                            disabled={!editando || loading}
                                            placeholder="Digite seu nome completo"
                                        />
                                        {erros.nome && (
                                            <div className="text-danger small mt-1">{erros.nome}</div>
                                        )}
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label fw-bold">
                                            <MdEmail className="me-1" />
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            className={`form-control ${erros.email ? 'is-invalid' : ''}`}
                                            value={formData.email}
                                            onChange={handleChange}
                                            disabled={!editando || loading}
                                            placeholder="Digite seu email"
                                        />
                                        {erros.email && (
                                            <div className="text-danger small mt-1">{erros.email}</div>
                                        )}
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label fw-bold">
                                            <MdPhone className="me-1" />
                                            Contacto *
                                        </label>
                                        <input
                                            type="tel"
                                            name="contacto"
                                            className={`form-control ${erros.contacto ? 'is-invalid' : ''}`}
                                            value={formData.contacto}
                                            onChange={handleChange}
                                            disabled={!editando || loading}
                                            placeholder="Digite seu número de telefone"
                                        />
                                        {erros.contacto && (
                                            <div className="text-danger small mt-1">{erros.contacto}</div>
                                        )}
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label fw-bold">
                                            <MdBadge className="me-1" />
                                            BI / Identificação
                                        </label>
                                        <input
                                            type="text"
                                            name="bi"
                                            className="form-control"
                                            value={formData.bi}
                                            onChange={handleChange}
                                            disabled={!editando || loading}
                                            placeholder="Digite seu número de BI"
                                        />
                                    </div>
                                </div>

                                <div className="d-flex gap-2 justify-content-end mt-4">
                                    {!editando ? (
                                        <button
                                            type="button"
                                            className={`btn ${Style.botoesGestaoCurso}`}
                                            onClick={() => setEditando(true)}
                                            disabled={loading}
                                        >
                                            <FaEdit className="me-2" />
                                            Editar Dados
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                type="button"
                                                className={`btn ${Style.btnCancelar}`}
                                                onClick={cancelarEdicao}
                                                disabled={loading}
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                type="submit"
                                                className={`btn ${Style.botoesGestaoCurso}`}
                                                disabled={loading}
                                            >
                                                {loading ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" />
                                                        Salvando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <FaSave className="me-2" />
                                                        Salvar Alterações
                                                    </>
                                                )}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </FuncionarioLayout>
    );
}

export default Configuracoes;