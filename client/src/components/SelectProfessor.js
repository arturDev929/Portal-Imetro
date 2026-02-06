import { useState, useEffect } from "react";
import Axios from "axios";

function SelectCurso({onChange}){
    const [professor, setProfessor] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = () => {
            Axios.get('http://localhost:8080/get/Professores')
                .then((response) => {
                    setProfessor(response.data);
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
            <select className="form-control form-control-sm" id="idprofessor" name="idprofessor" onChange={onChange}>
                <option value="">Selecione Professor</option>
                {loading && (
                    <option value="" disabled>Carregando professor...</option>
                )}
                {error && (
                    <option value="" disabled>{error}</option>
                )}
                {!loading && !error && professor.map((professor) => (
                    <option key={professor.idprofessor} value={professor.idprofessor}>
                        {professor.nomeprofessor}
                    </option>
                ))}
                {!loading && !error && professor.length === 0 && (
                    <option value="" disabled>Nenhum professor disponível</option>
                )}
            </select>
        </div>
    )
}

export default SelectCurso;