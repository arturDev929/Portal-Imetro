import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import imetro from "../../img/logoFundo.png";
import Style from "./Sidebar.module.css";
<<<<<<< HEAD
import { IoPersonCircleOutline } from "react-icons/io5";
import { IoSettingsOutline,IoTime } from "react-icons/io5";
import { FaRegNewspaper, FaPen, FaCalendarAlt } from "react-icons/fa";
import { MdTopic, MdClass,MdChatBubble } from "react-icons/md";
import { PiStudentDuotone, PiNotePencilLight } from "react-icons/pi";
import { GrSecure } from "react-icons/gr";
=======
import { IoPersonCircleOutline, IoSettingsOutline, IoTime, IoLogOutOutline } from "react-icons/io5";
import { FaRegNewspaper, FaPen, FaCalendarAlt, FaChartLine } from "react-icons/fa";
import { MdTopic, MdClass, MdChatBubble, MdDashboard } from "react-icons/md";
import { GrSecure } from "react-icons/gr";
import { FiMenu, FiBell } from "react-icons/fi";
>>>>>>> eliseu_front2.0

function SidebarTeacher() {
    const [user, setUser] = useState(null);
    const [imageError, setImageError] = useState(false);
<<<<<<< HEAD
=======
    const [isHovered, setIsHovered] = useState(false);
>>>>>>> eliseu_front2.0
    const location = useLocation();

    const closeMobileSidebar = () => {
        const offcanvasEl = document.getElementById('sidebarMobile');
        if (!offcanvasEl) return;

        const bsOffcanvas = window.bootstrap?.Offcanvas?.getInstance(offcanvasEl);
        if (bsOffcanvas) {
            bsOffcanvas.hide();
            return;
        }

        offcanvasEl.classList.remove('show');
        offcanvasEl.style.visibility = 'hidden';
        offcanvasEl.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('offcanvas-open');

        const backdrop = document.querySelector('.offcanvas-backdrop');
        if (backdrop) backdrop.remove();
    };

    useEffect(() => {
        const usuarioSalvo = localStorage.getItem("usuarioLogado");
        if (usuarioSalvo) {
            const userData = JSON.parse(usuarioSalvo);
            setUser(userData);
<<<<<<< HEAD
            // Verificar se a foto existe
=======
>>>>>>> eliseu_front2.0
            if (userData.fotoUrl) {
                const img = new Image();
                img.onerror = () => setImageError(true);
                img.src = userData.fotoUrl;
            }
        }
    }, []);

    useEffect(() => {
        closeMobileSidebar();
    }, [location.pathname]);

<<<<<<< HEAD
    return (
        <div className="container-fluid">
            <div className="row">
                <div className={`${Style.containerFluid} col-md-3 col-lg-2 d-none d-md-block vh-100 position-fixed`}>
                    <div className="text-center py-3">
                        <h5 className="mb-0">
                            <img src={imetro} alt="Logo do IMETRO" className={Style.logoImetro} />
                            <span className="ms-2 fw-bold text-light">Portal Imetro</span>
                        </h5>
                    </div>
                    <nav className="nav flex-column p-3">
                        <div className="mb-3">
                            <Link to="/painelGeralTeacher" className={`nav-link active ${Style.Link}`}>
                                <FaRegNewspaper className="me-2" /> Painel Geral
                            </Link>
                            <Link to="/hometeacher" className={`nav-link active ${Style.Link}`}>
                                <IoPersonCircleOutline className="me-2" /> Perfil
                            </Link>
                            <Link to="/turmasTeacher" className={`nav-link ${Style.Link}`}>
                                <MdClass className="me-2" />Minhas Turmas
                            </Link>
                            <Link to="#" className={`nav-link ${Style.Link}`}>
                                <FaPen  className="me-2" />Avaliações e Notas
                            </Link>
                            <Link to="#" className={`nav-link ${Style.Link}`}>
                                <MdChatBubble className="me-2" />Chat
                            </Link>
                            <Link to="#" className={`nav-link ${Style.Link}`}>
                                <MdTopic className="me-2" />Conteúdos e Tópicos
                            </Link>
                            <Link to="#" className={`nav-link ${Style.Link}`}>
                                <IoTime className="me-2" />Horários
                            </Link>
                            <Link to="#" className={`nav-link ${Style.Link}`}>
                                <FaCalendarAlt className="me-2" />Minhas Agendas
                            </Link>
                        </div>
                        <div className="mb-3">
                            <h6 className="text-uppercase text-muted small fw-bold mb-2">Configurações</h6>
                            <Link to="/definicoesTeacher" className={`nav-link ${Style.Link}`}>
                                <IoSettingsOutline className="me-2" />Configurações
                            </Link>
                            <Link to="/segurancaTeacher" className={`nav-link ${Style.Link}`}>
                                <GrSecure className="me-2" />Segurança
                            </Link>
                        </div>
                    </nav>
                    <div className="p-3 mt-auto position-absolute bottom-0 w-100">
                        <hr />
                        <div className="d-flex align-items-center text-light">
                            {user && user.fotoUrl && !imageError ? (
                                <img
                                    src={user.fotoUrl}
                                    className="rounded-circle me-2"
                                    alt="Foto do Professor"
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        objectFit: 'cover',
                                        border: '2px solid #fff'
                                    }}
                                    onError={() => setImageError(true)}
                                />
                            ) : (
                                <IoPersonCircleOutline 
                                    className="rounded-circle me-2" 
                                    style={{ fontSize: '40px' }}
                                    alt="Usuário"
                                />
                            )}
                            <div>
                                {user && <h6 className="mb-0">{user.nome}</h6>}
                                {user && user.codigo && (
                                    <small className="text-muted">{user.codigo}</small>
                                )}
                            </div>
                        </div>
