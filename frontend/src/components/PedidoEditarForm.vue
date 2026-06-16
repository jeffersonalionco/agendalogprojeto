<template>
  <article class="pedido-editar-form">
    <header class="pedido-editar-form__hero">
      <div>
        <span class="pedido-editar-form__eyebrow">Editar pedido</span>
        <h2 class="pedido-editar-form__numero">#{{ pedido.numero_pedido }}</h2>
        <span :class="['pedido-editar-form__status', statusMeta.className]">
          <i class="bi" :class="statusMeta.icon" aria-hidden="true"></i>
          {{ formatarStatus(pedido.status) }}
        </span>
      </div>
      <div v-if="podeEditar" class="pedido-editar-form__total">
        <span class="pedido-editar-form__total-label">Total atual</span>
        <strong>R$ {{ formatarMoeda(valorTotalExibido) }}</strong>
      </div>
    </header>

  <div v-if="!podeEditar" class="pedido-editar-form__bloqueio">
      <div class="pedido-editar-form__bloqueio-icon">
        <i class="bi bi-lock-fill" aria-hidden="true"></i>
      </div>
      <div>
        <h3 class="pedido-editar-form__bloqueio-title">Edição não disponível</h3>
        <p class="pedido-editar-form__bloqueio-text">{{ mensagemBloqueio }}</p>
      </div>
    </div>

    <form v-else class="pedido-editar-form__body" @submit.prevent="$emit('salvar')">
      <section class="pedido-editar-form__section">
        <h3 class="pedido-editar-form__section-title">
          <i class="bi bi-card-text" aria-hidden="true"></i>
          Dados do pedido
        </h3>

        <div class="pedido-editar-form__field">
          <label for="edit-fornecedor" class="pedido-editar-form__label">Fornecedor</label>
          <select
            id="edit-fornecedor"
            v-model="fornecedorSelecionado"
            class="form-select pedido-editar-form__input"
            :disabled="carregandoFornecedores"
            required
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

        <div class="pedido-editar-form__field">
          <label class="pedido-editar-form__label">Número do pedido</label>
          <input
            type="text"
            class="form-control pedido-editar-form__input"
            :value="pedido.numero_pedido"
            readonly
            disabled
          />
          <small class="pedido-editar-form__hint">Gerado automaticamente pelo sistema</small>
        </div>

        <div v-if="modoAdmin" class="pedido-editar-form__field">
          <label for="edit-status" class="pedido-editar-form__label">Status</label>
          <select
            id="edit-status"
            v-model="statusSelecionado"
            class="form-select pedido-editar-form__input"
          >
            <option value="pendente">Pendente</option>
            <option value="aguardando envio">Aguardando envio</option>
            <option value="enviado">Enviado</option>
            <option value="entregue">Entregue</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>

        <div class="pedido-editar-form__field">
          <label for="edit-descricao" class="pedido-editar-form__label">Descrição</label>
          <textarea
            id="edit-descricao"
            v-model="descricaoPedido"
            class="form-control pedido-editar-form__input"
            rows="3"
            required
            placeholder="Descreva o pedido..."
          />
        </div>
      </section>

      <section class="pedido-editar-form__section pedido-editar-form__section--produtos">
        <h3 class="pedido-editar-form__section-title">
          <i class="bi bi-box-seam" aria-hidden="true"></i>
          Produtos
        </h3>
        <SelecionarProdutos v-model="produtosLocal" />
        <div v-if="produtosLocal.length === 0" class="pedido-editar-form__alert pedido-editar-form__alert--warn">
          <i class="bi bi-exclamation-triangle" aria-hidden="true"></i>
          Adicione pelo menos um produto ao pedido.
        </div>
      </section>

      <section class="pedido-editar-form__section pedido-editar-form__total-box">
        <div class="pedido-editar-form__total-row">
          <span>Valor total do pedido</span>
          <strong>R$ {{ formatarMoeda(valorTotalCalculado) }}</strong>
        </div>
        <small class="pedido-editar-form__hint">Calculado automaticamente com base nos produtos</small>
      </section>

      <div v-if="erro" class="pedido-editar-form__alert pedido-editar-form__alert--danger" role="alert">
        {{ erro }}
      </div>

      <footer class="pedido-editar-form__actions">
        <button
          type="submit"
          class="btn btn-primary pedido-editar-form__btn-primary"
          :disabled="salvando || produtosLocal.length === 0"
        >
          <span v-if="salvando" class="spinner-border spinner-border-sm me-2" role="status"></span>
          <i v-else class="bi bi-check2-circle me-2" aria-hidden="true"></i>
          {{ salvando ? 'Salvando…' : 'Salvar alterações' }}
        </button>
        <button
          type="button"
          class="btn btn-outline-secondary pedido-editar-form__btn-secondary"
          :disabled="salvando"
          @click="$emit('cancelar')"
        >
          Cancelar
        </button>
      </footer>
    </form>
  </article>
