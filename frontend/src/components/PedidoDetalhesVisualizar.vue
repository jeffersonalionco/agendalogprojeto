<template>
  <article class="pedido-view">
    <!-- cabeçalho do pedido -->
    <header class="pedido-view__hero">
      <div class="pedido-view__hero-content">
        <div class="pedido-view__hero-top">
          <span class="pedido-view__eyebrow">Pedido</span>
          <span :class="['pedido-view__status', statusMeta.className]">
            <i class="bi" :class="statusMeta.icon" aria-hidden="true"></i>
            {{ formatarStatus(pedido.status) }}
          </span>
        </div>
        <h2 class="pedido-view__numero">#{{ pedido.numero_pedido }}</h2>
        <p v-if="pedido.descricao" class="pedido-view__descricao">{{ pedido.descricao }}</p>
      </div>

      <div class="pedido-view__hero-aside">
        <div class="pedido-view__total-box">
          <span class="pedido-view__total-label">Valor total</span>
          <span class="pedido-view__total-valor">R$ {{ formatarMoeda(pedido.valor) }}</span>
        </div>
        <button
          type="button"
          class="btn pedido-view__btn-print"
          title="Imprimir pedido"
          @click="$emit('imprimir')"
        >
          <i class="bi bi-printer" aria-hidden="true"></i>
          <span>Imprimir</span>
        </button>
      </div>
    </header>

    <!-- informações gerais -->
    <section class="pedido-view__section" aria-labelledby="pedido-info-titulo">
      <h3 id="pedido-info-titulo" class="pedido-view__section-title">
        <i class="bi bi-info-circle" aria-hidden="true"></i>
        Informações
      </h3>
      <div class="pedido-view__info-grid">
        <div class="pedido-view__info-item">
          <i class="bi bi-hash pedido-view__info-icon" aria-hidden="true"></i>
          <div>
            <span class="pedido-view__info-label">Número</span>
            <span class="pedido-view__info-value">{{ pedido.numero_pedido }}</span>
          </div>
        </div>
        <div v-if="fornecedorNome" class="pedido-view__info-item">
          <i class="bi bi-building pedido-view__info-icon" aria-hidden="true"></i>
          <div>
            <span class="pedido-view__info-label">Fornecedor</span>
            <span class="pedido-view__info-value pedido-view__info-value--truncate">{{ fornecedorNome }}</span>
          </div>
        </div>
        <div class="pedido-view__info-item">
          <i class="bi bi-calendar3 pedido-view__info-icon" aria-hidden="true"></i>
          <div>
            <span class="pedido-view__info-label">Data do pedido</span>
            <span class="pedido-view__info-value">{{ formatarData(pedido.data_pedido) }}</span>
          </div>
        </div>
        <div v-if="pedido.data_entrega" class="pedido-view__info-item">
          <i class="bi bi-calendar-check pedido-view__info-icon" aria-hidden="true"></i>
          <div>
            <span class="pedido-view__info-label">Data de entrega</span>
            <span class="pedido-view__info-value">{{ formatarData(pedido.data_entrega) }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ações extras (ex.: fornecedor atualizar status) -->
    <div v-if="$slots.acoes" class="pedido-view__section pedido-view__acoes-slot">
      <slot name="acoes" />
    </div>

    <!-- produtos -->
    <PedidoProdutosLista
      class="pedido-view__section"
      :produtos="produtos"
      :valor-total="pedido.valor"
    />

    <!-- confirmação de entrega (cliente) -->
    <section
      v-if="podeConfirmarEntrega && (pedido.status === 'enviado' || pedido.status === 'aguardando envio')"
      class="pedido-view__cta pedido-view__cta--pendente"
    >
      <div class="pedido-view__cta-icon">
        <i class="bi bi-truck" aria-hidden="true"></i>
      </div>
      <div class="pedido-view__cta-body">
        <h4 class="pedido-view__cta-title">Confirmar recebimento</h4>
        <p class="pedido-view__cta-text">
          <template v-if="pedido.status === 'aguardando envio'">
            O pedido está aguardando envio. Você pode confirmar a entrega quando receber os itens.
          </template>
          <template v-else>
            O pedido foi enviado. Confirme quando receber para concluir o processo.
          </template>
        </p>
        <button
          type="button"
          class="btn btn-success pedido-view__cta-btn"
          :disabled="confirmandoEntrega"
          @click="$emit('confirmar-entrega')"
        >
          <span v-if="confirmandoEntrega" class="spinner-border spinner-border-sm me-2" role="status"></span>
          <i v-else class="bi bi-check2-circle me-2" aria-hidden="true"></i>
          {{ confirmandoEntrega ? 'Confirmando…' : 'Confirmar entrega' }}
        </button>
      </div>
    </section>

    <section
      v-else-if="pedido.status === 'entregue'"
      class="pedido-view__cta pedido-view__cta--sucesso"
    >
      <div class="pedido-view__cta-icon">
        <i class="bi bi-check-circle-fill" aria-hidden="true"></i>
      </div>
      <div class="pedido-view__cta-body">
        <h4 class="pedido-view__cta-title">Entrega confirmada</h4>
        <p class="pedido-view__cta-text mb-0">
          Recebimento confirmado em {{ formatarDataHora(pedido.data_entrega) }}.
        </p>
      </div>
    </section>
  </article>
</template>

<script>
import PedidoProdutosLista from '@/components/PedidoProdutosLista.vue'

const STATUS_MAP = {
  pendente: { className: 'pedido-view__status--pendente', icon: 'bi-clock-history' },
  'aguardando envio': { className: 'pedido-view__status--aguardando', icon: 'bi-truck' },
  enviado: { className: 'pedido-view__status--enviado', icon: 'bi-box-seam' },
  entregue: { className: 'pedido-view__status--entregue', icon: 'bi-check-circle-fill' },
  cancelado: { className: 'pedido-view__status--cancelado', icon: 'bi-x-circle-fill' },
}

export default {
  name: 'PedidoDetalhesVisualizar',
  components: { PedidoProdutosLista },
  props: {
    pedido: {
      type: Object,
      required: true,
    },
    fornecedorNome: {
      type: String,
      default: null,
    },
    confirmandoEntrega: {
      type: Boolean,
      default: false,
    },
    podeConfirmarEntrega: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['imprimir', 'confirmar-entrega'],
  computed: {
    produtos() {
      return Array.isArray(this.pedido?.produtos) ? this.pedido.produtos : []
    },
    statusMeta() {
      return STATUS_MAP[this.pedido?.status] || {
        className: 'pedido-view__status--default',
        icon: 'bi-circle',
      }
    },
  },
  methods: {
    formatarMoeda(valor) {
      return parseFloat(valor || 0).toFixed(2)
    },
    formatarData(data) {
      if (!data) return '—'
      return new Date(data).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    },
    formatarDataHora(data) {
      if (!data) return '—'
      return new Date(data).toLocaleString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    },
    formatarStatus(status) {
      if (!status) return '—'
      return status.charAt(0).toUpperCase() + status.slice(1)
    },
  },
}
</script>

<style scoped>
.pedido-view {
  animation: pedidoViewIn 0.35s ease;
}

@keyframes pedidoViewIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* hero */
.pedido-view__hero {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem;
  margin: -0.25rem -0.25rem 1.25rem;
  border-radius: 14px;
  background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 55%, #084298 100%);
  color: #fff;
  box-shadow: 0 8px 24px rgba(13, 110, 253, 0.25);
}

@media (min-width: 768px) {
  .pedido-view__hero {
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
    padding: 1.5rem 1.75rem;
  }
}

.pedido-view__hero-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.35rem;
}

.pedido-view__eyebrow {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  opacity: 0.85;
}

.pedido-view__numero {
  font-size: 1.35rem;
  font-weight: 800;
  margin: 0 0 0.35rem;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

@media (min-width: 768px) {
  .pedido-view__numero {
    font-size: 1.65rem;
  }
}

.pedido-view__descricao {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.92;
  line-height: 1.45;
  max-width: 36rem;
}

.pedido-view__status {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.28rem 0.65rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  white-space: nowrap;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.35);
}

.pedido-view__status--pendente { background: rgba(255, 193, 7, 0.35); }
.pedido-view__status--aguardando { background: rgba(13, 202, 240, 0.35); }
.pedido-view__status--enviado { background: rgba(255, 255, 255, 0.25); }
.pedido-view__status--entregue { background: rgba(25, 135, 84, 0.45); }
.pedido-view__status--cancelado { background: rgba(220, 53, 69, 0.45); }

.pedido-view__hero-aside {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-shrink: 0;
}

@media (min-width: 768px) {
  .pedido-view__hero-aside {
    flex-direction: column;
    align-items: flex-end;
    gap: 0.85rem;
  }
}

.pedido-view__total-box {
  text-align: right;
}

.pedido-view__total-label {
  display: block;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.8;
}

.pedido-view__total-valor {
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.pedido-view__btn-print {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.45);
  color: #fff;
  font-weight: 600;
  font-size: 0.85rem;
  padding: 0.45rem 0.9rem;
  border-radius: 10px;
  transition: background 0.15s ease;
}

.pedido-view__btn-print:hover {
  background: rgba(255, 255, 255, 0.28);
  color: #fff;
  border-color: rgba(255, 255, 255, 0.6);
}

/* seções */
.pedido-view__section {
  margin-bottom: 1.5rem;
}

.pedido-view__section-title {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.95rem;
  font-weight: 700;
  margin: 0 0 0.85rem;
  color: var(--app-text, #2c3e50);
}

.pedido-view__badge-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.35rem;
  height: 1.35rem;
  padding: 0 0.35rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  background: rgba(13, 110, 253, 0.12);
  color: #0d6efd;
}

/* grid de informações */
.pedido-view__info-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.65rem;
}

