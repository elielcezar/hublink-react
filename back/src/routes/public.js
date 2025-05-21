const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();


router.get('/pages/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    console.log(`Buscando página pública com slug: ${slug}`);
    const page = await prisma.page.findUnique({
      where: { slug },
      include: {
        components: { orderBy: { order: 'asc' } },
        user: { select: { gaId: true } }
      }
    });
    if (!page) {
      console.log(`Página com slug '${slug}' não encontrada`);
      return res.status(404).json({ message: 'Página não encontrada' });
    }
    if (!page.published) {
      console.log(`Página com slug '${slug}' encontrada, mas não está publicada`);
      return res.status(403).json({ message: 'Página não publicada' });
    }
    console.log(`Página encontrada: ${page.id}, título: ${page.title}`);
    console.log(`Encontrados ${page.components.length} componentes`);
    try {
      const componentsWithParsedContent = page.components.map(component => {
        try {
          const parsedContent = JSON.parse(component.content);
          return { ...component, content: parsedContent };
        } catch (parseError) {
          console.error(`Erro ao converter JSON do componente ${component.id}:`, parseError);
          return component;
        }
      });
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
      console.log('Enviando estilo para página pública:', responseData.style);
      res.json(responseData);
    } catch (processingError) {
      console.error('Erro ao processar os componentes:', processingError);
      res.status(500).json({ message: 'Erro ao processar dados da página' });
    }
  } catch (error) {
    console.error('Erro ao buscar página pública:', error);
    res.status(500).json({ message: 'Erro ao buscar página', error: error.message });
  }
});

router.get('/u/:username', async (req, res) => {
  const { username } = req.params;
  
  try {
    // Encontrar o usuário pelo username
    const user = await prisma.user.findUnique({
      where: { username: username }
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Buscar a página principal do usuário (considere criar uma flag isMain na tabela Page)
    // ou use a primeira página do usuário como padrão
    const page = await prisma.page.findFirst({
      where: { 
        userId: user.id,
        published: true
      },
      orderBy: {
        createdAt: 'asc' // A primeira página criada seria a principal
      }
    });

    if (!page) {
      return res.status(404).json({ message: 'Página não encontrada ou não publicada' });
    }

    // Retornar os dados da página
    return res.json(page);
  } catch (error) {
    console.error('Erro ao buscar página do usuário:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router;
// Public routes for viewing pages