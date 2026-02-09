const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const path = require("path"); // ← ADICIONE ESTA LINHA
require('dotenv').config();
const RouterGet = require("./routes/RouterGet");
const RouterPost = require("./routes/RouterPost");
const RouterLogin = require("./routes/RouteLogin");
const RouterDelete = require("./routes/RouterDelete");
const RouterPut = require("./routes/RouterPut");

const port = process.env.PORT || 8080;

const app = express();

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://192.168.18.6:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Não permitido pelo CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.listen(port, (e) => {
    if (e) {
        console.log("Erro ao iniciar servidor:", e);
    } else {
        console.log(`Servidor conectado com sucesso na porta ${port}!`);
        console.log(`Acesse: http://localhost:${port}`);
        console.log(`Imagens disponíveis em: http://localhost:${port}/api/img/professores/`);
    }
});