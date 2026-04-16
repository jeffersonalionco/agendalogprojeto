<template>
  <div class="selecionar-produtos">
    <h6 class="mb-3">Adicionar Produtos ao Pedido</h6>
    
    <!-- busca de produtos (pra achar rapidinho) -->
    <div class="mb-3">
      <label for="busca-produto" class="form-label">Buscar Produto</label>
      <div class="input-group">
        <input 
          v-model="termoBusca" 
          type="text" 
          class="form-control" 
          id="busca-produto"
          placeholder="Digite o nome do produto (ex: ARROZ)"
          @input="buscarProdutos"
          @keyup.enter="buscarProdutos"
        />
        <button 
          class="btn btn-outline-primary" 
          type="button"
          @click="buscarProdutos"
          :disabled="buscandoProdutos"
        >
          <span v-if="buscandoProdutos" class="spinner-border spinner-border-sm"></span>
          <span v-else>Buscar</span>
        </button>
      </div>
    </div>

    <!-- resultados da busca -->
    <div v-if="produtosEncontrados.length > 0" class="mb-3">
      <h6 class="small mb-2">Resultados da busca ({{ produtosEncontrados.length }})</h6>
      <div class="list-group" style="max-height: 200px; overflow-y: auto;">
        <button
          v-for="produto in produtosEncontrados"
          :key="produto.id"
          type="button"
          class="list-group-item list-group-item-action"
          @click="selecionarProduto(produto)"
        >
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <strong>{{ produto.descricao }}</strong>
              <br>
              <small class="text-muted">
                Código: {{ produto.codigo_interno }} | 
                Estoque: {{ produto.quantidade_estoque }} | 
                Valor Venda: R$ {{ parseFloat(produto.valor_venda).toFixed(2) }}
              </small>
            </div>
          </div>
        </button>
      </div>
    </div>

    <div v-else-if="termoBusca && !buscandoProdutos && produtosEncontrados.length === 0" class="alert alert-info">
      Nenhum produto encontrado para "{{ termoBusca }}"
    </div>

    <!-- produtos adicionados no pedido -->
    <div v-if="produtosSelecionados.length > 0" class="mt-4">
      <h6 class="mb-3">Produtos no Pedido ({{ produtosSelecionados.length }})</h6>
      <div class="table-responsive">
        <table class="table table-sm table-bordered">
          <thead>
            <tr>
              <th>Descrição</th>
              <th>Código</th>
              <th>Quantidade</th>
              <th>Valor Unit.</th>
              <th>Subtotal</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in produtosSelecionados" :key="index">
              <td>{{ item.descricao }}</td>
              <td>{{ item.codigo_interno }}</td>
              <td>
                <input 
                  v-model.number="item.quantidade" 
                  type="number" 
                  min="1"
                  class="form-control form-control-sm"
                  style="width: 80px;"
                  @input="emitirAtualizacao"
                />
              </td>
              <td>
                <input 
                  v-model.number="item.valor_compra" 
                  type="number" 
                  step="0.01"
                  min="0"
                  class="form-control form-control-sm"
                  style="width: 100px;"
                  @input="emitirAtualizacao"
                />
              </td>
              <td>R$ {{ calcularSubtotalValue(item).toFixed(2) }}</td>
              <td>
                <button 
                  @click="removerProduto(index)"
                  class="btn btn-sm btn-danger"
                  title="Remover produto"
                >
                  ×
                </button>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="4" class="text-end"><strong>Total:</strong></td>
              <td><strong>R$ {{ totalPedido.toFixed(2) }}</strong></td>
              <td></td>
            </tr>
          </tfoot>
        </table>
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
      default: () => []
    }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      termoBusca: '',
      produtosEncontrados: [],
      produtosSelecionados: [],
      buscandoProdutos: false,
      sincronizando: false, // flag pra evitar loop do watch na sincronizacao (ja deu ruim antes kk)
      updateTimeout: null // timeout pro debounce, pra nao ficar emitindo mil vezes
    }
  },
  beforeUnmount() {
    // limpo o timeout quando desmonta o componente, senao fica coisa rodando a toa
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout)
    }
  },
  computed: {
    totalPedido() {
      return this.produtosSelecionados.reduce((total, item) => {
        const subtotal = item.quantidade && item.valor_compra 
          ? parseFloat(item.quantidade) * parseFloat(item.valor_compra)
          : 0
        return total + subtotal
      }, 0)
    }
  },
  watch: {
    modelValue: {
      handler(newVal) {
        // so sincroniza se mudou msm (comparando os ids)
        if (this.sincronizando) return
        
        const currentIds = (this.produtosSelecionados || []).map(p => p.id).sort().join(',')
        const newIds = (newVal || []).map(p => p.id).sort().join(',')
        
        if (currentIds !== newIds) {
          this.sincronizando = true
          this.produtosSelecionados = newVal ? [...newVal] : []
          this.$nextTick(() => {
            this.sincronizando = false
          })
        }
      },
      immediate: true
    }
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
      // vejo se o produto ja ta na lista (pra nao duplicar)
      const jaAdicionado = this.produtosSelecionados.find(
        p => p.id === produto.id
      )

      if (jaAdicionado) {
        this.notificar.aviso('Este produto já foi adicionado ao pedido!')
        return
      }

      // adiciono o produto na lista aqui
      const novoProduto = {
        id: produto.id,
        codigo_interno: produto.codigo_interno,
        descricao: produto.descricao,
        quantidade: 1,
        valor_compra: parseFloat(produto.valor_custo) || 0
      }
      
      this.produtosSelecionados.push(novoProduto)
      this.emitirAtualizacao()

      // limpo a busca pq ja selecionei
      this.termoBusca = ''
      this.produtosEncontrados = []
    },
    emitirAtualizacao() {
      // uso debounce pra nao sair emitindo toda hora
      if (this.sincronizando) return
      
      if (this.updateTimeout) {
        clearTimeout(this.updateTimeout)
      }
      
      this.updateTimeout = setTimeout(() => {
        if (!this.sincronizando) {
          this.$emit('update:modelValue', [...this.produtosSelecionados])
        }
      }, 100) // debounce de 100ms (na pratica fica ok)
    },
    calcularSubtotalValue(item) {
      // calculo o subtotal so pra exibir mesmo (nao salvo isso em lugar nenhum)
      if (item && item.quantidade && item.valor_compra) {
        return parseFloat(item.quantidade) * parseFloat(item.valor_compra)
      }
      return 0
    },
    removerProduto(index) {
      this.produtosSelecionados.splice(index, 1)
      this.emitirAtualizacao()
    }
  }
}
</script>

<style scoped>
.list-group {
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
}

.list-group-item {
  cursor: pointer;
  transition: background-color 0.2s;
}

.list-group-item:hover {
  background-color: #f8f9fa;
}

.table {
  font-size: 0.9em;
}
</style>

