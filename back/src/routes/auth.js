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
    const { name, email, password, pageSlug } = req.body;
    
    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return res.status(400).json({ message: 'Este e-mail já está em uso.' });
    }
    
    // Verificar se o slug já está em uso
    const existingPage = await prisma.page.findUnique({
      where: { slug: pageSlug }
    });
    
    if (existingPage) {
      return res.status(400).json({ message: 'Este endereço de página já está em uso.' });
    }
    
    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Criar usuário e página em uma transação
    const result = await prisma.$transaction(async (prisma) => {
      // Criar o usuário
      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        }
      });
      
      // Criar a página principal do usuário
      const newPage = await prisma.page.create({
        data: {
          title: `Página de ${name}`,
          slug: pageSlug,
          published: true,
          userId: newUser.id,
          style: {
            backgroundColor: '#ffffff',
            fontFamily: 'Inter, sans-serif',
            linkColor: '#3b82f6',
            textColor: '#333333',
            backgroundImage: null,
            logo: null,
            backgroundType: 'color'
          }
        }
      });
      
      return { user: newUser, page: newPage };
    });
    
    res.status(201).json({ 
      message: 'Usuário registrado com sucesso!',
      userId: result.user.id,
      pageId: result.page.id 
    });
    
  } catch (error) {
    console.error('Erro no registro:', error);
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

// Rota para atualizar dados do usuário
router.put('/auth/user/update', authenticateToken, async (req, res) => {
  console.log('Rota /api/auth/user/update chamada');
  console.log('Corpo da requisição:', req.body);
  
  try {
    const { name, email, newPassword } = req.body;
    const userId = req.user.userId;
    
    if (!name || !email) {
      return res.status(400).json({ message: 'Nome e e-mail são obrigatórios' });
    }
    
    // Buscar o usuário atual
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    // Verificar se o email já está em uso por outro usuário
    if (email !== user.email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email }
      });
      
      if (existingEmail && existingEmail.id !== userId) {
        return res.status(400).json({ message: 'Este e-mail já está em uso por outro usuário' });
      }
    }
    
    // Preparar dados para atualização
    const updateData = {
      name,
      email,
      updatedAt: new Date()
    };
    
    // Se estiver alterando a senha
    if (newPassword) {
      try {
        // Hash da nova senha
        updateData.password = await bcrypt.hash(newPassword, 10);
      } catch (hashError) {
        console.error('Erro ao gerar hash da senha:', hashError);
        return res.status(500).json({ message: 'Erro ao processar a nova senha' });
      }
    }
    
    // Atualizar o usuário
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });
    
    console.log('Usuário atualizado com sucesso:', updatedUser.id);
    res.json({ 
      message: 'Dados atualizados com sucesso',
      user: updatedUser
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ message: 'Erro ao atualizar dados do usuário' });
  }
});

module.exports = router;
