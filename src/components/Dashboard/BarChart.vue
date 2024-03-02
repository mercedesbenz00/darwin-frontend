<script lang="ts">
import { ChartOptions } from 'chart.js'
import { Bar, mixins as chartMixins } from 'vue-chartjs'
import { mixins } from 'vue-class-component'
import { Component, Prop } from 'vue-property-decorator'

const { reactiveProp } = chartMixins

@Component({ extends: Bar, name: 'bar-chart', mixins: [reactiveProp] })
export default class BarChart extends mixins(reactiveProp, Bar) {
  // chartData prop is provided by the reactiveProp mixin
  // options prop needs to have the exact name "options"
  // for reactivity provided by vue-chartjs to work properly
  @Prop({ required: true })
  options!: ChartOptions

  mounted () {
    this.renderChart(this.chartData, this.options)
  }
}
</script>
