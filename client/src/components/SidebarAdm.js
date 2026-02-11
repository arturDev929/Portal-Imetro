import { useState, useEffect } from "react";
import imetro from "../img/images.png";
import Style from "./navbar.module.css";
import { Link } from "react-router-dom";
import { IoPersonCircleOutline } from "react-icons/io5";
import { FaUserTie } from "react-icons/fa";
import { LiaChalkboardTeacherSolid } from "react-icons/lia";
import { FaDiscourse } from "react-icons/fa";
import { IoSettingsOutline } from "react-icons/io5";
import { GrSecure } from "react-icons/gr";
import { PiStudentDuotone } from "react-icons/pi";
import { FaRegNewspaper } from "react-icons/fa";
function SidebarAdm(){
    const [user, setUser] = useState(null);
    useEffect(() => {
        const usuarioSalvo = localStorage.getItem("usuarioLogado");
        if (usuarioSalvo) {
            setUser(JSON.parse(usuarioSalvo));
        }
    }, []);
    return(
        <div className="container-fluid">
            <div className="row">
                {/* Sidebar - Usando Offcanvas do Bootstrap */}
                <div className="col-md-3 col-lg-2 d-none d-md-block bg-light vh-100 position-fixed">
                    {/* Logo */}
                    <div className="text-center py-3">
                        <h5 className="mb-0">
                            <img src={imetro} alt="Logo do IMETRO" className={Style.logoImetro}/>
                            <span className="ms-2 fw-bold">Portal Imetro</span>
                        </h5>
                    </div>

                    {/* Menu Principal */}
                    <nav className="nav flex-column p-3">
                        <div className="mb-3">
                            <Link to="/homeAdm" className={`nav-link active ${Style.Link}`}>
                                <FaRegNewspaper  className="mb-2 me-2 mt-1"/> Notícias
                            </Link>
                            <h6 className="text-uppercase text-muted small fw-bold mb-2">Registros</h6>
                            <Link to="/funcionariosAdmRegistrer" className={`nav-link active ${Style.Link}`}>
                                <FaUserTie className="mb-2 me-2"/> Funcionários
                            </Link>
                            <Link to="/professoresAdmRegistrer" className={`nav-link ${Style.Link}`}>
                                <LiaChalkboardTeacherSolid className="mb-2 me-2"/>Professores
                            </Link>
                            <Link to="/cursosAdmRegistrer" className={`nav-link ${Style.Link}`}>
                                <FaDiscourse className="mb-2 me-2"/>Cursos
                            </Link>
                        </div>

                        {/* Menu Secundário */}
                        <div className="mb-3">
                            <h6 className="text-uppercase text-muted small fw-bold mb-2">Gestão</h6>
                            <Link to="#" className={`nav-link active ${Style.Link}`}>
                                <FaUserTie className="mb-2 me-2"/> Funcionários
                            </Link>
                            <Link to="/gestaoProfessorAdm" className={`nav-link ${Style.Link}`}>
                                <LiaChalkboardTeacherSolid className="mb-2 me-2"/>Professores
                            </Link>
                            <Link to="/gestaoCursoAdm" className={`nav-link ${Style.Link}`}>
                                <FaDiscourse className="mb-2 me-2"/>Cursos
                            </Link>
                            <Link to="#" className={`nav-link ${Style.Link}`}>
                                <PiStudentDuotone className="mb-2 me-2"/>Estudantes
                            </Link>
                        </div>

                        {/* Menu Configurações */}
                        <div className="mb-3">
                            <h6 className="text-uppercase text-muted small fw-bold mb-2">Configurações</h6>
                            <Link to="#" className={`nav-link ${Style.Link}`}>
                                <IoSettingsOutline className="me-2"/>Configurações
                            </Link>
                            <Link to="#" className={`nav-link ${Style.Link}`}>
                                <GrSecure className="me-2"/>Segurança
                            </Link>
                        </div>
                    </nav>

                    {/* Usuário Info */}
                    <div className=" p-3 mt-auto position-absolute bottom-0 w-100">
                        <hr/>
                        <div className="d-flex align-items-center">
                            <IoPersonCircleOutline className="rounded-circle me-2" alt="Usuário"/>
                            <div>
                                {user && <h6 className="mb-0">{user.nome}</h6>}
                            </div>
                        </div>
                    </div>
                </div>                
            </div>

            {/* Sidebar Mobile com Offcanvas do Bootstrap */}
            <div className="offcanvas offcanvas-start d-md-none" tabIndex="-1" id="sidebarMobile">
                <div className="offcanvas-header border-bottom">
                    <h5 className="mb-0">
                        <img src={imetro} alt="Logo do IMETRO" className={Style.logoImetro} to="/homeAdm"/>
                        <span className="ms-2 fw-bold">Portal Imetro</span>
                    </h5>
                    <button type="button" className="btn-close" data-bs-dismiss="offcanvas"></button>
                </div>
                <div className="offcanvas-body p-0">
                    <nav className="nav flex-column">
                        {/* Menu Principal */}
                        <div className="p-3 border-bottom">
                            <Link to="/homeAdm" className={`nav-link active ${Style.Link}`}>
                                <FaRegNewspaper  className="mb-2 me-2 mt-1"/> Notícias
                            </Link>
                            <h6 className="text-uppercase text-muted small fw-bold mb-2">Registros</h6>
                            <Link to="/funcionariosAdmRegistrer" className={`nav-link active ${Style.Link}`}>
                                <FaUserTie className="mb-2 me-2"/> Funcionários
                            </Link>
                            <Link to="/professoresAdmRegistrer" className={`nav-link ${Style.Link}`}>
                                <LiaChalkboardTeacherSolid className="mb-2 me-2"/>Professores
                            </Link>
                            <Link to="/cursosAdmRegistrer" className={`nav-link ${Style.Link}`}>
                                <FaDiscourse className="mb-2 me-2"/>Cursos
                            </Link>
                        </div>

                        {/* Menu Secundário */}
                        <div className="p-3 border-bottom">
                            <h6 className="text-uppercase text-muted small fw-bold mb-2">Gestão</h6>
                            <Link to="#" className={`nav-link active ${Style.Link}`}>
                                <FaUserTie className="mb-2 me-2"/> Funcionários
                            </Link>
                            <Link to="/gestaoProfessorAdm" className={`nav-link ${Style.Link}`}>
                                <LiaChalkboardTeacherSolid className="mb-2 me-2"/>Professores
                            </Link>
                            <Link to="/gestaoCursoAdm" className={`nav-link ${Style.Link}`}>
                                <FaDiscourse className="mb-2 me-2"/>Cursos
                            </Link>
                            <Link to="#" className={`nav-link ${Style.Link}`}>
                                <PiStudentDuotone className="mb-2 me-2"/>Estudantes
                            </Link>
                        </div>

                        {/* Menu Configurações */}
                        <div className="p-3">
                            <h6 className="text-uppercase text-muted small fw-bold mb-2">Configurações</h6>
                            <Link to="#" className={`nav-link ${Style.Link}`}>
                                <IoSettingsOutline className="me-2"/>Configurações
                            </Link>
                            <Link to="#" className={`nav-link ${Style.Link}`}>
                                <GrSecure className="me-2"/>Segurança
                            </Link>
                        </div>
                    </nav>
                </div>
                <div className="border-top p-3">
                    <div className="d-flex align-items-center">
                        <IoPersonCircleOutline className="rounded-circle me-2" alt="Usuário"/>
                        <div>
                            {user && <h6 className="mb-0">{user.nome}</h6>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default SidebarAdm