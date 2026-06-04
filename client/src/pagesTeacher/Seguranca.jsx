import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TeacherLayout from "../layouts/TeacherLayout";
import { 
  FaLock, 
  FaShieldAlt, 
  FaKey, 
  FaEnvelope,
  FaMobileAlt,
  FaHistory,
  FaSignOutAlt,
  FaSave,
  FaEye,
  FaEyeSlash
} from "react-icons/fa";
import { 
  MdSecurity,
  MdVerifiedUser,
  MdWarning,
  MdClose
} from "react-icons/md";
import styles from "./Seguranca.module.css";

function Seguranca() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSenha, setShowSenha] = useState(false);
  const [showNovaSenha, setShowNovaSenha] = useState(false);
  const [showConfirmSenha, setShowConfirmSenha] = useState(false);
  
  const [senhas, setSenhas] = useState({
    senhaAtual: "",
    novaSenha: "",
    confirmarSenha: ""
  });

  const [sessoes, setSessoes] = useState([
    { id: 1, dispositivo: "Chrome - Windows", localizacao: "São Paulo, SP", data: "2024-01-15 14:30", atual: true },
    { id: 2, dispositivo: "Firefox - Linux", localizacao: "Rio de Janeiro, RJ", data: "2024-01-14 09:15", atual: false },
    { id: 3, dispositivo: "Safari - iPhone", localizacao: "Belo Horizonte, MG", data: "2024-01-13 20:00", atual: false }
  ]);

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem("usuarioLogado");
    if (usuarioSalvo) {
      const userData = JSON.parse(usuarioSalvo);
      setUser(userData);
    } else {
      navigate("/");
    }
  }, [navigate]);

  const alterarSenha = () => {
    if (!senhas.senhaAtual) {
      alert("Digite sua senha atual");
      return;
    }
    if (senhas.novaSenha.length < 6) {
      alert("A nova senha deve ter pelo menos 6 caracteres");
      return;
    }
    if (senhas.novaSenha !== senhas.confirmarSenha) {
      alert("As senhas não coincidem");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert("Senha alterada com sucesso!");
      setSenhas({ senhaAtual: "", novaSenha: "", confirmarSenha: "" });
    }, 1000);
  };

  const encerrarSessao = (id) => {
    if (window.confirm("Tem certeza que deseja encerrar esta sessão?")) {
      setSessoes(sessoes.filter(s => s.id !== id));
    }
  };

  const encerrarTodasSessoes = () => {
    if (window.confirm("Tem certeza que deseja encerrar todas as outras sessões?")) {
      setSessoes(sessoes.filter(s => s.atual));
      alert("Todas as outras sessões foram encerradas!");
    }
  };

  const toggle2FA = () => {
    alert("Funcionalidade de autenticação em duas etapas será implementada em breve");
  };

  return (
    <TeacherLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            <FaLock className={styles.titleIcon} />
            Segurança
          </h1>
          <p className={styles.subtitle}>
            Proteja sua conta e gerencie suas sessões
          </p>
        </div>

        <div className={styles.securityGrid}>
          {/* Alterar Senha */}
          <div className={styles.securityCard}>
            <div className={styles.cardHeader}>
              <FaKey className={styles.cardIcon} />
              <h2>Alterar Senha</h2>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.formGroup}>
                <label>Senha Atual</label>
                <div className={styles.passwordInput}>
                  <input
                    type={showSenha ? "text" : "password"}
                    value={senhas.senhaAtual}
                    onChange={(e) => setSenhas({ ...senhas, senhaAtual: e.target.value })}
                    placeholder="Digite sua senha atual"
                  />
                  <button onClick={() => setShowSenha(!showSenha)}>
                    {showSenha ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Nova Senha</label>
                <div className={styles.passwordInput}>
                  <input
                    type={showNovaSenha ? "text" : "password"}
                    value={senhas.novaSenha}
                    onChange={(e) => setSenhas({ ...senhas, novaSenha: e.target.value })}
                    placeholder="Digite a nova senha"
                  />
                  <button onClick={() => setShowNovaSenha(!showNovaSenha)}>
                    {showNovaSenha ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                <div className={styles.passwordStrength}>
                  <div className={styles.strengthBar}>
                    <div className={`${styles.strengthFill} ${senhas.novaSenha.length >= 6 ? styles.strengthWeak : ''}`} style={{ width: senhas.novaSenha.length >= 6 ? '33%' : '0%' }}></div>
                    <div className={`${styles.strengthFill} ${senhas.novaSenha.length >= 8 ? styles.strengthMedium : ''}`} style={{ width: senhas.novaSenha.length >= 8 ? '66%' : '0%' }}></div>
                    <div className={`${styles.strengthFill} ${senhas.novaSenha.match(/[!@#$%^&*]/) ? styles.strengthStrong : ''}`} style={{ width: senhas.novaSenha.match(/[!@#$%^&*]/) ? '100%' : '0%' }}></div>
                  </div>
                  <small>Mínimo 6 caracteres, incluindo letras e números</small>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Confirmar Nova Senha</label>
                <div className={styles.passwordInput}>
                  <input
                    type={showConfirmSenha ? "text" : "password"}
                    value={senhas.confirmarSenha}
                    onChange={(e) => setSenhas({ ...senhas, confirmarSenha: e.target.value })}
                    placeholder="Confirme a nova senha"
                  />
                  <button onClick={() => setShowConfirmSenha(!showConfirmSenha)}>
                    {showConfirmSenha ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
              <button className={styles.btnAlterar} onClick={alterarSenha} disabled={loading}>
                <FaSave /> {loading ? "Alterando..." : "Alterar Senha"}
              </button>
            </div>
          </div>

          {/* Autenticação em Duas Etapas */}
          <div className={styles.securityCard}>
            <div className={styles.cardHeader}>
              <MdVerifiedUser className={styles.cardIcon} />
              <h2>Autenticação em Duas Etapas</h2>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.notificationItem}>
                <div>
                  <strong>Proteção Adicional</strong>
                  <p>Adicione uma camada extra de segurança à sua conta</p>
                </div>
                <label className={styles.switch}>
                  <input type="checkbox" onChange={toggle2FA} />
                  <span className={styles.slider}></span>
                </label>
              </div>
              <div className={styles.infoBox}>
                <MdWarning />
                <small>Ativar a autenticação em duas etapas aumenta significativamente a segurança da sua conta</small>
              </div>
            </div>
          </div>

          {/* Sessões Ativas */}
          <div className={styles.securityCard}>
            <div className={styles.cardHeader}>
              <FaHistory className={styles.cardIcon} />
              <h2>Sessões Ativas</h2>
            </div>
            <div className={styles.cardBody}>
              {sessoes.map(sessao => (
                <div key={sessao.id} className={styles.sessaoItem}>
                  <div className={styles.sessaoInfo}>
                    <strong>{sessao.dispositivo}</strong>
                    <p>{sessao.localizacao}</p>
                    <small>Último acesso: {sessao.data}</small>
                  </div>
                  {sessao.atual ? (
                    <span className={styles.sessaoAtual}>Sessão Atual</span>
                  ) : (
                    <button className={styles.btnEncerrar} onClick={() => encerrarSessao(sessao.id)}>
                      <FaSignOutAlt /> Encerrar
                    </button>
                  )}
                </div>
              ))}
              {sessoes.filter(s => !s.atual).length > 0 && (
                <button className={styles.btnEncerrarTodas} onClick={encerrarTodasSessoes}>
                  Encerrar Todas as Outras Sessões
                </button>
              )}
            </div>
          </div>

          {/* Atividade Recente */}
          <div className={styles.securityCard}>
            <div className={styles.cardHeader}>
              <FaHistory className={styles.cardIcon} />
              <h2>Atividade Recente</h2>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.atividadeItem}>
                <div className={styles.atividadeIcon}>
                  <FaSignOutAlt />
                </div>
                <div>
                  <strong>Login realizado</strong>
                  <p>Hoje, 09:30 - Chrome, Windows</p>
                </div>
              </div>
              <div className={styles.atividadeItem}>
                <div className={styles.atividadeIcon}>
                  <FaKey />
                </div>
                <div>
                  <strong>Senha alterada</strong>
                  <p>Ontem, 14:15 - Firefox, Windows</p>
                </div>
              </div>
              <div className={styles.atividadeItem}>
                <div className={styles.atividadeIcon}>
                  <FaEnvelope />
                </div>
                <div>
                  <strong>Email de verificação enviado</strong>
                  <p>15/01/2024, 10:00</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
}

export default Seguranca;