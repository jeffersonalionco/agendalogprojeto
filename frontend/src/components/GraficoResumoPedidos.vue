<template>
  <div class="card border-0 shadow-sm rounded-3" :class="{ 'grafico-resumo--cliente': estiloCliente }">
    <div class="card-header bg-white border-bottom py-3">
      <h5 class="mb-0 grafico-resumo__titulo">{{ titulo }}</h5>
      <small class="text-muted grafico-resumo__sub">{{ subtitulo }}</small>
    </div>
    <div class="card-body">
      <div v-if="carregando" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Carregando gráfico...</span>
        </div>
      </div>
      <div
        v-else
        class="row"
        :class="estiloCliente ? 'g-3 g-lg-4 align-items-stretch align-items-lg-center' : 'align-items-center g-3'"
      >
        <div class="col-12" :class="estiloCliente ? 'col-lg-7 grafico-resumo__chart-col' : 'col-lg-7'">
          <div class="chart-shell">
            <canvas ref="chartCanvas" aria-label="Gráfico de pedidos por status"></canvas>
          </div>
        </div>
        <div class="col-12" :class="estiloCliente ? 'col-lg-5 grafico-resumo__lista-col' : 'col-lg-5'">
          <ul class="list-unstyled mb-0 resumo-lista">
            <li class="d-flex justify-content-between align-items-center py-2 border-bottom">
              <span><span class="legend-dot bg-warning"></span> Pendente</span>
              <strong>{{ contagens.pendente }}</strong>
            </li>
            <li class="d-flex justify-content-between align-items-center py-2 border-bottom">
              <span><span class="legend-dot bg-info"></span> Aguardando / em trânsito</span>
              <strong>{{ contagens.aguardando }}</strong>
            </li>
            <li class="d-flex justify-content-between align-items-center py-2">
              <span><span class="legend-dot bg-success"></span> Entregue</span>
              <strong>{{ contagens.entregue }}</strong>
            </li>
          </ul>
          <p v-if="totalContados === 0" class="text-muted small mt-2 mb-0">
            Nenhum pedido nestas categorias ainda.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

/** Mesma regra do backend pedidosController.resumoStatus */
function contagensFromPedidos(pedidos) {
  let pendente = 0
  let aguardando = 0
  let entregue = 0
  for (const p of pedidos) {
    const s = p.status
    if (s === 'pendente') pendente++
    else if (s === 'aguardando envio' || s === 'enviado') aguardando++
    else if (s === 'entregue') entregue++
  }
  return { pendente, aguardando, entregue }
}

