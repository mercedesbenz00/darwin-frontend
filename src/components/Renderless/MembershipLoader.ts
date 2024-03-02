import { Vue, Component, Watch } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { RootState, TeamPayload } from '@/store/types'

@Component({ name: 'membership-loader' })
export default class MembershipLoader extends Vue {
  mounted (): void {
    this.loadMemberships()
  }

  @State((state: RootState) => state.team.currentTeam)
  team!: TeamPayload

  @Watch('team')
  loadMemberships (): void {
    if (!this.team) { return }
    this.$store.dispatch('team/getMemberships')
    this.$store.dispatch('team/getPartnerMemberships')
  }

  render (): null {
    return null
  }
}
