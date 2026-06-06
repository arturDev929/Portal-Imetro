import AdminLayout from "../layouts/AdminLayout";
import { IoMdAddCircleOutline } from "react-icons/io";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { showErrorToast } from "../components/global/CustomToast";
import { api } from "../service/api";
import { showSuccessToast } from "../components/global/CustomToast";

function FuncionáriosAdmRegistrer() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const usuarioSalvo = localStorage.getItem("usuarioLogado");

    if (!token || !usuarioSalvo) {
      showErrorToast("Acesso negado", "Faça login para acessar esta página.");
      navigate("/");
      return;
    }

    try {
      const usuario = JSON.parse(usuarioSalvo);
      if (usuario.tipoUsuario !== "adm") {
        showErrorToast("Acesso negado", "Você não tem permissão para acessar esta página.");
        navigate("/");
        return;
      }
      setUser(usuario);
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("usuarioLogado");
      navigate("/");
      return;
    } finally {
      setLoadingAuth(false);
    }
  }, [navigate]);

  const [nome, setNome] = useState("");
  const [contacto, setContacto] = useState("");
  const [nbi, setNBI] = useState("");
  const [cargo, setCargo] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmitFuncionario = async (e) => {
    e.preventDefault();

    if (!nome.trim() || !contacto.trim() || !nbi.trim() || !cargo.trim()) {
      showErrorToast("Campos Vazios", "Preencha todos os campos");
      return;
    }

    if (!user || !user.id) {
      showErrorToast("Usuário não autenticado", "Faça login novamente");
      navigate("/");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(
        "/registrarfuncionario",
        {
          nome_funcionario: nome,
          contacto_funcionario: contacto,
          cargo_funcionario: cargo,
          bi_funcionario: nbi,
          idAdm: user.id,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      if (response.data.sucesso) {
        showSuccessToast(
          response.data.titulo || "Sucesso",
          response.data.mensagem || "Funcionário registrado com sucesso",
        );
        setNome("");
        setContacto("");
        setNBI("");
        setCargo("");
      } else {
        showErrorToast(response.data.titulo || "Erro", response.data.mensagem);
      }
    } catch (error) {
      console.error("Erro ao registrar funcionário:", error);

      if (error.response && error.response.data) {
        showErrorToast(
          error.response.data.titulo || "Erro",
          error.response.data.mensagem,
        );
      } else {
        showErrorToast(
          "Erro de conexão",
          "Não foi possível conectar ao servidor",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (loadingAuth) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="row h-100">
        <div className="col-12 mb-4">
          <h3 className="text-primary">
            <IoMdAddCircleOutline className="me-2 mb-1" />
            Registrar Funcionários
          </h3>
        </div>
        <div className="col-12 col-lg-6 mb-3">
          <div className="shadow-sm rounded-3 p-4 bg-light border">
            <h5 className="text-primary mb-3">
              <IoMdAddCircleOutline className="me-2 mb-1" />
              Funcionário Responsável por Inscrições e Matrículas dos alunos
            </h5>
            <form className="row g-2" onSubmit={handleSubmitFuncionario}>
              <div className="col-12">
                <input
                  type="text"
                  placeholder="Nome Funcionário..."
                  className="form-control form-control-sm"
                  name="nomefuncionario"
                  onChange={(e) => setNome(e.target.value)}
                  value={nome}
                  disabled={loading}
                />
              </div>
              <div className="col-12">
                <input
                  type="text"
                  placeholder="Contacto..."
                  className="form-control form-control-sm"
                  name="contactofuncionario"
                  onChange={(e) => setContacto(e.target.value)}
                  value={contacto}
                  disabled={loading}
                />
              </div>
              <div className="col-12">
                <select
                  className="form-control form-control-sm"
                  name="cargo"
                  value={cargo}
                  onChange={(e) => setCargo(e.target.value)}
                  disabled={loading}
                >
                  <option value="">Selecione um Cargo</option>
                  <option value="Coordenador de Admissões e Matrículas">
                    Coordenador de Admissões e Matrículas
                  </option>
                  <option value="Tesoureiro">
                    Tesoureiro
                  </option>
                  <option value="Assistente Administrativo">
                    Assistente Administrativo
                  </option>
                  <option value="Oficial de Cartões e Identificações">
                    Oficial de Cartões e Identificações
                  </option>
                </select>
              </div>
              <div className="col-12">
                <input
                  type="text"
                  placeholder="Nº do B.I..."
                  className="form-control form-control-sm"
                  name="nbifuncionario"
                  onChange={(e) => setNBI(e.target.value)}
                  value={nbi}
                  disabled={loading}
                />
              </div>
              <div className="col-12">
                <button
                  type="submit"
                  className="btn btn-sm btn-primary w-100"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Processando...
                    </>
                  ) : (
                    "Registrar"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default FuncionáriosAdmRegistrer;
