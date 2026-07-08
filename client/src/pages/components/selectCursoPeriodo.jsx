import { useState, useEffect, useRef } from "react";
import api from "../../service/api";
import Style from "../../pages/Cadastro.module.css";
import { IoMdSchool, IoMdTime } from "react-icons/io";

function SelectCursoPeriodo({ onChange, initialValues, disabled = false, showLabels = true }) {
    const [formData, setFormData] = useState({
        id_curso: initialValues?.id_curso || "",
        id_periodo: initialValues?.id_periodo || "",
        periodo: initialValues?.periodo || ""
    });
    
    const [cursos, setCursos] = useState([]);
    const [periodos, setPeriodos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingPeriodos, setLoadingPeriodos] = useState(false);
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

    // Buscar cursos com inscrições abertas
    useEffect(() => {
        const fetchCursos = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("token");
                
                const response = await api.get(`/cursosSelectInscricoesAbertas`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                
                if (response.data.sucesso) {
                    setCursos(response.data.dados || []);
                    
                    // Se tiver initialValues, buscar períodos
                    if (initialValues?.id_curso) {
                        await fetchPeriodos(initialValues.id_curso);
                    }
                } else {
                    setError(response.data.mensagem || "Erro ao carregar cursos");
                }
            } catch (error) {
                console.error('Erro ao buscar cursos:', error);
                if (error.response?.status === 401) {
                    setError("Sessão expirada. Faça login novamente.");
                } else {
                    setError("Erro ao carregar cursos");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchCursos();
    }, []);

    // Buscar períodos por curso
    const fetchPeriodos = async (idCurso) => {
        if (!idCurso) {
            setPeriodos([]);
            return;
        }

        try {
            setLoadingPeriodos(true);
            const token = localStorage.getItem("token");
            
            const response = await api.get(`/periodosPorCurso/${idCurso}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            if (response.data.sucesso) {
                setPeriodos(response.data.dados || []);
            } else {
                setPeriodos([]);
            }
        } catch (error) {
            console.error('Erro ao buscar períodos:', error);
            setPeriodos([]);
        } finally {
            setLoadingPeriodos(false);
        }
    };

    // Atualizar períodos quando o curso mudar
    useEffect(() => {
        if (formData.id_curso) {
            fetchPeriodos(formData.id_curso);
            if (!initialValues?.id_periodo) {
                setFormData(prev => ({
                    ...prev,
                    id_periodo: "",
                    periodo: ""
                }));
            }
        } else {
            setPeriodos([]);
            setFormData(prev => ({
                ...prev,
                id_periodo: "",
                periodo: ""
            }));
        }
    }, [formData.id_curso]);

    const handleChange = (field, value) => {
        setFormData(prev => {
            const newData = {
                ...prev,
                [field]: value
            };
            
            // Se for mudança de período, pegar o nome do período também
            if (field === 'id_periodo') {
                const periodoSelecionado = periodos.find(p => p.id_periodo === value);
                newData.periodo = periodoSelecionado?.periodo || '';
            }
            
            return newData;
        });
    };

    if (loading) {
        return (
            <>
                {showLabels && <label className="form-label fw-bold mb-2">Selecione Curso e Período</label>}
                <div className="d-flex mb-3">
                    <span className={`${Style.span} input-group-text`}><IoMdSchool /></span>
                    <select className={`${Style.inputHome} form-control`} disabled>
                        <option>Carregando cursos...</option>
                    </select>
                </div>
                <div className="d-flex mb-3">
                    <span className={`${Style.span} input-group-text`}><IoMdTime /></span>
                    <select className={`${Style.inputHome} form-control`} disabled>
                        <option>Carregando períodos...</option>
                    </select>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <div className="alert alert-danger">
                <strong>Erro:</strong> {error}
                {error.includes("Sessão expirada") && (
                    <button 
                        className="btn btn-sm btn-outline-danger ms-2"
                        onClick={() => window.location.href = "/"}
                    >
                        Fazer login
                    </button>
                )}
            </div>
        );
    }

    return (
        <>
            {showLabels && <label className="form-label fw-bold mb-2">Selecione Curso e Período</label>}
            
            <div className="d-flex mb-3">
                <span className={`${Style.span} input-group-text`}><IoMdSchool /></span>
                <select 
                    className={`${Style.inputHome} form-control`}
                    value={formData.id_curso}
                    onChange={(e) => handleChange('id_curso', e.target.value)}
                    disabled={disabled || loading}
                >
                    <option value="">Selecione o curso</option>
                    {cursos.map((item) => (
                        <option key={item.id_curso} value={item.id_curso}>
                            {item.curso}
                        </option>
                    ))}
                </select>
            </div>

            <div className="d-flex mb-3">
                <span className={`${Style.span} input-group-text`}><IoMdTime /></span>
                <select 
                    className={`${Style.inputHome} form-control`}
                    value={formData.id_periodo}
                    onChange={(e) => handleChange('id_periodo', e.target.value)}
                    disabled={disabled || !formData.id_curso || loadingPeriodos}
                >
                    <option value="">Selecione o período</option>
                    {loadingPeriodos ? (
                        <option value="" disabled>Carregando períodos...</option>
                    ) : (
                        periodos.map((item) => (
                            <option key={item.id_periodo} value={item.id_periodo}>
                                {item.periodo} {item.turma ? `- Turma: ${item.turma}` : ''}
                            </option>
                        ))
                    )}
                </select>
                {formData.id_curso && !loadingPeriodos && periodos.length === 0 && (
                    <small className="text-warning d-block mt-1">
                        Nenhum período disponível para este curso
                    </small>
                )}
            </div>
        </>
    );
}

export default SelectCursoPeriodo;