import { useState } from "react";
import { FaIdCard, FaLock, FaArrowRight } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

import imetro from "../img/logoFundo.png";
import Style from "./Home.module.css";
import { showSuccessToast, showErrorToast } from "../components/global/CustomToast";
import api from "../service/api"; // Ajuste conforme sua configuração

function Home() {
  const navigate = useNavigate();

  const [email, setEmail] = useState(""); // Mudado de numEstudante para email
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/login", { // Ajuste a rota conforme necessário
        email,        // Envia email
        password,
      });

      if (response.data.sucesso) {
        showSuccessToast(
          response.data.titulo || "Login realizado",
          response.data.mensagem || "Login realizado com sucesso!",
        );

        // Salvar dados do usuário
        localStorage.setItem(
          "usuarioLogado",
          JSON.stringify({
            ...response.data.dados,
            tipoUsuario: response.data.tipoUsuario,
            token: response.data.token
          }),
        );

        // Salvar token separadamente se preferir
        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
        }

        // Redirecionar baseado no tipo de usuário
        setTimeout(() => {
          if (response.data.rota) {
            navigate(response.data.rota);
          } else if (response.data.tipoUsuario === "adm") {
            navigate("/homeAdm");
          } else if (response.data.tipoUsuario === "Coordenador de Admissões e Matrículas" ||
                     response.data.tipoUsuario === "funcionario") {
            navigate("/homefuncionarioM");
          } else if (response.data.tipoUsuario === "professor") {
            navigate("/painelGeralTeacher");
          } else if (response.data.tipoUsuario === "estudante") {
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
          "Erro de conexão",
          "Não foi possível conectar ao servidor.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={Style.homeWrapper}>
      <div className={Style.sobrepo}>
        <div className={Style.loginContainer}>
          <div className={Style.overlay}></div>
          <div className={Style.contentWrapper}>
            <div className={Style.leftSection}>
              <div className={Style.brandSection}>
                <img src={imetro} alt="Logotipo Imetro" className={Style.logoLarge} />
                <h1 className={Style.brandTitle}>Imetro</h1>
                <p className={Style.brandSubtitle}>
                  Instituto Politécnico Superior Metropolitano de Angola
                </p>
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
                    <label htmlFor="email">E-mail</label> {/* Alterado para email */}
                    <div className={Style.inputWrapper}>
                      <FaIdCard className={Style.inputIcon} />
                      <input
                        type="text"
                        id="email"
                        placeholder="seuemail@exemplo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                    disabled={loading || !email.trim() || !password.trim()}
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
                      Ainda não fez a sua inscrição?
                    </span>
                    <Link to="/cadastro" className={Style.registerLink}>
                      Fazer inscrição
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;