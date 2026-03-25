import { useState, useEffect, useRef } from "react";
import api from "../../service/api";
import Style from "../../pages/Cadastro.module.css";
import { IoMdFolder, IoMdSchool, IoMdCalendar } from "react-icons/io";

function CategoriaCursoAno({ onChange }) {
    const [formData, setFormData] = useState({
        idcategoriacurso: "",
        idcurso: "",
        idanocurricular: ""
    });
    
    const [allData, setAllData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const onChangeRef = useRef(onChange);
    
    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    useEffect(() => {
        if (onChangeRef.current) {
            onChangeRef.current(formData);
        }
    }, [formData]);

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
            
            return newData;
        });
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/get/CategoriaCursosAno`);
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
    }, []);

    if (loading) {
        return (
            <div className="d-flex mb-3">
                <span className={`${Style.span} input-group-text`}><IoMdFolder /></span>
                <select className={`${Style.inputHome} form-control`} disabled>
                    <option>Carregando dados...</option>
                </select>
            </div>
        );
    }

    if (error) {
        return (
            <div className="d-flex mb-3">
                <span className={`${Style.span} input-group-text`}><IoMdFolder /></span>
                <select className={`${Style.inputHome} form-control`} disabled>
                    <option>{error}</option>
                </select>
            </div>
        );
    }

    return (
        <>
            <div className="d-flex mb-3">
                <span className={`${Style.span} input-group-text`}><IoMdFolder /></span>
                <select 
                    className={`${Style.inputHome} form-control`}
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

            <div className="d-flex mb-3">
                <span className={`${Style.span} input-group-text`}><IoMdSchool /></span>
                <select 
                    className={`${Style.inputHome} form-control`}
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

            <div className="d-flex mb-3">
                <span className={`${Style.span} input-group-text`}><IoMdCalendar /></span>
                <select 
                    className={`${Style.inputHome} form-control`}
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
        </>
    );
}

export default CategoriaCursoAno;