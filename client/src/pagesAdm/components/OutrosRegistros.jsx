import { useState} from "react";
import "react-toastify/dist/ReactToastify.css";
import api from "../../service/api";
import SelectCurso from "./selectCursos";
import CategoriaCursoAno from "./CategoriaCursoAno";
import SelectDisciplina from "./SelectDisciplina";
import { IoMdAddCircleOutline } from "react-icons/io";
import { showSuccessToast, showErrorToast } from "./CustomToast";
import Style from "./DepartamentosEdit.module.css"
import { Fa0 } from "react-icons/fa6";
import style from "../../pages/Cadastro.module.css"

function OutrosRegistros() {
    const [anoCurricular, setAnoCurricular] = useState("");
    const [idCurso, setIdCurso] = useState("");
    const [turma, setTurma] = useState("");
    const [anoletivo, setAnoLetivo] = useState("");
    const [periodo, setPeriodo] = useState("")
    const [loading, setLoading] = useState(false);
    
    const [formDataDisciplinaCurso, setFormDataDisciplinaCurso] = useState({
        idcategoriacurso: "",
        idcurso: "",
        idanocurricular: "",
        iddisciplina: ""
    });
    const [semestre, setSemestre] = useState("");
    
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

        setLoading(true);

        try {
            const response = await api.post(`/post/registrarAnoCurricular`, {
                anocurricular: anoCurricular,
                idcurso: idCurso
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

    const handleFormDataChange = (newData) => {
        setFormDataDisciplinaCurso(prev => ({
            ...prev,
            ...newData
        }));
    };

    const handleSubmitDisciplinaCurso = async (e) => {
        e.preventDefault();
        
        if (!formDataDisciplinaCurso.iddisciplina) {
            showErrorToast('Disciplina não selecionada', 'Selecione uma disciplina primeiro');
            return;
        }

        if (!formDataDisciplinaCurso.idanocurricular) {
            showErrorToast('Ano Curricular não selecionado', 'Selecione um ano curricular primeiro');
            return;
        }

        if (!semestre.trim()) {
            showErrorToast('Semestre vazio', 'Por favor, insira o semestre');
            return;
        }

        setLoading(true);

        try {
            const response = await api.post(`/post/registrarDisciplinaCurso`, {
                iddisciplina: formDataDisciplinaCurso.iddisciplina,
                idanocurricular: formDataDisciplinaCurso.idanocurricular,
                idcurso: formDataDisciplinaCurso.idcurso,
                idcategoriacurso: formDataDisciplinaCurso.idcategoriacurso,
                semestre: semestre
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

        if (!formDataDisciplinaCurso.idanocurricular) {
            showErrorToast('Ano Curricular não selecionado', 'Selecione um ano curricular primeiro');
            return;
        }

        if (!formDataDisciplinaCurso.idcurso) {
            showErrorToast('Curso não selecionado', 'Selecione um curso primeiro');
            return;
        }

        if (!formDataDisciplinaCurso.idcategoriacurso) {
            showErrorToast('Categoria não selecionada', 'Selecione uma categoria primeiro');
            return;
        }

        setLoading(true);

        try {
            const response = await api.post(`/post/registrarPeriodo`, {
                idanocurricular: formDataDisciplinaCurso.idanocurricular,
                idcurso: formDataDisciplinaCurso.idcurso,
                idcategoriacurso: formDataDisciplinaCurso.idcategoriacurso,
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
                    response.data.mensagem || "Turma registrada com sucesso"
                );
                setTurma("");
                setAnoLetivo("");
                setPeriodo("");
            } else {
                showErrorToast(response.data.titulo || "Erro", response.data.mensagem);
            }
        } catch (error) {
            console.error('Erro ao registrar turma/período:', error);
            
            if (error.response && error.response.data) {
                showErrorToast(error.response.data.titulo || "Erro", error.response.data.mensagem);
            } else {
                showErrorToast('Erro de conexão', 'Não foi possível conectar ao servidor');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="row mb-4">
            <div className="col-12">
                <div className="row">
                    <div className="col-12 col-lg-4 mb-3">
                        <div className="shadow-sm rounded-3 p-4 border">
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
                                        "Adicionar"
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                    
                    <div className="col-12 col-lg-4 mb-3">
                        <div className="shadow-sm rounded-3 p-4 border">
                            <h5 className="mb-3">
                                <IoMdAddCircleOutline className="me-2 mb-1" />
                                Adicionar Disciplina ao Curso
                            </h5>
                            <form onSubmit={handleSubmitDisciplinaCurso}>
                                <CategoriaCursoAno onChange={handleFormDataChange} />
                                
                                <SelectDisciplina 
                                    onChange={(value) => setFormDataDisciplinaCurso(prev => ({
                                        ...prev,
                                        iddisciplina: value
                                    }))}
                                    value={formDataDisciplinaCurso.iddisciplina}
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
                    
                    <div className="col-12 col-lg-4 mb-3">
                        <div className="shadow-sm rounded-3 p-4 border">
                            <h5 className="mb-3">
                                <IoMdAddCircleOutline className="me-2 mb-1" />
                                Adicionar Novas Turmas
                            </h5>
                            <form onSubmit={handleSubmitPeriodo}>
                                <CategoriaCursoAno onChange={handleFormDataChange} />
                                
                                <div className="d-flex mb-3">
                                    <span className={`${style.span} input-group-text`}><Fa0 /></span>
                                    <input 
                                        type="text" 
                                        name="turma" 
                                        className={`${style.inputHome} form-control`}
                                        value={turma} 
                                        placeholder="Turma..." 
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
                                        placeholder="Ano Lectivo..." 
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
                                        <option value="">Selecione o periodo</option>
                                        <option value="Manhã">Manhã</option>
                                        <option value="Tarde">Tarde</option>
                                        <option value="Noite">Noite</option>
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