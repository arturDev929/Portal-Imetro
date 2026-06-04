# Documentação do Projeto Portal-Imetro

## 📊 Visão Geral do Projeto

O **Portal-Imetro** é um **sistema abrangente de gestão acadêmica** para o **Instituto Médio de Tecnologias (IMETRO)** em Angola. Ele oferece soluções completas para gerenciar cursos, professores, estudantes, funcionários e operações administrativas com controle de acesso baseado em funções e painéis em tempo real.

---

## 🏗️ **Visão Geral da Arquitetura**

```
Portal-Imetro (Aplicação Full-Stack)
├── Cliente (React/Vite - Porta 3000)
├── Servidor (Node.js/Express - Porta 8080)
└── Banco de Dados (MySQL 8.0)
```

---

## 🎨 **Frontend: React com Vite**

### **Tecnologias**
- **React 19.2.3** - Framework de UI
- **Vite** - Ferramenta de build e servidor de desenvolvimento (HMR ultrarrápido)
- **React Router DOM v7.12.0** - Roteamento do lado cliente com carregamento preguiçoso
- **Bootstrap 5.3.8** - Framework CSS
- **Recharts 3.7.0** - Gráficos interativos e visualização de dados
- **Axios 1.13.4** - Cliente HTTP
- **React Toastify 11.0.5** - Notificações toast
- **React Icons 5.5.0** - Biblioteca de ícones
- **React PDF / PDF.js** - Manipulação de PDF
- **Passport.js** - Autenticação no backend

### **Estrutura de Arquivos**
```
client/src/
├── components/
│   ├── global/                 # Componentes compartilhados
│   └── index.js               # Exportações de componentes
├── constants/
│   ├── api.js                 # Configuração da URL da API
│   └── index.js               # Exportações de constantes
├── hooks/
│   ├── global/
│   │   └── useAuth.js         # Hook de contexto de auth
│   └── index.js
├── layouts/
│   ├── AdminLayout.jsx        # Layout do painel admin
│   ├── FuncionarioLayout.jsx  # Layout de funcionário
│   └── Layout.jsx             # Wrapper de layout principal
├── pages/
│   ├── Cadastro.jsx           # Cadastro de estudante
│   ├── Home.jsx               # Página inicial pública
│   └── *.module.css           # Estilos com escopo de módulo
├── pagesAdm/
│   ├── HomeAdm.jsx            # Painel admin
│   ├── FuncionariosAdmRegistrer.jsx    # Gestão de funcionários
│   ├── GestaoCursoAdm.jsx             # Gestão de cursos
│   ├── GestaoProfessoresAdm.jsx       # Gestão de professores
│   └── GestaoFuncionarioAdm.jsx       # Gestão de funcionários
├── pagesFuncionarioMatricula/ # Páginas de matrícula de funcionário
├── pagesStudentsInscricao/    # Páginas de inscrição de estudantes
├── img/
│   ├── estudantes/            # Fotos/documentos de estudantes
│   └── professores/           # Perfis de professores
├── service/                   # Funções de serviço da API
├── styles/                    # Estilos globais
├── types/                     # Tipos TypeScript (se aplicável)
├── App.jsx                    # Roteador principal da app
├── index.jsx                  # Ponto de entrada do React
└── index.css                  # CSS global
```

### **Páginas e Rotas Principais**
| Rota | Componente | Acesso | Propósito |
|------|------------|--------|-----------|
| `/` | Home | Público | Página inicial |
| `/cadastro` | Cadastro | Público | Cadastro de estudante |
| `/homeAdm` | HomeAdm | Apenas Admin | Painel admin com análises |
| `/funcionariosAdmRegistrer` | FuncionariosAdmRegistrer | Apenas Admin | Registrar/gerenciar funcionários |
| `/gestaoCursoAdm` | GestaoCursoAdm | Apenas Admin | Operações CRUD de cursos |
| `/gestaoProfessorAdm` | GestaoProfessoresAdm | Apenas Admin | Gestão de professores |
| `/gestaoFuncionarioAdm` | GestaoFuncionarioAdm | Apenas Admin | Gestão de funcionários |
| `/homefuncionarioM` | HomeFuncionarioM | Funcionário | Painel de funcionário |

