<script lang="ts">
import Chart, { ChartOptions } from 'chart.js'
import { Line, generateChart, mixins as chartMixins } from 'vue-chartjs'
import { mixins } from 'vue-class-component'
import { Component, Prop, Watch } from 'vue-property-decorator'

const { reactiveProp } = chartMixins

Chart.controllers.GradientLine = Chart.controllers.line.extend({
  update () {
    Chart.controllers.line.prototype.update.apply(this, arguments)
    const meta = this.getMeta()
    const colorSetting = meta.dataset._model.backgroundColor
    if (colorSetting.gradient) {
      const ctx = this.chart.chart.ctx as CanvasRenderingContext2D
      const gradient =
        ctx.createLinearGradient(ctx.canvas.width / 2, 0, ctx.canvas.width / 2, ctx.canvas.height)
      Object.entries<string>(colorSetting.gradient)
        .forEach(([stop, color]) => gradient.addColorStop(parseFloat(stop), color))
      meta.dataset._model.backgroundColor = gradient
    }
  }
})

const GradientLineChart = generateChart('gradient-line', 'GradientLine')

@Component({ extends: GradientLineChart, name: 'line-chart', mixins: [reactiveProp] })
export default class AnnotationChart extends mixins(reactiveProp, Line) {
  // chartData prop is provided by the reactiveProp mixin
  // options prop needs to have the exact name "options"
  // for reactivity provided by vue-chartjs to work properly
  @Prop({ required: true })
  options!: ChartOptions

  @Watch('options')
  onOptions (): void {
    this.renderChart(this.chartData, this.options)
  }

  mounted (): void {
    this.renderChart(this.chartData, this.options)
  }
}
</script>

<style lang="scss" scoped>

</style>
