import { useState, useEffect } from "react";
import Axios from "axios";

function SelectCategoriaCurso({onChange, value = ""}) {  
    const [categorias, setCategorias] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = () => {
            Axios.get('http://localhost:8080/get/categoriaCurso')
            .then((response) => {
                setCategorias(response.data);
                setError(null);
            })
            .catch((error) => {
                console.error('Erro ao buscar dados:', error);
                setError("Erro ao carregar categorias");
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
        <div className="col-12 mb-2">
            <select 
                className="form-control form-control-sm" 
                id="idcategoriacurso" 
                name="idcategoriacurso" 
                value={value} 
                onChange={onChange}
                disabled={loading}
            >
                <option value="">Selecione uma categoria</option>  
                {loading && (
                    <option value="" disabled>Carregando categorias...</option>
                )}
                {error && (
                    <option value="" disabled>{error}</option>
                )}
                {!loading && !error && categorias.map((categoria) => (
                    <option key={categoria.idcategoriacurso} value={categoria.idcategoriacurso}>
                        {categoria.categoriacurso}
                    </option>
                ))}
                {!loading && !error && categorias.length === 0 && (
                    <option value="" disabled>Nenhuma categoria disponível</option>
                )}
            </select>
        </div>
    )
}

export default SelectCategoriaCurso;
