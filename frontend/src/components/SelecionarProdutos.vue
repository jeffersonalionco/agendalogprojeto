<template>
  <div class="sel-produtos">
    <!-- busca -->
    <div class="sel-produtos__busca">
      <label for="busca-produto" class="sel-produtos__label">Buscar produto</label>
      <div class="sel-produtos__busca-row">
        <input
          id="busca-produto"
          v-model="termoBusca"
          type="search"
          enterkeyhint="search"
          class="form-control sel-produtos__input"
          placeholder="Nome ou código (ex: ARROZ)"
          @keyup.enter="buscarProdutos"
        />
        <button
          type="button"
          class="btn btn-primary sel-produtos__btn-buscar"
          :disabled="buscandoProdutos"
          @click="buscarProdutos"
        >
          <span v-if="buscandoProdutos" class="spinner-border spinner-border-sm" role="status"></span>
          <template v-else>
            <i class="bi bi-search" aria-hidden="true"></i>
            <span class="sel-produtos__btn-buscar-text">Buscar</span>
          </template>
        </button>
      </div>
    </div>

    <!-- resultados -->
    <div v-if="produtosEncontrados.length > 0" class="sel-produtos__resultados">
      <p class="sel-produtos__resultados-title">
        Resultados ({{ produtosEncontrados.length }})
      </p>
      <ul class="sel-produtos__resultados-lista" role="list">
        <li v-for="produto in produtosEncontrados" :key="produto.id">
          <button
            type="button"
            class="sel-produtos__resultado-item"
            @click="selecionarProduto(produto)"
          >
            <span class="sel-produtos__resultado-nome">{{ produto.descricao }}</span>
            <span class="sel-produtos__resultado-meta">
              <i class="bi bi-upc-scan" aria-hidden="true"></i>
              {{ produto.codigo_interno }}
              · Estoque {{ produto.quantidade_estoque }}
              · R$ {{ parseFloat(produto.valor_venda).toFixed(2) }}
            </span>
            <i class="bi bi-plus-circle sel-produtos__resultado-add" aria-hidden="true"></i>
          </button>
        </li>
      </ul>
    </div>

    <p v-else-if="termoBusca && !buscandoProdutos" class="sel-produtos__vazio">
      Nenhum produto para "{{ termoBusca }}"
    </p>

    <!-- produtos no pedido -->
    <div v-if="produtosSelecionados.length > 0" class="sel-produtos__lista-wrap">
      <div class="sel-produtos__lista-header">
        <p class="sel-produtos__lista-title">
          <i class="bi bi-cart-check" aria-hidden="true"></i>
          No pedido ({{ produtosSelecionados.length }})
        </p>
        <span class="sel-produtos__lista-total">R$ {{ totalPedido.toFixed(2) }}</span>
      </div>

      <!-- mobile: cards editáveis -->
      <ul class="sel-produtos__cards" role="list">
        <li
          v-for="(item, index) in produtosSelecionados"
          :key="'c-' + index"
          class="sel-produtos__card"
        >
          <div class="sel-produtos__card-top">
            <span class="sel-produtos__card-index">{{ index + 1 }}</span>
            <div class="sel-produtos__card-info">
              <p class="sel-produtos__card-nome">{{ item.descricao }}</p>
              <span class="sel-produtos__card-codigo">{{ item.codigo_interno }}</span>
            </div>
            <button
              type="button"
              class="sel-produtos__card-remove"
              title="Remover"
              aria-label="Remover produto"
              @click="removerProduto(index)"
            >
              <i class="bi bi-trash3" aria-hidden="true"></i>
            </button>
          </div>
          <div class="sel-produtos__card-campos">
            <div class="sel-produtos__campo">
              <label :for="'qtd-' + index">Qtd</label>
              <input
                :id="'qtd-' + index"
                v-model.number="item.quantidade"
                type="number"
                min="1"
                class="form-control sel-produtos__campo-input"
                @input="emitirAtualizacao"
              />
            </div>
            <div class="sel-produtos__campo">
              <label :for="'unit-' + index">Unit. R$</label>
              <input
                :id="'unit-' + index"
                v-model.number="item.valor_compra"
                type="number"
                step="0.01"
                min="0"
                class="form-control sel-produtos__campo-input"
                @input="emitirAtualizacao"
              />
            </div>
            <div class="sel-produtos__campo sel-produtos__campo--sub">
              <span class="sel-produtos__campo-label">Subtotal</span>
              <strong>R$ {{ calcularSubtotalValue(item).toFixed(2) }}</strong>
            </div>
          </div>
        </li>
      </ul>

      <!-- desktop: tabela -->
      <div class="sel-produtos__table-wrap table-responsive">
        <table class="table sel-produtos__table">
          <thead>
            <tr>
              <th>#</th>
              <th>Produto</th>
              <th>Código</th>
              <th class="text-center">Qtd</th>
              <th class="text-end">Unitário</th>
              <th class="text-end">Subtotal</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in produtosSelecionados" :key="'t-' + index">
              <td class="text-muted">{{ index + 1 }}</td>
              <td class="sel-produtos__table-nome">{{ item.descricao }}</td>
              <td class="text-muted">{{ item.codigo_interno }}</td>
              <td class="text-center" style="width: 90px">
                <input
                  v-model.number="item.quantidade"
                  type="number"
                  min="1"
                  class="form-control form-control-sm"
                  @input="emitirAtualizacao"
                />
              </td>
              <td class="text-end" style="width: 110px">
                <input
                  v-model.number="item.valor_compra"
                  type="number"
                  step="0.01"
                  min="0"
                  class="form-control form-control-sm text-end"
                  @input="emitirAtualizacao"
                />
              </td>
              <td class="text-end fw-semibold">R$ {{ calcularSubtotalValue(item).toFixed(2) }}</td>
              <td class="text-end">
                <button
                  type="button"
                  class="btn btn-sm btn-outline-danger"
                  title="Remover"
                  @click="removerProduto(index)"
                >
                  <i class="bi bi-trash3" aria-hidden="true"></i>
                </button>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="5" class="text-end">Total</td>
              <td class="text-end fw-bold text-primary">R$ {{ totalPedido.toFixed(2) }}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div class="sel-produtos__total-mobile">
        <span>Total dos produtos</span>
        <strong>R$ {{ totalPedido.toFixed(2) }}</strong>
      </div>
    </div>
  </div>
