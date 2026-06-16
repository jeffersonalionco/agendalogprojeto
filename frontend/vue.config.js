const { defineConfig } = require('@vue/cli-service')

// DEV_WSS=true só se você expõe npm run serve atrás de HTTPS com proxy /ws → 3027 (ver docs/DEPLOY_FRONTEND_PRODUCAO.md)
// Em produção use sempre: npm run build e sirva a pasta dist/ (nunca npm run serve no domínio público).
const devServerClient =
  process.env.DEV_WSS === 'true'
    ? {
        webSocketURL: {
          protocol: 'wss',
          hostname: 'agendfront.metaji.com.br',
          port: 443,
          pathname: '/ws',
        },
      }
    : undefined

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: 3027,
    host: '0.0.0.0',
    allowedHosts: ['agendfront.metaji.com.br', 'all'],
    ...(devServerClient ? { client: devServerClient } : {}),
  },
})
