const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const path = require("path");
const os = require("os");
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
require('dotenv').config({quiet: true});

const RouterPostHome = require("./routes/Home/RouterPost");
const RouterLogin = require("./routes/Home/RouteLogin");
const RouterGetAdm = require("./routes/ADM/RouterGet");
const RouterPutAdm = require("./routes/ADM/RouterPut");
const RouterDeleteAdm = require("./routes/ADM/RouterDelete");
const RouterPostAdm = require("./routes/ADM/RouterPost");
const RouterGetEmployeeRegistration = require("./routes/employeeRegistration/RouterGet");
const RouterPutEmployeeRegistration = require("./routes/employeeRegistration/RouterPut");
const RouterPostEmployeeRegistration = require("./routes/employeeRegistration/RouterPost");
const RouterDeleteEmployeeRegistration = require("./routes/employeeRegistration/RouterDelete");
const RouterGetStudentsInscript = require("./routes/StudentsInscript/RouterGet");
const RouterPutStudentsInscript = require("./routes/StudentsInscript/RouterPut");
const RouterGetTeacher = require("./routes/Teacher/RouterGet");

const port = process.env.PORT || 8080;

const app = express();

function getLocalIP() {
    const nets = os.networkInterfaces();
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                return net.address;
            }
        }
    }
    return 'localhost';
}

const LOCAL_IP = getLocalIP();

// Configuração do CORS
const allowedOrigins = [
<<<<<<< HEAD
  'http://localhost:3000',
  'http://localhost:3001',
  'https://portal-imetro.vercel.app',
  `http://${LOCAL_IP}:3000`,
=======
  'http://localhost:8081',
  'http://localhost:8080',
  'https://portal-imetro.vercel.app',
  `http://${LOCAL_IP}:8081`,
>>>>>>> eliseu_front2.0
  `http://localhost:${port}`,
  `http://${LOCAL_IP}:${port}`,
  /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:\d+$/,
  /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d+$/
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return allowed === origin;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('Origem não permitida pelo CORS:', origin);
      callback(new Error('Não permitido pelo CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configuração dos arquivos estáticos
app.use('/api/img/professores', express.static(path.join(__dirname, '../client/src/img/professores/Perfil')));
app.use('/api/img/professores/DocBI', express.static(path.join(__dirname, '../client/src/img/professores/Doc BI')));
app.use('/api/img/estudantes', express.static(path.join(__dirname, '../client/src/img/estudantes/Perfil')));
app.use('/api/img/estudantes/Pagamento_Inscricao', express.static(path.join(__dirname, '../client/src/img/estudantes/Pagamento_Inscricao')));
app.use('/api/img/estudantes/Pagamento_Matricula', express.static(path.join(__dirname, '../client/src/img/estudantes/Pagamento_Matricula')));
app.use('/api/img/estudantes/documentos', express.static(path.join(__dirname, '../client/src/img/estudantes/documentos')));
app.use('/api/img/topico', express.static(path.join(__dirname, '../client/src/img/Topicos')));

app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
  createParentPath: true,
  limits: { fileSize: 50 * 1024 * 1024 },
  abortOnLimit: true
}));

// ==================== CONFIGURAÇÃO DO SWAGGER ====================
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'API Portal I-Metro',
    version: '1.0.0',
    description: 'Documentação completa da API do Portal Educacional I-Metro',
    contact: {
      name: 'Suporte I-Metro',
      email: 'suporte@imetro.com',
      url: 'https://portal-imetro.vercel.app'
    },
    license: {
      name: 'Licença Proprietária',
      url: 'https://www.imetro.com/license'
    }
  },
  servers: [
    {
      url: `http://localhost:${port}`,
      description: 'Servidor Local'
    },
    {
      url: `http://${LOCAL_IP}:${port}`,
      description: 'Servidor Rede Local'
    },
    {
      url: 'https://api.imetro.com',
      description: 'Servidor de Produção'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Insira o token JWT para autorização'
      }
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Erro ao processar requisição' },
          details: { type: 'string', example: 'Detalhes do erro' }
        }
      },
      Professor: {
        type: 'object',
        properties: {
          idprofessor: { type: 'integer', example: 1 },
          nomeprofessor: { type: 'string', example: 'João Silva' },
          codigoprofessor: { type: 'string', example: 'PROF001' },
          emailprofessor: { type: 'string', format: 'email', example: 'joao@email.com' },
          telefoneprofessor: { type: 'string', example: '(11) 99999-9999' },
          fotoUrl: { type: 'string', format: 'uri', nullable: true },
          curriculoUrl: { type: 'string', format: 'uri', nullable: true },
          disciplinas: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                iddisciplina: { type: 'integer' },
                disciplina: { type: 'string' }
              }
            }
          }
        }
      }
    }
  },
  tags: [
    { name: 'Home', description: 'Endpoints da página inicial' },
    { name: 'Login', description: 'Autenticação de usuários' },
    { name: 'Administração', description: 'Operações administrativas (CRUD)' },
    { name: 'Funcionários', description: 'Gerenciamento de funcionários' },
    { name: 'Alunos', description: 'Gerenciamento de alunos e inscrições' },
    { name: 'Professores', description: 'Gerenciamento de professores' },
    { name: 'Health', description: 'Verificação de saúde do servidor' }
  ]
};

const options = {
  definition: swaggerDefinition,
  apis: [
    './index.js',
    './routes/Home/*.js',
    './routes/ADM/*.js',
    './routes/employeeRegistration/*.js',
    './routes/StudentsInscript/*.js',
    './routes/Teacher/*.js'
  ]
};

const swaggerSpec = swaggerJsdoc(options);

// Rotas do Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  swaggerOptions: {
    docExpansion: 'list',
    filter: true,
    showRequestDuration: true,
    tryItOutEnabled: true,
    persistAuthorization: true
  },
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "API I-Metro - Documentação"
}));

app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json(swaggerSpec);
});
// ==================== FIM DO SWAGGER ====================

// Suas rotas
app.use('/', RouterPostHome);
app.use('/login', RouterLogin);
app.use('/', RouterGetAdm);
app.use('/', RouterPutAdm);
app.use('/', RouterDeleteAdm);
app.use('/', RouterPostAdm);
app.use('/', RouterGetEmployeeRegistration);
app.use('/', RouterPutEmployeeRegistration);
app.use('/', RouterDeleteEmployeeRegistration);
app.use('/', RouterPostEmployeeRegistration);
app.use('/', RouterGetStudentsInscript);
app.use('/', RouterPutStudentsInscript);
app.use('/', RouterGetTeacher);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Servidor funcionando!',
    timestamp: new Date().toISOString(),
    endpoints: {
      swagger: '/api-docs',
      swaggerJson: '/api-docs.json',
      health: '/health'
    }
  });
});

// Middleware para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Rota não encontrada',
    path: req.originalUrl,
    method: req.method
  });
});

// Middleware de erro global
app.use((err, req, res, next) => {
  console.error('Erro:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Erro interno do servidor',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Iniciar servidor
app.listen(port, '0.0.0.0', (e) => {
    if (e) {
        console.log("Erro ao iniciar servidor:", e);
    } else {
        console.log("SERVIDOR INICIADO COM SUCESSO!");
        console.log(`Porta: ${port}`);
        console.log(`Local: http://localhost:${port}`);
        console.log(`Rede: http://${LOCAL_IP}:${port}`);
        console.log(`Swagger UI: http://localhost:${port}/api-docs`);
        console.log(`Swagger JSON: http://localhost:${port}/api-docs.json`);
        console.log(`Health: http://localhost:${port}/health`);
    }
});