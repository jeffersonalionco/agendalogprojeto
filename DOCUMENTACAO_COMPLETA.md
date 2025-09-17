# 📅 AgendaLog - Documentação Completa do Projeto

<div align="center">
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vue.js&logoColor=4FC08D" alt="Vue.js">
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Sequelize-52B0E7?style=for-the-badge&logo=Sequelize&logoColor=white" alt="Sequelize">
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white" alt="JWT">
  <img src="https://img.shields.io/badge/Winston-000000?style=for-the-badge&logo=winston&logoColor=white" alt="Winston">
</div>

<div align="center">
  <h3>🚀 Sistema de Agendamento e Logística</h3>
  <p>Uma aplicação web moderna para gerenciamento de agendamentos e operações logísticas</p>
  <p><strong>Status:</strong> Em desenvolvimento - Versão 1.0.0</p>
</div>

---

## 📋 Visão Geral do Projeto

O **AgendaLog** é uma aplicação full-stack desenvolvida para facilitar o gerenciamento de agendamentos e operações logísticas. A aplicação oferece uma interface intuitiva para usuários gerenciarem seus compromissos e operações de forma eficiente, com sistema de autenticação robusto e logging completo.

### ✨ Funcionalidades Implementadas

- 🔐 **Sistema de Autenticação JWT** - Login seguro com tokens
- 👥 **Gestão de Usuários** - Controle de acesso por tipos (admin, cliente, fornecedor)
- 📊 **Dashboard Diferenciado** - Interface específica para cada tipo de usuário
- 🔍 **Sistema de Logging Completo** - Monitoramento detalhado com Winston
- 📱 **Interface Responsiva** - Design moderno com Bootstrap 5
- 🛡️ **Middleware de Segurança** - Proteção de rotas e validação de tokens
- 🗄️ **Banco de Dados PostgreSQL** - Persistência robusta com Sequelize ORM

---

## 🏗️ Arquitetura do Sistema

### Estrutura do Projeto

```
agendalogprojeto/
├── 📁 backend/                    # Servidor Node.js/Express
│   ├── 📁 api/
│   │   ├── 📁 controllers/        # Controladores da API
│   │   │   ├── userController.js  # Lógica de autenticação
│   │   │   └── readme.md
│   │   ├── 📁 middlewares/        # Middlewares de autenticação
│   │   │   ├── authMidllewares.js # Validação JWT
│   │   │   └── readme.md
│   │   ├── 📁 models/            # Modelos do banco de dados
│   │   │   ├── User.js           # Modelo de usuário
│   │   │   └── readme.md
│   │   ├── 📁 repositories/      # Camada de acesso a dados
│   │   │   ├── userRepository.js # Operações CRUD de usuários
│   │   │   └── readme.md
│   │   ├── 📁 routes/            # Rotas da API
│   │   │   ├── authRoutes.js     # Rotas de autenticação
│   │   │   └── readme.md
│   │   ├── 📁 services/          # Lógica de negócio
│   │   │   ├── authService.js    # Serviços de autenticação
│   │   │   └── readme.md
│   │   ├── 📁 utils/             # Utilitários
│   │   │   └── logger.js         # Sistema de logging Winston
│   │   └── db.js                 # Configuração do banco
│   ├── 📁 logs/                  # Arquivos de log
│   ├── server.js                 # Servidor principal
│   ├── package.json              # Dependências do backend
│   └── LOGGING.md                # Documentação do sistema de logs
├── 📁 frontend/                  # Cliente Vue.js
│   ├── 📁 src/
│   │   ├── 📁 components/        # Componentes Vue
│   │   │   ├── LoginForms.vue    # Formulário de login
│   │   │   ├── cardDefault.vue   # Componente de card
│   │   │   ├── estruturaBody.vue # Estrutura do corpo
│   │   │   ├── menuDefault.vue   # Menu padrão
│   │   │   └── menuPedidosCliente.vue # Menu de pedidos
│   │   ├── 📁 views/             # Páginas da aplicação
│   │   │   ├── LoginView.vue     # Página de login
│   │   │   ├── HomeAdmin.vue     # Dashboard admin
│   │   │   ├── HomeCliente.vue   # Dashboard cliente
│   │   │   ├── HomeFornecedor.vue # Dashboard fornecedor
│   │   │   ├── PedidosView.vue   # Página de pedidos
│   │   │   └── AboutView.vue     # Página sobre
│   │   ├── 📁 router/            # Configuração de rotas
│   │   │   └── index.js          # Rotas e guards
│   │   ├── 📁 config/            # Configurações
│   │   │   └── menus.js          # Configuração de menus
│   │   ├── 📁 assets/            # Recursos estáticos
│   │   └── main.js               # Ponto de entrada
│   ├── package.json              # Dependências do frontend
│   └── vue.config.js             # Configuração do Vue CLI
└── README.md                     # Documentação principal
```

