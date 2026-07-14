// src/components/Sidebar.jsx
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import imetro from "../../img/logoFundo.png";
import Style from "./Sidebar.module.css";
import { IoPersonCircleOutline } from "react-icons/io5";
import { IoSettingsOutline } from "react-icons/io5";
import { MdTopic } from "react-icons/md";
import { PiStudentDuotone, PiNotePencilLight } from "react-icons/pi";
import { GrSecure } from "react-icons/gr";
import { CiCirclePlus } from "react-icons/ci"

function Sidebar() {
    const [user, setUser] = useState(null);
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
            try {
                const userData = JSON.parse(usuarioSalvo);
                setUser(userData);
            } catch (e) {
                console.error("Erro ao parsear usuário:", e);
            }
        }
    }, []);

    useEffect(() => {
        closeMobileSidebar();
    }, [location.pathname]);

    // Função para obter o ID do usuário
    const getUserId = () => {
        if (!user) return null;
        return user.id || user.id_user || user.userId || user.id_usuario;
    };

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
                            <Link to="/homefuncionarioM" className={`nav-link ${location.pathname === '/homefuncionarioM' ? 'active' : ''} ${Style.Link}`}>
                                <PiStudentDuotone className="mb-2 me-2" /> Estudantes Inscritos
                            </Link>
                            <Link to="/registrarEstudante" className={`nav-link ${location.pathname === '/registrarEstudante' ? 'active' : ''} ${Style.Link}`}>
                                <CiCirclePlus className="mb-2 me-2" /> Novo Registro
                            </Link>
                            <Link to="/lancarNotasM" className={`nav-link ${location.pathname === '/lancarNotasM' ? 'active' : ''} ${Style.Link}`}>
                                <PiNotePencilLight className="mb-2 me-2" /> Lançamento de Notas
                            </Link>
                            <Link to="/gerenciarTopicos" className={`nav-link ${location.pathname === '/gerenciarTopicos' ? 'active' : ''} ${Style.Link}`}>
                                <MdTopic className="mb-2 me-2" /> Gerenciar Tópicos
                            </Link>
                        </div>
                        <div className="mb-3">
                            <h6 className="text-uppercase text-muted small fw-bold mb-2">Configurações</h6>
                            <Link to="/configuracoesFR" className={`nav-link ${location.pathname === '/configuracoesFR' ? 'active' : ''} ${Style.Link}`}>
                                <IoSettingsOutline className="me-2" /> Configurações
                            </Link>
                            <Link to="/segurancaFR" className={`nav-link ${location.pathname === '/segurancaFR' ? 'active' : ''} ${Style.Link}`}>
                                <GrSecure className="me-2" /> Segurança
                            </Link>
                        </div>
                    </nav>
                    <div className="p-3 mt-auto position-absolute bottom-0 w-100">
                        <hr />
                        <div className="d-flex align-items-center text-light">
                            <IoPersonCircleOutline className="rounded-circle me-2" size={32} />
                            <div>
                                {user && (
                                    <>
                                        <h6 className="mb-0">{user.nome || user.name || 'Usuário'}</h6>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar Mobile */}
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
                            <Link to="/homefuncionarioM" onClick={closeMobileSidebar} className={`nav-link ${location.pathname === '/homefuncionarioM' ? 'active' : ''} ${Style.Link}`}>
                                <PiStudentDuotone className="mb-2 me-2" /> Estudantes Inscritos
                            </Link>
                            <Link to="/registrarEstudante" onClick={closeMobileSidebar} className={`nav-link ${location.pathname === '/registrarEstudante' ? 'active' : ''} ${Style.Link}`}>
                                <CiCirclePlus className="mb-2 me-2" /> Novo Registro
                            </Link>
                            <Link to="/lancarNotasM" onClick={closeMobileSidebar} className={`nav-link ${location.pathname === '/lancarNotasM' ? 'active' : ''} ${Style.Link}`}>
                                <PiNotePencilLight className="mb-2 me-2" /> Lançamento de Notas
                            </Link>
                            <Link to="/gerenciarTopicos" onClick={closeMobileSidebar} className={`nav-link ${location.pathname === '/gerenciarTopicos' ? 'active' : ''} ${Style.Link}`}>
                                <MdTopic className="mb-2 me-2" /> Gerenciar Tópicos
                            </Link>
                        </div>
                        <div className="p-3">
                            <h6 className="text-uppercase text-muted small fw-bold mb-2">Configurações</h6>
                            <Link to="/configuracoesFR" onClick={closeMobileSidebar} className={`nav-link ${location.pathname === '/configuracoesFR' ? 'active' : ''} ${Style.Link}`}>
                                <IoSettingsOutline className="me-2" /> Configurações
                            </Link>
                            <Link to="/segurancaFR" onClick={closeMobileSidebar} className={`nav-link ${location.pathname === '/segurancaFR' ? 'active' : ''} ${Style.Link}`}>
                                <GrSecure className="me-2" /> Segurança
                            </Link>
                        </div>
                    </nav>
                </div>
                <div className="border-top p-3">
                    <div className="d-flex align-items-center text-light">
                        <IoPersonCircleOutline className="rounded-circle me-2" size={32} />
                        <div>
                            {user && (
                                <>
                                    <h6 className="mb-0">{user.nome || user.name || 'Usuário'}</h6>
                                    <small className="text-muted" style={{ fontSize: '10px' }}>
                                        ID: {getUserId() || 'N/A'}
                                    </small>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Sidebar;