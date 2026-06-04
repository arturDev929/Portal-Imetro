# Portal IMETRO

Sistema de gestão acadêmica para o Instituto Médio de Tecnologias (IMETRO), desenvolvido com React no frontend e Node.js no backend.

## ⚡ Início Rápido

```bash
# 1. Clone o repositório
git clone <url-do-repositorio>
cd Portal-Imetro

# 2. Instale todas as dependências
npm run install:all

# 3. Configure o banco de dados MySQL e execute os scripts SQL

# 4. Configure as variáveis de ambiente (copie os .env.example)

# 5. Inicie o desenvolvimento
npm run dev
```

Acesse: **http://localhost:3000** (frontend) e **http://localhost:8080** (API)

## 📋 Descrição

O Portal IMETRO é uma plataforma completa para gestão acadêmica que inclui:

- **Gestão de Cursos**: Administração de cursos, disciplinas e categorias
- **Gestão de Professores**: Cadastro e acompanhamento de docentes
- **Gestão de Funcionários**: Controle de funcionários e matrículas
- **Sistema de Inscrições**: Portal para estudantes se inscreverem
- **Dashboards Administrativos**: Relatórios e estatísticas em tempo real
- **Autenticação**: Sistema de login seguro

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 19.2.3** - Framework JavaScript
- **Vite** - Build tool e dev server
- **React Router DOM** - Roteamento
- **Bootstrap 5.3.8** - Framework CSS
- **Axios** - Cliente HTTP
- **React Toastify** - Notificações
- **Recharts** - Gráficos e visualizações
- **React Icons** - Biblioteca de ícones

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MySQL2** - Driver MySQL
- **bcrypt/bcryptjs** - Hash de senhas
- **Passport.js** - Autenticação
- **Multer** - Upload de arquivos
- **Nodemailer** - Envio de emails
- **CORS** - Controle de acesso cross-origin

### Banco de Dados
- **MySQL** - Sistema de gerenciamento de banco de dados

## 🚀 Instalação e Configuração

### Pré-requisitos

- **Node.js** (versão 16 ou superior)
- **MySQL** (versão 8.0 ou superior)
- **npm** ou **yarn**

### 1. Clonagem do Repositório

```bash
git clone <url-do-repositorio>
cd Portal-Imetro
```

### 2. Instalação de Dependências

Instale todas as dependências de uma vez:
```bash
npm run install:all
```

Ou instale manualmente:
```bash
# Dependências da raiz
npm install

# Dependências do frontend
cd client && npm install

# Dependências do backend
cd ../server && npm install
```

### 2. Configuração do Banco de Dados

1. Instale e configure o MySQL
2. Crie um banco de dados chamado `imetro`
3. Execute os arquivos SQL na pasta `database/` em ordem:
   - `imetro_admimetro.sql`
   - `imetro_anocurricular.sql`
   - `imetro_cargo_funcionario.sql`
   - `imetro_cargo_funcionario_relation.sql`
   - `imetro_categoriacurso.sql`
   - `imetro_curso.sql`
   - `imetro_disciplina.sql`
   - `imetro_disc_prof.sql`
   - `imetro_estudanteinscricao.sql`
   - `imetro_funcionario.sql`
   - `imetro_periodo.sql`
   - `imetro_professor.sql`
   - `imetro_semestre.sql`

### 3. Configuração do Backend

1. Entre na pasta do servidor:
```bash
cd server
```

2. Copie o arquivo de exemplo das variáveis de ambiente:
```bash
cp .env.example .env
```

3. Edite o arquivo `.env` com suas configurações do MySQL:
```env
MYSQLHOST=localhost
MYSQLPORT=3306
MYSQLUSER=seu_usuario_mysql
MYSQLPASSWORD=sua_senha_mysql
MYSQLDATABASE=imetro
PORT=8080
```

### 4. Configuração do Frontend

1. Abra um novo terminal e entre na pasta do cliente:
```bash
cd client
```

2. Copie o arquivo de exemplo das variáveis de ambiente:
```bash
cp .env.example .env.development
```