### **Funcionalidades do Frontend**
- ✅ **Rotas Protegidas Baseadas em Funções** - Usando wrapper de componente `RotaPrivada`
- ✅ **Carregamento Preguiçoso** - Páginas carregadas sob demanda com fallback Suspense
- ✅ **Painéis Interativos** - Análises usando gráficos Recharts
- ✅ **Manipulação de Formulários** - Modais e formulários Bootstrap
- ✅ **Uploads de Arquivos** - Documentos de estudantes e fotos de professores
- ✅ **Verificação de Email** - Integração com códigos de verificação
- ✅ **Design Responsivo** - Sistema de grid Bootstrap

---

## 🚀 **Backend: Node.js com Express**

### **Tecnologias**
- **Node.js** - Ambiente de execução
- **Express.js 5.2.1** - Framework web
- **MySQL2 3.16.1** - Driver de banco de dados
- **bcryptjs 3.0.3** - Hashing de senhas
- **Passport.js 0.7.0** - Autenticação
- **Multer 2.0.2** - Manipulação de uploads de arquivos
- **Nodemailer 8.0.2** - Envio de emails (SMTP Gmail)
- **CORS 2.8.6** - Suporte cross-origin
- **dotenv 17.2.3** - Variáveis de ambiente
- **Nodemon 3.1.11** - Recarregamento automático em desenvolvimento

### **Arquitetura do Servidor**
```
server/
├── index.js                    # Entrada principal do servidor
├── infra/
│   └── conexao.js             # Configuração de conexão MySQL
└── routes/
    ├── RouteLogin.js          # POST /login
    ├── RouterGet.js           # Endpoints GET (10+)
    ├── RouterPost.js          # Endpoints POST (12+)
    ├── RouterPut.js           # Endpoints PUT (13+)
    └── RouterDelete.js        # Endpoints DELETE (8)
```

### **Configuração do Servidor**
```javascript
// Porta: 8080
// Origens CORS:
//   - http://localhost:3000
//   - http://localhost:3001
//   - https://portal-imetro.vercel.app
//   - IP local dinâmico (192.168.x.x)
//   - Limite de tamanho de arquivo: 50MB
```

### **Resumo dos Endpoints da API**

#### **Autenticação** (RouteLogin.js)
```
POST /login - Autenticação de usuário
```

#### **Endpoints GET** (RouterGet.js)
```
/get/totalcategoriacurso       - Contar categorias de curso
/get/totallicenciaturas        - Contar cursos
/get/totaldisciplina           - Contar disciplinas
/get/dadosGraficosCategoria    - Dados de gráfico de distribuição de cursos
/get/totalDisciplinasPorCurso  - Disciplinas por curso
/get/categoriaCurso            - Listar todas as categorias de curso
/get/getcursos                 - Listar cursos com categorias
/get/Cursos                    - Lista alternativa de cursos
/get/anosCurriculares          - Listar anos acadêmicos
```

#### **Endpoints POST** (RouterPost.js)
```
/post/enviarCodigoVerificacao                    - Enviar código de verificação
/post/verificarCodigoECompletarCadastro         - Verificar código e completar cadastro
/post/registrercategoria                         - Criar categoria de curso
/post/registrarcurso                             - Criar curso
/post/registrarAnoCurricular                     - Criar ano acadêmico
/post/registrardisciplina                        - Criar disciplina
/post/registrarDisciplinaCurso                   - Vincular disciplina a curso
/post/registrarprofessor                         - Registrar professor
/post/registrerDisciplinaProfessor               - Vincular professor a disciplina
/post/vincularProfessor                          - Atribuir professor a curso
/post/registrarPeriodo                           - Criar período (manhã/tarde)
/post/registrarfuncionario                       - Registrar funcionário
```

