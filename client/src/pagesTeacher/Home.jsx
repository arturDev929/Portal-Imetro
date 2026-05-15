import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../service/api";
import TeacherLayout from "../layouts/TeacherLayout";
import { IoLogoWhatsapp } from "react-icons/io";
import {
  MdBook,
  MdPerson,
  MdEmail,
  MdPhone,
  MdLocationOn,
  MdAttachFile,
  MdCameraAlt
} from "react-icons/md";
import {
  FaBook,
  FaHeartbeat,
  FaUniversity,
  FaBriefcase,
} from "react-icons/fa";
import { RiContactsBook3Line } from "react-icons/ri";

function Home() {
  const { codigo } = useParams();
  const navigate = useNavigate();
  const [professor, setProfessor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  // Load user from localStorage
  useEffect(() => {
    const usuarioSalvo = localStorage.getItem("usuarioLogado");
    if (usuarioSalvo) {
      const userData = JSON.parse(usuarioSalvo);
      setUser(userData);
    } else {
      navigate("/");
    }
  }, [navigate]);

  // Fetch professor data when user or codigo changes
  useEffect(() => {
    if (user || codigo) {
      const codigoToUse = codigo || user?.codigo;
      if (codigoToUse) {
        fetchProfessorData(codigoToUse);
      }
    }
  }, [codigo, user]);

  const fetchProfessorData = async (professorCodigo) => {
    try {
      setLoading(true);
      const response = await api.get(`/PerfilProfessor/${professorCodigo}`);
      setProfessor(response.data);
      setError(null);
    } catch (err) {
      console.error("Erro:", err);
      setError(err.response?.data?.error || err.message || "Erro ao carregar dados do professor");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Não informado";
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  // Status badge helper function
  const getStatusBadge = (status) => {
    if (status === 'Ativo') {
      return <span className="badge bg-success">{status}</span>;
    } else if (status === 'Desativado') {
      return <span className="badge bg-danger">{status}</span>;
    } else {
      return <span className="badge bg-secondary">{status || 'Desconhecido'}</span>;
    }
  };

  if (loading) {
    return (
      <TeacherLayout>
        <div className="container-fluid py-4 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
        </div>
      </TeacherLayout>
    );
  }

  if (error || !professor) {
    return (
      <TeacherLayout>
        <div className="container-fluid py-4">
          <div className="alert alert-danger">
            <strong>Erro!</strong> {error || "Professor não encontrado"}
          </div>
          <button
            className="btn btn-primary mt-3"
            onClick={() => navigate("/dashboard")}
          >
            Voltar para o Dashboard
          </button>
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout>
      <div className="container-fluid py-4">
        <div className="row mb-4">
          <div className="col-md-3 text-center">
            <div className="position-relative d-inline-block">
              <img
                src={professor.fotoUrl || '/default-avatar.png'}
                className="rounded-circle border"
                style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                alt={`Foto do Professor ${professor.nomeprofessor}`}
                onError={(e) => {
                  e.target.src = '/default-avatar.png';
                }}
              />
              <button className="btn btn-sm btn-light position-absolute bottom-0 end-0 rounded-circle bg-success">
                <MdCameraAlt />
              </button>
            </div>
            <h5 className="mt-3 mb-1">{professor.nomeprofessor || "Nome não informado"}</h5>
            <p className="text-muted mb-2">Professor</p>
            {getStatusBadge(professor.estado)}
            <p className="mt-2 mb-0">
              <small className="text-muted">Código: {professor.codigoprofessor}</small>
            </p>
          </div>

          <div className="col-md-9">
            <div className="row">
              <div className="col-md-6 mb-3">
                <div className="card bg-light border-0 h-100">
                  <div className="card-body">
                    <h6 className="card-title" style={{ color: 'var(--azul-escuro)' }}>
                      <MdPerson className="me-2" />
                      Dados Pessoais
                    </h6>
                    <div className="row mt-3">
                      <div className="col-6">
                        <p className="mb-2"><strong>Nome Completo:</strong></p>
                        <p>{professor.nomeprofessor || "-"}</p>
                        <p className="mb-2"><strong>Gênero:</strong></p>
                        <p>{professor.generoprofessor || "-"}</p>
                        <p className="mb-2"><strong>Nacionalidade:</strong></p>
                        <p>{professor.nacionalidadeprofessor || "-"}</p>
                      </div>
                      <div className="col-6">
                        <p className="mb-2"><strong>Estado Civil:</strong></p>
                        <p>{professor.estadocivilprofessor || "-"}</p>
                        <p className="mb-2"><strong>Data Nascimento:</strong></p>
                        <p>{formatDate(professor.datanascimentoprofessor)}</p>
                        <p className="mb-2"><strong>Nº do BI:</strong></p>
                        <p>{professor.nbiprofessor || "-"}</p>
                      </div>
                    </div>
                    {(professor.nomepaiprofessor || professor.nomemaeprofessor) && (
                      <div className="row mt-2">
                        <div className="col-12">
                          <hr />
                          <p className="mb-2"><strong>Filiação:</strong></p>
                          <p className="mb-1"><small>Pai: {professor.nomepaiprofessor || "-"}</small></p>
                          <p className="mb-0"><small>Mãe: {professor.nomemaeprofessor || "-"}</small></p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-md-6 mb-3">
                <div className="card bg-light border-0 h-100">
                  <div className="card-body">
                    <h6 className="card-title" style={{ color: 'var(--azul-escuro)' }}>
                      <RiContactsBook3Line className="me-2" />
                      Contato e Endereço
                    </h6>
                    <div className="mt-3">
                      <p className="mb-2">
                        <MdLocationOn className="me-2 text-primary" />
                        <strong>Residência:</strong>
                      </p>
                      <p className="mb-3 ms-4">{professor.residenciaprofessor || "Não informado"}</p>

                      <p className="mb-2">
                        <MdPhone className="me-2 text-primary" />
                        <strong>Telefone:</strong>
                      </p>
                      <p className="mb-3 ms-4">{professor.telefoneprofessor || "Não informado"}</p>

                      {professor.whatsappprofessor && (
                        <>
                          <p className="mb-2">
                            <IoLogoWhatsapp className="me-2 text-primary" />
                            <strong>WhatsApp:</strong>
                          </p>
                          <p className="mb-3 ms-4">{professor.whatsappprofessor}</p>
                        </>
                      )}

                      <p className="mb-2">
                        <MdEmail className="me-2 text-primary" />
                        <strong>Email:</strong>
                      </p>
                      <p className="mb-3 ms-4">{professor.emailprofessor || "Não informado"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dados Profissionais */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header bg-white">
                <h5 className="mb-0" style={{ color: 'var(--azul-escuro)' }}>
                  <FaBriefcase className="me-2" />
                  Dados Profissionais
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-3 mb-3">
                    <div className="border rounded p-3 text-center">
                      <strong>Anos de Experiência</strong>
                      <p className="display-8 mt-2 mb-0">{professor.anoexperienciaprofessor || 0}</p>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="border rounded p-3 text-center">
                      <strong>Titularidade</strong>
                      <p className="mt-2 mb-0">{professor.titulacaoprofessor || "Não informado"}</p>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="border rounded p-3 text-center">
                      <strong>Data Admissão</strong>
                      <p className="mt-2 mb-0">{formatDate(professor.dataadmissaoprofessor)}</p>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="border rounded p-3 text-center">
                      <strong>Tipo Contrato</strong>
                      <p className="mt-2 mb-0">{professor.tipocontratoprofessor || "Não informado"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Disciplinas Ministradas */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header bg-white">
                <h5 className="mb-0" style={{ color: 'var(--azul-escuro)' }}>
                  <FaBook className="me-2" />
                  Disciplinas Ministradas
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  {professor.disciplinas && professor.disciplinas.length > 0 ? (
                    professor.disciplinas.map((disciplina) => (
                      <div className="col-md-4 mb-2" key={disciplina.iddisciplina}>
                        <div className="d-flex align-items-center">
                          <MdBook className="me-2 text-primary" />
                          <span>{disciplina.disciplina}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-12">
                      <p className="text-muted">Nenhuma disciplina atribuída</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dados Bancários e Saúde */}
        <div className="row mb-4">
          <div className="col-md-6 mb-3">
            <div className="card">
              <div className="card-header bg-white">
                <h5 className="mb-0" style={{ color: 'var(--azul-escuro)' }}>
                  <FaUniversity className="me-2" />
                  Dados Bancários
                </h5>
              </div>
              <div className="card-body">
                <p className="mb-2"><strong>IBAN:</strong> {professor.ibanprofessor || "Não informado"}</p>
              </div>
            </div>
          </div>

          <div className="col-md-6 mb-3">
            <div className="card">
              <div className="card-header bg-white">
                <h5 className="mb-0" style={{ color: 'var(--azul-escuro)' }}>
                  <FaHeartbeat className="me-2" />
                  Dados de Saúde
                </h5>
              </div>
              <div className="card-body">
                <p className="mb-2"><strong>Tipo Sanguíneo:</strong> {professor.tiposanguineoprofessor || "Não informado"}</p>
                <p className="mb-2"><strong>Condição:</strong> {professor.condicoesprofessor || "Não informado"}</p>
                <p className="mb-2"><strong>Contacto Emergência:</strong> {professor.contactoemergenciaprofessor || "Não informado"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Documentos */}
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header bg-white">
                <h5 className="mb-0" style={{ color: 'var(--azul-escuro)' }}>
                  <MdAttachFile className="me-2" />
                  Documentos
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  {professor.curriculoUrl && (
                    <div className="col-md-4 mb-2">
                      <a
                        href={professor.curriculoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline-primary w-100"
                      >
                        <MdAttachFile className="me-2" />
                        Visualizar Currículo
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TeacherLayout>
  )
}

export default Home;