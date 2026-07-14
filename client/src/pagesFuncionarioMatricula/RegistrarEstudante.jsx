// RegistrarEstudante.jsx
import FuncionarioLayout from "../layouts/FuncionarioLayout";
import { useEffect, useState } from "react";
import { 
  FaUser, FaEnvelope, FaPhone, FaLock, FaIdCard, 
  FaArrowRight, FaArrowLeft, FaCheckCircle, FaFileUpload,
  FaTimes, FaFilePdf, FaFileImage, FaFileAlt, FaGraduationCap,
  FaShieldAlt, FaUserPlus
} from "react-icons/fa";
import { PiGenderIntersexBold } from "react-icons/pi";
import { FiMail, FiArrowLeft } from "react-icons/fi";
import { showSuccessToast, showErrorToast } from "../components/global/CustomToast";
import SelectCursoPeriodo from "../pages/components/selectCursoPeriodo";
import api from "../service/api";
import Style from "../pagesAdm/GestaoCursoAdm.module.css";

function RegistrarEstudante() {
    // ETAPAS: 1-Dados Pessoais, 2-Documento, 3-Curso, 4-Documentos Upload, 5-Senha
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
            
            const arquivosInvalidos = novosArquivos.filter(file => file.size > 10 * 1024 * 1024);
            if (arquivosInvalidos.length > 0) {
                showErrorToast("Erro", "Cada arquivo deve ter no máximo 10MB");
                e.target.value = '';
                return;
            }

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
            
            if (file.size > 5 * 1024 * 1024) {
                showErrorToast("Erro", "A foto deve ter no máximo 5MB");
                e.target.value = '';
                return;
            }
            
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

    // Validações por etapa
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

    const validarEtapa5 = () => {
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
            setEtapa(5);
        } else if (etapa === 5 && validarEtapa5()) {
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
            const response = await api.post(`/enviarCodigoVerificacao`, {
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

        setLoading(true);
        try {
            const formData = new FormData();
            
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
            
            if (arquivos.fotoEstudante) {
                formData.append('foto', arquivos.fotoEstudante);
            }
            
            arquivos.documentosEstudante.forEach((file) => {
                formData.append('documentos', file);
            });

            const response = await api.post(
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
                
                // Resetar formulário
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
                
                setEtapa(1);
                setEtapaVerificacao(false);
                setTimerAtivo(false);
                
                if (response.data.redirect) {
                    setTimeout(() => {
                        window.location.href = response.data.redirect;
                    }, 3000);
                }
            }
        } catch (error) {
            setTentativas(prev => prev + 1);
            showErrorToast(
                error.response?.data?.titulo || "Erro",
                error.response?.data?.mensagem || "Erro na verificação. Tente novamente."
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
            const response = await api.post(`/enviarCodigoVerificacao`, {
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

    const getStepIcon = (step) => {
        switch(step) {
            case 1: return <FaUser />;
            case 2: return <FaIdCard />;
            case 3: return <FaGraduationCap />;
            case 4: return <FaFileUpload />;
            case 5: return <FaShieldAlt />;
            default: return null;
        }
    };

    const getStepTitle = (step) => {
        switch(step) {
            case 1: return "Dados Pessoais";
            case 2: return "Documento de Identificação";
            case 3: return "Curso e Período";
            case 4: return "Documentos e Foto";
            case 5: return "Criar Senha";
            default: return "";
        }
    };

    const getStepDescription = (step) => {
        switch(step) {
            case 1: return "Preencha as informações pessoais do estudante";
            case 2: return "Informe o BI e sexo";
            case 3: return "Selecione o curso e período";
            case 4: return "Envie os documentos e foto";
            case 5: return "Crie uma senha segura";
            default: return "";
        }
    };

    // Estilos inline para o design personalizado
    const styles = {
        container: {
            padding: '20px'
        },
        header: {
            marginBottom: '30px'
        },
        headerTitle: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '24px',
            color: '#333',
            marginBottom: '10px'
        },
        headerSub: {
            color: '#666',
            fontSize: '14px'
        },
        card: {
            background: '#fff',
            borderRadius: '12px',
            padding: '30px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        },
        stepsContainer: {
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '30px',
            position: 'relative',
            padding: '0 20px'
        },
        stepWrapper: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            flex: 1
        },
        stepCircle: {
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#fff',
            background: '#ddd',
            transition: 'all 0.3s'
        },
        stepCircleActive: {
            background: '#007bff'
        },
        stepCircleCompleted: {
            background: '#28a745'
        },
        stepLabel: {
            marginTop: '8px',
            fontSize: '12px',
            color: '#666'
        },
        stepLabelActive: {
            color: '#007bff',
            fontWeight: 'bold'
        },
        cardHeader: {
            marginBottom: '25px',
            borderBottom: '1px solid #eee',
            paddingBottom: '15px'
        },
        cardTitle: {
            fontSize: '20px',
            color: '#333',
            marginBottom: '5px'
        },
        cardDesc: {
            color: '#666',
            fontSize: '14px'
        },
        stepCounter: {
            display: 'inline-block',
            background: '#f0f0f0',
            padding: '3px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            color: '#666',
            marginTop: '10px'
        },
        formGroup: {
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            marginBottom: '20px'
        },
        inputGroup: {
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
        },
        inputIcon: {
            position: 'absolute',
            left: '12px',
            color: '#999'
        },
        input: {
            width: '100%',
            padding: '10px 10px 10px 40px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none',
            transition: 'border-color 0.3s'
        },
        inputFocus: {
            borderColor: '#007bff'
        },
        select: {
            width: '100%',
            padding: '10px 10px 10px 40px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none',
            background: '#fff'
        },
        fileUploadArea: {
            border: '2px dashed #ddd',
            borderRadius: '8px',
            padding: '20px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'border-color 0.3s'
        },
        fileLabel: {
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '5px'
        },
        fileLabelInput: {
            display: 'none'
        },
        fileList: {
            marginTop: '10px',
            padding: '10px',
            background: '#f8f9fa',
            borderRadius: '8px'
        },
        fileItem: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px',
            borderBottom: '1px solid #eee'
        },
        fileIcon: {
            marginRight: '10px',
            color: '#007bff'
        },
        fileSize: {
            fontSize: '12px',
            color: '#666'
        },
        removeBtn: {
            background: 'none',
            border: 'none',
            color: '#dc3545',
            cursor: 'pointer',
            padding: '5px'
        },
        passwordMatch: {
            padding: '10px',
            borderRadius: '8px',
            fontSize: '14px'
        },
        formActions: {
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '20px',
            paddingTop: '20px',
            borderTop: '1px solid #eee'
        },
        btnSecondary: {
            padding: '10px 25px',
            background: '#f0f0f0',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            color: '#333'
        },
        btnPrimary: {
            padding: '10px 25px',
            background: '#007bff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            color: '#fff'
        },
        btnPrimaryDisabled: {
            opacity: 0.6,
            cursor: 'not-allowed'
        },
        btnSecondaryDisabled: {
            opacity: 0.6,
            cursor: 'not-allowed'
        },
        verificationContainer: {
            textAlign: 'center',
            padding: '30px 20px'
        },
        verificationIcon: {
            fontSize: '48px',
            color: '#007bff',
            marginBottom: '15px'
        },
        codeInputs: {
            display: 'flex',
            justifyContent: 'center',
            gap: '10px',
            margin: '20px 0'
        },
        codeInput: {
            width: '45px',
            height: '50px',
            textAlign: 'center',
            fontSize: '20px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            outline: 'none'
        },
        codeInputFocus: {
            borderColor: '#007bff'
        },
        verificationInfo: {
            display: 'flex',
            justifyContent: 'center',
            gap: '30px',
            margin: '15px 0',
            fontSize: '14px',
            color: '#666'
        },
        timeWarning: {
            color: '#dc3545'
        },
        small: {
            fontSize: '12px',
            color: '#666',
            display: 'block',
            marginTop: '5px'
        },
        fileListTitle: {
            marginBottom: '10px',
            fontWeight: 'bold',
            fontSize: '14px',
            color: '#333'
        }
    };

    return (
        <FuncionarioLayout>
            <div style={styles.container}>
                <div style={styles.header}>
                    <h2 style={styles.headerTitle}>
                        <FaUserPlus /> Registrar Novo Estudante
                    </h2>
                    <p style={styles.headerSub}>Preencha todos os passos para registrar um novo estudante no sistema</p>
                </div>

                <div style={styles.card}>
                    {!etapaVerificacao ? (
                        <>
                            <div style={styles.stepsContainer}>
                                {[1, 2, 3, 4, 5].map((step) => (
                                    <div key={step} style={styles.stepWrapper}>
                                        <div style={{
                                            ...styles.stepCircle,
                                            ...(etapa > step ? styles.stepCircleCompleted : {}),
                                            ...(etapa === step ? styles.stepCircleActive : {})
                                        }}>
                                            {etapa > step ? <FaCheckCircle /> : getStepIcon(step)}
                                        </div>
                                        <span style={{
                                            ...styles.stepLabel,
                                            ...(etapa === step ? styles.stepLabelActive : {})
                                        }}>
                                            {step === 1 && "Dados"}
                                            {step === 2 && "BI"}
                                            {step === 3 && "Curso"}
                                            {step === 4 && "Arquivos"}
                                            {step === 5 && "Senha"}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div style={styles.cardHeader}>
                                <h3 style={styles.cardTitle}>{getStepTitle(etapa)}</h3>
                                <p style={styles.cardDesc}>{getStepDescription(etapa)}</p>
                                <span style={styles.stepCounter}>Passo {etapa} de 5</span>
                            </div>

                            <form onSubmit={(e) => e.preventDefault()}>
                                {/* ETAPA 1: Dados Pessoais */}
                                {etapa === 1 && (
                                    <div style={styles.formGroup}>
                                        <div style={styles.inputGroup}>
                                            <FaUser style={styles.inputIcon} />
                                            <input 
                                                type="text" 
                                                name="nomeEstudante"
                                                placeholder="Nome completo"
                                                value={valores.nomeEstudante}
                                                onChange={handleChangeInput}
                                                required
                                                disabled={loading}
                                                style={styles.input}
                                            />
                                        </div>
                                        
                                        <div style={styles.inputGroup}>
                                            <FaPhone style={styles.inputIcon} />
                                            <input 
                                                type="tel" 
                                                name="contactoEstudante"
                                                placeholder="+244 000 000 000"
                                                value={valores.contactoEstudante}
                                                onChange={handleChangeInput}
                                                required
                                                disabled={loading}
                                                style={styles.input}
                                            />
                                        </div>
                                        
                                        <div style={styles.inputGroup}>
                                            <FaEnvelope style={styles.inputIcon} />
                                            <input 
                                                type="email" 
                                                name="emailEstudante"
                                                placeholder="seu@email.com"
                                                value={valores.emailEstudante}
                                                onChange={handleChangeInput}
                                                required
                                                disabled={loading}
                                                style={styles.input}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* ETAPA 2: Documento de Identificação */}
                                {etapa === 2 && (
                                    <div style={styles.formGroup}>
                                        <div style={styles.inputGroup}>
                                            <FaIdCard style={styles.inputIcon} />
                                            <input 
                                                type="text" 
                                                name="biEstudante"
                                                placeholder="Nº do Bilhete de Identidade"
                                                value={valores.biEstudante}
                                                onChange={handleChangeInput}
                                                required
                                                disabled={loading}
                                                style={styles.input}
                                            />
                                        </div>
                                        
                                        <div style={styles.inputGroup}>
                                            <PiGenderIntersexBold style={styles.inputIcon} />
                                            <select 
                                                name="sexoEstudante"
                                                value={valores.sexoEstudante}
                                                onChange={handleChangeInput}
                                                required
                                                disabled={loading}
                                                style={styles.select}
                                            >
                                                <option value="">Selecione o sexo</option>
                                                <option value="Masculino">Masculino</option>
                                                <option value="Feminino">Feminino</option>
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {/* ETAPA 3: Curso e Período */}
                                {etapa === 3 && (
                                    <div style={styles.formGroup}>
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
                                )}

                                {/* ETAPA 4: Upload de Documentos e Foto */}
                                {etapa === 4 && (
                                    <div style={styles.formGroup}>
                                        <div style={styles.fileUploadArea}>
                                            <label style={styles.fileLabel}>
                                                <FaFileUpload size={24} />
                                                <span>Documentos (BI, Certificados, etc.)</span>
                                                <input 
                                                    type="file" 
                                                    name="documentosEstudante"
                                                    onChange={handleFileChange}
                                                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                                    multiple
                                                    disabled={loading}
                                                    style={styles.fileLabelInput}
                                                />
                                            </label>
                                            <small style={styles.small}>Formatos: PDF, JPG, PNG, DOC, DOCX (máx. 10MB cada)</small>
                                        </div>

                                        {arquivos.documentosEstudante.length > 0 && (
                                            <div style={styles.fileList}>
                                                <p style={styles.fileListTitle}>
                                                    <FaFileAlt /> Documentos selecionados ({arquivos.documentosEstudante.length})
                                                </p>
                                                {arquivos.documentosEstudante.map((file, index) => (
                                                    <div key={index} style={styles.fileItem}>
                                                        <span>
                                                            <span style={styles.fileIcon}>{getFileIcon(file.name)}</span>
                                                            {file.name}
                                                        </span>
                                                        <span>
                                                            <span style={styles.fileSize}>{getFileSize(file.size)}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => removerArquivo(index)}
                                                                style={styles.removeBtn}
                                                                disabled={loading}
                                                            >
                                                                <FaTimes />
                                                            </button>
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div style={styles.fileUploadArea}>
                                            <label style={styles.fileLabel}>
                                                <FaFileUpload size={24} />
                                                <span>Foto tipo passe</span>
                                                <input 
                                                    type="file" 
                                                    name="fotoEstudante"
                                                    onChange={handleFotoChange}
                                                    accept=".jpg,.jpeg,.png"
                                                    required
                                                    disabled={loading}
                                                    style={styles.fileLabelInput}
                                                />
                                            </label>
                                            <small style={styles.small}>Formatos: JPG, PNG (máx. 5MB)</small>
                                        </div>

                                        {arquivos.fotoEstudante && (
                                            <div style={styles.fileList}>
                                                <div style={styles.fileItem}>
                                                    <span>
                                                        <span style={styles.fileIcon}><FaFileImage /></span>
                                                        {arquivos.fotoEstudante.name}
                                                    </span>
                                                    <span style={styles.fileSize}>{getFileSize(arquivos.fotoEstudante.size)}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ETAPA 5: Senha */}
                                {etapa === 5 && (
                                    <div style={styles.formGroup}>
                                        <div style={styles.inputGroup}>
                                            <FaLock style={styles.inputIcon} />
                                            <input 
                                                type="password" 
                                                name="senhaEstudante"
                                                placeholder="Crie uma senha (mínimo 6 caracteres)"
                                                value={valores.senhaEstudante}
                                                onChange={handleChangeInput}
                                                required
                                                disabled={loading}
                                                minLength="6"
                                                style={styles.input}
                                            />
                                        </div>
                                        
                                        <div style={styles.inputGroup}>
                                            <FaLock style={styles.inputIcon} />
                                            <input 
                                                type="password" 
                                                name="confirmarSenha"
                                                placeholder="Confirme a senha"
                                                value={valores.confirmarSenha}
                                                onChange={handleChangeInput}
                                                required
                                                disabled={loading}
                                                style={styles.input}
                                            />
                                        </div>

                                        {valores.senhaEstudante && valores.confirmarSenha && (
                                            <div style={styles.passwordMatch}>
                                                {valores.senhaEstudante === valores.confirmarSenha ? (
                                                    <span style={{ color: 'green' }}>
                                                        <FaCheckCircle /> Senhas coincidem
                                                    </span>
                                                ) : (
                                                    <span style={{ color: 'red' }}>
                                                        <FaTimes /> Senhas não coincidem
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                                
                                <div style={styles.formActions}>
                                    {etapa > 1 && (
                                        <button 
                                            type="button"
                                            onClick={voltarEtapa}
                                            style={{
                                                ...styles.btnSecondary,
                                                ...(loading ? styles.btnSecondaryDisabled : {})
                                            }}
                                            disabled={loading}
                                        >
                                            <FaArrowLeft /> Voltar
                                        </button>
                                    )}
                                    
                                    <button 
                                        type="button"
                                        onClick={avancarEtapa}
                                        style={{
                                            ...styles.btnPrimary,
                                            ...(loading ? styles.btnPrimaryDisabled : {})
                                        }}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <span>Carregando...</span>
                                        ) : (
                                            <>
                                                {etapa === 5 ? 'Registrar Estudante' : 'Continuar'}
                                                {etapa !== 5 && <FaArrowRight />}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div style={styles.verificationContainer}>
                            <button 
                                onClick={voltarParaFormulario}
                                style={{
                                    ...styles.btnSecondary,
                                    ...(loading ? styles.btnSecondaryDisabled : {}),
                                    marginBottom: '20px'
                                }}
                                disabled={loading}
                            >
                                <FiArrowLeft /> Voltar
                            </button>
                            
                            <div style={styles.verificationIcon}>
                                <FiMail />
                            </div>
                            
                            <h3>Verifique o email</h3>
                            <p>Enviamos um código de 6 dígitos para:</p>
                            <strong>{valores.emailEstudante}</strong>
                            
                            <div style={styles.codeInputs}>
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
                                        style={styles.codeInput}
                                    />
                                ))}
                            </div>
                            
                            <div style={styles.verificationInfo}>
                                <span>Tentativas: {tentativas}/3</span>
                                <span style={tempoRestante < 60 ? styles.timeWarning : {}}>
                                    ⏱️ {formatarTempo(tempoRestante)}
                                </span>
                            </div>
                            
                            <button
                                onClick={handleVerificarCodigo}
                                style={{
                                    ...styles.btnPrimary,
                                    ...((loading || tempoRestante === 0 || tentativas >= 3) ? styles.btnPrimaryDisabled : {})
                                }}
                                disabled={loading || tempoRestante === 0 || tentativas >= 3}
                            >
                                {loading ? 'Verificando...' : 'Verificar código'}
                            </button>
                            
                            {(tempoRestante === 0 || tentativas >= 3) && (
                                <button
                                    onClick={handleReenviarCodigo}
                                    style={{
                                        ...styles.btnSecondary,
                                        ...(loading ? styles.btnSecondaryDisabled : {}),
                                        marginTop: '10px'
                                    }}
                                    disabled={loading}
                                >
                                    Reenviar código
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </FuncionarioLayout>
    );
}

export default RegistrarEstudante;