import { useState, useEffect } from "react";
import Axios from "axios";

function CategoriaCursoAno({ onChange }) {
    const [formData, setFormData] = useState({
        idcategoriacurso: "",
        idcurso: "",
        idanocurricular: ""
    });
    
    const [allData, setAllData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const uniqueCategorias = Array.from(
        new Map(allData.map(item => [item.idcategoriacurso, item])).values()
    );

    const uniqueCursos = Array.from(
        new Map(
            allData
                .filter(item => formData.idcategoriacurso === "" || item.idcategoriacurso == formData.idcategoriacurso)
                .map(item => [item.idcurso, item])
        ).values()
    );

    const uniqueAnos = Array.from(
        new Map(
            allData
                .filter(item => formData.idcurso === "" || item.idcurso == formData.idcurso)
                .map(item => [item.idanocurricular, item])
        ).values()
    );

    const handleChange = (field, value) => {
        setFormData(prev => {
            const newData = {
                ...prev,
                [field]: value,
                ...(field === 'idcategoriacurso' && { idcurso: "", idanocurricular: "" }),
                ...(field === 'idcurso' && { idanocurricular: "" })
            };
            
            if (onChange) onChange(newData);
            return newData;
        });
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await Axios.get('http://localhost:8080/get/CategoriaCursosAno');
                setAllData(response.data);
                setError(null);
            } catch (error) {
                console.error('Erro ao buscar dados:', error);
                setError("Erro ao carregar dados");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 5000); // Atualiza a cada 5 segundos
        return () => clearInterval(interval);
    }, []);

    return (
        <div>
            {loading && <div className="alert alert-info">Carregando dados...</div>}
            {error && <div className="alert alert-danger">{error}</div>}
            
            {!loading && !error && (
                <div className="row">
                    {/* CATEGORIA */}
                    <div className="col-md-12 mb-3">
                        <select 
                            className="form-control form-control-sm"
                            value={formData.idcategoriacurso}
                            onChange={(e) => handleChange('idcategoriacurso', e.target.value)}
                        >
                            <option value="">Selecione a área de departamento</option>
                            {uniqueCategorias.map((item) => (
                                <option key={item.idcategoriacurso} value={item.idcategoriacurso}>
                                    {item.categoriacurso}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* CURSO */}
                    <div className="col-md-12 mb-3">
                        <select 
                            className="form-control form-control-sm"
                            value={formData.idcurso}
                            onChange={(e) => handleChange('idcurso', e.target.value)}
                            disabled={!formData.idcategoriacurso}
                        >
                            <option value="">Selecione a licenciatura</option>
                            {uniqueCursos.map((item) => (
                                <option key={item.idcurso} value={item.idcurso}>
                                    {item.curso}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* ANO */}
                    <div className="col-md-12 mb-3">
                        <select 
                            className="form-control form-control-sm"
                            value={formData.idanocurricular}
                            onChange={(e) => handleChange('idanocurricular', e.target.value)}
                            disabled={!formData.idcurso}
                        >
                            <option value="">Selecione o ano curricular</option>
                            {uniqueAnos.map((item) => (
                                <option key={item.idanocurricular} value={item.idanocurricular}>
                                    {item.anocurricular}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CategoriaCursoAno;