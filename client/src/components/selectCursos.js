import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

function SelectCurso({onChange}){
    const [cursos, setCursos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = () => {
            axios.get(`${API_URL}/get/Cursos`)
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
        <div className="mb-1">
            <select className="form-control form-control-sm" id="idCursos" name="idCursos" onChange={onChange}>
                <option value="">Selecione um curso</option>
                {loading && (
                    <option value="" disabled>Carregando cursos...</option>
                )}
                {error && (
                    <option value="" disabled>{error}</option>
                )}
                {!loading && !error && cursos.map((curso) => (
                    <option key={curso.idcurso} value={curso.idcurso}>
                        {curso.curso}
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