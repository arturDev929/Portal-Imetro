import { Link } from "react-router-dom";
import { useState } from "react";
import Axios from "axios";
import Navbar from "../components/navbar";
import imetro from "../img/images.png";
import Style from "./Home.module.css";
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
                <div className="container">
                    <div className="d-flex justify-content-center align-items-center min-vh-100">
                        <div className="col-11 col-sm-8 col-md-6 col-lg-4">
                            <div className="card shadow-lg">
                                <div className="card-body p-4 text-center">
                                    <img 
                                        src={imetro} 
                                        alt="Logotipo Imetro" 
                                        className={`${Style.logoImetro} mb-4`}
                                    />
                                    <h3 className="mb-4">Registrar-se</h3>
                                    <form onSubmit={handleSubmit}>
                                        <div className="mb-3">
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                id="nomeEstudante"
                                                name="nomeEstudante"
                                                placeholder="Nome Estudante"
                                                value={valores.nomeEstudante}
                                                onChange={handleChangeInput}
                                                required
                                                disabled={loading}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <input 
                                                type="tel"
                                                className="form-control" 
                                                id="contactoEstudante"
                                                name="contactoEstudante"
                                                placeholder="+244 --- --- ---"
                                                value={valores.contactoEstudante}
                                                onChange={handleChangeInput}
                                                required
                                                disabled={loading}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                id="numEstudante"
                                                name="numEstudante"
                                                placeholder="Número da Matrícula"
                                                value={valores.numEstudante}
                                                onChange={handleChangeInput}
                                                required
                                                disabled={loading}
                                            />
                                        </div>
                                        
                                        {/* <SelectCursos 
                                            onChange={handleChangeInput}
                                            value={valores.idCursos}
                                            disabled={loading}
                                        /> */}
                                        
                                        <div className="mb-3">
                                            <input 
                                                type="password" 
                                                className="form-control" 
                                                id="senhaEstudante"
                                                name="senhaEstudante"
                                                placeholder="Sua senha"
                                                value={valores.senhaEstudante}
                                                onChange={handleChangeInput}
                                                required
                                                minLength="6"
                                                disabled={loading}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <input 
                                                type="password" 
                                                className="form-control" 
                                                id="senhaConfirmar"
                                                name="senhaConfirmar"
                                                placeholder="Confirmar Senha"
                                                value={valores.senhaConfirmar}
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