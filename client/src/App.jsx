import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import Layout from "./layouts/Layout";
import { useAuth } from "./hooks/global/useAuth";
import LancarNotasM from "./pagesFuncionarioMatricula/LancarNotas";
import EstudentIsncription from "./pagesEstudentInscrition/index.jsx";

const Cadastro = lazy(() => import("./pages/Cadastro"));
const Home = lazy(() => import("./pages/Home"));
const HomeAdm = lazy(() => import("./pagesAdm/HomeAdm"));
const FuncionariosAdmRegistrer = lazy(() => import("./pagesAdm/FuncionariosAdmRegistrer"));
const GestaoCursoAdm = lazy(() => import("./pagesAdm/GestaoCursoAdm"));
const GestaoProfessoresAdm = lazy(() => import("./pagesAdm/GestaoProfessoresAdm"));
const GestaoFuncionarioAdm = lazy(() => import("./pagesAdm/GestaoFuncionarioAdm"));
const HomeFuncionarioM = lazy(() => import("./pagesFuncionarioMatricula/Home"));
const HomeTeacher = lazy(() => import("./pagesTeacher/Home"));

const RotaPrivada = ({ children }) => {
  const { isLoggedIn } = useAuth();
  return isLoggedIn() ? children : <Navigate to="/" replace />;
};

function App() {
  return (
    <Router>
      <Layout>
        <Suspense
          fallback={
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                fontSize: "20px",
                color: "var(--azul-escuro)",
              }}
            >
              Carregando...
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/inscricao" element={<EstudentIsncription />} />

            <Route
              path="/homeAdm"
              element={
                <RotaPrivada>
                  <HomeAdm />
                </RotaPrivada>
              }
            />
            <Route
              path="/funcionariosAdmRegistrer"
              element={
                <RotaPrivada>
                  <FuncionariosAdmRegistrer />
                </RotaPrivada>
              }
            />
            <Route
              path="/gestaoCursoAdm"
              element={
                <RotaPrivada>
                  <GestaoCursoAdm />
                </RotaPrivada>
              }
            />
            <Route
              path="/gestaoProfessorAdm"
              element={
                <RotaPrivada>
                  <GestaoProfessoresAdm />
                </RotaPrivada>
              }
            />
            <Route
              path="/gestaoFuncionarioAdm"
              element={
                <RotaPrivada>
                  <GestaoFuncionarioAdm />
                </RotaPrivada>
              }
            />
            <Route
              path="/homefuncionarioM"
              element={
                <RotaPrivada>
                  <HomeFuncionarioM />
                </RotaPrivada>
              }
            />
            <Route
              path="/homefuncionario"
              element={
                <RotaPrivada>
                  <HomeFuncionarioM />
                </RotaPrivada>
              }
            />
            <Route
              path="/lancarNotasM"
              element={
                <RotaPrivada>
                  <LancarNotasM />
                </RotaPrivada>
              }
            />
            <Route
              path="/hometeacher"
              element={
                <RotaPrivada>
                  <HomeTeacher />
                </RotaPrivada>
              }
            />
          </Routes>
        </Suspense>
      </Layout>
    </Router>
  );
}

export default App;
