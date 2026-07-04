import { useState, useEffect, useCallback } from "react";
import api from "../../service/api";
import Style from "./DepartamentosEdit.module.css";
import { Fa0 } from "react-icons/fa6";
import { showErrorToast } from "../../components/global/CustomToast";

function SelectTurmas({ onChange, value, disabled = false, placeholder = "Selecione uma turma..." }) {
    const [turmas, setTurmas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedValue, setSelectedValue] = useState(value || "");

    // Buscar turmas da API
    const fetchTurmas = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/turmasSimples');
            
            if (response.data.sucesso && Array.isArray(response.data.dados)) {
                setTurmas(response.data.dados);
            } else {
                setTurmas([]);
            }
        } catch (error) {
            console.error("Erro ao buscar turmas:", error);
            showErrorToast("Erro", "Não foi possível carregar a lista de turmas");
            setTurmas([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTurmas();
    }, [fetchTurmas]);

    // Sincronizar com o valor externo
    useEffect(() => {
        if (value !== undefined && value !== selectedValue) {
            setSelectedValue(value);
        }
    }, [value, selectedValue]);

    const handleChange = (e) => {
        const newValue = e.target.value;
        setSelectedValue(newValue);
        if (onChange) {
            onChange(newValue);
        }
    };

    // Formatar a exibição da turma
    const formatTurmaDisplay = (turma) => {
        if (!turma) return '';
        
        let display = turma.turma || '';
        if (turma.periodo) {
            display += ` (${turma.periodo})`;
        }
        return display;
    };

    // Agrupar turmas por nome para evitar duplicatas
    const turmasUnicas = [];
    const turmasMap = new Map();
    
    turmas.forEach(turma => {
        const key = turma.id_turma;
        if (!turmasMap.has(key)) {
            turmasMap.set(key, {
                id_turma: turma.id_turma,
                turma: turma.turma,
                periodos: []
            });
        }
        turmasMap.get(key).periodos.push({
            id_periodo: turma.id_periodo,
            periodo: turma.periodo
        });
    });

    const turmasAgrupadas = Array.from(turmasMap.values());

    return (
        <div className={`d-flex mb-3 ${Style.selectGroup}`}>
            <span className={`${Style.span} input-group-text`}>
                <Fa0 />
            </span>
            <select
                className={`${Style.inputHome} form-control`}
                value={selectedValue}
                onChange={handleChange}
                disabled={disabled || loading}
                required
            >
                <option value="">{loading ? 'Carregando turmas...' : placeholder}</option>
                
                {turmasAgrupadas.length === 0 && !loading && (
                    <option value="" disabled>Nenhuma turma encontrada</option>
                )}
                
                {turmasAgrupadas.map((turma) => (
                    <optgroup key={turma.id_turma} label={`📚 ${turma.turma}`}>
                        {turma.periodos.map((periodo) => (
                            <option 
                                key={periodo.id_periodo} 
                                value={periodo.id_periodo}
                            >
                                {formatTurmaDisplay({ turma: turma.turma, periodo: periodo.periodo })}
                            </option>
                        ))}
                    </optgroup>
                ))}
            </select>
            {loading && (
                <div className="position-absolute end-0 top-50 translate-middle-y me-3">
                    <span className="spinner-border spinner-border-sm text-primary" role="status">
                        <span className="visually-hidden">Carregando...</span>
                    </span>
                </div>
            )}
        </div>
    );
}

export default SelectTurmas;