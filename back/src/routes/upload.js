const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware de autenticação (copiado de auth.js, idealmente seria um módulo compartilhado)
const authenticateToken = (req, res, next) => {
  console.log(`[Auth] Verificando token para rota: ${req.method} ${req.originalUrl}`);
  const authHeader = req.headers['authorization'];
  console.log(`[Auth] Header de autorização: ${authHeader ? 'presente' : 'ausente'}`);
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    console.log('[Auth] Acesso negado: Token não fornecido');
    return res.status(401).json({ message: 'Acesso negado: Token não fornecido' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET || 'seu_jwt_secret_aqui', (err, user) => {
    if (err) {
      console.log(`[Auth] Token inválido: ${err.message}`);
      return res.status(403).json({ message: 'Token inválido', error: err.message });
    }
    console.log(`[Auth] Token válido para usuário ID: ${user.userId}`);
    req.user = user;
    next();
  });
};

// Configuração do diretório de uploads (ajustado para ser relativo à raiz do projeto)
const uploadsDir = path.join(__dirname, '../../uploads'); 
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuração do Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'image-' + uniqueSuffix + ext);
  }
});

// Filtro de arquivos
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Apenas imagens são permitidas!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  }
});

// Rota para upload de múltiplas imagens (protegida)
router.post('/', authenticateToken, upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Nenhuma imagem foi enviada' });
    }
    // Retorna caminhos relativos ao servidor web, não ao sistema de arquivos
    const urls = req.files.map(file => `/uploads/${file.filename}`);
    res.json({ urls });
  } catch (error) {
    console.error('Erro no upload:', error);
    // Tratar erros específicos do Multer
    if (error instanceof multer.MulterError) {
      return res.status(400).json({ error: error.message });
    } else if (error.message === 'Apenas imagens são permitidas!') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Erro ao processar o upload das imagens' });
  }
});

// Rota para deletar uma imagem (protegida)
router.delete('/:filename', authenticateToken, async (req, res) => {
  try {
    const filename = req.params.filename;
    // Validar o nome do arquivo para evitar path traversal
    if (filename.includes('..') || filename.includes('/')) {
      return res.status(400).json({ error: 'Nome de arquivo inválido' });
    }
    const filePath = path.join(uploadsDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ message: 'Imagem deletada com sucesso' });
    } else {
      res.status(404).json({ error: 'Imagem não encontrada' });
    }
  } catch (error) {
    console.error('Erro ao deletar imagem:', error);
    res.status(500).json({ error: 'Erro ao deletar a imagem' });
  }
});

module.exports = router;
 