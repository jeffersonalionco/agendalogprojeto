<template>
  <div class="admin-page">
    <menuDefault />

    <header class="admin-page__banner">
      <div class="admin-page__banner-inner">
        <p class="admin-page__banner-greet">Olá, {{ nomeExibicao }}</p>
        <h1 class="admin-page__banner-title">Painel Administrativo</h1>
        <p class="admin-page__banner-sub">{{ resumoPedidos }}</p>
      </div>
    </header>

    <div class="admin-page__content">
      <!-- atalhos rápidos -->
      <nav class="admin-page__quick-links" aria-label="Atalhos do administrador">
        <router-link to="/pedidos" class="admin-page__quick-link">
          <i class="bi bi-cart-check" aria-hidden="true"></i>
          <span>Pedidos</span>
        </router-link>
        <router-link to="/usuarios" class="admin-page__quick-link">
          <i class="bi bi-people-fill" aria-hidden="true"></i>
          <span>Usuários</span>
        </router-link>
        <router-link to="/produtos" class="admin-page__quick-link">
          <i class="bi bi-box-seam" aria-hidden="true"></i>
          <span>Produtos</span>
        </router-link>
      </nav>

      <!-- gráfico resumo -->
      <section class="mb-3" aria-label="Resumo de pedidos">
        <GraficoResumoPedidos
          :pedidos="pedidos"
          :carregando="carregandoPedidos"
          titulo="Visão geral dos pedidos"
          subtitulo="Distribuição por status em tempo real"
        />
      </section>

      <!-- stats por status -->
      <div class="admin-page__stats-scroll">
        <div
          v-for="(count, status) in pedidosPorStatus"
          :key="status"
          class="admin-page__stat-card"
          :class="getStatusCardClass(status)"
        >
          <span class="admin-page__stat-num">{{ count }}</span>
          <span class="admin-page__stat-label">{{ status }}</span>
        </div>
      </div>

      <!-- pedidos recentes -->
      <section class="admin-page__section">
        <div class="admin-page__section-header">
          <h2 class="admin-page__section-title">
            <i class="bi bi-clock-history me-2" aria-hidden="true"></i>
            Pedidos recentes
          </h2>
          <button
            type="button"
            class="btn btn-sm admin-page__btn-ghost"
            :disabled="carregandoPedidos"
            @click="carregarPedidos"
          >
            <span v-if="carregandoPedidos" class="spinner-border spinner-border-sm me-1"></span>
            Atualizar
          </button>
        </div>
        <div class="admin-page__section-body">
          <div v-if="carregandoPedidos" class="admin-page__loading">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-2 mb-0">Carregando pedidos...</p>
          </div>
          <div v-else-if="pedidos.length === 0" class="admin-page__empty">
            <span class="admin-page__empty-icon">📋</span>
            <p class="mb-0">Nenhum pedido cadastrado.</p>
          </div>
          <template v-else>
            <div class="admin-page__cards admin-page__mobile-only">
              <article
                v-for="pedido in pedidosRecentes"
                :key="pedido.id"
                class="admin-page__item-card"
              >
                <div class="admin-page__item-card-top">
                  <h3 class="admin-page__item-card-title">#{{ pedido.numero_pedido }}</h3>
                  <span :class="getStatusBadgeClass(pedido.status)">{{ pedido.status }}</span>
                </div>
                <div class="admin-page__item-card-meta">
                  <span><i class="bi bi-person me-1"></i>Cliente #{{ pedido.id_usuario }}</span>
                  <span><i class="bi bi-building me-1"></i>Fornecedor #{{ pedido.id_fornecedor || '—' }}</span>
                  <span><i class="bi bi-calendar3 me-1"></i>{{ formatarData(pedido.data_pedido) }}</span>
                  <strong>R$ {{ parseFloat(pedido.valor).toFixed(2) }}</strong>
                </div>
                <router-link
                  :to="{ path: '/pedidos', query: { id: pedido.id } }"
                  class="btn btn-sm admin-page__btn-primary w-100"
                >
                  Gerenciar pedido
                </router-link>
              </article>
            </div>

            <div class="admin-page__table-wrap admin-page__desktop-only">
              <table class="admin-page__table">
                <thead>
                  <tr>
                    <th>Número</th>
                    <th>Cliente</th>
                    <th>Fornecedor</th>
                    <th>Valor</th>
                    <th>Status</th>
                    <th>Data</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="pedido in pedidosRecentes" :key="pedido.id">
                    <td><strong>#{{ pedido.numero_pedido }}</strong></td>
                    <td>#{{ pedido.id_usuario }}</td>
                    <td>#{{ pedido.id_fornecedor || '—' }}</td>
                    <td>R$ {{ parseFloat(pedido.valor).toFixed(2) }}</td>
                    <td><span :class="getStatusBadgeClass(pedido.status)">{{ pedido.status }}</span></td>
                    <td>{{ formatarData(pedido.data_pedido) }}</td>
                    <td>
                      <router-link
                        :to="{ path: '/pedidos', query: { id: pedido.id } }"
                        class="btn btn-sm admin-page__btn-ghost"
                      >
                        Abrir
                      </router-link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="text-center mt-3">
              <router-link to="/pedidos" class="btn admin-page__btn-primary">
                <i class="bi bi-arrow-right-circle me-2"></i>
                Ver todos os pedidos
              </router-link>
            </div>
          </template>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import menuDefault from '@/components/menuDefault.vue'
