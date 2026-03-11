import Sidebar from "./components/Sidebar";
import Navbar from "../components/NavbarAdm";
import { useEffect,useState } from "react";

function HomeAdm() {
    const [user, setUser] = useState(null);
        useEffect(() => {
            const usuarioSalvo = localStorage.getItem("usuarioLogado");
            if (usuarioSalvo) {
                setUser(JSON.parse(usuarioSalvo));
            }
        }, []);
    return (
        <div className={`container-fluid p-0 m-0`}>
            <Sidebar/>
            <div className="col-md-9 ms-md-auto col-lg-10 px-0">
                    <Navbar/>
                    <main className="p-4">
                        <div className="row">
                            <div className="col-12 mb-4">
                                <h2>Estudantes Inscritos</h2>
                                {user && <p className="text-muted">Bem-vindo  {user.nome}</p>}
                            </div>
                        </div>
                    </main>
            </div>
        </div>
    );
}

export default HomeAdm;