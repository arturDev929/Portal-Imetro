const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const path = require("path");
const os = require("os"); 
require('dotenv').config({quiet: true});
const RouterPostHome = require("./routes/Home/RouterPost");
const RouterLogin = require("./routes/Home/RouteLogin");
const RouterGetAdm = require("./routes/ADM/RouterGet");
const RouterPutAdm = require("./routes/ADM/RouterPut");
const RouterDeleteAdm = require("./routes/ADM/RouterDelete");
const RouterPostAdm = require("./routes/ADM/RouterPost");
const RouterGetEmployeeRegistration = require("./routes/employeeRegistration/RouterGet");
const RouterPutEmployeeRegistration = require("./routes/employeeRegistration/RouterPut");
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

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://portal-imetro.vercel.app',
  `http://${LOCAL_IP}:3000`,
  /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:3000$/,
  /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}:3000$/
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

app.use('/api/img/professores', express.static(path.join(__dirname, '../client/src/img/professores/Perfil')));
app.use('/api/img/professores/DocBI', express.static(path.join(__dirname, '../client/src/img/professores/Doc BI')));
app.use('/api/img/estudantes', express.static(path.join(__dirname, '../client/src/img/estudantes/Perfil')));
app.use('/api/img/estudantes/Pagamento_Inscricao', express.static(path.join(__dirname, '../client/src/img/estudantes/Pagamento_Inscricao')));
app.use('/api/img/estudantes/Pagamento_Matricula', express.static(path.join(__dirname, '../client/src/img/estudantes/Pagamento_Matricula')));
app.use('/api/img/estudantes/documentos', express.static(path.join(__dirname, '../client/src/img/estudantes/documentos')));

app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
  createParentPath: true,
  limits: { fileSize: 50 * 1024 * 1024 },
  abortOnLimit: true
}));

app.use('/', RouterPostHome);
app.use('/login', RouterLogin);
app.use('/', RouterGetAdm);
app.use('/', RouterPutAdm);
app.use('/', RouterDeleteAdm);
app.use('/', RouterPostAdm);
app.use('/', RouterGetEmployeeRegistration);
app.use('/', RouterPutEmployeeRegistration);
app.use('/', RouterGetStudentsInscript);
app.use('/', RouterPutStudentsInscript);
app.use('/', RouterGetTeacher);


app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor funcionando!' });
});

app.listen(port, '0.0.0.0', (e) => {
    if (e) {
        console.log("Erro ao iniciar servidor:", e);
    } else {
        console.log(`Servidor conectado com sucesso na porta ${port}!`);
        console.log(`Acesse localmente: http://localhost:${port}`);
        console.log(`Acesse na rede: http://${LOCAL_IP}:${port}`);
        console.log(`Imagens disponíveis em: http://${LOCAL_IP}:${port}/api/img/professores/`);
        console.log(`Teste o servidor: http://${LOCAL_IP}:${port}/health`);
    }
});