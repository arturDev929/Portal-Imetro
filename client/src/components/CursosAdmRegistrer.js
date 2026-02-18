import { useState} from "react";
import "react-toastify/dist/ReactToastify.css";
import Axios from "axios";
import SelectCurso from "./selectCursos";
import CategoriaCursoAno from "./CategoriaCursoAno";
import SelectDisciplina from "./SelectDisciplina";
import { IoMdAddCircleOutline } from "react-icons/io";
import { showSuccessToast, showErrorToast } from "./CustomToast";
import Style from "./DepartamentosEdit.module.css"

function CursosAdmRegistrer() {
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
            const response = await Axios.post('http://localhost:8080/post/registrarAnoCurricular', {
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
                // setAnoCurricular("");
                // setIdCurso("");
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
            const response = await Axios.post('http://localhost:8080/post/registrarDisciplinaCurso', {
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
                // setFormDataDisciplinaCurso({
                //     idcategoriacurso: "",
                //     idcurso: "",
                //     idanocurricular: "",
                //     iddisciplina: ""
                // });
                // setSemestre("");
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
            const response = await Axios.post('http://localhost:8080/post/registrarPeriodo', {
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
                
                // Limpar campos após sucesso (opcional)
                // setTurma("");
                // setPeriodo("");
                // setFormDataDisciplinaCurso({
                //     idcategoriacurso: "",
                //     idcurso: "",
                //     idanocurricular: "",
                //     iddisciplina: ""
                // });
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
        <div className="row mb-4" style={{backgroundColor:'var(--cinza-claro)'}}>
            <div className="col-12">
                 <div className="row">
                    <div className="col-12 col-lg-4 mb-3" >
                        <div className="shadow-sm rounded-3 p-4 border" style={{backgroundColor:'var(--cinza-claro)'}}>
                            <h5 className="mb-3"style={{color:'var(--azul-escuro)'}} >
                                <IoMdAddCircleOutline className="me-2 mb-1" />
                                Anos Curriculares
                            </h5>
                            <form className="row g-2" onSubmit={handleSubmitAnoCurricular}>
                                <div className="col-12 mb-2">
                                    <SelectCurso 
                                        onChange={(e) => setIdCurso(e.target.value)} 
                                        value={idCurso}
                                        name="idcurso"
                                        style={{backgroundColor:'var(--cinza-claro)'}}
                                    />
                                </div>
                                <div className="col-12">
                                    <select 
                                        className="form-control form-control-sm"
                                        style={{backgroundColor:'var(--cinza-claro)'}}
                                        value={anoCurricular}
                                        onChange={(e) => setAnoCurricular(e.target.value)}
                                        disabled={loading}
                                        name="anocurricular"
                                    >
                                        <option value="">Selecione o Ano Curricular</option>
                                        <option value="1">1º Ano</option>
                                        <option value="2">2º Ano</option>
                                        <option value="3">3º Ano</option>
                                        <option value="4">4º Ano</option>
                                        <option value="5">5º Ano</option>
                                    </select>
                                </div>
                                <div className="col-12 mt-2">
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
                                </div>
                            </form>
                        </div>
                    </div>
                        {/* Disciplina no Curso */}
                    <div className="col-12 col-lg-4 mb-3">
                        <div className="shadow-sm rounded-3 p-4 border" style={{backgroundColor:'var(--cinza-claro)'}}>
                            <h5 className="mb-3" style={{color:'var(--azul-escuro)'}}>
                                <IoMdAddCircleOutline className="me-2 mb-1" />
                                Adicionar Disciplina ao Curso
                            </h5>
                            <form className="row g-2" onSubmit={handleSubmitDisciplinaCurso}>
                                <CategoriaCursoAno 
                                    style={{backgroundColor:'var(--cinza-claro)'}}
                                    onChange={handleFormDataChange}
                                />
                                <SelectDisciplina 
                                    style={{backgroundColor:'var(--cinza-claro)'}}
                                    onChange={(e) => setFormDataDisciplinaCurso(prev => ({
                                        ...prev,
                                        iddisciplina: e.target.value
                                    }))}
                                    value={formDataDisciplinaCurso.iddisciplina}
                                />
                                <div className="col-12">
                                <select 
                                        style={{backgroundColor:'var(--cinza-claro)'}}
                                        className="form-control form-control-sm"
                                        value={semestre}
                                        onChange={(e) => setSemestre(e.target.value)}
                                        disabled={loading}
                                        name="semestre"
                                    >
                                        <option value="">Selecione o semestre</option>
                                        <option value="1">1º Semestre</option>
                                        <option value="2">2º Semestre</option>
                                    </select>
                                </div>
                                <div className="col-12">
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
                                </div>
                            </form>
                        </div>
                    </div>
                    {/* Turmas */}
                    <div className="col-12 col-lg-4 mb-3">
                        <div className="shadow-sm rounded-3 p-4 border" style={{backgroundColor:'var(--cinza-claro)'}}>
                            <h5 className="mb-3" style={{color:'var(--azul-escuro)'}}>
                                <IoMdAddCircleOutline className="me-2 mb-1" />
                                Adicionar Novas Turmas
                            </h5>
                            <form className="row g-2" onSubmit={handleSubmitPeriodo}>
                                <CategoriaCursoAno 
                                    onChange={handleFormDataChange}
                                />
                                <div className="col-12 mb-2" style={{backgroundColor:'var(--cinza-claro)'}}>
                                    <input type="text" name="turma" className="form-control form-control-sm" value={turma} placeholder="Turma..." onChange={(e)=>setTurma(e.target.value)}/>
                                </div>
                                <div className="col-12 mb-2" style={{backgroundColor:'var(--cinza-claro)'}}>
                                    <input type="text" name="anoletivo" className="form-control form-control-sm" value={anoletivo} placeholder="Ano Lectivo..." onChange={(e)=>setAnoLetivo(e.target.value)}/>
                                </div>
                                <div className="col-12">
                                    <select 
                                        className="form-control form-control-sm"
                                        value={periodo}
                                        onChange={(e) => setPeriodo(e.target.value)}
                                        disabled={loading}
                                        style={{backgroundColor:'var(--cinza-claro)'}}
                                        name="periodo"
                                    >
                                        <option value="">Selecione o periodo</option>
                                        <option value="Manhã">Manhã</option>
                                        <option value="Tarde">Tarde</option>
                                        <option value="Noite">Noite</option>
                                    </select>
                                </div>
                                <div className="col-12">
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
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CursosAdmRegistrer;