const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Importar rotas
const authRoutes = require('./src/routes/auth');
const pageRoutes = require('./src/routes/pages');
const componentRoutes = require('./src/routes/components');
const uploadRoutes = require('./src/routes/upload');
const publicRoutes = require('./src/routes/public');
const trackRoutes = require('./src/routes/track');
const healthRoutes = require('./src/routes/health');

const app = express();
const PORT = process.env.PORT || 3002;

// Configurar diretório de uploads
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors({
  origin: ['https://hublink.ecwd.pro', 'http://hublink.ecwd.pro', 'http://localhost:3000', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  optionsSuccessStatus: 204,
  preflightContinue: false,
  maxAge: 86400 // 24 horas
}));
app.use(express.json());

// Servir arquivos estáticos da pasta uploads com cabeçalhos otimizados
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Cache-Control', 'public, max-age=31536000'); // Cache por 1 ano
  next();
}, express.static(path.join(__dirname, 'uploads')));

// Montar rotas
app.use('/api', authRoutes); // Prefixo /api para todas as rotas de auth
app.use('/api/pages', pageRoutes); // Prefixo /api/pages
app.use('/api/components', componentRoutes); // Prefixo /api/components
app.use('/api/upload', uploadRoutes); // Prefixo /api/upload
app.use('/api/public', publicRoutes); // Prefixo /api/public
app.use('/api/track', trackRoutes); // Prefixo /api/track
app.use('/api', healthRoutes); // Prefixo /api para health e debug
app.use('/api/auth', authRoutes);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
 