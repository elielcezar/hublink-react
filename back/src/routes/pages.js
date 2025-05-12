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


router.get('/', authenticateToken, async (req, res) => {
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


router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, slug } = req.body;
    const existingPage = await prisma.page.findUnique({ where: { slug } });
    if (existingPage) {
      return res.status(400).json({ message: 'Esta URL já está em uso' });
    }
    const page = await prisma.page.create({
      data: { title, slug, userId: req.user.userId }
    });
    res.status(201).json(page);
  } catch (error) {
    console.error('Erro ao criar página:', error);
    res.status(500).json({ message: 'Erro ao criar página' });
  }
});


router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const page = await prisma.page.findUnique({
      where: { id: parseInt(id) },
      include: { components: { orderBy: { order: 'asc' } } }
    });
    if (!page) {
      return res.status(404).json({ message: 'Página não encontrada' });
    }
    if (page.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Você não tem permissão para acessar esta página' });
    }
    res.json(page);
  } catch (error) {
    console.error('Erro ao buscar página:', error);
    res.status(500).json({ message: 'Erro ao buscar detalhes da página' });
  }
});


router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, slug, published } = req.body;
    const existingPage = await prisma.page.findUnique({ where: { id: parseInt(id) } });
    if (!existingPage) {
      return res.status(404).json({ message: 'Página não encontrada' });
    }
    if (existingPage.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Você não tem permissão para editar esta página' });
    }
    if (slug && slug !== existingPage.slug) {
      const slugExists = await prisma.page.findUnique({ where: { slug } });
      if (slugExists) {
        return res.status(400).json({ message: 'Esta URL já está em uso' });
      }
    }
    const updatedPage = await prisma.page.update({
      where: { id: parseInt(id) },
      data: { title, slug, published }
    });
    res.json(updatedPage);
  } catch (error) {
    console.error('Erro ao atualizar página:', error);
    res.status(500).json({ message: 'Erro ao atualizar página' });
  }
});


router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const page = await prisma.page.findUnique({ where: { id: parseInt(id) } });
    if (!page) {
      return res.status(404).json({ message: 'Página não encontrada' });
    }
    if (page.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Você não tem permissão para excluir esta página' });
    }
    await prisma.page.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Página excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir página:', error);
    res.status(500).json({ message: 'Erro ao excluir página' });
  }
});


router.post('/:pageId/components', authenticateToken, async (req, res) => {
  try {
    const { pageId } = req.params;
    const { type, content } = req.body;
    const page = await prisma.page.findUnique({ where: { id: parseInt(pageId) } });
    if (!page) {
      return res.status(404).json({ message: 'Página não encontrada' });
    }
    if (page.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Você não tem permissão para editar esta página' });
    }
    const lastComponent = await prisma.component.findFirst({
      where: { pageId: parseInt(pageId) },
      orderBy: { order: 'desc' }
    });
    const nextOrder = lastComponent ? lastComponent.order + 1 : 0;
    const component = await prisma.component.create({
      data: {
        type,
        content: JSON.stringify(content),
        order: nextOrder,
        pageId: parseInt(pageId)
      }
    });
    component.content = JSON.parse(component.content);
    res.status(201).json(component);
  } catch (error) {
    console.error('Erro ao adicionar componente:', error);
    res.status(500).json({ message: 'Erro ao adicionar componente' });
  }
});


