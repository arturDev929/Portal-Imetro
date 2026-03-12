import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "../components/navbar";
import imetro from "../img/logo_goldenrod.png";
import Style from "./Cadastro.module.css";
import { FaUser, FaEnvelope, FaPhone, FaLock, FaIdCard } from "react-icons/fa";
import { IoPartlySunny } from "react-icons/io5";
import { PiGenderIntersexBold } from "react-icons/pi";
import { FiMail, FiArrowLeft } from "react-icons/fi";
import { showSuccessToast, showErrorToast } from "../components/CustomToast";
import SelectCurso from "../components/selectCursos";
import Api from "../service/api"

function Cadastro() {
    const [etapa, setEtapa] = useState(1); // 1: formulário, 2: verificação
    const [valores, setValores] = useState({
        nomeEstudante: '',
        contactoEstudante: '',
        emailEstudante: '',
        biEstudante: '',
        sexoEstudante: '',
        periodoEstudante: '',
        idcurso: '',
        senhaEstudante: '',
        confirmarSenha: '',
        documentoEstudante: null,
        fotoEstudante: null
    });

    const [codigoVerificacao, setCodigoVerificacao] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [tentativas, setTentativas] = useState(0);
    const [tempoRestante, setTempoRestante] = useState(600); // 10 minutos em segundos
    const [timerAtivo, setTimerAtivo] = useState(false);
    const [arquivos, setArquivos] = useState({
        documentoEstudante: null,
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
        const { name, files } = e.target;
        if (files && files[0]) {
            setArquivos(prev => ({
                ...prev,
                [name]: files[0]
            }));
            
            setValores(prev => ({
                ...prev,
                [name]: files[0]
            }));
        }
    };

    const handleCursoChange = (cursoId) => {
        setValores(prev => ({
            ...prev,
            idcurso: cursoId
        }));
    };

    const handleCodigoChange = (index, value) => {
        if (value.length > 1) return;
        
        const newCodigo = [...codigoVerificacao];
        newCodigo[index] = value;
        setCodigoVerificacao(newCodigo);

        // Auto-focus próximo input
        if (value && index < 5) {
            const nextInput = document.getElementById(`codigo-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        // Se backspace e campo vazio, voltar para input anterior
        if (e.key === 'Backspace' && !codigoVerificacao[index] && index > 0) {
            const prevInput = document.getElementById(`codigo-${index - 1}`);
            if (prevInput) prevInput.focus();
        }
    };

    const validarFormulario = () => {
        if (!valores.nomeEstudante || !valores.contactoEstudante || !valores.emailEstudante || 
            !valores.biEstudante || !valores.sexoEstudante || !valores.periodoEstudante || 
            !valores.idcurso || !valores.senhaEstudante) {
            showErrorToast("Erro", "Todos os campos são obrigatórios!");
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

        if (!arquivos.documentoEstudante || !arquivos.fotoEstudante) {
            showErrorToast("Erro", "Por favor, selecione todos os arquivos necessários!");
            return false;
        }

        return true;
    };

    const handleEnviarCodigo = async () => {
        if (!validarFormulario()) return;

        setLoading(true);
        try {
            const response = await Api.post(`/post/enviarCodigoVerificacao`, {
                emailEstudante: valores.emailEstudante,
                nomeEstudante: valores.nomeEstudante
            });

            if (response.data.sucesso) {
                showSuccessToast("Código enviado!", response.data.mensagem);
                setEtapa(2);
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

        setLoading(true);
        try {
            const formData = new FormData();
            
            // Adicionar dados do formulário
            Object.keys(valores).forEach(key => {
                if (key !== 'documentoEstudante' && key !== 'fotoEstudante' && key !== 'confirmarSenha') {
                    formData.append(key, valores[key]);
                }
            });
            
            // Adicionar código e email
            formData.append('codigo', codigoCompleto);
            formData.append('email', valores.emailEstudante);
            
            // Adicionar arquivos
            formData.append('documentoEstudante', arquivos.documentoEstudante);
            formData.append('fotoEstudante', arquivos.fotoEstudante);

            const response = await Api.post(
                `/post/verificarCodigoECompletarCadastro`, 
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
                
                // Limpar formulário
                setValores({
                    nomeEstudante: '',
                    contactoEstudante: '',
                    emailEstudante: '',
                    biEstudante: '',
                    sexoEstudante: '',
                    periodoEstudante: '',
                    idcurso: '',
                    senhaEstudante: '',
                    confirmarSenha: '',
                    documentoEstudante: null,
                    fotoEstudante: null
                });
                
                setArquivos({
                    documentoEstudante: null,
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
            
            if (error.response?.data) {
                setTentativas(prev => prev + 1);
                showErrorToast(
                    error.response.data.titulo || "Erro",
                    error.response.data.mensagem || "Erro na verificação"
                );
                
                // Limpar código em caso de erro
                setCodigoVerificacao(['', '', '', '', '', '']);
                document.getElementById('codigo-0')?.focus();
            } else {
                showErrorToast(
                    "Erro de conexão",
                    "Não foi possível conectar ao servidor!"
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const handleReenviarCodigo = async () => {
        setLoading(true);
        try {
            const response = await Api.post(`/post/enviarCodigoVerificacao`, {
                emailEstudante: valores.emailEstudante,
                nomeEstudante: valores.nomeEstudante
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
        setEtapa(1);
        setTimerAtivo(false);
    };

    return (
        <div>
            <Navbar />
            <div className={Style.loginContainer}>
                <div className="container-sm">
                    <div className="justify-content-center">
                        <div>
                            <div className={`${Style.card} shadow-sm`}>
                                <div className="card-body p-4 text-center">
                                    <img 
                                        src={imetro} 
                                        alt="Logotipo Imetro" 
                                        className={`${Style.logoImetro} mb-4`}
                                    />
                                    
                                    {etapa === 1 ? (
                                        <>
                                            <h3 className="mb-4 text-white">Formulário de Inscrição</h3>
                                            <form onSubmit={(e) => e.preventDefault()}>
                                                <div className="row">
                                                    <div className="d-flex col-md-6 mb-3">
                                                        <span className={`${Style.span} input-group-text`}><FaUser /></span>
                                                        <input 
                                                            type="text" 
                                                            className={`${Style.inputHome} form-control`} 
                                                            name="nomeEstudante"
                                                            placeholder="Nome Completo"
                                                            value={valores.nomeEstudante}
                                                            onChange={handleChangeInput}
                                                            required
                                                            disabled={loading}
                                                        />
                                                    </div>
                                                    
                                                    <div className="d-flex col-md-6 mb-3">
                                                        <span className={`${Style.span} input-group-text`}><FaPhone /></span>
                                                        <input 
                                                            type="text" 
                                                            className={`${Style.inputHome} form-control`} 
                                                            name="contactoEstudante"
                                                            placeholder="+244 000-000-000"
                                                            value={valores.contactoEstudante}
                                                            onChange={handleChangeInput}
                                                            required
                                                            disabled={loading}
                                                        />
                                                    </div>
                                                    
                                                    <div className="d-flex col-md-6 mb-3">
                                                        <span className={`${Style.span} input-group-text`}><FaEnvelope /></span>
                                                        <input 
                                                            type="email" 
                                                            className={`${Style.inputHome} form-control`} 
                                                            name="emailEstudante"
                                                            placeholder="exemplo@mail.com"
                                                            value={valores.emailEstudante}
                                                            onChange={handleChangeInput}
                                                            required
                                                            disabled={loading}
                                                        />
                                                    </div>

                                                    <div className="d-flex col-md-6 mb-3">
                                                        <span className={`${Style.span} input-group-text`}><FaIdCard /></span>
                                                        <input 
                                                            type="text" 
                                                            className={`${Style.inputHome} form-control`} 
                                                            name="biEstudante"
                                                            placeholder="Nº do Bilhete de Identidade"
                                                            value={valores.biEstudante}
                                                            onChange={handleChangeInput}
                                                            required
                                                            disabled={loading}
                                                        />
                                                    </div>
                                                    
                                                    <div className="d-flex col-md-3 mb-3">
                                                        <span className={`${Style.span} input-group-text`}><PiGenderIntersexBold /></span>
                                                        <select 
                                                            className={`${Style.inputHome} form-control`} 
                                                            name="sexoEstudante"
                                                            value={valores.sexoEstudante}
                                                            onChange={handleChangeInput}
                                                            required
                                                            disabled={loading}
                                                        >
                                                            <option value="">Selecione seu Sexo</option>
                                                            <option value="Masculino">Masculino</option>
                                                            <option value="Feminino">Feminino</option>
                                                        </select>
                                                    </div>
                                                    
                                                    <div className="d-flex col-md-3 mb-3">
                                                        <span className={`${Style.span} input-group-text`}><IoPartlySunny /></span>
                                                        <select 
                                                            className={`${Style.inputHome} form-control`} 
                                                            name="periodoEstudante"
                                                            value={valores.periodoEstudante}
                                                            onChange={handleChangeInput}
                                                            required
                                                            disabled={loading}
                                                        >
                                                            <option value="">Selecione o Período</option>
                                                            <option value="Manhã">Manhã</option>
                                                            <option value="Tarde">Tarde</option>
                                                            <option value="Noite">Noite</option>
                                                        </select>
                                                    </div>
                                                    
                                                    <SelectCurso 
                                                        value={valores.idcurso}
                                                        onChange={handleCursoChange}
                                                        disabled={loading}
                                                    />
                                                    
                                                    <div className="d-flex mb-3">
                                                        <span className={`${Style.span} input-group-text`}>B.I e Certificado</span>
                                                        <input 
                                                            type="file" 
                                                            className={`${Style.inputHome} form-control`} 
                                                            name="documentoEstudante"
                                                            onChange={handleFileChange}
                                                            accept=".pdf,.jpg,.jpeg,.png"
                                                            required
                                                            disabled={loading}
                                                        />
                                                    </div>
                                                    
                                                    <div className="d-flex mb-3">
                                                        <span className={`${Style.span} input-group-text`}>Foto tipo passe</span>
                                                        <input 
                                                            type="file" 
                                                            className={`${Style.inputHome} form-control`} 
                                                            name="fotoEstudante"
                                                            onChange={handleFileChange}
                                                            accept=".jpg,.jpeg,.png"
                                                            required
                                                            disabled={loading}
                                                        />
                                                    </div>
                                                    
                                                    <div className="d-flex col-md-6 mb-3">
                                                        <span className={`${Style.span} input-group-text`}><FaLock /></span>
                                                        <input 
                                                            type="password" 
                                                            className={`${Style.inputHome} form-control`} 
                                                            name="senhaEstudante"
                                                            placeholder="Insira a sua senha"
                                                            value={valores.senhaEstudante}
                                                            onChange={handleChangeInput}
                                                            required
                                                            disabled={loading}
                                                            minLength="6"
                                                        />
                                                    </div>
                                                    
                                                    <div className="d-flex col-md-6 mb-3">
                                                        <span className={`${Style.span} input-group-text`}><FaLock /></span>
                                                        <input 
                                                            type="password" 
                                                            className={`${Style.inputHome} form-control`} 
                                                            name="confirmarSenha"
                                                            placeholder="Confirme a senha"
                                                            value={valores.confirmarSenha}
                                                            onChange={handleChangeInput}
                                                            required
                                                            disabled={loading}
                                                        />
                                                    </div>
                                                    
                                                    <div>
                                                        <button 
                                                            type="button"
                                                            onClick={handleEnviarCodigo}
                                                            className={`${Style.ButtonHome} btn w-100 py-2`} 
                                                            disabled={loading}
                                                        >
                                                            {loading ? (
                                                                <>
                                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                                    Enviando...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    Continuar <FiMail className="ms-2" />
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                    
                                                    <p className="mt-3 text-white">
                                                        Já tens uma conta? <Link to="/" className={`${Style.LinkHome}`}>Fazer o Login</Link>
                                                    </p>
                                                </div>
                                            </form>
                                        </>
                                    ) : (
                                        // Etapa 2: Verificação de código
                                        <div className="text-white">
                                            <button 
                                                onClick={voltarParaFormulario}
                                                className="btn btn-link text-warning mb-3 p-0"
                                                style={{ textDecoration: 'none' }}
                                                disabled={loading}
                                            >
                                                <FiArrowLeft className="me-1" />
                                                Voltar ao formulário
                                            </button>
                                            
                                            <h3 className="mb-4">Verifique seu Email</h3>
                                            
                                            <div className="mb-4">
                                                <FiMail size={50} className="text-warning mb-3" />
                                                <p>Enviamos um código de verificação para:</p>
                                                <p className="fw-bold text-warning">{valores.emailEstudante}</p>
                                            </div>
                                            
                                            <div className="mb-4">
                                                <label className="form-label">Digite o código de 6 dígitos</label>
                                                
                                                <div className="d-flex justify-content-center gap-2 mb-3">
                                                    {[0, 1, 2, 3, 4, 5].map((index) => (
                                                        <input
                                                            key={index}
                                                            id={`codigo-${index}`}
                                                            type="text"
                                                            className="form-control text-center"
                                                            value={codigoVerificacao[index]}
                                                            onChange={(e) => handleCodigoChange(index, e.target.value)}
                                                            onKeyDown={(e) => handleKeyDown(index, e)}
                                                            maxLength="1"
                                                            disabled={loading || tempoRestante === 0 || tentativas >= 3}
                                                            style={{ 
                                                                width: '50px',
                                                                height: '60px',
                                                                fontSize: '24px',
                                                                fontWeight: 'bold',
                                                                textAlign: 'center'
                                                            }}
                                                        />
                                                    ))}
                                                </div>
                                                
                                                <div className="d-flex justify-content-between">
                                                    <small className="text-muted">
                                                        Tentativas: {tentativas}/3
                                                    </small>
                                                    <small className={tempoRestante < 60 ? "text-danger" : "text-warning"}>
                                                        ⏱️ {formatarTempo(tempoRestante)}
                                                    </small>
                                                </div>
                                            </div>
                                            
                                            <div className="d-grid gap-2">
                                                <button
                                                    onClick={handleVerificarCodigo}
                                                    className={`${Style.ButtonHome} btn py-2`}
                                                    disabled={loading || tempoRestante === 0 || tentativas >= 3}
                                                >
                                                    {loading ? (
                                                        <>
                                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                                            Verificando...
                                                        </>
                                                    ) : (
                                                        "Verificar Código"
                                                    )}
                                                </button>
                                                
                                                {(tempoRestante === 0 || tentativas >= 3) && (
                                                    <button
                                                        onClick={handleReenviarCodigo}
                                                        className="btn btn-outline-warning py-2"
                                                        disabled={loading}
                                                    >
                                                        Reenviar Código
                                                    </button>
                                                )}
                                            </div>
                                            
                                            <p className="text-muted small mt-3">
                                                Não recebeu o código? Verifique sua caixa de spam ou 
                                                <button 
                                                    onClick={handleReenviarCodigo}
                                                    className="btn btn-link text-warning p-0 ms-1"
                                                    disabled={loading}
                                                    style={{ textDecoration: 'none' }}
                                                >
                                                    reenvie
                                                </button>
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Cadastro;