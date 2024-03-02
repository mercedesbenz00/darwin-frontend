import { Component, Vue } from 'vue-property-decorator'

@Component({ name: 'trained-models-loader' })
export default class TrainedModelsLoader extends Vue {
  async mounted (): Promise<void> {
    await this.$store.dispatch('neuralModel/loadTrainedModels')
  }

  render (): null {
    return null
  }
}
