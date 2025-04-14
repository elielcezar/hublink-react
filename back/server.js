const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Configurar o armazenamento de uploads
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configurar o Multer para upload de imagens
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

// Filtro de arquivos para aceitar apenas imagens
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
    fileSize: 5 * 1024 * 1024, // limite de 5MB
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos da pasta uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware para verificar JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Acesso negado' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET || 'seu_jwt_secret_aqui', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido' });
    }
    
    req.user = user;
    next();
  });
};

// Rotas de autenticação
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Verificar se usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return res.status(400).json({ message: 'Usuário já existe' });
    }
    
    // Criar hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Criar usuário
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      }
    });
    
    // Retornar usuário criado (sem a senha)
    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email
    });
  } catch (error) {
    console.error('Erro ao registrar:', error);
    res.status(500).json({ message: 'Erro ao registrar usuário' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }
    
    // Verificar senha
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }
    
    // Gerar token JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'seu_jwt_secret_aqui',
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ message: 'Erro ao fazer login' });
  }
});

// Rota protegida para obter usuário atual
app.get('/api/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        name: true,
        email: true
      }
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

// Rotas para gerenciar páginas
// Listar páginas do usuário
app.get('/api/pages', authenticateToken, async (req, res) => {
  try {
    const pages = await prisma.page.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(pages);
  } catch (error) {
    console.error('Erro ao listar páginas:', error);
    res.status(500).json({ message: 'Erro ao buscar páginas' });
  }
});

// Criar nova página
app.post('/api/pages', authenticateToken, async (req, res) => {
  try {
    const { title, slug } = req.body;
    
    // Verificar se já existe uma página com este slug
    const existingPage = await prisma.page.findUnique({
      where: { slug }
    });
    
    if (existingPage) {
      return res.status(400).json({ message: 'Esta URL já está em uso' });
    }
    
    const page = await prisma.page.create({
      data: {
        title,
        slug,
        userId: req.user.userId
      }
    });
    
    res.status(201).json(page);
  } catch (error) {
    console.error('Erro ao criar página:', error);
    res.status(500).json({ message: 'Erro ao criar página' });
  }
});

// Obter detalhes de uma página com seus componentes
app.get('/api/pages/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const page = await prisma.page.findUnique({
      where: { 
        id: parseInt(id),
      },
      include: {
        components: {
          orderBy: { order: 'asc' }
        }
      }
    });
    
    if (!page) {
      return res.status(404).json({ message: 'Página não encontrada' });
    }
    
    // Verificar se a página pertence ao usuário
    if (page.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Você não tem permissão para acessar esta página' });
    }
    
    res.json(page);
  } catch (error) {
    console.error('Erro ao buscar página:', error);
    res.status(500).json({ message: 'Erro ao buscar detalhes da página' });
  }
});

// Atualizar página
app.put('/api/pages/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, slug, published } = req.body;
    
    // Verificar se a página existe e pertence ao usuário
    const existingPage = await prisma.page.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existingPage) {
      return res.status(404).json({ message: 'Página não encontrada' });
    }
    
    if (existingPage.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Você não tem permissão para editar esta página' });
    }
    
    // Se o slug foi alterado, verificar se já existe
    if (slug && slug !== existingPage.slug) {
      const slugExists = await prisma.page.findUnique({
        where: { slug }
      });
      
      if (slugExists) {
        return res.status(400).json({ message: 'Esta URL já está em uso' });
      }
    }
    
    const updatedPage = await prisma.page.update({
      where: { id: parseInt(id) },
      data: {
        title,
        slug,
        published
      }
    });
    
    res.json(updatedPage);
  } catch (error) {
    console.error('Erro ao atualizar página:', error);
    res.status(500).json({ message: 'Erro ao atualizar página' });
  }
});

// Excluir página
app.delete('/api/pages/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se a página existe e pertence ao usuário
    const page = await prisma.page.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!page) {
      return res.status(404).json({ message: 'Página não encontrada' });
    }
    
    if (page.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Você não tem permissão para excluir esta página' });
    }
    
    // Excluir página (isso também excluirá todos os componentes devido ao onDelete: Cascade)
    await prisma.page.delete({
      where: { id: parseInt(id) }
    });
    
    res.json({ message: 'Página excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir página:', error);
    res.status(500).json({ message: 'Erro ao excluir página' });
  }
});

// Rotas para gerenciar componentes
// Adicionar componente a uma página
app.post('/api/pages/:pageId/components', authenticateToken, async (req, res) => {
  try {
    const { pageId } = req.params;
    const { type, content } = req.body;
    
    // Verificar se a página existe e pertence ao usuário
    const page = await prisma.page.findUnique({
      where: { id: parseInt(pageId) }
    });
    
    if (!page) {
      return res.status(404).json({ message: 'Página não encontrada' });
    }
    
    if (page.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Você não tem permissão para editar esta página' });
    }
    
    // Encontrar a maior ordem atual
    const lastComponent = await prisma.component.findFirst({
      where: { pageId: parseInt(pageId) },
      orderBy: { order: 'desc' }
    });
    
    const nextOrder = lastComponent ? lastComponent.order + 1 : 0;
    
    // Criar o componente
    const component = await prisma.component.create({
      data: {
        type,
        content: JSON.stringify(content),
        order: nextOrder,
        pageId: parseInt(pageId)
      }
    });
    
    // Converter o content de volta para objeto
    component.content = JSON.parse(component.content);
    
    res.status(201).json(component);
  } catch (error) {
    console.error('Erro ao adicionar componente:', error);
    res.status(500).json({ message: 'Erro ao adicionar componente' });
  }
});

