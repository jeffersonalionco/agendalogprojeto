# sistema de logging - agendalog backend

## visao geral

esse projeto agora tem um sistema de logging usando winston, pra dar uma acompanhada no que o backend ta fazendo em tempo real (sem misterio)

## configuracao

### instalacao
o winston ja ta instalado como dependencia
```bash
npm install winston
```

### variaveis de ambiente
confere ai se tem essas variavel no `.env`
```env
LOG_LEVEL=info
JWT_SECRET=seu_jwt_secret_aqui
```

## estrutura de logs

### arquivos de log
os logs ficam na pasta `logs/` na raiz do projeto
- `combined.log` - tudo junto
- `error.log` - so erro
- `access.log` - log de acesso/requisicao

### niveis de log
- **ERROR** erros critico que precisa olhar
- **WARN** aviso de coisa estranha
- **INFO** info geral do funcionamento
- **DEBUG** detalhe pra debuggar

## logs implementado

### 1. server.js
- inicializacao da aplicacao
- config de middleware
- conexao com banco
- inicializacao do servidor

### 2. database (db.js)
- conexao estabelecida/perdida
- query sql executada
- erro de conexao
- pool de conexao

### 3. controllers
- tentativa de login
- validacao de entrada
- resposta de sucesso/erro
- info do usuario

### 4. services
- processo de autenticacao
- validacao de senha
- geracao de token jwt
- busca de usuario

### 5. middlewares
- verificacao de token jwt
- tentativa de acesso nao autorizado
- validacao de header
- processamento de requisicao

### 6. repositories
- crud no banco
- busca de usuario
- criacao/atualizacao/remocao
- erro de banco

### 7. routes
- config de rotas
- registro de endpoint

## middleware de logging de requisicoes

o middleware `requestLogger` registra automatico
- metodo http
- url da requisicao
- ip do cliente
- user-agent
- tempo de resposta
- status code
- tamanho da resposta

## como usar

### Importar o Logger
```javascript
import { logInfo, logError, logWarn, logDebug } from './api/utils/logger.js';
```

### exemplo de uso
```javascript
// Log de informação
logInfo('Usuário logado com sucesso', { userId: 123, email: 'user@example.com' });

// Log de erro
logError('Erro ao conectar com banco', error, { database: 'agendalog' });

// Log de aviso
logWarn('Tentativa de login com senha incorreta', { email: 'user@example.com' });

// Log de debug
logDebug('Query executada', { sql: 'SELECT * FROM users' });
```

## monitoramento

### console
todos os logs aparece no console com cor pra facilitar

### arquivos
os logs rotaciona quando bate 5mb, mantendo os ultimos 5 arquivo

### estrutura dos logs
cada log tem
- timestamp
- nivel do log
- msg
- meta adicional (quando tiver)
- stack trace (pra erro)

## beneficios

1. **Debugging**: Facilita identificar problemas e fluxo de execução
2. **Monitoramento**: Acompanha performance e uso da aplicação
3. **Segurança**: Registra tentativas de acesso e atividades suspeitas
4. **Auditoria**: Mantém histórico de todas as operações
5. **Manutenção**: Facilita identificação de gargalos e erros

## proximos passos

Para produção, considere:
- Configurar logs para diferentes ambientes
- Implementar alertas para erros críticos
- Integrar com serviços de monitoramento (Sentry, DataDog, etc.)
- Configurar rotação de logs mais agressiva
- Implementar logs estruturados para análise
