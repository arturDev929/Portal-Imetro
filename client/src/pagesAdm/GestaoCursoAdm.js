import { useState, useEffect } from "react";
import 'react-toastify/dist/ReactToastify.css';
import SidebarAdm from "../components/SidebarAdm";
import NavbarAdm from "../components/NavbarAdm";
import { 
  IoMdStats,
  IoMdBusiness,

  IoMdCheckmarkCircle,
  IoMdGrid,
  IoMdSchool,
  IoMdBook
} from "react-icons/io";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';
import axios from 'axios';
import { showErrorToast } from '../components/CustomToast';
import Departamento from "../components/DepartamentosEdit";
import CursosEdit from "../components/CursosEdit";
import DisciplinasEdit from "../components/DisciplinasEdit";
import TurmaEdit from "../components/TurmaEdit";

const API_BASE_URL = 'http://localhost:8080';

// Componente de guias/abas
const TabButton = ({ active, onClick, icon: Icon, label }) => (
  <button
    className={`btn ${active ? 'btn-primary' : 'btn-outline-primary'} me-2 mb-2`}
    onClick={onClick}
  >
    <Icon className="me-1" /> {label}
  </button>
);

// Componente para a seção Geral (Dashboard)
const GeralSection = ({ 
  departments, 
  courses, 
  disciplines, 
  departmentData, 
  yearsData, 
  disciplinesByYear, 
  pieData 
}) => {
  const totalDepartments = departments.length;
  const totalCourses = courses.length;
  const totalDisciplines = disciplines.length;
  const averageYears = courses.length > 0 
    ? courses.reduce((acc, course) => acc + course.years, 0) / courses.length 
    : 0;

  return (
    <>
      <div className="row mb-4">
        <div className="col-12">
          <h3 className="text-primary">
            <IoMdGrid className="me-2 mb-2"/>
            Dashboard Geral
          </h3>
          <p className="text-muted">Visão geral de todos os departamentos, cursos e disciplinas</p>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card border-primary shadow-sm">
            <div className="card-body text-center">
              <IoMdBusiness className="display-4 text-primary mb-2"/>
              <h5 className="card-title text-primary">Departamentos</h5>
              <h2 className="display-5 fw-bold">{totalDepartments}</h2>
              <p className="card-text text-muted">Áreas registradas</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card border-success shadow-sm">
            <div className="card-body text-center">
              <IoMdSchool className="display-4 text-success mb-2"/>
              <h5 className="card-title text-success">Cursos</h5>
              <h2 className="display-5 fw-bold">{totalCourses}</h2>
              <p className="card-text text-muted">Cursos ativos</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card border-warning shadow-sm">
            <div className="card-body text-center">
              <IoMdBook className="display-4 text-warning mb-2"/>
              <h5 className="card-title text-warning">Disciplinas</h5>
              <h2 className="display-5 fw-bold">{totalDisciplines}</h2>
              <p className="card-text text-muted">Total de disciplinas</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card border-info shadow-sm">
            <div className="card-body text-center">
              <IoMdCheckmarkCircle className="display-4 text-info mb-2"/>
              <h5 className="card-title text-info">Duração Média</h5>
              <h2 className="display-5 fw-bold">{averageYears.toFixed(1)}</h2>
              <p className="card-text text-muted">Anos por curso</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos - Mantendo apenas 3 gráficos */}
      <div className="row mb-4">
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-gradient-primary text-white">
              <h5 className="mb-0">
                <IoMdStats className="me-2"/>Departamentos
              </h5>
            </div>
            <div className="card-body">
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={departmentData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="Cursos" 
                      fill="#8884d8" 
                      radius={[8, 8, 0, 0]}
                      animationDuration={1500}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-gradient-success text-white">
              <h5 className="mb-0">
                <IoMdBusiness className="me-2"/> Distribuição por Departamento
              </h5>
            </div>
            <div className="card-body">
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={90}
                      fill="#8884d8"
                      dataKey="value"
                      animationDuration={1500}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-12 mb-4">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-gradient-warning text-white">
              <h5 className="mb-0">
                <IoMdStats className="me-2"/> Anos Curriculares por Licenciaturas
              </h5>
            </div>
            <div className="card-body">
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={yearsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="Anos" 
                      fill="#82ca9d" 
                      radius={[8, 8, 0, 0]}
                      animationDuration={1500}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* O gráfico "Disciplinas por Ano Curricular" foi removido aqui */}
        
      </div>
    </>
  );
};

