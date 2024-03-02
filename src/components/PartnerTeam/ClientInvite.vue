<template>
  <form
    class="client-invite"
    @submit.prevent.stop="createInvite"
  >
    <header-3>Partner Features</header-3>
    <header-4>Invite a customer team</header-4>
    <paragraph-14 class="client-invite__detail">
      Generate a team invite for a customer so they may create their workspace
      on V7. This allows them to keep legal ownership of their data, make use
      of the API, and get technical support from V7. You will automatically
      become an admin of this new team, and their datasets will show up within
      this team's dataset view to yourself or any workforce manager added to them.
    </paragraph-14>
    <div class="client-invite__email">
      <input-field
        v-model="email"
        label="Invitee Email"
        :error="errors.email"
      />
      <positive-button>
        Send
      </positive-button>
    </div>
    <div class="client-invite__neural-networks">
      <check-box
        v-model="neuralNetworks"
        label="Cover this team's usage of neural networks"
      />
      <client-invite-info />
    </div>
    <client-invite-note class="client-invite__note" />
  </form>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import CheckBox from '@/components/Common/CheckBox/V1/CheckBox.vue'
import Header3 from '@/components/Common/Header3.vue'
import Header4 from '@/components/Common/Header4.vue'
import InputField from '@/components/Common/InputField/V1/InputField.vue'
import Paragraph14 from '@/components/Common/Paragraph14.vue'
import { createClientTeamInvitation } from '@/store/modules/team/actions/createClientTeamInvitation'
import { StoreActionPayload, ValidationError } from '@/store/types'

import ClientInviteInfo from './ClientInviteInfo.vue'
import ClientInviteNote from './ClientInviteNote.vue'

@Component({
  name: 'client-invite',
  components: {
    CheckBox,
    ClientInviteInfo,
    ClientInviteNote,
    Header3,
    Header4,
    InputField,
    Paragraph14
  }
})
export default class ClientInvite extends Vue {
  email: string = ''
  neuralNetworks: boolean = true

  errors: ValidationError = {}

  async createInvite (): Promise<void> {
    this.errors = {}
    const { email, neuralNetworks } = this

    const payload: StoreActionPayload<typeof createClientTeamInvitation> = {
      email,
      neuralNetworks
    }

    const response = await this.$store.dispatch('team/createClientTeamInvitation', payload)
    if ('error' in response) {
      if (response.error.isValidationError) {
        this.errors = response.error
      }
      this.$store.dispatch('toast/warning', { content: response.error.message })
      return
    }

    this.email = ''
  }
}
</script>

<style lang="scss" scoped>
.client-invite {
  @include col;
  row-gap: 15px;
}

.client-invite__detail {
  max-width: 608px;
}

.client-invite__email {
  display: grid;
  grid-template-columns: 408px 99px;
  align-items: end;
  justify-content: start;
  column-gap: 15px;
  margin-bottom: 20px;
}

.client-invite__neural-networks {
  display: grid;
  grid-template-columns: auto auto;
  align-items: center;
  justify-content: start;
  column-gap: 25px;
}

.client-invite__note {
  max-width: 375px;
  text-align: left;
}
</style>
