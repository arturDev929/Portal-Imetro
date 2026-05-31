import FuncionarioLayout from "../layouts/FuncionarioLayout";
import { useEffect, useState } from "react";
import Inscricoes from "./components/Inscricoes";
import { FaUserCheck, FaUserTimes, FaUserPlus } from 'react-icons/fa';
import { IoMdPerson } from "react-icons/io";
import Style from "../pagesAdm/GestaoCursoAdm.module.css";
import api from "../service/api";

function HomeAdm() {
    const [user, setUser] = useState(null);

    const [secaoAtiva, setSecaoAtiva] = useState("Pendente"); // inscritos, aprovados, reprovados
    const [inscritos,setInscritos]=useState([])
    useEffect(() => {
        const usuarioSalvo = localStorage.getItem("usuarioLogado");
        if (usuarioSalvo) {
            setUser(JSON.parse(usuarioSalvo));
        }
    }, []);

    useEffect(()=>{
        RequestData()
    },[inscritos])

    async function  RequestData() {
        const data=await api.get("/EstudantesInscritos");
        console.log(data.data)
    }

    const secoes = [
        {
            cor: "#003366",
            titulo: "Estudantes Inscritos",
            icone: FaUserPlus,
            status: "Pendente"
        },
        {
            cor: "#28a745",
            titulo: "Estudantes Admitidos",
            icone: FaUserCheck,
            status: "Admitido"
        },
        {
            cor: "#dc3545",
            titulo: "Estudantes Não Admitido",
            icone: FaUserTimes,
            status: "Não Admitido"
        }
    ];

    return (
        <FuncionarioLayout>
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
                                className={`btn w-100 ${secaoAtiva === "Pendente" ? Style.botoesGestaoCurso : Style.botoesGestaoCursoD}`}
                                onClick={() => setSecaoAtiva("Pendente")}
                            >
                                <FaUserPlus className="me-2 mb-1" />
                                E. Inscritos
                            </button>
                        </div>
                        <div className="col-md-2">
<<<<<<< Updated upstream
                            <button
                                className={`btn w-100 ${secaoAtiva === "Aprovado" ? Style.botoesGestaoCurso : Style.botoesGestaoCursoD}`}
                                onClick={() => setSecaoAtiva("Aprovado")}
=======
                            <button 
                                className={`btn w-100 ${secaoAtiva === "Admitido" ? Style.botoesGestaoCurso : Style.botoesGestaoCursoD}`}
                                onClick={() => setSecaoAtiva("Admitido")}
>>>>>>> Stashed changes
                            >
                                <FaUserCheck className="me-2 mb-1" />
                                E. Admitidos
                            </button>
                        </div>
                        <div className="col-md-2">
<<<<<<< Updated upstream
                            <button
                                className={`btn w-100 ${secaoAtiva === "Reprovado" ? Style.botoesGestaoCurso : Style.botoesGestaoCursoD}`}
                                onClick={() => setSecaoAtiva("Reprovado")}
=======
                            <button 
                                className={`btn w-100 ${secaoAtiva === "Não Admitido" ? Style.botoesGestaoCurso : Style.botoesGestaoCursoD}`}
                                onClick={() => setSecaoAtiva("Não Admitido")}
>>>>>>> Stashed changes
                            >
                                <FaUserTimes className="me-2 mb-1" />
                                E. Não Admitidos
                            </button>
                        </div>
                    </div>

                    {/* Seções condicionais */}
                    <div className="row">
                        <div className="col-12">
                        {secoes.map((secao) => (
                            secaoAtiva === secao.status && (
                                <div key={secao.status}>
                                    <div className="d-flex align-items-center gap-2 mb-3">
                                        <secao.icone size={20} color={secao.cor} className="me-2" />
                                        <h4 className="mb-0" style={{ color: 'var(--azul-escuro)' }}>
                                            {secao.titulo}
                                        </h4>
                                    </div>
                                    <Inscricoes filtroStatus={secao.status} />
                                </div>
                            )
                        ))}

                        </div>
                    </div>
        </FuncionarioLayout>
    );
}

export default HomeAdm;