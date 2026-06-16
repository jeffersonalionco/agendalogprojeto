# Menu de ações — aba Pedidos (mobile e desktop)

Documentação das alterações no menu de ações da página **Pedidos**, usada por **cliente** e **administrador**.

**Arquivos alterados:**

| Arquivo | Papel |
|---------|--------|
| `frontend/src/components/menuPedidosCliente.vue` | Componente do menu (botões desktop + barra mobile) |
| `frontend/src/views/PedidosView.vue` | Página que usa o menu, layout responsivo e integração |

**Data da alteração:** maio/2026

---

## O que foi feito

1. **Redesign do menu no mobile**  
   Substituído o menu suspenso (botão “Ações” + popover) por uma **barra fixa de 4 botões** (ou 3 para admin), sempre visível, com ícones e rótulos curtos.

2. **Melhorias no desktop**  
   Botões com ícones Bootstrap Icons, estado **ativo** na ação em uso e **desabilitados** quando não há pedido selecionado (exceto “Criar”).

3. **Regras por tipo de usuário**  
   O botão **Criar** só aparece para usuário **cliente** (admin não cria pedido pela API).

4. **Layout responsivo da página Pedidos**  
   No celular, lista de pedidos fica **acima** e o painel de ações **abaixo**; scroll automático até o painel ao selecionar pedido ou ação.

5. **Feedback visual**  
   Texto de ajuda no mobile, número do pedido selecionado e título dinâmico no cabeçalho (“Detalhes do pedido”, “Editar pedido”, etc.).

6. **Correção ESLint**  
   Removidas propriedades `_mqMobile` / `_onMqChange` de `data()` (chaves com `_` são reservadas no Vue); uso de `mqMobile` e método `onMobileLayoutChange`.

---

## O que mudou

### Antes

| Aspecto | Comportamento anterior |
|---------|------------------------|
| Mobile | Um botão “Ações” abria um popover pequeno |
| Acesso | Era preciso abrir o menu para cada ação |
| Toque | Área de toque pequena; popover podia ficar atrás do conteúdo (`z-index`) |
| Pedido não selecionado | Aviso só após clicar na ação |
| Admin | Via o mesmo menu, incluindo “Criar pedido” (falhava no backend) |
| Layout mobile | Colunas `col-md-*` sem empilhamento claro; texto “lista ao lado” |

### Depois

| Aspecto | Comportamento atual |
|---------|---------------------|
| Mobile | Grade de botões: **Criar**, **Ver**, **Editar**, **Excluir** (altura ~52px) |
| Desktop (≥ 768px) | Botões em linha, como antes, com ícones e estados |
| Pedido não selecionado | **Ver**, **Editar** e **Excluir** desabilitados; dica abaixo da barra |
| Ação ativa | Contorno/brilho no botão da ação em uso |
| Admin | 3 botões (sem Criar); grade em 3 colunas |
| Layout | `col-12` no mobile; scroll suave para `#pedidos-painel-acoes` |
| Breakpoint | `768px` (`max-width: 767.98px` = mobile) |

### Props do componente `menuPedidosCliente`

| Prop | Tipo | Descrição |
|------|------|-----------|
| `temPedidoSelecionado` | `Boolean` | Habilita Ver / Editar / Excluir |
| `acaoAtual` | `String` | `'criar'`, `'visualizar'`, `'editar'`, `'excluir'` ou `null` |
| `podeCriar` | `Boolean` | Exibe botão Criar (só `true` para cliente) |
| `pedidoResumo` | `String` | Ex.: `Pedido #PED-...` no mobile |

**Evento emitido:** `@select` com o nome da ação (`'criar'`, `'visualizar'`, etc.).

### Lógica em `PedidosView.vue`

- `podeCriarPedido`: `tipoUsuario === 'cliente'` (lê `localStorage.user`).
- `acaoAtualLabel`: título do painel conforme a ação.
- `isMobileLayout`: `matchMedia('(max-width: 767.98px)')`.
- `scrollParaPainelAcoes()`: rola até o painel no mobile após selecionar pedido ou ação.

