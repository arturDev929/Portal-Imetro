import SidebarAdm from "../components/SidebarAdm";
import NavbarAdm from "../components/NavbarAdm";
import Style from "./HomeAdm.module.css";

function HomeAdm() {
    return (
        <div className={`container-fluid ${Style.homeAdm} p-0 m-0`}>
            <SidebarAdm/>
            <div className="col-md-9 ms-md-auto col-lg-10 px-0">
                    <NavbarAdm/>
                    <main className="p-4">
                        <div className="row">
                            <div className="col-12 mb-4">
                                <h2>Painel Geral do Administrador</h2>
                                <p className="text-muted">Bem-vindo ao painel administrativo</p>
                            </div>
                        </div>
                    </main>
            </div>
        </div>
    );
}

export default HomeAdm;