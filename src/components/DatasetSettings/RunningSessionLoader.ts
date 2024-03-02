import { Component, Vue } from 'vue-property-decorator'

@Component({ name: 'running-session-loader' })
export default class RunningSessionLoader extends Vue {
  mounted (): void {
    this.$store.dispatch('neuralModel/loadRunningSessions')
  }

  render (): null {
    return null
  }
}
