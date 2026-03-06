const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const path = require("path");
const os = require("os"); // ← ADICIONE ESTA LINHA
require('dotenv').config();
const RouterGet = require("./routes/RouterGet");
const RouterPost = require("./routes/RouterPost");
const RouterLogin = require("./routes/RouteLogin");
const RouterDelete = require("./routes/RouterDelete");
const RouterPut = require("./routes/RouterPut");

const port = process.env.PORT || 8080;

const app = express();

// Função para obter o IP local
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
  `http://${LOCAL_IP}:3000`, // Adiciona automaticamente o IP atual
  /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:3000$/,
  /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}:3000$/ // Para redes 10.x.x.x
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

app.use('/api/img/professores', express.static(path.join(__dirname, '../client/src/img/professores')));

app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
  createParentPath: true,
  limits: { fileSize: 50 * 1024 * 1024 },
  abortOnLimit: true
}));

app.use('/get', RouterGet); 
app.use('/post', RouterPost);
app.use('/login', RouterLogin);
app.use('/delete', RouterDelete);
app.use('/put', RouterPut);

// Rota de teste para verificar se o servidor está acessível
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