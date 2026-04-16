<template>
  <div>
    <!-- menu fixo no topo pra todas as paginas -->
    <menuDefault></menuDefault>

    <div class="container-fluid mt-4">
      <div class="row">
        <!-- coluna da esquerda lista de pedidos -->
        <div class="col-md-4 border-end pe-3">
          <div class="card border-0 shadow-sm rounded-3 mb-4">
            <div class="card-header bg-primary text-white rounded-top">
              <h5 class="mb-0">Meus Pedidos</h5>
            </div>
            <div class="card-body" style="max-height: 600px; overflow-y: auto;">
              <!-- barra de busca -->
              <div v-if="!carregandoPedidos && pedidos.length > 0" class="mb-3">
                <input 
                  v-model="termoBusca"
                  type="text" 
                  class="form-control form-control-sm" 
                  placeholder="Buscar por ID, número ou fornecedor..."
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
                <p class="text-muted">Você ainda não possui pedidos.</p>
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
                    <p class="card-text mb-1 small text-muted" v-if="getFornecedorNome(pedido.id_fornecedor)">
                      Fornecedor: {{ getFornecedorNome(pedido.id_fornecedor) }}
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

        <!-- coluna da direita acoes e detalhes -->
        <div class="col-md-8">
          <div class="card border-0 shadow-sm rounded-3 mb-4">
            <div class="card-header bg-info text-white rounded-top d-flex justify-content-between align-items-center">
              <h5 class="mb-0">Ações</h5>
              <menuPedidosCliente @select="handleSelect"></menuPedidosCliente>
            </div>
            <div class="card-body bg-light">
              <!-- formulario pra criar pedido -->
              <div v-if="acaoAtual === 'criar'" class="pedido-criar">
                <h5 class="mb-3">Criar Novo Pedido</h5>
                
                <form @submit.prevent="criarPedido">
                  <div class="mb-3">
                    <label for="criar-fornecedor" class="form-label">Fornecedor *</label>
                    <select 
                      v-model="novoPedido.id_fornecedor" 
                      class="form-select" 
                      id="criar-fornecedor"
                      required
                      :disabled="carregandoFornecedores"
                    >
                      <option value="">Selecione um fornecedor</option>
                      <option 
                        v-for="fornecedor in fornecedores" 
                        :key="fornecedor.id" 
                        :value="fornecedor.id"
                      >
                        {{ fornecedor.email }}
                      </option>
                    </select>
                  </div>

                  <div class="mb-3">
                    <label for="criar-descricao" class="form-label">Descrição *</label>
                    <textarea 
                      v-model="novoPedido.descricao" 
                      class="form-control" 
                      id="criar-descricao"
                      rows="3"
                      required
                      placeholder="Descreva o pedido..."
                    ></textarea>
                  </div>

                  <div class="mb-3">
                    <label class="form-label">Produtos *</label>
                    <SelecionarProdutos 
                      v-model="produtosSelecionados"
                    />
                    <div v-if="produtosSelecionados.length === 0" class="alert alert-warning mt-2">
                      Adicione pelo menos um produto ao pedido.
                    </div>
                  </div>

                  <div class="mb-3">
                    <label for="criar-valor" class="form-label">Valor Total do Pedido</label>
                    <input 
                      :value="totalProdutos.toFixed(2)"
                      type="text" 
                      class="form-control" 
                      id="criar-valor"
                      readonly
                      disabled
                    />
                    <small class="form-text text-muted">Valor calculado automaticamente com base nos produtos adicionados</small>
                  </div>

                  <div v-if="erroCriacao" class="alert alert-danger" role="alert">
                    {{ erroCriacao }}
                  </div>

                  <div v-if="sucessoCriacao" class="alert alert-success" role="alert">
                    Pedido criado com sucesso!
                  </div>

                  <div class="d-flex gap-2">
                    <button 
                      type="submit" 
                      class="btn btn-primary"
                      :disabled="criandoPedido"
                    >
                      <span v-if="criandoPedido" class="spinner-border spinner-border-sm me-2"></span>
                      {{ criandoPedido ? 'Criando...' : 'Criar Pedido' }}
                    </button>
                    <button 
                      type="button" 
                      class="btn btn-secondary"
                      @click="acaoAtual = null; limparFormulario()"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>

              <!-- visualizar pedido -->
              <div v-if="acaoAtual === 'visualizar' && pedidoSelecionado" class="pedido-detalhes">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <h5 class="mb-0">Detalhes do Pedido #{{ pedidoSelecionado.numero_pedido }}</h5>
                  <button 
                    @click="imprimirPedido(pedidoSelecionado)"
                    class="btn btn-success btn-sm"
                    title="Imprimir pedido"
                  >
                    🖨️ Imprimir
                  </button>
                </div>
                
                <div class="row mb-3">
                  <div class="col-md-6">
                    <p><strong>Número do Pedido:</strong> {{ pedidoSelecionado.numero_pedido }}</p>
                    <p><strong>Descrição:</strong> {{ pedidoSelecionado.descricao }}</p>
                    <p><strong>Valor:</strong> R$ {{ parseFloat(pedidoSelecionado.valor).toFixed(2) }}</p>
                  </div>
                  <div class="col-md-6">
                    <p>
                      <strong>Status:</strong> 
                      <span :class="getStatusClass(pedidoSelecionado.status)">
                        {{ pedidoSelecionado.status }}
                      </span>
                    </p>
                    <p><strong>Data do Pedido:</strong> {{ formatarData(pedidoSelecionado.data_pedido) }}</p>
                    <p v-if="pedidoSelecionado.data_entrega">
                      <strong>Data de Entrega:</strong> {{ formatarData(pedidoSelecionado.data_entrega) }}
                    </p>
                  </div>
                </div>

                <div v-if="Array.isArray(pedidoSelecionado.produtos) && pedidoSelecionado.produtos.length > 0">
                  <h6 class="mb-3">Produtos do Pedido:</h6>
                  <div class="table-responsive">
                    <table class="table table-sm table-bordered">
                      <thead>
                        <tr>
                          <th>Descrição</th>
                          <th>Código</th>
                          <th>Quantidade</th>
                          <th>Valor Unitário</th>
                          <th>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(produto, index) in pedidoSelecionado.produtos" :key="index">
                          <td>{{ produto.nome || produto.descricao }}</td>
                          <td>{{ produto.codigo_interno || 'N/A' }}</td>
                          <td>{{ produto.quantidade }}</td>
                          <td>R$ {{ parseFloat(produto.valor_unitario || produto.valor_compra || 0).toFixed(2) }}</td>
                          <td>R$ {{ parseFloat(produto.subtotal || (produto.quantidade * (produto.valor_unitario || produto.valor_compra || 0))).toFixed(2) }}</td>
                        </tr>
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colspan="4" class="text-end"><strong>Total do Pedido:</strong></td>
                          <td><strong>R$ {{ parseFloat(pedidoSelecionado.valor).toFixed(2) }}</strong></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
                <div v-else class="alert alert-info">
                  Nenhum produto encontrado neste pedido.
                </div>

                <!-- botao pra confirmar entrega -->
                <div v-if="pedidoSelecionado.status === 'enviado' || pedidoSelecionado.status === 'aguardando envio'" class="mt-4 text-center">
                  <div class="alert alert-info">
                    <p class="mb-2">
                      <span v-if="pedidoSelecionado.status === 'aguardando envio'">
                        Este pedido está aguardando envio e pode ser confirmado como entregue.
                      </span>
                      <span v-else>
                        Este pedido foi enviado e está aguardando confirmação de entrega.
                      </span>
                    </p>
                    <button 
                      @click="confirmarEntrega(pedidoSelecionado.id)"
                      class="btn btn-success btn-lg"
                      :disabled="confirmandoEntrega"
                    >
                      <span v-if="confirmandoEntrega" class="spinner-border spinner-border-sm me-2"></span>
                      {{ confirmandoEntrega ? 'Confirmando...' : '✓ Confirmar Entrega' }}
                    </button>
                  </div>
                </div>

                <div v-else-if="pedidoSelecionado.status === 'entregue'" class="mt-4">
                  <div class="alert alert-success">
                    <strong>✓ Entrega Confirmada!</strong>
                    <p class="mb-0">Este pedido foi confirmado como entregue em {{ formatarDataHora(pedidoSelecionado.data_entrega) }}</p>
                  </div>
                </div>
              </div>

              <!-- editar pedido -->
              <div v-else-if="acaoAtual === 'editar' && pedidoSelecionado" class="pedido-editar">
                <h5 class="mb-3">Editar Pedido #{{ pedidoSelecionado.numero_pedido }}</h5>
                
                <div v-if="pedidoSelecionado.status !== 'pendente'" class="alert alert-warning">
                  <strong>Atenção!</strong> Só é possível editar pedidos com status "pendente".
                  Este pedido está com status "{{ pedidoSelecionado.status }}".
                </div>

                <form v-else @submit.prevent="salvarEdicao">
                  <div class="mb-3">
                    <label for="edit-fornecedor" class="form-label">Fornecedor</label>
                    <select 
                      v-model="pedidoEditando.id_fornecedor" 
                      class="form-select" 
                      id="edit-fornecedor"
                      :disabled="carregandoFornecedores"
                    >
                      <option 
                        v-for="fornecedor in fornecedores" 
                        :key="fornecedor.id" 
                        :value="fornecedor.id"
                      >
                        {{ fornecedor.email }}
                      </option>
                    </select>
                  </div>

                  <div class="mb-3">
                    <label class="form-label">Número do Pedido</label>
                    <input 
                      :value="pedidoSelecionado.numero_pedido"
                      type="text" 
                      class="form-control" 
                      readonly
                      disabled
                    />
                    <small class="form-text text-muted">Número do pedido gerado automaticamente pelo sistema</small>
                  </div>

                  <div class="mb-3">
                    <label for="edit-descricao" class="form-label">Descrição</label>
                    <textarea 
                      v-model="pedidoEditando.descricao" 
                      class="form-control" 
                      id="edit-descricao"
                      rows="3"
                      required
                    ></textarea>
                  </div>

                  <div class="mb-3">
                    <label class="form-label">Produtos *</label>
                    <SelecionarProdutos 
                      v-model="produtosEditando"
                    />
                    <div v-if="produtosEditando.length === 0" class="alert alert-warning mt-2">
                      Adicione pelo menos um produto ao pedido.
                    </div>
                  </div>

                  <div class="mb-3">
                    <label for="edit-valor" class="form-label">Valor Total do Pedido</label>
                    <input 
                      :value="totalProdutosEditando.toFixed(2)"
                      type="text" 
                      class="form-control" 
                      id="edit-valor"
                      readonly
                      disabled
                    />
                    <small class="form-text text-muted">Valor calculado automaticamente com base nos produtos adicionados</small>
                  </div>

                  <div v-if="erroEdicao" class="alert alert-danger" role="alert">
                    {{ erroEdicao }}
                  </div>

                  <div class="d-flex gap-2">
                    <button 
                      type="submit" 
                      class="btn btn-primary"
                      :disabled="salvandoEdicao"
                    >
                      <span v-if="salvandoEdicao" class="spinner-border spinner-border-sm me-2"></span>
                      {{ salvandoEdicao ? 'Salvando...' : 'Salvar Alterações' }}
                    </button>
                    <button 
                      type="button" 
                      class="btn btn-secondary"
                      @click="cancelarEdicao"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>

              <!-- excluir pedido -->
              <div v-else-if="acaoAtual === 'excluir' && pedidoSelecionado" class="pedido-excluir">
                <h5 class="mb-3 text-danger">Excluir Pedido #{{ pedidoSelecionado.numero_pedido }}</h5>
                
                <div v-if="pedidoSelecionado.status !== 'pendente'" class="alert alert-warning">
                  <strong>Atenção!</strong> Só é possível excluir pedidos com status "pendente".
                  Este pedido está com status "{{ pedidoSelecionado.status }}".
                </div>

                <div v-else>
                  <div class="alert alert-danger">
                    <strong>Confirmação necessária!</strong><br>
                    Tem certeza que deseja excluir este pedido? Esta ação não pode ser desfeita.
                  </div>

                  <div class="card mb-3">
                    <div class="card-body">
                      <p><strong>Número:</strong> {{ pedidoSelecionado.numero_pedido }}</p>
                      <p><strong>Descrição:</strong> {{ pedidoSelecionado.descricao }}</p>
                      <p><strong>Valor:</strong> R$ {{ parseFloat(pedidoSelecionado.valor).toFixed(2) }}</p>
                    </div>
                  </div>

                  <div v-if="erroExclusao" class="alert alert-danger" role="alert">
                    {{ erroExclusao }}
                  </div>

                  <div class="d-flex gap-2">
                    <button 
                      @click="confirmarExclusao"
                      class="btn btn-danger"
                      :disabled="excluindoPedido"
                    >
                      <span v-if="excluindoPedido" class="spinner-border spinner-border-sm me-2"></span>
                      {{ excluindoPedido ? 'Excluindo...' : 'Sim, Excluir Pedido' }}
                    </button>
                    <button 
                      type="button" 
                      class="btn btn-secondary"
                      @click="acaoAtual = null"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>

              <!-- msg padrao quando nenhuma acao ta selecionada -->
              <div v-else class="text-center py-5">
                <div v-if="!pedidoSelecionado">
                  <button 
                    @click="acaoAtual = 'criar'"
                    class="btn btn-primary btn-lg mb-3"
                  >
                    <i class="bi bi-plus-circle"></i> Criar Novo Pedido
                  </button>
                  <p class="text-muted">Ou selecione um pedido da lista ao lado para visualizar, editar ou excluir.</p>
                </div>
                <div v-else>
                  <p class="text-muted">Escolha uma ação no menu acima: Visualizar, Editar ou Excluir.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import menuDefault from '../components/menuDefault.vue'
