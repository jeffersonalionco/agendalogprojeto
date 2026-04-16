// esse arquivo aqui e um composable pra mexer nas notificacoes do sistema, bem na mao msm

import { shallowRef } from 'vue'

const DURACAO_PADRAO_MS = 4500
const DURACAO_ERRO_MS = 6000
const MAX_NOTIFICACOES = 5

// definindo o tipo de notificacao pro typescript (eu sempre esqueço isso kkk)
/** @typedef {'sucesso'|'erro'|'aviso'|'informacao'|'primario'} VarianteNotificacao */

let sequenciaId = 0 // variavel pra ir gerando id das notificacao

/** estado compartihado pra todo mundo que chama usarNotificacoes */
const notificacoes = shallowRef([]) // estado das notificacao memo

/** @type {Map<number, ReturnType<typeof setTimeout>>} */
const temporizadores = new Map() // mapinha dos timers das notificacao

function limparTemporizador(id) {
  const t = temporizadores.get(id)
  if (t) {
    clearTimeout(t)
    temporizadores.delete(id) // tirei o timer da notificacao daqui
  }
}

// paramzinhos do adicionar, deixei em jsdoc pra nao ficar perdido depois
/**
 * @param {object} opcoes
 * @param {VarianteNotificacao} opcoes.variante
 * @param {string} opcoes.mensagem
 * @param {string} [opcoes.titulo]
 * @param {number} [opcoes.duracaoMs] 0 = nao fecha sozinho
 */




function adicionar({
  variante,
  mensagem,
  titulo = '',
  duracaoMs = DURACAO_PADRAO_MS,
}) {
  const id = ++sequenciaId // gero o id da notificacao aqui
  const item = { id, variante, mensagem, titulo }

  const proxima = [...notificacoes.value, item]
  if (proxima.length > MAX_NOTIFICACOES) {
    proxima
      .slice(0, proxima.length - MAX_NOTIFICACOES)
      .forEach((n) => limparTemporizador(n.id))
  }
  notificacoes.value = proxima.slice(-MAX_NOTIFICACOES)

  if (duracaoMs > 0) {
    const timer = setTimeout(() => remover(id), duracaoMs)
    temporizadores.set(id, timer)
  }

  return id
}

function remover(id) {
  limparTemporizador(id)
  notificacoes.value = notificacoes.value.filter((n) => n.id !== id)
}

function limpar() {
  notificacoes.value.forEach((n) => limparTemporizador(n.id))
  notificacoes.value = []
}

function montarArgumentos(
  mensagem,
  opcoes,
  variante,
  duracaoPadraoMs = DURACAO_PADRAO_MS
) {
  return {
    variante,
    mensagem,
    titulo: opcoes.titulo,
    duracaoMs:
      opcoes.duracaoMs !== undefined ? opcoes.duracaoMs : duracaoPadraoMs,
  }
}


export function usarNotificacoes() {
  return {
    notificacoes,
    adicionar,
    remover,
    limpar,
    sucesso: (mensagem, opcoes = {}) =>
      adicionar(montarArgumentos(mensagem, opcoes, 'sucesso')),
    erro: (mensagem, opcoes = {}) =>
      adicionar(montarArgumentos(mensagem, opcoes, 'erro', DURACAO_ERRO_MS)),
    aviso: (mensagem, opcoes = {}) =>
      adicionar(montarArgumentos(mensagem, opcoes, 'aviso')),
    informacao: (mensagem, opcoes = {}) =>
      adicionar(montarArgumentos(mensagem, opcoes, 'informacao')),
  }
}
