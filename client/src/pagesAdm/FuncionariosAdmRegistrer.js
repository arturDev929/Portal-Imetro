import NavbarAdm from "../components/NavbarAdm";
import SidebarAdm from "../components/SidebarAdm";
import { IoMdAddCircleOutline } from "react-icons/io";
import { useState, useEffect } from "react";
import { showErrorToast } from "../components/CustomToast";
import Axios from "axios"; // Missing import
import { showSuccessToast } from "../components/CustomToast"; // Missing import

function FuncionáriosAdmRegistrer (){
    const [user, setUser] = useState(null);
    useEffect(() => {
        const usuarioSalvo = localStorage.getItem("usuarioLogado");
        if (usuarioSalvo) {
            setUser(JSON.parse(usuarioSalvo));
        }
    }, []);
    const [nome, setNome] = useState("");
    const [contacto, setContacto] = useState("");
    const [nbi, setNBI] = useState("");
    const [cargo, setCargo] = useState("");
    const [loading, setLoading] = useState(false);
    
    const handleSubmitFuncionario = async (e) => { 
        e.preventDefault()

        if(!nome.trim() || !contacto.trim() || !nbi.trim() || !cargo.trim()){
            showErrorToast('Campos Vazios','Preencha todos os campos')
            return; 
        }

        if (!user || !user.id) {
            showErrorToast('Usuário não autenticado', 'Faça login novamente');
            return;
        }

        setLoading(true);
        try{
            const response = await Axios.post('http://localhost:8080/post/registrarfuncionarioMatricular', {
                nome: nome, 
                contacto: contacto,
                cargo: cargo, 
                nbi: nbi,
                idAdm: user.id
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (response.data.sucesso) {
                showSuccessToast(
                    response.data.titulo || "Sucesso",
                    response.data.mensagem || "Funcionário registrado com sucesso"
                );
            } else {
                showErrorToast(response.data.titulo || "Erro", response.data.mensagem);
            }
        }catch(error) {
            console.error('Erro ao registrar funcionário:', error);
            
            if (error.response && error.response.data) {
                showErrorToast(error.response.data.titulo || "Erro", error.response.data.mensagem);
            } else {
                showErrorToast('Erro de conexão', 'Não foi possível conectar ao servidor');
            }
        } finally {
            setLoading(false);
        }
    }
    return(
        <div className="container-fluid">
            <SidebarAdm/>
            <div className="col-md-9 ms-md-auto col-lg-10 px-0">
                <NavbarAdm/>
                <main className="p-4">
                    <div className="row">
                        <div className="col-12 mb-4">
                            <h3 className="text-primary">
                                <IoMdAddCircleOutline className="me-2 mb-1"/>
                                Registrar Funcionários
                            </h3>
                        </div>
                        <div className="col-12 col-lg-6 mb-3">
                            <div className="shadow-sm rounded-3 p-4 bg-light border">
                                <h5 className="text-primary mb-3">
                                    <IoMdAddCircleOutline className="me-2 mb-1"/>
                                    Funcionário Responsável por Inscrições e Matrículas dos alunos
                                </h5>
                                <form className="row g-2" onSubmit={handleSubmitFuncionario}>
                                    <div className="col-12">
                                        <input 
                                            type="text" 
                                            placeholder="Nome Funcionário..." 
                                            className="form-control form-control-sm" 
                                            name="nomefuncionario"
                                            onChange={(e)=>setNome(e.target.value)}
                                            value={nome}
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="col-12">
                                        <input 
                                            type="text" 
                                            placeholder="Contacto..." 
                                            className="form-control form-control-sm" 
                                            name="contactofuncionario"
                                            onChange={(e)=>setContacto(e.target.value)}
                                            value={contacto}
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="col-12">
                                        <select 
                                            className="form-control form-control-sm" 
                                            name="cargo"
                                            value={cargo}
                                            onChange={(e)=>setCargo(e.target.value)}
                                            disabled={loading}
                                        >
                                            <option value="">Selecione um Cargo</option>
                                            <option value="Responsavel por Matricula">Responsavel por Matricula</option>
                                            <option value="Responsavel por Informacoes">Responsavel por Informacoes</option>
                                            <option value="Responsavel por Propinas">Responsavel por Propinas</option>
                                        </select>
                                    </div>
                                    <div className="col-12">
                                        <input 
                                            type="text" 
                                            placeholder="Nº do B.I..." 
                                            className="form-control form-control-sm" 
                                            name="nbifuncionario"
                                            onChange={(e)=>setNBI(e.target.value)}
                                            value={nbi}
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="col-12">
                                        <button 
                                            type="submit" 
                                            className="btn btn-sm btn-primary w-100"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                    Processando...
                                                </>
                                            ) : (
                                                "Registrar"
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            
        </div>
    )
}
export default FuncionáriosAdmRegistrer