# Painel administrativo — mobile e desktop

Documentação da refatoração visual e responsiva de **todas as abas do administrador**.

**Data:** maio/2026

---

## Objetivo

Unificar a experiência do admin em um layout **profissional**, **mobile-first** e consistente entre as abas:

- Início (`/admin`)
- Pedidos (`/pedidos`)
- Produtos (`/produtos`)
- Usuários (`/usuarios`)
- Configurações (`/configuracoes`)

---

## Design system compartilhado

Arquivo central: `frontend/src/assets/styles/admin-page.css`

Importado em `frontend/src/main.js`.

### Classes principais (prefixo `admin-page__`)

| Classe | Uso |
|--------|-----|
| `admin-page` | Container raiz da tela admin |
| `admin-page__banner` | Cabeçalho escuro com gradiente |
| `admin-page__content` | Área de conteúdo com padding responsivo |
| `admin-page__quick-links` | Atalhos (Início) |
| `admin-page__stats-scroll` | Cards de status com scroll horizontal |
| `admin-page__section` | Bloco com borda/sombra |
| `admin-page__cards` | Lista em cards (mobile) |
| `admin-page__table-wrap` | Tabela refinada (desktop) |
| `admin-page__form-panel` | Formulário criar/editar |
| `admin-page__fab` | Botão flutuante (mobile) |
| `admin-page__mobile-only` | Visível só &lt; 768px |
| `admin-page__desktop-only` | Visível só ≥ 768px |

### Paleta

- Banner: gradiente slate (`#0f172a` → `#334155`)
- Acento primário: índigo (`#6366f1`)
- Badges por tipo/status com cores suaves semânticas

---

## Alterações por tela

### 1. Início — `HomeAdmin.vue`

**Antes:** tabela larga com 9 colunas + modal de edição duplicado.

**Depois:** dashboard administrativo com:

- Banner de boas-vindas
- Atalhos: Pedidos, Usuários, Produtos
- Gráfico `GraficoResumoPedidos`
- Stats por status (scroll horizontal no mobile)
- Pedidos recentes (8 últimos):
  - **Mobile:** cards com link “Gerenciar pedido”
  - **Desktop:** tabela compacta
- Botão “Ver todos os pedidos” → `/pedidos`

A gestão completa de pedidos ficou centralizada na aba **Pedidos** (evita duplicar fluxo com modal limitado).

---

### 2. Pedidos — `PedidosView.vue` (modo admin)

- Banner admin quando `tipoUsuario === 'admin'`
- Título da lista: **“Todos os pedidos”**
- Cards da lista redesenhados (`pedidos-list-card`)
- Exibe **Cliente #ID** nos cards (admin)
- Admin pode **excluir pedido em qualquer status** (`podeExcluirQualquerStatus`)
- Deep link: `/pedidos?id=123` abre o pedido e entra em visualizar (vindo do dashboard)

---

### 3. Usuários — `GerenciarUsuariosView.vue`

- Adicionado `menuDefault` (antes só tinha botão Voltar)
- Banner + busca por email/nome/tipo
- Formulário responsivo (`col-12` no mobile)
- **Mobile:** cards com Editar/Excluir + FAB “+”
- **Desktop:** tabela estilizada + botão “Novo usuário”

---

### 4. Produtos — `GerenciarProdutosView.vue`

Mesmo padrão de Usuários:

- Banner, busca, formulário responsivo
- Cards mobile / tabela desktop
- FAB para novo produto no mobile

---

### 5. Configurações — `ConfiguracoesView.vue`

- `menuDefault` em todas as telas de perfil
- Admin usa layout `admin-page` (banner + card de seção)
- Botões com altura mínima 44px no mobile

---

## Menu de navegação — `menus.js`

Correção do link **Início** por perfil (antes apontava para `/`):

| Perfil | Path Início |
|--------|-------------|
| Cliente | `/cliente` |
| Fornecedor | `/fornecedor` |
| Admin | `/admin` |

---

## Breakpoints

| Largura | Comportamento |
|---------|---------------|
| &lt; 768px | Cards, FAB, scroll horizontal nos stats, toolbar simplificada |
| ≥ 768px | Tabelas, toolbar com ações à direita, hover nos cards |

---

## Como testar

```bash
cd backend && npm run dev
cd frontend && npm run serve
```

Login admin: `admin@agendalog.com` / `admin123`

### Checklist mobile (DevTools ≤ 767px)

1. [ ] **Início** — atalhos, gráfico, cards de pedidos recentes
2. [ ] **Pedidos** — banner, lista em cards, menu Ver/Editar/Excluir
3. [ ] **Usuários** — FAB, cards, formulário full-width
4. [ ] **Produtos** — FAB, cards, busca
5. [ ] **Configurações** — banner admin, formulário legível
6. [ ] Menu hamburger — Início vai para `/admin`

### Checklist desktop

1. [ ] Dashboard com tabela de recentes
2. [ ] Usuários/Produtos com tabela e botão no topo
3. [ ] Pedidos split lista + painel de ações

---

## Arquivos alterados

```
frontend/src/
├── assets/styles/admin-page.css    # NOVO — layout compartilhado
├── config/menus.js                 # paths Início por role
├── main.js                         # import admin-page.css
├── views/
│   ├── HomeAdmin.vue               # dashboard
│   ├── GerenciarUsuariosView.vue   # mobile + desktop
│   ├── GerenciarProdutosView.vue   # mobile + desktop
│   ├── PedidosView.vue             # banner admin + cards
│   └── ConfiguracoesView.vue       # menu + layout admin
```

---

## Relacionado

- [MENU_ACOES_PEDIDOS.md](./MENU_ACOES_PEDIDOS.md) — barra de ações na aba Pedidos
- [VISUALIZACAO_PEDIDO.md](./VISUALIZACAO_PEDIDO.md) — detalhe do pedido
- [EDITAR_PEDIDO.md](./EDITAR_PEDIDO.md) — edição completa (admin na aba Pedidos)
- [INDICE_ALTERACOES_FRONTEND.md](./INDICE_ALTERACOES_FRONTEND.md) — índice geral
