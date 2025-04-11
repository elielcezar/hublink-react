// restore.js
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function restore(backupFilePath) {
  try {
    // Verificar se o arquivo existe
    if (!fs.existsSync(backupFilePath)) {
      console.error(`Arquivo de backup não encontrado: ${backupFilePath}`);
      return;
    }

    // Ler arquivo de backup
    const backupData = JSON.parse(fs.readFileSync(backupFilePath, 'utf8'));
    
    console.log(`Iniciando restauração do backup: ${backupFilePath}`);
    console.log(`Usuários: ${backupData.users.length}, Páginas: ${backupData.pages.length}`);

    // Confirmar antes de continuar
    console.log('\nATENÇÃO: Esta operação irá sobrescrever dados existentes.');
    console.log('Pressione Ctrl+C para cancelar ou aguarde 5 segundos para continuar...');
    
    // Esperar 5 segundos antes de continuar
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Conectar ao banco de dados
    await prisma.$connect();

    // Limpar tabelas existentes (na ordem inversa das relações)
    console.log('Limpando tabelas existentes...');
    await prisma.component.deleteMany({});
    await prisma.page.deleteMany({});
    await prisma.user.deleteMany({});

    // Restaurar usuários
    console.log('Restaurando usuários...');
    for (const user of backupData.users) {
      await prisma.user.create({
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          password: user.password,
          createdAt: new Date(user.createdAt),
          updatedAt: new Date(user.updatedAt)
        }
      });
    }

    // Restaurar páginas (sem componentes primeiro)
    console.log('Restaurando páginas...');
    for (const page of backupData.pages) {
      await prisma.page.create({
        data: {
          id: page.id,
          title: page.title,
          slug: page.slug,
          published: page.published,
          createdAt: new Date(page.createdAt),
          updatedAt: new Date(page.updatedAt),
          userId: page.userId
        }
      });
    }

    // Restaurar componentes
    console.log('Restaurando componentes...');
    let componentCount = 0;
    for (const page of backupData.pages) {
      if (page.components && page.components.length > 0) {
        for (const component of page.components) {
          await prisma.component.create({
            data: {
              id: component.id,
              type: component.type,
              order: component.order,
              content: component.content,
              createdAt: new Date(component.createdAt),
              updatedAt: new Date(component.updatedAt),
              pageId: component.pageId
            }
          });
          componentCount++;
        }
      }
    }

    console.log(`Restauração concluída com sucesso!`);
    console.log(`Restaurados: ${backupData.users.length} usuários, ${backupData.pages.length} páginas, ${componentCount} componentes`);

  } catch (error) {
    console.error('Erro durante a restauração:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Verificar argumentos da linha de comando
if (process.argv.length < 3) {
  console.log('Uso: node restore.js <caminho_do_arquivo_de_backup>');
  console.log('Exemplo: node restore.js ./backups/backup-2025-04-11T00-45-44-779Z.json');
  process.exit(1);
}

// Obter caminho do arquivo de backup
const backupFilePath = process.argv[2];
restore(backupFilePath);