</template>

<script>
import { usarNotificacoes } from '@/composables/usarNotificacoes.js'
import { produtosAPI } from '@/services/api.js'

export default {
  name: 'SelecionarProdutos',
  setup() {
    return { notificar: usarNotificacoes() }
  },
  props: {
    modelValue: {
      type: Array,
      default: () => [],
    },
  },
  emits: ['update:modelValue'],
  data() {
    return {
      termoBusca: '',
      produtosEncontrados: [],
      produtosSelecionados: [],
      buscandoProdutos: false,
      sincronizando: false,
      updateTimeout: null,
    }
  },
  beforeUnmount() {
    if (this.updateTimeout) clearTimeout(this.updateTimeout)
  },
  computed: {
    totalPedido() {
      return this.produtosSelecionados.reduce((total, item) => {
        const subtotal =
          item.quantidade && item.valor_compra
            ? parseFloat(item.quantidade) * parseFloat(item.valor_compra)
            : 0
        return total + subtotal
      }, 0)
    },
  },
  watch: {
    modelValue: {
      handler(newVal) {
        if (this.sincronizando) return
        const currentIds = (this.produtosSelecionados || []).map((p) => p.id).sort().join(',')
        const newIds = (newVal || []).map((p) => p.id).sort().join(',')
        if (currentIds !== newIds) {
          this.sincronizando = true
          this.produtosSelecionados = newVal ? [...newVal] : []
          this.$nextTick(() => {
            this.sincronizando = false
          })
        }
      },
      immediate: true,
    },
  },
  methods: {
    async buscarProdutos() {
      if (!this.termoBusca.trim()) {
        this.produtosEncontrados = []
        return
      }
      this.buscandoProdutos = true
      try {
        this.produtosEncontrados = await produtosAPI.search(this.termoBusca)
      } catch (error) {
        console.error('Erro ao buscar produtos:', error)
        this.notificar.erro('Erro ao buscar produtos: ' + error.message)
        this.produtosEncontrados = []
      } finally {
        this.buscandoProdutos = false
      }
    },
    selecionarProduto(produto) {
      const jaAdicionado = this.produtosSelecionados.find((p) => p.id === produto.id)
      if (jaAdicionado) {
        this.notificar.aviso('Este produto já foi adicionado ao pedido!')
        return
      }
      this.produtosSelecionados.push({
        id: produto.id,
        codigo_interno: produto.codigo_interno,
        descricao: produto.descricao,
        quantidade: 1,
        valor_compra: parseFloat(produto.valor_custo) || 0,
      })
      this.emitirAtualizacao()
      this.termoBusca = ''
      this.produtosEncontrados = []
    },
    emitirAtualizacao() {
      if (this.sincronizando) return
      if (this.updateTimeout) clearTimeout(this.updateTimeout)
      this.updateTimeout = setTimeout(() => {
        if (!this.sincronizando) {
          this.$emit('update:modelValue', [...this.produtosSelecionados])
        }
      }, 100)
    },
    calcularSubtotalValue(item) {
      if (item?.quantidade && item?.valor_compra) {
        return parseFloat(item.quantidade) * parseFloat(item.valor_compra)
      }
      return 0
    },
    removerProduto(index) {
      this.produtosSelecionados.splice(index, 1)
      this.emitirAtualizacao()
    },
  },
}
</script>

