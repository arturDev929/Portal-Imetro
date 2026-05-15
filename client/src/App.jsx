import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { lazy, Suspense } from "react";
import Layout from "./layouts/Layout";
import { useAuth } from "./hooks/global/useAuth";

const Cadastro = lazy(() => import("./pages/Cadastro"));
const Home = lazy(() => import("./pages/Home"));
const HomeAdm = lazy(() => import("./pagesAdm/HomeAdm"));
const FuncionariosAdmRegistrer = lazy(() => import("./pagesAdm/FuncionariosAdmRegistrer"));
const GestaoCursoAdm = lazy(() => import("./pagesAdm/GestaoCursoAdm"));
const GestaoProfessoresAdm = lazy(() => import("./pagesAdm/GestaoProfessoresAdm"));
const GestaoFuncionarioAdm = lazy(() => import("./pagesAdm/GestaoFuncionarioAdm"));
const HomeFuncionarioM = lazy(() => import("./pagesFuncionarioMatricula/Home"));
const LancarNotasM = lazy(() => import("./pagesFuncionarioMatricula/LancarNotas"));
const EstudentInscription = lazy(() => import("./pagesEstudentInscrition/index"));
const HomeTeacher = lazy(() => import("./pagesTeacher/Home"));
const PainelGeral = lazy(() => import("./pagesTeacher/PainelGeral"));
const TurmasTeacher = lazy(() => import("./pagesTeacher/TurmasTeacher"));
const GerenciarTurma = lazy(() => import("./pagesTeacher/GerenciarTurma"));
const EstudantesTurma = lazy(() => import("./pagesTeacher/EstudantesTurma"));
const NotasTurma = lazy(() => import("./pagesTeacher/NotasTurma"));
const PresencasTurma = lazy(() => import("./pagesTeacher/PresencasTurma"));
const RelatoriosTurma = lazy(() => import("./pagesTeacher/RelatoriosTurma"));
const AulasTurma = lazy(() => import("./pagesTeacher/AulasTurma"));

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

            {/* Rotas Administrador */}
            <Route path="/homeAdm" element={<RotaPrivada><HomeAdm /></RotaPrivada>} />
            <Route path="/funcionariosAdmRegistrer" element={<RotaPrivada><FuncionariosAdmRegistrer /></RotaPrivada>} />
            <Route path="/gestaoCursoAdm" element={<RotaPrivada><GestaoCursoAdm /></RotaPrivada>} />
            <Route path="/gestaoProfessorAdm" element={<RotaPrivada><GestaoProfessoresAdm /></RotaPrivada>} />
            <Route path="/gestaoFuncionarioAdm" element={<RotaPrivada><GestaoFuncionarioAdm /></RotaPrivada>} />

            {/* Rotas Funcionário Matrícula */}
            <Route path="/homefuncionarioM" element={<RotaPrivada><HomeFuncionarioM /></RotaPrivada>} />
            <Route path="/homefuncionario" element={<RotaPrivada><HomeFuncionarioM /></RotaPrivada>} />
            <Route path="/lancarNotasM" element={<RotaPrivada><LancarNotasM /></RotaPrivada>} />

            {/* Rotas Professor */}
            <Route path="/hometeacher" element={<RotaPrivada><HomeTeacher /></RotaPrivada>} />
            <Route path="/turmasTeacher" element={<RotaPrivada><TurmasTeacher /></RotaPrivada>} />
            <Route path="/painelGeralTeacher" element={<RotaPrivada><PainelGeral /></RotaPrivada>} />
            
            {/* Rotas de Gestão da Turma/Disciplina */}
            <Route path="/professor/gerenciar-turma/:idperiodo/:iddisciplina/:turma/:disciplina" element={<RotaPrivada><GerenciarTurma /></RotaPrivada>} />
            <Route path="/professor/gerenciar-turma/:idperiodo/:iddisciplina/estudantes" element={<RotaPrivada><EstudantesTurma /></RotaPrivada>} />
            <Route path="/professor/gerenciar-turma/:idperiodo/:iddisciplina/notas" element={<RotaPrivada><NotasTurma /></RotaPrivada>} />
            <Route path="/professor/gerenciar-turma/:idperiodo/:iddisciplina/presencas" element={<RotaPrivada><PresencasTurma /></RotaPrivada>} />
            <Route path="/professor/gerenciar-turma/:idperiodo/:iddisciplina/relatorios" element={<RotaPrivada><RelatoriosTurma /></RotaPrivada>} />
            <Route path="/professor/gerenciar-turma/:idperiodo/:iddisciplina/aulas" element={<RotaPrivada><AulasTurma /></RotaPrivada>} />
            <Route path="/professor/gerenciar-turma/:idperiodo/:iddisciplina/configuracoes" element={<RotaPrivada><GerenciarTurma /></RotaPrivada>} />

            {/* Rota Inscrição Estudante */}
            <Route path="/inscricao" element={<RotaPrivada><EstudentInscription /></RotaPrivada>} />
          </Routes>
        </Suspense>
      </Layout>
    </Router>
  );
}

export default App;