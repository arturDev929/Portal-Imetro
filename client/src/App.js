import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cadastro from "./pages/Cadastro";
import Home from "./pages/Home";
import HomeAdm from "./pagesAdm/HomeAdm";
import FuncionáriosAdmRegistrer from "./pagesAdm/FuncionariosAdmRegistrer";
import ProfessoresAdmRegistrer from "./pagesAdm/ProfessoresAdmRegistrer";
import CursosAdmRegistrer from "./pagesAdm/CursosAdmRegistrer";
import GestaoCursoAdm from "./pagesAdm/GestaoCursoAdm";
import GestaoProfessoresAdm from "./pagesAdm/GestaoProfessoresAdm";

const RotaPrivada = ({ children }) => {
  const isLogado = localStorage.getItem("usuarioLogado");
  return isLogado ? children : <Navigate to="/" replace />;
};

function App() {
  return (
    <Router>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        style={{
          marginTop: '70px'
        }}
      />
      <Routes>
        <Route exact path="/" element={<Home/>}/>
        <Route exact path="/cadastro" element={<Cadastro/>}/>
        
        <Route path="/homeAdm" element={<RotaPrivada><HomeAdm/></RotaPrivada>}/>
        <Route path="/funcionariosAdmRegistrer" element={<RotaPrivada><FuncionáriosAdmRegistrer/></RotaPrivada>}/>
        <Route path="/professoresAdmRegistrer" element={<RotaPrivada><ProfessoresAdmRegistrer/></RotaPrivada>}/>
        <Route path="/cursosAdmRegistrer" element={<RotaPrivada><CursosAdmRegistrer/></RotaPrivada>}/>
        <Route path="/gestaoCursoAdm" element={<RotaPrivada><GestaoCursoAdm/></RotaPrivada>}/>
        <Route path="/gestaoProfessorAdm" element={<RotaPrivada><GestaoProfessoresAdm/></RotaPrivada>}/>
      </Routes>
    </Router>
  );
}

export default App;