3. Verifique se o arquivo `.env.development` contém a URL correta da API:
```env
REACT_APP_API_URL=http://localhost:8080
```

## 📁 Estrutura do Projeto

```
Portal-Imetro/
├── client/                 # Frontend React
│   ├── .env.example       # Exemplo de variáveis de ambiente
│   ├── public/            # Arquivos estáticos
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   │   ├── global/    # Componentes compartilhados
│   │   │   └── layouts/   # Layouts da aplicação
│   │   ├── hooks/         # Hooks customizados
│   │   ├── pages/         # Páginas principais
│   │   ├── pagesAdm/      # Páginas administrativas
│   │   ├── service/       # Configurações de API
│   │   ├── styles/        # Estilos CSS
│   │   └── constants/     # Constantes da aplicação
│   ├── package.json
│   └── vite.config.js
├── server/                # Backend Node.js
│   ├── .env.example      # Exemplo de variáveis de ambiente
│   ├── infra/            # Configurações de infraestrutura
│   ├── routes/           # Rotas da API
│   ├── package.json
│   └── index.js
├── database/             # Scripts SQL
├── package.json          # Scripts de automação
└── README.md
```

## 🔧 Scripts Disponíveis

### Raiz do Projeto
```bash
npm run install:all    # Instala dependências de todos os módulos
npm run dev           # Inicia frontend e backend simultaneamente
npm run dev:client    # Inicia apenas o frontend
npm run dev:server    # Inicia apenas o backend
npm run build         # Build do frontend para produção
npm run start         # Inicia apenas o backend em produção
npm run clean         # Remove node_modules de todos os módulos
```

### Frontend (client/)
```bash
npm run dev      # Inicia o servidor de desenvolvimento
npm run build    # Build para produção
npm run preview  # Preview do build de produção
npm run lint     # Executa o linter
```

### Backend (server/)
```bash
npm start        # Inicia o servidor com nodemon
```

## 🌐 Acesso ao Sistema

Após iniciar ambos os servidores:

1. **Frontend**: Acesse `http://localhost:3000`
2. **Backend API**: Disponível em `http://localhost:8080`

### Usuários de Teste

*(Configure usuários de teste no banco de dados conforme necessário)*

## 📊 Funcionalidades

### Área Administrativa
- Dashboard com estatísticas gerais
- Gestão de cursos e disciplinas
- Gestão de professores e funcionários
- Relatórios e gráficos analíticos
- Controle de matrículas

### Área de Funcionários
- Gestão de inscrições de estudantes
- Acompanhamento de matrículas
- Relatórios operacionais

### Portal de Estudantes
- Sistema de inscrição online
- Acompanhamento de status
- Portal informativo

## 🔒 Segurança

- Autenticação baseada em sessões
- Hash de senhas com bcrypt
- Controle de acesso por roles
- Validação de entrada de dados
- Proteção contra ataques comuns

## 📈 Performance

- Lazy loading de componentes
- Otimização de builds
- Compressão de assets
- Cache inteligente
- Componentes reutilizáveis

## 🐛 Troubleshooting

### Problemas Comuns

1. **Erro de conexão com banco de dados**
   - Verifique se o MySQL está rodando
   - Confirme as credenciais no arquivo `.env`
   - Certifique-se de que o banco `imetro` existe

2. **Frontend não conecta com API**
   - Verifique se o backend está rodando na porta 8080
   - Atualize `REACT_APP_API_URL` no `.env.development`
   - Use o IP correto se estiver em rede local

3. **Build falhando**
   - Execute `npm install` em ambas as pastas
   - Verifique se todas as dependências estão instaladas
   - Limpe node_modules e reinstale se necessário

4. **Portas ocupadas**
   - Frontend: porta 3000 (configurável no vite.config.js)
   - Backend: porta 8080 (configurável na variável PORT)

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença ISC.

## 📞 Suporte

Para suporte técnico ou dúvidas sobre o projeto, entre em contato com a equipe de desenvolvimento.