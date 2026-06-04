import AdminLayout from "../layouts/AdminLayout";

function HomeAdm() {
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