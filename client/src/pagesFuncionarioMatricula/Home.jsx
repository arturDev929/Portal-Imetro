import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import { useEffect, useState } from "react";
import Inscricoes from "./components/Inscricoes";
import EstudantesAprovados from "./components/EstudantesAprovados";
import EstudantesReprovados from "./components/EstudantesReprovados";
import { FaUserCheck, FaUserTimes, FaUserPlus } from 'react-icons/fa';
import { IoMdPerson } from "react-icons/io";
import Style from "../pagesAdm/GestaoCursoAdm.module.css";

function HomeAdm() {
    const [user, setUser] = useState(null);
    // Estado para controlar qual seção está visível
    const [secaoAtiva, setSecaoAtiva] = useState("inscritos"); // inscritos, aprovados, reprovados
    
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
                    <div className="row mb-4">
                        <div className="col-12">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h2 style={{ color: 'var(--azul-escuro)', fontWeight: '600' }}>
                                        Dashboard de Estudantes
                                    </h2>
                                    {user && (
                                        <p className="text-muted mb-0">
                                            Bem-vindo, {user.nome} | Gestão de inscrições e matrículas
                                        </p>
                                    )}
                                </div>
                                <div className="badge p-3" style={{ backgroundColor: 'var(--azul-escuro)' }}>
                                    <IoMdPerson size={24} color="white" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row mb-4 g-2">
                        <div className="col-md-2">
                            <button 
                                className={`btn w-100 ${secaoAtiva === "inscritos" ? Style.botoesGestaoCurso : Style.botoesGestaoCursoD}`}
                                onClick={() => setSecaoAtiva("inscritos")}
                            >
                                <FaUserPlus className="me-2 mb-1" />
                                E. Inscritos
                            </button>
                        </div>
                        <div className="col-md-2">
                            <button 
                                className={`btn w-100 ${secaoAtiva === "aprovados" ? Style.botoesGestaoCurso : Style.botoesGestaoCursoD}`}
                                onClick={() => setSecaoAtiva("aprovados")}
                            >
                                <FaUserCheck className="me-2 mb-1" />
                                E. Aprovados
                            </button>
                        </div>
                        <div className="col-md-2">
                            <button 
                                className={`btn w-100 ${secaoAtiva === "reprovados" ? Style.botoesGestaoCurso : Style.botoesGestaoCursoD}`}
                                onClick={() => setSecaoAtiva("reprovados")}
                            >
                                <FaUserTimes className="me-2 mb-1" />
                                E. Reprovados
                            </button>
                        </div>
                    </div>

                    {/* Seções condicionais */}
                    <div className="row">
                        <div className="col-12">
                            {secaoAtiva === "inscritos" && (
                                <div>
                                    <div className="d-flex align-items-center gap-2 mb-3">
                                        <FaUserPlus size={20} color="#003366" />
                                        <h4 className="mb-0" style={{ color: 'var(--azul-escuro)' }}>
                                            Estudantes Inscritos
                                        </h4>
                                    </div>
                                    <Inscricoes />
                                </div>
                            )}

                            {secaoAtiva === "aprovados" && (
                                <div>
                                    <div className="d-flex align-items-center gap-2 mb-3">
                                        <FaUserCheck size={20} color="#28a745" />
                                        <h4 className="mb-0" style={{ color: 'var(--azul-escuro)' }}>
                                            Estudantes Aprovados
                                        </h4>
                                    </div>
                                    <EstudantesAprovados/>
                                </div>
                            )}

                            {secaoAtiva === "reprovados" && (
                                <div>
                                    <div className="d-flex align-items-center gap-2 mb-3">
                                        <FaUserTimes size={20} color="#dc3545" />
                                        <h4 className="mb-0" style={{ color: 'var(--azul-escuro)' }}>
                                            Estudantes Reprovados
                                        </h4>
                                    </div>
                                    <EstudantesReprovados/>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default HomeAdm;