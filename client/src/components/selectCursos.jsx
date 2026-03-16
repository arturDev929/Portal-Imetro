import { useState, useEffect } from "react";
import api from "../service/api";
import Style from "../pages/Cadastro.module.css";
import { IoMdFolder } from "react-icons/io";

function SelectCategoriaCurso({ value, onChange, disabled }) {  
    const [categorias, setCategorias] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/get/Cursos`);
                setCategorias(response.data);
                setError(null);
            } catch (error) {
                console.error('Erro ao buscar dados:', error);
                setError("Erro ao carregar categorias");
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
                id="idcategoriacurso" 
                name="idcategoriacurso"
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
                
                {!loading && !error && categorias.length > 0 && 
                    categorias.map((categoria) => (
                        <option key={categoria.idcurso} value={categoria.idcurso}>
                            {categoria.curso}
                        </option>
                    ))
                }
                
                {!loading && !error && categorias.length === 0 && (
                    <option value="" disabled>Nenhuma categoria disponível</option>
                )}
            </select>
        </div>
    );
}

export default SelectCategoriaCurso;