</template>

<script>
import SelecionarProdutos from '@/components/SelecionarProdutos.vue'

const STATUS_MAP = {
  pendente: { className: 'pedido-editar-form__status--pendente', icon: 'bi-clock-history' },
  'aguardando envio': { className: 'pedido-editar-form__status--aguardando', icon: 'bi-truck' },
  enviado: { className: 'pedido-editar-form__status--enviado', icon: 'bi-box-seam' },
  entregue: { className: 'pedido-editar-form__status--entregue', icon: 'bi-check-circle-fill' },
  cancelado: { className: 'pedido-editar-form__status--cancelado', icon: 'bi-x-circle-fill' },
}

export default {
  name: 'PedidoEditarForm',
  components: { SelecionarProdutos },
  props: {
    pedido: { type: Object, required: true },
    pedidoEditando: { type: Object, required: true },
    produtosEditando: { type: Array, default: () => [] },
    fornecedores: { type: Array, default: () => [] },
    carregandoFornecedores: { type: Boolean, default: false },
    podeEditar: { type: Boolean, default: true },
    mensagemBloqueio: { type: String, default: 'Este pedido não pode ser editado.' },
    modoAdmin: { type: Boolean, default: false },
    valorTotalCalculado: { type: Number, default: 0 },
    erro: { type: String, default: '' },
    salvando: { type: Boolean, default: false },
  },
  emits: ['salvar', 'cancelar', 'update:pedidoEditando', 'update:produtosEditando'],
  computed: {
    fornecedorSelecionado: {
      get() {
        return this.pedidoEditando.id_fornecedor
      },
      set(id_fornecedor) {
        this.emitPedidoEditando({ id_fornecedor })
      },
    },
    statusSelecionado: {
      get() {
        return this.pedidoEditando.status
      },
      set(status) {
        this.emitPedidoEditando({ status })
      },
    },
    descricaoPedido: {
      get() {
        return this.pedidoEditando.descricao
      },
      set(descricao) {
        this.emitPedidoEditando({ descricao })
      },
    },
    produtosLocal: {
      get() {
        return this.produtosEditando
      },
      set(v) {
        this.$emit('update:produtosEditando', v)
      },
    },
    statusMeta() {
      return STATUS_MAP[this.pedido?.status] || { className: '', icon: 'bi-circle' }
    },
    valorTotalExibido() {
      return this.podeEditar ? this.valorTotalCalculado : this.pedido.valor
    },
  },
  methods: {
    emitPedidoEditando(partial) {
      this.$emit('update:pedidoEditando', { ...this.pedidoEditando, ...partial })
    },
    formatarMoeda(v) {
      return parseFloat(v || 0).toFixed(2)
    },
    formatarStatus(s) {
      if (!s) return '—'
      return s.charAt(0).toUpperCase() + s.slice(1)
    },
  },
}
</script>

<style scoped>
.pedido-editar-form {
  animation: pedidoEditarIn 0.35s ease;
}

