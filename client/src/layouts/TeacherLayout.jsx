import SidebarTeacher from "../components/global/SidebarTeacher";
import NavbarTeacher from "../components/global/NavbarTeacher";

const TeacherLayout = ({ children }) => {
  return (
    <div className="container-fluid p-0 m-0">
      <SidebarTeacher />
      <div className="col-md-9 ms-md-auto col-lg-10 px-0">
        <NavbarTeacher />
        <main className="p-4" style={{ backgroundColor: 'var(--cinza-claro)' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default TeacherLayout;