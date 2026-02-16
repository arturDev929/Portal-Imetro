import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";
import imetro from "../img/logoFundo.png";
import Style from "./Home.module.css";
import axios from "axios";
import { showSuccessToast, showErrorToast } from "../components/CustomToast";

function Home() {
    const navigate = useNavigate();

    const [numEstudante, setNumEstudante] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault(); 
        setLoading(true);

        try {
            const response = await axios.post("http://localhost:8080/login", {
                numEstudante: numEstudante,
                password: password
            });

            if (response.data.sucesso) {
                showSuccessToast(
                    response.data.titulo || "Login realizado",
                    response.data.mensagem || "Login realizado com sucesso!"
                );
                
                localStorage.setItem("usuarioLogado", JSON.stringify(response.data.dados));
                
                
                setTimeout(() => {
                    navigate("/homeAdm");
                }, 100);
            } else {
                showErrorToast(
                    response.data.titulo || "Erro no login",
                    response.data.mensagem || "Erro ao fazer login"
                );
            }

        } catch (error) {
            if (error.response?.data) {
                showErrorToast(
                    error.response.data.titulo || "Erro",
                    error.response.data.mensagem || "Erro ao fazer login"
                );
            } else {
                showErrorToast(
                    "Erro de conexão",
                    "Não foi possível conectar ao servidor."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Navbar />
            <div className={Style.loginContainer}>
                <div className="container">
                    <div className="d-flex justify-content-center align-items-center min-vh-100">
                        <div className="col-11 col-sm-8 col-md-6 col-lg-4">
                            <div className={`${Style.card} shadow-sm`}>
                                <div className="card-body p-4 text-center">
                                    <img 
                                        src={imetro} 
                                        alt="Logotipo Imetro" 
                                        className={`${Style.logoImetro} mb-4`}
                                    />
                                    <h3 className="mb-4 text-white">Vamos começar? Faça o login</h3>
                                    
                                    <form onSubmit={handleLogin}>
                                        <div className="mb-3">
                                            <input 
                                                type="text" 
                                                className={`${Style.inputHome} form-control`} 
                                                id="numEstudante"
                                                placeholder="Ínsira o seu código"
                                                value={numEstudante}
                                                onChange={(e) => setNumEstudante(e.target.value)}
                                                required
                                                disabled={loading}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <input 
                                                type="password" 
                                                className={`${Style.inputHome} form-control`} 
                                                id="password"
                                                placeholder="Insira a sua senha"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                disabled={loading}
                                            />
                                        </div>
                                        <button type="submit" className={`${Style.ButtonHome} btn w-100 py-2`} disabled={loading || !numEstudante.trim() || !password.trim()}>
                                            {loading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                    Entrando...
                                                </>
                                            ) : (
                                                "Entrar no Sistema"
                                            )}
                                        </button>
                                        <p className="mt-3 text-white">Ainda não tens uma conta? <Link to="/cadastro" className={Style.LinkHome}>Cadastrar-se</Link></p>
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

export default Home;