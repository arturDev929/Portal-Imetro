import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TeacherLayout from "../layouts/TeacherLayout";
import { 
  FaUser, 
  FaBell, 
  FaPalette, 
  FaLanguage,
  FaGlobe,
  FaSave,
  FaUndo,
  FaImage,
  FaCamera
} from "react-icons/fa";
import { 
  MdNotifications,
  MdDarkMode,
  MdLanguage,
  MdEmail,
  MdPhone,
  MdLocationOn,
  MdClose
} from "react-icons/md";
import styles from "./Configuracoes.module.css";

function Configuracoes() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [configuracoes, setConfiguracoes] = useState({
    perfil: {
      nome: "",
      email: "",
      telefone: "",
      cargo: "",
      departamento: ""
    },
    notificacoes: {
      email: true,
      push: true,
      lembreteAulas: true,
      lembreteProvas: true,
      lembreteReunioes: true,
      newsletter: false
    },
    aparencia: {
      tema: "claro",
      tamanhoFonte: "medio",
      compacto: false
    },
    idioma: "pt-BR"
  });

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem("usuarioLogado");
    if (usuarioSalvo) {
      const userData = JSON.parse(usuarioSalvo);
      setUser(userData);
      carregarConfiguracoes();
    } else {
      navigate("/");
    }
  }, [navigate]);

  const carregarConfiguracoes = () => {
    const configSalvas = localStorage.getItem("configuracoes");
    if (configSalvas) {
      setConfiguracoes(JSON.parse(configSalvas));
    } else {
      setConfiguracoes({
        perfil: {
          nome: user?.nome || "",
          email: user?.email || "",
          telefone: "",
          cargo: "Professor",
          departamento: "Educação"
        },
        notificacoes: {
          email: true,
          push: true,
          lembreteAulas: true,
          lembreteProvas: true,
          lembreteReunioes: true,
          newsletter: false
        },
        aparencia: {
          tema: "claro",
          tamanhoFonte: "medio",
          compacto: false
        },
        idioma: "pt-BR"
      });
    }
  };

  const salvarConfiguracoes = () => {
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem("configuracoes", JSON.stringify(configuracoes));
      setLoading(false);
      alert("Configurações salvas com sucesso!");
    }, 500);
  };

  const resetarConfiguracoes = () => {
    if (window.confirm("Tem certeza que deseja resetar todas as configurações?")) {
      setConfiguracoes({
        perfil: {
          nome: user?.nome || "",
          email: user?.email || "",
          telefone: "",
          cargo: "Professor",
          departamento: "Educação"
        },
        notificacoes: {
          email: true,
          push: true,
          lembreteAulas: true,
          lembreteProvas: true,
          lembreteReunioes: true,
          newsletter: false
        },
        aparencia: {
          tema: "claro",
          tamanhoFonte: "medio",
          compacto: false
        },
        idioma: "pt-BR"
      });
    }
  };

  const atualizarPerfil = (campo, valor) => {
    setConfiguracoes({
      ...configuracoes,
      perfil: { ...configuracoes.perfil, [campo]: valor }
    });
  };

  const atualizarNotificacao = (campo, valor) => {
    setConfiguracoes({
      ...configuracoes,
      notificacoes: { ...configuracoes.notificacoes, [campo]: valor }
    });
  };

  const atualizarAparecia = (campo, valor) => {
    setConfiguracoes({
      ...configuracoes,
      aparencia: { ...configuracoes.aparencia, [campo]: valor }
    });
  };

  return (
    <TeacherLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            <FaUser className={styles.titleIcon} />
            Configurações
          </h1>
          <p className={styles.subtitle}>
            Personalize sua experiência no portal
          </p>
        </div>

        <div className={styles.configGrid}>
          {/* Perfil */}
          <div className={styles.configCard}>
            <div className={styles.cardHeader}>
              <FaUser className={styles.cardIcon} />
              <h2>Perfil</h2>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.avatarSection}>
                <div className={styles.avatar}>
                  {user?.fotoUrl ? (
                    <img src={user.fotoUrl} alt="Perfil" />
                  ) : (
                    <FaUser />
                  )}
                  <button className={styles.changeAvatarBtn}>
                    <FaCamera />
                  </button>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Nome Completo</label>
                <input
                  type="text"
                  value={configuracoes.perfil.nome}
                  onChange={(e) => atualizarPerfil("nome", e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Email</label>
                <input
                  type="email"
                  value={configuracoes.perfil.email}
                  onChange={(e) => atualizarPerfil("email", e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Telefone</label>
                <input
                  type="tel"
                  value={configuracoes.perfil.telefone}
                  onChange={(e) => atualizarPerfil("telefone", e.target.value)}
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Cargo</label>
                  <input
                    type="text"
                    value={configuracoes.perfil.cargo}
                    onChange={(e) => atualizarPerfil("cargo", e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Departamento</label>
                  <input
                    type="text"
                    value={configuracoes.perfil.departamento}
                    onChange={(e) => atualizarPerfil("departamento", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Notificações */}
          <div className={styles.configCard}>
            <div className={styles.cardHeader}>
              <FaBell className={styles.cardIcon} />
              <h2>Notificações</h2>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.notificationItem}>
                <div>
                  <strong>Notificações por Email</strong>
                  <p>Receber alertas por email</p>
                </div>
                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    checked={configuracoes.notificacoes.email}
                    onChange={(e) => atualizarNotificacao("email", e.target.checked)}
                  />
                  <span className={styles.slider}></span>
                </label>
              </div>
              <div className={styles.notificationItem}>
                <div>
                  <strong>Notificações Push</strong>
                  <p>Receber notificações no navegador</p>
                </div>
                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    checked={configuracoes.notificacoes.push}
                    onChange={(e) => atualizarNotificacao("push", e.target.checked)}
                  />
                  <span className={styles.slider}></span>
                </label>
              </div>
              <div className={styles.notificationItem}>
                <div>
                  <strong>Lembretes de Aulas</strong>
                  <p>Receber lembretes antes das aulas</p>
                </div>
                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    checked={configuracoes.notificacoes.lembreteAulas}
                    onChange={(e) => atualizarNotificacao("lembreteAulas", e.target.checked)}
                  />
                  <span className={styles.slider}></span>
                </label>
              </div>
              <div className={styles.notificationItem}>
                <div>
                  <strong>Lembretes de Provas</strong>
                  <p>Receber lembretes antes das provas</p>
                </div>
                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    checked={configuracoes.notificacoes.lembreteProvas}
                    onChange={(e) => atualizarNotificacao("lembreteProvas", e.target.checked)}
                  />
                  <span className={styles.slider}></span>
                </label>
              </div>
            </div>
          </div>

          {/* Aparência */}
          <div className={styles.configCard}>
            <div className={styles.cardHeader}>
              <FaPalette className={styles.cardIcon} />
              <h2>Aparência</h2>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.formGroup}>
                <label>Tema</label>
                <select
                  value={configuracoes.aparencia.tema}
                  onChange={(e) => atualizarAparecia("tema", e.target.value)}
                >
                  <option value="claro">Claro</option>
                  <option value="escuro">Escuro</option>
                  <option value="sistema">Sistema</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Tamanho da Fonte</label>
                <select
                  value={configuracoes.aparencia.tamanhoFonte}
                  onChange={(e) => atualizarAparecia("tamanhoFonte", e.target.value)}
                >
                  <option value="pequeno">Pequeno</option>
                  <option value="medio">Médio</option>
                  <option value="grande">Grande</option>
                </select>
              </div>
              <div className={styles.notificationItem}>
                <div>
                  <strong>Modo Compacto</strong>
                  <p>Reduzir espaçamentos da interface</p>
                </div>
                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    checked={configuracoes.aparencia.compacto}
                    onChange={(e) => atualizarAparecia("compacto", e.target.checked)}
                  />
                  <span className={styles.slider}></span>
                </label>
              </div>
            </div>
          </div>

          {/* Idioma */}
          <div className={styles.configCard}>
            <div className={styles.cardHeader}>
              <FaLanguage className={styles.cardIcon} />
              <h2>Idioma</h2>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.formGroup}>
                <label>Idioma do Sistema</label>
                <select
                  value={configuracoes.idioma}
                  onChange={(e) => setConfiguracoes({ ...configuracoes, idioma: e.target.value })}
                >
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="en-US">English (US)</option>
                  <option value="es">Español</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.btnReset} onClick={resetarConfiguracoes}>
            <FaUndo /> Resetar Padrões
          </button>
          <button className={styles.btnSave} onClick={salvarConfiguracoes} disabled={loading}>
            <FaSave /> {loading ? "Salvando..." : "Salvar Configurações"}
          </button>
        </div>
      </div>
    </TeacherLayout>
  );
}

export default Configuracoes;