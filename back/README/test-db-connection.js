require('dotenv').config();
const mysql = require('mysql2');
const { PrismaClient } = require('@prisma/client');

console.log('====================================');
console.log('TESTE DE CONEXÃO COM BANCO DE DADOS');
console.log('====================================\n');

// Verifica se a variável de ambiente está carregada
console.log('1. Verificando variável de ambiente DATABASE_URL:');
if (process.env.DATABASE_URL) {
  // Mascara a senha para segurança
  const urlMasked = process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@');
  console.log(`   ✓ DATABASE_URL encontrada: ${urlMasked}\n`);
} else {
  console.log('   ✗ DATABASE_URL não encontrada!\n');
  console.log('   Verifique se o arquivo .env existe na pasta "back" com a seguinte linha:');
  console.log('   DATABASE_URL="mysql://hublink:0o45YxvBQoJYG1zzJBw8@212.85.19.190:3306/hublink"\n');
  process.exit(1);
}

// Parse da URL do banco
function parseDbUrl(url) {
  const regex = /mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/;
  const match = url.match(regex);
  if (match) {
    return {
      user: match[1],
      password: match[2],
      host: match[3],
      port: parseInt(match[4]),
      database: match[5]
    };
  }
  return null;
}

const dbConfig = parseDbUrl(process.env.DATABASE_URL);
if (dbConfig) {
  console.log('2. Configuração do banco extraída:');
  console.log(`   - Host: ${dbConfig.host}`);
  console.log(`   - Porta: ${dbConfig.port}`);
  console.log(`   - Usuário: ${dbConfig.user}`);
  console.log(`   - Database: ${dbConfig.database}\n`);
}

async function testRawMysqlConnection() {
  console.log('3. Testando conexão direta com mysql2...');
  try {
    const connection = mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
      database: dbConfig.database,
      connectTimeout: 10000 // 10 segundos
    });

    // Promisify a conexão
    const promiseConnection = connection.promise();

    console.log('   ✓ Conexão MySQL estabelecida com sucesso!');
    
    // Testa uma query simples
    const [rows] = await promiseConnection.execute('SELECT 1 as test');
    console.log('   ✓ Query de teste executada com sucesso!');
    
    await promiseConnection.end();
    console.log('   ✓ Conexão fechada corretamente\n');
    return true;
  } catch (error) {
    console.log('   ✗ Erro na conexão MySQL:');
    console.log(`   Código: ${error.code}`);
    console.log(`   Mensagem: ${error.message}`);
    console.log(`   SQL State: ${error.sqlState}\n`);
    
    // Diagnósticos específicos
    if (error.code === 'ECONNREFUSED') {
      console.log('   💡 Diagnóstico: O servidor está recusando a conexão.');
      console.log('      Possíveis causas:');
      console.log('      - MySQL não está rodando no servidor');
      console.log('      - Porta 3306 bloqueada por firewall');
      console.log('      - IP/Porta incorretos\n');
    } else if (error.code === 'ETIMEDOUT' || error.code === 'EHOSTUNREACH') {
      console.log('   💡 Diagnóstico: Timeout na conexão.');
      console.log('      Possíveis causas:');
      console.log('      - Firewall bloqueando conexão do seu servidor');
      console.log('      - Seu IP não está na whitelist do MySQL');
      console.log('      - Problemas de rede/roteamento\n');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('   💡 Diagnóstico: Acesso negado.');
      console.log('      Possíveis causas:');
      console.log('      - Usuário ou senha incorretos');
      console.log('      - Usuário não tem permissão de acesso remoto\n');
    }
    return false;
  }
}

async function testPrismaConnection() {
  console.log('4. Testando conexão com Prisma...');
  const prisma = new PrismaClient({
    log: ['error', 'warn'],
  });

  try {
    await prisma.$connect();
    console.log('   ✓ Prisma conectado com sucesso!');
    
    // Testa uma query
    const userCount = await prisma.user.count();
    console.log(`   ✓ Query de teste executada: ${userCount} usuários no banco\n`);
    
    await prisma.$disconnect();
    return true;
  } catch (error) {
    console.log('   ✗ Erro na conexão Prisma:');
    console.log(`   ${error.message}\n`);
    await prisma.$disconnect();
    return false;
  }
}

async function runTests() {
  try {
    const mysqlOk = await testRawMysqlConnection();
    
    if (mysqlOk) {
      await testPrismaConnection();
    } else {
      console.log('⚠ Pulando teste do Prisma pois a conexão MySQL falhou.\n');
    }
    
    console.log('====================================');
    console.log('TESTE CONCLUÍDO');
    console.log('====================================');
  } catch (error) {
    console.error('Erro inesperado:', error);
  }
}

runTests();

