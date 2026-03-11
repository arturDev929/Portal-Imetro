import { Link } from "react-router-dom";
import { useState } from "react";
import Axios from "axios";
import Navbar from "../components/navbar";
import imetro from "../img/logo_goldenrod.png";
import Style from "./Cadastro.module.css";
import { FaUser } from "react-icons/fa";
// import SelectCursos from "../components/selectCurso";
import { FiUserPlus } from "react-icons/fi";
import { showSuccessToast, showErrorToast } from "../components/CustomToast";

function Cadastro() {
    const [valores, setValores] = useState({
        nomeEstudante: '',
        contactoEstudante: '',
        numEstudante: '',
        idCursos: '',
        senhaEstudante: '',
        senhaConfirmar: ''
    });

    const [loading, setLoading] = useState(false);

    const handleChangeInput = (e) => {
        const { name, value } = e.target;
        setValores((prevValue) => ({
            ...prevValue,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        
        if (valores.senhaEstudante !== valores.senhaConfirmar) {
            showErrorToast("Senhas não coincidem", "As senhas não coincidem!");
            setLoading(false);
            return;
        }

        if (valores.senhaEstudante.length < 6) {
            showErrorToast("Senha fraca", "A senha deve ter pelo menos 6 caracteres!");
            setLoading(false);
            return;
        }

        // Enviar para a API
        Axios.post("http://localhost:8080/post/registrarEstudante", valores)
            .then((response) => {
                console.log("Resposta do servidor:", response.data);

                if (response.data.sucesso) {
                    showSuccessToast(
                        response.data.titulo || "Cadastro realizado!",
                        response.data.mensagem || "Estudante registrado com sucesso!"
                    );
                    
                    setValores({
                        nomeEstudante: '',
                        contactoEstudante: '',
                        numEstudante: '',
                        idCursos: '',
                        senhaEstudante: '',
                        senhaConfirmar: ''
                    });
                    
                    if (response.data.redirect) {
                        setTimeout(() => {
                            window.location.href = response.data.redirect;
                        }, 2000);
                    }
                } else {
                    showErrorToast(
                        response.data.titulo || "Erro no cadastro",
                        response.data.mensagem || "Erro ao registrar estudante"
                    );
                }
            })
            .catch((error) => {
                console.error("Erro ao cadastrar:", error);
                
                if (error.response?.data) {
                    showErrorToast(
                        error.response.data.titulo || "Erro",
                        error.response.data.mensagem || "Erro ao registrar estudante"
                    );
                } else {
                    showErrorToast(
                        "Erro de conexão",
                        "Não foi possível conectar ao servidor!"
                    );
                }
            })
            .finally(() => {
                setLoading(false);
            });
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
                                    <h3 className="mb-4 text-white">Formulário de Inscrição</h3>
                                    <form onSubmit={handleSubmit}>
                                        <div className="row">
                                            <div className="d-flex col-md-6 mb-3">
                                                <span className={`${Style.span} input-group-text`}><FaUser /></span>
                                                <input 
                                                    type="text" 
                                                    className={`${Style.inputHome} form-control`} 
                                                    id="nomeEstudante"
                                                    name="nomeEstudante"
                                                    placeholder="Nome Estudante"
                                                    value={valores.nomeEstudante}
                                                    onChange={handleChangeInput}
                                                    required
                                                    disabled={loading}
                                                />
                                            </div>
                                            <div className="d-flex col-md-6 mb-3">
                                                <span className={`${Style.span} input-group-text`}><FaUser /></span>
                                                <input 
                                                    type="text" 
                                                    className={`${Style.inputHome} form-control`} 
                                                    id="contactoEstudante"
                                                    name="contactoEstudante"
                                                    placeholder="+244 --- --- ---"
                                                    value={valores.contactoEstudante}
                                                    onChange={handleChangeInput}
                                                    required
                                                    disabled={loading}
                                                />
                                            </div>
                                            <div className="d-flex col-md-6 mb-3">
                                                <span className={`${Style.span} input-group-text`}><FaUser /></span>
                                                <input 
                                                    type="text" 
                                                    className={`${Style.inputHome} form-control`} 
                                                    id="emailEstudante"
                                                    name="emailEstudante"
                                                    placeholder="exemplo@mail.com"
                                                    value={valores.emailEstudante}
                                                    onChange={handleChangeInput}
                                                    required
                                                    disabled={loading}
                                                />
                                            </div>
                                            <div className="d-flex col-md-6 mb-3">
                                                <span className={`${Style.span} input-group-text`}><FaUser /></span>
                                                <select 
                                                    className={`${Style.inputHome} form-control`} 
                                                    id="sexoEstudante"
                                                    name="sexoEstudanteemailstudante"
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
                                            <div className="d-flex mb-3">
                                                <span className={`${Style.span} input-group-text`}>Coloque a cópia do B.I e do Certificado</span>
                                                <input 
                                                    type="file" 
                                                    className={`${Style.inputHome} form-control`} 
                                                    id="documentoEstudante"
                                                    name="documentoEstudante"
                                                    value={valores.documentoEstudante}
                                                    onChange={handleChangeInput}
                                                    required
                                                    disabled={loading}
                                                />
                                            </div>
                                            <div className="d-flex mb-3">
                                                <span className={`${Style.span} input-group-text`}>Insira uma foto tipo passe</span>
                                                <input 
                                                    type="file" 
                                                    className={`${Style.inputHome} form-control`} 
                                                    id="fotoEstudante"
                                                    name="fotoEstudante"
                                                    value={valores.fotoEstudante}
                                                    onChange={handleChangeInput}
                                                    required
                                                    disabled={loading}
                                                />
                                            </div>
                                            <div className="d-flex col-md-6 mb-3">
                                                <span className={`${Style.span} input-group-text`}><FaUser /></span>
                                                <input 
                                                    type="text" 
                                                    className={`${Style.inputHome} form-control`} 
                                                    id="senhaEstudante"
                                                    name="senhaEstudante"
                                                    placeholder="Insira a sua senha"
                                                    value={valores.emailEstudante}
                                                    onChange={handleChangeInput}
                                                    required
                                                    disabled={loading}
                                                />
                                            </div>
                                            <div className="d-flex col-md-6 mb-3">
                                                <span className={`${Style.span} input-group-text`}><FaUser /></span>
                                                <input 
                                                    type="text" 
                                                    className={`${Style.inputHome} form-control`} 
                                                    id="ConfirmarSenha"
                                                    name="ConfirmarSenha"
                                                    placeholder="Confirma a senha"
                                                    value={valores.ConfirmarSenha}
                                                    onChange={handleChangeInput}
                                                    required
                                                    disabled={loading}
                                                />
                                            </div>
                                            <button type="submit" className="btn btn-primary w-100 py-2" disabled={loading}>
                                                {loading ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                        Registrando...
                                                    </>
                                                ) : (
                                                    <>
                                                        Registrar <FiUserPlus/>
                                                    </>
                                                )}
                                            </button>
                                            <p className="mt-3">
                                                Já tens uma conta? <Link to="/">Fazer o Login</Link>
                                            </p>
                                        </div>
                                    </form>
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