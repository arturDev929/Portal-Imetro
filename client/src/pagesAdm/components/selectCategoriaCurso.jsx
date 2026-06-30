import { useState, useEffect } from "react";
import api from "../../service/api";
import Style from "../../pages/Cadastro.module.css";
import { IoMdFolder } from "react-icons/io";

function SelectCategoriaCurso({ value, onChange, disabled }) {  
    const [categorias, setCategorias] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/CategoriaCursosAno`);
                
                // O endpoint retorna dados agrupados por categoria com cursos e anos
                if (response.data.sucesso && response.data.dados) {
                    // Extrair todos os cursos únicos de todas as categorias
                    const todosCursos = [];
                    response.data.dados.forEach(categoria => {
                        if (categoria.cursos && categoria.cursos.length > 0) {
                            categoria.cursos.forEach(curso => {
                                // Evitar duplicatas
                                if (!todosCursos.find(c => c.id_curso === curso.id_curso)) {
                                    todosCursos.push({
                                        id_curso: curso.id_curso,
                                        curso: curso.curso,
                                        id_categoria: categoria.id_categoria,
                                        categoria: categoria.categoria
                                    });
                                }
                            });
                        }
                    });
                    setCategorias(todosCursos);
                } else {
                    setCategorias([]);
                }
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
                
                {!loading && !error && categorias.length > 0 && 
                    categorias.map((curso) => (
                        <option key={curso.id_curso} value={curso.id_curso}>
                            {curso.curso}
                        </option>
                    ))
                }
                
                {!loading && !error && categorias.length === 0 && (
                    <option value="" disabled>Nenhum curso disponível</option>
                )}
            </select>
        </div>
    );
}

export default SelectCategoriaCurso;