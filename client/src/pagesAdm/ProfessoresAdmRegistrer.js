import NavbarAdm from "../components/NavbarAdm";
import SidebarAdm from "../components/SidebarAdm";
import { useState, useEffect } from "react";
import { IoMdPersonAdd } from "react-icons/io";
import { RiContactsBook3Line } from "react-icons/ri";
import { FaBriefcase, FaSchool} from "react-icons/fa";
import { MdOutlineLocalHospital } from "react-icons/md";
import "react-toastify/dist/ReactToastify.css";
import { IoMdAddCircleOutline } from "react-icons/io";
import Axios from "axios";
import SelectDisciplina from "../components/SelectDisciplina";
import SelectProfessor from "../components/SelectProfessor";
import { showSuccessToast, showErrorToast } from "../components/CustomToast";

function ProfessoresAdmRegistrer() {
    const [user, setUser] = useState(null);
    const [valores, setValores] = useState({
        fotoprofessor: null,
        nomeprofessore: "",
        genero: "",
        nacionalidadeprofessor: "",
        estadocivilprofessor: "",
        nomepaiprofessor: "",
        nomemaeprofessor: "",
        biprofessor: "",
        datanascimentoprofessor: "",
        bipdfprofessor: null,
        residenciaprofessor: "",
        telefoneprofessor: "",
        whatsappprofessor: "",
        emailprofessor: "",
        anoexprienciaprofessor: "",
        titulacaoprofessor: "",
        dataadmissaprofessor: "",
        tipocontratoprofessor: "",
        ibanprofessor: "",
        tiposanguineoprofessor: "",
        condicoesprofessor: "",
        contactoemergenciaprofessor: ""
    });
    const [loading, setLoading] = useState(false);
    const [codigoGerado, setCodigoGerado] = useState(null);
    const [idprofessor, setIdProfessor] = useState ("");
    const [iddisciplina, setIdDisciplina] = useState("");

    useEffect(() => {
        const usuarioSalvo = localStorage.getItem("usuarioLogado");
        if (usuarioSalvo) {
            setUser(JSON.parse(usuarioSalvo));
        }
    }, []);

    const handleChangeInput = (e) => {
        const { name, value, files } = e.target;
        
        if (files && files[0]) {
            setValores((prev) => ({
                ...prev,
                [name]: files[0]
            }));
        } else {
            setValores((prev) => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!user?.id) {
            showErrorToast("Acesso Negado", "Administrador não autenticado!");
            return;
        }

        setLoading(true);
        setCodigoGerado(null);

        try {
            const formData = new FormData();
    
            Object.keys(valores).forEach(key => {
                if (valores[key] !== null && valores[key] !== undefined && valores[key] !== "") {
                    formData.append(key, valores[key]);
                    console.log(`Campo ${key}:`, valores[key]);
                }
            });
            
            formData.append('idAdm', user.id);
            console.log(`idAdm: ${user.id}`);

            const response = await Axios.post(
                'http://localhost:8080/post/registrarprofessor',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    timeout: 30000
                }
            );

            console.log("Resposta recebida:", response.data);

            if (response.data.sucesso) {
                const codigoProfessor = response.data.dados.codigoProfessor;
                const codigoAcesso = response.data.dados.codigoAcesso;
                
                showSuccessToast(
                    "Professor Registrado com Sucesso!",
                    "Professor registrado com sucesso.",
                    {
                        "Código do Professor": codigoProfessor,
                        "Senha de Acesso": codigoAcesso
                    }
                );

                setValores({
                    fotoprofessor: null,
                    nomeprofessore: "",
                    genero: "",
                    nacionalidadeprofessor: "",
                    estadocivilprofessor: "",
                    nomepaiprofessor: "",
                    nomemaeprofessor: "",
                    biprofessor: "",
                    datanascimentoprofessor: "",
                    bipdfprofessor: null,
                    residenciaprofessor: "",
                    telefoneprofessor: "",
                    whatsappprofessor: "",
                    emailprofessor: "",
                    anoexprienciaprofessor: "",
                    titulacaoprofessor: "",
                    dataadmissaprofessor: "",
                    tipocontratoprofessor: "",
                    ibanprofessor: "",
                    tiposanguineoprofessor: "",
                    condicoesprofessor: "",
                    contactoemergenciaprofessor: ""
                });

                document.querySelectorAll('input[type="file"]').forEach(input => {
                    input.value = '';
                });

                setTimeout(() => {
                    setCodigoGerado(null);
                }, 30000);
            }

        } catch (error) {
            let mensagemErro = "Erro ao registrar professor";
            let tituloErro = "Erro no Sistema";
            
            if (error.response?.data) {
                tituloErro = error.response.data.titulo || "Erro";
                mensagemErro = error.response.data.mensagem || "Erro desconhecido";
            } else if (error.message) {
                if (error.message.includes("timeout")) {
                    mensagemErro = "Tempo limite excedido. O servidor está demorando para responder.";
                } else if (error.message.includes("Network Error")) {
                    mensagemErro = "Erro de conexão. Verifique se o servidor está online.";
                } else {
                    mensagemErro = error.message;
                }
            }
            showErrorToast(tituloErro, mensagemErro);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitDisciplinaProfessor = async (e) => {
        e.preventDefault();
        
        if (!iddisciplina || !idprofessor) {
            showErrorToast("Seleção Incompleta", "Por favor, selecione uma disciplina e um professor.");
            return;
        }
        
        setLoading(true);
        
        try {
            const response = await fetch('http://localhost:8080/post/registrerDisciplinaProfessor', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    iddisciplina,
                    idprofessor
                }),
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.mensagem || 'Erro ao adicionar disciplina ao professor');
            }
            
            if (data.sucesso) {
                showSuccessToast(
                    data.titulo || "Disciplina Adicionada",
                    data.mensagem || "Disciplina adicionada ao professor com sucesso.",
                    {
                        "Professor": data.dados?.professor_nome,
                        "Disciplina": data.dados?.disciplina_nome
                    }
                );
                // setIdDisciplina("");
                // setIdProfessor("");
            } else {
                showErrorToast(data.titulo || "Erro", data.mensagem);
            }
            
        } catch (error) {
            console.error("Erro:", error);
            showErrorToast("Erro no Processamento", error.message);
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
                            <h3 className="text-primary">
                                <IoMdPersonAdd className="me-2 mb-2" />
                                Registrar Professores
                            </h3>
                        </div>

                        {codigoGerado && (
                            <div className="col-12 mb-4">
                                <div className="alert alert-success alert-dismissible fade show shadow-sm" role="alert">
                                    <button 
                                        type="button" 
                                        className="btn-close" 
                                        onClick={() => setCodigoGerado(null)}
                                    ></button>
                                    <h5 className="alert-heading">Professor registrado com sucesso!</h5>
                                    <p className="mb-2">Código de acesso do professor: {codigoGerado}</p>
                                </div>
                            </div>
                        )}
                        
                        <div className="col-12 mb-3">
                            <div className="shadow-sm rounded-3 p-4 bg-light border">
                                <form className="row g-3" onSubmit={handleSubmit}>
                                    <h5 className="text-primary col-12 border-bottom pb-2">
                                        <IoMdPersonAdd className="me-2 mb-1" />
                                        Dados Pessoais
                                    </h5>
                                    
                                    <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                                        <label className="form-label small text-muted mb-1">Foto do Professor</label>
                                        <input 
                                            type="file" 
                                            className="form-control form-control-sm" 
                                            name="fotoprofessor" 
                                            accept="image/*" 
                                            onChange={handleChangeInput} 
                                        />
                                    </div>
                                    
                                    <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                                        <label className="form-label small text-muted mb-1">Nome Completo</label>
                                        <input 
                                            type="text" 
                                            placeholder="Nome Completo..." 
                                            className="form-control form-control-sm" 
                                            name="nomeprofessore" 
                                            value={valores.nomeprofessore}
                                            onChange={handleChangeInput}
                                        />
                                    </div>
                                    
                                    <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                                        <label className="form-label small text-muted mb-1">Gênero</label>
                                        <select 
                                            className="form-control form-control-sm" 
                                            name="genero"
                                            value={valores.genero}
                                            onChange={handleChangeInput}
                                        >
                                            <option value="">Selecione o gênero</option>
                                            <option value="Masculino">Masculino</option>
                                            <option value="Feminino">Feminino</option>
                                        </select>
                                    </div>
                                    
                                    <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                                        <label className="form-label small text-muted mb-1">Nacionalidade</label>
                                        <input 
                                            type="text" 
                                            placeholder="Nacionalidade..." 
                                            className="form-control form-control-sm" 
                                            name="nacionalidadeprofessor"
                                            value={valores.nacionalidadeprofessor}
                                            onChange={handleChangeInput} 
                                        />
                                    </div>
                                    
                                    <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                                        <label className="form-label small text-muted mb-1">Estado Civil</label>
                                        <input 
                                            type="text" 
                                            placeholder="Estado Civil..." 
                                            className="form-control form-control-sm" 
                                            name="estadocivilprofessor" 
                                            value={valores.estadocivilprofessor}
                                            onChange={handleChangeInput}
                                        />
                                    </div>
                                    
                                    <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                                        <label className="form-label small text-muted mb-1">Nome do Pai</label>
                                        <input 
                                            type="text" 
                                            placeholder="Nome do Pai..." 
                                            className="form-control form-control-sm" 
                                            name="nomepaiprofessor"
                                            value={valores.nomepaiprofessor}
                                            onChange={handleChangeInput}
                                        />
                                    </div>
                                    
                                    <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                                        <label className="form-label small text-muted mb-1">Nome da Mãe</label>
                                        <input 
                                            type="text" 
                                            placeholder="Nome da Mãe..." 
                                            className="form-control form-control-sm" 
                                            name="nomemaeprofessor"
                                            value={valores.nomemaeprofessor}
                                            onChange={handleChangeInput}
                                        />
                                    </div>
                                    
                                    <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                                        <label className="form-label small text-muted mb-1">Nº do B.I</label>
                                        <input 
                                            type="text" 
                                            placeholder="Nº B.I..." 
                                            className="form-control form-control-sm" 
                                            name="biprofessor"
                                            value={valores.biprofessor}
                                            onChange={handleChangeInput}
                                        />
                                    </div>
                                    
                                    <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                                        <label className="form-label small text-muted mb-1">Data de Nascimento</label>
                                        <input 
                                            type="date" 
                                            className="form-control form-control-sm" 
                                            name="datanascimentoprofessor" 
                                            value={valores.datanascimentoprofessor}
                                            onChange={handleChangeInput}
                                        />
                                    </div>
                                    
                                    <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                                        <label className="form-label small text-muted mb-1">B.I Frente e Verso/ Curriculum Vitae (PDF)</label>
                                        <input 
                                            type="file" 
                                            className="form-control form-control-sm" 
                                            name="bipdfprofessor" 
                                            accept=".pdf,application/pdf" 
                                            onChange={handleChangeInput}
                                        />
                                    </div>

                                    <h5 className="text-primary col-12 mt-4 border-top pt-3">
                                        <RiContactsBook3Line className="me-2 mb-1" />
                                        Dados do Contacto
                                    </h5>
                                    
                                    <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                                        <label className="form-label small text-muted mb-1">Residência</label>
                                        <input 
                                            type="text" 
                                            placeholder="Residência..." 
                                            className="form-control form-control-sm"
                                            name="residenciaprofessor"
                                            value={valores.residenciaprofessor}
                                            onChange={handleChangeInput}
                                        />
                                    </div>
                                    
                                    <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                                        <label className="form-label small text-muted mb-1">Telefone</label>
                                        <input 
                                            type="tel" 
                                            placeholder="Telefone..." 
                                            className="form-control form-control-sm" 
                                            name="telefoneprofessor"
                                            value={valores.telefoneprofessor}
                                            onChange={handleChangeInput}
                                        />
                                    </div>
                                    
                                    <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                                        <label className="form-label small text-muted mb-1">WhatsApp</label>
                                        <input 
                                            type="tel" 
                                            placeholder="WhatsApp..." 
                                            className="form-control form-control-sm" 
                                            name="whatsappprofessor"
                                            value={valores.whatsappprofessor}
                                            onChange={handleChangeInput}
                                        />
                                    </div>
                                    
                                    <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                                        <label className="form-label small text-muted mb-1">Email</label>
                                        <input 
                                            type="email" 
                                            placeholder="Email..." 
                                            className="form-control form-control-sm" 
                                            name="emailprofessor"
                                            value={valores.emailprofessor}
                                            onChange={handleChangeInput}
                                        />
                                    </div>

                                    <h5 className="text-primary col-12 mt-4 border-top pt-3">
                                        <FaBriefcase className="me-2 mb-1" />
                                        Dados Profissionais
                                    </h5>
                                    
                                    <div className="col-12 col-sm-6 col-md-4 col-lg-6">
                                        <label className="form-label small text-muted mb-1">Anos de Experiência</label>
                                        <input 
                                            type="number" 
                                            placeholder="Anos de Experiência..." 
                                            className="form-control form-control-sm" 
                                            name="anoexprienciaprofessor"
                                            value={valores.anoexprienciaprofessor}
                                            onChange={handleChangeInput}
                                            min="1"
                                            max="50"
                                            step="1"
                                        />
                                    </div>
                                    
                                    <div className="col-12 col-sm-6 col-md-4 col-lg-6">
                                        <label className="form-label small text-muted mb-1">Titulação</label>
                                        <input 
                                            type="text" 
                                            placeholder="Titulação..." 
                                            className="form-control form-control-sm" 
                                            name="titulacaoprofessor"
                                            value={valores.titulacaoprofessor}
                                            onChange={handleChangeInput}
                                        />
                                    </div>

                                    <h5 className="text-primary col-12 mt-4 border-top pt-3">
                                        <FaSchool className="me-2 mb-2" />
                                        Dados Relacionados a Instituição
                                    </h5>
                                    
                                    <div className="col-12 col-sm-6 col-md-4 col-lg-6">
                                        <label className="form-label small text-muted mb-1">Data de Admissão</label>
                                        <input 
                                            type="date" 
                                            className="form-control form-control-sm" 
                                            name="dataadmissaprofessor"
                                            value={valores.dataadmissaprofessor}
                                            onChange={handleChangeInput}
                                        />
                                    </div>
                                    
                                    <div className="col-12 col-sm-6 col-md-4 col-lg-6">
                                        <label className="form-label small text-muted mb-1">Tipo de Contrato</label>
                                        <input 
                                            type="text" 
                                            placeholder="Tipo de Contrato..." 
                                            className="form-control form-control-sm" 
                                            name="tipocontratoprofessor"
                                            value={valores.tipocontratoprofessor}
                                            onChange={handleChangeInput} 
                                        />
                                    </div>
                                    
                                    <div className="col-12 col-sm-6 col-md-4 col-lg-6">
                                        <label className="form-label small text-muted mb-1">IBAN</label>
                                        <input 
                                            type="text" 
                                            placeholder="IBAN..." 
                                            className="form-control form-control-sm" 
                                            name="ibanprofessor"
                                            value={valores.ibanprofessor}
                                            onChange={handleChangeInput}
                                        />
                                    </div>

                                    <h5 className="text-primary col-12 mt-4 border-top pt-3">
                                        <MdOutlineLocalHospital className="me-2 mb-1" />
                                        Dados de Saúde
                                    </h5>
                                    
                                    <div className="col-12 col-sm-6 col-md-4 col-lg-6">
                                        <label className="form-label small text-muted mb-1">Tipo Sanguíneo</label>
                                        <input 
                                            type="text" 
                                            placeholder="Tipo Sanguíneo..." 
                                            className="form-control form-control-sm" 
                                            name="tiposanguineoprofessor"
                                            value={valores.tiposanguineoprofessor}
                                            onChange={handleChangeInput}
                                        />
                                    </div>
                                    
                                    <div className="col-12 col-sm-6 col-md-4 col-lg-6">
                                        <label className="form-label small text-muted mb-1">Condições de Saúde/Alergia</label>
                                        <input 
                                            type="text" 
                                            placeholder="Condições de Saúde/Alergia..." 
                                            className="form-control form-control-sm" 
                                            name="condicoesprofessor"
                                            value={valores.condicoesprofessor}
                                            onChange={handleChangeInput}
                                        />
                                    </div>
                                    
                                    <div className="col-12 col-sm-6 col-md-4 col-lg-6">
                                        <label className="form-label small text-muted mb-1">Contacto de Emergência</label>
                                        <input 
                                            type="text" 
                                            placeholder="Contacto de Emergência..." 
                                            className="form-control form-control-sm"
                                            name="contactoemergenciaprofessor"
                                            value={valores.contactoemergenciaprofessor}
                                            onChange={handleChangeInput}
                                        />
                                    </div>  
                                    
                                    <div className="col-12 mt-4 border-top pt-3">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <button 
                                                type="submit" 
                                                className="btn btn-primary px-4 w-100"
                                                disabled={loading}
                                            >
                                                {loading ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                        Registrando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <IoMdPersonAdd className="me-2" />
                                                        Adicionar Professor
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>

                        <div className="col-12 col-lg-6 mb-3">
                            <div className="shadow-sm rounded-3 p-4 bg-light border">
                                <h5 className="text-primary mb-3">
                                    <IoMdAddCircleOutline className="me-2 mb-1" />
                                    Adicionar Disciplina ao Professor
                                </h5>
                                <form className="row g-2" onSubmit={handleSubmitDisciplinaProfessor}>
                                    <SelectDisciplina onChange={(e)=>setIdDisciplina(e.target.value)} value={iddisciplina} name="iddisciplina" />
                                    <SelectProfessor onChange={(e)=>setIdProfessor(e.target.value)} value={idprofessor} name="idprofessor" />
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
                    </div>
                </main>
            </div>
        </div>
    );
}

export default ProfessoresAdmRegistrer;