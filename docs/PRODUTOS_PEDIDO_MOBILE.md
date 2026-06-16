# Produtos do pedido — layout mobile (cliente, admin e fornecedor)

Documentação da melhoria na **listagem de produtos** ao visualizar um pedido, unificada para os três perfis de login.

**Arquivos:**

| Arquivo | Papel |
|---------|--------|
| `frontend/src/components/PedidoProdutosLista.vue` | **Novo** — lista de produtos (mobile + desktop) |
| `frontend/src/components/PedidoDetalhesVisualizar.vue` | Usa `PedidoProdutosLista`; slot `#acoes` para fornecedor |
| `frontend/src/views/PedidosView.vue` | Cliente e admin — visualizar via `PedidoDetalhesVisualizar` |
| `frontend/src/views/HomeFornecedor.vue` | Fornecedor — mesmo componente de visualização |

**Relacionado:** [VISUALIZACAO_PEDIDO.md](./VISUALIZACAO_PEDIDO.md) · [MENU_ACOES_PEDIDOS.md](./MENU_ACOES_PEDIDOS.md)

---

## O que foi feito

1. **Componente `PedidoProdutosLista.vue`**  
   Responsável só pela seção de produtos, reutilizado em todos os perfis.

2. **Layout mobile (estilo recibo)**  
   Cada produto virou um card com:
   - Número do item em badge azul  
   - Nome em destaque + código em etiqueta  
   - Grade **3 colunas**: Qtd | Unitário | Subtotal (subtotal destacado)  
   - Faixa final azul com **Total do pedido** em destaque  
   - Resumo “Total: R$ …” no cabeçalho da seção (mobile)

3. **Layout desktop**  
   Tabela com coluna `#`, produto, código, quantidade, unitário e subtotal + rodapé de total.

4. **Unificação por perfil**

   | Perfil | Onde vê produtos | Observação |
   |--------|------------------|------------|
   | **Cliente** | Pedidos → Ver | Pode confirmar entrega abaixo dos produtos |
   | **Admin** | Pedidos → Visualizar | Só leitura; sem confirmar entrega |
   | **Fornecedor** | Home (início) → selecionar pedido | Bloco de ação “aguardando envio” acima dos produtos |

5. **Fornecedor alinhado ao restante**  
   `HomeFornecedor.vue` deixou de usar tabela antiga e passou a usar `PedidoDetalhesVisualizar` + slot `#acoes` para marcar status pendente.

6. **Tema escuro**  
   Cards e tabela compatíveis com `html.theme-dark`.

---

## O que mudou

### Antes (mobile)

- Texto corrido: nome + meta em linha (`código · qtd · unitário`)  
- Subtotal à direita do nome (apertado em telas pequenas)  
- Total em card simples sem destaque  
- **Fornecedor:** tabela Bootstrap em tela estreita (scroll horizontal difícil)

### Depois (mobile)

```
┌─────────────────────────────┐
│ [1]  Nome do produto        │
│      código                 │
├───────┬─────────┬───────────┤
│  QTD  │ UNITÁR. │ SUBTOTAL  │
│   2   │ R$ 10   │ R$ 20,00  │
└───────┴─────────┴───────────┘
┌─────────────────────────────┐
│ Total do pedido    R$ 150,00│  ← faixa azul
└─────────────────────────────┘
```

### Props de `PedidoProdutosLista`

| Prop | Tipo | Descrição |
|------|------|-----------|
| `produtos` | `Array` | Itens do pedido |
| `valorTotal` | `Number \| String` | Total exibido no rodapé |

Breakpoint: **768px** — abaixo disso cards; acima tabela.

---

## Como testar

### Pré-requisitos

```bash
cd backend && npm run dev
cd frontend && npm run serve
```

### Build

```bash
cd frontend && npm run build
```

### Cliente

1. Login **cliente** → **Pedidos**.  
2. Selecione um pedido com produtos → **Ver**.  
3. Mobile (&lt; 768px):
   - [ ] Cards com número, nome, código  
   - [ ] Três colunas Qtd / Unitário / Subtotal legíveis  
   - [ ] Faixa azul “Total do pedido” no final  
4. Desktop:
   - [ ] Tabela completa; cards ocultos  

### Administrador

1. Login **admin** → **Pedidos**.  
2. Selecione pedido → **Visualizar**.  
3. Mesmos checks de layout dos produtos (igual ao cliente).  
4. [ ] **Não** aparece “Confirmar entrega” (só produtos + hero + infos).

### Fornecedor

1. Login **fornecedor** → página **Início** (home).  
2. Selecione um pedido na lista “Pedidos Atribuídos a Mim”.  
3. Mobile:
   - [ ] Scroll até o painel de detalhes  
   - [ ] Bloco amarelo “Ação necessária” se status `pendente`  
   - [ ] Produtos nos **mesmos cards** do cliente/admin  
4. Pedido `pendente` → botão “Marcar como aguardando envio” funciona.  
5. Desktop: tabela de produtos + ações do fornecedor ao lado.

### Tema escuro

- [ ] Cards de produto com fundo escuro legível  
- [ ] Faixa de total azul ainda visível  
- [ ] Código do produto com contraste ok  

### Regressão

- [ ] Imprimir pedido (cliente, admin, fornecedor)  
- [ ] Pedido sem produtos → mensagem “Nenhum produto neste pedido”  
- [ ] Valores batem com total do pedido  

---

## Onde cada perfil acessa

| Perfil | Rota / tela | Menu |
|--------|-------------|------|
| Cliente | `/#/pedidos` → Ver | Pedidos |
| Admin | `/#/pedidos` → Visualizar | Pedidos |
| Fornecedor | `/#/fornecedor` → clicar no pedido | Início (não tem menu Pedidos) |

---

## Manutenção

- Ajustes visuais dos produtos: editar `PedidoProdutosLista.vue`.  
- Novo campo por produto: incluir no card mobile (`.pedido-produtos__valores`) e na tabela desktop.  
- Ações específicas de perfil: slot `#acoes` em `PedidoDetalhesVisualizar` (ex.: fornecedor em `HomeFornecedor.vue`).

---

## Histórico

| Versão | Descrição |
|--------|-----------|
| 1.0 | `PedidoProdutosLista`, cards mobile estilo recibo, fornecedor unificado |
