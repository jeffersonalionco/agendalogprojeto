# Deploy do frontend em produção (corrigir loop / WebSocket)

## O problema

Se no navegador aparecem erros como:

```
Mixed Content: ... HTTPS ... ws://10.1.1.109:3027/ws
GET .../app.xxxxx.hot-update.json 502
```

e a página **fica recarregando sem parar**, o domínio `https://agendfront.metaji.com.br` está servindo o **modo desenvolvimento** (`npm run serve`), não o build de produção.

O `npm run serve` injeta o **webpack-dev-server** (hot reload + WebSocket). Isso:

- Não funciona em HTTPS (mixed content: `ws://` em página `https://`)
- Gera requisições `*.hot-update.json` que retornam 502
- Causa reload infinito ao tentar reconectar o WebSocket

O build de produção (`npm run build` → pasta `dist/`) **não** inclui webpack-dev-server.

---

## Solução correta (produção)

### 1. Gerar o build

No servidor (ou na CI), na pasta `frontend`:

```bash
cd frontend
npm ci          # ou npm install
npm run build
```

Confirme que existe `frontend/dist/index.html` e `frontend/dist/js/app.*.js`.

### 2. Parar o servidor de desenvolvimento

Não use em produção:

```bash
# NÃO rodar isto no domínio público:
npm run serve
```

Pare o processo (PM2, systemd, screen, etc.) que estiver com `vue-cli-service serve` na porta 3027.

### 3. Servir apenas a pasta `dist`

Exemplo **Nginx** para `agendfront.metaji.com.br`:

```nginx
server {
    listen 443 ssl http2;
    server_name agendfront.metaji.com.br;

    # certificados SSL (ajuste os caminhos)
    ssl_certificate     /etc/letsencrypt/live/agendfront.metaji.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/agendfront.metaji.com.br/privkey.pem;

    root /caminho/para/agendalogProjeto/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # cache para assets com hash
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
        expires 7d;
        add_header Cache-Control "public, immutable";
    }
}
```

Recarregue o Nginx:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

### 4. Variáveis de ambiente

O build de produção usa `frontend/.env.production`:

```env
VUE_APP_API_BASE_URL=https://apiback.metaji.com.br/api
```

Sempre rode `npm run build` **depois** de alterar esse arquivo.

### 5. Conferir no navegador

1. Abra `https://agendfront.metaji.com.br`
2. F12 → Console: **não** deve aparecer `webpack-dev-server`, `hot-update` nem `ws://10.1.1.109`
3. F12 → Network: arquivos devem vir de `/js/app.xxxxx.js` (hash fixo), não `app.js` com HMR

---

## Testar o build localmente (sem dev server)

```bash
cd frontend
npm run build
npm run preview
```

Abre em `http://localhost:3027` a pasta `dist` (sem hot reload).

---

## Se ainda precisar de DEV pelo domínio HTTPS (não recomendado em produção)

Só para desenvolvimento remoto: o proxy HTTPS precisa encaminhar WebSocket com **WSS** para a porta 3027. Exemplo no Nginx:

```nginx
location /ws {
    proxy_pass http://127.0.0.1:3027/ws;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
}
```

E no `vue.config.js` (já preparado com variável `DEV_WSS=true`):

```bash
DEV_WSS=true npm run serve
```

**Para usuários finais, use sempre `npm run build` + servir `dist/`.**

---

## Checklist rápido

| Item | Produção | Desenvolvimento local |
|------|----------|------------------------|
| Comando | `npm run build` | `npm run serve` |
| Pasta servida | `frontend/dist` | memória (dev server) |
| WebSocket / HMR | Não | Sim (`ws://`) |
| Domínio HTTPS público | ✅ `dist` | ❌ evitar `serve` |

---

## Histórico

| Data | Descrição |
|------|-----------|
| 2026-05 | Doc criada após erro Mixed Content + reload em agendfront.metaji.com.br |
