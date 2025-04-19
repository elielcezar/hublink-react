const express = require('express');
const { PrismaClient } = require('@prisma/client');
const geoip = require('geoip-lite');

const prisma = new PrismaClient();
const router = express.Router();


router.post('/', async (req, res) => {
  try {
    const { 
      pageId, visitorId, eventType, componentId, data, 
      device, browser, os, referer 
    } = req.body;
    
    console.log('Track request received:', {
      pageId, visitorId: visitorId ? visitorId.substring(0, 8) + '...' : null,
      eventType, componentId, dataKeys: data ? Object.keys(data) : null
    });

    if (!pageId) {
      console.error('pageId inválido ou ausente:', pageId);
      return res.status(400).json({ message: 'pageId inválido ou ausente' });
    }
    const pageIdNum = parseInt(pageId, 10);
    if (isNaN(pageIdNum)) {
      console.error('pageId não é um número válido:', pageId);
      return res.status(400).json({ message: 'pageId deve ser um número' });
    }

    try {
      const page = await prisma.page.findUnique({ where: { id: pageIdNum } });
      if (!page) {
        console.error('Página não encontrada com ID:', pageIdNum);
        return res.status(404).json({ message: 'Página não encontrada' });
      }
      console.log('Página encontrada:', { id: page.id, título: page.title });
    } catch (pageError) {
      console.error('Erro ao buscar página:', pageError);
      return res.status(500).json({ message: 'Erro ao verificar página', error: pageError.message });
    }

    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const ipFormatted = ip.includes('::ffff:') ? ip.split('::ffff:')[1] : ip;
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
    const ipPartial = ipFormatted.split('.').slice(0, 3).join('.') + '.*';

    let visit;
    try {
      visit = await prisma.pageVisit.findFirst({
        where: {
          pageId: pageIdNum, visitorId,
          timestamp: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }
        }
      });
      if (!visit) {
        console.log('Criando nova visita para visitante:', visitorId?.substring(0, 8) + '...');
        const geoFields = {};
        if (geoData) {
          geoFields.country = geoData.country;
          geoFields.city = geoData.city;
          geoFields.region = geoData.region;
          if (geoData.ll && geoData.ll.length === 2) {
            geoFields.latitude = geoData.ll[0];
            geoFields.longitude = geoData.ll[1];
          }
        }
        visit = await prisma.pageVisit.create({
          data: { pageId: pageIdNum, visitorId, device, browser, os, referer, ipAddress: ipPartial, ...geoFields }
        });
        console.log('Nova visita criada:', { id: visit.id });
      } else {
        console.log('Visita existente encontrada:', { id: visit.id });
      }
    } catch (visitError) {
      console.error('Erro ao buscar/criar visita:', visitError);
      return res.status(500).json({ message: 'Erro ao registrar visita', error: visitError.message });
    }

    let parsedComponentId = null;
    if (componentId) {
      if (!isNaN(parseInt(componentId))) {
        parsedComponentId = parseInt(componentId);
        console.log('ComponentId convertido para número:', parsedComponentId);
      } else {
        console.log(`Evento de clique em componente automático: ${componentId}`);
      }
    }

    try {
      const eventData = { ...data, rawComponentId: componentId };
      console.log('Criando evento com dados:', { visitId: visit.id, eventType, componentId: parsedComponentId, dataKeys: Object.keys(eventData) });
      const event = await prisma.event.create({
        data: { visitId: visit.id, eventType, componentId: parsedComponentId, data: eventData }
      });
      console.log('Evento criado com sucesso:', { id: event.id });
    } catch (eventError) {
      console.error('Erro ao criar evento:', eventError);
      return res.status(500).json({ message: 'Erro ao registrar evento', error: eventError.message });
    }

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      console.log('Atualizando analytics para:', { pageId: pageIdNum, date: today, eventType });
      await prisma.analytics.upsert({
        where: { pageId_date: { pageId: pageIdNum, date: today } },
        update: {
          visits: { increment: eventType === 'pageview' ? 1 : 0 },
          clicks: { increment: eventType === 'click' ? 1 : 0 }
        },
        create: {
          pageId: pageIdNum, date: today,
          visits: eventType === 'pageview' ? 1 : 0,
          clicks: eventType === 'click' ? 1 : 0,
          uniqueUsers: 0, avgTimeSpent: 0, bounceRate: 0
        }
      });
      console.log('Analytics atualizado com sucesso');
    } catch (analyticsError) {
      console.error('Erro ao atualizar analytics:', analyticsError);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erro ao registrar evento:', error);
    res.status(500).json({ message: 'Erro ao registrar evento', error: error.message });
  }
});

module.exports = router;
// Route for tracking page events