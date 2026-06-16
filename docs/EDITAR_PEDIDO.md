# Edição de pedidos — layout e produtos no mobile

Documentação da reformulação da tela **Editar pedido** e do componente de **seleção de produtos**, para cliente, admin e fluxo rápido do admin na home.

**Data:** maio/2026

---

## Índice da documentação do frontend

| Documento | Conteúdo |
|-----------|----------|
| [INDICE_ALTERACOES_FRONTEND.md](./INDICE_ALTERACOES_FRONTEND.md) | Índice geral de todas as alterações |
| [MENU_ACOES_PEDIDOS.md](./MENU_ACOES_PEDIDOS.md) | Menu de ações (mobile/desktop) |
| [VISUALIZACAO_PEDIDO.md](./VISUALIZACAO_PEDIDO.md) | Tela Visualizar pedido |
| [PRODUTOS_PEDIDO_MOBILE.md](./PRODUTOS_PEDIDO_MOBILE.md) | Lista de produtos (somente leitura) |
| **EDITAR_PEDIDO.md** (este arquivo) | Tela Editar + SelecionarProdutos |
| [DEPLOY_FRONTEND_PRODUCAO.md](./DEPLOY_FRONTEND_PRODUCAO.md) | Deploy produção vs dev server |

---

## O que foi feito

### 1. Novo `PedidoEditarForm.vue`
Formulário completo de edição usado na aba **Pedidos** (`/pedidos`):
- Cabeçalho laranja com número, status e total
- Seções: dados do pedido + produtos
- Bloqueio visual quando cliente não pode editar (status ≠ pendente)
- Admin: campo **Status** extra + pode editar qualquer pedido
- Botões largos no mobile

### 2. `SelecionarProdutos.vue` reformulado
Usado em **Criar** e **Editar** pedido:
- Busca com botão e ícone (compacto no mobile)
- Resultados em lista tocável (não `list-group` estreito)
- **Produtos no pedido — mobile:** cards com Qtd | Unitário | Subtotal editáveis + remover
- **Desktop:** tabela editável
- Faixa laranja com total no mobile

### 3. `PedidoEditarAdminModal.vue`
Modal da **home do admin** (`/admin`):
- Bottom sheet no mobile, centralizado no desktop
- Edição rápida: status, descrição, valor
- Aviso para editar produtos na aba Pedidos

### 4. Ajustes em `PedidosView.vue`
- Usa `PedidoEditarForm` no lugar do HTML antigo
- **Admin** pode salvar pedido mesmo se status ≠ pendente
- **Cliente** continua restrito a pedidos `pendente`
- Painel com classe `pedidos-painel-body--editar`

### 5. Ajustes em `HomeAdmin.vue`
- Substitui modal Bootstrap antigo por `PedidoEditarAdminModal`

---

## Quem edita pedido onde

| Perfil | Onde | Produtos | Observação |
|--------|------|----------|------------|
| **Cliente** | Pedidos → Editar | Sim (`SelecionarProdutos`) | Só se status `pendente` |
| **Admin** | Pedidos → Editar | Sim + alterar status | Qualquer status |
| **Admin** | Home → Editar na tabela | Não (status/descrição/valor) | Modal rápido |
| **Fornecedor** | — | — | Não edita pedidos na UI |

---

## O que mudou (antes × depois)

### Editar pedido (Pedidos)

| Antes | Depois |
|-------|--------|
| Título + formulário Bootstrap simples | Hero laranja + seções |
| Tabela de produtos no mobile (scroll horizontal) | Cards editáveis por produto |
| Admin bloqueado no front se ≠ pendente | Admin pode editar sempre |
| Alerta amarelo genérico | Bloco de bloqueio com ícone |

### Produtos no pedido (SelecionarProdutos)

| Antes | Depois |
|-------|--------|
| Tabela única em todas as telas | Cards no mobile, tabela no desktop |
| Inputs pequenos na tabela | Campos grandes (min 40px) no mobile |
| Botão × minúsculo | Botão remover com ícone lixeira |

### Admin home

| Antes | Depois |
|-------|--------|
| Modal Bootstrap central estreito | Sheet mobile / modal responsivo |
| Sem orientação sobre produtos | Link textual para aba Pedidos |

---

## Arquivos alterados

| Arquivo | Tipo |
|---------|------|
| `frontend/src/components/PedidoEditarForm.vue` | **Novo** |
| `frontend/src/components/PedidoEditarAdminModal.vue` | **Novo** |
| `frontend/src/components/SelecionarProdutos.vue` | Reescrito |
| `frontend/src/views/PedidosView.vue` | Integração + regra admin |
| `frontend/src/views/HomeAdmin.vue` | Modal admin |

---

## Como testar

### Build

```bash
cd frontend
npm run build
```

### Cliente — editar com produtos

1. Login **cliente** → **Pedidos**.
2. Selecione pedido **pendente** → **Editar**.
3. Mobile (&lt; 768px):
   - [ ] Hero laranja com número e status
   - [ ] Buscar produto → tocar resultado → card aparece na lista
   - [ ] Alterar quantidade e valor unitário nos cards
   - [ ] Subtotal e total laranja atualizam
   - [ ] Remover produto (ícone lixeira)
   - [ ] Salvar / Cancelar em largura total
4. Pedido **não pendente**:
   - [ ] Bloco “Edição não disponível” (sem formulário)

### Admin — aba Pedidos (edição completa)

1. Login **admin** → **Pedidos**.
2. Editar pedido (qualquer status):
   - [ ] Campo **Status** visível
   - [ ] Produtos em cards (mobile) ou tabela (desktop)
   - [ ] Salvar altera status + produtos

### Admin — home (edição rápida)

1. Login **admin** → tela inicial.
2. Tabela → **Editar** em um pedido.
3. Mobile:
   - [ ] Sheet sobe de baixo
   - [ ] Campos status, descrição, valor
   - [ ] Mensagem sobre aba Pedidos para produtos

### Criar pedido (regressão)

1. Cliente → Pedidos → **Criar**.
2. [ ] Mesmo `SelecionarProdutos` com layout novo funciona na criação.

---

## Layout mobile — produtos na edição

```
┌─────────────────────────────┐
│ [1]  Nome do produto    🗑  │
│      COD-123                │
├────────┬─────────┬──────────┤
│  QTD   │ UNIT.   │ SUBTOTAL │
│  [2]   │ [10.00] │ R$ 20,00 │
└────────┴─────────┴──────────┘
┌─────────────────────────────┐
│ Total dos produtos  R$ 20,00│  ← faixa laranja
└─────────────────────────────┘
```

---

## Regras de negócio (frontend)

- **Cliente:** `podeEditarPedido` = status `pendente`.
- **Admin (Pedidos):** sempre pode editar; envia `status` no payload.
- **Admin (Home):** edita só `status`, `descricao`, `valor` (sem array `produtos`).
- Valor total na edição = soma dos produtos (`totalProdutosEditando`).

---

## Manutenção

- Visual do formulário de edição: `PedidoEditarForm.vue`.
- Cards/tabela de produtos editáveis: `SelecionarProdutos.vue`.
- Lista somente leitura (visualizar): `PedidoProdutosLista.vue` (ver [PRODUTOS_PEDIDO_MOBILE.md](./PRODUTOS_PEDIDO_MOBILE.md)).

---

## Histórico

| Versão | Descrição |
|--------|-----------|
| 1.0 | PedidoEditarForm, SelecionarProdutos mobile, modal admin, regra admin/cliente |
