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
                
                let dados = [];
                
                if (Array.isArray(response.data)) {
                    dados = response.data;
                } else if (response.data && typeof response.data === 'object') {
                    if (response.data.dados && Array.isArray(response.data.dados)) {
                        dados = response.data.dados;
                    } else if (response.data.data && Array.isArray(response.data.data)) {
                        dados = response.data.data;
                    } else if (response.data.result && Array.isArray(response.data.result)) {
                        dados = response.data.result;
                    } else {
                        const keys = Object.keys(response.data);
                        if (keys.length > 0 && !isNaN(keys[0])) {
                            dados = Object.values(response.data);
                        } else {
                            dados = [];
                        }
                    }
                }
                
                if (dados && dados.length > 0) {
                    setDisciplinas(dados);
                    setError(null);
                } else {
                    setDisciplinas([]);
                    setError('Nenhuma disciplina disponível');
                }
            } catch (error) {
                console.error('Erro ao buscar disciplinas:', error);
                setError('Erro ao carregar disciplinas');
                setDisciplinas([]);
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
                        <option 
                            key={disciplina.id_disciplina || disciplina.id || Math.random()} 
                            value={disciplina.id_disciplina || disciplina.id}
                        >
                            {disciplina.disciplina || disciplina.nome || JSON.stringify(disciplina)}
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