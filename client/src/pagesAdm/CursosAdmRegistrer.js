import NavbarAdm from "../components/NavbarAdm"
import SidebarAdm from "../components/SidebarAdm"
import { useState, useEffect } from "react";
import "react-toastify/dist/ReactToastify.css";
import Axios from "axios";
import SelectCategoriaCurso from "../components/selectCategoriaCurso";
import SelectCurso from "../components/selectCursos";
import CategoriaCursoAno from "../components/CategoriaCursoAno";
import SelectDisciplina from "../components/SelectDisciplina";
import { IoMdAddCircleOutline } from "react-icons/io";
import { showSuccessToast, showErrorToast } from "../components/CustomToast";

function CursosAdmRegistrer() {
    const [user, setUser] = useState(null);
    const [categoria, setCategoria] = useState("");
    const [cursos, setCursos] = useState("");
    const [anoCurricular, setAnoCurricular] = useState("");
    const [disciplinacurso, setDisciplina] = useState("");
    const [idCategoriaSelecionada, setIdCategoriaSelecionada] = useState("");
    const [idCurso, setIdCurso] = useState("");
    const [turma, setTurma] = useState("");
    const [periodo, setPeriodo] = useState("")
    const [loading, setLoading] = useState(false);
    
    const [formDataDisciplinaCurso, setFormDataDisciplinaCurso] = useState({
        idcategoriacurso: "",
        idcurso: "",
        idanocurricular: "",
        iddisciplina: ""
    });
    const [semestre, setSemestre] = useState("");
    
    useEffect(() => {
        const usuarioSalvo = localStorage.getItem("usuarioLogado");
        if (usuarioSalvo) {
            setUser(JSON.parse(usuarioSalvo));
        }
    }, []);
    
    const handleSubmitCategoria = async (e) => {
        e.preventDefault();
        
        if (!categoria.trim()) {
            showErrorToast('Campo vazio', 'Por favor, insira o nome da categoria');
            return;
        }

        if (!user || !user.id) {
            showErrorToast('Usuário não autenticado', 'Faça login novamente');
            return;
        }

        setLoading(true);

        try {
            const response = await Axios.post('http://localhost:8080/post/registrercategoria', {
                categoriacurso: categoria,
                idAdm: user.id
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.sucesso) {
                showSuccessToast(
                    response.data.titulo || "Sucesso",
                    response.data.mensagem || "Categoria registrada com sucesso"
                );
                // setCategoria("");
            } else {
                showErrorToast(response.data.titulo || "Erro", response.data.mensagem);
            }
        } catch (error) {
            console.error('Erro ao registrar categoria:', error);
            
            if (error.response && error.response.data) {
                showErrorToast(error.response.data.titulo || "Erro", error.response.data.mensagem);
            } else {
                showErrorToast('Erro de conexão', 'Não foi possível conectar ao servidor');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitCurso = async (e) => {
        e.preventDefault();
        
        if (!cursos.trim()) {
            showErrorToast('Campo vazio', 'Por favor, insira o nome do curso');
            return;
        }

        if (!idCategoriaSelecionada) {
            showErrorToast('Categoria não selecionada', 'Selecione uma categoria primeiro');
            return;
        }

        setLoading(true);

        try {
            const response = await Axios.post('http://localhost:8080/post/registrarcurso', {
                curso: cursos,
                idcategoriacurso: idCategoriaSelecionada
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.sucesso) {
                showSuccessToast(
                    response.data.titulo || "Sucesso",
                    response.data.mensagem || "Curso registrado com sucesso"
                );
                // setCursos("");
                // setIdCategoriaSelecionada("");
            } else {
                showErrorToast(response.data.titulo || "Erro", response.data.mensagem);
            }
        } catch (error) {
            console.error('Erro ao registrar curso:', error);
            
            if (error.response && error.response.data) {
                showErrorToast(error.response.data.titulo || "Erro", error.response.data.mensagem);
            } else {
                showErrorToast('Erro de conexão', 'Não foi possível conectar ao servidor');
            }
        } finally {
            setLoading(false);
        }
    };

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

    const handleSubmitDisciplina = async (e) => {
        e.preventDefault();
        
        if (!disciplinacurso.trim()) {
            showErrorToast('Campo vazio', 'Por favor, insira o nome da disciplina');
            return;
        }

        if (!user || !user.id) {
            showErrorToast('Usuário não autenticado', 'Faça login novamente');
            return;
        }

        setLoading(true);

        try {
            const response = await Axios.post('http://localhost:8080/post/registrardisciplina', {
                disciplina: disciplinacurso,
                idAdm: user.id
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.sucesso) {
                showSuccessToast(
                    response.data.titulo || "Sucesso",
                    response.data.mensagem || "Disciplina registrada com sucesso"
                );
                // setDisciplina("");
            } else {
                showErrorToast(response.data.titulo || "Erro", response.data.mensagem);
            }
        } catch (error) {
            console.error('Erro ao registrar disciplina:', error);
            
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
        <div className="container-fluid">
            <SidebarAdm />
            <div className="col-md-9 ms-md-auto col-lg-10 px-0">
                <NavbarAdm />
                <main className="p-4">
                    <div className="row">
                        <div className="col-12 mb-4">
                            <h3 className="text-primary">Registro e Gestão de Cursos</h3>
                        </div>
                        
                        {/* Categoria */}
                        <div className="col-12 col-lg-6 mb-3">
                            <div className="shadow-sm rounded-3 p-4 bg-light border">
                                <h5 className="text-primary mb-3">
                                    <IoMdAddCircleOutline className="me-2 mb-1" />
                                    Nova Área por Departamento
                                </h5>
                                <form className="row g-2" onSubmit={handleSubmitCategoria}>
                                    <div className="col-12">
                                        <input 
                                            type="text" 
                                            placeholder="Áreas por Departamento..." 
                                            className="form-control form-control-sm" 
                                            name="categoriacurso"
                                            value={categoria}
                                            onChange={(e) => setCategoria(e.target.value)}
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="col-12">
                                        {user && <input type="hidden" value={user.id} name="idAdm" />}
                                    </div>
                                    <div className="col-12">
                                        <button 
                                            type="submit" 
                                            className="btn btn-sm btn-primary w-100"
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

                        {/* Disciplinas */}
                        <div className="col-12 col-lg-6 mb-3">
                            <div className="shadow-sm rounded-3 p-4 bg-light border">
                                <h5 className="text-primary mb-3">
                                    <IoMdAddCircleOutline className="me-2 mb-1" />
                                    Nova Disciplina/Cadeira
                                </h5>
                                <form className="row g-2" onSubmit={handleSubmitDisciplina}>
                                    <div className="col-12">
                                        <input 
                                            type="text" 
                                            placeholder="Nome da Disciplina..." 
                                            className="form-control form-control-sm" 
                                            name="disciplina"
                                            value={disciplinacurso}
                                            onChange={(e) => setDisciplina(e.target.value)}
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="col-12">
                                        {user && <input type="hidden" value={user.id} name="idAdm" />}
                                    </div>
                                    <div className="col-12">
                                        <button 
                                            type="submit" 
                                            className="btn btn-sm btn-primary w-100"
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
                        
                        {/* Curso */}
                        <div className="col-12 col-lg-6 mb-3">
                            <div className="shadow-sm rounded-3 p-4 bg-light border">
                                <h5 className="text-primary mb-3">
                                    <IoMdAddCircleOutline className="me-2 mb-1" />
                                    Novo Curso de Licenciatura
                                </h5>
                                <form className="row g-2" onSubmit={handleSubmitCurso}>
                                    <div className="col-12 mb-2">
                                        <SelectCategoriaCurso 
                                            onChange={(e) => setIdCategoriaSelecionada(e.target.value)} 
                                            value={idCategoriaSelecionada}
                                            name="idcategoriacurso"
                                        />
                                    </div>
                                    <div className="col-12">
                                        <input 
                                            type="text" 
                                            placeholder="Nome da Licenciatura..." 
                                            className="form-control form-control-sm" 
                                            name="curso"
                                            value={cursos}
                                            onChange={(e) => setCursos(e.target.value)}
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="col-12 mt-2">
                                        <button 
                                            type="submit" 
                                            className="btn btn-sm btn-primary w-100"
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

                        {/* Ano Curricular */}
                        <div className="col-12 col-lg-6 mb-3">
                            <div className="shadow-sm rounded-3 p-4 bg-light border">
                                <h5 className="text-primary mb-3">
                                    <IoMdAddCircleOutline className="me-2 mb-1" />
                                    Anos Curriculares
                                </h5>
                                <form className="row g-2" onSubmit={handleSubmitAnoCurricular}>
                                    <div className="col-12 mb-2">
                                        <SelectCurso 
                                            onChange={(e) => setIdCurso(e.target.value)} 
                                            value={idCurso}
                                            name="idcurso"
                                        />
                                    </div>
                                    <div className="col-12">
                                        <select 
                                            className="form-control form-control-sm"
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
                                            className="btn btn-sm btn-primary w-100"
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
                        <div className="col-12 col-lg-6 mb-3">
                            <div className="shadow-sm rounded-3 p-4 bg-light border">
                                <h5 className="text-primary mb-3">
                                    <IoMdAddCircleOutline className="me-2 mb-1" />
                                    Adicionar Disciplina ao Curso
                                </h5>
                                <form className="row g-2" onSubmit={handleSubmitDisciplinaCurso}>
                                    <CategoriaCursoAno 
                                        onChange={handleFormDataChange}
                                    />
                                    <SelectDisciplina 
                                        onChange={(e) => setFormDataDisciplinaCurso(prev => ({
                                            ...prev,
                                            iddisciplina: e.target.value
                                        }))}
                                        value={formDataDisciplinaCurso.iddisciplina}
                                    />
                                    <div className="col-12">
                                        <select 
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
                                            className="btn btn-sm btn-primary w-100"
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
                        <div className="col-12 col-lg-6 mb-3">
                            <div className="shadow-sm rounded-3 p-4 bg-light border">
                                <h5 className="text-primary mb-3">
                                    <IoMdAddCircleOutline className="me-2 mb-1" />
                                    Adicionar Novas Turmas
                                </h5>
                                <form className="row g-2" onSubmit={handleSubmitPeriodo}>
                                    <CategoriaCursoAno 
                                        onChange={handleFormDataChange}
                                    />
                                    <div className="col-12 mb-2">
                                        <input type="text" name="turma" className="form-control form-control-sm" value={turma} placeholder="Turma..." onChange={(e)=>setTurma(e.target.value)}/>
                                    </div>
                                    <div className="col-12">
                                        <select 
                                            className="form-control form-control-sm"
                                            value={periodo}
                                            onChange={(e) => setPeriodo(e.target.value)}
                                            disabled={loading}
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
                                            className="btn btn-sm btn-primary w-100"
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
                </main>
            </div>
        </div>
    );
}

export default CursosAdmRegistrer;