import menuPedidosCliente from '@/components/menuPedidosCliente.vue'
import SelecionarProdutos from '@/components/SelecionarProdutos.vue'
import { usarNotificacoes } from '@/composables/usarNotificacoes.js'
import { pedidosAPI, fornecedoresAPI } from '@/services/api.js'

export default {
  name: 'PedidosView',
  components: { 
    menuDefault,
    menuPedidosCliente,
    SelecionarProdutos
  },
  setup() {
    return { notificar: usarNotificacoes() }
  },
  data() {
    return {
      pedidos: [],
      pedidoSelecionado: null,
      acaoAtual: null,
      carregandoPedidos: false,
      carregandoFornecedores: false,
      fornecedores: [],
      termoBusca: '',
      pedidoEditando: null,
      produtosEditando: [],
      salvandoEdicao: false,
      erroEdicao: '',
      excluindoPedido: false,
      erroExclusao: '',
      novoPedido: {
        id_fornecedor: '',
        descricao: '',
        produtos: [],
        valor: 0
      },
      produtosSelecionados: [],
      criandoPedido: false,
      erroCriacao: '',
      sucessoCriacao: false,
      confirmandoEntrega: false
    }
  },
  mounted() {
    this.carregarPedidos()
    this.carregarFornecedores()
  },
  methods: {
    async carregarPedidos() {
      this.carregandoPedidos = true
      try {
        this.pedidos = await pedidosAPI.getAll()
        // se tinha pedido selecionado, atualizo os dados aqui
        if (this.pedidoSelecionado) {
          const pedidoAtualizado = this.pedidos.find(p => p.id === this.pedidoSelecionado.id)
          if (pedidoAtualizado) {
            this.pedidoSelecionado = pedidoAtualizado
            if (this.pedidoEditando) {
              this.pedidoEditando = { ...pedidoAtualizado }
              // atualizo tbm os produtos editando
              if (Array.isArray(pedidoAtualizado.produtos)) {
                this.produtosEditando = pedidoAtualizado.produtos.map(produto => ({
                  id: produto.id,
                  codigo_interno: produto.codigo_interno || produto.codigo,
                  descricao: produto.nome || produto.descricao,
                  quantidade: produto.quantidade || 1,
                  valor_compra: parseFloat(produto.valor_unitario || produto.valor_compra || produto.valor || 0)
                }))
              }
            }
          }
        }
      } catch (error) {
        console.error('Erro ao carregar pedidos:', error)
        this.notificar.erro('Erro ao carregar pedidos: ' + error.message)
      } finally {
        this.carregandoPedidos = false
      }
    },
    async carregarFornecedores() {
      this.carregandoFornecedores = true
      try {
        this.fornecedores = await fornecedoresAPI.getAll()
      } catch (error) {
        console.error('Erro ao carregar fornecedores:', error)
      } finally {
        this.carregandoFornecedores = false
      }
    },
    selecionarPedido(pedido) {
      this.pedidoSelecionado = pedido
      this.acaoAtual = null
      this.erroEdicao = ''
      this.erroExclusao = ''
    },
    handleSelect(acao) {
      console.log('Ação selecionada:', acao, 'Pedido selecionado:', this.pedidoSelecionado)
      
      // se nao tem pedido selecionado e nao e criar, eu peço pra selecionar
      if (!this.pedidoSelecionado && acao !== 'criar') {
        this.notificar.aviso('Por favor, selecione um pedido primeiro.')
        return
      }

      // defino a acao atual
      this.acaoAtual = acao
      console.log('Ação atual definida para:', this.acaoAtual)
      
      // limpo msg de erro
      this.erroEdicao = ''
      this.erroExclusao = ''
      this.erroCriacao = ''
      this.sucessoCriacao = false
      
      // se for editar, preparo os dados
      if (acao === 'editar' && this.pedidoSelecionado) {
        // preparo os dados pra edicao
        this.pedidoEditando = {
          ...this.pedidoSelecionado
        }
        
        // converto os produtos pro formato do componente
        if (Array.isArray(this.pedidoSelecionado.produtos)) {
          this.produtosEditando = this.pedidoSelecionado.produtos.map(produto => ({
            id: produto.id,
            codigo_interno: produto.codigo_interno || produto.codigo,
            descricao: produto.nome || produto.descricao,
            quantidade: produto.quantidade || 1,
            valor_compra: parseFloat(produto.valor_unitario || produto.valor_compra || produto.valor || 0)
          }))
        } else {
          this.produtosEditando = []
        }
      }
      
      // se for criar, limpo o formulario
      if (acao === 'criar') {
        this.limparFormulario()
        this.pedidoSelecionado = null // tiro a selecao ao criar novo
      }
    },
    async criarPedido() {
      // validacao
      if (this.produtosSelecionados.length === 0) {
        this.erroCriacao = 'Adicione pelo menos um produto ao pedido.'
        return
      }

      this.criandoPedido = true
      this.erroCriacao = ''
      this.sucessoCriacao = false

      try {
        // formato os produtos pro jeito que o backend espera
        const produtosFormatados = this.produtosSelecionados.map(produto => ({
          id: produto.id,
          codigo_interno: produto.codigo_interno,
          nome: produto.descricao,
          quantidade: produto.quantidade,
          valor_unitario: produto.valor_compra,
          subtotal: produto.subtotal
        }))

        const pedidoData = {
          id_fornecedor: parseInt(this.novoPedido.id_fornecedor),
          // numero_pedido vai ser gerado automatico no backend
          descricao: this.novoPedido.descricao,
          produtos: produtosFormatados,
          valor: this.totalProdutos
        }

        await pedidosAPI.create(pedidoData)
        
        this.sucessoCriacao = true
        this.limparFormulario()
        
        // recarrego a lista de pedidos
        await this.carregarPedidos()
        
        // tiro msg de sucesso depois de 3s e volto pro estado normal
        setTimeout(() => {
          this.sucessoCriacao = false
          this.acaoAtual = null
        }, 3000)
      } catch (error) {
        this.erroCriacao = error.message || 'Erro ao criar pedido'
      } finally {
        this.criandoPedido = false
      }
    },
    limparFormulario() {
      this.novoPedido = {
        id_fornecedor: '',
        descricao: '',
        produtos: [],
        valor: 0
      }
      this.produtosSelecionados = []
      this.erroCriacao = ''
    },
    cancelarEdicao() {
      this.acaoAtual = null
      this.pedidoEditando = null
      this.produtosEditando = []
      this.erroEdicao = ''
    },
    async salvarEdicao() {
      if (!this.pedidoEditando || this.pedidoSelecionado.status !== 'pendente') {
        this.erroEdicao = 'Só é possível editar pedidos com status "pendente"'
        return
      }

      // validacao
      if (this.produtosEditando.length === 0) {
        this.erroEdicao = 'Adicione pelo menos um produto ao pedido.'
        return
      }

      this.salvandoEdicao = true
      this.erroEdicao = ''

      try {
        // formato os produtos pro jeito q o backend espera
        const produtosFormatados = this.produtosEditando.map(produto => ({
          id: produto.id,
          codigo_interno: produto.codigo_interno,
          nome: produto.descricao,
          quantidade: produto.quantidade,
          valor_unitario: produto.valor_compra,
          subtotal: parseFloat(produto.quantidade) * parseFloat(produto.valor_compra)
        }))

        const dadosAtualizacao = {
          id_fornecedor: parseInt(this.pedidoEditando.id_fornecedor),
          // numero_pedido nao pode mudar
          descricao: this.pedidoEditando.descricao,
          produtos: produtosFormatados,
          valor: this.totalProdutosEditando
        }

        await pedidosAPI.update(this.pedidoSelecionado.id, dadosAtualizacao)
        
        this.notificar.sucesso('Pedido atualizado com sucesso!')
        this.acaoAtual = null
        this.produtosEditando = []
        await this.carregarPedidos()
      } catch (error) {
        this.erroEdicao = error.message || 'Erro ao atualizar pedido'
      } finally {
        this.salvandoEdicao = false
      }
    },
    async confirmarExclusao() {
      if (!this.pedidoSelecionado || this.pedidoSelecionado.status !== 'pendente') {
        this.erroExclusao = 'Só é possível excluir pedidos com status "pendente"'
        return
      }

      this.excluindoPedido = true
      this.erroExclusao = ''

      try {
        await pedidosAPI.delete(this.pedidoSelecionado.id)
        this.notificar.sucesso('Pedido excluído com sucesso!')
        this.pedidoSelecionado = null
        this.acaoAtual = null
        await this.carregarPedidos()
      } catch (error) {
        this.erroExclusao = error.message || 'Erro ao excluir pedido'
      } finally {
        this.excluindoPedido = false
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
    },
    formatarDataHora(data) {
      if (!data) return '-'
      const date = new Date(data)
      return date.toLocaleString('pt-BR')
    },
    imprimirPedido(pedido) {
      // monto o html pra impressao
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

      const fornecedorNome = this.getFornecedorNome(pedido.id_fornecedor)

      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
          <meta http-equiv="Pragma" content="no-cache">
          <meta http-equiv="Expires" content="0">
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
            ${fornecedorNome ? `<p><strong>Fornecedor:</strong> ${fornecedorNome}</p>` : ''}
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
            <p>Sistema de Gestão de Pedidos AgendaLog</p>
          </div>
        </body>
        </html>
      `
    },
    async confirmarEntrega(pedidoId) {
      if (!confirm('Deseja confirmar a entrega deste pedido? Esta ação não pode ser desfeita.')) {
        return
      }

      this.confirmandoEntrega = true
      try {
        await pedidosAPI.update(pedidoId, { status: 'entregue' })
        this.notificar.sucesso('Entrega confirmada com sucesso!')
        await this.carregarPedidos()
        // atualiza o pedido selecionado se for o msm
        if (this.pedidoSelecionado && this.pedidoSelecionado.id === pedidoId) {
          const pedidoAtualizado = this.pedidos.find(p => p.id === pedidoId)
          if (pedidoAtualizado) {
            this.pedidoSelecionado = pedidoAtualizado
          }
        }
      } catch (error) {
        console.error('Erro ao confirmar entrega:', error)
        this.notificar.erro(
          'Erro ao confirmar entrega: ' + (error.message || 'Erro desconhecido')
        )
      } finally {
        this.confirmandoEntrega = false
      }
    },
    getFornecedorNome(idFornecedor) {
      if (!idFornecedor || !this.fornecedores.length) return null
      const fornecedor = this.fornecedores.find(f => f.id === idFornecedor)
      return fornecedor ? fornecedor.email : null
    },
    filtrarPedidos() {
      // metodo vazio msm, filtro ta no computed pedidosFiltrados
      // deixei aqui pq vai que eu preciso por algo depois
    }
  },
  computed: {
    totalProdutos() {
      return this.produtosSelecionados.reduce((total, produto) => {
        const subtotal = produto.quantidade && produto.valor_compra 
          ? parseFloat(produto.quantidade) * parseFloat(produto.valor_compra)
          : 0
        return total + subtotal
      }, 0)
    },
    totalProdutosEditando() {
      return this.produtosEditando.reduce((total, produto) => {
        const subtotal = produto.quantidade && produto.valor_compra 
          ? parseFloat(produto.quantidade) * parseFloat(produto.valor_compra)
          : 0
        return total + subtotal
      }, 0)
    },
    pedidosFiltrados() {
      if (!this.termoBusca || this.termoBusca.trim() === '') {
        return this.pedidos
      }
      
      const termo = this.termoBusca.toLowerCase().trim()
      
      return this.pedidos.filter(pedido => {
        // busca por id
        if (String(pedido.id).includes(termo)) {
          return true
        }
        
        // busca pelo numero do pedido
        if (pedido.numero_pedido && pedido.numero_pedido.toLowerCase().includes(termo)) {
          return true
        }
        
        // busca por fornecedor (email)
        const fornecedorNome = this.getFornecedorNome(pedido.id_fornecedor)
        if (fornecedorNome && fornecedorNome.toLowerCase().includes(termo)) {
          return true
        }
        
        return false
      })
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

.pedido-detalhes,
.pedido-editar,
.pedido-excluir {
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>