import { Vue, Component, Watch } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { RootState, TeamPayload } from '@/store/types'

/**
 * In charge of loading classes for the current team.
 *
 * It should load team annotation classes on mount, as well as when the current
 * team changes.
 *
 * The selectTeam action is in charge of resetting the store, so this component
 * does not have to unload previous classes.
 */
@Component({ name: 'class-loader' })
export default class ClassLoader extends Vue {
  @State((state: RootState) => state.team.currentTeam)
  team!: TeamPayload

  mounted (): void {
    this.loadClasses()
  }

  @Watch('team')
  onTeam (): void {
    this.loadClasses()
  }

  @State((state: RootState) => state.workview.tutorialMode)
  isTutorial!: boolean

  @Watch('isTutorial')
  onTutorial () {
    this.loadClasses()
  }

  loadClasses (): void {
    if (!this.team) { return }
    this.$store.dispatch('aclass/loadTeamAnnotationClasses', { teamSlug: this.team.slug })
  }

  render () {
    return null
  }
}
