# Visualização de pedido — redesign (mobile e desktop)

Documentação do novo layout da tela **Visualizar pedido** na aba **Pedidos**, usada por **cliente** e **administrador**.

**Arquivos envolvidos:**

| Arquivo | Papel |
|---------|--------|
| `frontend/src/components/PedidoDetalhesVisualizar.vue` | **Novo** — layout completo da visualização |
| `frontend/src/views/PedidosView.vue` | Integração do componente e fundo do painel |

**Relacionado:** [MENU_ACOES_PEDIDOS.md](./MENU_ACOES_PEDIDOS.md) (menu de ações na mesma página)

---

## O que foi feito

1. **Componente dedicado** `PedidoDetalhesVisualizar.vue`  
   Toda a UI de “Ver pedido” saiu do template monolítico de `PedidosView` e passou para um componente reutilizável e estilizado.

2. **Cabeçalho (hero)**  
   Faixa superior em gradiente azul com:
   - Número do pedido em destaque  
   - Badge de status com ícone (pendente, enviado, entregue, etc.)  
   - Descrição do pedido  
   - Valor total em caixa lateral  
   - Botão **Imprimir** com ícone Bootstrap (sem emoji)

3. **Seção Informações**  
   Grade de cards com ícones: número, fornecedor, data do pedido e data de entrega.

4. **Seção Produtos**  
   - **Mobile:** lista em cards (nome, código, quantidade, unitário, subtotal + linha de total)  
   - **Desktop:** tabela profissional com cabeçalho estilizado e rodapé de total  
   - Contador de itens no título da seção

5. **Confirmação de entrega**  
   Bloco visual (ícone + texto + botão) em vez de `alert` genérico:
   - Apenas para **cliente** (`podeConfirmarEntrega`)  
   - Estado “entregue” com mensagem de sucesso estilizada

6. **Responsividade e tema**  
   - Breakpoint produtos: `768px` (cards ↔ tabela)  
   - Suporte ao **tema escuro** (`html.theme-dark`)  
   - Animação suave de entrada  
   - Painel com fundo `pedidos-painel-body--visualizar` na visualização

---

## O que mudou

### Antes

- Título repetido (“Detalhes do Pedido #…” + cabeçalho da página)  
- Parágrafos `<p><strong>Campo:</strong> valor</p>` em duas colunas  
- Tabela única em todos os tamanhos de tela (difícil de ler no celular)  
- Botão imprimir com emoji 🖨️  
- Alertas Bootstrap para entrega / entregue  
- Admin via o mesmo bloco de confirmação de entrega (sem restrição visual)

### Depois

| Área | Comportamento |
|------|----------------|
| Hero | Gradiente, status, total e imprimir no topo |
| Informações | Cards com ícones em grade 1×N (mobile) ou 2×N (tablet+) |
| Produtos mobile | Cards empilhados + total destacado |
| Produtos desktop | Tabela com thead/tfoot estilizados |
| Entrega | CTA só para cliente; admin só visualiza status |
| Código | Componente isolado, mais fácil de manter |

### Props e eventos do componente

**Props:**

| Prop | Tipo | Descrição |
|------|------|-----------|
| `pedido` | `Object` | Pedido selecionado (obrigatório) |
| `fornecedorNome` | `String` | E-mail/nome do fornecedor |
| `confirmandoEntrega` | `Boolean` | Loading no botão confirmar |
| `podeConfirmarEntrega` | `Boolean` | `true` só para cliente |

**Eventos:**

| Evento | Quando |
|--------|--------|
| `imprimir` | Clique em Imprimir |
| `confirmar-entrega` | Clique em Confirmar entrega |

---

## Como testar

### Pré-requisitos

```bash
cd backend && npm run dev
cd frontend && npm run serve
```

Abra a URL do frontend (ex.: `http://localhost:3027`).

### Build

```bash
cd frontend && npm run build
```

Deve compilar sem erros.

### Fluxo — Cliente

1. Login como **cliente** → menu **Pedidos**.  
2. Selecione um pedido na lista → toque em **Ver** (mobile) ou **Visualizar** (desktop).  
3. Confira:
   - [ ] Hero azul com número, status e valor total  
   - [ ] Cards de informação (fornecedor, datas)  
   - [ ] Lista de produtos legível no celular  
   - [ ] Botão **Imprimir** abre janela de impressão  
4. Pedido com status `enviado` ou `aguardando envio`:  
   - [ ] Bloco “Confirmar recebimento” com botão verde  
   - [ ] Confirmação atualiza status para `entregue`  
5. Pedido `entregue`:  
   - [ ] Bloco verde “Entrega confirmada” com data/hora  

### Fluxo — Administrador

1. Login como **admin** → **Pedidos**.  
2. Selecione qualquer pedido → **Visualizar**.  
3. Confira:
   - [ ] Mesmo layout hero + informações + produtos  
   - [ ] **Não** aparece botão “Confirmar entrega”  
   - [ ] Pedido entregue mostra apenas mensagem de sucesso (sem ação)  

### Mobile (&lt; 768px)

DevTools → modo dispositivo ou celular real.

- [ ] Hero: número e total legíveis; botão Imprimir acessível  
- [ ] Produtos em **cards**, não tabela  
- [ ] CTA de entrega em coluna, botão largura total  
- [ ] Scroll automático até o painel (comportamento da página Pedidos)  

### Desktop (≥ 768px)

- [ ] Hero em linha (texto à esquerda, total/imprimir à direita)  
- [ ] Grade de informações em 2 colunas  
- [ ] Produtos em **tabela**; cards ocultos  
- [ ] Hover nos botões e linhas da tabela  

### Tema escuro

Menu do app → alternar tema escuro.

- [ ] Cards e tabela com fundo escuro coerente  
- [ ] Hero ainda legível  
- [ ] Textos e ícones com contraste adequado  

### Regressão

- [ ] Criar / Editar / Excluir pedido continuam iguais  
- [ ] Menu de ações (barra mobile / botões desktop) inalterado em comportamento  
- [ ] Busca na lista de pedidos funciona  

---

## Referência visual

### Mobile (produtos em cards)

```
┌─────────────────────────────────┐
│ PEDIDO          [ Pendente ]    │
│ #PED-260526-1200                │
│ Descrição do pedido...          │
│              Total R$ 150,00    │
│              [ Imprimir ]       │
├─────────────────────────────────┤
│ ℹ Informações                   │
│ ┌─────────┐ ┌─────────┐        │
│ │ Número  │ │ Fornec. │        │
│ └─────────┘ └─────────┘        │
├─────────────────────────────────┤
│ 📦 Produtos (3)                 │
│ ┌ Produto A        R$ 50,00 ┐  │
│ │ código · qtd · unitário    │  │
│ └────────────────────────────┘  │
│ ┌ Total do pedido  R$ 150,00 ┐  │
└─────────────────────────────────┘
```

### Desktop (tabela)

Mesmo hero + informações; produtos em tabela com colunas Produto, Código, Qtd, Unitário, Subtotal.

---

## Manutenção

- Ajustes visuais da visualização: editar `PedidoDetalhesVisualizar.vue`.  
- Novos campos do pedido: incluir em `pedido-view__info-grid` e, se necessário, na impressão em `PedidosView.gerarConteudoImpressao`.  
- Status novos: adicionar entrada em `STATUS_MAP` no script do componente.

---

## Histórico

| Versão | Descrição |
|--------|-----------|
| 1.0 | Componente PedidoDetalhesVisualizar, layout hero/cards/tabela, CTA entrega, tema escuro |
