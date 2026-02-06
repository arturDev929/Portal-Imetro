import { useState, useEffect } from "react";
import Axios from "axios";

function SelectCurso({onChange}){
    const [cursos, setCursos] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = () => {
            Axios.get('http://localhost:8080/get/Disciplinas')
                .then((response) => {
                    setCursos(response.data);
                    setError(null);
                })
                .catch((error) => {
                    console.error('Erro ao buscar dados:', error);
                    setError("Erro ao carregar cursos");
                })
                .finally(() => {
                    setLoading(false);
                });
        };
        
        fetchData();
        
        const interval = setInterval(fetchData, 2000);

        return () => {
            clearInterval(interval);
        };
    }, []);

    return(
        <div className="col-md-12 mb-2">
            <select className="form-control form-control-sm" id="idCursos" name="idCursos" onChange={onChange}>
                <option value="">Selecione uma disciplina</option>
                {loading && (
                    <option value="" disabled>Carregando disciplina...</option>
                )}
                {error && (
                    <option value="" disabled>{error}</option>
                )}
                {!loading && !error && cursos.map((curso) => (
                    <option key={curso.iddisciplina} value={curso.iddisciplina}>
                        {curso.disciplina}
                    </option>
                ))}
                {!loading && !error && cursos.length === 0 && (
                    <option value="" disabled>Nenhum curso disponível</option>
                )}
            </select>
        </div>
    )
}

export default SelectCurso;