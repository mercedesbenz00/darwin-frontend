import { Component, Prop, Vue } from 'vue-property-decorator'

import { TrainingSessionPayload } from '@/store/types'
/**
 * Loads metrics for a given TrainingSession
 *
 * Renderless component
 */
@Component({ name: 'metric-loader' })
export default class MetricLoader extends Vue {
  @Prop({ required: true, type: Object as () => TrainingSessionPayload })
  trainingSession!: TrainingSessionPayload

  mounted () {
    this.loadMetrics()
  }

  async loadMetrics () {
    const { trainingSession } = this

    const { error } = await this.$store.dispatch('neuralModel/getMetrics', trainingSession)
    if (error) { this.$store.dispatch('toast/warning', { content: error.message }) }
  }

  render () {
    return null
  }
}
