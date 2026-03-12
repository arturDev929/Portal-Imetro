import { useState, useEffect } from "react";
import axios from "axios";
import Style from "../pages/Cadastro.module.css";
import { IoMdSchool } from "react-icons/io";

const API_URL = "http://localhost:8080";

function SelectCurso({ value, onChange, disabled }) {
    const [cursos, setCursos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCursos = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${API_URL}/get/Cursos`);
                
                const cursosData = Array.isArray(response.data) ? response.data : [];
                setCursos(cursosData);
                setError(null);
            } catch (error) {
                console.error('Erro ao buscar cursos:', error);
                setError("Erro ao carregar cursos");
                setCursos([]);
            } finally {
                setLoading(false);
            }
        };

        fetchCursos();
    }, []);

    const handleChange = (e) => {
        if (onChange) {
            onChange(e.target.value);
        }
    };

    return (
        <div className="d-flex mb-3">
            <span className={`${Style.span} input-group-text`}><IoMdSchool /></span>
            <select 
                className={`${Style.inputHome} form-control`} 
                id="idcurso" 
                name="idcurso"
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
                        <option key={curso.idcurso} value={curso.idcurso}>
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