---

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js 16+** - Runtime JavaScript
- **Express.js 5.1.0** - Framework web
- **PostgreSQL** - Banco de dados relacional
- **Sequelize 6.37.7** - ORM para Node.js
- **JWT (jsonwebtoken 9.0.2)** - Autenticação e autorização
- **Winston 3.17.0** - Sistema de logging
- **bcrypt 6.0.0** - Criptografia de senhas
- **CORS 2.8.5** - Controle de acesso cross-origin
- **dotenv 17.2.1** - Gerenciamento de variáveis de ambiente

### Frontend
- **Vue.js 3.5.20** - Framework JavaScript progressivo
- **Vue Router 4.0.3** - Roteamento
- **Bootstrap 5.3.7** - Framework CSS
- **JWT Decode 4.0.0** - Decodificação de tokens
- **Axios** - Cliente HTTP (implícito)

---

## 🔧 Configuração e Instalação

### Pré-requisitos
- Node.js (versão 16 ou superior)
- PostgreSQL (versão 12 ou superior)
- npm ou yarn

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/agendalogprojeto.git
cd agendalogprojeto
```

### 2. Configuração do Backend

```bash
# Navegue para a pasta do backend
cd backend

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações:
```

**Arquivo .env necessário:**
```env
# Configuração do Banco de Dados
DB_HOST=localhost
DB_NAME=agendalog
DB_USER=postgres
DB_PASSWORD=sua_senha_postgres
DB_PORT=5432

# Configuração JWT
JWT_SECRET=seu_jwt_secret_super_seguro_aqui

# Configuração do Servidor
PORT=3009
NODE_ENV=development

# Configuração de Logs
LOG_LEVEL=info
```

### 3. Configuração do Banco de Dados

```sql
-- Conecte-se ao PostgreSQL e execute:
CREATE DATABASE agendalog;

-- O Sequelize criará automaticamente as tabelas na primeira execução
```

### 4. Execução do Backend

```bash
# Execute o servidor
npm run dev
# ou
node server.js
```

### 5. Configuração do Frontend

```bash
# Navegue para a pasta do frontend
cd frontend

# Instale as dependências
npm install

# Execute o servidor de desenvolvimento
npm run serve
```

### 6. Acesso à Aplicação

- **Frontend:** http://localhost:8080
- **Backend API:** http://localhost:3009
- **Login:** http://localhost:8080/#/login

---

## 🗄️ Estrutura do Banco de Dados

### Tabela: users

| Campo | Tipo | Descrição | Restrições |
|-------|------|-----------|------------|
| id | INTEGER | Chave primária | AUTO_INCREMENT, PRIMARY KEY |
| email | STRING | Email do usuário | NOT NULL, UNIQUE |
| senha | STRING | Senha do usuário | NOT NULL |
| tipo | STRING | Tipo de usuário | NOT NULL (admin, cliente, fornecedor) |

**Nota:** A tabela não possui timestamps automáticos configurados.

### Tipos de Usuário
- **admin**: Acesso completo ao sistema
- **cliente**: Acesso às funcionalidades de cliente
- **fornecedor**: Acesso às funcionalidades de fornecedor

---

## 🔐 Sistema de Autenticação

### Fluxo de Autenticação

1. **Login**: Usuário envia email e senha via POST `/api/auth/login`
2. **Validação**: Sistema verifica credenciais no banco de dados
3. **Token JWT**: Gera token com expiração de 30 minutos
4. **Resposta**: Retorna token, dados do usuário e tipo
5. **Armazenamento**: Frontend salva token no localStorage
6. **Proteção**: Middleware valida token em rotas protegidas

### Endpoints da API

#### POST `/api/auth/login`
**Request:**
```json
{
  "email": "usuario@exemplo.com",
  "senha": "senha123"
}
```

**Response (Sucesso):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "usuario@exemplo.com"
  },
  "tipo": "admin"
}
```