@keyframes pedidoEditarIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.pedido-editar-form__hero {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem 1.35rem;
  margin: -0.25rem -0.25rem 1.25rem;
  border-radius: 14px;
  background: linear-gradient(135deg, #fd7e14 0%, #e8590c 55%, #d9480f 100%);
  color: #fff;
  box-shadow: 0 8px 24px rgba(232, 89, 12, 0.28);
}

.pedido-editar-form__eyebrow {
  display: block;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  opacity: 0.9;
}

.pedido-editar-form__numero {
  font-size: 1.4rem;
  font-weight: 800;
  margin: 0.2rem 0 0.5rem;
  line-height: 1.2;
}

.pedido-editar-form__status {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.28rem 0.65rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.35);
}

.pedido-editar-form__total {
  text-align: right;
}

.pedido-editar-form__total-label {
  display: block;
  font-size: 0.7rem;
  text-transform: uppercase;
  opacity: 0.85;
}

.pedido-editar-form__total strong {
  font-size: 1.35rem;
  font-weight: 800;
}

.pedido-editar-form__bloqueio {
  display: flex;
  gap: 1rem;
  padding: 1.25rem;
  border-radius: 14px;
  background: rgba(255, 193, 7, 0.12);
  border: 1px solid rgba(255, 193, 7, 0.45);
}

.pedido-editar-form__bloqueio-icon {
  width: 2.75rem;
  height: 2.75rem;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: rgba(255, 193, 7, 0.35);
  color: #997404;
  font-size: 1.25rem;
}

.pedido-editar-form__bloqueio-title {
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 0.35rem;
}

.pedido-editar-form__bloqueio-text {
  margin: 0;
  font-size: 0.9rem;
  color: var(--muted, #6c757d);
  line-height: 1.45;
}

.pedido-editar-form__section {
  margin-bottom: 1.35rem;
}

.pedido-editar-form__section-title {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.95rem;
  font-weight: 700;
  margin: 0 0 1rem;
  color: var(--app-text, #2c3e50);
}

.pedido-editar-form__field {
  margin-bottom: 1rem;
}

.pedido-editar-form__label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 0.35rem;
  color: var(--app-text, #212529);
}

.pedido-editar-form__input {
  border-radius: 10px;
  min-height: 44px;
}

.pedido-editar-form__hint {
  display: block;
  margin-top: 0.35rem;
  font-size: 0.78rem;
  color: var(--muted, #6c757d);
}

.pedido-editar-form__section--produtos {
  padding: 1rem;
  border-radius: 14px;
  background: var(--card-bg, #fff);
  border: 1px solid var(--card-border, rgba(0, 0, 0, 0.08));
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.pedido-editar-form__total-box {
  padding: 1rem 1.15rem;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(13, 110, 253, 0.08), rgba(13, 110, 253, 0.03));
  border: 1px solid rgba(13, 110, 253, 0.2);
}

.pedido-editar-form__total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.95rem;
}

.pedido-editar-form__total-row strong {
  font-size: 1.25rem;
  color: #0d6efd;
}

.pedido-editar-form__alert {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.85rem 1rem;
  border-radius: 10px;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.pedido-editar-form__alert--warn {
  background: rgba(255, 193, 7, 0.15);
  border: 1px solid rgba(255, 193, 7, 0.4);
  color: #664d03;
}

.pedido-editar-form__alert--danger {
  background: rgba(220, 53, 69, 0.1);
  border: 1px solid rgba(220, 53, 69, 0.35);
  color: #842029;
}

.pedido-editar-form__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  padding-top: 0.5rem;
}

.pedido-editar-form__btn-primary {
  font-weight: 600;
  border-radius: 10px;
  min-height: 48px;
  flex: 1 1 auto;
}

.pedido-editar-form__btn-secondary {
  font-weight: 600;
  border-radius: 10px;
  min-height: 48px;
}

@media (max-width: 767.98px) {
  .pedido-editar-form__hero {
    flex-direction: column;
  }

  .pedido-editar-form__total {
    text-align: left;
    width: 100%;
    padding-top: 0.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.25);
  }

  .pedido-editar-form__bloqueio {
    flex-direction: column;
    text-align: center;
  }

  .pedido-editar-form__bloqueio-icon {
    margin: 0 auto;
  }

  .pedido-editar-form__actions {
    flex-direction: column;
  }

  .pedido-editar-form__btn-primary,
  .pedido-editar-form__btn-secondary {
    width: 100%;
  }
}
</style>