#### **Endpoints PUT** (RouterPut.js)
```
/put/categoriaCurso/:id                         - Atualizar categoria
/put/Curso/:id                                   - Atualizar curso
/put/disciplina/:id                              - Atualizar disciplina
/put/atulizarprofessor/:id                       - Atualizar professor
/put/turma/:id                                   - Atualizar turma/sala
/put/professor/desativar/:id                     - Desativar professor
/put/professor/ativar/:id                        - Ativar professor
/put/funcionario/:id                             - Atualizar funcionário
/put/funcionario/senha/:id                       - Alterar senha de funcionário
/put/funcionario/desativar/:id                   - Desativar funcionário
/put/funcionario/ativar/:id                      - Ativar funcionário
/put/estudanteInscritoAceitar/:id                - Aprovar inscrição de estudante
/put/estudanteInscritoRecusar/:id                - Rejeitar inscrição de estudante
```

#### **Endpoints DELETE** (RouterDelete.js)
```
/delete/categoriaCurso/:id                       - Deletar categoria
/delete/curso/:id                                - Deletar curso
/delete/anocurricular/:id                        - Deletar ano acadêmico
/delete/disciplinaSemestre/:idsemestre           - Remover disciplina do semestre
/delete/disciplina/:id                           - Deletar disciplina
/delete/desvincularProfessor/:iddisciplina/:idprofessor - Desvincular professor
/delete/turma/:id                                - Deletar turma
/delete/funcionario/permanent/:id                - Deletar funcionário permanentemente
```

### **Funcionalidades Principais do Backend**
- ✅ **Sistema de Verificação de Email** - Códigos de 6 dígitos com expiração de 10 minutos
- ✅ **Hashing de Senhas Bcrypt** - Armazenamento seguro de credenciais
- ✅ **Gerenciamento de Uploads de Arquivos** - Documentos de estudantes e fotos de professores
- ✅ **Configuração CORS** - Detecção de IP dinâmico + lista branca
- ✅ **Tratamento de Erros** - Respostas de erro abrangentes
- ✅ **Prevenção de Injeção SQL** - Consultas parametrizadas

---

## 🗄️ **Banco de Dados: Esquema MySQL**

### **Tabelas Principais**

#### **1. admimetro**
- `idAdm` (PK) - ID do Admin
- `usuario_Admin` - Nome de usuário
- Controle de acesso baseado em funções

#### **2. categoriacurso** (Categorias de Cursos)
- `idcategoriacurso` (PK)
- `categoriacurso` - Nome da categoria (ex.: "Administração", "Engenharia", "Humanidades")

#### **3. curso** (Cursos)
- `idcurso` (PK)
- `curso` - Nome do curso (ex.: "Ciências da Computação", "Engenharia Civil")
- `idcategoriacurso` (FK) - Vincula à categoria
- **13 cursos** no banco (Ciências da Computação, Engenharia Civil, Economia, Direito, Jornalismo, Arquitetura, Geologia, etc.)

#### **4. anocurricular** (Anos Acadêmicos)
- `idanocurricular` (PK)
- `anocurricular` - Número do ano (1º, 2º, 3º, 4º ano)
- `idcurso` (FK) - Vincula ao curso

#### **5. disciplina** (Disciplinas/Matérias)
- `iddisciplina` (PK)
- `disciplina` - Nome da matéria
- `idAdm` (FK)
- **344 disciplinas** no banco (ex.: Programação I-V, Algoritmos, Estruturas de Dados, Bancos de Dados, Redes, Engenharia de Software, IA, etc.)

