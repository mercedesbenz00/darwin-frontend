import { Vue, Component, Prop } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { RootState, TeamPayload } from '@/store/types'

/**
 * Load neural models each time the workview dataset is reset
 */
@Component({ name: 'dataset-attribute-loader' })
export default class DatasetAttributeLoader extends Vue {
  @Prop({ type: Boolean, default: false })
  openWorkMode!: boolean

  @State((state: RootState) => state.team.currentTeam)
  currentTeam!: TeamPayload | null

  mounted (): void {
    if (this.openWorkMode) {
      const { teamSlug } = this.$route.params
      this.$store.dispatch('aclass/loadDatasetAnnotationAttributes', { teamSlug })
    } else if (this.currentTeam) {
      this.$store.dispatch('aclass/loadDatasetAnnotationAttributes', {
        teamSlug: this.currentTeam.slug
      })
    }
  }

  render (): null {
    return null
  }
}
