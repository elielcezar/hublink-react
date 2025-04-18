server {
    server_name hublink.ecwd.pro;
    
    # Adicione este cabeçalho para debug
    add_header X-Server-Name "hublink.ecwd.pro";
    
    # Aumente o tamanho máximo do corpo da requisição
    client_max_body_size 10m;
    
    # Configuração para arquivos estáticos do React
    root /var/www/hublink.ecwd.pro/front/dist;
    index index.html;
    
    # Configuração para servir arquivos de uploads
    location ^~ /uploads/ {
        root /var/www/hublink.ecwd.pro/back;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
        add_header Access-Control-Allow-Origin "*";
        
        # Tipos MIME para imagens comuns
        types {
            image/jpeg jpg jpeg;
            image/png png;
            image/gif gif;
            image/webp webp;
            image/svg+xml svg svgz;
        }
    }
    
    # Rota para a API - proxy para o backend
    location /api {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Redirecionamento para mobile - garantir que URLs com www funcionem também
    location = / {
        try_files $uri /index.html;
    }
    
    # Todas as outras rotas vão para o frontend React
    # Importante para single-page applications
    location / {
        try_files $uri $uri/ /index.html;
        
        # Para aplicativos React/SPA - garantir que todas as rotas funcionem
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }
    
    # Configuração SSL gerenciada pelo Certbot
    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/hublink.ecwd.pro/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/hublink.ecwd.pro/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
    
    # HTTP para HTTPS redirect
    if ($scheme != "https") {
        return 301 https://$host$request_uri;
    }
} 