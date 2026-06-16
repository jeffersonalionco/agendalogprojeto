<template>
  <section class="pedido-produtos" aria-labelledby="pedido-produtos-titulo">
    <header class="pedido-produtos__header">
      <h3 id="pedido-produtos-titulo" class="pedido-produtos__title">
        <i class="bi bi-box-seam" aria-hidden="true"></i>
        Produtos do pedido
        <span class="pedido-produtos__count">{{ produtos.length }}</span>
      </h3>
      <span v-if="produtos.length > 0" class="pedido-produtos__resumo-mobile">
        Total: <strong>R$ {{ formatarMoeda(valorTotal) }}</strong>
      </span>
    </header>

    <div v-if="produtos.length === 0" class="pedido-produtos__empty">
      <i class="bi bi-inbox" aria-hidden="true"></i>
      <p>Nenhum produto neste pedido.</p>
    </div>

    <template v-else>
      <!-- mobile: cards estilo recibo -->
      <ul class="pedido-produtos__lista" role="list">
        <li
          v-for="(produto, index) in produtos"
          :key="index"
          class="pedido-produtos__item"
        >
          <div class="pedido-produtos__item-top">
            <span class="pedido-produtos__index" aria-hidden="true">{{ index + 1 }}</span>
            <div class="pedido-produtos__item-main">
              <p class="pedido-produtos__nome">{{ produto.nome || produto.descricao }}</p>
              <span class="pedido-produtos__codigo">
                <i class="bi bi-upc-scan" aria-hidden="true"></i>
                {{ produto.codigo_interno || 'Sem código' }}
              </span>
            </div>
          </div>

          <div class="pedido-produtos__valores" role="group" :aria-label="`Valores do item ${index + 1}`">
            <div class="pedido-produtos__valor-cell">
              <span class="pedido-produtos__valor-label">Qtd</span>
              <span class="pedido-produtos__valor-num">{{ produto.quantidade }}</span>
            </div>
            <div class="pedido-produtos__valor-cell">
              <span class="pedido-produtos__valor-label">Unitário</span>
              <span class="pedido-produtos__valor-num">R$ {{ valorUnitario(produto) }}</span>
            </div>
            <div class="pedido-produtos__valor-cell pedido-produtos__valor-cell--destaque">
              <span class="pedido-produtos__valor-label">Subtotal</span>
              <span class="pedido-produtos__valor-num pedido-produtos__valor-num--sub">R$ {{ subtotalProduto(produto) }}</span>
            </div>
          </div>
        </li>
      </ul>

      <div class="pedido-produtos__total-mobile">
        <span class="pedido-produtos__total-label">Total do pedido</span>
        <span class="pedido-produtos__total-valor">R$ {{ formatarMoeda(valorTotal) }}</span>
      </div>

      <!-- desktop: tabela -->
      <div class="pedido-produtos__table-wrap table-responsive">
        <table class="table pedido-produtos__table">
          <thead>
            <tr>
              <th class="text-center" style="width: 3rem">#</th>
              <th>Produto</th>
              <th>Código</th>
              <th class="text-center">Qtd</th>
              <th class="text-end">Unitário</th>
              <th class="text-end">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(produto, index) in produtos" :key="'t-' + index">
              <td class="text-center text-muted">{{ index + 1 }}</td>
              <td class="pedido-produtos__table-nome">{{ produto.nome || produto.descricao }}</td>
              <td class="text-muted">{{ produto.codigo_interno || '—' }}</td>
              <td class="text-center">{{ produto.quantidade }}</td>
              <td class="text-end">R$ {{ valorUnitario(produto) }}</td>
              <td class="text-end fw-semibold">R$ {{ subtotalProduto(produto) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="5" class="text-end">Total do pedido</td>
              <td class="text-end">R$ {{ formatarMoeda(valorTotal) }}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </template>
  </section>
</template>

<script>
export default {
  name: 'PedidoProdutosLista',
  props: {
    produtos: {
      type: Array,
      default: () => [],
    },
    valorTotal: {
      type: [Number, String],
      default: 0,
    },
  },
  methods: {
    formatarMoeda(valor) {
      return parseFloat(valor || 0).toFixed(2)
    },
    valorUnitario(produto) {
      return parseFloat(produto.valor_unitario || produto.valor_compra || 0).toFixed(2)
    },
    subtotalProduto(produto) {
      const sub = produto.subtotal
      if (sub != null) return parseFloat(sub).toFixed(2)
      const qtd = parseFloat(produto.quantidade || 0)
      const unit = parseFloat(produto.valor_unitario || produto.valor_compra || 0)
      return (qtd * unit).toFixed(2)
    },
  },
}
</script>

<style scoped>
.pedido-produtos__header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.85rem;
}

.pedido-produtos__title {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.95rem;
  font-weight: 700;
  margin: 0;
  color: var(--app-text, #2c3e50);
}

.pedido-produtos__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.4rem;
  height: 1.4rem;
  padding: 0 0.4rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  background: rgba(13, 110, 253, 0.12);
  color: #0d6efd;
}

.pedido-produtos__resumo-mobile {
  font-size: 0.82rem;
  color: var(--muted, #6c757d);
}

.pedido-produtos__resumo-mobile strong {
  color: #0d6efd;
  font-size: 0.95rem;
}

@media (min-width: 768px) {
  .pedido-produtos__resumo-mobile {
    display: none;
  }
}

/* lista mobile */
.pedido-produtos__lista {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

@media (min-width: 768px) {
  .pedido-produtos__lista,
  .pedido-produtos__total-mobile {
    display: none;
  }
}

.pedido-produtos__item {
  background: var(--card-bg, #fff);
  border: 1px solid var(--card-border, rgba(0, 0, 0, 0.08));
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.pedido-produtos__item-top {
  display: flex;
  gap: 0.75rem;
  padding: 0.85rem 1rem 0.65rem;
  border-bottom: 1px solid var(--card-border, rgba(0, 0, 0, 0.06));
}

.pedido-produtos__index {
  flex-shrink: 0;
  width: 1.65rem;
  height: 1.65rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: rgba(13, 110, 253, 0.12);
  color: #0d6efd;
  font-size: 0.75rem;
  font-weight: 800;
}

.pedido-produtos__item-main {
  flex: 1;
  min-width: 0;
}

.pedido-produtos__nome {
  margin: 0 0 0.35rem;
  font-size: 0.95rem;
  font-weight: 700;
  line-height: 1.35;
  color: var(--app-text, #212529);
  word-break: break-word;
}

.pedido-produtos__codigo {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--muted, #6c757d);
  background: rgba(0, 0, 0, 0.04);
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pedido-produtos__valores {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0;
}

.pedido-produtos__valor-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.65rem 0.35rem;
  text-align: center;
  border-right: 1px solid var(--card-border, rgba(0, 0, 0, 0.06));
}

.pedido-produtos__valor-cell:last-child {
  border-right: none;
}

.pedido-produtos__valor-cell--destaque {
  background: rgba(13, 110, 253, 0.06);
}

.pedido-produtos__valor-label {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--muted, #6c757d);
  margin-bottom: 0.2rem;
}

.pedido-produtos__valor-num {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--app-text, #212529);
  line-height: 1.2;
}

.pedido-produtos__valor-num--sub {
  font-size: 0.95rem;
  color: #0d6efd;
}

.pedido-produtos__total-mobile {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.75rem;
  padding: 1rem 1.15rem;
  border-radius: 14px;
  background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);
  color: #fff;
  box-shadow: 0 6px 20px rgba(13, 110, 253, 0.3);
}

.pedido-produtos__total-label {
  font-size: 0.85rem;
  font-weight: 600;
  opacity: 0.9;
}

.pedido-produtos__total-valor {
  font-size: 1.35rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

/* tabela desktop */
.pedido-produtos__table-wrap {
  display: none;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--card-border, rgba(0, 0, 0, 0.08));
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

@media (min-width: 768px) {
  .pedido-produtos__table-wrap {
    display: block;
  }
}

.pedido-produtos__table {
  margin: 0;
  font-size: 0.9rem;
}

.pedido-produtos__table thead th {
  background: rgba(13, 110, 253, 0.08);
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  padding: 0.75rem 1rem;
  border-bottom-width: 1px;
}

.pedido-produtos__table tbody td {
  padding: 0.85rem 1rem;
  vertical-align: middle;
}

.pedido-produtos__table-nome {
  font-weight: 600;
  max-width: 240px;
}

.pedido-produtos__table tfoot td {
  background: rgba(13, 110, 253, 0.06);
  font-weight: 700;
  padding: 0.9rem 1rem;
  border-top: 2px solid rgba(13, 110, 253, 0.15);
}

.pedido-produtos__table tfoot td:last-child {
  font-size: 1.05rem;
  color: #0d6efd;
}

.pedido-produtos__empty {
  text-align: center;
  padding: 2rem 1rem;
  color: var(--muted, #6c757d);
  background: var(--card-bg, #fff);
  border: 1px dashed var(--card-border, #dee2e6);
  border-radius: 12px;
}

.pedido-produtos__empty i {
  font-size: 2rem;
  display: block;
  margin-bottom: 0.5rem;
  opacity: 0.5;
}
</style>

<style>
html.theme-dark .pedido-produtos__item {
  background: var(--card-bg);
  border-color: var(--card-border);
}

html.theme-dark .pedido-produtos__codigo {
  background: rgba(255, 255, 255, 0.06);
}

html.theme-dark .pedido-produtos__valor-cell--destaque {
  background: rgba(13, 110, 253, 0.15);
}

html.theme-dark .pedido-produtos__table thead th {
  background: rgba(255, 255, 255, 0.06);
}
</style>
