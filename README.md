# 📅 AgendaLog

<div align="center">
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vue.js&logoColor=4FC08D" alt="Vue.js">
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Sequelize-52B0E7?style=for-the-badge&logo=Sequelize&logoColor=white" alt="Sequelize">
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white" alt="JWT">
</div>

<div align="center">
  <h3>🚀 Sistema de Agendamento e Logística</h3>
  <p>Uma aplicação web moderna para gerenciamento de agendamentos e operações logísticas</p>
</div>

---

## 📋 Sobre o Projeto

O **AgendaLog** é uma aplicação full-stack desenvolvida para facilitar o gerenciamento de agendamentos e operações logísticas. A aplicação oferece uma interface intuitiva para usuários gerenciarem seus compromissos e operações de forma eficiente.

### ✨ Principais Funcionalidades

- 🔐 **Sistema de Autenticação** - Login seguro com JWT
- 👥 **Gestão de Usuários** - Controle de acesso e permissões
- 📅 **Agendamentos** - Criação e gerenciamento de compromissos
- 📊 **Dashboard** - Visão geral das operações
- 🔍 **Logs Detalhados** - Sistema completo de logging para monitoramento
- 📱 **Interface Responsiva** - Design moderno e adaptável

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **PostgreSQL** - Banco de dados relacional
- **Sequelize** - ORM para Node.js
- **JWT** - Autenticação e autorização
- **Winston** - Sistema de logging
- **bcrypt** - Criptografia de senhas

### Frontend
- **Vue.js 3** - Framework JavaScript progressivo
- **Vue Router** - Roteamento
- **Axios** - Cliente HTTP
- **CSS3** - Estilização moderna

## 🚀 Como Executar o Projeto

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
# Edite o arquivo .env com suas configurações

# Execute o servidor
npm run dev
```

### 3. Configuração do Frontend

```bash
# Navegue para a pasta do frontend
cd frontend

# Instale as dependências
npm install

# Execute o servidor de desenvolvimento
npm run serve
```

### 4. Configuração do Banco de Dados

```sql
-- Crie o banco de dados
CREATE DATABASE agendalog;

-- Execute as migrações (quando disponíveis)
-- npm run migrate
```

## 📁 Estrutura do Projeto

```
agendalogprojeto/
├── 📁 backend/
│   ├── 📁 api/
│   │   ├── 📁 controllers/     # Controladores da API
│   │   ├── 📁 middlewares/      # Middlewares de autenticação
│   │   ├── 📁 models/          # Modelos do banco de dados
│   │   ├── 📁 repositories/    # Camada de acesso a dados
│   │   ├── 📁 routes/          # Rotas da API
│   │   ├── 📁 services/         # Lógica de negócio
│   │   └── 📁 utils/           # Utilitários (logger, etc.)
│   ├── 📁 logs/                # Arquivos de log
│   ├── 📄 server.js           # Servidor principal
│   └── 📄 package.json        # Dependências do backend
├── 📁 frontend/
│   ├── 📁 src/
│   │   ├── 📁 components/      # Componentes Vue
│   │   ├── 📁 views/           # Páginas da aplicação
│   │   ├── 📁 router/          # Configuração de rotas
│   │   └── 📄 main.js         # Ponto de entrada
│   └── 📄 package.json        # Dependências do frontend
└── 📄 README.md              # Este arquivo
```

## 🔧 Configuração de Ambiente

### Variáveis de Ambiente (.env)

```env
# Backend
DB_HOST=localhost
DB_NAME=agendalog
DB_USER=postgres
DB_PASSWORD=sua_senha
DB_PORT=5432

JWT_SECRET=seu_jwt_secret_aqui
PORT=3009
NODE_ENV=development
LOG_LEVEL=info
```

## 📊 Sistema de Logging

O projeto possui um sistema completo de logging implementado com Winston:

- **Console Logs** - Logs coloridos no terminal
- **File Logs** - Logs salvos em arquivos com rotação automática
- **Níveis de Log** - ERROR, WARN, INFO, DEBUG
- **Monitoramento** - Rastreamento completo de requisições e operações

### Arquivos de Log
- `logs/combined.log` - Todos os logs
- `logs/error.log` - Apenas erros
- `logs/access.log` - Logs de acesso

## 🧪 Testes

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm run test
```

## 📈 Roadmap

- [ ] Sistema de notificações
- [ ] Relatórios avançados
- [ ] API REST completa
- [ ] Testes automatizados
- [ ] Docker containerization
- [ ] CI/CD pipeline

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Seu Nome**
- GitHub: [@seu-usuario](https://github.com/seu-usuario)
- LinkedIn: [Seu LinkedIn](https://linkedin.com/in/seu-perfil)

## 🙏 Agradecimentos

- Comunidade Vue.js
- Comunidade Node.js
- Todos os contribuidores do projeto

---

<div align="center">
  <p>Feito com ❤️ e muito ☕</p>
  <p>⭐ Se este projeto te ajudou, considere dar uma estrela!</p>
</div>
