import SidebarAdm from "../components/global/SidebarAdm";
import NavbarAdm from "../components/global/NavbarAdm";

const AdminLayout = ({ children }) => {
  return (
    <div className="container-fluid p-0 m-0">
      <SidebarAdm />
      <div className="col-md-9 ms-md-auto col-lg-10 px-0">
        <NavbarAdm />
        <main className="p-4" style={{ backgroundColor: 'var(--cinza-claro)' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;