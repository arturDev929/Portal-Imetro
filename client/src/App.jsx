import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { lazy, Suspense } from "react";
import Layout from "./layouts/Layout";
import { useAuth } from "./hooks/global/useAuth";
// import { EstudentIsncription } from "./pagesEstudentInscrition";

const Cadastro = lazy(() => import("./pages/Cadastro"));
const Home = lazy(() => import("./pages/Home"));
const HomeAdm = lazy(() => import("./pagesAdm/HomeAdm"));
const FuncionáriosAdmRegistrer = lazy(
  () => import("./pagesAdm/FuncionariosAdmRegistrer"),
);
const GestaoCursoAdm = lazy(() => import("./pagesAdm/GestaoCursoAdm"));
const GestaoProfessoresAdm = lazy(
  () => import("./pagesAdm/GestaoProfessoresAdm"),
);
const GestaoFuncionarioAdm = lazy(
  () => import("./pagesAdm/GestaoFuncionarioAdm"),
);
const HomeFuncionarioM = lazy(() => import("./pagesFuncionarioMatricula/Home"));
const HomeTeacher = lazy(() => import("./pagesTeacher/Home"));
const InscriptionPage = lazy(() => import("./pagesEstudentInscrition"));

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
            <Route exact path="/" element={<Home />} />
            <Route exact path="/cadastro" element={<Cadastro />} />

            <Route path="/inscription" element={<InscriptionPage />} />

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
                  <FuncionáriosAdmRegistrer />
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
