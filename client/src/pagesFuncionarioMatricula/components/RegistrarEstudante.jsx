import FuncionarioLayout from "../layouts/FuncionarioLayout";
import { useEffect, useState, useRef } from "react";
import { FaUserPlus, FaSave, FaTimes, FaCamera, FaFileUpload, FaTrash, FaEnvelope, FaCheckCircle } from 'react-icons/fa';
import { MdPerson, MdPhone, MdEmail, MdBadge, MdSchool, MdAccessTime, MdLock } from 'react-icons/md';
import { RiFileList3Line } from 'react-icons/ri';
import { motion } from "framer-motion";
import Style from "../pagesAdm/GestaoCursoAdm.module.css";
import api from "../service/api";
import { showSuccessToast, showErrorToast } from "../components/global/CustomToast";

function RegistrarEstudante() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [cursos, setCursos] = useState([]);
    const [periodos, setPeriodos] = useState([]);
    
    // Estado do formulário
    const [formData, setFormData] = useState({
        nomeEstudante: '',
        contactoEstudante: '',
        sexoEstudante: '',
        emailEstudante: '',
        biEstudante: '',
        idcurso: '',
        id_periodo: '',
        senhaEstudante: '',
        confirmarSenha: '',
        codigo: ''
    });

    // Estado do código de verificação
    const [codigoEnviado, setCodigoEnviado] = useState(false);
    const [codigoVerificado, setCodigoVerificado] = useState(false);
    const [enviandoCodigo, setEnviandoCodigo] = useState(false);
    const [tempoRestante, setTempoRestante] = useState(0);
    const [emailVerificado, setEmailVerificado] = useState(false);
    const timerRef = useRef(null);

    const [foto, setFoto] = useState(null);
    const [fotoPreview, setFotoPreview] = useState(null);
    const [documentos, setDocumentos] = useState([]);
    const [erros, setErros] = useState({});
    const [step, setStep] = useState(1); // 1 = Dados, 2 = Verificação, 3 = Documentos

    useEffect(() => {
        const usuarioSalvo = localStorage.getItem("usuarioLogado");
        if (usuarioSalvo) {
            setUser(JSON.parse(usuarioSalvo));
        }
        carregarDados();
        
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    async function carregarDados() {
        try {
            setLoading(true);
            const [cursosRes, periodosRes] = await Promise.all([
                api.get("/cursos"),
                api.get("/periodos")
            ]);
            setCursos(cursosRes.data || []);
            setPeriodos(periodosRes.data || []);
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
            showErrorToast("Erro ao carregar dados para o formulário");
        } finally {
            setLoading(false);
        }
    }

    // ==================== HANDLERS DO FORMULÁRIO ====================
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

    // ==================== FOTO ====================
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
            setFoto(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setFotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removerFoto = () => {
        setFoto(null);
        setFotoPreview(null);
    };

    // ==================== DOCUMENTOS ====================
    const handleDocumentoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const tiposPermitidos = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
            if (!tiposPermitidos.includes(file.type)) {
                showErrorToast("Por favor, selecione um PDF ou imagem válida");
                return;
            }
            if (file.size > 10 * 1024 * 1024) {
                showErrorToast("O documento deve ter no máximo 10MB");
                return;
            }
            
            const novoDocumento = {
                id: Date.now() + Math.random(),
                titulo: file.name,
                arquivo: file,
                preview: URL.createObjectURL(file)
            };
            setDocumentos(prev => [...prev, novoDocumento]);
            e.target.value = '';
        }
    };

    const removerDocumento = (id) => {
        setDocumentos(prev => prev.filter(doc => doc.id !== id));
    };

    // ==================== CÓDIGO DE VERIFICAÇÃO ====================
    const enviarCodigoVerificacao = async () => {
        // Validar email e nome antes de enviar código
        if (!formData.emailEstudante) {
            setErros(prev => ({ ...prev, emailEstudante: "Email é obrigatório" }));
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.emailEstudante)) {
            setErros(prev => ({ ...prev, emailEstudante: "Email inválido" }));
            return;
        }

        if (!formData.nomeEstudante || formData.nomeEstudante.length < 3) {
            setErros(prev => ({ ...prev, nomeEstudante: "Nome completo é obrigatório (mínimo 3 caracteres)" }));
            return;
        }

        try {
            setEnviandoCodigo(true);
            const response = await api.post('/enviarCodigoVerificacao', {
                emailEstudante: formData.emailEstudante,
                nomeEstudante: formData.nomeEstudante,
                contactoEstudante: formData.contactoEstudante,
                biEstudante: formData.biEstudante
            });

            if (response.data.sucesso) {
                setCodigoEnviado(true);
                setEmailVerificado(true);
                setTempoRestante(600); // 10 minutos
                showSuccessToast("Código de verificação enviado para o email!");

                // Iniciar timer
                if (timerRef.current) clearInterval(timerRef.current);
                timerRef.current = setInterval(() => {
                    setTempoRestante(prev => {
                        if (prev <= 1) {
                            clearInterval(timerRef.current);
                            setCodigoEnviado(false);
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);

                setStep(2);
            } else {
                showErrorToast(response.data.mensagem || "Erro ao enviar código");
            }
        } catch (error) {
            console.error("Erro ao enviar código:", error);
            const mensagem = error.response?.data?.mensagem || "Erro ao enviar código de verificação";
            showErrorToast(mensagem);
        } finally {
            setEnviandoCodigo(false);
        }
    };

    const verificarCodigo = () => {
        if (!formData.codigo || formData.codigo.length !== 6) {
            setErros(prev => ({ ...prev, codigo: "Digite o código de 6 dígitos" }));
            return;
        }

        // Simular verificação (o backend já verifica no cadastro)
        setCodigoVerificado(true);
        setStep(3);
        showSuccessToast("Código verificado! Agora adicione os documentos.");
    };

    const reenviarCodigo = () => {
        if (tempoRestante === 0) {
            enviarCodigoVerificacao();
        }
    };

    // ==================== VALIDAÇÃO ====================
    const validarFormulario = () => {
        const novosErros = {};

        if (!formData.nomeEstudante || formData.nomeEstudante.trim().length < 3) {
            novosErros.nomeEstudante = "Nome completo é obrigatório (mínimo 3 caracteres)";
        }

        if (!formData.contactoEstudante || formData.contactoEstudante.trim().length < 9) {
            novosErros.contactoEstudante = "Contacto é obrigatório (mínimo 9 dígitos)";
        }

        if (!formData.sexoEstudante) {
            novosErros.sexoEstudante = "Selecione o gênero";
        }

        if (!formData.emailEstudante || !/\S+@\S+\.\S+/.test(formData.emailEstudante)) {
            novosErros.emailEstudante = "Email válido é obrigatório";
        }

        if (!formData.biEstudante || formData.biEstudante.trim().length < 9) {
            novosErros.biEstudante = "BI é obrigatório (mínimo 9 caracteres)";
        }

        if (!formData.idcurso) {
            novosErros.idcurso = "Selecione um curso";
        }

        if (!formData.id_periodo) {
            novosErros.id_periodo = "Selecione um período";
        }

        if (!formData.senhaEstudante || formData.senhaEstudante.length < 6) {
            novosErros.senhaEstudante = "A senha deve ter no mínimo 6 caracteres";
        }

        if (formData.senhaEstudante !== formData.confirmarSenha) {
            novosErros.confirmarSenha = "As senhas não coincidem";
        }

        if (!codigoVerificado) {
            novosErros.codigo = "Verifique o código de confirmação";
        }

        setErros(novosErros);
        return Object.keys(novosErros).length === 0;
    };

    // ==================== SUBMIT ====================
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validarFormulario()) {
            showErrorToast("Por favor, corrija os erros no formulário");
            return;
        }

        setLoading(true);

        try {
            // Criar FormData para enviar arquivos
            const formDataToSend = new FormData();

            // Adicionar dados do estudante
            const dadosEnvio = {
                nomeEstudante: formData.nomeEstudante.trim(),
                contactoEstudante: formData.contactoEstudante.trim(),
                sexoEstudante: formData.sexoEstudante,
                emailEstudante: formData.emailEstudante.trim().toLowerCase(),
                biEstudante: formData.biEstudante.trim().toUpperCase(),
                idcurso: formData.idcurso,
                id_periodo: formData.id_periodo,
                senhaEstudante: formData.senhaEstudante,
                codigo: formData.codigo.trim(),
                email: formData.emailEstudante.trim().toLowerCase()
            };

            Object.keys(dadosEnvio).forEach(key => {
                if (dadosEnvio[key] !== undefined && dadosEnvio[key] !== null) {
                    formDataToSend.append(key, dadosEnvio[key]);
                }
            });

            // Adicionar foto
            if (foto) {
                formDataToSend.append('foto', foto);
            }

            // Adicionar documentos
            documentos.forEach((doc) => {
                formDataToSend.append('documentos', doc.arquivo);
            });

            // Enviar para API - usando sua rota
            const response = await api.post('/verificarCodigoECompletarCadastro', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.sucesso) {
                showSuccessToast(response.data.mensagem || "Estudante registrado com sucesso!");
                
                // Resetar formulário
                resetFormulario();
                
                // Redirecionar se houver redirect
                if (response.data.redirect) {
                    setTimeout(() => {
                        window.location.href = response.data.redirect;
                    }, 2000);
                }
            } else {
                showErrorToast(response.data.mensagem || "Erro ao registrar estudante");
            }

        } catch (error) {
            console.error("Erro ao registrar estudante:", error);
            const mensagem = error.response?.data?.mensagem || "Erro ao processar solicitação";
            showErrorToast(mensagem);
        } finally {
            setLoading(false);
        }
    };

    // ==================== RESET ====================
    const resetFormulario = () => {
        setFormData({
            nomeEstudante: '',
            contactoEstudante: '',
            sexoEstudante: '',
            emailEstudante: '',
            biEstudante: '',
            idcurso: '',
            id_periodo: '',
            senhaEstudante: '',
            confirmarSenha: '',
            codigo: ''
        });
        setFoto(null);
        setFotoPreview(null);
        setDocumentos([]);
        setErros({});
        setCodigoEnviado(false);
        setCodigoVerificado(false);
        setEmailVerificado(false);
        setStep(1);
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        setTempoRestante(0);
    };

    const handleCancelar = () => {
        if (window.confirm("Tem certeza que deseja cancelar? Os dados não salvos serão perdidos.")) {
            resetFormulario();
        }
    };

    // ==================== FORMATAR TEMPO ====================
    const formatarTempo = (segundos) => {
        const minutos = Math.floor(segundos / 60);
        const segs = segundos % 60;
        return `${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
    };

    // ==================== RENDER ====================
    return (
        <FuncionarioLayout>
            <div className="row mb-4">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h2 style={{ color: 'var(--azul-escuro)', fontWeight: '600' }}>
                                <FaUserPlus className="me-2" />
                                Registrar Novo Estudante
                            </h2>
                            {user && (
                                <p className="text-muted mb-0">
                                    Bem-vindo, {user.nome} | Preencha todos os campos para registrar um novo estudante
                                </p>
                            )}
                        </div>
                        <div className="badge p-3" style={{ backgroundColor: 'var(--azul-escuro)' }}>
                            <MdPerson size={24} color="white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Steps */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="d-flex justify-content-center gap-4">
                        <div className={`text-center ${step >= 1 ? 'text-primary' : 'text-muted'}`}>
                            <div className={`rounded-circle d-flex align-items-center justify-content-center mx-auto mb-1 ${step >= 1 ? 'bg-primary text-white' : 'bg-light text-muted'}`}
                                style={{ width: '40px', height: '40px' }}>
                                1
                            </div>
                            <small>Dados Pessoais</small>
                        </div>
                        <div className={`text-center ${step >= 2 ? 'text-primary' : 'text-muted'}`}>
                            <div className={`rounded-circle d-flex align-items-center justify-content-center mx-auto mb-1 ${step >= 2 ? 'bg-primary text-white' : 'bg-light text-muted'}`}
                                style={{ width: '40px', height: '40px' }}>
                                2
                            </div>
                            <small>Verificação</small>
                        </div>
                        <div className={`text-center ${step >= 3 ? 'text-primary' : 'text-muted'}`}>
                            <div className={`rounded-circle d-flex align-items-center justify-content-center mx-auto mb-1 ${step >= 3 ? 'bg-primary text-white' : 'bg-light text-muted'}`}
                                style={{ width: '40px', height: '40px' }}>
                                3
                            </div>
                            <small>Documentos</small>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-12">
                    <div className="card shadow-sm border-0">
                        <div className="card-body p-4">
                            <form onSubmit={handleSubmit}>
                                {/* ==================== STEP 1: DADOS PESSOAIS ==================== */}
                                {step === 1 && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {/* Foto */}
                                        <div className="row mb-4">
                                            <div className="col-12 text-center">
                                                <div className="position-relative d-inline-block">
                                                    <div
                                                        className="rounded-circle border-2 border-primary d-flex align-items-center justify-content-center"
                                                        style={{
                                                            width: '150px',
                                                            height: '150px',
                                                            backgroundColor: '#f8f9fa',
                                                            overflow: 'hidden',
                                                            cursor: 'pointer'
                                                        }}
                                                        onClick={() => document.getElementById('fotoInput').click()}
                                                    >
                                                        {fotoPreview ? (
                                                            <img
                                                                src={fotoPreview}
                                                                alt="Preview"
                                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                            />
                                                        ) : (
                                                            <div className="text-center">
                                                                <FaCamera size={40} color="#6c757d" />
                                                                <p className="text-muted mb-0 small">Adicionar Foto</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <input
                                                        id="fotoInput"
                                                        type="file"
                                                        accept="image/*"
                                                        className="d-none"
                                                        onChange={handleFotoChange}
                                                    />
                                                    {fotoPreview && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-danger btn-sm position-absolute top-0 end-0 rounded-circle"
                                                            onClick={removerFoto}
                                                            style={{ transform: 'translate(25%, -25%)' }}
                                                        >
                                                            <FaTimes size={12} />
                                                        </button>
                                                    )}
                                                </div>
                                                <p className="text-muted mt-2 small">
                                                    Clique na imagem para adicionar uma foto (máx. 5MB)
                                                </p>
                                            </div>
                                        </div>

                                        <hr />

                                        {/* Dados Pessoais */}
                                        <h5 className="mb-3" style={{ color: 'var(--azul-escuro)' }}>
                                            <MdPerson className="me-2" />
                                            Dados Pessoais
                                        </h5>

                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <label className="form-label fw-bold">Nome Completo *</label>
                                                <div className="input-group">
                                                    <span className="input-group-text"><MdPerson /></span>
                                                    <input
                                                        type="text"
                                                        name="nomeEstudante"
                                                        className={`form-control ${erros.nomeEstudante ? 'is-invalid' : ''}`}
                                                        placeholder="Digite o nome completo"
                                                        value={formData.nomeEstudante}
                                                        onChange={handleChange}
                                                        disabled={loading}
                                                    />
                                                </div>
                                                {erros.nomeEstudante && (
                                                    <div className="text-danger small mt-1">{erros.nomeEstudante}</div>
                                                )}
                                            </div>

                                            <div className="col-md-6">
                                                <label className="form-label fw-bold">Contacto *</label>
                                                <div className="input-group">
                                                    <span className="input-group-text"><MdPhone /></span>
                                                    <input
                                                        type="tel"
                                                        name="contactoEstudante"
                                                        className={`form-control ${erros.contactoEstudante ? 'is-invalid' : ''}`}
                                                        placeholder="Digite o número de telefone"
                                                        value={formData.contactoEstudante}
                                                        onChange={handleChange}
                                                        disabled={loading}
                                                    />
                                                </div>
                                                {erros.contactoEstudante && (
                                                    <div className="text-danger small mt-1">{erros.contactoEstudante}</div>
                                                )}
                                            </div>

                                            <div className="col-md-6">
                                                <label className="form-label fw-bold">Gênero *</label>
                                                <select
                                                    name="sexoEstudante"
                                                    className={`form-select ${erros.sexoEstudante ? 'is-invalid' : ''}`}
                                                    value={formData.sexoEstudante}
                                                    onChange={handleChange}
                                                    disabled={loading}
                                                >
                                                    <option value="">Selecione o gênero</option>
                                                    <option value="Masculino">Masculino</option>
                                                    <option value="Feminino">Feminino</option>
                                                </select>
                                                {erros.sexoEstudante && (
                                                    <div className="text-danger small mt-1">{erros.sexoEstudante}</div>
                                                )}
                                            </div>

                                            <div className="col-md-6">
                                                <label className="form-label fw-bold">Email *</label>
                                                <div className="input-group">
                                                    <span className="input-group-text"><MdEmail /></span>
                                                    <input
                                                        type="email"
                                                        name="emailEstudante"
                                                        className={`form-control ${erros.emailEstudante ? 'is-invalid' : ''}`}
                                                        placeholder="Digite o email"
                                                        value={formData.emailEstudante}
                                                        onChange={handleChange}
                                                        disabled={loading}
                                                    />
                                                </div>
                                                {erros.emailEstudante && (
                                                    <div className="text-danger small mt-1">{erros.emailEstudante}</div>
                                                )}
                                            </div>

                                            <div className="col-md-6">
                                                <label className="form-label fw-bold">BI / Nº Identificação *</label>
                                                <div className="input-group">
                                                    <span className="input-group-text"><MdBadge /></span>
                                                    <input
                                                        type="text"
                                                        name="biEstudante"
                                                        className={`form-control ${erros.biEstudante ? 'is-invalid' : ''}`}
                                                        placeholder="Digite o número do BI"
                                                        value={formData.biEstudante}
                                                        onChange={handleChange}
                                                        disabled={loading}
                                                    />
                                                </div>
                                                {erros.biEstudante && (
                                                    <div className="text-danger small mt-1">{erros.biEstudante}</div>
                                                )}
                                            </div>
                                        </div>

                                        <hr className="my-4" />

                                        {/* Dados Acadêmicos */}
                                        <h5 className="mb-3" style={{ color: 'var(--azul-escuro)' }}>
                                            <MdSchool className="me-2" />
                                            Dados Acadêmicos
                                        </h5>

                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <label className="form-label fw-bold">Curso *</label>
                                                <div className="input-group">
                                                    <span className="input-group-text"><MdSchool /></span>
                                                    <select
                                                        name="idcurso"
                                                        className={`form-select ${erros.idcurso ? 'is-invalid' : ''}`}
                                                        value={formData.idcurso}
                                                        onChange={handleChange}
                                                        disabled={loading}
                                                    >
                                                        <option value="">Selecione o curso</option>
                                                        {cursos.map(curso => (
                                                            <option key={curso.id_curso} value={curso.id_curso}>
                                                                {curso.curso}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                {erros.idcurso && (
                                                    <div className="text-danger small mt-1">{erros.idcurso}</div>
                                                )}
                                            </div>

                                            <div className="col-md-6">
                                                <label className="form-label fw-bold">Período *</label>
                                                <div className="input-group">
                                                    <span className="input-group-text"><MdAccessTime /></span>
                                                    <select
                                                        name="id_periodo"
                                                        className={`form-select ${erros.id_periodo ? 'is-invalid' : ''}`}
                                                        value={formData.id_periodo}
                                                        onChange={handleChange}
                                                        disabled={loading}
                                                    >
                                                        <option value="">Selecione o período</option>
                                                        {periodos.map(periodo => (
                                                            <option key={periodo.id_periodo} value={periodo.id_periodo}>
                                                                {periodo.periodo}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                {erros.id_periodo && (
                                                    <div className="text-danger small mt-1">{erros.id_periodo}</div>
                                                )}
                                            </div>
                                        </div>

                                        <hr className="my-4" />

                                        {/* Senha */}
                                        <h5 className="mb-3" style={{ color: 'var(--azul-escuro)' }}>
                                            <MdLock className="me-2" />
                                            Credenciais de Acesso
                                        </h5>

                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <label className="form-label fw-bold">Senha *</label>
                                                <input
                                                    type="password"
                                                    name="senhaEstudante"
                                                    className={`form-control ${erros.senhaEstudante ? 'is-invalid' : ''}`}
                                                    placeholder="Digite uma senha (mín. 6 caracteres)"
                                                    value={formData.senhaEstudante}
                                                    onChange={handleChange}
                                                    disabled={loading}
                                                />
                                                {erros.senhaEstudante && (
                                                    <div className="text-danger small mt-1">{erros.senhaEstudante}</div>
                                                )}
                                            </div>

                                            <div className="col-md-6">
                                                <label className="form-label fw-bold">Confirmar Senha *</label>
                                                <input
                                                    type="password"
                                                    name="confirmarSenha"
                                                    className={`form-control ${erros.confirmarSenha ? 'is-invalid' : ''}`}
                                                    placeholder="Confirme a senha"
                                                    value={formData.confirmarSenha}
                                                    onChange={handleChange}
                                                    disabled={loading}
                                                />
                                                {erros.confirmarSenha && (
                                                    <div className="text-danger small mt-1">{erros.confirmarSenha}</div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="d-flex gap-2 justify-content-end mt-4">
                                            <button
                                                type="button"
                                                className={`btn ${Style.btnCancelar}`}
                                                onClick={handleCancelar}
                                                disabled={loading}
                                            >
                                                <FaTimes className="me-2" />
                                                Cancelar
                                            </button>
                                            <button
                                                type="button"
                                                className={`btn ${Style.botoesGestaoCurso}`}
                                                onClick={enviarCodigoVerificacao}
                                                disabled={loading || enviandoCodigo}
                                            >
                                                {enviandoCodigo ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" />
                                                        Enviando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <FaEnvelope className="me-2" />
                                                        Verificar Email
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {/* ==================== STEP 2: VERIFICAÇÃO ==================== */}
                                {step === 2 && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="text-center mb-4">
                                            <FaEnvelope size={48} style={{ color: 'var(--azul-escuro)' }} />
                                            <h4 className="mt-3" style={{ color: 'var(--azul-escuro)' }}>
                                                Verifique seu Email
                                            </h4>
                                            <p className="text-muted">
                                                Enviamos um código de 6 dígitos para <strong>{formData.emailEstudante}</strong>
                                            </p>
                                        </div>

                                        <div className="row justify-content-center">
                                            <div className="col-md-6">
                                                <div className="card bg-light border-0">
                                                    <div className="card-body">
                                                        <label className="form-label fw-bold">Código de Verificação *</label>
                                                        <input
                                                            type="text"
                                                            name="codigo"
                                                            className={`form-control form-control-lg text-center ${erros.codigo ? 'is-invalid' : ''}`}
                                                            placeholder="000000"
                                                            maxLength="6"
                                                            value={formData.codigo}
                                                            onChange={handleChange}
                                                            disabled={loading}
                                                            style={{ fontSize: '24px', letterSpacing: '10px', fontWeight: 'bold' }}
                                                        />
                                                        {erros.codigo && (
                                                            <div className="text-danger small mt-1">{erros.codigo}</div>
                                                        )}

                                                        <div className="d-flex justify-content-between align-items-center mt-3">
                                                            <span className="text-muted">
                                                                {tempoRestante > 0 ? (
                                                                    <>Tempo restante: <strong>{formatarTempo(tempoRestante)}</strong></>
                                                                ) : (
                                                                    <span className="text-danger">Código expirado</span>
                                                                )}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                className="btn btn-link"
                                                                onClick={reenviarCodigo}
                                                                disabled={tempoRestante > 0 || loading}
                                                                style={{ color: 'var(--azul-escuro)' }}
                                                            >
                                                                {tempoRestante > 0 ? 'Aguarde...' : 'Reenviar código'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="d-flex gap-2 justify-content-center mt-4">
                                            <button
                                                type="button"
                                                className={`btn ${Style.btnCancelar}`}
                                                onClick={() => setStep(1)}
                                                disabled={loading}
                                            >
                                                <FaTimes className="me-2" />
                                                Voltar
                                            </button>
                                            <button
                                                type="button"
                                                className={`btn ${Style.botoesGestaoCurso}`}
                                                onClick={verificarCodigo}
                                                disabled={loading || !codigoEnviado}
                                            >
                                                <FaCheckCircle className="me-2" />
                                                Verificar Código
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {/* ==================== STEP 3: DOCUMENTOS E FINALIZAR ==================== */}
                                {step === 3 && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="text-center mb-4">
                                            <FaCheckCircle size={48} style={{ color: '#28a745' }} />
                                            <h4 className="mt-3" style={{ color: 'var(--azul-escuro)' }}>
                                                Email Verificado!
                                            </h4>
                                            <p className="text-muted">
                                                Agora adicione os documentos necessários para completar o cadastro
                                            </p>
                                        </div>

                                        {/* Documentos */}
                                        <h5 className="mb-3" style={{ color: 'var(--azul-escuro)' }}>
                                            <RiFileList3Line className="me-2" />
                                            Documentos
                                        </h5>

                                        <div className="row g-3">
                                            <div className="col-12">
                                                <div
                                                    className="border-2 border-dashed rounded p-4 text-center"
                                                    style={{ borderColor: 'var(--azul-escuro)', cursor: 'pointer' }}
                                                >
                                                    <FaFileUpload size={40} className="text-muted mb-2" />
                                                    <p className="text-muted mb-0">Clique para adicionar documentos (PDF, JPG, PNG)</p>
                                                    <p className="text-muted small">Máx. 10MB por documento</p>
                                                    <input
                                                        type="file"
                                                        className="d-none"
                                                        id="documentoInput"
                                                        accept=".pdf,.jpg,.jpeg,.png"
                                                        onChange={handleDocumentoChange}
                                                        disabled={loading}
                                                    />
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-primary mt-2"
                                                        onClick={() => document.getElementById('documentoInput').click()}
                                                        disabled={loading}
                                                    >
                                                        <FaFileUpload className="me-2" />
                                                        Adicionar Documento
                                                    </button>
                                                </div>
                                            </div>

                                            {documentos.length > 0 && (
                                                <div className="col-12 mt-3">
                                                    <h6 className="mb-2">Documentos Adicionados ({documentos.length})</h6>
                                                    <div className="list-group">
                                                        {documentos.map((doc, index) => (
                                                            <div key={doc.id} className="list-group-item d-flex justify-content-between align-items-center">
                                                                <div>
                                                                    <span className="badge bg-primary me-2">{index + 1}</span>
                                                                    <span>{doc.titulo}</span>
                                                                    <span className="text-muted ms-2 small">
                                                                        ({(doc.arquivo.size / 1024).toFixed(1)} KB)
                                                                    </span>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-danger btn-sm"
                                                                    onClick={() => removerDocumento(doc.id)}
                                                                    disabled={loading}
                                                                >
                                                                    <FaTrash />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="d-flex gap-2 justify-content-end mt-4">
                                            <button
                                                type="button"
                                                className={`btn ${Style.btnCancelar}`}
                                                onClick={() => setStep(2)}
                                                disabled={loading}
                                            >
                                                <FaTimes className="me-2" />
                                                Voltar
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
                                                        Registrar Estudante
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </FuncionarioLayout>
    );
}

export default RegistrarEstudante;