function GestaoCursoAdm() {
  const [activeTab, setActiveTab] = useState('geral'); // 'geral', 'departamentos', 'licenciaturas', 'disciplinas'
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [disciplines, setDisciplines] = useState([]);
  const [loading, setLoading] = useState(true);

  // Função para buscar dados do backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Buscar todos os dados separadamente
        const [
          categoriasResponse, 
          cursosResponse, 
          anosResponse, 
          disciplinasResponse, 
          semestresResponse
        ] = await Promise.all([
          axios.get(`${API_BASE_URL}/get/categoriaCurso`),
          axios.get(`${API_BASE_URL}/get/Cursos`),
          axios.get(`${API_BASE_URL}/get/anosCurriculares`),
          axios.get(`${API_BASE_URL}/get/Disciplinas`),
          axios.get(`${API_BASE_URL}/get/semestres`)
        ]);
        
        const categorias = categoriasResponse.data;
        const cursos = cursosResponse.data;
        const anos = anosResponse.data;
        const disciplinas = disciplinasResponse.data;
        const semestres = semestresResponse.data;
        
        // Processar departamentos (categorias)
        const processedDepartments = categorias.map(cat => ({
          id: cat.idcategoriacurso,
          name: cat.categoriacurso,
          color: getDepartmentColor(cat.idcategoriacurso),
          description: `Departamento de ${cat.categoriacurso}`,
          courseCount: cursos.filter(c => c.idcategoriacurso === cat.idcategoriacurso).length
        }));
        
        // Processar cursos
        const processedCourses = cursos.map(curso => {
          // Encontrar os anos deste curso
          const anosCurso = anos.filter(a => a.idcurso === curso.idcurso);
          // Encontrar disciplinas deste curso via semestres
          const disciplinasCurso = semestres
            .filter(s => s.idcurso === curso.idcurso)
            .map(s => {
              const disc = disciplinas.find(d => d.iddisciplina === s.iddisciplina);
              return disc ? {
                id: disc.iddisciplina,
                name: disc.disciplina,
                semestre: s.semestre,
                anoCurricular: s.idanocurricular || Math.ceil(s.semestre / 2)
              } : null;
            })
            .filter(Boolean);
            
          return {
            id: curso.idcurso,
            name: curso.curso,
            departmentId: curso.idcategoriacurso,
            department: categorias.find(c => c.idcategoriacurso === curso.idcategoriacurso)?.categoriacurso || '',
            years: anosCurso.length > 0 ? Math.max(...anosCurso.map(a => a.anocurricular)) : 4,
            students: 0,
            disciplines: disciplinasCurso
          };
        });
        
        // Processar disciplinas
        const processedDisciplines = disciplinas.map(disc => {
          // Buscar todos os semestres que contêm esta disciplina
          const semestresDaDisciplina = semestres.filter(s => s.iddisciplina === disc.iddisciplina);
          
          if (semestresDaDisciplina.length === 0) {
            return {
              id: disc.iddisciplina,
              name: disc.disciplina,
              course: '',
              courseId: null,
              year: 1, // Valor padrão
              semester: 1,
              credits: 6,
              students: 0
            };
          }
          
          // Para simplificar, pegue o primeiro semestre encontrado
          const semestreDisc = semestresDaDisciplina[0];
          const cursoDisc = cursos.find(c => c.idcurso === semestreDisc.idcurso);
          
          // A API retorna 'idanocurricular'
          let year;
          
          if (semestreDisc.idanocurricular) {
            // Se tem idanocurricular, usa ele
            year = semestreDisc.idanocurricular;
          } else if (semestreDisc.semestre) {
            // Se não tem idanocurricular, calcula baseado no semestre
            year = Math.ceil(semestreDisc.semestre / 2);
          } else {
            // Valor padrão
            year = 1;
          }
          
          // Garantir que year seja um número entre 1 e 6
          year = Math.max(1, Math.min(6, Number(year)));
          
          return {
            id: disc.iddisciplina,
            name: disc.disciplina,
            course: cursoDisc?.curso || '',
            courseId: cursoDisc?.idcurso || null,
            year: year,
            semester: semestreDisc.semestre || 1,
            credits: 6,
            students: 0
          };
        });
        
        setDepartments(processedDepartments);
        setCourses(processedCourses);
        setDisciplines(processedDisciplines);
        
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        showErrorToast("Erro ao Carregar", "Não foi possível carregar os dados dos cursos.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Função auxiliar para atribuir cores aos departamentos
  const getDepartmentColor = (id) => {
    const colors = [
      "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8",
      "#FF6B6B", "#FF6BCB", "#17C3B2", "#A463F2", "#36D7B7"
    ];
    return colors[id % colors.length];
  };

  // Dados para gráficos
  const departmentData = departments.map(dept => ({
    name: dept.name,
    Cursos: dept.courseCount,
    Cor: dept.color
  }));

  const yearsData = courses.map(course => ({
    name: course.name,
    Anos: course.years,
    Estudantes: course.students
  }));

  // Nota: A função processDisciplinesByYear ainda existe mas não é mais usada
  const processDisciplinesByYear = () => {
    if (!disciplines || disciplines.length === 0) {
      return [];
    }
    
    const yearMap = {};
    
    for (let i = 1; i <= 6; i++) {
      yearMap[i] = 0;
    }
    
    disciplines.forEach(disc => {
      if (disc.year && disc.year >= 1 && disc.year <= 6) {
        const yearNum = Number(disc.year);
        if (!isNaN(yearNum)) {
          yearMap[yearNum] = (yearMap[yearNum] || 0) + 1;
        }
      }
    });
    
    return Object.entries(yearMap)
      .map(([year, count]) => ({
        ano: `Ano ${year}`,
        disciplinas: count
      }))
      .filter(item => item.disciplinas > 0);
  };

  // Nota: disciplinesByYear não é mais usado mas mantido para compatibilidade
  const disciplinesByYear = processDisciplinesByYear();
  
  const pieData = departments.map(dept => ({
    name: dept.name,
    value: dept.courseCount,
    color: dept.color
  }));

  if (loading) {
    return (
      <div className="container-fluid">
        <SidebarAdm/>
        <div className="col-md-9 ms-md-auto col-lg-10 px-0">
          <NavbarAdm/>
          <main className="p-4">
            <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Carregando...</span>
              </div>
              <span className="ms-3">Carregando dados dos cursos...</span>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'geral':
        return (
          <GeralSection 
            departments={departments}
            courses={courses}
            disciplines={disciplines}
            departmentData={departmentData}
            yearsData={yearsData}
            disciplinesByYear={disciplinesByYear}
            pieData={pieData}
          />
        );
      case 'departamentos':
        return <Departamento />;
      case 'licenciaturas':
        return <CursosEdit />;
      case 'disciplinas':
        return <DisciplinasEdit />;
      case 'turmas':
        return <TurmaEdit />;
      default:
        return <GeralSection 
          departments={departments}
          courses={courses}
          disciplines={disciplines}
          departmentData={departmentData}
          yearsData={yearsData}
          disciplinesByYear={disciplinesByYear}
          pieData={pieData}
        />;
    }
  };

  return (
    <div className="container-fluid">
      <SidebarAdm/>
      <div className="col-md-9 ms-md-auto col-lg-10 px-0">
        <NavbarAdm/>
        <main className="p-4">
          <div className="row mb-4">
            <div className="col-12">
              <h3 className="text-primary">
                <IoMdStats className="me-2 mb-2"/>
                Gestão de Cursos
              </h3>
            </div>
          </div>

          {/* Barra de Navegação por Tabs */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="d-flex flex-wrap">
                <TabButton
                  active={activeTab === 'geral'}
                  onClick={() => setActiveTab('geral')}
                  icon={IoMdGrid}
                  label="Dashboard Geral"
                />
                <TabButton
                  active={activeTab === 'departamentos'}
                  onClick={() => setActiveTab('departamentos')}
                  icon={IoMdBusiness}
                  label="Departamentos"
                />
                <TabButton
                  active={activeTab === 'licenciaturas'}
                  onClick={() => setActiveTab('licenciaturas')}
                  icon={IoMdSchool}
                  label="Cursos"
                />
                <TabButton
                  active={activeTab === 'disciplinas'}
                  onClick={() => setActiveTab('disciplinas')}
                  icon={IoMdBook}
                  label="Disciplinas"
                />
                <TabButton
                  active={activeTab === 'turmas'}
                  onClick={() => setActiveTab('turmas')}
                  icon={IoMdBook}
                  label="Turmas"
                />
              </div>
            </div>
          </div>

          {/* Conteúdo Dinâmico */}
          {renderContent()}

        </main>
      </div>
    </div>
  );
}

export default GestaoCursoAdm;