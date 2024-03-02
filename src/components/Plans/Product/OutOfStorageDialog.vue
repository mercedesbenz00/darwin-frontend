<template>
  <modal
    :name="dialogName"
    transition="pop-out"
    width="40%"
    height="auto"
    :classes="['plan-expired-modal']"
    :click-to-close="false"
  >
    <confirmation-dialog-layout>
      <template #title>
        Upgrade your plan to manage more data
      </template>
      <template #description>
        You are using the full capacity allowed by your plan. You won't be able
        to start new file workflows until you upgrade your plan. This only takes
        a few seconds.
      </template>
      <template #footer>
        <secondary-button @click="close">
          Close
        </secondary-button>
        <primary-button
          tag="router-link"
          :to="plansLocation"
        >
          UPGRADE
        </primary-button>
      </template>
    </confirmation-dialog-layout>
  </modal>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { Location } from 'vue-router'
import { State } from 'vuex-class'

import ConfirmationDialogLayout from '@/components/Common/ConfirmationDialogLayout.vue'
import { RootState } from '@/store/types'

@Component({ name: 'out-of-storage-dialog', components: { ConfirmationDialogLayout } })
export default class OutOfStorageDialog extends Vue {
  close () {
    this.$store.commit('billing/HIDE_OUT_OF_STORAGE_DIALOG')
  }

  get plansLocation (): Location {
    const { name, params, query } = this.$route
    if (name === 'Workflow') {
      return {
        name: 'DatasetsIndex',
        query: { settings: 'plans' }
      }
    }
    return {
      name: name || undefined,
      params,
      query: { ...query, settings: 'plans' }
    }
  }

  readonly dialogName = 'out-of-storage-modal'

  @State((state: RootState) => state.billing.outOfStorageDialogShown)

  dialogShown!: boolean

  @Watch('dialogShown', { immediate: true })
  onDialogChange (shown: boolean) {
    if (shown) {
      this.$modal.show(this.dialogName)
    } else {
      this.$modal.hide(this.dialogName)
    }
  }
}
</script>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.plan-expired-modal {
  @include confirmation-dialog-modal;
}
</style>