#### **6. semestre** (Atribuições de Semestre/Período)
- `idsemestre` (PK)
- `idcurso`, `iddisciplina`, `idanocurricular` (FK)
- `semestre` - ENUM('1', '2') - Primeiro ou segundo semestre
- **288 registros** vinculando disciplinas a semestres

#### **7. professor** (Professores)
- `idprofessor` (PK)
- **Dados Pessoais**: `nomeprofessor`, `generoprofessor`, `nacionalidadeprofessor`, `estadocivilprofessor`, `datanascimentoprofessor`
- **Contato**: `emailprofessor`, `telefoneprofessor`, `whatsappprofessor`, `residenciaprofessor`
- **Profissional**: `titulacaoprofessor` (Nível de grau), `anoexperienciaprofessor`, `tipocontratoprofessor` (Temporário/Permanente)
- **Administrativo**: `codigoprofessor`, `senhaprofessor` (hash), `estado` (Ativo/Inativo)
- **Documentos**: `nbiprofessor`, `bipdfprofessor`, `fotoprofessor`
- **Bancário**: `ibanprofessor`
- **Saúde**: `tiposanguineoprofessor`, `condicoesprofessor`
- **Emergência**: `contactoemergenciaprofessor`
- `idAdm` (FK)

#### **8. funcionario** (Funcionários)
- `id_funcionario` (PK)
- `nome_funcionario`
- `contacto_funcionario`
- `bi_funcionario` - Número de ID
- `senha_funcionario` - Senha hash
- `estado_funcionario` - ENUM('Ativo', 'Desativado')
- `idAdm` (FK)

#### **9. estudanteInscricao** (Inscrições de Estudantes)
- `id_estudanteInscricao` (PK)
- `nome_estudanteInscricao`
- `email_estudanteInscricao` (ÚNICO)
- `contacto_estudanteInscricao` (ÚNICO) - Telefone
- `sexo_estudanteInscricao`
- `periodo_estudanteInscricao` - ENUM('Manhã', 'Tarde')
- `bi_estudanteInscricao` - Número de ID
- `numeroInscricao_estudanteInscricao` - Formato: YYYYXXXXXX (ano + 6 dígitos aleatórios)
- `senha_estudanteInscricao` - Senha hash
- **Documentos**: `documento_estudanteInscricao`, `foto_estudanteInscricao`
- **PDFs**: `pdf_InscricaoRupe`, `pdf_MatriculaRupe`
- `estado_estdanteInscrito` - ENUM('Aprovado', 'Reprovado', 'Admitido', 'Não Admitido', 'Pendente')
- `idcurso` (FK)

#### **10. periodo** (Períodos de Tempo)
- `idperiodo` (PK)
- `periodo` - Nome (manhã/tarde)

#### **11. disc_prof** (Relacionamentos Professor-Disciplina)
- `iddisciplina` (FK)
- `idprofessor` (FK)
- Vincula professores a disciplinas

#### **12. cargo_funcionario_relation** & **cargo_funcionario**
- Gestão de cargo/função de funcionários

### **Relacionamentos Principais do Banco de Dados**
```
categoriacurso ←→ curso ←→ anocurricular
                    ↓
              semestre ←→ disciplina
                    ↑
               disc_prof ←→ professor
               
estudanteInscricao → curso
funcionario → admimetro
```

---

## 📋 **Funcionalidades Principais**

### **Portal do Estudante**
- ✅ Cadastro com verificação de email
- ✅ Upload de documentos (ID, fotos)
- ✅ Acompanhamento de aplicações (Pendente → Aprovado/Rejeitado)
- ✅ Gestão de matrículas

### **Painel Administrativo**
- ✅ Análises em tempo real (Gráficos via Recharts)
- ✅ Gestão de cursos (CRUD)
- ✅ Gestão de professores com perfis
- ✅ Gestão de funcionários
- ✅ Mapeamento disciplina-curso
- ✅ Configuração de ano acadêmico
- ✅ Revisão de aplicações de estudantes

