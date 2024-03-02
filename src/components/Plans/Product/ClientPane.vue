<template>
  <div class="client-pane">
    <header-3>Your Annotation plan is managed by {{ partnerName }}</header-3>
    <paragraph-14>
      You can take over billing for this plan anytime.
      This will allow you to view your usage, storage, and select a different plan.
      Some automation features may be locked by {{ partnerName }}.
    </paragraph-14>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import Header3 from '@/components/Common/Header3.vue'
import Paragraph14 from '@/components/Common/Paragraph14.vue'
import { RootState, TeamPayload } from '@/store/types'

@Component({
  name: 'client-pane',
  components: {
    Header3,
    Paragraph14
  }
})
export default class ClientPane extends Vue {
  @State((state: RootState) => state.team.currentTeam)
  currentTeam!: TeamPayload

  get partnerName (): string {
    const { currentTeam } = this
    if (!currentTeam.partner) { throw new Error('Trying to render client UI for non-client team') }
    return currentTeam.partner.name
  }
}
</script>

<style lang="scss" scoped>
.client-pane {
  @include col--center;
  row-gap: 20px;
  min-height: 300px;
  text-align: center;

  > * {
    max-width: 620px;
  }
}
</style>
