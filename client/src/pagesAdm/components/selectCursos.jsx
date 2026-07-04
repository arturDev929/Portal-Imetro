import { useState, useEffect } from "react";
import api from "../../service/api";
import Style from "../../pages/Cadastro.module.css";
import { IoMdFolder } from "react-icons/io";

function SelectCurso({ value, onChange, disabled }) {  
    const [cursos, setCursos] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/Cursos`);
                setCursos(response.data);
                setError(null);
            } catch (error) {
                console.error('Erro ao buscar dados:', error);
                setError("Erro ao carregar cursos");
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, []);

    const handleChange = (e) => {
        if (onChange) {
            onChange(e.target.value);
        }
    }; 

    return (
        <div className="d-flex">
            <span className={`${Style.span} input-group-text`}><IoMdFolder /></span>
            <select 
                className={`${Style.inputHome} form-control`} 
                id="id_curso" 
                name="id_curso"
                value={value || ''}
                onChange={handleChange}
                disabled={disabled || loading}
                required
            >
                <option value="">Selecione um curso</option>
                
                {loading && (
                    <option value="" disabled>Carregando cursos...</option>
                )}
                
                {error && (
                    <option value="" disabled>{error}</option>
                )}
                
                {!loading && !error && cursos.length > 0 && 
                    cursos.map((curso) => (
                        <option key={curso.id_curso} value={curso.id_curso}>
                            {curso.curso}
                        </option>
                    ))
                }
                
                {!loading && !error && cursos.length === 0 && (
                    <option value="" disabled>Nenhum curso disponível</option>
                )}
            </select>
        </div>
    );
}

export default SelectCurso;