**Response (Erro):**
```json
{
  "error": "Usuario não encontrado"
}
```

### Middleware de Autenticação

O middleware `authMidlleware` protege rotas que requerem autenticação:

- Verifica presença do header `Authorization`
- Valida formato `Bearer <token>`
- Decodifica e verifica o token JWT
- Adiciona dados do usuário ao objeto `req.user`
- Registra tentativas de acesso não autorizadas

---

## 📊 Sistema de Logging

### Configuração Winston

O sistema de logging utiliza Winston com múltiplos transports:

- **Console**: Logs coloridos no terminal
- **combined.log**: Todos os logs (máx. 5MB, 5 arquivos)
- **error.log**: Apenas erros (máx. 5MB, 5 arquivos)
- **access.log**: Logs de acesso (máx. 5MB, 5 arquivos)

### Níveis de Log
- **ERROR**: Erros críticos que precisam de atenção
- **WARN**: Avisos sobre situações anômalas
- **INFO**: Informações gerais sobre o funcionamento
- **DEBUG**: Informações detalhadas para debugging

### Logs Implementados

#### 1. Servidor (server.js)
- Inicialização da aplicação
- Configuração de middlewares
- Conexão com banco de dados
- Inicialização do servidor

#### 2. Banco de Dados (db.js)
- Conexões estabelecidas/perdidas
- Queries SQL executadas
- Erros de conexão
- Pool de conexões

#### 3. Autenticação
- Tentativas de login
- Validação de senhas
- Geração de tokens JWT
- Verificação de tokens

#### 4. Middleware de Requisições
- Método HTTP, URL, IP
- User-Agent
- Tempo de resposta
- Status code
- Tamanho da resposta

### Exemplo de Uso

```javascript
import { logInfo, logError, logWarn } from './api/utils/logger.js';

// Log de informação
logInfo('Usuário logado com sucesso', { 
  userId: 123, 
  email: 'user@example.com' 
});

// Log de erro
logError('Erro ao conectar com banco', error, { 
  database: 'agendalog' 
});

// Log de aviso
logWarn('Tentativa de login com senha incorreta', { 
  email: 'user@example.com' 
});
```

---

## 🎨 Frontend - Vue.js

### Estrutura de Componentes

#### LoginForms.vue
- Formulário de login responsivo
- Validação de campos
- Integração com API de autenticação
- Tratamento de erros
- Armazenamento de token no localStorage

#### Views Principais
- **LoginView**: Página de login
- **HomeAdmin**: Dashboard para administradores
- **HomeCliente**: Dashboard para clientes
- **HomeFornecedor**: Dashboard para fornecedores
- **PedidosView**: Página de gerenciamento de pedidos
- **AboutView**: Página sobre o sistema

### Roteamento e Guards

#### Configuração de Rotas
```javascript
const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: LoginView },
  { 
    path: '/admin', 
    component: HomeAdmin,
    meta: { requiresAuth: true, role: 'admin' }
  },
  // ... outras rotas
]
```

#### Navigation Guards
- Verificação de autenticação
- Validação de expiração de token
- Controle de acesso por tipo de usuário
- Redirecionamento automático

### Funcionalidades do Frontend

1. **Autenticação Automática**: Verifica token ao carregar a página
2. **Redirecionamento Inteligente**: Direciona usuário para dashboard correto
3. **Proteção de Rotas**: Impede acesso não autorizado
4. **Interface Responsiva**: Design adaptável com Bootstrap 5
5. **Tratamento de Erros**: Feedback visual para erros de login

