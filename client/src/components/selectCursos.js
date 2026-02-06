import { useState, useEffect } from "react";
import Axios from "axios";

function SelectCurso({onChange}){
    const [cursos, setCursos] = useState([]); // Mudei o nome para "cursos" para ser mais descritivo
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = () => {
            Axios.get('http://localhost:8080/get/Cursos')
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
        
        // Chamar imediatamente ao montar
        fetchData();
        
        // Configurar intervalo para atualizar a cada 2 segundos
        const interval = setInterval(fetchData, 2000);
        
        // Função de limpeza
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