import { useState, useEffect } from "react";
import api from "../../service/api";
import Style from "../../pages/Cadastro.module.css";
import { IoMdPerson } from "react-icons/io";

function SelectProfessor({ value, onChange, disabled }) {
    const [professores, setProfessores] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/Professores`);
                
                // O endpoint deve retornar dados com sucesso e dados
                if (response.data.sucesso && response.data.dados) {
                    setProfessores(response.data.dados);
                } else {
                    setProfessores([]);
                }
                setError(null);
            } catch (error) {
                console.error('Erro ao buscar dados:', error);
                setError("Erro ao carregar professores");
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
            <span className={`${Style.span} input-group-text`}><IoMdPerson /></span>
            <select 
                className={`${Style.inputHome} form-control`} 
                id="id_professor" 
                name="id_professor"
                value={value || ''}
                onChange={handleChange}
                disabled={disabled || loading}
                required
            >
                <option value="">Selecione um professor</option>
                
                {loading && (
                    <option value="" disabled>Carregando professores...</option>
                )}
                
                {error && (
                    <option value="" disabled>{error}</option>
                )}
                
                {!loading && !error && professores.length > 0 && 
                    professores.map((professor) => (
                        <option key={professor.id_professor} value={professor.id_professor}>
                            {professor.nome}
                        </option>
                    ))
                }
                
                {!loading && !error && professores.length === 0 && (
                    <option value="" disabled>Nenhum professor disponível</option>
                )}
            </select>
        </div>
    );
}

export default SelectProfessor;