<template>
  <div>
<!-- menu fixo no topo pra todas as paginas -->
<menuDefault></menuDefault>

    <div class="container-fluid mt-4">
      <div class="row">
        <!-- coluna esquerda lista de pedidos com busca -->
        <div class="col-md-4 border-end pe-3">
          <div class="card border-0 shadow-sm rounded-3 mb-4">
            <div class="card-header bg-primary text-white rounded-top">
              <h5 class="mb-0">Pedidos Atribuídos a Mim</h5>
            </div>
            <div class="card-body" style="max-height: 600px; overflow-y: auto;">
              <!-- barra de busca -->
              <div v-if="!carregandoPedidos && pedidos.length > 0" class="mb-3">
                <input 
                  v-model="termoBusca"
                  type="text" 
                  class="form-control form-control-sm" 
                  placeholder="Buscar por ID, número do pedido..."
                  @input="filtrarPedidos"
                />
                <small class="text-muted">
                  <span v-if="termoBusca && pedidosFiltrados.length !== pedidos.length">
                    Mostrando {{ pedidosFiltrados.length }} de {{ pedidos.length }} pedidos
                  </span>
                </small>
              </div>

              <div v-if="carregandoPedidos" class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Carregando...</span>
                </div>
              </div>

              <div v-else-if="pedidos.length === 0" class="text-center py-4">
                <p class="text-muted">Você não possui pedidos atribuídos no momento.</p>
              </div>

              <div v-else-if="termoBusca && pedidosFiltrados.length === 0" class="text-center py-4">
                <p class="text-muted">Nenhum pedido encontrado para "{{ termoBusca }}"</p>
              </div>

              <div v-else>
                <div 
                  v-for="pedido in pedidosFiltrados" 
                  :key="pedido.id" 
                  class="card mb-2 cursor-pointer"
                  :class="{ 'border-primary': pedidoSelecionado?.id === pedido.id }"
                  @click="selecionarPedido(pedido)"
                >
                  <div class="card-body p-3">
                    <h6 class="card-title mb-1">Pedido #{{ pedido.numero_pedido }}</h6>
                    <p class="card-text mb-1 small">
                      <span :class="getStatusClass(pedido.status)">
                        {{ pedido.status }}
                      </span>
                    </p>
                    <p class="card-text mb-1 small text-muted">
                      Data: {{ formatarData(pedido.data_pedido) }}
                    </p>
                    <p class="card-text mb-0 small text-muted">
                      R$ {{ parseFloat(pedido.valor).toFixed(2) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- coluna direita detalhes do pedido selecionado -->
        <div class="col-md-8">
          <div v-if="!pedidoSelecionado" class="card border-0 shadow-sm rounded-3 mb-4">
            <div class="card-body text-center py-5">
              <h5 class="text-muted">Selecione um pedido para ver os detalhes</h5>
              <p class="text-muted">Clique em um pedido na lista ao lado para visualizar suas informações completas</p>
            </div>
          </div>

          <!-- detalhes do pedido selecionado -->
          <div v-else class="card border-0 shadow-sm rounded-3 mb-4">
            <div class="card-header bg-success text-white rounded-top d-flex justify-content-between align-items-center">
              <h5 class="mb-0">Detalhes do Pedido #{{ pedidoSelecionado.numero_pedido }}</h5>
              <button 
                @click="imprimirPedido(pedidoSelecionado)"
                class="btn btn-light btn-sm"
                title="Imprimir pedido"
              >
                🖨️ Imprimir
              </button>
            </div>
            <div class="card-body">
              <!-- infos do pedido -->
              <div class="row mb-4">
                <div class="col-md-6">
                  <p><strong>Número do Pedido:</strong> {{ pedidoSelecionado.numero_pedido }}</p>
                  <p><strong>Descrição:</strong> {{ pedidoSelecionado.descricao }}</p>
                  <p><strong>Valor Total:</strong> R$ {{ parseFloat(pedidoSelecionado.valor).toFixed(2) }}</p>
                </div>
                <div class="col-md-6">
                  <p>
                    <strong>Status:</strong> 
                    <span :class="getStatusClass(pedidoSelecionado.status)">
                      {{ pedidoSelecionado.status }}
                    </span>
                  </p>
                  <p><strong>Data do Pedido:</strong> {{ formatarDataHora(pedidoSelecionado.data_pedido) }}</p>
                  <p v-if="pedidoSelecionado.data_entrega">
                    <strong>Data de Entrega:</strong> {{ formatarDataHora(pedidoSelecionado.data_entrega) }}
                  </p>
                </div>
              </div>

              <!-- acao de atualizar status -->
              <div v-if="pedidoSelecionado.status === 'pendente'" class="alert alert-warning mb-4">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>Ação Necessária:</strong>
                    <p class="mb-0">Este pedido está pendente. Marque como "Aguardando Envio" quando estiver pronto para envio.</p>
                  </div>
                  <button 
                    @click="atualizarStatus(pedidoSelecionado.id)"
                    class="btn btn-success"
                    :disabled="atualizandoStatus === pedidoSelecionado.id"
                  >
                    <span v-if="atualizandoStatus === pedidoSelecionado.id" class="spinner-border spinner-border-sm me-2"></span>
                    {{ atualizandoStatus === pedidoSelecionado.id ? 'Atualizando...' : 'Marcar como Aguardando Envio' }}
                  </button>
                </div>
              </div>

              <div v-else-if="pedidoSelecionado.status !== 'pendente'" class="alert alert-info mb-4">
                <strong>Status:</strong> Este pedido já foi processado e está com status "{{ pedidoSelecionado.status }}".
              </div>

              <!-- tabela de produtos -->
              <div v-if="Array.isArray(pedidoSelecionado.produtos) && pedidoSelecionado.produtos.length > 0">
                <h6 class="mb-3">Lista de Produtos ({{ pedidoSelecionado.produtos.length }})</h6>
                <div class="table-responsive">
                  <table class="table table-bordered table-striped">
                    <thead class="table-light">
                      <tr>
                        <th style="width: 5%;">#</th>
                        <th>Descrição</th>
                        <th>Código Interno</th>
                        <th style="width: 10%;" class="text-center">Quantidade</th>
                        <th style="width: 15%;" class="text-end">Valor Unitário</th>
                        <th style="width: 15%;" class="text-end">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(produto, index) in pedidoSelecionado.produtos" :key="index">
                        <td class="text-center">{{ index + 1 }}</td>
                        <td><strong>{{ produto.nome || produto.descricao }}</strong></td>
                        <td>{{ produto.codigo_interno || 'N/A' }}</td>
                        <td class="text-center">{{ produto.quantidade }}</td>
                        <td class="text-end">R$ {{ parseFloat(produto.valor_unitario || produto.valor_compra || 0).toFixed(2) }}</td>
                        <td class="text-end">
                          <strong>R$ {{ parseFloat(produto.subtotal || (produto.quantidade * (produto.valor_unitario || produto.valor_compra || 0))).toFixed(2) }}</strong>
                        </td>
                      </tr>
                    </tbody>
                    <tfoot class="table-light">
                      <tr>
                        <td colspan="5" class="text-end"><strong>TOTAL DO PEDIDO:</strong></td>
                        <td class="text-end"><strong>R$ {{ parseFloat(pedidoSelecionado.valor).toFixed(2) }}</strong></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
              <div v-else class="alert alert-info">
                Nenhum produto encontrado neste pedido.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- area de impressao (fica oculta, usei pra gerar pdf) -->
    <div id="area-impressao" style="display: none;"></div>
  </div>
</template>

<script>
import menuDefault from '@/components/menuDefault.vue'
import { usarNotificacoes } from '@/composables/usarNotificacoes.js'
import { pedidosAPI } from '@/services/api.js'

export default {
  name: 'HomeFornecedor',
  components: { menuDefault },
  setup() {
    return { notificar: usarNotificacoes() }
  },
  data() {
    return {
      pedidos: [],
      pedidoSelecionado: null,
      carregandoPedidos: false,
      atualizandoStatus: null,
      termoBusca: ''
    }
  },
  mounted() {
    this.carregarPedidos()
  },
  computed: {
    pedidosFiltrados() {
      let pedidosFiltrados = this.pedidos
      
      // aplica filtro de busca se tiver termo
      if (this.termoBusca && this.termoBusca.trim() !== '') {
        const termo = this.termoBusca.toLowerCase().trim()
        
        pedidosFiltrados = this.pedidos.filter(pedido => {
          // busca por id
          if (String(pedido.id).includes(termo)) {
            return true
          }
          
          // busca pelo numero do pedido
          if (pedido.numero_pedido && pedido.numero_pedido.toLowerCase().includes(termo)) {
            return true
          }
          
          return false
        })
      }
      
      // ordeno pendente primeiro, depois o resto por data (mais recente primeiro)
      return pedidosFiltrados.sort((a, b) => {
        // prioridade de status pendente primeiro
        const prioridadeStatus = {
          'pendente': 1,
          'aguardando envio': 2,
          'enviado': 3,
          'entregue': 4,
          'cancelado': 5
        }
        
        const prioridadeA = prioridadeStatus[a.status] || 99
        const prioridadeB = prioridadeStatus[b.status] || 99
        
        // se tiver prioridade diferente, ordena por isso
        if (prioridadeA !== prioridadeB) {
          return prioridadeA - prioridadeB
        }
        
        // se for igual, ordena por data (mais recente primeiro)
        const dataA = new Date(a.data_pedido)
        const dataB = new Date(b.data_pedido)
        return dataB - dataA
      })
    }
  },
  methods: {
    async carregarPedidos() {
      this.carregandoPedidos = true
      try {
        this.pedidos = await pedidosAPI.getAll()
        // se tinha pedido selecionado, eu atualizo os dados aqui
        if (this.pedidoSelecionado) {
          const pedidoAtualizado = this.pedidos.find(p => p.id === this.pedidoSelecionado.id)
          if (pedidoAtualizado) {
            this.pedidoSelecionado = pedidoAtualizado
          }
        }
      } catch (error) {
        console.error('Erro ao carregar pedidos:', error)
        this.notificar.erro('Erro ao carregar pedidos: ' + error.message)
      } finally {
        this.carregandoPedidos = false
      }
    },
    selecionarPedido(pedido) {
      this.pedidoSelecionado = pedido
    },
    async atualizarStatus(pedidoId) {
      if (!confirm('Deseja realmente atualizar o status deste pedido para "aguardando envio"?')) {
        return
      }

      this.atualizandoStatus = pedidoId
      try {
        await pedidosAPI.update(pedidoId, { status: 'aguardando envio' })
        this.notificar.sucesso('Status atualizado com sucesso!')
        await this.carregarPedidos()
      } catch (error) {
        console.error('Erro ao atualizar status:', error)
        this.notificar.erro('Erro ao atualizar status: ' + error.message)
      } finally {
        this.atualizandoStatus = null
      }
    },
    filtrarPedidos() {
      // metodo vazio msm, a filtragem ta no computed pedidosFiltrados
    },
    imprimirPedido(pedido) {
      // gero o html pra impressao
      const conteudoImpressao = this.gerarConteudoImpressao(pedido)
      
      // abro uma janela nova pra imprimir
      const janelaImpressao = window.open('', '_blank')
      janelaImpressao.document.write(conteudoImpressao)
      janelaImpressao.document.close()
      
      // espero carregar e mando imprimir
      janelaImpressao.onload = () => {
        setTimeout(() => {
          janelaImpressao.print()
        }, 250)
      }
    },
    gerarConteudoImpressao(pedido) {
      const produtosHTML = Array.isArray(pedido.produtos) && pedido.produtos.length > 0
        ? pedido.produtos.map((produto, index) => `
          <tr>
            <td style="text-align: center; padding: 8px; border: 1px solid #ddd;">${index + 1}</td>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>${produto.nome || produto.descricao}</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${produto.codigo_interno || 'N/A'}</td>
            <td style="text-align: center; padding: 8px; border: 1px solid #ddd;">${produto.quantidade}</td>
            <td style="text-align: right; padding: 8px; border: 1px solid #ddd;">R$ ${parseFloat(produto.valor_unitario || produto.valor_compra || 0).toFixed(2)}</td>
            <td style="text-align: right; padding: 8px; border: 1px solid #ddd;"><strong>R$ ${parseFloat(produto.subtotal || (produto.quantidade * (produto.valor_unitario || produto.valor_compra || 0))).toFixed(2)}</strong></td>
          </tr>
        `).join('')
        : '<tr><td colspan="6" style="text-align: center; padding: 8px;">Nenhum produto encontrado</td></tr>'

      return `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Pedido ${pedido.numero_pedido}</title>
          <style>
            @media print {
              @page {
                margin: 1cm;
              }
              body {
                margin: 0;
                padding: 0;
              }
              .no-print {
                display: none;
              }
            }
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
              margin-bottom: 20px;
            }
            .info-section {
              margin-bottom: 20px;
            }
            .info-section p {
              margin: 5px 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th {
              background-color: #f0f0f0;
              padding: 10px;
              text-align: left;
              border: 1px solid #ddd;
              font-weight: bold;
            }
            td {
              padding: 8px;
              border: 1px solid #ddd;
            }
            .total-row {
              background-color: #f0f0f0;
              font-weight: bold;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>PEDIDO #${pedido.numero_pedido}</h1>
            <p>Data de Emissão: ${this.formatarDataHora(pedido.data_pedido)}</p>
          </div>

          <div class="info-section">
            <h3>Informações do Pedido</h3>
            <p><strong>Número do Pedido:</strong> ${pedido.numero_pedido}</p>
            <p><strong>Descrição:</strong> ${pedido.descricao}</p>
            <p><strong>Status:</strong> ${pedido.status}</p>
            <p><strong>Data do Pedido:</strong> ${this.formatarDataHora(pedido.data_pedido)}</p>
            ${pedido.data_entrega ? `<p><strong>Data de Entrega:</strong> ${this.formatarDataHora(pedido.data_entrega)}</p>` : ''}
          </div>

          <h3>Produtos</h3>
          <table>
            <thead>
              <tr>
                <th style="text-align: center;">#</th>
                <th>Descrição</th>
                <th>Código Interno</th>
                <th style="text-align: center;">Quantidade</th>
                <th style="text-align: right;">Valor Unitário</th>
                <th style="text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${produtosHTML}
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td colspan="5" style="text-align: right; padding: 10px;"><strong>TOTAL DO PEDIDO:</strong></td>
                <td style="text-align: right; padding: 10px;"><strong>R$ ${parseFloat(pedido.valor).toFixed(2)}</strong></td>
              </tr>
            </tfoot>
          </table>

          <div class="footer">
            <p>Documento gerado em ${this.formatarDataHora(new Date())}</p>
            <p>Sistema de Gestão de Pedidos</p>
          </div>
        </body>
        </html>
      `
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
    },
    formatarDataHora(data) {
      if (!data) return '-'
      const date = new Date(data)
      return date.toLocaleString('pt-BR')
    }
  }
}
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
  transition: all 0.2s;
}

.cursor-pointer:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.badge {
  padding: 0.35em 0.65em;
  font-size: 0.875em;
}
</style>
