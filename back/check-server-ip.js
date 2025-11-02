const https = require('https');

console.log('====================================');
console.log('IDENTIFICANDO IP DO SERVIDOR');
console.log('====================================\n');

// Verifica IP público do servidor
function getPublicIP() {
  return new Promise((resolve, reject) => {
    https.get('https://api.ipify.org?format=json', (resp) => {
      let data = '';
      
      resp.on('data', (chunk) => {
        data += chunk;
      });
      
      resp.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.ip);
        } catch (e) {
          reject(e);
        }
      });
      
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function checkIPs() {
  try {
    console.log('🔍 Buscando IP público do servidor...\n');
    const publicIP = await getPublicIP();
    
    console.log('📍 IP PÚBLICO DO SERVIDOR:');
    console.log(`   ${publicIP}`);
    console.log('\n====================================');
    console.log('PRÓXIMOS PASSOS:');
    console.log('====================================\n');
    console.log('1. Acesse o painel de controle do seu servidor MySQL');
    console.log('2. Vá em "Remote MySQL" ou "MySQL Remoto"');
    console.log(`3. Adicione o IP: ${publicIP} na whitelist`);
    console.log('4. Salve as alterações');
    console.log('5. Execute novamente: node test-db-connection.js\n');
    
    console.log('💡 DICA: Se você usa cPanel, WHM ou similar:');
    console.log('   - Procure por "Remote MySQL" ou "Remote Database Access"');
    console.log('   - Adicione o host: ' + publicIP);
    console.log('\n💡 Se você tem acesso direto ao servidor MySQL:');
    console.log('   Execute no MySQL:');
    console.log(`   GRANT ALL PRIVILEGES ON hublink.* TO 'hublink'@'${publicIP}' IDENTIFIED BY 'sua_senha';`);
    console.log('   FLUSH PRIVILEGES;\n');
    
  } catch (error) {
    console.error('❌ Erro ao buscar IP:', error.message);
  }
}

checkIPs();

