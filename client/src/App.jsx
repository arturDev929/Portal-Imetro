import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { lazy, Suspense } from "react";
import Layout from "./layouts/Layout";
import { useAuth } from "./hooks/global/useAuth";
import LancarNotasM from "./pagesFuncionarioMatricula/LancarNotas";
import EstudentIsncription from "./pagesEstudentInscrition/index.jsx";
import TurmasTeacher from "./pagesTeacher/TurmasTeacher.jsx";
import AvaliacoesNotas from "./pagesTeacher/AvaliacoesNotas.jsx";
import ChatDelegado from "./pagesTeacher/ChatDelgado.jsx";
import ConteudosTopicos from "./pagesTeacher/ConteudosTopicos.jsx";
import Horarios from "./pagesTeacher/Horarios.jsx";
import Configuracoes from "./pagesTeacher/Configuracoes.jsx";
import Seguranca from "./pagesTeacher/Seguranca.jsx";
import MinhaAgenda from "./pagesTeacher/MinhaAgenda.jsx";

const Cadastro = lazy(() => import("./pages/Cadastro"));
const Home = lazy(() => import("./pages/Home"));
const HomeAdm = lazy(() => import("./pagesAdm/HomeAdm"));
const FuncionariosAdmRegistrer = lazy(
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
const PainelGeral = lazy(() => import("./pagesTeacher/PainelGeral"));

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
            {/* <Route path="/definicoesTeacher" element={<RotaPrivada><DefinicoesTeacher/></RotaPrivada>}/>
            <Route path="/segurancaTeacher" element={<RotaPrivada><SegurancaTeacher/></RotaPrivada>}/> */}

            <Route path="/inscricao" element={<RotaPrivada><EstudentIsncription /></RotaPrivada>} />
            <Route path="/turmasTeacher" element={<RotaPrivada><TurmasTeacher /></RotaPrivada>} />
            <Route path="/painelGeralTeacher" element={<RotaPrivada><PainelGeral /></RotaPrivada>} />
            <Route path="/avaliacoesNotas" element ={<RotaPrivada><AvaliacoesNotas /></RotaPrivada>} />
            <Route path="/chat" element={<RotaPrivada><ChatDelegado /></RotaPrivada>} />
            <Route path="/topicos" element={<RotaPrivada><ConteudosTopicos /></RotaPrivada>} />
            <Route path="/horario" element={<RotaPrivada><Horarios /></RotaPrivada>} />
            <Route path="/agenda" element={<RotaPrivada><MinhaAgenda /></RotaPrivada>} />
            <Route path="/configura" element={<RotaPrivada><Configuracoes /></RotaPrivada>} />
            <Route path="/segura" element={<RotaPrivada><Seguranca /></RotaPrivada>} />
    
          </Routes>
        </Suspense>
      </Layout>
    </Router>
  );
}

export default App;
