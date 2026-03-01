import NavbarAdm from "../components/NavbarAdm";
import SidebarAdm from "../components/SidebarAdm";
import Style from "../components/DepartamentosEdit.module.css"

function GestaoFuncionarioAdm(){
    return(
        <div className={`container-fluid ${Style.gestaoCursos} p-0 m-0`}>
            <SidebarAdm />
            <div className="col-md-9 ms-md-auto col-lg-10 px-0">
                <NavbarAdm />
                <main className="p-4" style={{ backgroundColor: 'var(--cinza-claro)' }}>
                    
                </main>
            </div>
        </div>
    )
}
export default GestaoFuncionarioAdm