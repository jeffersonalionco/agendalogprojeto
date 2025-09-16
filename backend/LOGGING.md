# Sistema de Logging - AgendaLog Backend

## Visão Geral

Este projeto agora possui um sistema de logging abrangente usando Winston, que permite monitorar todas as atividades do backend em tempo real.

## Configuração

### Instalação
O Winston já foi instalado como dependência:
```bash
npm install winston
```

### Variáveis de Ambiente
Certifique-se de ter as seguintes variáveis no seu arquivo `.env`:
```env
LOG_LEVEL=info
JWT_SECRET=seu_jwt_secret_aqui
```

## Estrutura de Logs

### Arquivos de Log
Os logs são salvos na pasta `logs/` na raiz do projeto:
- `combined.log` - Todos os logs
- `error.log` - Apenas erros
- `access.log` - Logs de acesso/requisições

### Níveis de Log
- **ERROR**: Erros críticos que precisam de atenção
- **WARN**: Avisos sobre situações anômalas
- **INFO**: Informações gerais sobre o funcionamento
- **DEBUG**: Informações detalhadas para debugging

## Logs Implementados

### 1. Server.js
- Inicialização da aplicação
- Configuração de middlewares
- Conexão com banco de dados
- Inicialização do servidor

### 2. Database (db.js)
- Conexões estabelecidas/perdidas
- Queries SQL executadas
- Erros de conexão
- Pool de conexões

### 3. Controllers
- Tentativas de login
- Validação de dados de entrada
- Respostas de sucesso/erro
- Informações do usuário

### 4. Services
- Processo de autenticação
- Validação de senhas
- Geração de tokens JWT
- Busca de usuários

### 5. Middlewares
- Verificação de tokens JWT
- Tentativas de acesso não autorizadas
- Validação de headers
- Processamento de requisições

### 6. Repositories
- Operações CRUD no banco
- Busca de usuários
- Criação/atualização/remoção
- Erros de banco de dados

### 7. Routes
- Configuração de rotas
- Registro de endpoints

## Middleware de Logging de Requisições

O middleware `requestLogger` registra automaticamente:
- Método HTTP
- URL da requisição
- IP do cliente
- User-Agent
- Tempo de resposta
- Status code
- Tamanho da resposta

## Como Usar

### Importar o Logger
```javascript
import { logInfo, logError, logWarn, logDebug } from './api/utils/logger.js';
```

### Exemplos de Uso
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

## Monitoramento

### Console
Todos os logs aparecem no console com cores para facilitar a leitura.

### Arquivos
Os logs são automaticamente rotacionados quando atingem 5MB, mantendo os últimos 5 arquivos.

### Estrutura dos Logs
Cada log contém:
- Timestamp
- Nível do log
- Mensagem
- Metadados adicionais (quando aplicável)
- Stack trace (para erros)

## Benefícios

1. **Debugging**: Facilita identificar problemas e fluxo de execução
2. **Monitoramento**: Acompanha performance e uso da aplicação
3. **Segurança**: Registra tentativas de acesso e atividades suspeitas
4. **Auditoria**: Mantém histórico de todas as operações
5. **Manutenção**: Facilita identificação de gargalos e erros

## Próximos Passos

Para produção, considere:
- Configurar logs para diferentes ambientes
- Implementar alertas para erros críticos
- Integrar com serviços de monitoramento (Sentry, DataDog, etc.)
- Configurar rotação de logs mais agressiva
- Implementar logs estruturados para análise
