import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import imetro from "../img/logo_goldenrod.png";
import Style from "./Cadastro.module.css";
import { 
  FaUser, FaEnvelope, FaPhone, FaLock, FaIdCard, 
  FaArrowRight, FaArrowLeft, FaCheckCircle, FaFileUpload,
  FaTimes, FaFilePdf, FaFileImage, FaFileAlt
} from "react-icons/fa";
import { IoPartlySunny } from "react-icons/io5";
import { PiGenderIntersexBold } from "react-icons/pi";
import { FiMail, FiArrowLeft } from "react-icons/fi";
import { showSuccessToast, showErrorToast } from "../components/global/CustomToast";
import SelectCursoPeriodo from "./components/selectCursoPeriodo";
import Api from "../service/api"

function Cadastro() {
    const [etapa, setEtapa] = useState(1);
    const [etapaVerificacao, setEtapaVerificacao] = useState(false);
    const [valores, setValores] = useState({
        nomeEstudante: '',
        contactoEstudante: '',
        emailEstudante: '',
        biEstudante: '',
        sexoEstudante: '',
        periodoEstudante: '',
        idcurso: '',
        id_periodo: '',
        senhaEstudante: '',
        confirmarSenha: ''
    });

    const [codigoVerificacao, setCodigoVerificacao] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [tentativas, setTentativas] = useState(0);
    const [tempoRestante, setTempoRestante] = useState(600);
    const [timerAtivo, setTimerAtivo] = useState(false);
    const [arquivos, setArquivos] = useState({
        documentosEstudante: [],
        fotoEstudante: null
    });

    useEffect(() => {
        let interval;
        if (timerAtivo && tempoRestante > 0) {
            interval = setInterval(() => {
                setTempoRestante(prev => prev - 1);
            }, 1000);
        } else if (tempoRestante === 0) {
            setTimerAtivo(false);
        }
        return () => clearInterval(interval);
    }, [timerAtivo, tempoRestante]);

    const handleChangeInput = (e) => {
        const { name, value } = e.target;
        setValores((prevValue) => ({
            ...prevValue,
            [name]: value,
        }));
    };

    const handleFileChange = (e) => {
        const { files } = e.target;
        if (files && files.length > 0) {
            const novosArquivos = Array.from(files);
            
            // Validar tamanho
            const arquivosInvalidos = novosArquivos.filter(file => file.size > 10 * 1024 * 1024);
            if (arquivosInvalidos.length > 0) {
                showErrorToast("Erro", "Cada arquivo deve ter no máximo 10MB");
                e.target.value = '';
                return;
            }

            // Validar extensões
            const extensoesPermitidas = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'];
            const arquivosInvalidosExt = novosArquivos.filter(file => {
                const ext = file.name.split('.').pop().toLowerCase();
                return !extensoesPermitidas.includes(ext);
            });
            
            if (arquivosInvalidosExt.length > 0) {
                showErrorToast("Erro", "Formatos permitidos: PDF, JPG, PNG, DOC, DOCX");
                e.target.value = '';
                return;
            }

            setArquivos(prev => ({
                ...prev,
                documentosEstudante: [...prev.documentosEstudante, ...novosArquivos]
            }));
            
            // Limpar o input para permitir selecionar o mesmo arquivo novamente
            e.target.value = '';
        }
    };

    const removerArquivo = (index) => {
        setArquivos(prev => ({
            ...prev,
            documentosEstudante: prev.documentosEstudante.filter((_, i) => i !== index)
        }));
    };

    const handleFotoChange = (e) => {
        const { files } = e.target;
        if (files && files[0]) {
            const file = files[0];
            
            // Validar tamanho
            if (file.size > 5 * 1024 * 1024) {
                showErrorToast("Erro", "A foto deve ter no máximo 5MB");
                e.target.value = '';
                return;
            }
            
            // Validar extensões
            const extensoesPermitidas = ['jpg', 'jpeg', 'png'];
            const ext = file.name.split('.').pop().toLowerCase();
            if (!extensoesPermitidas.includes(ext)) {
                showErrorToast("Erro", "Formatos permitidos para foto: JPG, PNG");
                e.target.value = '';
                return;
            }
            
            setArquivos(prev => ({
                ...prev,
                fotoEstudante: file
            }));
            
            // Limpar o input
            e.target.value = '';
        }
    };

    const handleCursoPeriodoChange = (data) => {
        setValores(prev => ({
            ...prev,
            idcurso: data.id_curso || '',
            id_periodo: data.id_periodo || '',
            periodoEstudante: data.periodo || ''
        }));
    };

    const handleCodigoChange = (index, value) => {
        if (value.length > 1) return;
        
        const newCodigo = [...codigoVerificacao];
        newCodigo[index] = value;
        setCodigoVerificacao(newCodigo);

        if (value && index < 5) {
            const nextInput = document.getElementById(`codigo-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !codigoVerificacao[index] && index > 0) {
            const prevInput = document.getElementById(`codigo-${index - 1}`);
            if (prevInput) prevInput.focus();
        }
    };

    const validarEtapa1 = () => {
        if (!valores.nomeEstudante || !valores.contactoEstudante || !valores.emailEstudante) {
            showErrorToast("Erro", "Preencha todos os campos obrigatórios!");
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(valores.emailEstudante)) {
            showErrorToast("Erro", "Email inválido!");
            return false;
        }
        return true;
    };

    const validarEtapa2 = () => {
        if (!valores.biEstudante || !valores.sexoEstudante) {
            showErrorToast("Erro", "Preencha todos os campos obrigatórios!");
            return false;
        }
        return true;
    };

    const validarEtapa3 = () => {
        if (!valores.idcurso) {
            showErrorToast("Erro", "Selecione o curso!");
            return false;
        }
        
        if (!valores.id_periodo) {
            showErrorToast("Erro", "Selecione o período!");
            return false;
        }
        
        return true;
    };

    const validarEtapa4 = () => {
        if (!valores.senhaEstudante || !valores.confirmarSenha) {
            showErrorToast("Erro", "Preencha todos os campos de senha!");
            return false;
        }

        if (valores.senhaEstudante !== valores.confirmarSenha) {
            showErrorToast("Erro", "As senhas não coincidem!");
            return false;
        }

        if (valores.senhaEstudante.length < 6) {
            showErrorToast("Erro", "A senha deve ter pelo menos 6 caracteres!");
            return false;
        }

        if (arquivos.documentosEstudante.length === 0) {
            showErrorToast("Erro", "Por favor, selecione pelo menos um documento!");
            return false;
        }

        if (!arquivos.fotoEstudante) {
            showErrorToast("Erro", "Por favor, selecione uma foto!");
            return false;
        }

        return true;
    };

    const avancarEtapa = () => {
        if (etapa === 1 && validarEtapa1()) {
            setEtapa(2);
        } else if (etapa === 2 && validarEtapa2()) {
            setEtapa(3);
        } else if (etapa === 3 && validarEtapa3()) {
            setEtapa(4);
        } else if (etapa === 4 && validarEtapa4()) {
            handleEnviarCodigo();
        }
    };

    const voltarEtapa = () => {
        if (etapa > 1) {
            setEtapa(etapa - 1);
        }
    };

    const handleEnviarCodigo = async () => {
        setLoading(true);
        try {
            const response = await Api.post(`/enviarCodigoVerificacao`, {
                emailEstudante: valores.emailEstudante,
                nomeEstudante: valores.nomeEstudante,
                contactoEstudante: valores.contactoEstudante,
                biEstudante: valores.biEstudante
            });

            if (response.data.sucesso) {
                showSuccessToast("Código enviado!", response.data.mensagem);
                setEtapaVerificacao(true);
                setTimerAtivo(true);
                setTempoRestante(600);
                setTentativas(0);
                setCodigoVerificacao(['', '', '', '', '', '']);
            } else {
                showErrorToast("Erro", response.data.mensagem);
            }
        } catch (error) {
            console.error("Erro ao enviar código:", error);
            showErrorToast(
                "Erro",
                error.response?.data?.mensagem || "Erro ao enviar código de verificação"
            );
        } finally {
            setLoading(false);
        }
    };

    const formatarTempo = (segundos) => {
        const minutos = Math.floor(segundos / 60);
        const segs = segundos % 60;
        return `${minutos}:${segs < 10 ? '0' : ''}${segs}`;
    };

    const handleVerificarCodigo = async () => {
        const codigoCompleto = codigoVerificacao.join('');
        
        if (codigoCompleto.length !== 6) {
            showErrorToast("Erro", "Por favor, insira o código completo de 6 dígitos");
            return;
        }

        // LOG DE DEBUG
        console.log("=== VALORES DO FORMULÁRIO ===");
        console.log("Nome:", valores.nomeEstudante);
        console.log("Contacto:", valores.contactoEstudante);
        console.log("Email:", valores.emailEstudante);
        console.log("BI:", valores.biEstudante);
        console.log("Sexo:", valores.sexoEstudante);
        console.log("ID Curso:", valores.idcurso);
        console.log("ID Período:", valores.id_periodo);
        console.log("Código:", codigoCompleto);
        console.log("Foto:", arquivos.fotoEstudante?.name);
        console.log("Documentos:", arquivos.documentosEstudante.map(d => d.name));

        setLoading(true);
        try {
            const formData = new FormData();
            
            // Adicionar campos de texto
            formData.append('nomeEstudante', valores.nomeEstudante);
            formData.append('contactoEstudante', valores.contactoEstudante);
            formData.append('emailEstudante', valores.emailEstudante);
            formData.append('biEstudante', valores.biEstudante);
            formData.append('sexoEstudante', valores.sexoEstudante);
            formData.append('periodoEstudante', valores.periodoEstudante);
            formData.append('idcurso', valores.idcurso);
            formData.append('id_periodo', valores.id_periodo);
            formData.append('senhaEstudante', valores.senhaEstudante);
            formData.append('codigo', codigoCompleto);
            formData.append('email', valores.emailEstudante);
            
            // IMPORTANTE: Adicionar FOTO com o nome "foto" (não "fotoEstudante")
            if (arquivos.fotoEstudante) {
                formData.append('foto', arquivos.fotoEstudante);
            }
            
            // IMPORTANTE: Adicionar DOCUMENTOS com o nome "documentos" (não "documentosEstudante")
            arquivos.documentosEstudante.forEach((file) => {
                formData.append('documentos', file);
            });

            // Mostrar o que está sendo enviado para debug
            console.log('Enviando dados:', {
                nomeEstudante: valores.nomeEstudante,
                contactoEstudante: valores.contactoEstudante,
                emailEstudante: valores.emailEstudante,
                biEstudante: valores.biEstudante,
                sexoEstudante: valores.sexoEstudante,
                idcurso: valores.idcurso,
                id_periodo: valores.id_periodo,
                codigo: codigoCompleto,
                foto: arquivos.fotoEstudante?.name || 'Nenhuma foto',
                documentos: arquivos.documentosEstudante.length + ' documentos'
            });

            const response = await Api.post(
                `/verificarCodigoECompletarCadastro`, 
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (response.data.sucesso) {
                showSuccessToast(
                    response.data.titulo || "Sucesso!",
                    response.data.mensagem || "Estudante registrado com sucesso!"
                );
                
                setValores({
                    nomeEstudante: '',
                    contactoEstudante: '',
                    emailEstudante: '',
                    biEstudante: '',
                    sexoEstudante: '',
                    periodoEstudante: '',
                    idcurso: '',
                    id_periodo: '',
                    senhaEstudante: '',
                    confirmarSenha: ''
                });
                
                setArquivos({
                    documentosEstudante: [],
                    fotoEstudante: null
                });
                
                if (response.data.redirect) {
                    setTimeout(() => {
                        window.location.href = response.data.redirect;
                    }, 3000);
                }
            }
        } catch (error) {
            console.error("Erro ao verificar código:", error);
            console.error("Detalhes do erro:", {
                status: error.response?.status,
                data: error.response?.data,
                headers: error.response?.headers
            });
            
            const errorData = error.response?.data;
            setTentativas(prev => prev + 1);
            showErrorToast(
                errorData?.titulo || "Erro",
                errorData?.mensagem || "Erro na verificação. Verifique os dados e tente novamente."
            );
            
            setCodigoVerificacao(['', '', '', '', '', '']);
            document.getElementById('codigo-0')?.focus();
        } finally {
            setLoading(false);
        }
    };

    const handleReenviarCodigo = async () => {
        setLoading(true);
        try {
            const response = await Api.post(`/enviarCodigoVerificacao`, {
                emailEstudante: valores.emailEstudante,
                nomeEstudante: valores.nomeEstudante,
                contactoEstudante: valores.contactoEstudante,
                biEstudante: valores.biEstudante
            });

            if (response.data.sucesso) {
                showSuccessToast("Código reenviado!", "Novo código enviado para seu email");
                setCodigoVerificacao(['', '', '', '', '', '']);
                setTentativas(0);
                setTimerAtivo(true);
                setTempoRestante(600);
                document.getElementById('codigo-0')?.focus();
            }
        } catch (error) {
            showErrorToast("Erro", "Erro ao reenviar código");
        } finally {
            setLoading(false);
        }
    };

    const voltarParaFormulario = () => {
        setEtapaVerificacao(false);
        setTimerAtivo(false);
    };

    const getFileIcon = (fileName) => {
        const ext = fileName.split('.').pop().toLowerCase();
        if (ext === 'pdf') return <FaFilePdf />;
        if (['jpg', 'jpeg', 'png'].includes(ext)) return <FaFileImage />;
        return <FaFileAlt />;
    };

    const getFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className={Style.cadastroWrapper}>
            <div className={Style.sobrepo}></div>
            <div className={Style.cadastroContainer}>
                <div className={Style.contentWrapper}>
                    <div className={Style.leftSection}>
                        <div className={Style.brandSection}>
                            <img src={imetro} alt="Logotipo Imetro" className={Style.logoLarge} />
                            <h1 className={Style.brandTitle}>Imetro</h1>
                            <p className={Style.brandSubtitle}>instituto Politecnico Superior Metropolitano de Angola</p>
                            <div className={Style.divider}></div>
                            <p className={Style.brandDesc}>
                                Junte-se a nós e construa seu futuro profissional
                            </p>
                        </div>
                    </div>
                    
                    <div className={Style.rightSection}>
                        <div className={Style.cadastroCard}>
                            {!etapaVerificacao ? (
                                <>
                                    <div className={Style.cardHeader}>
                                        <h2>Criar conta</h2>
                                        <p>Preencha os dados abaixo para se cadastrar</p>
                                    </div>

                                    <div className={Style.progressContainer}>
                                        <div className={Style.steps}>
                                            {[1, 2, 3, 4].map((step) => (
                                                <div key={step} className={Style.stepWrapper}>
                                                    <div className={`${Style.step} ${etapa >= step ? Style.active : ''}`}>
                                                        {etapa > step ? <FaCheckCircle /> : step}
                                                    </div>
                                                    <span className={Style.stepLabel}>
                                                        {step === 1 && "Dados"}
                                                        {step === 2 && "Documento"}
                                                        {step === 3 && "Curso"}
                                                        {step === 4 && "Segurança"}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <form onSubmit={(e) => e.preventDefault()} className={Style.cadastroForm}>
                                        {etapa === 1 && (
                                            <div className={Style.formSection}>
                                                <div className={Style.inputGroup}>
                                                    <FaUser className={Style.inputIcon} />
                                                    <input 
                                                        type="text" 
                                                        name="nomeEstudante"
                                                        placeholder="Nome completo"
                                                        value={valores.nomeEstudante}
                                                        onChange={handleChangeInput}
                                                        required
                                                        disabled={loading}
                                                    />
                                                </div>
                                                
                                                <div className={Style.inputGroup}>
                                                    <FaPhone className={Style.inputIcon} />
                                                    <input 
                                                        type="tel" 
                                                        name="contactoEstudante"
                                                        placeholder="+244 000 000 000"
                                                        value={valores.contactoEstudante}
                                                        onChange={handleChangeInput}
                                                        required
                                                        disabled={loading}
                                                    />
                                                </div>
                                                
                                                <div className={Style.inputGroup}>
                                                    <FaEnvelope className={Style.inputIcon} />
                                                    <input 
                                                        type="email" 
                                                        name="emailEstudante"
                                                        placeholder="seu@email.com"
                                                        value={valores.emailEstudante}
                                                        onChange={handleChangeInput}
                                                        required
                                                        disabled={loading}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {etapa === 2 && (
                                            <div className={Style.formSection}>
                                                <div className={Style.inputGroup}>
                                                    <FaIdCard className={Style.inputIcon} />
                                                    <input 
                                                        type="text" 
                                                        name="biEstudante"
                                                        placeholder="Nº do Bilhete de Identidade"
                                                        value={valores.biEstudante}
                                                        onChange={handleChangeInput}
                                                        required
                                                        disabled={loading}
                                                    />
                                                </div>
                                                
                                                <div className={Style.inputGroup}>
                                                    <PiGenderIntersexBold className={Style.inputIcon} />
                                                    <select 
                                                        name="sexoEstudante"
                                                        value={valores.sexoEstudante}
                                                        onChange={handleChangeInput}
                                                        required
                                                        disabled={loading}
                                                    >
                                                        <option value="">Selecione o sexo</option>
                                                        <option value="Masculino">Masculino</option>
                                                        <option value="Feminino">Feminino</option>
                                                    </select>
                                                </div>
                                            </div>
                                        )}

                                        {etapa === 3 && (
                                            <div className={Style.formSection}>
                                                <div className={Style.inputGroup} style={{ width: '100%' }}>
                                                    <SelectCursoPeriodo 
                                                        onChange={handleCursoPeriodoChange}
                                                        initialValues={{
                                                            id_curso: valores.idcurso,
                                                            id_periodo: valores.id_periodo,
                                                            periodo: valores.periodoEstudante
                                                        }}
                                                        disabled={loading}
                                                        showLabels={false}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {etapa === 4 && (
                                            <div className={Style.formSection}>
                                                <div className={Style.inputGroup}>
                                                    <FaLock className={Style.inputIcon} />
                                                    <input 
                                                        type="password" 
                                                        name="senhaEstudante"
                                                        placeholder="Crie uma senha (mínimo 6 caracteres)"
                                                        value={valores.senhaEstudante}
                                                        onChange={handleChangeInput}
                                                        required
                                                        disabled={loading}
                                                        minLength="6"
                                                    />
                                                </div>
                                                
                                                <div className={Style.inputGroup}>
                                                    <FaLock className={Style.inputIcon} />
                                                    <input 
                                                        type="password" 
                                                        name="confirmarSenha"
                                                        placeholder="Confirme a senha"
                                                        value={valores.confirmarSenha}
                                                        onChange={handleChangeInput}
                                                        required
                                                        disabled={loading}
                                                    />
                                                </div>

                                                <div className={Style.fileUploadContainer}>
                                                    <div className={Style.fileInputGroup}>
                                                        <label className={Style.fileLabel}>
                                                            <FaFileUpload />
                                                            <span>Documentos (BI, Certificados, etc.)</span>
                                                            <input 
                                                                type="file" 
                                                                name="documentosEstudante"
                                                                onChange={handleFileChange}
                                                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                                                multiple
                                                                disabled={loading}
                                                            />
                                                        </label>
                                                        <small className={Style.fileHelper}>
                                                            Formatos: PDF, JPG, PNG, DOC, DOCX (máx. 10MB cada)
                                                        </small>
                                                    </div>

                                                    {arquivos.documentosEstudante.length > 0 && (
                                                        <div className={Style.fileList}>
                                                            <p className={Style.fileListTitle}>
                                                                <FaFileAlt /> Documentos selecionados ({arquivos.documentosEstudante.length})
                                                            </p>
                                                            {arquivos.documentosEstudante.map((file, index) => (
                                                                <div key={index} className={Style.fileItem}>
                                                                    <span className={Style.fileIcon}>
                                                                        {getFileIcon(file.name)}
                                                                    </span>
                                                                    <div className={Style.fileInfo}>
                                                                        <span className={Style.fileName}>{file.name}</span>
                                                                        <span className={Style.fileSize}>{getFileSize(file.size)}</span>
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removerArquivo(index)}
                                                                        className={Style.removeFileButton}
                                                                        disabled={loading}
                                                                    >
                                                                        <FaTimes />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className={Style.fileUploadContainer}>
                                                    <div className={Style.fileInputGroup}>
                                                        <label className={Style.fileLabel}>
                                                            <FaFileUpload />
                                                            <span>Foto tipo passe</span>
                                                            <input 
                                                                type="file" 
                                                                name="fotoEstudante"
                                                                onChange={handleFotoChange}
                                                                accept=".jpg,.jpeg,.png"
                                                                required
                                                                disabled={loading}
                                                            />
                                                        </label>
                                                        <small className={Style.fileHelper}>
                                                            Formatos: JPG, PNG (máx. 5MB)
                                                        </small>
                                                    </div>

                                                    {arquivos.fotoEstudante && (
                                                        <div className={Style.fileList}>
                                                            <div className={Style.fileItem}>
                                                                <span className={Style.fileIcon}>
                                                                    <FaFileImage />
                                                                </span>
                                                                <div className={Style.fileInfo}>
                                                                    <span className={Style.fileName}>{arquivos.fotoEstudante.name}</span>
                                                                    <span className={Style.fileSize}>{getFileSize(arquivos.fotoEstudante.size)}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div className={Style.formActions}>
                                            {etapa > 1 && (
                                                <button 
                                                    type="button"
                                                    onClick={voltarEtapa}
                                                    className={Style.backButton}
                                                    disabled={loading}
                                                >
                                                    <FaArrowLeft />
                                                    Voltar
                                                </button>
                                            )}
                                            
                                            <button 
                                                type="button"
                                                onClick={avancarEtapa}
                                                className={Style.nextButton}
                                                disabled={loading}
                                            >
                                                {loading ? (
                                                    <div className={Style.spinner}></div>
                                                ) : (
                                                    <>
                                                        {etapa === 4 ? 'Enviar código' : 'Continuar'}
                                                        <FaArrowRight />
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                        
                                        <div className={Style.loginRedirect}>
                                            <span>Já tem uma conta?</span>
                                            <Link to="/" className={Style.loginLink}>Fazer login</Link>
                                        </div>
                                    </form>
                                </>
                            ) : (
                                <div className={Style.verificationSection}>
                                    <button 
                                        onClick={voltarParaFormulario}
                                        className={Style.backToForm}
                                        disabled={loading}
                                    >
                                        <FiArrowLeft />
                                        Voltar
                                    </button>
                                    
                                    <div className={Style.verificationIcon}>
                                        <FiMail />
                                    </div>
                                    
                                    <h2>Verifique seu email</h2>
                                    <p>Enviamos um código de 6 dígitos para:</p>
                                    <strong className={Style.emailHighlight}>{valores.emailEstudante}</strong>
                                    
                                    <div className={Style.codeInputs}>
                                        {[0, 1, 2, 3, 4, 5].map((index) => (
                                            <input
                                                key={index}
                                                id={`codigo-${index}`}
                                                type="text"
                                                value={codigoVerificacao[index]}
                                                onChange={(e) => handleCodigoChange(index, e.target.value)}
                                                onKeyDown={(e) => handleKeyDown(index, e)}
                                                maxLength="1"
                                                disabled={loading || tempoRestante === 0 || tentativas >= 3}
                                            />
                                        ))}
                                    </div>
                                    
                                    <div className={Style.verificationInfo}>
                                        <span>Tentativas: {tentativas}/3</span>
                                        <span className={tempoRestante < 60 ? Style.timeWarning : ''}>
                                            ⏱️ {formatarTempo(tempoRestante)}
                                        </span>
                                    </div>
                                    
                                    <button
                                        onClick={handleVerificarCodigo}
                                        className={Style.verifyButton}
                                        disabled={loading || tempoRestante === 0 || tentativas >= 3}
                                    >
                                        {loading ? (
                                            <div className={Style.spinner}></div>
                                        ) : (
                                            "Verificar código"
                                        )}
                                    </button>
                                    
                                    {(tempoRestante === 0 || tentativas >= 3) && (
                                        <button
                                            onClick={handleReenviarCodigo}
                                            className={Style.resendButton}
                                            disabled={loading}
                                        >
                                            Reenviar código
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Cadastro;