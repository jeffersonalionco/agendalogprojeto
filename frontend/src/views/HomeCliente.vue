<template>
  <div class="home-cliente">
    <menuDefault />

    <!-- banner de boas vindas -->
    <div class="home-cliente__banner">
      <div class="home-cliente__banner-inner">
        <p class="home-cliente__banner-greet">Olá, {{ nomeExibicao }}</p>
        <h1 class="home-cliente__banner-title">Meus Pedidos</h1>
        <p class="home-cliente__banner-sub">{{ resumoPedidosBanner }}</p>
      </div>
    </div>

    <!-- atalhos rapidos (so mobile) -->
    <div class="home-cliente__mobile-toolbar home-cliente__mobile-only">
      <router-link to="/pedidos" class="home-cliente__toolbar-btn home-cliente__toolbar-btn--primary">
        <i class="bi bi-cart-plus" aria-hidden="true"></i>
        <span>Novo pedido</span>
      </router-link>
      <button
        v-if="pedidos.length > 0"
        type="button"
        class="home-cliente__toolbar-btn home-cliente__toolbar-btn--ghost"
        @click="focusBusca"
      >
        <i class="bi bi-search" aria-hidden="true"></i>
        <span>Buscar</span>
      </button>
    </div>

    <!-- largura total da viewport, igual à home do fornecedor (container-fluid) -->
    <section class="home-cliente__grafico-outer" aria-label="Resumo de pedidos por status">
      <div class="container-fluid px-3 px-md-4 mt-3 mb-2 mb-md-3">
        <GraficoResumoPedidos
          :pedidos="pedidos"
          :carregando="carregandoPedidos"
          estilo-cliente
        />
      </div>
    </section>

    <div class="home-cliente__content">
      <!-- stats scroll horizontal no mobile -->
      <section class="home-cliente__stats">
        <div class="home-cliente__stats-scroll">
          <div
            v-for="(count, status) in pedidosPorStatus"
            :key="status"
            class="home-cliente__stat-card"
            :class="getStatusCardClass(status)"
          >
            <span class="home-cliente__stat-num">{{ count }}</span>
            <span class="home-cliente__stat-label">{{ status }}</span>
          </div>
        </div>
      </section>

      <!-- busca (so aparece quando tem pedido) -->
      <div v-if="!carregandoPedidos && pedidos.length > 0" class="home-cliente__search">
        <input
          ref="inputBusca"
          v-model="termoBusca"
          type="search"
          enterkeyhint="search"
          autocomplete="off"
          class="home-cliente__search-input"
          placeholder="Buscar pedido..."
          @input="filtrarPedidos"
        />
        <span v-if="termoBusca && pedidosFiltrados.length !== pedidos.length" class="home-cliente__search-hint">
          {{ pedidosFiltrados.length }} de {{ pedidos.length }}
        </span>
      </div>

      <!-- lista de pedidos -->
      <section class="home-cliente__lista">
        <div v-if="carregandoPedidos" class="home-cliente__loading">
          <div class="spinner-border text-primary" role="status"></div>
          <p>Carregando pedidos...</p>
        </div>
        <div v-else-if="pedidos.length === 0" class="home-cliente__empty">
          <span class="home-cliente__empty-icon">📦</span>
          <p>Você ainda não possui pedidos.</p>
          <router-link to="/pedidos" class="btn btn-primary home-cliente__cta">Fazer pedido</router-link>
        </div>
        <div v-else-if="termoBusca && pedidosFiltrados.length === 0" class="home-cliente__empty">
          <p>Nenhum pedido para "{{ termoBusca }}"</p>
        </div>
        <div v-else class="home-cliente__cards">
          <div
            v-for="pedido in pedidosFiltrados"
            :key="pedido.id"
            class="home-cliente__card"
            :class="{ 'home-cliente__card--active': pedidoSelecionado?.id === pedido.id }"
            @click="selecionarPedido(pedido)"
          >
            <div class="home-cliente__card-main">
              <span class="home-cliente__card-num">#{{ pedido.numero_pedido }}</span>
              <span :class="['home-cliente__card-badge', getStatusClass(pedido.status)]">{{ pedido.status }}</span>
            </div>
            <div class="home-cliente__card-meta">
              <span v-if="getFornecedorNome(pedido.id_fornecedor)" class="home-cliente__card-forn">{{ getFornecedorNome(pedido.id_fornecedor) }}</span>
              <strong class="home-cliente__card-valor">R$ {{ parseFloat(pedido.valor).toFixed(2) }}</strong>
            </div>
          </div>
        </div>
      </section>

      <!-- notificacoes -->
      <section v-if="notificacoes.length > 0" class="home-cliente__notif">
        <div
          v-for="(notificacao, index) in notificacoes"
          :key="index"
          class="home-cliente__notif-item"
          :class="notificacao.tipo"
        >
          <strong>{{ notificacao.titulo }}</strong>
          <p class="mb-0 small">{{ notificacao.mensagem }}</p>
        </div>
      </section>

      <!-- erros -->
      <section v-if="erros.length > 0" class="home-cliente__erros">
        <div v-for="(erro, index) in erros" :key="index" class="home-cliente__erro-item">
          <strong>{{ erro.titulo }}</strong>
          <p class="mb-0 small">{{ erro.mensagem }}</p>
          <button v-if="erro.dismissible" type="button" class="btn-close btn-close-sm" @click="removerErro(index)" aria-label="Fechar"></button>
        </div>
      </section>

      <!-- backdrop mobile toque fora fecha o detalhe -->
      <div
        v-if="pedidoSelecionado"
        class="home-cliente__backdrop"
        aria-hidden="true"
        @click="pedidoSelecionado = null"
      />

      <!-- detalhes do pedido selecionado -->
      <transition name="home-cliente-detalhe">
        <section v-if="pedidoSelecionado" class="home-cliente__detalhe">
          <div class="home-cliente__detalhe-handle-wrap home-cliente__mobile-only" aria-hidden="true">
            <span class="home-cliente__detalhe-handle" />
          </div>
          <div class="home-cliente__detalhe-header">
            <h2 class="home-cliente__detalhe-title">Pedido #{{ pedidoSelecionado.numero_pedido }}</h2>
            <button type="button" class="home-cliente__detalhe-close" @click="pedidoSelecionado = null" aria-label="Fechar">×</button>
          </div>
          <div class="home-cliente__detalhe-body">
            <div class="home-cliente__detalhe-grid">
              <p><strong>Descrição</strong><br>{{ pedidoSelecionado.descricao }}</p>
              <p><strong>Valor</strong><br>R$ {{ parseFloat(pedidoSelecionado.valor).toFixed(2) }}</p>
              <p><strong>Status</strong><br><span :class="getStatusClass(pedidoSelecionado.status)">{{ pedidoSelecionado.status }}</span></p>
              <p><strong>Data</strong><br>{{ formatarData(pedidoSelecionado.data_pedido) }}</p>
              <p v-if="getFornecedorNome(pedidoSelecionado.id_fornecedor)"><strong>Fornecedor</strong><br>{{ getFornecedorNome(pedidoSelecionado.id_fornecedor) }}</p>
            </div>
            <div v-if="Array.isArray(pedidoSelecionado.produtos) && pedidoSelecionado.produtos.length > 0" class="home-cliente__detalhe-produtos">
              <h6>Produtos</h6>
              <ul class="home-cliente__prod-list">
                <li v-for="(produto, index) in pedidoSelecionado.produtos" :key="index" class="home-cliente__prod-item">
                  <span>{{ produto.nome || produto.descricao }}</span>
                  <span>{{ produto.quantidade }} × R$ {{ parseFloat(produto.valor_unitario || produto.valor_compra || 0).toFixed(2) }} = R$ {{ parseFloat(produto.subtotal || (produto.quantidade * (produto.valor_unitario || produto.valor_compra || 0))).toFixed(2) }}</span>
                </li>
              </ul>
            </div>
            <div v-if="pedidoSelecionado.status === 'enviado' || pedidoSelecionado.status === 'aguardando envio'" class="home-cliente__detalhe-actions">
              <button
                class="home-cliente__btn-confirmar"
                :disabled="confirmandoEntrega"
                @click="confirmarEntrega(pedidoSelecionado.id)"
              >
                <span v-if="confirmandoEntrega" class="spinner-border spinner-border-sm me-2"></span>
                {{ confirmandoEntrega ? 'Confirmando...' : '✓ Confirmar entrega' }}
              </button>
            </div>
            <div v-else-if="pedidoSelecionado.status === 'entregue'" class="alert alert-success small mb-0">
              ✓ Entregue em {{ formatarData(pedidoSelecionado.data_entrega) }}
            </div>
            <div class="home-cliente__detalhe-footer">
              <button type="button" class="btn btn-outline-primary btn-sm" @click="imprimirPedido(pedidoSelecionado)">🖨️ Imprimir</button>
            </div>
          </div>
        </section>
      </transition>
    </div>

    <!-- fab novo pedido (mobile, some com painel aberto) -->
    <router-link
      v-if="!pedidoSelecionado"
      to="/pedidos"
      class="home-cliente__fab home-cliente__mobile-only"
      aria-label="Criar novo pedido"
    >
      <i class="bi bi-plus-lg" aria-hidden="true"></i>
    </router-link>
  </div>
