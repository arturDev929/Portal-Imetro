import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { BsListNested } from "react-icons/bs";
import { FaRegBell } from "react-icons/fa6";
import { IoSettingsOutline, IoPersonCircleOutline } from "react-icons/io5";
import { RiLogoutCircleRLine } from "react-icons/ri";
import { Link } from "react-router-dom";
import Style from "./Navbar.module.css";

function NavbarTeacher() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [imageError, setImageError] = useState(false);
    const [notificationCount, setNotificationCount] = useState(3);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const usuarioSalvo = localStorage.getItem("usuarioLogado");
        if (usuarioSalvo) {
            const userData = JSON.parse(usuarioSalvo);
            setUser(userData);
            if (userData.fotoUrl) {
                const img = new Image();
                img.onerror = () => setImageError(true);
                img.src = userData.fotoUrl;
            }
        }
    }, []);

    // Efeito de scroll para mudar o estilo da navbar
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("usuarioLogado");
        navigate("/");
    };

    return (
        <nav className={`${Style.navbar} ${isScrolled ? Style.scrolled : ''}  navbar navbar-expand-lg border-bottom z-1 sticky-top`}>
            <div className="container-fluid px-2 px-lg-4">
                {/* Botão Mobile com efeito glass */}
                <button 
                    className={`${Style.menuButton} btn d-md-none me-2`} 
                    type="button" 
                    data-bs-toggle="offcanvas" 
                    data-bs-target="#sidebarMobile"
                >
                    <BsListNested className="text-white" size={20} />
                </button>
                
                {/* Título/Brand para mobile */}
                <div className="d-md-none flex-grow-1">
                    <h6 className="text-white mb-0 fw-bold" style={{ fontSize: "1rem" }}>
                        Portal Imetro
                        <span className="ms-1" style={{ color: "var(--dourado)" }}>Professor</span>
                    </h6>
                </div>
                
                <div className="ms-auto d-flex align-items-center gap-2">
                    {/* Botão de Notificações com Badge */}
                    <div className="position-relative">
                        <button className={`${Style.iconButton} btn`}>
                            <FaRegBell className="text-white" size={18} />
                            {notificationCount > 0 && (
                                <span className={Style.notificationBadge}>
                                    {notificationCount}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Dropdown do Perfil */}
                    <div className="dropdown">
                        <button 
                            className={`${Style.profileButton} btn dropdown-toggle d-flex align-items-center gap-2`} 
                            type="button" 
                            data-bs-toggle="dropdown"
                        >
                            <span className={Style.userName}>
                                {user?.nome?.split(' ')[0] || "Professor"}
                            </span>
                            
                            {user && user.fotoUrl && !imageError ? (
                                <img 
                                    src={user.fotoUrl} 
                                    alt="Foto de Perfil" 
                                    className={Style.fotoPerfilIcone}
                                    onError={() => setImageError(true)}
                                />
                            ) : (
                                <IoPersonCircleOutline className={Style.defaultAvatar} size={32} />
                            )}
                        </button>
                        
                        <ul className={`${Style.dropdownMenu} dropdown-menu dropdown-menu-end`}>
                            <li>
                                <div className={Style.userInfoDropdown}>
                                    <div className="d-flex align-items-center gap-3">
                                        {user && user.fotoUrl && !imageError ? (
                                            <img 
                                                src={user.fotoUrl} 
                                                alt="Perfil" 
                                                className={Style.dropdownAvatar}
                                            />
                                        ) : (
                                            <IoPersonCircleOutline size={40} style={{ color: "var(--dourado)" }} />
                                        )}
                                        <div>
                                            <h6 className="mb-0 text-white">{user?.nome || "Professor"}</h6>
                                            <small style={{ color: "var(--dourado)" }}>{user?.codigo || "Professor"}</small>
                                        </div>
                                    </div>
                                </div>
                            </li>
                            <li><hr className="dropdown-divider" style={{ borderColor: "rgba(255,255,255,0.1)" }} /></li>
                            <li>
                                <Link className={`dropdown-item ${Style.Link}`} to="/hometeacher">
                                    <IoPersonCircleOutline className="me-2 mb-1" size={18} />
                                    Meu Perfil
                                </Link>
                            </li>
                            <li>
                                <Link className={`dropdown-item ${Style.Link}`} to="/definicoesTeacher">
                                    <IoSettingsOutline className="me-2 mb-1" size={18} />
                                    Configurações
                                </Link>
                            </li>
                            <li><hr className="dropdown-divider" style={{ borderColor: "rgba(255,255,255,0.1)" }} /></li>
                            <li onClick={handleLogout}>
                                <Link className={`dropdown-item ${Style.Link} ${Style.logoutItem}`} to="#">
                                    <RiLogoutCircleRLine className="me-2 mb-1" size={18} />
                                    Terminar Sessão
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default NavbarTeacher;