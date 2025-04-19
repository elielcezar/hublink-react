const express = require('express');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const router = express.Router();


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


router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const component = await prisma.component.findUnique({
      where: { id: parseInt(id) },
      include: { page: true }
    });
    if (!component) {
      return res.status(404).json({ message: 'Componente não encontrado' });
    }
    if (component.page.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Você não tem permissão para editar este componente' });
    }
    const updatedComponent = await prisma.component.update({
      where: { id: parseInt(id) },
      data: { content: JSON.stringify(content) }
    });
    updatedComponent.content = JSON.parse(updatedComponent.content);
    res.json(updatedComponent);
  } catch (error) {
    console.error('Erro ao atualizar componente:', error);
    res.status(500).json({ message: 'Erro ao atualizar componente' });
  }
});


router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const component = await prisma.component.findUnique({
      where: { id: parseInt(id) },
      include: { page: true }
    });
    if (!component) {
      return res.status(404).json({ message: 'Componente não encontrado' });
    }
    if (component.page.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Você não tem permissão para excluir este componente' });
    }
    await prisma.component.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Componente excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir componente:', error);
    res.status(500).json({ message: 'Erro ao excluir componente' });
  }
});

module.exports = router;
// Routes for managing individual components