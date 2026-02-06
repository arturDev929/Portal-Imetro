import SidebarAdm from "../components/SidebarAdm";
import NavbarAdm from "../components/NavbarAdm";

function HomeAdm() {
    return (
        <div className="container-fluid">
            <SidebarAdm/>
            <div className="col-md-9 ms-md-auto col-lg-10 px-0">
                    <NavbarAdm/>
                    <main className="p-4">
                        <div className="row">
                            <div className="col-12 mb-4">
                                <h2>Dashboard</h2>
                                <p className="text-muted">Bem-vindo ao painel administrativo</p>
                            </div>

                            {/* Cards de Estatísticas */}
                            <div className="col-md-6 col-lg-3 mb-4">
                                <div className="card border-primary">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between">
                                            <div>
                                                <h5 className="card-title text-primary">1,234</h5>
                                                <p className="card-text text-muted">Visitas</p>
                                            </div>
                                            <div className="align-self-center">
                                                <i className="bi bi-eye-fill text-primary fs-4"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-6 col-lg-3 mb-4">
                                <div className="card border-success">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between">
                                            <div>
                                                <h5 className="card-title text-success">567</h5>
                                                <p className="card-text text-muted">Vendas</p>
                                            </div>
                                            <div className="align-self-center">
                                                <i className="bi bi-cart-check-fill text-success fs-4"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-6 col-lg-3 mb-4">
                                <div className="card border-warning">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between">
                                            <div>
                                                <h5 className="card-title text-warning">89</h5>
                                                <p className="card-text text-muted">Usuários</p>
                                            </div>
                                            <div className="align-self-center">
                                                <i className="bi bi-people-fill text-warning fs-4"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-6 col-lg-3 mb-4">
                                <div className="card border-info">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between">
                                            <div>
                                                <h5 className="card-title text-info">R$ 12,345</h5>
                                                <p className="card-text text-muted">Receita</p>
                                            </div>
                                            <div className="align-self-center">
                                                <i className="bi bi-currency-dollar text-info fs-4"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tabela */}
                            <div className="col-12 mb-4">
                                <div className="card">
                                    <div className="card-header bg-white">
                                        <h5 className="mb-0">Últimos Pedidos</h5>
                                    </div>
                                    <div className="card-body">
                                        <div className="table-responsive">
                                            <table className="table table-hover">
                                                <thead>
                                                    <tr>
                                                        <th>ID</th>
                                                        <th>Cliente</th>
                                                        <th>Data</th>
                                                        <th>Valor</th>
                                                        <th>Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td>#001</td>
                                                        <td>Maria Santos</td>
                                                        <td>10/06/2023</td>
                                                        <td>R$ 150,00</td>
                                                        <td><span className="badge bg-success">Pago</span></td>
                                                    </tr>
                                                    <tr>
                                                        <td>#002</td>
                                                        <td>João Pereira</td>
                                                        <td>09/06/2023</td>
                                                        <td>R$ 89,90</td>
                                                        <td><span className="badge bg-warning">Pendente</span></td>
                                                    </tr>
                                                    <tr>
                                                        <td>#003</td>
                                                        <td>Ana Costa</td>
                                                        <td>08/06/2023</td>
                                                        <td>R$ 250,00</td>
                                                        <td><span className="badge bg-danger">Cancelado</span></td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Outras Informações */}
                            <div className="col-lg-6 mb-4">
                                <div className="card">
                                    <div className="card-header bg-white">
                                        <h5 className="mb-0">Atividade Recente</h5>
                                    </div>
                                    <div className="card-body">
                                        <ul className="list-group list-group-flush">
                                            <li className="list-group-item d-flex justify-content-between align-items-center">
                                                <div>
                                                    <i className="bi bi-person-plus text-success me-2"></i>
                                                    Novo usuário cadastrado
                                                </div>
                                                <small className="text-muted">2 horas atrás</small>
                                            </li>
                                            <li className="list-group-item d-flex justify-content-between align-items-center">
                                                <div>
                                                    <i className="bi bi-cart-check text-primary me-2"></i>
                                                    Pedido #001 foi pago
                                                </div>
                                                <small className="text-muted">4 horas atrás</small>
                                            </li>
                                            <li className="list-group-item d-flex justify-content-between align-items-center">
                                                <div>
                                                    <i className="bi bi-chat-left-text text-info me-2"></i>
                                                    Novo comentário no blog
                                                </div>
                                                <small className="text-muted">6 horas atrás</small>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-6 mb-4">
                                <div className="card">
                                    <div className="card-header bg-white">
                                        <h5 className="mb-0">Informações do Sistema</h5>
                                    </div>
                                    <div className="card-body">
                                        <div className="mb-3">
                                            <label className="form-label">Uso de Disco</label>
                                            <div className="progress">
                                                <div className="progress-bar" role="progressbar" style={{width: '80%'}}>80%</div>
                                            </div>
                                        </div> 
                                        <div className="mb-3">
                                            <label className="form-label">Uso de Memória</label>
                                            <div className="progress">
                                                <div className="progress-bar bg-success" role="progressbar" style={{width: '75%'}}>75%</div>
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Uso de CPU</label>
                                            <div className="progress">
                                                <div className="progress-bar bg-warning" role="progressbar" style={{width: '50%'}}>50%</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
            </div>
        </div>
    );
}

export default HomeAdm;