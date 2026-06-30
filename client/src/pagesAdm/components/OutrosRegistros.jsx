// OutrosRegistros.jsx
import { useState, useEffect } from "react";
import "react-toastify/dist/ReactToastify.css";
import api from "../../service/api";
import SelectCurso from "./selectCursos";
import CategoriaCursoAno from "./CategoriaCursoAno";
import SelectDisciplina from "./SelectDisciplina";
import { IoMdAddCircleOutline } from "react-icons/io";
import { showSuccessToast, showErrorToast } from "../../components/global/CustomToast";
import Style from "./DepartamentosEdit.module.css";
import style from "../../pages/Cadastro.module.css";
import { Fa0 } from "react-icons/fa6";

function OutrosRegistros() {
    // Estados para Ano Curricular
    const [anoCurricular, setAnoCurricular] = useState("");
    const [idCurso, setIdCurso] = useState("");
    
    // Estados para Disciplina ao Curso
    const [formDataDisciplinaCurso, setFormDataDisciplinaCurso] = useState({
        id_categoria: "",
        id_curso: "",
        id_anocurricular: "",
        id_disciplina: ""
    });
    const [semestre, setSemestre] = useState("");
    
    // Estados para Turmas
    const [turma, setTurma] = useState("");
    const [anoletivo, setAnoLetivo] = useState("");
    const [periodo, setPeriodo] = useState("");
    
    // Estado global de loading
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);

    // Buscar usuário logado
    useEffect(() => {
        const usuarioSalvo = localStorage.getItem("usuarioLogado");
        if (usuarioSalvo) {
            try {
                setUser(JSON.parse(usuarioSalvo));
            } catch (error) {
                console.error("Erro ao parsear usuário:", error);
                setUser(null);
            }
        }
    }, []);

    // ==================== HANDLERS ====================
    
    // Handler para Ano Curricular
    const handleSubmitAnoCurricular = async (e) => {
        e.preventDefault();
        
        if (!anoCurricular.trim()) {
            showErrorToast('Campo vazio', 'Por favor, insira o ano curricular');
            return;
        }

        if (!idCurso) {
            showErrorToast('Licenciatura não selecionada', 'Selecione uma Licenciatura primeiro');
            return;
        }

        if (!user || !user.id) {
            showErrorToast('Usuário não autenticado', 'Faça login novamente');
            return;
        }

        setLoading(true);

        try {
            const response = await api.post(`/registrarAnoCurricular`, {
                ano: anoCurricular,
                id_curso: idCurso
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.sucesso) {
                showSuccessToast(
                    response.data.titulo || "Sucesso",
                    response.data.mensagem || "Ano curricular registrado com sucesso"
                );
                setAnoCurricular("");
                // Resetar seleção de ano no componente CategoriaCursoAno
                setFormDataDisciplinaCurso(prev => ({
                    ...prev,
                    id_anocurricular: ""
                }));
            } else {
                showErrorToast(response.data.titulo || "Erro", response.data.mensagem);
            }
        } catch (error) {
            console.error('Erro ao registrar Ano Curricular:', error);
            
            if (error.response && error.response.data) {
                showErrorToast(error.response.data.titulo || "Erro", error.response.data.mensagem);
            } else {
                showErrorToast('Erro de conexão', 'Não foi possível conectar ao servidor');
            }
        } finally {
            setLoading(false);
        }
    };

    // Handler para Disciplina ao Curso
    const handleFormDataChange = (newData) => {
        setFormDataDisciplinaCurso(prev => ({
            ...prev,
            ...newData
        }));
    };

    const handleSubmitDisciplinaCurso = async (e) => {
        e.preventDefault();
        
        if (!formDataDisciplinaCurso.id_disciplina) {
            showErrorToast('Disciplina não selecionada', 'Selecione uma disciplina primeiro');
            return;
        }

        if (!formDataDisciplinaCurso.id_anocurricular) {
            showErrorToast('Ano Curricular não selecionado', 'Selecione um ano curricular primeiro');
            return;
        }

        if (!formDataDisciplinaCurso.id_curso) {
            showErrorToast('Curso não selecionado', 'Selecione um curso primeiro');
            return;
        }

        if (!formDataDisciplinaCurso.id_categoria) {
            showErrorToast('Categoria não selecionada', 'Selecione uma categoria primeiro');
            return;
        }

        if (!semestre.trim()) {
            showErrorToast('Semestre vazio', 'Por favor, insira o semestre');
            return;
        }

        if (!user || !user.id) {
            showErrorToast('Usuário não autenticado', 'Faça login novamente');
            return;
        }

        setLoading(true);

        try {
            const response = await api.post(`/registrarDisciplinaCurso`, {
                id_disciplina: formDataDisciplinaCurso.id_disciplina,
                id_anocurricular: formDataDisciplinaCurso.id_anocurricular,
                id_curso: formDataDisciplinaCurso.id_curso,
                id_categoria: formDataDisciplinaCurso.id_categoria,
                semestre: parseInt(semestre)
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.sucesso) {
                showSuccessToast(
                    response.data.titulo || "Sucesso",
                    response.data.mensagem || "Disciplina atribuída ao curso com sucesso"
                );
                setSemestre("");
                // Resetar disciplina selecionada
                setFormDataDisciplinaCurso(prev => ({
                    ...prev,
                    id_disciplina: ""
                }));
            } else {
                showErrorToast(response.data.titulo || "Erro", response.data.mensagem);
            }
        } catch (error) {
            console.error('Erro ao atribuir disciplina ao curso:', error);
            
            if (error.response && error.response.data) {
                showErrorToast(error.response.data.titulo || "Erro", error.response.data.mensagem);
            } else {
                showErrorToast('Erro de conexão', 'Não foi possível conectar ao servidor');
            }
        } finally {
            setLoading(false);
        }
    };

    // Handler para Turmas
    const handleSubmitPeriodo = async (e) => {
        e.preventDefault();
        
        if (!turma.trim()) {
            showErrorToast('Turma vazia', 'Por favor, insira o nome da turma');
            return;
        }

        if (!periodo) {
            showErrorToast('Período não selecionado', 'Selecione um período');
            return;
        }

        if (!formDataDisciplinaCurso.id_anocurricular) {
            showErrorToast('Ano Curricular não selecionado', 'Selecione um ano curricular primeiro');
            return;
        }

        if (!formDataDisciplinaCurso.id_curso) {
            showErrorToast('Curso não selecionado', 'Selecione um curso primeiro');
            return;
        }

        if (!formDataDisciplinaCurso.id_categoria) {
            showErrorToast('Categoria não selecionada', 'Selecione uma categoria primeiro');
            return;
        }

        if (!anoletivo.trim()) {
            showErrorToast('Ano letivo vazio', 'Por favor, insira o ano letivo');
            return;
        }

        if (!user || !user.id) {
            showErrorToast('Usuário não autenticado', 'Faça login novamente');
            return;
        }

        setLoading(true);

        try {
            const response = await api.post(`/registrarPeriodo`, {
                id_anocurricular: formDataDisciplinaCurso.id_anocurricular,
                id_curso: formDataDisciplinaCurso.id_curso,
                id_categoria: formDataDisciplinaCurso.id_categoria,
                turma: turma.trim(),
                anoletivo: anoletivo.trim(),
                periodo: periodo
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.sucesso) {
                showSuccessToast(
                    response.data.titulo || "Sucesso",
                    response.data.mensagem || "Período registrado com sucesso"
                );
                setTurma("");
                setAnoLetivo("");
                setPeriodo("");
            } else {
                showErrorToast(response.data.titulo || "Erro", response.data.mensagem);
            }
        } catch (error) {
            console.error('Erro ao registrar período:', error);
            
            if (error.response && error.response.data) {
                showErrorToast(error.response.data.titulo || "Erro", error.response.data.mensagem);
            } else {
                showErrorToast('Erro de conexão', 'Não foi possível conectar ao servidor');
            }
        } finally {
            setLoading(false);
        }
    };

    // ==================== RENDER ====================
    
    return (
        <div className="row mb-4">
            <div className="col-12">
                <div className="row">
                    {/* CARD 1 - Anos Curriculares */}
                    <div className="col-12 col-lg-4 mb-3">
                        <div className="shadow-sm rounded-3 p-4 border h-100">
                            <h5 className="mb-3">
                                <IoMdAddCircleOutline className="me-2 mb-1" />
                                Anos Curriculares
                            </h5>
                            <form onSubmit={handleSubmitAnoCurricular}>
                                <SelectCurso 
                                    onChange={(value) => setIdCurso(value)} 
                                    value={idCurso}
                                    disabled={loading}
                                />
                                
                                <div className="d-flex mb-3">
                                    <span className={`${style.span} input-group-text`}><Fa0 /></span>
                                    <select 
                                        className={`${style.inputHome} form-control`}
                                        value={anoCurricular}
                                        onChange={(e) => setAnoCurricular(e.target.value)}
                                        disabled={loading}
                                        name="anocurricular"
                                        required
                                    >
                                        <option value="">Selecione o Ano Curricular</option>
                                        <option value="1">1º Ano</option>
                                        <option value="2">2º Ano</option>
                                        <option value="3">3º Ano</option>
                                        <option value="4">4º Ano</option>
                                        <option value="5">5º Ano</option>
                                    </select>
                                </div>
                                
                                <button 
                                    type="submit" 
                                    className={`btn btn-sm w-100 ${Style.btnSubmit}`}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Processando...
                                        </>
                                    ) : (
                                        "Adicionar Ano"
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                    
                    {/* CARD 2 - Adicionar Disciplina ao Curso */}
                    <div className="col-12 col-lg-4 mb-3">
                        <div className="shadow-sm rounded-3 p-4 border h-100">
                            <h5 className="mb-3">
                                <IoMdAddCircleOutline className="me-2 mb-1" />
                                Adicionar Disciplina ao Curso
                            </h5>
                            <form onSubmit={handleSubmitDisciplinaCurso}>
                                <CategoriaCursoAno 
                                    onChange={handleFormDataChange}
                                    disabled={loading}
                                />
                                
                                <SelectDisciplina 
                                    onChange={(value) => setFormDataDisciplinaCurso(prev => ({
                                        ...prev,
                                        id_disciplina: value
                                    }))}
                                    value={formDataDisciplinaCurso.id_disciplina}
                                    disabled={loading}
                                />
                                
                                <div className="d-flex mb-3">
                                    <span className={`${style.span} input-group-text`}><Fa0 /></span>
                                    <select 
                                        className={`${style.inputHome} form-control`}
                                        value={semestre}
                                        onChange={(e) => setSemestre(e.target.value)}
                                        disabled={loading}
                                        name="semestre"
                                        required
                                    >
                                        <option value="">Selecione o semestre</option>
                                        <option value="1">1º Semestre</option>
                                        <option value="2">2º Semestre</option>
                                        <option value="3">3º Semestre</option>
                                        <option value="4">4º Semestre</option>
                                        <option value="5">5º Semestre</option>
                                        <option value="6">6º Semestre</option>
                                        <option value="7">7º Semestre</option>
                                        <option value="8">8º Semestre</option>
                                    </select>
                                </div>
                                
                                <button 
                                    type="submit" 
                                    className={`btn btn-sm w-100 ${Style.btnSubmit}`}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Processando...
                                        </>
                                    ) : (
                                        "Adicionar Disciplina"
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                    
                    {/* CARD 3 - Adicionar Novas Turmas */}
                    <div className="col-12 col-lg-4 mb-3">
                        <div className="shadow-sm rounded-3 p-4 border h-100">
                            <h5 className="mb-3">
                                <IoMdAddCircleOutline className="me-2 mb-1" />
                                Adicionar Novas Turmas
                            </h5>
                            <form onSubmit={handleSubmitPeriodo}>
                                <CategoriaCursoAno 
                                    onChange={handleFormDataChange}
                                    disabled={loading}
                                />
                                
                                <div className="d-flex mb-3">
                                    <span className={`${style.span} input-group-text`}><Fa0 /></span>
                                    <input 
                                        type="text" 
                                        name="turma" 
                                        className={`${style.inputHome} form-control`}
                                        value={turma} 
                                        placeholder="Turma (ex: LCC1M)" 
                                        onChange={(e)=>setTurma(e.target.value)}
                                        disabled={loading}
                                        required
                                    />
                                </div>
                                
                                <div className="d-flex mb-3">
                                    <span className={`${style.span} input-group-text`}><Fa0 /></span>
                                    <input 
                                        type="text" 
                                        name="anoletivo" 
                                        className={`${style.inputHome} form-control`}
                                        value={anoletivo} 
                                        placeholder="Ano Lectivo (ex: 2025/2026)" 
                                        onChange={(e)=>setAnoLetivo(e.target.value)}
                                        disabled={loading}
                                        required
                                    />
                                </div>
                                
                                <div className="d-flex mb-3">
                                    <span className={`${style.span} input-group-text`}><Fa0 /></span>
                                    <select 
                                        className={`${style.inputHome} form-control`}
                                        value={periodo}
                                        onChange={(e) => setPeriodo(e.target.value)}
                                        disabled={loading}
                                        name="periodo"
                                        required
                                    >
                                        <option value="">Selecione o período</option>
                                        <option value="Manhã">Manhã</option>
                                        <option value="Tarde">Tarde</option>
                                        <option value="Noite">Noite</option>
                                        <option value="Diurno">Diurno</option>
                                    </select>
                                </div>
                                
                                <button 
                                    type="submit" 
                                    className={`btn btn-sm w-100 ${Style.btnSubmit}`}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Processando...
                                        </>
                                    ) : (
                                        "Adicionar Turma"
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OutrosRegistros;