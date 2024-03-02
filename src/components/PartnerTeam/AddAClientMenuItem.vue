<template>
  <div
    v-if="isPartner"
    class="add-a-client-wrapper"
  >
    <sidebar-menu-item-layout
      class="add-a-client"
      role="button"
      @click.native="openModal"
      @hovered="onHover"
    >
      <template #icon>
        <v2-sidebar-menu-item-icon
          name="paper-plane"
          :hovered="hovered"
          :tooltip="label"
        />
      </template>
      <template #label>
        {{ label }}
      </template>
      <template #asside>
        <partner-pill class="add-a-client__asside" />
      </template>
    </sidebar-menu-item-layout>
    <confirmation-dialog
      class="add-a-client"
      :name="modalName"
      sidebar
    >
      <template #title>
        <div class="add-a-client__modal__title">
          <header-3 class="add-a-client__modal__title__content">
            Start a new team
          </header-3>
          <partner-pill class="add-a-client__modal__title__pill" />
        </div>
      </template>
      <template #detail>
        <form
          class="add-a-client__modal__detail"
          @submit.prevent.stop="createInvite"
        >
          <paragraph-14>Type the email of the client who will own the team's data:</paragraph-14>
          <input-field
            v-model="email"
            class="add-a-client__modal__detail__email"
            placeholder="email address"
            :error="errors.email"
          />
          <div class="add-a-client__modal__detail__neural-networks">
            <check-box
              v-model="neuralNetworks"
              label="Cover this team's usage of neural networks"
            />
            <client-invite-info />
          </div>
          <client-invite-note />
        </form>
      </template>
      <template #footer>
        <div class="add-a-client__modal__footer">
          <secondary-button @click="closeModal">
            Cancel
          </secondary-button>
          <primary-button @click="createInvite">
            Send
          </primary-button>
        </div>
      </template>
    </confirmation-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import CheckBox from '@/components/Common/CheckBox/V1/CheckBox.vue'
import ConfirmationDialog from '@/components/Common/ConfirmationDialog.vue'
import Header3 from '@/components/Common/Header3.vue'
import InputField from '@/components/Common/InputField/V1/InputField.vue'
import Paragraph14 from '@/components/Common/Paragraph14.vue'
import SidebarMenuItemLayout from '@/components/Layout/Sidebar/SidebarMenuItemLayout.vue'
import V2SidebarMenuItemIcon from '@/components/Layout/Sidebar/V2SidebarMenuItemIcon.vue'
import { createClientTeamInvitation } from '@/store/modules/team/actions/createClientTeamInvitation'
import { RootState, StoreActionPayload, TeamPayload, ValidationError } from '@/store/types'

import ClientInviteInfo from './ClientInviteInfo.vue'
import ClientInviteNote from './ClientInviteNote.vue'
import PartnerPill from './PartnerPill.vue'

@Component({
  name: 'add-a-client-menu-item',
  components: {
    CheckBox,
    ClientInviteNote,
    ClientInviteInfo,
    ConfirmationDialog,
    Header3,
    InputField,
    Paragraph14,
    PartnerPill,
    SidebarMenuItemLayout,
    V2SidebarMenuItemIcon
  }
})
export default class AddAClientMenuItem extends Vue {
  readonly label = 'Add client'
  readonly modalName = 'client-invite'
  
  hovered: boolean = false

  onHover (hovered: boolean): void {
    this.hovered = hovered
  }

  @State((state: RootState) => state.team.currentTeam)
  team!: TeamPayload

  get isPartner (): boolean {
    return !!this.team &&
      this.$can('manage_client_team', { subject: 'team', resource: this.team })
  }

  openModal (): void {
    this.$modal.show(this.modalName)
  }

  closeModal (): void {
    this.$modal.hide(this.modalName)
  }

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
    this.closeModal()
  }
}
</script>

<style lang="scss" scoped>
.add-a-client-wrapper .add-a-client {
  height: 100%;
}

.add-a-client-wrapper :deep(.sidebar__menu__icon) {
  justify-self: center;
}

.add-a-client-wrapper :deep(.sidebar__menu__asside) {
  align-self: center;
  display: block;
}

.add-a-client__modal__title {
  display: grid;
  grid-template-columns: auto auto auto;
  justify-content: center;
  column-gap: 5px;
}
.add-a-client__modal__title__content {
  @include typography(lg-1, headlines, bold);
  color: $colorBlack;
  grid-column: 2 / 3;
}

.add-a-client__modal__title__pill {
  grid-column: 3 / 4;
  align-self: flex-start;
  justify-self: flex-start;
}

.add-a-client__modal__detail {
  padding-top: 20px;
  padding-bottom: 30px;

  @include typography(md-1, mulish);
  color: $colorBlack;

  display: grid;
  grid-auto-flow: row;
  row-gap: 15px;

  justify-content: center;
}

.add-a-client__modal__detail__email {
  margin-bottom: 20px;
}

.add-a-client__modal__detail__neural-networks {
  display: grid;
  grid-template-columns: auto auto;
  justify-content: space-between;
}

.add-a-client__modal__footer {
  display: grid;
  grid-template-columns: auto auto;
  justify-content: space-between;
  width: 100%;
}
</style>
