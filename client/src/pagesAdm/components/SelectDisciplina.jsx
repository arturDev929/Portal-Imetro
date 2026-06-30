import { useState, useEffect } from "react";
import api from "../../service/api";
import Style from "../../pages/Cadastro.module.css";
import { IoMdBook } from "react-icons/io";

function SelectDisciplina({ value, onChange, disabled }) {
    const [disciplinas, setDisciplinas] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/Disciplinas`);
                
                // O endpoint retorna dados com sucesso e dados
                if (response.data.sucesso && response.data.dados) {
                    setDisciplinas(response.data.dados);
                } else {
                    setDisciplinas([]);
                }
                setError(null);
            } catch (error) {
                console.error('Erro ao buscar dados:', error);
                setError("Erro ao carregar disciplinas");
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
        <div className="d-flex mb-3">
            <span className={`${Style.span} input-group-text`}><IoMdBook /></span>
            <select 
                className={`${Style.inputHome} form-control`} 
                id="id_disciplina" 
                name="id_disciplina"
                value={value || ''}
                onChange={handleChange}
                disabled={disabled || loading}
                required
            >
                <option value="">Selecione uma disciplina</option>
                
                {loading && (
                    <option value="" disabled>Carregando disciplinas...</option>
                )}
                
                {error && (
                    <option value="" disabled>{error}</option>
                )}
                
                {!loading && !error && disciplinas.length > 0 && 
                    disciplinas.map((disciplina) => (
                        <option key={disciplina.id_disciplina} value={disciplina.id_disciplina}>
                            {disciplina.disciplina}
                        </option>
                    ))
                }
                
                {!loading && !error && disciplinas.length === 0 && (
                    <option value="" disabled>Nenhuma disciplina disponível</option>
                )}
            </select>
        </div>
    );
}

export default SelectDisciplina;