export default {
  name: 'GraficoResumoPedidos',
  props: {
    pedidos: {
      type: Array,
      default: () => []
    },
    carregando: {
      type: Boolean,
      default: false
    },
    titulo: {
      type: String,
      default: 'Resumo dos seus pedidos'
    },
    subtitulo: {
      type: String,
      default: 'Pendente, aguardando envio / em trânsito e entregues'
    },
    /** layout e proporções pensados para a home do cliente */
    estiloCliente: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      chart: null
    }
  },
  computed: {
    contagens() {
      return contagensFromPedidos(this.pedidos)
    },
    totalContados() {
      const c = this.contagens
      return c.pendente + c.aguardando + c.entregue
    }
  },
  watch: {
    carregando(val) {
      // com v-if no canvas, ao carregar o spinner o canvas some precisa destruir o Chart
      if (val) {
        this.destroyChart()
      } else {
        this.$nextTick(() => this.ensureChart())
      }
    },
    pedidos: {
      deep: true,
      handler() {
        this.$nextTick(() => this.updateChartData())
      }
    }
  },
  mounted() {
    this._onResize = () => this.safeChartResize()
    window.addEventListener('resize', this._onResize)
    this.$nextTick(() => this.ensureChart())
  },
  beforeUnmount() {
    this.destroyChart()
    window.removeEventListener('resize', this._onResize)
  },
  methods: {
    chartDomOk(chart) {
      const el = chart?.canvas
      return !!(el && el.ownerDocument && el.isConnected)
    },
    safeChartResize() {
      if (!this.chart || !this.chartDomOk(this.chart)) {
        if (this.chart) this.destroyChart()
        return
      }
      try {
        this.chart.resize()
      } catch {
        this.destroyChart()
      }
    },
    destroyChart() {
      if (!this.chart) return
      try {
        this.chart.destroy()
      } catch {
        /* canvas já removido ou instância nválida já */
      }
      this.chart = null
    },
    ensureChart() {
      if (this.carregando) return
      const canvas = this.$refs.chartCanvas
      if (!canvas) return

      if (this.chart && !this.chartDomOk(this.chart)) {
        this.destroyChart()
      }

      // instância antiga ligada a outro canvas)
      if (this.chart && this.chart.canvas !== canvas) {
        this.destroyChart()
      }

      if (this.chart) {
        this.updateChartData()
        return
      }

      const ctx = canvas.getContext('2d')
      const c = this.contagens

      this.chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Pendente', 'Aguardando / em trânsito', 'Entregue'],
          datasets: [
            {
              data: [c.pendente, c.aguardando, c.entregue],
              backgroundColor: ['#ffc107', '#0dcaf0', '#198754'],
              borderWidth: 2,
              borderColor: '#fff'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label(ctx) {
                  const v = ctx.raw ?? 0
                  const sum = ctx.dataset.data.reduce((a, b) => a + b, 0)
                  const pct = sum ? Math.round((v / sum) * 100) : 0
                  return ` ${v} (${pct}%)`
                }
              }
            }
          },
          layout: {
            padding: 8
          }
        }
      })
    },
    updateChartData() {
      if (this.carregando) return
      const canvas = this.$refs.chartCanvas
      if (!canvas) {
        this.destroyChart()
        return
      }
      if (!this.chart) {
        this.ensureChart()
        return
      }
      if (!this.chartDomOk(this.chart) || this.chart.canvas !== canvas) {
        this.destroyChart()
        this.ensureChart()
        return
      }
      const c = this.contagens
      try {
        this.chart.data.datasets[0].data = [c.pendente, c.aguardando, c.entregue]
        this.chart.update('none')
      } catch {
        this.destroyChart()
        this.$nextTick(() => this.ensureChart())
      }
    }
  }
}
</script>

<style scoped>
.grafico-resumo__titulo {
  color: var(--bs-primary, #0d6efd);
}

.grafico-resumo--cliente .grafico-resumo__titulo {
  color: var(--hc-primary, var(--bs-primary, #0d6efd));
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.grafico-resumo--cliente .grafico-resumo__sub {
  display: block;
  margin-top: 0.25rem;
  line-height: 1.35;
  font-size: 0.8rem;
}

.grafico-resumo--cliente {
  border-radius: 12px;
  background: var(--hc-card, #fff);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.07);
}

.grafico-resumo--cliente .card-header {
  padding: 1rem 1.1rem;
  background: linear-gradient(180deg, rgba(0, 102, 255, 0.06) 0%, transparent 100%);
  border-bottom-color: rgba(0, 0, 0, 0.06) !important;
}

.grafico-resumo--cliente .card-body {
  padding: 1rem 1.1rem 1.2rem;
}

.chart-shell {
  position: relative;
  width: 100%;
  min-height: 220px;
  max-height: 320px;
}

/* mesma largura útil do fornecedo   área do gráfico em 100% da coluna */
.grafico-resumo--cliente .chart-shell {
  width: 100%;
  max-width: 100%;
  min-height: 220px;
  max-height: min(72vw, 380px);
  margin-left: 0;
  margin-right: 0;
  aspect-ratio: 1;
  height: auto;
}

@media (min-width: 992px) {
  .grafico-resumo--cliente .grafico-resumo__chart-col {
    display: flex;
    align-items: center;
    justify-content: stretch;
  }

  .grafico-resumo--cliente .chart-shell {
    width: 100%;
    max-width: 100%;
    min-height: 260px;
    max-height: 340px;
    height: 280px;
    aspect-ratio: auto;
  }
}

.grafico-resumo--cliente .grafico-resumo__lista-col {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

@media (max-width: 991px) {
  .grafico-resumo--cliente .grafico-resumo__lista-col {
    padding-top: 0.75rem;
    margin-top: 0.25rem;
    border-top: 1px solid rgba(0, 0, 0, 0.07);
  }

  .grafico-resumo--cliente .resumo-lista {
    width: 100%;
    max-width: none;
  }
}

@media (min-width: 992px) {
  .card:not(.grafico-resumo--cliente) .chart-shell {
    min-height: 260px;
    max-height: 340px;
  }
}

.legend-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 0.5rem;
  vertical-align: middle;
}

.resumo-lista {
  font-size: 0.95rem;
}
</style>
