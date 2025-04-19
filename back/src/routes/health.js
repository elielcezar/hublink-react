const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();


router.get('/health', (req, res) => {
  const authHeader = req.headers['authorization'] || 'Não fornecido';
  const cookies = req.headers.cookie || 'Não fornecido';
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    cors: 'enabled',
    headers: {
      authorization: authHeader.startsWith('Bearer ') ? 'Bearer Token fornecido' : authHeader,
      cookie: cookies,
      'user-agent': req.headers['user-agent'],
      origin: req.headers.origin || 'Não fornecido',
      referer: req.headers.referer || 'Não fornecido'
    }
  });
});


router.get('/debug/auth', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  let tokenInfo = { válido: false };
  if (token) {
    try {
      const decoded = jwt.decode(token);
      tokenInfo = {
        válido: true,
        expiração: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : 'Não definida',
        userId: decoded.userId || 'Não definido',
        emitidoEm: decoded.iat ? new Date(decoded.iat * 1000).toISOString() : 'Não definido'
      };
    } catch (e) {
      tokenInfo.erro = e.message;
    }
  }
  res.json({
    headers: {
      authorization: authHeader ? 'Presente' : 'Ausente',
      cookie: req.headers.cookie || 'Ausente',
      'content-type': req.headers['content-type'] || 'Não definido',
      origin: req.headers.origin || 'Não definido',
      referer: req.headers.referer || 'Não definido'
    },
    token: tokenInfo,
    env: {
      NODE_ENV: process.env.NODE_ENV || 'Não definido',
      PORT: process.env.PORT || 'Não definido',
      JWT_SECRET: process.env.JWT_SECRET ? 'Definido (valor não mostrado)' : 'Não definido'
    },
    clienteInfo: {
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'] || 'Não definido',
      isSecure: req.secure,
      protocol: req.protocol
    }
  });
});

module.exports = router;
// Routes for health checks and debugging