// esse componente aqui so mostra as notificacoes do sistema, tipo um toast bem simples

<template>
  <Teleport to="body">
    <div
      class="app-notificacoes"
      role="region"
      aria-label="Notificações"
      :aria-live="usarAriaAssertivo ? 'assertive' : 'polite'"
      aria-relevant="additions text"
    >
      <TransitionGroup
        name="app-notificacao"
        tag="div"
        class="app-notificacoes__pilha"
      >
        <div
          v-for="notificacao in notificacoes"
          :key="notificacao.id"
          :class="[
            'alert',
            'shadow-sm',
            'app-notificacoes__item',
            classeAlerta(notificacao.variante),
          ]"
          role="alert"
        >
          <div class="app-notificacoes__corpo">
            <strong v-if="notificacao.titulo" class="d-block">{{
              notificacao.titulo
            }}</strong>
            <span class="app-notificacoes__texto">{{ notificacao.mensagem }}</span>
          </div>
          <button
            type="button"
            class="btn-close app-notificacoes__fechar"
            aria-label="Fechar notificação"
            @click="remover(notificacao.id)"
          />
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script>
import { computed } from 'vue'
import { usarNotificacoes } from '@/composables/usarNotificacoes.js'

const CLASSE_ALERTA_POR_VARIANTE = {
  sucesso: 'alert-success',
  erro: 'alert-danger',
  aviso: 'alert-warning',
  informacao: 'alert-info',
  primario: 'alert-primary',
}

export default {
  name: 'ContainerNotificacoes',
  setup() {
    const { notificacoes, remover } = usarNotificacoes()

    const usarAriaAssertivo = computed(() =>
    // esse computed fica de olho no shallowRef e ai eu marco como assertive qndo for erro/aviso
      notificacoes.value.some(
        (n) => n.variante === 'erro' || n.variante === 'aviso'
      )
    ) 

    function classeAlerta(variante) {
      return CLASSE_ALERTA_POR_VARIANTE[variante] || 'alert-secondary'
    }

    return { notificacoes, remover, usarAriaAssertivo, classeAlerta }
  },
}
</script>

<style scoped>
.app-notificacoes {
  position: fixed;
  top: 1rem;
  right: 1rem;
  left: auto;
  z-index: 1080;
  max-width: min(420px, calc(100vw - 2rem));
  pointer-events: none;
}

.app-notificacoes__pilha {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-end;
}

.app-notificacoes__item {
  pointer-events: auto;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin: 0;
  width: 100%;
  text-align: left;
}

.app-notificacoes__corpo {
  flex: 1;
  min-width: 0;
}

.app-notificacoes__texto {
  word-break: break-word;
}

.app-notificacoes__fechar {
  flex-shrink: 0;
  margin-top: 0.15rem;
}

.app-notificacao-enter-active,
.app-notificacao-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.app-notificacao-enter-from {
  opacity: 0;
  transform: translateX(0.75rem);
}

.app-notificacao-leave-to {
  opacity: 0;
  transform: translateY(-0.35rem);
}

.app-notificacao-move {
  transition: transform 0.2s ease;
}
</style>