router.put('/:pageId/reorder', authenticateToken, async (req, res) => {
  try {
    const { pageId } = req.params;
    const { componentIds } = req.body;
    const page = await prisma.page.findUnique({ where: { id: parseInt(pageId) } });
    if (!page) {
      return res.status(404).json({ message: 'Página não encontrada' });
    }
    if (page.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Você não tem permissão para editar esta página' });
    }
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


router.get('/:id/style', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const page = await prisma.page.findUnique({
      where: { id: parseInt(id), userId: req.user.userId }
    });
    if (!page) {
      return res.status(404).json({ message: 'Página não encontrada' });
    }
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


router.put('/:id/style', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const page = await prisma.page.update({
      where: { id: parseInt(id), userId: req.user.userId },
      data: { style: req.body.style }
    });
    res.json({ message: 'Estilo atualizado com sucesso', style: page.style });
  } catch (error) {
    console.error('Erro ao atualizar estilo da página:', error);
    res.status(500).json({ message: 'Erro ao atualizar estilo da página' });
  }
});


router.put('/:id/components', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { components } = req.body;
    const page = await prisma.page.findUnique({
      where: { id: parseInt(id), userId: req.user.userId }
    });
    if (!page) {
      return res.status(404).json({ error: 'Página não encontrada ou acesso negado' });
    }
    const updatedComponents = [];
    for (const component of components) {
      const contentToSave = typeof component.content === 'object' 
        ? JSON.stringify(component.content) 
        : component.content;
      if (component.id && !isNaN(component.id)) {
        const existingComponent = await prisma.component.findUnique({
          where: { id: parseInt(component.id), pageId: parseInt(id) }
        });
        if (existingComponent) {
          const updatedComponent = await prisma.component.update({
            where: { id: parseInt(component.id) },
            data: { type: component.type, content: contentToSave, order: component.order }
          });
          updatedComponents.push(updatedComponent);
        }
      } else {
        const newComponent = await prisma.component.create({
          data: { pageId: parseInt(id), type: component.type, content: contentToSave, order: component.order }
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


router.get('/:id/analytics', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { period = '7d' } = req.query;
    console.log(`Obtendo analytics para página ${id}, período: ${period}`);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    if (period === '7d') startDate.setDate(startDate.getDate() - 6);
    else if (period === '30d') startDate.setDate(startDate.getDate() - 29);
    else if (period === '90d') startDate.setDate(startDate.getDate() - 89);
    else if (period === 'all') startDate = new Date(0);

    const page = await prisma.page.findUnique({ where: { id: parseInt(id) }, select: { userId: true } });
    if (!page) return res.status(404).json({ message: 'Página não encontrada' });
    if (page.userId !== req.user.userId) return res.status(403).json({ message: 'Você não tem permissão para acessar os analytics desta página' });

    const totalVisits = await prisma.pageVisit.count({ where: { pageId: parseInt(id), timestamp: { gte: startDate, lte: today } } });
    console.log(`Total de visitas contabilizadas: ${totalVisits}`);
    const totalClicks = await prisma.event.count({ where: { visit: { pageId: parseInt(id), timestamp: { gte: startDate } }, eventType: 'click' } });
    console.log(`Total de cliques contabilizados: ${totalClicks}`);

    const visitsPerDay = await prisma.$queryRaw`
      SELECT DATE(timestamp) as date, COUNT(*) as count 
      FROM PageVisit 
      WHERE pageId = ${parseInt(id)} AND timestamp >= ${startDate}
      GROUP BY DATE(timestamp) ORDER BY date ASC
    `;
    console.log('Visitas por dia:', visitsPerDay);
    const clicksPerDay = await prisma.$queryRaw`
      SELECT DATE(pv.timestamp) as date, COUNT(e.id) as count 
      FROM Event e JOIN PageVisit pv ON e.visitId = pv.id
      WHERE pv.pageId = ${parseInt(id)} AND pv.timestamp >= ${startDate} AND e.eventType = 'click'
      GROUP BY DATE(pv.timestamp) ORDER BY date ASC
    `;
    console.log('Cliques por dia:', clicksPerDay);

    const datesMap = new Map();
    visitsPerDay.forEach(item => {
      const dateStr = new Date(item.date).toISOString().split('T')[0];
      datesMap.set(dateStr, { date: new Date(dateStr), visits: Number(item.count), clicks: 0 });
    });
    clicksPerDay.forEach(item => {
      const dateStr = new Date(item.date).toISOString().split('T')[0];
      if (datesMap.has(dateStr)) {
        datesMap.get(dateStr).clicks = Number(item.count);
      } else {
        datesMap.set(dateStr, { date: new Date(dateStr), visits: 0, clicks: Number(item.count) });
      }
    });
    const dailyStats = Array.from(datesMap.values()).sort((a, b) => a.date - b.date).map(item => ({ ...item, uniqueUsers: 0, avgTimeSpent: 0, bounceRate: 0 }));
    console.log(`Estatísticas diárias preparadas: ${dailyStats.length} dias`);

    const deviceStats = await prisma.pageVisit.groupBy({ by: ['device'], where: { pageId: parseInt(id), timestamp: { gte: startDate } }, _count: { id: true } });
    const formattedDeviceStats = deviceStats.map(item => ({ device: item.device || 'desconhecido', count: item._count.id }));

    const componentClicks = await prisma.event.findMany({ where: { visit: { pageId: parseInt(id), timestamp: { gte: startDate } }, eventType: 'click', componentId: { not: null } }, include: { component: { select: { id: true, type: true, content: true } } } });
    const autoComponentClicks = await prisma.event.findMany({ where: { visit: { pageId: parseInt(id), timestamp: { gte: startDate } }, eventType: 'click', componentId: null }, select: { data: true } });
    const clicksByComponent = {};
    componentClicks.forEach(click => {
      if (click.component) {
        let title = '';
        try {
          const content = typeof click.component.content === 'string' ? JSON.parse(click.component.content) : click.component.content;
          title = content.title || '';
        } catch (e) { console.error('Erro ao extrair título do componente:', e); }
        const key = `${click.component.id}-${click.component.type}`;
        if (!clicksByComponent[key]) clicksByComponent[key] = { id: click.component.id, type: click.component.type, title: title, clicks: 0 };
        clicksByComponent[key].clicks++;
      }
    });
    autoComponentClicks.forEach(click => {
      // Check if data exists and componentType is present
      if (click.data && typeof click.data === 'object' && click.data.componentType) {
        const rawId = click.data.rawComponentId || 'auto'; // Use rawComponentId if available
        const type = click.data.componentType;
        const title = click.data.componentTitle || '';
        let socialType = null; // Initialize socialType

        // --- START MODIFICATION ---
        // If it's a social component, try to extract the specific social type
        // Adjusted path based on potential structure from AnalyticsTracker
        if (type === 'social' && click.data.targetInfo?.elementData?.['data-social-type']) {
          socialType = click.data.targetInfo.elementData['data-social-type'];
        } else if (type === 'social' && click.data?.elementData?.['data-social-type']) { 
          // Fallback check if targetInfo is not present
          socialType = click.data.elementData['data-social-type'];
        }

        // Use a more specific key for social types
        const key = type === 'social' && socialType 
          ? `${rawId}-social-${socialType}` 
          : `${rawId}-${type}`;
        
        if (!clicksByComponent[key]) {
          clicksByComponent[key] = { 
            id: rawId, // Keep original component ID/rawId for reference
            type: type, 
            title: title, 
            clicks: 0, 
            isAuto: true // Mark as auto-detected click
          };
          // Add socialType if it exists
          if (socialType) {
            clicksByComponent[key].socialType = socialType;
          }
        }
        // --- END MODIFICATION ---
        
        clicksByComponent[key].clicks++;
      } else {
         // Optional: Log clicks with missing data for debugging
         // console.log('Skipping click event due to missing data structure:', click?.data);
      }
    });

    const timeData = await prisma.event.findMany({ where: { visit: { pageId: parseInt(id), timestamp: { gte: startDate } }, eventType: 'exit' }, select: { data: true } });
    let totalTime = 0, timeCount = 0;
    timeData.forEach(event => {
      if (event.data && typeof event.data === 'object' && event.data.timeSpent) {
        totalTime += Number(event.data.timeSpent);
        timeCount++;
      }
    });
    const avgTimeSpent = timeCount > 0 ? (totalTime / timeCount) : 0;

    const totalVisitors = await prisma.pageVisit.count({ where: { pageId: parseInt(id), timestamp: { gte: startDate } } });
    const singlePageVisitors = await prisma.pageVisit.count({ where: { pageId: parseInt(id), timestamp: { gte: startDate }, events: { none: { OR: [{ eventType: 'click' }, { eventType: 'scroll' }] } } } });
    const bounceRate = totalVisitors > 0 ? (singlePageVisitors / totalVisitors) * 100 : 0;

    const locationStats = await prisma.pageVisit.groupBy({ by: ['country'], where: { pageId: parseInt(id), timestamp: { gte: startDate, lte: today }, country: { not: null } }, _count: { id: true }, orderBy: { _count: { id: 'desc' } } });
    const formattedLocationStats = locationStats.map(item => ({ country: item.country || 'Desconhecido', count: item._count.id }));
    console.log('Estatísticas de localização:', formattedLocationStats);

    const cityStats = await prisma.pageVisit.groupBy({ by: ['city', 'country'], where: { pageId: parseInt(id), timestamp: { gte: startDate, lte: today }, city: { not: null } }, _count: { id: true }, orderBy: { _count: { id: 'desc' } }, take: 10 });
    const formattedCityStats = cityStats.map(item => ({ city: item.city || 'Desconhecido', country: item.country || 'Desconhecido', count: item._count.id }));

    const geoData = await prisma.pageVisit.findMany({ where: { pageId: parseInt(id), timestamp: { gte: startDate, lte: today }, latitude: { not: null }, longitude: { not: null } }, select: { latitude: true, longitude: true, city: true, country: true }, distinct: ['latitude', 'longitude'] });

    let trafficSources = [];
    const visitsByReferer = await prisma.pageVisit.findMany({ where: { pageId: parseInt(id), timestamp: { gte: startDate, lte: today }, referer: { not: null } }, select: { referer: true } });
    const directVisits = await prisma.pageVisit.count({ where: { pageId: parseInt(id), timestamp: { gte: startDate, lte: today }, OR: [{ referer: null }, { referer: "" }, { referer: "about:blank" }] } });
    if (directVisits > 0) trafficSources.push({ type: 'category', source: 'direct', count: directVisits });

    const refererMap = new Map();
    const categoryMap = new Map([['direct', 0], ['social', 0], ['search', 0], ['referral', 0], ['email', 0], ['unknown', 0]]);
    visitsByReferer.forEach(visit => {
      if (!visit.referer) return;
      let referer = visit.referer.toLowerCase();
      let category = 'unknown';
      try {
        const url = new URL(referer);
        referer = url.hostname;
        if (referer.includes('facebook.com') || referer.includes('instagram.com') || referer.includes('twitter.com') || referer.includes('linkedin.com') || referer.includes('youtube.com') || referer.includes('tiktok.com')) category = 'social';
        else if (referer.includes('google.') || referer.includes('bing.com') || referer.includes('yahoo.com') || referer.includes('search.')) category = 'search';
        else if (referer.includes('mail.') || referer.includes('outlook.') || referer.includes('gmail.') || referer.includes('newsletter')) category = 'email';
        else if (referer) category = 'referral';
      } catch (e) { console.error('Erro ao processar referer URL:', e); }
      refererMap.set(referer, (refererMap.get(referer) || 0) + 1);
      categoryMap.set(category, categoryMap.get(category) + 1);
    });
    categoryMap.forEach((count, source) => { if (count > 0) trafficSources.push({ type: 'category', source, count }); });
    refererMap.forEach((count, source) => { trafficSources.push({ type: 'referrer', source, count }); });

    const utmData = {};
    try {
      visitsByReferer.forEach(visit => {
        if (!visit.referer) return;
        try {
          const url = new URL(visit.referer);
          const utm_source = url.searchParams.get('utm_source');
          const utm_medium = url.searchParams.get('utm_medium');
          const utm_campaign = url.searchParams.get('utm_campaign');
          if (utm_source || utm_medium || utm_campaign) {
            const key = `${utm_campaign || ''}|${utm_source || ''}|${utm_medium || ''}`;
            if (!utmData[key]) utmData[key] = { campaign: utm_campaign, source: utm_source, medium: utm_medium, count: 0 };
            utmData[key].count++;
          }
        } catch (e) { /* Ignorar URLs inválidas */ }
      });
      Object.values(utmData).forEach(utm => { trafficSources.push({ type: 'campaign', source: utm.source, medium: utm.medium, campaign: utm.campaign, count: utm.count }); });
    } catch (e) { console.error('Erro ao processar UTMs:', e); }
    console.log(`Processadas ${trafficSources.length} fontes de tráfego`);

    if (dailyStats.length === 0) {
      return res.json({ dailyStats: [], deviceStats: [], componentClicks: [], trafficSources: [], summary: { totalVisits: 0, totalClicks: 0, avgTimeSpent: 0, bounceRate: 0 } });
    }

    res.json({
      dailyStats,
      deviceStats: formattedDeviceStats,
      locationStats: formattedLocationStats,
      cityStats: formattedCityStats,
      geoData,
      componentClicks: Object.values(clicksByComponent),
      trafficSources,
      summary: { totalVisits, totalClicks, avgTimeSpent, bounceRate }
    });
  } catch (error) {
    console.error('Erro ao buscar analytics:', error);
    res.status(500).json({ message: 'Erro ao buscar analytics', error: error.message });
  }
});

module.exports = router;
// Routes for managing pages, styles, components within pages, and analytics