---

## 🚀 Funcionalidades Implementadas

### ✅ Backend
- [x] Servidor Express.js configurado
- [x] Conexão com PostgreSQL via Sequelize
- [x] Modelo de usuário com validações
- [x] Sistema de autenticação JWT
- [x] Middleware de proteção de rotas
- [x] Sistema de logging completo com Winston
- [x] Estrutura de camadas (Controller, Service, Repository)
- [x] Tratamento de erros centralizado
- [x] Configuração de CORS
- [x] Validação de dados de entrada

### ✅ Frontend
- [x] Aplicação Vue.js 3 configurada
- [x] Sistema de roteamento com guards
- [x] Componente de login funcional
- [x] Integração com API de autenticação
- [x] Armazenamento de token no localStorage
- [x] Interface responsiva com Bootstrap 5
- [x] Redirecionamento automático por tipo de usuário
- [x] Tratamento de erros de autenticação

### ✅ Sistema de Logging
- [x] Configuração Winston completa
- [x] Logs em arquivo com rotação automática
- [x] Logs coloridos no console
- [x] Middleware de logging de requisições
- [x] Logs estruturados com metadados
- [x] Separação de logs por nível (error, warn, info, debug)

---

## 🔄 Próximas Funcionalidades

### 📋 Roadmap

#### Backend
- [ ] Sistema de registro de usuários
- [ ] Criptografia de senhas com bcrypt
- [ ] Validação de dados com Joi ou Yup
- [ ] Rate limiting para prevenir ataques
- [ ] Sistema de refresh tokens
- [ ] API REST completa para CRUD de usuários
- [ ] Sistema de permissões granular
- [ ] Upload de arquivos
- [ ] Sistema de notificações
- [ ] Relatórios e analytics

#### Frontend
- [ ] Dashboard com gráficos e métricas
- [ ] Sistema de notificações em tempo real
- [ ] Formulários de cadastro
- [ ] Perfil do usuário
- [ ] Sistema de pedidos completo
- [ ] Filtros e busca avançada
- [ ] Modo escuro/claro
- [ ] Internacionalização (i18n)
- [ ] PWA (Progressive Web App)

#### DevOps
- [ ] Docker containerization
- [ ] CI/CD pipeline
- [ ] Testes automatizados (Jest, Cypress)
- [ ] Monitoramento com Prometheus/Grafana
- [ ] Deploy automatizado
- [ ] Backup automático do banco

---

## 🧪 Testes

### Backend
```bash
cd backend
npm test
```

### Frontend
```bash
cd frontend
npm run test
```

**Nota:** Sistema de testes ainda não implementado.

---

## 📈 Monitoramento e Logs

### Localização dos Logs
- `backend/logs/combined.log` - Todos os logs
- `backend/logs/error.log` - Apenas erros
- `backend/logs/access.log` - Logs de acesso

### Monitoramento em Produção
Para produção, considere:
- Integração com serviços de monitoramento (Sentry, DataDog)
- Alertas automáticos para erros críticos
- Métricas de performance
- Logs centralizados

---

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Padrões de Código
- Use ESLint para manter consistência
- Documente funções complexas
- Mantenha logs informativos
- Teste suas alterações

---

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👨‍💻 Autor

**Seu Nome**
- GitHub: [@seu-usuario](https://github.com/seu-usuario)
- LinkedIn: [Seu LinkedIn](https://linkedin.com/in/seu-perfil)

---

## 🙏 Agradecimentos

- Comunidade Vue.js
- Comunidade Node.js
- Todos os contribuidores do projeto
- Documentação do Winston
- Documentação do Sequelize

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs em `backend/logs/`
2. Consulte a documentação do Winston em `backend/LOGGING.md`
3. Abra uma issue no GitHub
4. Entre em contato via email

---

<div align="center">
  <p>Feito com ❤️ e muito ☕</p>
  <p>⭐ Se este projeto te ajudou, considere dar uma estrela!</p>
  <p><strong>Última atualização:</strong> 2025 </p>
</div>
