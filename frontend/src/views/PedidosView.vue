<template>
  <div :class="isAdmin ? 'admin-page' : ''">
    <menuDefault></menuDefault>

    <header v-if="isAdmin" class="admin-page__banner">
      <div class="admin-page__banner-inner">
        <p class="admin-page__banner-greet">Administração</p>
        <h1 class="admin-page__banner-title">Gerenciar Pedidos</h1>
        <p class="admin-page__banner-sub">{{ resumoPedidosAdmin }}</p>
      </div>
    </header>

    <div :class="isAdmin ? 'admin-page__content' : ''">
    <div class="container-fluid mt-3 mt-md-4 pedidos-page" :class="{ 'px-0': isAdmin }">
      <div class="row g-3 g-md-4">
        <!-- coluna da esquerda lista de pedidos -->
        <div class="col-12 col-md-4 col-lg-4 pedidos-lista-col">
          <div class="card border-0 shadow-sm rounded-3 mb-4">
            <div class="card-header bg-primary text-white rounded-top">
              <h5 class="mb-0">{{ tituloListaPedidos }}</h5>
            </div>
            <div class="card-body pedidos-lista-body">
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
                  class="pedidos-list-card"
                  :class="{ 'pedidos-list-card--active': pedidoSelecionado?.id === pedido.id }"
                  @click="selecionarPedido(pedido)"
                >
                  <div class="pedidos-list-card__top">
                    <span class="pedidos-list-card__num">#{{ pedido.numero_pedido }}</span>
                    <span :class="['pedidos-list-card__badge', getStatusClass(pedido.status)]">{{ pedido.status }}</span>
                  </div>
                  <p v-if="isAdmin" class="pedidos-list-card__meta mb-1">
                    Cliente #{{ pedido.id_usuario }}
                  </p>
                  <p class="pedidos-list-card__meta mb-1" v-if="getFornecedorNome(pedido.id_fornecedor)">
                    {{ getFornecedorNome(pedido.id_fornecedor) }}
                  </p>
                  <p class="pedidos-list-card__valor mb-0">
                    R$ {{ parseFloat(pedido.valor).toFixed(2) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- coluna da direita acoes e detalhes -->
        <div class="col-12 col-md-8 col-lg-8" id="pedidos-painel-acoes">
          <div class="card border-0 shadow-sm rounded-3 mb-4 pedidos-painel-card">
            <div class="card-header bg-info text-white rounded-top pedidos-acoes-header">
              <div class="pedidos-acoes-header__top">
                <h5 class="mb-0 pedidos-acoes-header__title">
                  <span v-if="acaoAtualLabel">{{ acaoAtualLabel }}</span>
                  <span v-else>Ações do pedido</span>
                </h5>
              </div>
              <menuPedidosCliente
                :tem-pedido-selecionado="!!pedidoSelecionado"
                :acao-atual="acaoAtual"
                :pode-criar="podeCriarPedido"
                :pedido-resumo="pedidoResumoMobile"
                @select="handleSelect"
              />
            </div>
            <div
              class="card-body pedidos-painel-body"
              :class="painelBodyClass"
            >
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
              <PedidoDetalhesVisualizar
                v-if="acaoAtual === 'visualizar' && pedidoSelecionado"
                class="pedido-detalhes"
                :pedido="pedidoSelecionado"
                :fornecedor-nome="getFornecedorNome(pedidoSelecionado.id_fornecedor)"
                :confirmando-entrega="confirmandoEntrega"
                :pode-confirmar-entrega="podeConfirmarEntrega"
                @imprimir="imprimirPedido(pedidoSelecionado)"
                @confirmar-entrega="confirmarEntrega(pedidoSelecionado.id)"
              />

              <!-- editar pedido -->
              <PedidoEditarForm
                v-else-if="acaoAtual === 'editar' && pedidoSelecionado && pedidoEditando"
                class="pedido-editar"
                :pedido="pedidoSelecionado"
                v-model:pedido-editando="pedidoEditando"
                v-model:produtos-editando="produtosEditando"
                :fornecedores="fornecedores"
                :carregando-fornecedores="carregandoFornecedores"
                :pode-editar="podeEditarPedido"
                :mensagem-bloqueio="mensagemBloqueioEdicao"
                :modo-admin="tipoUsuario === 'admin'"
                :valor-total-calculado="totalProdutosEditando"
                :erro="erroEdicao"
                :salvando="salvandoEdicao"
                @salvar="salvarEdicao"
                @cancelar="cancelarEdicao"
              />

              <!-- excluir pedido -->
              <div v-else-if="acaoAtual === 'excluir' && pedidoSelecionado" class="pedido-excluir">
                <h5 class="mb-3 text-danger">Excluir Pedido #{{ pedidoSelecionado.numero_pedido }}</h5>
                
                <div v-if="pedidoSelecionado.status !== 'pendente' && !podeExcluirQualquerStatus" class="alert alert-warning">
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
                  <p class="text-muted pedidos-empty-hint">Ou selecione um pedido na lista {{ isMobileLayout ? 'acima' : 'ao lado' }} para visualizar, editar ou excluir.</p>
                </div>
                <div v-else>
                  <p class="text-muted pedidos-empty-hint">
                    Toque em <strong>Ver</strong>, <strong>Editar</strong> ou <strong>Excluir</strong> nas ações acima.
                  </p>
                </div>
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
import PedidoDetalhesVisualizar from '@/components/PedidoDetalhesVisualizar.vue'
import PedidoEditarForm from '@/components/PedidoEditarForm.vue'
import SelecionarProdutos from '@/components/SelecionarProdutos.vue'
import { usarNotificacoes } from '@/composables/usarNotificacoes.js'
import { pedidosAPI, fornecedoresAPI } from '@/services/api.js'

export default {
  name: 'PedidosView',
  components: { 
    menuDefault,
    menuPedidosCliente,
    PedidoDetalhesVisualizar,
    PedidoEditarForm,
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
      confirmandoEntrega: false,
      isMobileLayout: false,
    }
  },
  mounted() {
    this.carregarPedidos()
    this.carregarFornecedores()
    this.mqMobile = window.matchMedia('(max-width: 767.98px)')
    this.isMobileLayout = this.mqMobile.matches
    this.mqMobile.addEventListener('change', this.onMobileLayoutChange)
  },
  beforeUnmount() {
    if (this.mqMobile) {
      this.mqMobile.removeEventListener('change', this.onMobileLayoutChange)
    }
  },
  methods: {
    onMobileLayoutChange(e) {
      this.isMobileLayout = e.matches
    },
    aplicarPedidoDaQuery() {
      const idQuery = this.$route?.query?.id
      if (!idQuery || !this.pedidos.length) return
      const pedido = this.pedidos.find((p) => String(p.id) === String(idQuery))
      if (pedido) {
        this.selecionarPedido(pedido)
        this.acaoAtual = 'visualizar'
      }
    },
    async carregarPedidos() {
      this.carregandoPedidos = true
      try {
        this.pedidos = await pedidosAPI.getAll()
        this.aplicarPedidoDaQuery()
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
      if (this.isMobileLayout) {
        this.$nextTick(() => this.scrollParaPainelAcoes())
      }
    },
    scrollParaPainelAcoes() {
      if (!this.isMobileLayout) return
      const el = document.getElementById('pedidos-painel-acoes')
      if (!el) return
      const offset = 72
      const top = el.getBoundingClientRect().top + window.scrollY - offset
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
    },
    handleSelect(acao) {
      // se nao tem pedido selecionado e nao e criar, eu peço pra selecionar
      if (!this.pedidoSelecionado && acao !== 'criar') {
        this.notificar.aviso('Por favor, selecione um pedido primeiro.')
        return
      }

      // defino a acao atual
      this.acaoAtual = acao
      this.$nextTick(() => this.scrollParaPainelAcoes())
      
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
      if (!this.pedidoEditando) return

      if (this.tipoUsuario === 'cliente' && this.pedidoSelecionado.status !== 'pendente') {
        this.erroEdicao = 'Só é possível editar pedidos com status "pendente"'
        return
      }

      if (this.produtosEditando.length === 0) {
        this.erroEdicao = 'Adicione pelo menos um produto ao pedido.'
        return
      }

      this.salvandoEdicao = true
      this.erroEdicao = ''

      try {
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
          descricao: this.pedidoEditando.descricao,
          produtos: produtosFormatados,
          valor: this.totalProdutosEditando
        }

        if (this.tipoUsuario === 'admin' && this.pedidoEditando.status) {
          dadosAtualizacao.status = this.pedidoEditando.status
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
      if (!this.pedidoSelecionado) return
      if (!this.podeExcluirQualquerStatus && this.pedidoSelecionado.status !== 'pendente') {
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
    tipoUsuario() {
      try {
        return JSON.parse(localStorage.getItem('user'))?.tipo || null
      } catch {
        return null
      }
    },
    isAdmin() {
      return this.tipoUsuario === 'admin'
    },
    tituloListaPedidos() {
      return this.isAdmin ? 'Todos os pedidos' : 'Meus pedidos'
    },
    resumoPedidosAdmin() {
      const n = this.pedidos.length
      if (n === 0) return 'Visualize e gerencie pedidos de todos os clientes'
      return `${n} pedido${n === 1 ? '' : 's'} no sistema`
    },
    podeExcluirQualquerStatus() {
      return this.isAdmin
    },
    podeCriarPedido() {
      return this.tipoUsuario === 'cliente'
    },
    podeConfirmarEntrega() {
      return this.tipoUsuario === 'cliente'
    },
    podeEditarPedido() {
      if (this.tipoUsuario === 'admin') return true
      return this.pedidoSelecionado?.status === 'pendente'
    },
    mensagemBloqueioEdicao() {
      return `Só é possível editar pedidos com status "pendente". Este pedido está como "${this.pedidoSelecionado?.status}".`
    },
    painelBodyClass() {
      if (this.acaoAtual === 'visualizar') return 'pedidos-painel-body--visualizar'
      if (this.acaoAtual === 'editar') return 'pedidos-painel-body--editar'
      return 'bg-light'
    },
    acaoAtualLabel() {
      const labels = {
        criar: 'Criar pedido',
        visualizar: 'Detalhes do pedido',
        editar: 'Editar pedido',
        excluir: 'Excluir pedido',
      }
      return labels[this.acaoAtual] || ''
    },
    pedidoResumoMobile() {
      if (!this.pedidoSelecionado) return ''
      return `Pedido #${this.pedidoSelecionado.numero_pedido}`
    },
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
.pedidos-page {
  text-align: left;
}

.pedidos-list-card {
  background: var(--hc-card, #fff);
  border: 2px solid transparent;
  border-radius: 12px;
  padding: 0.85rem 1rem;
  margin-bottom: 0.65rem;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
  transition: transform 0.15s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  -webkit-tap-highlight-color: transparent;
}

.pedidos-list-card:active {
  transform: scale(0.99);
}

.pedidos-list-card--active {
  border-color: var(--bs-primary, #0d6efd);
  box-shadow: 0 4px 14px rgba(13, 110, 253, 0.18);
}

.pedidos-list-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.35rem;
}

.pedidos-list-card__num {
  font-weight: 700;
  font-size: 1rem;
  color: var(--app-text, #0f172a);
}

.pedidos-list-card__badge {
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  font-size: 0.72rem;
  font-weight: 600;
}

.pedidos-list-card__meta {
  font-size: 0.82rem;
  color: var(--muted, #64748b);
}

.pedidos-list-card__valor {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--app-text, #0f172a);
}

@media (min-width: 768px) {
  .pedidos-list-card:hover {
    box-shadow: 0 4px 14px rgba(15, 23, 42, 0.1);
  }
}

.pedidos-lista-col {
  border-right: none;
}

@media (min-width: 768px) {
  .pedidos-lista-col {
    border-right: 1px solid var(--bs-border-color, #dee2e6);
    padding-right: 1rem !important;
  }
}

.pedidos-lista-body {
  max-height: min(60vh, 600px);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

@media (min-width: 768px) {
  .pedidos-lista-body {
    max-height: 600px;
  }
}

.pedidos-acoes-header {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  position: relative;
  z-index: 5;
  overflow: visible;
}

.pedidos-acoes-header__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.pedidos-acoes-header__title {
  font-size: 1rem;
  font-weight: 700;
}

.pedidos-painel-body {
  text-align: left;
}

.pedidos-painel-body--visualizar,
.pedidos-painel-body--editar {
  background: var(--app-bg, #f5f5f5);
  padding: 1rem;
  text-align: left;
}

@media (min-width: 768px) {
  .pedidos-painel-body--visualizar,
  .pedidos-painel-body--editar {
    padding: 1.25rem 1.5rem;
  }
}

.pedidos-painel-card {
  overflow: visible;
}

.pedidos-empty-hint {
  font-size: 0.95rem;
  max-width: 22rem;
  margin-left: auto;
  margin-right: auto;
}

@media (max-width: 767.98px) {
  .pedidos-painel-body {
    padding: 1rem;
  }

  .pedidos-painel-body .btn-lg {
    width: 100%;
    max-width: 20rem;
  }

  .pedidos-painel-body .d-flex.gap-2 {
    flex-direction: column;
  }

  .pedidos-painel-body .d-flex.gap-2 .btn {
    width: 100%;
  }

  .pedidos-painel-body .table-responsive {
    font-size: 0.85rem;
  }
}

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