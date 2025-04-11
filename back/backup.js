const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function backup() {
  try {
    // Criar diretório de backup se não existir
    const backupDir = path.join(__dirname, 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }
    
    // Timestamp para o nome do arquivo
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `backup-${timestamp}.json`);
    
    // Buscar dados de todas as tabelas
    const users = await prisma.user.findMany();
    const pages = await prisma.page.findMany({
      include: { components: true }
    });
    
    // Criar objeto de backup
    const backupData = {
      users,
      pages
    };
    
    // Escrever arquivo JSON
    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
    
    console.log(`Backup criado com sucesso: ${backupFile}`);
  } catch (error) {
    console.error('Erro ao criar backup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

backup();