### **Portal do Professor**
- ✅ Gestão de perfil
- ✅ Atribuições de disciplinas
- ✅ Gestão de notas de estudantes (implícito)

### **Portal do Funcionário**
- ✅ Gestão de matrículas
- ✅ Acesso a registros de estudantes

---

## ⚙️ **Configuração e Implantação**

### **Variáveis de Ambiente**
```env
# Banco de Dados
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=*****
DB_DATABASE=imetro

# Email
EMAIL_USER=seu-gmail@gmail.com
EMAIL_PASS=sua-senha-de-app

# Backend
PORT=8080

# Frontend
VITE_BACKEND_PORT=8080
VITE_API_URL=http://localhost:8080
```

### **Implantação em Produção**
- **Frontend**: Implantado no **Vercel** (https://portal-imetro.vercel.app)
- **Backend**: Requer hospedagem Node.js
- **Banco de Dados**: Servidor MySQL 8.0

### **Scripts NPM**
```bash
npm run dev                # Iniciar cliente e servidor (concorrentemente)
npm run dev:client         # Iniciar servidor Vite dev (porta 3000)
npm run dev:server         # Iniciar servidor Express (porta 8080)
npm run build              # Build React para produção
npm run install:all        # Instalar dependências para todos os projetos
npm run clean              # Remover node_modules
```

---

## 🔐 **Recursos de Segurança**

✅ **Segurança de Senhas**
- Hashing Bcrypt para todas as senhas
- Hashing separado para estudantes, professores, funcionários

✅ **Autenticação**
- Sistema de login baseado em Passport.js
- Autenticação baseada em sessão
- Controle de acesso baseado em funções

✅ **Verificação de Email**
- Códigos de verificação de 6 dígitos
- Expiração de 10 minutos
- Integração SMTP Gmail

✅ **Proteção de Dados**
- Lista branca CORS para acesso à API
- Consultas SQL parametrizadas (previne injeção)
- Validação de upload de arquivos

✅ **Gerenciamento de Arquivos**
- Organizado por tipo de usuário (estudantes/professores)
- Limite de upload de 50MB
- Prevenção de travessia de caminho segura

---

## 📦 **Resumo de Dependências**

### **Pacotes Principais do Frontend**
- React 19.2.3, React Router 7.12.0
- Bootstrap 5.3.8
- Recharts 3.7.0
- Axios 1.13.4
- React Toastify 11.0.5
- React PDF 10.3.0

### **Pacotes Principais do Backend**
- Express 5.2.1
- MySQL2 3.16.1
- Bcryptjs 3.0.3
- Passport 0.7.0
- Multer 2.0.2
- Nodemailer 8.0.2
- CORS 2.8.6

---

## 🎯 **Estatísticas do Projeto**

| Métrica | Valor |
|---------|-------|
| **Cursos** | 13+ |
| **Disciplinas** | 344 |
| **Professores** | 14 ativos |
| **Semestres Mapeados** | 288 |
| **Tabelas Principais** | 12+ |
| **Endpoints da API** | 40+ |
| **Rotas Protegidas** | 6 |
| **Páginas do Frontend** | 8+ |

---

## 🔗 **Pontos de Integração Chave**

1. **Verificação de Email**: Roteador → Cadastro de Estudante → SMTP Gmail
2. **Uploads de Arquivos**: Cadastro de Estudante/Professor → Armazenamento Local (`/client/src/img/`)
3. **Autenticação**: Rota de Login → Sessões → Páginas Protegidas
4. **Análises**: Painel → APIs REST → Visualizações Recharts
5. **Banco de Dados**: Todas as operações CRUD → Pool de conexão MySQL

Este sistema abrangente oferece gestão acadêmica completa com interface profissional, autenticação segura e arquitetura escalável adequada para instituições educacionais.</content>
<parameter name="filePath">c:\Users\artur\OneDrive\Documentos\Projetos\Portal-Imetro\documentacao_projeto.md