@media (min-width: 576px) {
  .pedido-view__info-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 992px) {
  .pedido-view__info-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }
}

.pedido-view__info-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  background: var(--card-bg, #fff);
  border: 1px solid var(--card-border, rgba(0, 0, 0, 0.08));
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.pedido-view__info-icon {
  font-size: 1.1rem;
  color: #0d6efd;
  margin-top: 0.1rem;
  flex-shrink: 0;
}

.pedido-view__info-label {
  display: block;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--muted, #6c757d);
  margin-bottom: 0.15rem;
}

.pedido-view__info-value {
  display: block;
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--app-text, #212529);
  word-break: break-word;
}

.pedido-view__info-value--truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

.pedido-view__acoes-slot {
  margin-bottom: 0.25rem;
}

/* CTA entrega */
.pedido-view__cta {
  display: flex;
  gap: 1rem;
  padding: 1.15rem 1.25rem;
  border-radius: 14px;
  margin-top: 0.5rem;
}

.pedido-view__cta--pendente {
  background: linear-gradient(135deg, rgba(13, 202, 240, 0.12), rgba(13, 110, 253, 0.08));
  border: 1px solid rgba(13, 202, 240, 0.35);
}

.pedido-view__cta--sucesso {
  background: linear-gradient(135deg, rgba(25, 135, 84, 0.12), rgba(25, 135, 84, 0.05));
  border: 1px solid rgba(25, 135, 84, 0.35);
}

.pedido-view__cta-icon {
  flex-shrink: 0;
  width: 2.75rem;
  height: 2.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 1.35rem;
}

.pedido-view__cta--pendente .pedido-view__cta-icon {
  background: rgba(13, 202, 240, 0.2);
  color: #0aa2c0;
}

.pedido-view__cta--sucesso .pedido-view__cta-icon {
  background: rgba(25, 135, 84, 0.2);
  color: #198754;
}

.pedido-view__cta-title {
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 0.35rem;
}

.pedido-view__cta-text {
  font-size: 0.88rem;
  color: var(--muted, #6c757d);
  margin: 0 0 0.85rem;
  line-height: 1.45;
}

.pedido-view__cta-btn {
  font-weight: 600;
  border-radius: 10px;
  padding: 0.55rem 1.15rem;
}

@media (max-width: 767.98px) {
  .pedido-view__cta {
    flex-direction: column;
    text-align: center;
  }

  .pedido-view__cta-icon {
    margin: 0 auto;
  }

  .pedido-view__cta-btn {
    width: 100%;
  }
}
</style>

<style>
/* tema escuro — variáveis globais do App.vue */
html.theme-dark .pedido-view__hero {
  background: linear-gradient(135deg, #1a3a5c 0%, #0f2744 100%);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
}

html.theme-dark .pedido-view__info-item {
  background: var(--card-bg);
  border-color: var(--card-border);
}
</style>
