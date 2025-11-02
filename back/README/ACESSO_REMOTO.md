# Liberar Acesso Remoto ao MySQL

## Problema
Erro `ETIMEDOUT` ao conectar no MySQL de outro servidor.

## Solução

### 1. Descobrir IP do servidor que vai conectar
No servidor Node.js, execute:
```bash
curl https://api.ipify.org
```

### 2. Liberar IP no firewall do servidor MySQL
No servidor MySQL (como root), execute:
```bash
# Liberar IP específico na porta 3306
ufw allow from SEU_IP_AQUI to any port 3306

# Exemplo:
ufw allow from 191.177.190.227 to any port 3306
```

### 3. Testar conexão
No servidor Node.js:
```bash
node test-db-connection.js
```

Pronto! ✅

---

**Nota:** O usuário MySQL já deve ter permissões corretas se foi criado pelo painel de controle.