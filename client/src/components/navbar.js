import imetro from "../img/images.png";
import Style from "./navbar.module.css";

function Navbar() {
    return (
        <nav className="navbar w-100 navbar-expand-lg navbar-light bg-light fixed-top shadow-sm z-3">
            <div className="container">
                <div className="d-flex align-items-center">
                    <img 
                        src={imetro} 
                        alt="Logo do IMETRO" 
                        className={Style.logoImetro}
                    />
                    <div className="ms-3">
                        <h5 className="mb-0">IMETRO</h5>
                        <small className="text-muted">Instituto Politecnico Superior Metropolitano de Angola</small>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;