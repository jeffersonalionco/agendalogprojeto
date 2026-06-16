<template>
  <Teleport to="body">
    <div
      v-if="pedido"
      class="pedido-admin-modal"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="titleId"
      @click.self="$emit('fechar')"
    >
      <div class="pedido-admin-modal__sheet">
        <header class="pedido-admin-modal__header">
          <div>
            <span class="pedido-admin-modal__eyebrow">Editar pedido (admin)</span>
            <h2 :id="titleId" class="pedido-admin-modal__title">#{{ pedido.numero_pedido }}</h2>
          </div>
          <button type="button" class="pedido-admin-modal__close" aria-label="Fechar" @click="$emit('fechar')">
            <i class="bi bi-x-lg" aria-hidden="true"></i>
          </button>
        </header>

        <form class="pedido-admin-modal__body" @submit.prevent="$emit('salvar')">
          <div class="pedido-admin-modal__field">
            <label for="admin-edit-status" class="pedido-admin-modal__label">Status</label>
            <select id="admin-edit-status" v-model="localPedido.status" class="form-select">
              <option value="pendente">Pendente</option>
              <option value="aguardando envio">Aguardando envio</option>
              <option value="enviado">Enviado</option>
              <option value="entregue">Entregue</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          <div class="pedido-admin-modal__field">
            <label for="admin-edit-descricao" class="pedido-admin-modal__label">Descrição</label>
            <textarea
              id="admin-edit-descricao"
              v-model="localPedido.descricao"
              class="form-control"
              rows="3"
            />
          </div>

          <div class="pedido-admin-modal__field">
            <label for="admin-edit-valor" class="pedido-admin-modal__label">Valor (R$)</label>
            <input
              id="admin-edit-valor"
              v-model.number="localPedido.valor"
              type="number"
              step="0.01"
              min="0"
              class="form-control"
            />
          </div>

          <p class="pedido-admin-modal__info">
            <i class="bi bi-info-circle" aria-hidden="true"></i>
            Para editar produtos do pedido, use a aba <strong>Pedidos</strong> no menu.
          </p>

          <div v-if="erro" class="alert alert-danger" role="alert">{{ erro }}</div>

          <footer class="pedido-admin-modal__footer">
            <button type="button" class="btn btn-outline-secondary" :disabled="salvando" @click="$emit('fechar')">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary" :disabled="salvando">
              <span v-if="salvando" class="spinner-border spinner-border-sm me-2" role="status"></span>
              {{ salvando ? 'Salvando…' : 'Salvar' }}
            </button>
          </footer>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script>
export default {
  name: 'PedidoEditarAdminModal',
  props: {
    pedido: { type: Object, default: null },
    erro: { type: String, default: '' },
    salvando: { type: Boolean, default: false },
  },
  emits: ['fechar', 'salvar', 'update:pedido'],
  data() {
    return {
      titleId: `pedido-admin-modal-${Math.random().toString(36).slice(2, 9)}`,
      localPedido: {},
    }
  },
  watch: {
    pedido: {
      handler(p) {
        this.localPedido = p ? { ...p } : {}
      },
      immediate: true,
      deep: true,
    },
    localPedido: {
      handler(v) {
        if (this.pedido) this.$emit('update:pedido', { ...v })
      },
      deep: true,
    },
  },
}
</script>

<style scoped>
.pedido-admin-modal {
  position: fixed;
  inset: 0;
  z-index: 1050;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0;
}

@media (min-width: 576px) {
  .pedido-admin-modal {
    align-items: center;
    padding: 1rem;
  }
}

.pedido-admin-modal__sheet {
  width: 100%;
  max-width: 480px;
  max-height: 92vh;
  overflow-y: auto;
  background: var(--card-bg, #fff);
  border-radius: 16px 16px 0 0;
  box-shadow: 0 -8px 40px rgba(0, 0, 0, 0.2);
  -webkit-overflow-scrolling: touch;
}

@media (min-width: 576px) {
  .pedido-admin-modal__sheet {
    border-radius: 16px;
  }
}

.pedido-admin-modal__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.15rem 1.25rem;
  background: linear-gradient(135deg, #dc3545, #b02a37);
  color: #fff;
}

.pedido-admin-modal__eyebrow {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  opacity: 0.9;
}

.pedido-admin-modal__title {
  font-size: 1.25rem;
  font-weight: 800;
  margin: 0.25rem 0 0;
}

.pedido-admin-modal__close {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.pedido-admin-modal__body {
  padding: 1.25rem;
  text-align: left;
}

.pedido-admin-modal__field {
  margin-bottom: 1rem;
}

.pedido-admin-modal__label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 0.35rem;
}

.pedido-admin-modal__info {
  font-size: 0.85rem;
  color: var(--muted, #6c757d);
  padding: 0.75rem;
  background: rgba(13, 202, 240, 0.1);
  border-radius: 10px;
  margin-bottom: 1rem;
}

.pedido-admin-modal__footer {
  display: flex;
  flex-direction: column-reverse;
  gap: 0.5rem;
  padding-top: 0.5rem;
}

@media (min-width: 576px) {
  .pedido-admin-modal__footer {
    flex-direction: row;
    justify-content: flex-end;
  }
}

.pedido-admin-modal__footer .btn {
  min-height: 44px;
  font-weight: 600;
  border-radius: 10px;
}

@media (max-width: 575.98px) {
  .pedido-admin-modal__footer .btn {
    width: 100%;
  }
}
</style>
