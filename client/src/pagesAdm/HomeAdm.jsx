import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import { showErrorToast } from "../components/global/CustomToast";

function HomeAdm() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const usuarioLogado = localStorage.getItem("usuarioLogado");

        if (!token || !usuarioLogado) {
            showErrorToast("Acesso negado", "Faça login para acessar esta página.");
            navigate("/");
            return;
        }

        try {
            const usuario = JSON.parse(usuarioLogado);
            if (usuario.tipoUsuario !== "adm") {
                showErrorToast("Acesso negado", "Você não tem permissão para acessar esta página.");
                navigate("/");
                return;
            }
        } catch (error) {
            localStorage.removeItem("token");
            localStorage.removeItem("usuarioLogado");
            navigate("/");
            return;
        }

        setLoading(false);
    }, [navigate]);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-only">Carregando...</span>
                </div>
            </div>
        );
    }

    return (
        <AdminLayout>
            <div className="row">
                <div className="col-12 mb-4">
                    <h2>Painel Geral do Administrador</h2>
                    <p className="text-muted">Bem-vindo ao painel administrativo</p>
                </div>
            </div>
        </AdminLayout>
    );
}

export default HomeAdm;