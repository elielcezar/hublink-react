const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient(); 
const router = express.Router();

// Middleware para verificar JWT (copiado de server.js)
// Idealmente, isso poderia ir para um arquivo de middleware separado, mas por enquanto fica aqui.
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

// Rota: /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Usuário já existe' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword }
    });
    res.status(201).json({ id: user.id, name: user.name, email: user.email });
  } catch (error) {
    console.error('Erro ao registrar:', error);
    res.status(500).json({ message: 'Erro ao registrar usuário' });
  }
});

// Rota: /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'seu_jwt_secret_aqui',
      { expiresIn: '24h' }
    );
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ message: 'Erro ao fazer login' });
  }
});

// Rota: /api/auth/me
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, name: true, email: true }
    });
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    res.json(user);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ message: 'Erro ao buscar informações do usuário' });
  }
});

// Rota: /api/auth/user/details
router.get('/user/details', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, name: true, email: true, gaId: true, role: true }
    });
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    res.json(user);
  } catch (error) {
    console.error('Erro ao buscar detalhes do usuário:', error);
    res.status(500).json({ message: 'Erro ao buscar informações do usuário' });
  }
});

// Rota: /api/auth/user/ga-config
router.put('/user/ga-config', authenticateToken, async (req, res) => {
  try {
    const { gaId } = req.body;
    await prisma.user.update({
      where: { id: req.user.userId },
      data: { gaId }
    });
    res.json({ message: 'Configurações atualizadas com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    res.status(500).json({ message: 'Erro ao atualizar configurações' });
  }
});

module.exports = router;
// Routes for authentication and user management