</template>

<script>
import menuDefault from '@/components/menuDefault.vue'
import GraficoResumoPedidos from '@/components/GraficoResumoPedidos.vue'
import { usarNotificacoes } from '@/composables/usarNotificacoes.js'
import { pedidosAPI, fornecedoresAPI } from '@/services/api.js'

export default {
  name: 'HomeCliente',
  components: { menuDefault, GraficoResumoPedidos },
  setup() {
    return { notificar: usarNotificacoes() }
  },
  data() {
    return {
      usuarioAtual: null,
      pedidos: [],
      pedidoSelecionado: null,
      fornecedores: [],
      carregandoPedidos: false,
      carregandoFornecedores: false,
      termoBusca: '',
      notificacoes: [],
      erros: [],
      confirmandoEntrega: false
    }
  },
  mounted() {
    try {
      this.usuarioAtual = JSON.parse(localStorage.getItem('user')) || null
    } catch {
      this.usuarioAtual = null
    }
    this.carregarPedidos()
    this.carregarFornecedores()
    this.gerarNotificacoes()
  },
  computed: {
    nomeExibicao() {
      const email = this.usuarioAtual?.email
      if (!email) return 'Cliente'
      const local = String(email).split('@')[0] || 'Cliente'
      return local.charAt(0).toUpperCase() + local.slice(1)
    },
    resumoPedidosBanner() {
      const n = this.pedidos.length
      if (n === 0) return 'Nenhum pedido ainda'
      return `${n} pedido${n === 1 ? '' : 's'}`
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
    },
    pedidosPorStatus() {
      const statusCount = {
        'pendente': 0,
        'aguardando envio': 0,
        'enviado': 0,
        'entregue': 0,
        'cancelado': 0
      }
      
      this.pedidos.forEach(pedido => {
        if (Object.prototype.hasOwnProperty.call(statusCount, pedido.status)) {
          statusCount[pedido.status]++
        }
      })
      
      return statusCount
    }
  },
  methods: {
    async carregarPedidos() {
      this.carregandoPedidos = true
      try {
        this.pedidos = await pedidosAPI.getAll()
        this.gerarNotificacoes()
      } catch (error) {
        console.error('Erro ao carregar pedidos:', error)
        this.adicionarErro('Erro ao Carregar Pedidos', error.message)
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
        this.adicionarErro('Erro ao Carregar Fornecedores', error.message)
      } finally {
        this.carregandoFornecedores = false
      }
    },
    selecionarPedido(pedido) {
      this.pedidoSelecionado = pedido
    },
    getFornecedorNome(idFornecedor) {
      if (!idFornecedor || !this.fornecedores.length) return null
      const fornecedor = this.fornecedores.find(f => f.id === idFornecedor)
      return fornecedor ? fornecedor.email : null
    },
    filtrarPedidos() {
      // metodo vazio msm, a filtragem ta no computed pedidosFiltrados
    },
    focusBusca() {
      const el = this.$refs.inputBusca
      if (el && typeof el.focus === 'function') {
        el.focus()
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    },
    gerarNotificacoes() {
      this.notificacoes = []
      
      // notificacao pra pedido pendente a mais de 3 dias
      const pedidosPendentesAntigos = this.pedidos.filter(pedido => {
        if (pedido.status !== 'pendente') return false
        const dataPedido = new Date(pedido.data_pedido)
        const diasAtras = (new Date() - dataPedido) / (1000 * 60 * 60 * 24)
        return diasAtras > 3
      })
      
      if (pedidosPendentesAntigos.length > 0) {
        this.notificacoes.push({
          tipo: 'alert-warning',
          titulo: 'Pedidos Pendentes',
          mensagem: `Você tem ${pedidosPendentesAntigos.length} pedido(s) pendente(s) há mais de 3 dias.`,
          data: new Date()
        })
      }
      
      // notificacao pra pedido aguardando envio
      const pedidosAguardandoEnvio = this.pedidos.filter(p => p.status === 'aguardando envio')
      if (pedidosAguardandoEnvio.length > 0) {
        this.notificacoes.push({
          tipo: 'alert-info',
          titulo: 'Pedidos Aguardando Envio',
          mensagem: `Você tem ${pedidosAguardandoEnvio.length} pedido(s) aguardando envio pelo fornecedor.`,
          data: new Date()
        })
      }
      
      // notificacao pra pedido enviado esperando confirmacao
      const pedidosEnviados = this.pedidos.filter(p => p.status === 'enviado')
      if (pedidosEnviados.length > 0) {
        this.notificacoes.push({
          tipo: 'alert-primary',
          titulo: 'Pedidos Aguardando Confirmação de Entrega',
          mensagem: `Você tem ${pedidosEnviados.length} pedido(s) enviado(s) aguardando confirmação de entrega.`,
          data: new Date()
        })
      }
      
      // notificacao pra pedido entregue
      const pedidosEntregues = this.pedidos.filter(p => p.status === 'entregue')
      if (pedidosEntregues.length > 0) {
        this.notificacoes.push({
          tipo: 'alert-success',
          titulo: 'Pedidos Entregues',
          mensagem: `Você tem ${pedidosEntregues.length} pedido(s) confirmado(s) como entregue(s).`,
          data: new Date()
        })
      }
    },
    adicionarErro(titulo, mensagem) {
      this.erros.push({
        titulo,
        mensagem,
        data: new Date(),
        dismissible: true
      })
    },
    removerErro(index) {
      this.erros.splice(index, 1)
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
    getStatusCardClass(status) {
      const classes = {
        'pendente': 'border-warning',
        'aguardando envio': 'border-info',
        'enviado': 'border-primary',
        'entregue': 'border-success',
        'cancelado': 'border-danger'
      }
      return classes[status] || 'border-secondary'
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
            ${this.getFornecedorNome(pedido.id_fornecedor) ? `<p><strong>Fornecedor:</strong> ${this.getFornecedorNome(pedido.id_fornecedor)}</p>` : ''}
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
    }
  }
}
</script>

<style scoped>
/* cores do sistema padrao do projeto (mexer nisso aqui da dor de cabeca) */

.home-cliente {
  --hc-primary: #0066FF;
  --hc-primary-dark: #0052cc;
  --hc-text: #2c3e50;
  --hc-success: #42b983;
  --hc-bg: var(--app-bg, #f5f5f5);
  --hc-card: var(--card-bg, #fff);
  min-height: 100vh;
  background: var(--hc-bg);
  padding-bottom: env(safe-area-inset-bottom, 0);
  overflow-x: hidden;
}

.home-cliente__banner {
  background: var(--hc-primary);
  color: #fff;
  padding: 1.25rem 1rem;
  padding-top: calc(1.25rem + env(safe-area-inset-top, 0));
  box-shadow: 0 4px 12px rgba(0, 102, 255, 0.25);
}
.home-cliente__banner-inner {
  max-width: 1200px;
  margin: 0 auto;
}
.home-cliente__banner-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.2rem 0;
  letter-spacing: -0.02em;
}
.home-cliente__banner-sub {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.9;
}
.home-cliente__banner-greet {
  margin: 0 0 0.35rem 0;
  font-size: 0.95rem;
  font-weight: 500;
  opacity: 0.95;
}

/* barra de atalhos (mobile) */
.home-cliente__mobile-toolbar {
  display: flex;
  gap: 0.5rem;
  padding: 0.65rem 1rem;
  padding-bottom: calc(0.65rem + env(safe-area-inset-bottom, 0));
  background: var(--hc-card);
  border-bottom: 1px solid var(--card-border, rgba(0, 0, 0, 0.08));
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
.home-cliente__toolbar-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  min-height: 48px;
  padding: 0.5rem 0.75rem;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  text-decoration: none;
  border: none;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: transform 0.12s ease, opacity 0.2s;
}
.home-cliente__toolbar-btn:active {
  transform: scale(0.98);
}
.home-cliente__toolbar-btn--primary {
  background: var(--hc-primary);
  color: #fff;
  box-shadow: 0 2px 8px rgba(0, 102, 255, 0.35);
}
.home-cliente__toolbar-btn--primary:visited {
  color: #fff;
}
.home-cliente__toolbar-btn--ghost {
  background: rgba(0, 102, 255, 0.08);
  color: var(--hc-primary);
  border: 1px solid rgba(0, 102, 255, 0.25);
}

.home-cliente__content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  padding-left: calc(1rem + env(safe-area-inset-left, 0));
  padding-right: calc(1rem + env(safe-area-inset-right, 0));
}

.home-cliente__grafico-outer {
  width: 100%;
  min-width: 0;
}

/* Mobile: prioriza alertas antes de busca/lista */
@media (max-width: 767px) {
  .home-cliente__content {
    display: flex;
    flex-direction: column;
    padding-bottom: calc(5.5rem + env(safe-area-inset-bottom, 0));
  }
  .home-cliente__stats {
    order: 1;
  }
  .home-cliente__notif {
    order: 2;
  }
  .home-cliente__erros {
    order: 3;
  }
  .home-cliente__search {
    order: 4;
  }
  .home-cliente__lista {
    order: 5;
  }
}

/* fab flutuante (mobile) */
.home-cliente__fab {
  position: fixed;
  right: calc(1rem + env(safe-area-inset-right, 0));
  bottom: calc(1rem + env(safe-area-inset-bottom, 0));
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--hc-primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.35rem;
  box-shadow: 0 4px 18px rgba(0, 102, 255, 0.45);
  z-index: 998;
  text-decoration: none;
  -webkit-tap-highlight-color: transparent;
  transition: transform 0.15s ease, box-shadow 0.2s ease;
}
.home-cliente__fab:active {
  transform: scale(0.94);
}

/* indicador de arraste no painel inferior (mobile) */
.home-cliente__detalhe-handle-wrap {
  display: flex;
  justify-content: center;
  padding: 0.35rem 0 0;
  flex-shrink: 0;
}
.home-cliente__detalhe-handle {
  width: 40px;
  height: 5px;
  border-radius: 999px;
  background: var(--muted, rgba(0, 0, 0, 0.18));
}

@media (max-width: 767px) {
  .home-cliente__prod-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.35rem;
  }
  .home-cliente__prod-item span:last-child {
    font-size: 0.8rem;
    line-height: 1.35;
    color: var(--muted, #6c757d);
  }
}

@media (min-width: 768px) {
  .home-cliente__mobile-toolbar,
  .home-cliente__fab,
  .home-cliente__detalhe-handle-wrap {
    display: none !important;
  }
}

/* scroll horizontal no mobile */
.home-cliente__stats {
  margin-bottom: 1rem;
}
.home-cliente__stats-scroll {
  display: flex;
  gap: 0.75rem;
  overflow-x: auto;
  padding: 0.25rem 0;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.home-cliente__stats-scroll::-webkit-scrollbar {
  display: none;
}
.home-cliente__stat-card {
  flex: 0 0 auto;
  min-width: 88px;
  padding: 0.85rem 0.75rem;
  border-radius: 12px;
  text-align: center;
  background: var(--hc-card);
  border: 2px solid transparent;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s, box-shadow 0.2s;
}
.home-cliente__stat-card:active {
  transform: scale(0.98);
}
.home-cliente__stat-num {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--hc-text);
  line-height: 1.2;
}
.home-cliente__stat-label {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--muted, #6c757d);
}
.home-cliente__stat-card.border-warning { border-color: #ffc107; }
.home-cliente__stat-card.border-info { border-color: #0dcaf0; }
.home-cliente__stat-card.border-primary { border-color: var(--hc-primary); }
.home-cliente__stat-card.border-success { border-color: var(--hc-success); }
.home-cliente__stat-card.border-danger { border-color: #dc3545; }

/* busca */
.home-cliente__search {
  margin-bottom: 1rem;
}
.home-cliente__search-input {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 1px solid var(--border-color, #dee2e6);
  border-radius: 10px;
  background: var(--hc-card);
  color: var(--app-text, var(--hc-text));
  min-height: 48px;
  -webkit-appearance: none;
  appearance: none;
}
.home-cliente__search-input::placeholder {
  color: var(--muted, #6c757d);
}
.home-cliente__search-hint {
  display: block;
  font-size: 0.8rem;
  color: var(--muted, #6c757d);
  margin-top: 0.35rem;
}

/* lista / cards de pedidos */
.home-cliente__loading,
.home-cliente__empty {
  text-align: center;
  padding: 2rem 1rem;
  color: var(--muted, #6c757d);
}
.home-cliente__empty-icon {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 0.5rem;
}
.home-cliente__cta {
  margin-top: 1rem;
  min-height: 48px;
  padding: 0.6rem 1.2rem;
  border-radius: 10px;
  font-weight: 600;
}

.home-cliente__cards {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.home-cliente__card {
  background: var(--hc-card);
  border-radius: 12px;
  padding: 1rem 1.1rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  border: 2px solid transparent;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
  min-height: 72px;
  -webkit-tap-highlight-color: transparent;
}
.home-cliente__card:active {
  transform: scale(0.99);
}
.home-cliente__card:hover {
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
}
.home-cliente__card--active {
  border-color: var(--hc-primary);
  box-shadow: 0 4px 16px rgba(0, 102, 255, 0.2);
}
.home-cliente__card-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.4rem;
}
.home-cliente__card-num {
  font-weight: 700;
  font-size: 1.05rem;
  color: var(--hc-text);
}
.home-cliente__card-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
}
.home-cliente__card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: var(--muted, #6c757d);
}
.home-cliente__card-valor {
  color: var(--hc-text);
  font-size: 1rem;
}

/* notificacoes e erros */
.home-cliente__notif,
.home-cliente__erros {
  margin-top: 1rem;
}
.home-cliente__notif-item,
.home-cliente__erro-item {
  padding: 0.85rem 1rem;
  border-radius: 10px;
  margin-bottom: 0.5rem;
  position: relative;
}
.home-cliente__erro-item {
  background: rgba(220, 53, 69, 0.1);
  border: 1px solid rgba(220, 53, 69, 0.3);
}
.home-cliente__erro-item .btn-close-sm {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
}

/* painel de detalhes slide-up no mobile */

.home-cliente__detalhe {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  max-height: 85vh;
  background: var(--hc-card);
  border-radius: 16px 16px 0 0;
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  padding-bottom: env(safe-area-inset-bottom, 0);
}
.home-cliente__detalhe-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--card-border, #eee);
}
.home-cliente__detalhe-title {
  font-size: 1.15rem;
  font-weight: 700;
  margin: 0;
  color: var(--hc-text);
}
.home-cliente__detalhe-close {
  width: 40px;
  height: 40px;
  border: none;
  background: rgba(0, 0, 0, 0.06);
  border-radius: 50%;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  color: var(--hc-text);
  display: flex;
  align-items: center;
  justify-content: center;
  -webkit-tap-highlight-color: transparent;
}
.home-cliente__detalhe-close:active {
  background: rgba(0, 0, 0, 0.1);
}
.home-cliente__detalhe-body {
  overflow-y: auto;
  padding: 1rem 1.25rem;
  -webkit-overflow-scrolling: touch;
}
.home-cliente__detalhe-grid {
  display: grid;
  gap: 0.75rem;
  margin-bottom: 1rem;
}
.home-cliente__detalhe-grid p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--hc-text);
}
.home-cliente__detalhe-grid strong {
  display: block;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--muted, #6c757d);
  margin-bottom: 0.2rem;
}
.home-cliente__detalhe-produtos h6 {
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
  color: var(--hc-text);
}
.home-cliente__prod-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.home-cliente__prod-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--card-border, #eee);
  font-size: 0.85rem;
  gap: 0.5rem;
}
.home-cliente__detalhe-actions {
  margin: 1rem 0;
}
.home-cliente__btn-confirmar {
  width: 100%;
  min-height: 48px;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 12px;
  background: var(--hc-success);
  color: #fff;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: opacity 0.2s, transform 0.1s;
}
.home-cliente__btn-confirmar:active {
  transform: scale(0.98);
}
.home-cliente__btn-confirmar:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.home-cliente__detalhe-footer {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--card-border, #eee);
}

.home-cliente__backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 999;
  -webkit-tap-highlight-color: transparent;
}
@media (min-width: 768px) {
  .home-cliente__backdrop {
    display: none;
  }
}

/* transicao do painel de detalhes */
.home-cliente-detalhe-enter-active,
.home-cliente-detalhe-leave-active {
  transition: transform 0.3s ease, opacity 0.25s ease;
}
.home-cliente-detalhe-enter-from,
.home-cliente-detalhe-leave-to {
  transform: translateY(100%);
  opacity: 0.8;
}

/* desktop layout em duas colunas e detalhe inline */
@media (min-width: 768px) {
  .home-cliente__banner {
    padding: 1.5rem 1.5rem;
  }
  .home-cliente__banner-title {
    font-size: 1.75rem;
  }
  .home-cliente__content {
    display: grid;
    grid-template-columns: 380px 1fr;
    gap: 1.5rem;
    align-items: start;
    padding: 1.5rem;
  }
  .home-cliente__stats {
    grid-column: 1 / -1;
  }
  .home-cliente__stats-scroll {
    flex-wrap: wrap;
    overflow-x: visible;
    gap: 1rem;
  }
  .home-cliente__stat-card {
    min-width: 120px;
  }
  .home-cliente__search {
    grid-column: 1;
  }
  .home-cliente__lista {
    grid-column: 1;
  }
  .home-cliente__notif,
  .home-cliente__erros {
    grid-column: 2;
  }
  .home-cliente__detalhe {
    position: relative;
    max-height: none;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    grid-column: 2;
    grid-row: 3 / 6;
  }
  .home-cliente-detalhe-enter-from,
  .home-cliente-detalhe-leave-to {
    transform: translateY(0);
    opacity: 0;
  }
}

.badge {
  padding: 0.35em 0.65em;
  font-size: 0.875em;
}
</style>
