# Índice — alterações do frontend (AgendaLog)

Documentação para revisar e entender as mudanças de interface feitas no projeto.

**Última atualização:** maio/2026

---

## Resumo por área

| Área | O que mudou | Documento |
|------|-------------|-----------|
| Menu de ações (Pedidos) | Barra mobile com botões; desktop com ícones | [MENU_ACOES_PEDIDOS.md](./MENU_ACOES_PEDIDOS.md) |
| Visualizar pedido | Hero azul, cards de info, produtos em lista | [VISUALIZACAO_PEDIDO.md](./VISUALIZACAO_PEDIDO.md) |
| Produtos (leitura) | Cards estilo recibo no mobile | [PRODUTOS_PEDIDO_MOBILE.md](./PRODUTOS_PEDIDO_MOBILE.md) |
| Editar pedido | Formulário laranja + produtos editáveis no mobile | [EDITAR_PEDIDO.md](./EDITAR_PEDIDO.md) |
| **Painel admin (todas abas)** | Layout mobile-first + desktop profissional | [ADMIN_MOBILE_DESKTOP.md](./ADMIN_MOBILE_DESKTOP.md) |
| Home do cliente | CSS alinhado (`text-align`, mobile-only) | (seção abaixo) |
| Deploy produção | Não usar `npm run serve` no domínio HTTPS | [DEPLOY_FRONTEND_PRODUCAO.md](./DEPLOY_FRONTEND_PRODUCAO.md) |

---

## Componentes criados

| Componente | Função |
|------------|--------|
| `menuPedidosCliente.vue` | Ações Criar / Ver / Editar / Excluir |
| `PedidoDetalhesVisualizar.vue` | Visualização completa do pedido |
| `PedidoProdutosLista.vue` | Lista de produtos (leitura) |
| `PedidoEditarForm.vue` | Formulário de edição |
| `PedidoEditarAdminModal.vue` | Edição rápida (legado; home admin agora usa dashboard) |
| `SelecionarProdutos.vue` | Busca + produtos no pedido (criar/editar) |

---

## Telas por perfil

### Cliente
- **Login** — layout próprio (gradiente)
- **Home** (`/cliente`) — banner, gráfico, lista, detalhe com produtos
- **Pedidos** (`/pedidos`) — menu de ações, visualizar, editar (se pendente), criar

### Administrador
- **Home** (`/admin`) — dashboard: gráfico, stats, pedidos recentes, atalhos
- **Pedidos** (`/pedidos`) — banner admin, todos os pedidos, editar qualquer status, excluir irrestrito
- **Usuários** (`/usuarios`) — cards mobile / tabela desktop + FAB
- **Produtos** (`/produtos`) — cards mobile / tabela desktop + FAB
- **Configurações** — layout admin com banner

### Fornecedor
- **Home** (`/fornecedor`) — lista + visualização (`PedidoDetalhesVisualizar`) + marcar envio
- Sem aba Pedidos no menu

---

## Correção global de CSS (`App.vue`)

- `#app` passou de `text-align: center` para **`left`** — corrige home do cliente e demais telas.
- Tema escuro: variáveis CSS e overrides para cards.

---

## Como testar tudo (checklist rápido)

```bash
cd backend && npm run dev
cd frontend && npm run serve   # dev local
# ou: npm run build && servir dist/ em produção
```

1. [ ] Login cliente → home estilizada
2. [ ] Pedidos → Ver → produtos em cards no mobile
3. [ ] Pedidos → Editar (pendente) → produtos editáveis em cards
4. [ ] Login admin → Início → dashboard com atalhos
5. [ ] Login admin → Pedidos → banner + cards + editar com status
6. [ ] Login admin → Usuários/Produtos → FAB e cards no mobile
7. [ ] Login fornecedor → detalhe do pedido com produtos
8. [ ] Tema escuro em visualizar/editar
9. [ ] Produção: sem erros webpack-dev-server no console

---

## Ordem sugerida de leitura

1. [DEPLOY_FRONTEND_PRODUCAO.md](./DEPLOY_FRONTEND_PRODUCAO.md) — se houver loop/reload no site
2. [ADMIN_MOBILE_DESKTOP.md](./ADMIN_MOBILE_DESKTOP.md) — painel admin completo
3. [MENU_ACOES_PEDIDOS.md](./MENU_ACOES_PEDIDOS.md)
4. [VISUALIZACAO_PEDIDO.md](./VISUALIZACAO_PEDIDO.md)
5. [PRODUTOS_PEDIDO_MOBILE.md](./PRODUTOS_PEDIDO_MOBILE.md)
6. [EDITAR_PEDIDO.md](./EDITAR_PEDIDO.md)

---

## Arquivos principais (referência rápida)

```
frontend/src/
├── assets/styles/admin-page.css   # layout admin compartilhado
├── components/
│   ├── menuPedidosCliente.vue
│   ├── PedidoDetalhesVisualizar.vue
│   ├── PedidoProdutosLista.vue
│   ├── PedidoEditarForm.vue
│   ├── PedidoEditarAdminModal.vue
│   └── SelecionarProdutos.vue
├── views/
│   ├── PedidosView.vue           # cliente + admin
│   ├── HomeCliente.vue
│   ├── HomeAdmin.vue             # dashboard admin
│   ├── GerenciarUsuariosView.vue
│   ├── GerenciarProdutosView.vue
│   ├── ConfiguracoesView.vue
│   └── HomeFornecedor.vue
└── App.vue                       # tema + text-align global
```
