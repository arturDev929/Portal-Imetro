import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { BsListNested } from "react-icons/bs";
import { FaRegBell } from "react-icons/fa6";
import { IoPersonCircleOutline } from "react-icons/io5";
import { IoSettingsOutline } from "react-icons/io5";
import { RiLogoutCircleRLine } from "react-icons/ri";
import { Link } from "react-router-dom";
import Style from "./NavbarAdm.module.css";
function NavbarAdm(){
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
        useEffect(() => {
            const usuarioSalvo = localStorage.getItem("usuarioLogado");
            if (usuarioSalvo) {
                setUser(JSON.parse(usuarioSalvo));
            }
        }, []);
    const handleLogout = () => {
        localStorage.removeItem("usuarioLogado");
        navigate("/");
    };
    return(
        <nav className={`${Style.navbar} navbar navbar-expand-lg border-bottom z-1 sticky-top p-2 m-0`}>
            <div className="container-fluid">
                <button className="btn d-md-none me-2" type="button" data-bs-toggle="offcanvas" data-bs-target="#sidebarMobile">
                    <BsListNested className="text-white"/>
                </button>
                            
                <div className="ms-auto">
                    <button className="btn me-2">
                        <FaRegBell className="text-white"/>
                    </button>
                    <div className="dropdown d-inline">
                        <button className="btn dropdown-toggle text-white" type="button" data-bs-toggle="dropdown">
                            {user && user.nome} <IoPersonCircleOutline className="mb-1 text-white"/>
                        </button>
                        <ul className={`${Style.dropdownMenu} dropdown-menu dropdown-menu-end`}>
                            {/* <li><Link className={`dropdown-item ${Style.Link}`} to="#"><IoPersonCircleOutline className="me-2 mb-1"/>Perfil</Link></li> */}
                            <li><Link className={`dropdown-item ${Style.Link}`} to="#"><IoSettingsOutline className="me-2 mb-1"/>Configurações</Link></li>
                            <li><hr className="dropdown-divider"/></li>
                            <li onClick={handleLogout}><Link className={`dropdown-item ${Style.Link}`} to="#"><RiLogoutCircleRLine className="me-2 mb-1"/>Terminar Sessão</Link></li>
                        </ul>
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default NavbarAdm