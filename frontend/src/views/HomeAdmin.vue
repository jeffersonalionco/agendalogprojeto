<template>
  <div>
    <!-- menu fixo no topo pra todas as paginas (pra nao sumir navegacao) -->
    <menuDefault></menuDefault>

    <div class="container-fluid mt-4">
      <div class="card border-0 shadow-sm rounded-3 mb-4">
        <div class="card-header bg-danger text-white rounded-top d-flex justify-content-between align-items-center">
          <h5 class="mb-0">Gerenciamento de Pedidos (Admin)</h5>
          <button @click="carregarPedidos" class="btn btn-light btn-sm">
            <span v-if="carregandoPedidos" class="spinner-border spinner-border-sm me-2"></span>
            Atualizar
          </button>
        </div>
        <div class="card-body">
          <div v-if="carregandoPedidos" class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Carregando...</span>
            </div>
          </div>

          <div v-else-if="pedidos.length === 0" class="text-center py-4">
            <p class="text-muted">Nenhum pedido encontrado.</p>
          </div>

          <div v-else>
            <div class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Número</th>
                    <th>Cliente ID</th>
                    <th>Fornecedor ID</th>
                    <th>Descrição</th>
                    <th>Valor</th>
                    <th>Status</th>
                    <th>Data Pedido</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="pedido in pedidos" :key="pedido.id">
                    <td>{{ pedido.id }}</td>
                    <td>{{ pedido.numero_pedido }}</td>
                    <td>{{ pedido.id_usuario }}</td>
                    <td>{{ pedido.id_fornecedor }}</td>
                    <td>{{ pedido.descricao }}</td>
                    <td>R$ {{ parseFloat(pedido.valor).toFixed(2) }}</td>
                    <td>
                      <span :class="getStatusClass(pedido.status)">
                        {{ pedido.status }}
                      </span>
                    </td>
                    <td>{{ formatarData(pedido.data_pedido) }}</td>
                    <td>
                      <div class="btn-group" role="group">
                        <button 
                          @click="editarPedido(pedido)"
                          class="btn btn-sm btn-primary"
                          title="Editar"
                        >
                          Editar
                        </button>
                        <button 
                          @click="deletarPedido(pedido.id)"
                          class="btn btn-sm btn-danger"
                          title="Deletar"
                        >
                          Deletar
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- modal pra editar pedido (bem simples) -->
      <div 
        v-if="pedidoEditando" 
        class="modal fade show d-block" 
        tabindex="-1"
        style="background-color: rgba(0,0,0,0.5);"
      >
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Editar Pedido #{{ pedidoEditando.numero_pedido }}</h5>
              <button type="button" class="btn-close" @click="fecharModal"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="salvarEdicao">
                <div class="mb-3">
                  <label for="edit-status" class="form-label">Status</label>
                  <select 
                    v-model="pedidoEditando.status" 
                    class="form-select" 
                    id="edit-status"
                  >
                    <option value="pendente">Pendente</option>
                    <option value="aguardando envio">Aguardando Envio</option>
                    <option value="enviado">Enviado</option>
                    <option value="entregue">Entregue</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>

                <div class="mb-3">
                  <label for="edit-descricao" class="form-label">Descrição</label>
                  <textarea 
                    v-model="pedidoEditando.descricao" 
                    class="form-control" 
                    id="edit-descricao"
                    rows="3"
                  ></textarea>
                </div>

                <div class="mb-3">
                  <label for="edit-valor" class="form-label">Valor</label>
                  <input 
                    v-model.number="pedidoEditando.valor" 
                    type="number" 
                    step="0.01"
                    class="form-control" 
                    id="edit-valor"
                  />
                </div>

                <div v-if="erroEdicao" class="alert alert-danger" role="alert">
                  {{ erroEdicao }}
                </div>

                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" @click="fecharModal">Cancelar</button>
                  <button 
                    type="submit" 
                    class="btn btn-primary"
                    :disabled="salvandoEdicao"
                  >
                    <span v-if="salvandoEdicao" class="spinner-border spinner-border-sm me-2"></span>
                    {{ salvandoEdicao ? 'Salvando...' : 'Salvar' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import menuDefault from '@/components/menuDefault.vue'
import { usarNotificacoes } from '@/composables/usarNotificacoes.js'
import { pedidosAPI } from '@/services/api.js'

export default {
  name: 'HomeAdmin',
  components: { menuDefault },
  setup() {
    return { notificar: usarNotificacoes() }
  },
  data() {
    return {
      pedidos: [],
      carregandoPedidos: false,
      pedidoEditando: null,
      salvandoEdicao: false,
      erroEdicao: ''
    }
  },
  mounted() {
    this.carregarPedidos()
  },
  methods: {
    async carregarPedidos() {
      this.carregandoPedidos = true
      try {
        this.pedidos = await pedidosAPI.getAll()
      } catch (error) {
        console.error('Erro ao carregar pedidos:', error)
        this.notificar.erro('Erro ao carregar pedidos: ' + error.message)
      } finally {
        this.carregandoPedidos = false
      }
    },
    editarPedido(pedido) {
      // faço uma copia do pedido pra editar sem zoar o original
      this.pedidoEditando = { ...pedido }
      this.erroEdicao = ''
    },
    fecharModal() {
      this.pedidoEditando = null
      this.erroEdicao = ''
    },
    async salvarEdicao() {
      this.salvandoEdicao = true
      this.erroEdicao = ''

      try {
        await pedidosAPI.update(this.pedidoEditando.id, {
          status: this.pedidoEditando.status,
          descricao: this.pedidoEditando.descricao,
          valor: parseFloat(this.pedidoEditando.valor)
        })
        
        this.notificar.sucesso('Pedido atualizado com sucesso!')
        this.fecharModal()
        await this.carregarPedidos()
      } catch (error) {
        this.erroEdicao = error.message || 'Erro ao atualizar pedido'
      } finally {
        this.salvandoEdicao = false
      }
    },
    async deletarPedido(pedidoId) {
      if (!confirm('Tem certeza que deseja deletar este pedido? Esta ação não pode ser desfeita.')) {
        return
      }

      try {
        await pedidosAPI.delete(pedidoId)
        this.notificar.sucesso('Pedido deletado com sucesso!')
        await this.carregarPedidos()
      } catch (error) {
        console.error('Erro ao deletar pedido:', error)
        this.notificar.erro('Erro ao deletar pedido: ' + error.message)
      }
    },
    getStatusClass(status) {
      const classes = {
        'pendente': 'badge bg-warning',
        'aguardando envio': 'badge bg-info',
        'enviado': 'badge bg-primary',
        'entregue': 'badge bg-success',
        'cancelado': 'badge bg-danger'
      }
      return classes[status] || 'badge bg-secondary'
    },
    formatarData(data) {
      if (!data) return '-'
      const date = new Date(data)
      return date.toLocaleDateString('pt-BR')
    }
  }
}
</script>

<style scoped>
.badge {
  padding: 0.35em 0.65em;
  font-size: 0.875em;
}

.modal.show {
  display: block;
}
</style>
