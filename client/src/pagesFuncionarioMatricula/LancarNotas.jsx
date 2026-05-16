import FuncionarioLayout from "../layouts/FuncionarioLayout";
import { useEffect, useMemo, useState } from "react";
import { FaSave, FaEdit, FaCheckCircle, FaChartLine } from 'react-icons/fa';
import Style from "../pagesAdm/GestaoCursoAdm.module.css";
import api from "../service/api";

function LancarNotasM() {
    const [user, setUser] = useState(null);
    const [cursos, setCursos] = useState([]);
    const [cursoSelecionado, setCursoSelecionado] = useState("");
    const [numeroEstudante,setNumeroEstudante]=useState("")
    const [notaEstudante,setNotaEstudante]=useState("")
    const [estudantes, setEstudantes] = useState([]);
    const [notas, setNotas] = useState({});
    const [modoEdicao, setModoEdicao] = useState({});
    const [loading, setLoading] = useState(false);
    const [mensagem, setMensagem] = useState({ texto: "", tipo: "" });

    useEffect(() => {
      carregarEstudantes()
    }, []);

    async function carregarEstudantes() {
        // Sem requisição - apenas simulando loading
        setLoading(true);
        const resp=await api.get("/EstudantesByStatus/Aprovado")
        setEstudantes(resp.data)
        setLoading(false);

    }

    const filtroEstudante=useMemo(()=>
        estudantes.filter(estudante=>
            estudante.numeroInscricao_estudanteInscricao==numeroEstudante).
            map(estud=> estud)
    ,[estudantes,numeroEstudante])

    const handleCursoChange = (e) => {
        const cursoId = e.target.value;
        setCursoSelecionado(cursoId);
        if (cursoId) {
            carregarEstudantes(cursoId);
        } else {
            setEstudantes([]);
        }
    };

    const handleNotaChange = (estudanteId, value) => {
        // Validar nota entre 0 e 10
        let notaValida = value;
        if (value !== "") {
            const num = parseFloat(value);
            if (num < 0) notaValida = "0";
            if (num > 10) notaValida = "10";
        }
        setNotas(prev => ({ ...prev, [estudanteId]: notaValida }));
    };

    const habilitarEdicao = (estudanteId) => {
        setModoEdicao(prev => ({ ...prev, [estudanteId]: true }));
    };

    const salvarNota = async () => {
        const estudante=filtroEstudante.at(0)

        if (notaEstudante === "" || notaEstudante === null) {
            setMensagem({ texto: "Por favor, insira uma nota válida (0 a 10)", tipo: "error" });
            setTimeout(() => setMensagem({ texto: "", tipo: "" }), 3000);
            return;
        }

        const notaNum = parseFloat(notaEstudante);
        if (isNaN(notaNum) || notaNum < 0 || notaNum > 20) {
            setMensagem({ texto: "Nota inválida. Use valores entre 0 e 10", tipo: "error" });
            return;
        }

        setLoading(true);

        // Simular salvamento
        setTimeout(() => {
            setModoEdicao(prev => ({ ...prev, [estudanteId]: false }));
            setMensagem({ texto: "Nota lançada com sucesso!", tipo: "success" });
            api.put("/estudanteInscritoNota/"+numeroEstudante,{"nota":notaEstudante})
            setLoading(false);
        }, 500);
    };

    const getStatusNota = (nota) => {
        if (nota === "" || nota === null) return { texto: "Não lançada", cor: "#dc3545" };
        const notaNum = parseFloat(nota);
        if (notaNum >= 7) return { texto: "Aprovado", cor: "#28a745" };
        if (notaNum >= 5) return { texto: "Recuperação", cor: "#ffc107" };
        return { texto: "Reprovado", cor: "#dc3545" };
    };






    return (
        <FuncionarioLayout>
            <div className="row mb-4">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h2 style={{ color: 'var(--azul-escuro)', fontWeight: '600' }}>
                                Lançamento de Notas
                            </h2>
                            {user && (
                                <p className="text-muted mb-0">
                                    Bem-vindo, {user.nome} | Lançamento de notas por curso
                                </p>
                            )}
                        </div>
                        <div className="badge p-3" style={{ backgroundColor: 'var(--azul-escuro)' }}>
                            <FaChartLine size={24} color="white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Mensagem de feedback */}
            {mensagem.texto && (
                <div className="row mb-3">
                    <div className="col-12">
                        <div className={`alert alert-${mensagem.tipo === "success" ? "success" : "danger"} text-center`}>
                            {mensagem.texto}
                        </div>
                    </div>
                </div>
            )}

            {/* Seleção de Curso */}
            <div className="row mb-4">
                <div className="col-md-6 ">
                    <label className="form-label fw-bold" style={{ color: 'var(--azul-escuro)' }}>
                        Adiciona cada numero correspondente a sua lista
                    </label>
                   <div className="">
                        <input type="text" value={numeroEstudante} placeholder="Inisira o numero de inscrição do candidato" onChange={(e)=> {setNumeroEstudante(e.target.value)}}/>
                        <input disabled={filtroEstudante&&filtroEstudante.length==0} type="number" value={notaEstudante} onChange={(e)=> setNotaEstudante(e.target.value)} placeholder="Insira nota do candidato"/>
                        <button disabled={filtroEstudante&&filtroEstudante.length==0} onClick={salvarNota}>Lancar nota</button>
                   </div>
                </div>
            </div>

            {/* Lista de Estudantes */}
            {filtroEstudante.length>0 && (
                <div className="row">
                    <div className="col-12">
                        <div className="d-flex align-items-center gap-2 mb-3">
                            <FaEdit size={20} color="var(--azul-escuro)" />
                            <h4 className="mb-0" style={{ color: 'var(--azul-escuro)' }}>
                                Lançar Notas dos Estudantes
                            </h4>
                        </div>

                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Carregando...</span>
                                </div>
                            </div>
                        ) : estudantes.length === 0 ? (
                            <div className="alert alert-info text-center">
                                Nenhum estudante encontrado para este curso.
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead style={{ backgroundColor: 'var(--azul-escuro)', color: 'white' }}>
                                        <tr>
                                            <th>#</th>
                                            <th>Nome do Estudante</th>
                                            <th>Nota Atual</th>
                                            <th>BI number</th>
                                            <th>Status</th>

                                        </tr>
                                    </thead>
                                    <tbody>

                                        {filtroEstudante.map((estudante, index) => {
                                            const status = getStatusNota(notas[estudante.id]);
                                            return (
                                                <tr key={estudante.id_estudanteInscricao}>
                                                    <td>{index + 1}</td>
                                                    <td className="fw-bold">{estudante.nome_estudanteInscricao}</td>
                                                    <td style={{ width: "150px" }}>
                                                        {modoEdicao[estudante.id] ? (
                                                            <input
                                                                type="number"
                                                                className="form-control"
                                                                step="0.1"
                                                                min="0"
                                                                max="10"
                                                                value={notas[estudante.id] || ""}
                                                                onChange={(e) => handleNotaChange(estudante.id, e.target.value)}
                                                                placeholder="0 a 10"
                                                                style={{ width: "100px" }}
                                                            />
                                                        ) : (
                                                            <span className="fw-bold">
                                                                {notas[estudante.id] ? parseFloat(notas[estudante.id]).toFixed(1) : "—"}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td>
                                                    estudante.bi_estudanteInscricao
                                                    </td>
                                                    <td>
                                                        <span className="badge" style={{ backgroundColor: status.cor }}>
                                                            {status.texto}
                                                        </span>
                                                    </td>

                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Instruções */}
            {filtroEstudante.length==0 && (
                <div className="row">
                    <div className="col-12">
                        <div className="alert alert-info text-center">
                            <FaCheckCircle size={20} className="me-2" />
                            Escreva o numero do estudante e ca em baixo confirmara se existe ou nao so depois disso adicione a nota e clique em lancar
                        </div>
                    </div>
                </div>
            )}
        </FuncionarioLayout>
    );
}

export default LancarNotasM;
