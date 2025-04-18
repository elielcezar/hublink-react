// Script para converter URLs de imagens para caminhos relativos
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateImageUrls() {
  console.log('Iniciando conversão de URLs de imagens para caminhos relativos...');
  
  try {
    // 1. Atualizar logos nas páginas
    const pages = await prisma.page.findMany();
    let pageUpdateCount = 0;
    
    for (const page of pages) {
      if (page.style && page.style.logo && typeof page.style.logo === 'string') {
        // Se a URL contém uma referência a localhost com porta
        if (page.style.logo.includes('localhost:3001') || page.style.logo.includes('localhost:3002')) {
          // Extrair apenas o caminho após /uploads/
          const matches = page.style.logo.match(/\/uploads\/(.+)$/);
          
          if (matches && matches[1]) {
            const relativePath = `/uploads/${matches[1]}`;
            
            const updatedStyle = {
              ...page.style,
              logo: relativePath
            };
            
            await prisma.page.update({
              where: { id: page.id },
              data: { style: updatedStyle }
            });
            
            pageUpdateCount++;
            console.log(`Página ${page.id}: Logo atualizado para caminho relativo ${relativePath}`);
          }
        }
      }
    }
    
    console.log(`Atualizadas ${pageUpdateCount} páginas`);
    
    // 2. Atualizar componentes
    const components = await prisma.component.findMany();
    let updatedCount = 0;
    
    for (const component of components) {
      if (component.content && typeof component.content === 'string') {
        let updatedContent = component.content;
        let modified = false;
        
        // Padrão para URLs absolutas com porta
        if (updatedContent.includes('localhost:3001') || updatedContent.includes('localhost:3002')) {
          updatedContent = updatedContent.replace(/(http|https):\/\/localhost:(3001|3002)\/uploads\/([^"')\s]+)/g, '/uploads/$3');
          modified = true;
        }
        
        // Padrões específicos para strings JSON
        updatedContent = updatedContent.replace(/"imageUrl":"http:\/\/localhost:3002\/uploads\//g, '"imageUrl":"/uploads/');
        updatedContent = updatedContent.replace(/"url":"http:\/\/localhost:3002\/uploads\//g, '"url":"/uploads/');
        
        if (modified || updatedContent !== component.content) {
          await prisma.component.update({
            where: { id: component.id },
            data: { content: updatedContent }
          });
          
          updatedCount++;
          console.log(`Componente ${component.id} atualizado para usar caminhos relativos`);
        }
      }
    }
    
    console.log(`Atualizados ${updatedCount} componentes`);
    console.log('Processo de atualização concluído com sucesso!');
  } catch (error) {
    console.error('Erro durante a atualização:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateImageUrls(); 