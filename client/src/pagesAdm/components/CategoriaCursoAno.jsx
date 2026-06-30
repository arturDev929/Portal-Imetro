import { useState, useEffect, useRef } from "react";
import api from "../../service/api";
import Style from "../../pages/Cadastro.module.css";
import { IoMdFolder, IoMdSchool, IoMdCalendar } from "react-icons/io";

function CategoriaCursoAno({ onChange, initialValues, disabled = false }) {
    const [formData, setFormData] = useState({
        id_categoria: initialValues?.id_categoria || "",
        id_curso: initialValues?.id_curso || "",
        id_anocurricular: initialValues?.id_anocurricular || ""
    });
    
    const [categorias, setCategorias] = useState([]);
    const [cursos, setCursos] = useState([]);
    const [anos, setAnos] = useState([]);
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

    // Atualizar cursos quando a categoria mudar
    useEffect(() => {
        if (formData.id_categoria) {
            const categoriaSelecionada = categorias.find(
                cat => cat.id_categoria === formData.id_categoria
            );
            setCursos(categoriaSelecionada?.cursos || []);
            // Resetar curso e ano quando mudar categoria (se não for edição)
            if (!initialValues?.id_curso) {
                setFormData(prev => ({
                    ...prev,
                    id_curso: "",
                    id_anocurricular: ""
                }));
            }
        } else {
            setCursos([]);
            setAnos([]);
        }
    }, [formData.id_categoria, categorias, initialValues]);

    // Atualizar anos quando o curso mudar
    useEffect(() => {
        if (formData.id_curso) {
            const categoriaSelecionada = categorias.find(
                cat => cat.id_categoria === formData.id_categoria
            );
            const cursoSelecionado = categoriaSelecionada?.cursos.find(
                c => c.id_curso === formData.id_curso
            );
            setAnos(cursoSelecionado?.anos_curriculares || []);
            // Resetar ano quando mudar curso (se não for edição)
            if (!initialValues?.id_anocurricular) {
                setFormData(prev => ({
                    ...prev,
                    id_anocurricular: ""
                }));
            }
        } else {
            setAnos([]);
        }
    }, [formData.id_curso, formData.id_categoria, categorias, initialValues]);

    const handleChange = (field, value) => {
        setFormData(prev => {
            const newData = {
                ...prev,
                [field]: value,
                ...(field === 'id_categoria' && { id_curso: "", id_anocurricular: "" }),
                ...(field === 'id_curso' && { id_anocurricular: "" })
            };
            return newData;
        });
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/CategoriaCursosAno`);
                
                console.log('Resposta do backend:', response.data);
                
                // Verificar se a resposta foi bem sucedida
                if (response.data.sucesso) {
                    const dadosAgrupados = response.data.dados || [];
                    setCategorias(dadosAgrupados);
                    
                    // Se tiver initialValues, selecionar os itens correspondentes
                    if (initialValues?.id_categoria) {
                        const categoriaSelecionada = dadosAgrupados.find(
                            cat => cat.id_categoria === initialValues.id_categoria
                        );
                        if (categoriaSelecionada) {
                            setCursos(categoriaSelecionada.cursos || []);
                            
                            if (initialValues?.id_curso) {
                                const cursoSelecionado = categoriaSelecionada.cursos.find(
                                    c => c.id_curso === initialValues.id_curso
                                );
                                if (cursoSelecionado) {
                                    setAnos(cursoSelecionado.anos_curriculares || []);
                                }
                            }
                        }
                    }
                } else {
                    setError(response.data.mensagem || "Erro ao carregar dados");
                }
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
            <>
                <div className="d-flex mb-3">
                    <span className={`${Style.span} input-group-text`}><IoMdFolder /></span>
                    <select className={`${Style.inputHome} form-control`} disabled>
                        <option>Carregando categorias...</option>
                    </select>
                </div>
                <div className="d-flex mb-3">
                    <span className={`${Style.span} input-group-text`}><IoMdSchool /></span>
                    <select className={`${Style.inputHome} form-control`} disabled>
                        <option>Carregando cursos...</option>
                    </select>
                </div>
                <div className="d-flex mb-3">
                    <span className={`${Style.span} input-group-text`}><IoMdCalendar /></span>
                    <select className={`${Style.inputHome} form-control`} disabled>
                        <option>Carregando anos...</option>
                    </select>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <div className="alert alert-danger">
                <strong>Erro:</strong> {error}
            </div>
        );
    }

    return (
        <>
            <div className="d-flex mb-3">
                <span className={`${Style.span} input-group-text`}><IoMdFolder /></span>
                <select 
                    className={`${Style.inputHome} form-control`}
                    value={formData.id_categoria}
                    onChange={(e) => handleChange('id_categoria', e.target.value)}
                    disabled={disabled || loading}
                >
                    <option value="">Selecione a área de departamento</option>
                    {categorias.map((item) => (
                        <option key={item.id_categoria} value={item.id_categoria}>
                            {item.categoria}
                        </option>
                    ))}
                </select>
            </div>

            <div className="d-flex mb-3">
                <span className={`${Style.span} input-group-text`}><IoMdSchool /></span>
                <select 
                    className={`${Style.inputHome} form-control`}
                    value={formData.id_curso}
                    onChange={(e) => handleChange('id_curso', e.target.value)}
                    disabled={disabled || !formData.id_categoria || loading}
                >
                    <option value="">Selecione a licenciatura</option>
                    {cursos.map((item) => (
                        <option key={item.id_curso} value={item.id_curso}>
                            {item.curso}
                        </option>
                    ))}
                </select>
            </div>

            <div className="d-flex mb-3">
                <span className={`${Style.span} input-group-text`}><IoMdCalendar /></span>
                <select 
                    className={`${Style.inputHome} form-control`}
                    value={formData.id_anocurricular}
                    onChange={(e) => handleChange('id_anocurricular', e.target.value)}
                    disabled={disabled || !formData.id_curso || loading}
                >
                    <option value="">Selecione o ano curricular</option>
                    {anos.map((item) => (
                        <option key={item.id_anocurricular} value={item.id_anocurricular}>
                            {item.anocurricular}º Ano
                        </option>
                    ))}
                </select>
            </div>
        </>
    );
}

export default CategoriaCursoAno;