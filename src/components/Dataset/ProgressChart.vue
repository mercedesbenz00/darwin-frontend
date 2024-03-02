<script>
import { Doughnut } from 'vue-chartjs'

const chartOptions = {
  responsive: true,
  cutoutPercentage: 80,
  rotation: -0.5 * Math.PI,
  legend: { display: false }
}

/**
 * Computes data for the chart. The only variable are the percentages that
 * go into the data property of the first and only dataset.
 *
 * Everything else is constant.
 *
 * @param {Array[string]} percentages A list of integers to show on the chart.
 */
const buildChartData = (percentages) => ({
  datasets: [
    {
      data: percentages,
      backgroundColor: ['#CBD1DE', '#FFD600', '#31F5CA'],
      borderWidth: 0
    }
  ],
  labels: ['Open', 'In Progress', 'Completed']
})

export default {
  name: 'ProgressChart',
  extends: Doughnut,
  props: {
    percentages: {
      type: Array,
      default: () => []
    }
  },
  watch: {
    /**
     * Re-render chart when percentages change
     *
     * Since the chart goes through an animation while rendering, and it's not
     * an instant ation, we need to make sure the new percentages are valid and
     * we need to make sure they are in fact different from old percentages.
     *
     * The `vue-chartjs` docs claim we could call `this.$data._chart.update()`
     * instead of re-rendering, but this does not seem to be working here.
     */
    percentages (newValue, oldValue) {
      if (!newValue) { return }
      if (oldValue && newValue.join(',') === oldValue.join(',')) { return }

      const chartData = buildChartData(newValue)
      this.renderChart(chartData, chartOptions)
    }
  },

  /**
   * During mount, if the percentages are already loaded, we can immediately
   * perform a render.
   */
  mounted () {
    if (!this.percentages) { return }

    const chartData = buildChartData(this.percentages)
    this.renderChart(chartData, chartOptions)
  }
}
</script>