<style scoped>
/* selecionar produtos - padrao mobile */

.sel-produtos {
  text-align: left;
}

.sel-produtos__label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 0.35rem;
}

.sel-produtos__busca-row {
  display: flex;
  gap: 0.5rem;
}

.sel-produtos__input {
  min-height: 44px;
  border-radius: 10px;
  flex: 1;
}

.sel-produtos__btn-buscar {
  min-height: 44px;
  min-width: 48px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  flex-shrink: 0;
}




/* mobile - botao buscar so icone */
@media (max-width: 575.98px) {
  .sel-produtos__btn-buscar-text {
    display: none;
  }
}

.sel-produtos__resultados {
  margin: 1rem 0;
}

.sel-produtos__resultados-title {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--muted, #6c757d);
  margin: 0 0 0.5rem;
}

.sel-produtos__resultados-lista {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 220px;
  overflow-y: auto;
  border: 1px solid var(--card-border, #dee2e6);
  border-radius: 12px;
  -webkit-overflow-scrolling: touch;
}

.sel-produtos__resultado-item {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem 0.75rem;
  padding: 0.75rem 1rem;
  border: none;
  border-bottom: 1px solid var(--card-border, #eee);
  background: var(--card-bg, #fff);
  text-align: left;
  cursor: pointer;
  transition: background 0.15s;
}

.sel-produtos__resultado-item:last-child {
  border-bottom: none;
}

.sel-produtos__resultado-item:hover,
.sel-produtos__resultado-item:focus {
  background: rgba(13, 110, 253, 0.06);
  outline: none;
}

.sel-produtos__resultado-nome {
  flex: 1 1 100%;
  font-weight: 700;
  font-size: 0.92rem;
  color: var(--app-text, #212529);
}

.sel-produtos__resultado-meta {
  flex: 1;
  font-size: 0.75rem;
  color: var(--muted, #6c757d);
}

.sel-produtos__resultado-add {
  color: #0d6efd;
  font-size: 1.2rem;
}

.sel-produtos__vazio {
  font-size: 0.88rem;
  color: var(--muted, #6c757d);
  margin: 0.75rem 0;
  padding: 0.75rem;
  background: rgba(13, 202, 240, 0.1);
  border-radius: 10px;
}

.sel-produtos__lista-wrap {
  margin-top: 1.25rem;
}

.sel-produtos__lista-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.sel-produtos__lista-title {
  margin: 0;
  font-weight: 700;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.sel-produtos__lista-total {
  font-weight: 800;
  color: #0d6efd;
  font-size: 0.95rem;
}


/* desktop - esconde total do topo */
@media (min-width: 768px) {
  .sel-produtos__lista-total {
    display: none;
  }
}





/* mobile - lista em cards */
.sel-produtos__cards {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

/* desktop - esconde cards */
@media (min-width: 768px) {
  .sel-produtos__cards,
  .sel-produtos__total-mobile {
    display: none;
  }
}

.sel-produtos__card {
  background: var(--card-bg, #fff);
  border: 1px solid var(--card-border, rgba(0, 0, 0, 0.08));
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.sel-produtos__card-top {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  padding: 0.75rem 0.85rem;
  border-bottom: 1px solid var(--card-border, rgba(0, 0, 0, 0.06));
}

.sel-produtos__card-index {
  width: 1.5rem;
  height: 1.5rem;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: rgba(253, 126, 20, 0.15);
  color: #e8590c;
  font-size: 0.72rem;
  font-weight: 800;
}

.sel-produtos__card-info {
  flex: 1;
  min-width: 0;
}

.sel-produtos__card-nome {
  margin: 0 0 0.25rem;
  font-weight: 700;
  font-size: 0.92rem;
  line-height: 1.3;
  word-break: break-word;
}

.sel-produtos__card-codigo {
  font-size: 0.72rem;
  color: var(--muted, #6c757d);
}

.sel-produtos__card-remove {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border: none;
  border-radius: 10px;
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.sel-produtos__card-campos {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0;
}

.sel-produtos__campo {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.6rem 0.4rem;
  border-right: 1px solid var(--card-border, rgba(0, 0, 0, 0.06));
  text-align: center;
}

.sel-produtos__campo:last-child {
  border-right: none;
}

.sel-produtos__campo label,
.sel-produtos__campo-label {
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--muted, #6c757d);
  margin-bottom: 0.25rem;
}

.sel-produtos__campo-input {
  width: 100%;
  max-width: 5rem;
  min-height: 40px;
  text-align: center;
  font-weight: 600;
  border-radius: 8px;
  padding: 0.35rem 0.25rem;
}

.sel-produtos__campo--sub {
  background: rgba(253, 126, 20, 0.06);
  justify-content: center;
}

.sel-produtos__campo--sub strong {
  font-size: 0.88rem;
  color: #e8590c;
}

.sel-produtos__total-mobile {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.75rem;
  padding: 1rem 1.1rem;
  border-radius: 14px;
  background: linear-gradient(135deg, #fd7e14, #e8590c);
  color: #fff;
  font-weight: 600;
}

.sel-produtos__total-mobile strong {
  font-size: 1.2rem;
  font-weight: 800;
}




/* desktop - tabela (escondida no mobile) */
.sel-produtos__table-wrap {
  display: none;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--card-border, rgba(0, 0, 0, 0.08));
}






/* desktop - mostra tabela */
@media (min-width: 768px) {
  .sel-produtos__table-wrap {
    display: block;
  }
}

.sel-produtos__table {
  margin: 0;
  font-size: 0.88rem;
}

.sel-produtos__table thead th {
  background: rgba(253, 126, 20, 0.1);
  font-size: 0.72rem;
  text-transform: uppercase;
  font-weight: 700;
}

.sel-produtos__table-nome {
  font-weight: 600;
  max-width: 200px;
}

.sel-produtos__table tfoot td {
  background: rgba(253, 126, 20, 0.08);
  font-weight: 700;
}
</style>

<style>
html.theme-dark .sel-produtos__card,
html.theme-dark .sel-produtos__resultado-item {
  background: var(--card-bg);
  border-color: var(--card-border);
}
</style>
