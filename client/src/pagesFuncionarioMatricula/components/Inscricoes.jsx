import api from "../../service/api";
import { useState, useEffect } from "react";
import Style from "../../components/DepartamentosEdit.module.css"
import {FaInfoCircle} from "react-icons/fa"
import { GrStatusGood } from "react-icons/gr";
import { VscError } from "react-icons/vsc";
function Inscricoes(){
    const [EstudantesInscritos, setEstudantesInscritos] = useState([]);
    useEffect (()=>{
        const fetchdados = () =>{
            api.get('/get/EstudantesInscritos').then((response)=>{
                setEstudantesInscritos(response.data)
            })
        }
        fetchdados()
        const interval = setInterval(fetchdados,30000)
        return () =>{
            clearInterval(interval)
        }
    },[])
    return (
        <div className="table-responsive">
            <table className="table table-hover table-striped border">
                <thead style={{backgroundColor:'var(--azul-escuro)',color:'var(--branco)'}}>
                    <tr>
                        <th className="col-1">Foto</th>
                        <th className="col-3">Nome</th>
                        <th className="col-2">Código Inscrição</th>
                        <th className="col-2 text-center">Curso</th>
                        <th className="col-1 text-center">Período</th>
                        <th className="col-1 text-center">Info</th>
                        <th className="col-1 text-center">Aceitar</th>
                        <th className="col-1 text-center">Recusar</th>
                    </tr>
                </thead>
                <tbody>
                    {EstudantesInscritos && EstudantesInscritos.length > 0 ? (
                        EstudantesInscritos.map((estudante)=>(
                            <tr key={estudante.id_estudanteInscricao}>
                                <td>
                                    <img 
                                        src={estudante.fotoUrl} 
                                        alt={estudante.nome_estudanteInscricao}
                                        className="img-fluid rounded-circle"
                                        style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                    />
                                </td>
                                <td>{estudante.nome_estudanteInscricao}</td>
                                <td>{estudante.numeroInscricao_estudanteInscricao}</td>
                                <td>{estudante.curso}</td>
                                <td className="text-center">{estudante.periodo_estudanteInscricao}</td>
                                <td  className="text-center">
                                    <button  className={`btn btn-sm ${Style.btnOutros}`}>
                                        <FaInfoCircle />
                                    </button>
                                </td>
                                <td className="text-center">
                                    <button  className={`btn btn-sm ${Style.btnAdd}`}>
                                        <GrStatusGood />
                                    </button>
                                </td>
                                <td className="text-center">
                                    <button  className={`btn btn-sm ${Style.btnDeletar}`}>
                                        <VscError />
                                    </button>
                                </td>
                            </tr>
                        ))
                    ):(
                        <tr>
                            <td>Nenhum dados</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}
export default Inscricoes