// Atualizar um componente
app.put('/api/components/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    
    // Verificar se o componente existe
    const component = await prisma.component.findUnique({
      where: { id: parseInt(id) },
      include: { page: true }
    });
    
    if (!component) {
      return res.status(404).json({ message: 'Componente não encontrado' });
    }
    
    // Verificar se o usuário tem permissão
    if (component.page.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Você não tem permissão para editar este componente' });
    }
    
    // Atualizar o componente
    const updatedComponent = await prisma.component.update({
      where: { id: parseInt(id) },
      data: {
        content: JSON.stringify(content)
      }
    });
    
    // Converter o content de volta para objeto
    updatedComponent.content = JSON.parse(updatedComponent.content);
    
    res.json(updatedComponent);
  } catch (error) {
    console.error('Erro ao atualizar componente:', error);
    res.status(500).json({ message: 'Erro ao atualizar componente' });
  }
});

// Reordenar componentes
app.put('/api/pages/:pageId/reorder', authenticateToken, async (req, res) => {
  try {
    const { pageId } = req.params;
    const { componentIds } = req.body; // Array de IDs na nova ordem
    
    // Verificar se a página existe e pertence ao usuário
    const page = await prisma.page.findUnique({
      where: { id: parseInt(pageId) }
    });
    
    if (!page) {
      return res.status(404).json({ message: 'Página não encontrada' });
    }
    
    if (page.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Você não tem permissão para editar esta página' });
    }
    
    // Atualizar a ordem de cada componente
    const updatePromises = componentIds.map((componentId, index) => {
      return prisma.component.update({
        where: { id: parseInt(componentId) },
        data: { order: index }
      });
    });
    
    await prisma.$transaction(updatePromises);
    
    res.json({ message: 'Componentes reordenados com sucesso' });
  } catch (error) {
    console.error('Erro ao reordenar componentes:', error);
    res.status(500).json({ message: 'Erro ao reordenar componentes' });
  }
});

// Excluir componente
app.delete('/api/components/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se o componente existe
    const component = await prisma.component.findUnique({
      where: { id: parseInt(id) },
      include: { page: true }
    });
    
    if (!component) {
      return res.status(404).json({ message: 'Componente não encontrado' });
    }
    
    // Verificar se o usuário tem permissão
    if (component.page.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Você não tem permissão para excluir este componente' });
    }
    
    // Excluir o componente
    await prisma.component.delete({
      where: { id: parseInt(id) }
    });
    
    res.json({ message: 'Componente excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir componente:', error);
    res.status(500).json({ message: 'Erro ao excluir componente' });
  }
});

// Rota pública para visualizar uma página publicada
app.get('/api/public/pages/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const page = await prisma.page.findUnique({
      where: { 
        slug,
        published: true 
      },
      include: {
        components: {
          orderBy: { order: 'asc' }
        }
      }
    });
    
    if (!page) {
      return res.status(404).json({ message: 'Página não encontrada' });
    }
    
    // Converter o conteúdo JSON para objeto em todos os componentes
    const componentsWithParsedContent = page.components.map(component => ({
      ...component,
      content: JSON.parse(component.content)
    }));
    
    // Criando uma nova resposta com os componentes processados e garantindo o estilo
    const responseData = {
      ...page,
      components: componentsWithParsedContent,
      style: page.style || {
        backgroundColor: '#ffffff',
        fontFamily: 'Inter, sans-serif',
        linkColor: '#3b82f6',
        textColor: '#333333'
      }
    };
    
    // Verificar se o estilo está sendo enviado corretamente
    console.log('Enviando estilo para página pública:', responseData.style);
    
    res.json(responseData);
  } catch (error) {
    console.error('Erro ao buscar página pública:', error);
    res.status(500).json({ message: 'Erro ao buscar página' });
  }
});

// Rota para upload de múltiplas imagens
app.post('/api/upload', authenticateToken, upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Nenhuma imagem foi enviada' });
    }

    const urls = req.files.map(file => {
      return `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
    });

    res.json({ urls });
  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({ error: 'Erro ao processar o upload das imagens' });
  }
});

// Rota para deletar uma imagem
app.delete('/api/upload/:filename', authenticateToken, async (req, res) => {
  try {
    const filename = req.params.filename;
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

// Obter estilo da página
app.get('/api/pages/:id/style', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const page = await prisma.page.findUnique({
      where: { 
        id: parseInt(id),
        userId: req.user.userId
      }
    });
    
    if (!page) {
      return res.status(404).json({ message: 'Página não encontrada' });
    }
    
    // Se o page.style for null, retorne um objeto padrão
    const defaultStyle = {
      backgroundColor: '#ffffff',
      fontFamily: 'Inter, sans-serif',
      linkColor: '#3b82f6',
      textColor: '#333333'
    };
    
    res.json({ style: page.style || defaultStyle });
  } catch (error) {
    console.error('Erro ao obter estilo da página:', error);
    res.status(500).json({ message: 'Erro ao obter estilo da página' });
  }
});

// Atualizar estilo da página
app.put('/api/pages/:id/style', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const page = await prisma.page.update({
      where: { 
        id: parseInt(id),
        userId: req.user.userId
      },
      data: {
        style: req.body.style
      }
    });
    
    res.json({ message: 'Estilo atualizado com sucesso', style: page.style });
  } catch (error) {
    console.error('Erro ao atualizar estilo da página:', error);
    res.status(500).json({ message: 'Erro ao atualizar estilo da página' });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
}); 