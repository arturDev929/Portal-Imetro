import { useState, useEffect } from "react";
import imetro from "../../img/logoFundo.png";
import Style from "./Sidebar.module.css";
import { Link } from "react-router-dom";
import { IoPersonCircleOutline } from "react-icons/io5";
import { IoSettingsOutline } from "react-icons/io5";
import { MdTopic } from "react-icons/md";
import { CiChat2 } from "react-icons/ci";
import { PiStudentDuotone,PiNotePencilLight  } from "react-icons/pi";
import { GrSecure } from "react-icons/gr";
function Sidebar(){
    const [user, setUser] = useState(null);
    useEffect(() => {
        const usuarioSalvo = localStorage.getItem("usuarioLogado");
        if (usuarioSalvo) {
            setUser(JSON.parse(usuarioSalvo));
        }
    }, []);
    return(
        <div className="container-fluid p-0 m-0">
            <div className="row">
                <div className={`${Style.containerFluid} col-md-3 col-lg-2 d-none d-md-block vh-100 position-fixed`}>
                    <div className="text-center py-3">
                        <h5 className="mb-0">
                            <img src={imetro} alt="Logo do IMETRO" className={Style.logoImetro}/>
                            <span className="ms-2 fw-bold text-light">Portal Imetro</span>
                        </h5>
                    </div>
                    <nav className="nav flex-column p-3">
                        <div className="mb-3">
                            {/* <h6 className="text-uppercase text-muted small fw-bold mb-2">Gestão</h6> */}
                            <Link to="#" className={`nav-link active ${Style.Link}`}>
                                <PiStudentDuotone className="mb-2 me-2"/> Estudantes Inscritos
                            </Link>
                            <Link to="#" className={`nav-link ${Style.Link}`}>
                                <CiChat2 className="mb-2 me-2"/>Mensagens
                            </Link>
                            <Link to="#" className={`nav-link ${Style.Link}`}>
                                <PiNotePencilLight className="mb-2 me-2"/>Lançamento de Notas
                            </Link>
                            <Link to="#" className={`nav-link ${Style.Link}`}>
                                <PiStudentDuotone className="mb-2 me-2"/>Alunos Admitidos
                            </Link>
                            <Link to="#" className={`nav-link ${Style.Link}`}>
                                <MdTopic className="mb-2 me-2"/>Add. Tópicos
                            </Link>
                        </div>
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
                    <div className=" p-3 mt-auto position-absolute bottom-0 w-100">
                        <hr/>
                        <div className="d-flex align-items-center text-light">
                            <IoPersonCircleOutline className="rounded-circle me-2" alt="Usuário"/>
                            <div>
                                {user && <h6 className="mb-0">{user.nome}</h6>}
                            </div>
                        </div>
                    </div>
                </div>                
            </div>

            {/* Sidebar Mobile com Offcanvas do Bootstrap */}
            <div className={`offcanvas offcanvas-start d-md-none ${Style.containerFluid}`} tabIndex="-1" id="sidebarMobile">
                <div className="offcanvas-header border-bottom">
                    <h5 className="mb-0">
                        <img src={imetro} alt="Logo do IMETRO" className={Style.logoImetro} to="/homeAdm"/>
                        <span className="ms-2 fw-bold text-light">Portal Imetro</span>
                    </h5>
                    <button type="button" className="btn-close" data-bs-dismiss="offcanvas"></button>
                </div>
                <div className="offcanvas-body p-0">
                    <nav className="nav flex-column">
                        <div className="p-3 border-bottom">
                            <Link to="#" className={`nav-link active ${Style.Link}`}>
                                <PiStudentDuotone className="mb-2 me-2"/> Estudantes Inscritos
                            </Link>
                            <Link to="#" className={`nav-link ${Style.Link}`}>
                                <CiChat2 className="mb-2 me-2"/>Mensagens
                            </Link>
                            <Link to="#" className={`nav-link ${Style.Link}`}>
                                <PiNotePencilLight className="mb-2 me-2"/>Lançamento de Notas
                            </Link>
                            <Link to="#" className={`nav-link ${Style.Link}`}>
                                <PiStudentDuotone className="mb-2 me-2"/>Alunos Admitidos
                            </Link>
                            <Link to="#" className={`nav-link ${Style.Link}`}>
                                <MdTopic className="mb-2 me-2"/>Add. Tópicos
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
                    <div className="d-flex align-items-center text-light">
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
export default Sidebar