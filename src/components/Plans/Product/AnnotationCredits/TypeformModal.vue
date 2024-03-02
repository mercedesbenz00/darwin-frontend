<template>
  <modal
    name="typeform-modal"
    width="500"
    height="700"
    :adaptive="true"
    :classes="['typeform-modal']"
    :click-to-close="false"
    :focus-trap="true"
    @opened="onOpened"
  >
    <div
      ref="containerRef"
      class="typeform-modal__content"
    />
  </modal>
</template>

<script lang="ts">
import { createWidget } from '@typeform/embed'
import { Component, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'
import '@typeform/embed/build/css/widget.css'

import { UserPayload, TeamPayload, RootState } from '@/store/types'

@Component({ name: 'typeform-modal' })
export default class TypeformModal extends Vue {
  @State((state: RootState) => state.user.profile)
  user!: UserPayload

  @State((state: RootState) => state.team.currentTeam)
  team!: TeamPayload

  $refs!: {
    containerRef: HTMLDivElement
  }

  onOpened () {
    createWidget(
      'DlPVoKrd',
      {
        container: this.$refs.containerRef,
        onSubmit: () => {
          this.$modal.hide('typeform-modal')
          this.$emit('submit')
        },
        hidden: {
          team_id: this.team.id.toString(),
          user_id: this.user.id.toString(),
          team_slug: this.team.slug
        }
      }
    )
  }
}
</script>

<style lang="scss" scoped>
.typeform-modal__content {
  width: 100%;
  height: 100%;
}
</style>