=======
    const menuItems = [
        { path: "/painelGeralTeacher", icon: MdDashboard, label: "Painel Geral", badge: null },
        { path: "/hometeacher", icon: IoPersonCircleOutline, label: "Perfil", badge: null },
        { path: "/turmasTeacher", icon: MdClass, label: "Minhas Turmas", badge: "3" },
        { path: "/avaliacoesNotas", icon: FaChartLine, label: "Avaliações e Notas", badge: null },
        { path: "/chat", icon: MdChatBubble, label: "Chat", badge: "2" },
        { path: "/topicos", icon: MdTopic, label: "Conteúdos e Tópicos", badge: null },
        { path: "/horario", icon: IoTime, label: "Horários", badge: null },
        { path: "/agenda", icon: FaCalendarAlt, label: "Minhas Agendas", badge: null },
    ];

    const configItems = [
        { path: "/configura", icon: IoSettingsOutline, label: "Configurações" },
        { path: "/segura", icon: GrSecure, label: "Segurança" },
    ];

    return (
        <>
            {/* Botão Mobile com efeito glass */}
           

            {/* Sidebar Desktop com Glassmorphism */}
            <div className={`${Style.containerFluid} d-none d-md-flex flex-column vh-100 position-fixed `}
                style={{
                    width: "315.60px",
                    boxShadow: "4px 0 20px rgba(0, 0, 0, 0.3)",
                    zIndex: 1000
                }}
            >
                {/* Logo Area com animação */}
                <div className="text-center py-4 px-3 position-relative">
                    <div className="position-relative d-inline-block">
                        <img 
                            src={imetro} 
                            alt="Logo do IMETRO" 
                            className={Style.logoImetro}
                            style={{
                                transition: "all 0.3s ease",
                                cursor: "pointer"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05) rotate(5deg)"}
                            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1) rotate(0deg)"}
                        />
                        <div className="position-absolute top-0 end-0">
                            <span className={Style.badge}>PRO</span>
                        </div>
                    </div>
                    <h5 className="mb-0 mt-3">
                        <span className="fw-bold" style={{ 
                            background: "linear-gradient(135deg, #fff, var(--dourado))",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent"
                        }}>Portal Imetro</span>
                    </h5>
                    <small className="text-white-50">Professor</small>
                </div>

                {/* Navigation com animação de entrada */}
                <nav className="nav flex-column px-3 flex-grow-1 overflow-auto" style={{ gap: "4px" }}>
                    {/* Menu Principal */}
                    <div className="mb-4">
                        {menuItems.map((item, index) => (
                            <Link
                                key={item.label}
                                to={item.path}
                                className={`${Style.Link} nav-link ${Style.navItem}`}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "10px 16px",
                                    marginBottom: "4px",
                                    animationDelay: `${index * 0.05}s`
                                }}
                            >
                                <div className="d-flex align-items-center gap-3">
                                    <item.icon className="me-2" style={{ fontSize: "1.2rem" }} />
                                    <span>{item.label}</span>
                                </div>
                                {item.badge && (
                                    <span className={Style.badge}>{item.badge}</span>
                                )}
                            </Link>
                        ))}
                    </div>

                    {/* Separador com efeito glass */}
                    <div className="my-3" style={{ 
                        height: "1px", 
                        background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent)" 
                    }} />

                    {/* Configurações */}
                    <div className="mb-3">
                        <h6 className="text-uppercase small fw-bold mb-3" style={{ 
                            color: "rgba(255,255,255,0.6)",
                            letterSpacing: "1px",
                            fontSize: "0.7rem"
                        }}>
                            <IoSettingsOutline className="me-1" style={{ fontSize: "0.8rem" }} />
                            Configurações
                        </h6>
                        {configItems.map((item) => (
                            <Link
                                key={item.label}
                                to={item.path}
                                className={`${Style.Link} nav-link ${Style.navItem}`}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px",
                                    padding: "10px 16px",
                                    marginBottom: "4px"
                                }}
                            >
                                <item.icon className="me-2" style={{ fontSize: "1.2rem" }} />
                                <span>{item.label}</span>
                            </Link>
                        ))}
                    </div>
                </nav>

                {/* User Profile com efeito glass e hover */}
                <div className={`${Style.profileCard} p-3 mt-auto`}>
                    <div className="d-flex align-items-center gap-3">
                        <div className="position-relative">
                            {user && user.fotoUrl && !imageError ? (
                                <img
                                    src={user.fotoUrl}
                                    className="rounded-circle"
                                    alt="Foto do Professor"
                                    style={{
                                        width: "48px",
                                        height: "48px",
                                        objectFit: "cover",
                                        border: "2px solid var(--dourado)",
                                        transition: "all 0.3s ease"
                                    }}
                                    onError={() => setImageError(true)}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                                />
                            ) : (
                                <IoPersonCircleOutline 
                                    className="rounded-circle" 
                                    style={{ 
                                        fontSize: "48px", 
                                        color: "var(--dourado)",
                                        transition: "all 0.3s ease"
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                                />
                            )}
                            <div className="position-absolute bottom-0 end-0" style={{
                                width: "12px",
                                height: "12px",
                                backgroundColor: "#4caf50",
                                borderRadius: "50%",
                                border: "2px solid var(--azul-escuro)"
                            }}></div>
                        </div>
                        <div className="flex-grow-1">
                            {user && (
                                <>
                                    <h6 className="mb-0 fw-bold" style={{ fontSize: "0.9rem" }}>
                                        {user.nome}
                                    </h6>
                                    {user.codigo && (
                                        <small style={{ 
                                            color: "var(--dourado)",
                                            fontSize: "0.7rem",
                                            fontWeight: "500"
                                        }}>
                                            {user.codigo}
                                        </small>
                                    )}
                                </>
                            )}
                        </div>
                        <FiBell 
                            style={{ 
                                color: "rgba(255,255,255,0.6)",
                                cursor: "pointer",
                                transition: "all 0.3s ease"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = "var(--dourado)"}
                            onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.6)"}
                        />
>>>>>>> eliseu_front2.0
                    </div>
                </div>
            </div>

<<<<<<< HEAD
            {/* Sidebar Mobile com Offcanvas do Bootstrap */}
            <div className={`offcanvas offcanvas-start d-md-none ${Style.containerFluid}`} tabIndex="-1" id="sidebarMobile">
                <div className="offcanvas-header border-bottom">
                    <h5 className="mb-0">
                        <img src={imetro} alt="Logo do IMETRO" className={Style.logoImetro} />
                        <span className="ms-2 fw-bold text-light">Portal Imetro</span>
                    </h5>
                    <button type="button" className="btn-close" data-bs-dismiss="offcanvas"></button>
                </div>
                <div className="offcanvas-body p-0">
                    <nav className="nav flex-column">
                        <div className="p-3 border-bottom">
                            <Link to="/painelGeralTeacher" onClick={closeMobileSidebar} className={`nav-link active ${Style.Link}`}>
                                <FaRegNewspaper className="me-2" /> Painel Geral
                            </Link>
                            <Link to="/hometeacher" onClick={closeMobileSidebar} className={`nav-link active ${Style.Link}`}>
                                <IoPersonCircleOutline className="me-2" /> Perfil
                            </Link>
                            <Link to="/turmasTeacher" onClick={closeMobileSidebar} className={`nav-link ${Style.Link}`}>
                                <MdClass className="me-2" />Minhas Turmas
                            </Link>
                            <Link to="#" onClick={closeMobileSidebar} className={`nav-link ${Style.Link}`}>
                                <FaPen  className="me-2" />Avaliações e Notas
                            </Link>
                            <Link to="#" onClick={closeMobileSidebar} className={`nav-link ${Style.Link}`}>
                                <MdChatBubble className="me-2" />Chat
                            </Link>
                            <Link to="#" onClick={closeMobileSidebar} className={`nav-link ${Style.Link}`}>
                                <MdTopic className="me-2" />Conteúdos e Tópicos
                            </Link>
                            <Link to="#" onClick={closeMobileSidebar} className={`nav-link ${Style.Link}`}>
                                <IoTime className="me-2" />Horários
                            </Link>
                            <Link to="#" onClick={closeMobileSidebar} className={`nav-link ${Style.Link}`}>
                                <FaCalendarAlt className="me-2" />Minhas Agendas
                            </Link>
                        </div>

                        {/* Menu Configurações */}
                        <div className="p-3">
                            <h6 className="text-uppercase text-muted small fw-bold mb-2">Configurações</h6>
                            <Link to="/definicoesTeacher" onClick={closeMobileSidebar} className={`nav-link ${Style.Link}`}>
                                <IoSettingsOutline className="me-2" />Configurações
                            </Link>
                            <Link to="/segurancaTeacher" onClick={closeMobileSidebar} className={`nav-link ${Style.Link}`}>
                                <GrSecure className="me-2" />Segurança
                            </Link>
                        </div>
                    </nav>
                </div>
                <div className="border-top p-3">
                    <div className="d-flex align-items-center text-light">
                        {user && user.fotoUrl && !imageError ? (
                            <img
                                src={user.fotoUrl}
                                className="rounded-circle me-2"
                                alt="Foto do Professor"
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    objectFit: 'cover',
                                    border: '2px solid #fff'
=======
            {/* Sidebar Mobile com Glassmorphism */}
            <div className={`offcanvas offcanvas-start d-md-none ${Style.containerFluid}`} 
                tabIndex="-1" 
                id="sidebarMobile"
                style={{ width: "280px" }}
            >
                <div className="offcanvas-header border-bottom" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
                    <div className="d-flex align-items-center gap-2">
                        <img src={imetro} alt="Logo do IMETRO" className={Style.logoImetro} />
                        <div>
                            <h5 className="mb-0 fw-bold">Portal Imetro</h5>
                            <small className="text-white-50">Professor</small>
                        </div>
                    </div>
                    <button 
                        type="button" 
                        className="btn-close btn-close-white" 
                        data-bs-dismiss="offcanvas"
                    ></button>
                </div>
                
                <div className="offcanvas-body p-0">
                    <nav className="nav flex-column p-3" style={{ gap: "4px" }}>
                        {menuItems.map((item) => (
                            <Link
                                key={item.label}
                                to={item.path}
                                onClick={closeMobileSidebar}
                                className={`${Style.Link} nav-link`}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "12px 16px"
                                }}
                            >
                                <div className="d-flex align-items-center gap-3">
                                    <item.icon style={{ fontSize: "1.2rem" }} />
                                    <span>{item.label}</span>
                                </div>
                                {item.badge && (
                                    <span className={Style.badge}>{item.badge}</span>
                                )}
                            </Link>
                        ))}

                        <div className="my-3" style={{ 
                            height: "1px", 
                            background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent)" 
                        }} />

                        <h6 className="text-uppercase small fw-bold mb-2 px-2" style={{ 
                            color: "rgba(255,255,255,0.6)",
                            letterSpacing: "1px"
                        }}>
                            Configurações
                        </h6>
                        {configItems.map((item) => (
                            <Link
                                key={item.label}
                                to={item.path}
                                onClick={closeMobileSidebar}
                                className={`${Style.Link} nav-link`}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px",
                                    padding: "12px 16px"
                                }}
                            >
                                <item.icon style={{ fontSize: "1.2rem" }} />
                                <span>{item.label}</span>
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="border-top p-3" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
                    <div className="d-flex align-items-center gap-3">
                        {user && user.fotoUrl && !imageError ? (
                            <img
                                src={user.fotoUrl}
                                className="rounded-circle"
                                alt="Foto do Professor"
                                style={{
                                    width: "44px",
                                    height: "44px",
                                    objectFit: "cover",
                                    border: "2px solid var(--dourado)"
>>>>>>> eliseu_front2.0
                                }}
                                onError={() => setImageError(true)}
                            />
                        ) : (
                            <IoPersonCircleOutline 
<<<<<<< HEAD
                                className="rounded-circle me-2" 
                                style={{ fontSize: '40px' }}
                                alt="Usuário"
                            />
                        )}
                        <div>
                            {user && <h6 className="mb-0">{user.nome}</h6>}
                            {user && user.codigo && (
                                <small className="text-muted">{user.codigo}</small>
=======
                                className="rounded-circle" 
                                style={{ fontSize: "44px", color: "var(--dourado)" }}
                            />
                        )}
                        <div>
                            {user && (
                                <>
                                    <h6 className="mb-0 fw-bold">{user.nome}</h6>
                                    {user.codigo && (
                                        <small style={{ color: "var(--dourado)" }}>{user.codigo}</small>
                                    )}
                                </>
>>>>>>> eliseu_front2.0
                            )}
                        </div>
                    </div>
                </div>
            </div>
<<<<<<< HEAD
        </div>
=======
        </>
>>>>>>> eliseu_front2.0
    )
}

export default SidebarTeacher;