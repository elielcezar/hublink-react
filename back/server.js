const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const geoip = require('geoip-lite');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3002;

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
app.use(cors({
  origin: '*', // Permite todas as origens
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
}));
app.use(express.json());

// Servir arquivos estáticos da pasta uploads com cabeçalhos otimizados
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Cache-Control', 'public, max-age=31536000'); // Cache por 1 ano
  next();
}, express.static(path.join(__dirname, 'uploads')));

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

// Rota protegida para obter usuário atual com detalhes completos
app.get('/api/user/details', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        gaId: true,
        role: true
      }
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
        },
        user: {
          select: {
            gaId: true
          }
        }
      }
    });
    
    if (!page) {
      return res.status(404).json({ message: 'Página não encontrada ou não publicada' });
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

    // Usar caminhos relativos
    const urls = req.files.map(file => {
      return `/uploads/${file.filename}`;
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

// Adicione esta rota para atualizar todos os componentes de uma página
app.put('/api/pages/:id/components', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { components } = req.body;
    
    // Verificar se a página existe e pertence ao usuário
    const page = await prisma.page.findUnique({
      where: { 
        id,
        userId: req.user.userId
      }
    });
    
    if (!page) {
      return res.status(404).json({ error: 'Página não encontrada ou acesso negado' });
    }
    
    // Para cada componente, atualizar ou criar
    const updatedComponents = [];
    
    for (const component of components) {
      // Se o componente já tem ID no banco, atualize-o
      if (component.id && !isNaN(component.id)) {
        const existingComponent = await prisma.component.findUnique({
          where: { 
            id: component.id,
            pageId: id
          }
        });
        
        if (existingComponent) {
          // Normalizar o conteúdo para garantir que seja uma string JSON
          const contentToSave = typeof component.content === 'object' 
            ? JSON.stringify(component.content) 
            : component.content;
            
          const updatedComponent = await prisma.component.update({
            where: { id: parseInt(component.id) },
            data: {
              type: component.type,
              content: contentToSave,
              order: component.order
            }
          });
          
          updatedComponents.push(updatedComponent);
        }
      } 
      // Se for um componente novo, crie-o
      else {
        const contentToSave = typeof component.content === 'object' 
          ? JSON.stringify(component.content) 
          : component.content;
          
        const newComponent = await prisma.component.create({
          data: {
            pageId: id,
            type: component.type,
            content: contentToSave,
            order: component.order
          }
        });
        
        updatedComponents.push(newComponent);
      }
    }
    
    res.json(updatedComponents);
  } catch (error) {
    console.error('Erro ao atualizar componentes:', error);
    res.status(500).json({ error: 'Erro ao atualizar componentes' });
  }
});

// Rota para rastreamento de eventos (pública)
app.post('/api/track', async (req, res) => {
  try {
    const { 
      pageId, 
      visitorId, 
      eventType, 
      componentId, 
      data, 
      device, 
      browser, 
      os, 
      referer 
    } = req.body;
    
    console.log('Track request received:', {
      pageId, 
      visitorId: visitorId ? visitorId.substring(0, 8) + '...' : null, // Log parcial para privacidade
      eventType,
      componentId,
      dataKeys: data ? Object.keys(data) : null
    });
    
    // Verificar se o pageId é válido
    if (!pageId) {
      console.error('pageId inválido ou ausente:', pageId);
      return res.status(400).json({ message: 'pageId inválido ou ausente' });
    }
    
    // Verificar se o pageId é numérico
    const pageIdNum = parseInt(pageId, 10);
    if (isNaN(pageIdNum)) {
      console.error('pageId não é um número válido:', pageId);
      return res.status(400).json({ message: 'pageId deve ser um número' });
    }
    
    // Verificar se a página existe
    try {
      const page = await prisma.page.findUnique({
        where: { id: pageIdNum }
      });
      
      if (!page) {
        console.error('Página não encontrada com ID:', pageIdNum);
        return res.status(404).json({ message: 'Página não encontrada' });
      }
      
      console.log('Página encontrada:', { id: page.id, título: page.title });
    } catch (pageError) {
      console.error('Erro ao buscar página:', pageError);
      return res.status(500).json({ message: 'Erro ao verificar página', error: pageError.message });
    }
    
    // Obter o endereço IP do cliente
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const ipFormatted = ip.includes('::ffff:') ? ip.split('::ffff:')[1] : ip;
    
    // Obter informações de geolocalização usando geoip-lite
    let geoData = null;
    try {
      if (ipFormatted !== '127.0.0.1' && ipFormatted !== '::1') {
        geoData = geoip.lookup(ipFormatted);
        console.log('Informações de geolocalização:', geoData);
      } else {
        console.log('Endereço local detectado, não é possível obter geolocalização');
      }
    } catch (geoError) {
      console.error('Erro ao obter geolocalização:', geoError);
    }
    
    // Armazenar apenas os 3 primeiros octetos do IP para privacidade
    const ipPartial = ipFormatted.split('.').slice(0, 3).join('.') + '.*';
    
    // Buscar ou criar visita
    let visit;
    try {
      visit = await prisma.pageVisit.findFirst({
        where: {
          pageId: pageIdNum,
          visitorId,
          timestamp: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      });
      
      if (!visit) {
        console.log('Criando nova visita para visitante:', visitorId?.substring(0, 8) + '...');
        
        // Preparar os dados de geolocalização
        const geoFields = {};
        if (geoData) {
          geoFields.country = geoData.country;
          geoFields.city = geoData.city;
          geoFields.region = geoData.region;
          
          // Verificar se as coordenadas estão disponíveis
          if (geoData.ll && geoData.ll.length === 2) {
            geoFields.latitude = geoData.ll[0];
            geoFields.longitude = geoData.ll[1];
          }
        }
        
        visit = await prisma.pageVisit.create({
          data: {
            pageId: pageIdNum,
            visitorId,
            device,
            browser,
            os,
            referer,
            ipAddress: ipPartial,
            ...geoFields
          }
        });
        console.log('Nova visita criada:', { id: visit.id });
      } else {
        console.log('Visita existente encontrada:', { id: visit.id });
      }
    } catch (visitError) {
      console.error('Erro ao buscar/criar visita:', visitError);
      return res.status(500).json({ message: 'Erro ao registrar visita', error: visitError.message });
    }
    
    // Verificar se o componentId é um número ou um ID automático
    let parsedComponentId = null;
    if (componentId) {
      if (!isNaN(parseInt(componentId))) {
        parsedComponentId = parseInt(componentId);
        console.log('ComponentId convertido para número:', parsedComponentId);
      } else {
        // É um ID automático (como "auto-link-1") - apenas registramos mas não vinculamos a um componente
        console.log(`Evento de clique em componente automático: ${componentId}`);
      }
    }
    
    // Registrar evento
    try {
      const eventData = {
        ...data,
        rawComponentId: componentId // Guardar o ID original mesmo que seja uma string
      };
      
      console.log('Criando evento com dados:', {
        visitId: visit.id,
        eventType,
        componentId: parsedComponentId,
        dataKeys: Object.keys(eventData)
      });
      
      const event = await prisma.event.create({
        data: {
          visitId: visit.id,
          eventType,
          componentId: parsedComponentId,
          data: eventData
        }
      });
      
      console.log('Evento criado com sucesso:', { id: event.id });
    } catch (eventError) {
      console.error('Erro ao criar evento:', eventError);
      return res.status(500).json({ message: 'Erro ao registrar evento', error: eventError.message });
    }
    
    // Atualizar tabela de analytics
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      console.log('Atualizando analytics para:', {
        pageId: pageIdNum,
        date: today,
        eventType
      });
      
      await prisma.analytics.upsert({
        where: {
          pageId_date: {
            pageId: pageIdNum,
            date: today
          }
        },
        update: {
          visits: { increment: eventType === 'pageview' ? 1 : 0 },
          clicks: { increment: eventType === 'click' ? 1 : 0 }
        },
        create: {
          pageId: pageIdNum,
          date: today,
          visits: eventType === 'pageview' ? 1 : 0,
          clicks: eventType === 'click' ? 1 : 0,
          uniqueUsers: 0,
          avgTimeSpent: 0,
          bounceRate: 0
        }
      });
      
      console.log('Analytics atualizado com sucesso');
    } catch (analyticsError) {
      console.error('Erro ao atualizar analytics:', analyticsError);
      // Não retornamos erro aqui, pois o evento já foi registrado
      // Apenas logamos o erro e continuamos
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erro ao registrar evento:', error);
    res.status(500).json({ message: 'Erro ao registrar evento', error: error.message });
  }
});

// Rota para obter analytics (autenticada)
app.get('/api/pages/:id/analytics', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { period = '7d' } = req.query;
    
    console.log(`Obtendo analytics para página ${id}, período: ${period}`);
    
    // Definir intervalo de datas com base no período
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    
    if (period === '7d') {
      startDate.setDate(startDate.getDate() - 6);
    } else if (period === '30d') {
      startDate.setDate(startDate.getDate() - 29);
    } else if (period === '90d') {
      startDate.setDate(startDate.getDate() - 89);
    } else if (period === 'all') {
      startDate = new Date(0); // Desde o início
    }
    
    // Verificar permissão do usuário para acessar esta página
    const page = await prisma.page.findUnique({
      where: { id: parseInt(id) },
      select: { userId: true }
    });
    
    if (!page) {
      return res.status(404).json({ message: 'Página não encontrada' });
    }
    
    if (page.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Você não tem permissão para acessar os analytics desta página' });
    }
    
    // Calcular total de visitas diretamente da tabela de visitas
    const totalVisits = await prisma.pageVisit.count({
      where: {
        pageId: parseInt(id),
        timestamp: {
          gte: startDate,
          lte: today
        }
      }
    });
    
    console.log(`Total de visitas contabilizadas: ${totalVisits}`);
    
    // Calcular total de cliques diretamente da tabela de eventos
    const totalClicks = await prisma.event.count({
      where: {
        visit: {
          pageId: parseInt(id),
          timestamp: { gte: startDate }
        },
        eventType: 'click'
      }
    });
    
    console.log(`Total de cliques contabilizados: ${totalClicks}`);
    
    // Buscar analytics diários
    // Em vez de usar a tabela analytics, vamos calcular diretamente das visitas e eventos
    
    // Primeiro, vamos obter todas as datas que têm visitas
    const visitsPerDay = await prisma.$queryRaw`
      SELECT 
        DATE(timestamp) as date, 
        COUNT(*) as count 
      FROM PageVisit 
      WHERE pageId = ${parseInt(id)} 
        AND timestamp >= ${startDate}
      GROUP BY DATE(timestamp)
      ORDER BY date ASC
    `;
    
    console.log('Visitas por dia:', visitsPerDay);
    
    // Agora, vamos obter os cliques por dia
    const clicksPerDay = await prisma.$queryRaw`
      SELECT 
        DATE(pv.timestamp) as date, 
        COUNT(e.id) as count 
      FROM Event e
      JOIN PageVisit pv ON e.visitId = pv.id
      WHERE pv.pageId = ${parseInt(id)} 
        AND pv.timestamp >= ${startDate}
        AND e.eventType = 'click'
      GROUP BY DATE(pv.timestamp)
      ORDER BY date ASC
    `;
    
    console.log('Cliques por dia:', clicksPerDay);
    
    // Combinar os dados de visitas e cliques por dia
    const datesMap = new Map();
    
    // Adicionar datas de visitas
    visitsPerDay.forEach(item => {
      const dateStr = new Date(item.date).toISOString().split('T')[0];
      datesMap.set(dateStr, { 
        date: new Date(dateStr),
        visits: Number(item.count),
        clicks: 0
      });
    });
    
    // Adicionar cliques às datas existentes ou criar novas
    clicksPerDay.forEach(item => {
      const dateStr = new Date(item.date).toISOString().split('T')[0];
      if (datesMap.has(dateStr)) {
        const data = datesMap.get(dateStr);
        data.clicks = Number(item.count);
        datesMap.set(dateStr, data);
      } else {
        datesMap.set(dateStr, {
          date: new Date(dateStr),
          visits: 0,
          clicks: Number(item.count)
        });
      }
    });
    
    // Ordenar as datas e formatar para response
    const dailyStats = Array.from(datesMap.values())
      .sort((a, b) => a.date - b.date)
      .map(item => ({
        date: item.date,
        visits: item.visits,
        clicks: item.clicks,
        uniqueUsers: 0, // Poderia ser calculado, mas não é necessário agora
        avgTimeSpent: 0, // Idem
        bounceRate: 0    // Idem
      }));
    
    console.log(`Estatísticas diárias preparadas: ${dailyStats.length} dias`);
    
    // Buscar estatísticas de dispositivos
    const deviceStats = await prisma.pageVisit.groupBy({
      by: ['device'],
      where: {
        pageId: parseInt(id),
        timestamp: { gte: startDate }
      },
      _count: {
        id: true
      }
    });
    
    // Formatar dados de dispositivos
    const formattedDeviceStats = deviceStats.map(item => ({
      device: item.device || 'desconhecido',
      count: item._count.id
    }));
    
    // Buscar estatísticas de cliques por componente (componentes reais do banco)
    const componentClicks = await prisma.event.findMany({
      where: {
        visit: {
          pageId: parseInt(id),
          timestamp: { gte: startDate }
        },
        eventType: 'click',
        componentId: { not: null }
      },
      include: {
        component: {
          select: {
            id: true,
            type: true,
            content: true
          }
        }
      }
    });
    
    // Buscar cliques em componentes automáticos
    const autoComponentClicks = await prisma.event.findMany({
      where: {
        visit: {
          pageId: parseInt(id),
          timestamp: { gte: startDate }
        },
        eventType: 'click',
        componentId: null
      },
      select: {
        data: true
      }
    });
    
    // Agrupar cliques por componente real
    const clicksByComponent = {};
    componentClicks.forEach(click => {
      if (click.component) {
        // Tentar extrair o título ou nome do componente
        let title = '';
        try {
          const content = typeof click.component.content === 'string' 
            ? JSON.parse(click.component.content) 
            : click.component.content;
          
          title = content.title || '';
        } catch (e) {
          console.error('Erro ao extrair título do componente:', e);
        }
        
        const key = `${click.component.id}-${click.component.type}`;
        if (!clicksByComponent[key]) {
          clicksByComponent[key] = {
            id: click.component.id,
            type: click.component.type,
            title: title,
            clicks: 0
          };
        }
        clicksByComponent[key].clicks++;
      }
    });
    
    // Agrupar cliques por componente automático
    autoComponentClicks.forEach(click => {
      if (click.data && click.data.componentType) {
        const rawId = click.data.rawComponentId || 'auto';
        const type = click.data.componentType;
        const title = click.data.componentTitle || '';
        const key = `${rawId}-${type}`;
        
        if (!clicksByComponent[key]) {
          clicksByComponent[key] = {
            id: rawId,
            type: type,
            title: title,
            clicks: 0,
            isAuto: true
          };
        }
        clicksByComponent[key].clicks++;
      }
    });
    
    // Dados de tempo na página
    const timeData = await prisma.event.findMany({
      where: {
        visit: {
          pageId: parseInt(id),
          timestamp: { gte: startDate }
        },
        eventType: 'exit'
      },
      select: {
        data: true
      }
    });
    
    // Calcular tempo médio na página
    let totalTime = 0;
    let timeCount = 0;
    
    timeData.forEach(event => {
      if (event.data && typeof event.data === 'object' && event.data.timeSpent) {
        totalTime += Number(event.data.timeSpent);
        timeCount++;
      }
    });
    
    const avgTimeSpent = timeCount > 0 ? (totalTime / timeCount) : 0;
    
    // Calcular taxa de rejeição (visitas com apenas um pageview)
    const totalVisitors = await prisma.pageVisit.count({
      where: {
        pageId: parseInt(id),
        timestamp: { gte: startDate }
      }
    });
    
    const singlePageVisitors = await prisma.pageVisit.count({
      where: {
        pageId: parseInt(id),
        timestamp: { gte: startDate },
        events: {
          none: {
            OR: [
              { eventType: 'click' },
              { eventType: 'scroll' }
            ]
          }
        }
      }
    });
    
    const bounceRate = totalVisitors > 0 ? (singlePageVisitors / totalVisitors) * 100 : 0;
    
    // Obter dados de localização (países)
    const locationStats = await prisma.pageVisit.groupBy({
      by: ['country'],
      where: {
        pageId: parseInt(id),
        timestamp: {
          gte: startDate,
          lte: today
        },
        country: {
          not: null
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    });
    
    // Formatar dados de localização
    const formattedLocationStats = locationStats.map(item => ({
      country: item.country || 'Desconhecido',
      count: item._count.id
    }));
    
    console.log('Estatísticas de localização:', formattedLocationStats);
    
    // Obter dados de cidades mais populares
    const cityStats = await prisma.pageVisit.groupBy({
      by: ['city', 'country'],
      where: {
        pageId: parseInt(id),
        timestamp: {
          gte: startDate,
          lte: today
        },
        city: {
          not: null
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 10 // Limitar às 10 principais cidades
    });
    
    // Formatar dados de cidades
    const formattedCityStats = cityStats.map(item => ({
      city: item.city || 'Desconhecido',
      country: item.country || 'Desconhecido',
      count: item._count.id
    }));
    
    // Obter coordenadas geográficas para mapeamento
    const geoData = await prisma.pageVisit.findMany({
      where: {
        pageId: parseInt(id),
        timestamp: {
          gte: startDate,
          lte: today
        },
        latitude: { not: null },
        longitude: { not: null }
      },
      select: {
        latitude: true,
        longitude: true,
        city: true,
        country: true
      },
      distinct: ['latitude', 'longitude']
    });
    
    // Se não existem estatísticas, retornar dados vazios formatados
    if (dailyStats.length === 0) {
      const emptyStats = {
        dailyStats: [],
        deviceStats: [],
        componentClicks: [],
        summary: {
          totalVisits: 0,
          totalClicks: 0,
          avgTimeSpent: 0,
          bounceRate: 0
        }
      };
      return res.json(emptyStats);
    }
    
    // Montar o objeto de resposta
    res.json({
      dailyStats,
      deviceStats: formattedDeviceStats,
      locationStats: formattedLocationStats,
      cityStats: formattedCityStats,
      geoData,
      componentClicks: Object.values(clicksByComponent),
      summary: {
        totalVisits,
        totalClicks,
        avgTimeSpent,
        bounceRate
      }
    });
  } catch (error) {
    console.error('Erro ao buscar analytics:', error);
    res.status(500).json({ message: 'Erro ao buscar analytics', error: error.message });
  }
});

// Rota para atualizar o ID do Google Analytics do usuário
app.put('/api/user/ga-config', authenticateToken, async (req, res) => {
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

// Rota de health check para diagnóstico
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    cors: 'enabled'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
}); 