import GraficoResumoPedidos from '@/components/GraficoResumoPedidos.vue'
import { usarNotificacoes } from '@/composables/usarNotificacoes.js'
import { pedidosAPI } from '@/services/api.js'

export default {
  name: 'HomeAdmin',
  components: { menuDefault, GraficoResumoPedidos },
  setup() {
    return { notificar: usarNotificacoes() }
  },
  data() {
    return {
      usuarioAtual: null,
      pedidos: [],
      carregandoPedidos: false,
    }
  },
  computed: {
    nomeExibicao() {
      const email = this.usuarioAtual?.email
      if (!email) return 'Administrador'
      const local = String(email).split('@')[0] || 'Administrador'
      return local.charAt(0).toUpperCase() + local.slice(1)
    },
    resumoPedidos() {
      const n = this.pedidos.length
      if (n === 0) return 'Nenhum pedido no sistema'
      return `${n} pedido${n === 1 ? '' : 's'} no total`
    },
    pedidosRecentes() {
      return [...this.pedidos]
        .sort((a, b) => new Date(b.data_pedido) - new Date(a.data_pedido))
        .slice(0, 8)
    },
    pedidosPorStatus() {
      const counts = {}
      for (const p of this.pedidos) {
        const s = p.status || 'outro'
        counts[s] = (counts[s] || 0) + 1
      }
      return counts
    },
  },
  mounted() {
    try {
      this.usuarioAtual = JSON.parse(localStorage.getItem('user')) || null
    } catch {
      this.usuarioAtual = null
    }
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
    getStatusCardClass(status) {
      const map = {
        pendente: 'admin-page__stat-card--warning',
        'aguardando envio': 'admin-page__stat-card--info',
        enviado: 'admin-page__stat-card--primary',
        entregue: 'admin-page__stat-card--success',
        cancelado: 'admin-page__stat-card--danger',
      }
      return map[status] || ''
    },
    getStatusBadgeClass(status) {
      const map = {
        pendente: 'admin-page__badge admin-page__badge--pendente',
        'aguardando envio': 'admin-page__badge admin-page__badge--aguardando',
        enviado: 'admin-page__badge admin-page__badge--enviado',
        entregue: 'admin-page__badge admin-page__badge--entregue',
        cancelado: 'admin-page__badge admin-page__badge--cancelado',
      }
      return map[status] || 'admin-page__badge admin-page__badge--default'
    },
    formatarData(data) {
      if (!data) return '—'
      return new Date(data).toLocaleDateString('pt-BR')
    },
  },
}
</script>