---

## Como testar

### Pré-requisitos

```bash
# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm run serve
```

Acesse a URL exibida no terminal (ex.: `http://localhost:3027` ou a porta em uso).

**Credenciais de exemplo** (ajuste conforme seu banco):

| Perfil | E-mail | Senha (padrão do projeto) |
|--------|--------|---------------------------|
| Cliente | `cliente@agendalog.com` | conforme cadastro no banco |
| Admin | `admin@agendalog.com` | `admin123` |

### 1. Build sem erro ESLint

```bash
cd frontend
npm run build
```

Deve concluir sem o erro `vue/no-reserved-keys`.

### 2. Desktop (largura ≥ 768px)

1. Faça login como **cliente** ou **admin**.
2. Menu → **Pedidos**.
3. Confira no cabeçalho azul (info):
   - **Cliente:** 4 botões — Criar Pedido, Visualizar, Editar, Excluir.
   - **Admin:** 3 botões — sem “Criar Pedido”.
4. Sem pedido selecionado: Visualizar, Editar e Excluir devem estar **desabilitados**.
5. Clique em um pedido na lista: os três passam a habilitar.
6. Clique em **Visualizar**: painel mostra detalhes; botão Visualizar com estado ativo.
7. Repita para **Editar** e **Excluir**.

### 3. Mobile (largura &lt; 768px)

Use o DevTools do navegador (F12 → ícone de celular) ou um aparelho real.

1. Login → **Pedidos**.
2. Verifique a **barra colorida** com 4 (cliente) ou 3 (admin) botões — **sem** menu “três pontinhos”.
3. Sem pedido selecionado:
   - Ver, Editar e Excluir **acinzentados** / não clicáveis.
   - Texto: “Selecione um pedido na lista…”.
4. Toque em um pedido na lista:
   - Página deve **rolar** até o painel de ações.
   - Texto com “Pedido #…”.
5. Toque em **Ver**: detalhes do pedido; botão Ver com destaque.
6. Toque em **Criar** (cliente): formulário de novo pedido; título “Criar pedido”.
7. Layout: lista **em cima**, ações **embaixo**; mensagem vazia diz “lista **acima**”.

### 4. Admin × Cliente

| Teste | Cliente | Admin |
|-------|---------|-------|
| Botão Criar visível | Sim | Não |
| Ver todos os pedidos na lista | Só os seus | Todos |
| Excluir pedido pendente | Sim | Sim |
| Criar pedido pela UI | Sim | Não (botão oculto) |

### 5. Regressão rápida

- [ ] Busca por número/fornecedor na lista continua funcionando.
- [ ] Criar / editar / excluir pedido **pendente** (cliente).
- [ ] Confirmar entrega em pedido **enviado** (visualizar → botão confirmar).
- [ ] Tema escuro: botões do menu legíveis no cabeçalho info.
- [ ] Redimensionar janela: em 767px mobile, em 768px desktop.

---

## Referência visual (mobile)

```
┌─────────────────────────────────────┐
│  Detalhes do pedido                   │
├─────────────────────────────────────┤
│ [Criar] [ Ver ] [Editar] [Excluir]   │  ← barra de ações
│  ✓ Pedido #PED-260526-2030           │  ← hint
├─────────────────────────────────────┤
│  (conteúdo: form / detalhes / etc.)   │
└─────────────────────────────────────┘
```

---

## Problemas conhecidos / limitações

- **Editar / excluir** no frontend ainda exige status `pendente` (mensagem de aviso); o admin no backend pode ter regras diferentes — comportamento de negócio não foi alterado nesta entrega.
- `mqMobile` não está em `data()`; é atribuído em `mounted` (não reativo, apenas para listener de resize).

---

## Histórico

| Versão | Descrição |
|--------|-----------|
| 1.0 | Menu mobile em grade, props, layout PedidosView, correção ESLint |
