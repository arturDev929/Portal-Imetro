import { useState } from "react";
<<<<<<< HEAD
import { FaIdCard } from "react-icons/fa";
import { MdLock } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../pagesAdm/components/navbar";
=======
import { FaIdCard, FaLock, FaArrowRight } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

>>>>>>> eliseu_front2.0
import imetro from "../img/logoFundo.png";
import Style from "./Home.module.css";
import { showSuccessToast, showErrorToast } from "../components/global/CustomToast";
import { api } from "../service/api";

function Home() {
  const navigate = useNavigate();

<<<<<<< HEAD
  const [email, setEmail] = useState("");
=======
  const [numEstudante, setNumEstudante] = useState("");
>>>>>>> eliseu_front2.0
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/login", {
<<<<<<< HEAD
        email,
=======
        numEstudante,
>>>>>>> eliseu_front2.0
        password,
      });

      if (response.data.sucesso) {
<<<<<<< HEAD
        localStorage.setItem("token", response.data.token);
        
=======
>>>>>>> eliseu_front2.0
        showSuccessToast(
          response.data.titulo || "Login realizado",
          response.data.mensagem || "Login realizado com sucesso!",
        );

        localStorage.setItem(
          "usuarioLogado",
          JSON.stringify({
            ...response.data.dados,
            tipoUsuario: response.data.tipoUsuario,
          }),
        );

        setTimeout(() => {
          if (response.data.rota) {
            navigate(response.data.rota);
          } else if (response.data.tipoUsuario === "adm") {
            navigate("/homeAdm");
          } else if (
            response.data.tipoUsuario ===
            "Coordenador de Admissões e Matrículas"
          ) {
            navigate("/homefuncionarioM");
          } else if (response.data.tipoUsuario === "funcionario") {
            navigate("/homefuncionario");
<<<<<<< HEAD

=======
>>>>>>> eliseu_front2.0
          }else if (response.data.tipoUsuario === "professor") {
            navigate("/painelGeralTeacher");
          }else if (response.data.tipoUsuario === "estudante"){
            navigate("/inscricao");
          } else {
            navigate("/");
          }
        }, 100);
      } else {
        showErrorToast(
          response.data.titulo || "Erro no login",
          response.data.mensagem || "Erro ao fazer login",
        );
      }
    } catch (error) {
      if (error.response?.data) {
        showErrorToast(
          error.response.data.titulo || "Erro",
          error.response.data.mensagem || "Erro ao fazer login",
        );
      } else {
        showErrorToast(
          "Erro de conexao",
          "Nao foi possivel conectar ao servidor.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
<<<<<<< HEAD
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
                  <h3 className="mb-4 text-white">Vamos comecar? Faca o login</h3>

                  <form onSubmit={handleLogin}>
                    <div className="mb-3">
                      <div className="input-group">
                        <span className="input-group-text">
                          <FaIdCard />
                        </span>
                        <input
                          type="text"
                          className={`${Style.inputHome} form-control`}
                          id="email"
                          placeholder="Insira o seu email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className="input-group">
                        <span className="input-group-text">
                          <MdLock />
                        </span>
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
                    </div>
                    <button
                      type="submit"
                      className={`${Style.ButtonHome} btn w-100 py-2`}
                      disabled={loading || !email.trim() || !password.trim()}
                    >
                      {loading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Entrando...
                        </>
                      ) : (
                        "Entrar no Sistema"
                      )}
                    </button>
                    <p className="mt-3 text-white">
                      Ainda nao tens uma conta?{" "}
                      <Link to="/cadastro" className={Style.LinkHome}>
                        Fazer Inscricao
                      </Link>
                    </p>
                  </form>
                </div>
              </div>
=======
    <div className={Style.homeWrapper}>
      <div className={Style.sobrepo}>
      
      <div className={Style.loginContainer}>
        <div className={Style.overlay}></div>
        <div className={Style.contentWrapper}>
          <div className={Style.leftSection}>
            <div className={Style.brandSection}>
              <img src={imetro} alt="Logotipo Imetro" className={Style.logoLarge} />
              <h1 className={Style.brandTitle}>Imetro</h1>
              <p className={Style.brandSubtitle}>instituto Politecnico Superior Metropolitano de Angola</p>
              <div className={Style.divider}></div>
              <p className={Style.brandDesc}>
                Faça login para acessar sua área acadêmica
              </p>
            </div>
          </div>
          
          <div className={Style.rightSection}>
            <div className={Style.loginCard}>
              <div className={Style.cardHeader}>
                <h2>Bem-vindo de volta</h2>
                <p>Insira suas credenciais para continuar</p>
              </div>

              <form onSubmit={handleLogin} className={Style.loginForm}>
                <div className={Style.inputGroup}>
                  <label htmlFor="numEstudante">Código de Estudante ou BI</label>
                  <div className={Style.inputWrapper}>
                    <FaIdCard className={Style.inputIcon} />
                    <input
                      type="text"
                      id="numEstudante"
                      placeholder="Ex: 2024001 ou 009876543LA042"
                      value={numEstudante}
                      onChange={(e) => setNumEstudante(e.target.value)}
                      required
                      disabled={loading}
                      autoComplete="off"
                    />
                  </div>
                </div>

                <div className={Style.inputGroup}>
                  <label htmlFor="password">Senha</label>
                  <div className={Style.inputWrapper}>
                    <FaLock className={Style.inputIcon} />
                    <input
                      type="password"
                      id="password"
                      placeholder="Digite sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className={Style.optionsRow}>
                  <label className={Style.checkboxLabel}>
                    <input type="checkbox" />
                    <span>Lembrar-me</span>
                  </label>
                  <Link to="/recuperar-senha" className={Style.forgotLink}>
                    Esqueceu a senha?
                  </Link>
                </div>

                <button
                  type="submit"
                  className={Style.loginButton}
                  disabled={loading || !numEstudante.trim() || !password.trim()}
                >
                  {loading ? (
                    <>
                      <span className={Style.spinner}></span>
                      Entrando...
                    </>
                  ) : (
                    <>
                      Entrar no Sistema
                      <FaArrowRight className={Style.buttonIcon} />
                    </>
                  )}
                </button>

                <div className={Style.registerSection}>
                  <span className={Style.registerText}>
                    Ainda não tem uma conta?
                  </span>
                  <Link to="/cadastro" className={Style.registerLink}>
                    Criar conta
                  </Link>
                </div>
              </form>
>>>>>>> eliseu_front2.0
            </div>
          </div>
        </div>
      </div>
<<<<<<< HEAD
=======
      </div>
>>>>>>> eliseu_front2.0
    </div>
  );
}

export default Home;