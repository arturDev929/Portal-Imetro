import imetro from "../img/logoFundo.png";
import Style from "./navbar.module.css";

function Navbar() {
    return (
        <nav className={`${Style.navbarHome} w-100 navbar-expand-lg fixed-top shadow-sm p-2 z-3`}>
            <div className="container">
                <div className="d-flex align-items-center">
                    <img 
                        src={imetro} 
                        alt="Logo do IMETRO" 
                        className={Style.logoImetro}
                    />
                    <div className="ms-3">
                        <h5 className="mb-0 text-white">IMETRO</h5>
                        <small className="text-muted">Instituto Politecnico Superior Metropolitano de Angola</small>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;