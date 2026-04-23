import Sidebar from "../components/global/Sidebar";
import Navbar from "../components/global/Navbar";

const FuncionarioLayout = ({ children }) => {
  return (
    <div className="container-fluid p-0 m-0">
      <Sidebar />
      <div className="col-md-9 ms-md-auto col-lg-10 px-0">
        <Navbar />
        <main className="p-4" style={{ backgroundColor: 'var(--cinza-claro)' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default FuncionarioLayout;