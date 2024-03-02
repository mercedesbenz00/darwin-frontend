<template>
  <div
    v-if="canInvite"
    v-tooltip="partnerTooltip"
    class="members__new"
  >
    <div class="members__new__input">
      <input-field
        id="new-invitation"
        ref="emailInput"
        v-model="newInvitationEmail"
        :disabled="isPartnerMember"
        type="text"
        placeholder="+ Enter email and press enter to invite"
        theme="light"
        @enter="createInvitation"
      />
    </div>
    <div class="members__new__role">
      <role-dropdown
        id="role"
        ref="roleDropdown"
        v-model="newInvitationRole"
        name="role"
        placeholder="Role"
        :options="invitationRoleOptions"
        :disabled="isPartnerMember"
      />
    </div>
    <button
      class="members__new__send"
      :class="{'members__new__send--disabled': !newInvitationEmail}"
      :disabled="isPartnerMember"
      @click="createInvitation"
    >
      <img src="/static/imgs/send.svg">
    </button>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, nextTick, onMounted, ref } from 'vue'

import InputField from '@/components/Common/InputField/V1/InputField.vue'
import RoleDropdown from '@/components/Common/RoleDropdown.vue'
import { useAuth } from '@/composables'
import { useStore } from '@/composables/useStore'
import { useTeamStore } from '@/composables/useTeamStore'
import { MembershipRole } from '@/store/types'

import { invitationRoleOptions as getRoleOptions, ROLE_LABELS } from './data'

type InvitationError = {
  email?: string
  role?: string
}

export default defineComponent({
  name: 'InviteForm',
  components: { InputField, RoleDropdown },
  setup () {
    const store = useStore()

    const emailInput = ref<InputField | null>()

    const teamStore = useTeamStore()

    const { isAuthorized } = useAuth()
    const invitationRoleOptions = computed(() => getRoleOptions(isAuthorized))

    const canInvite = computed<boolean>(() => invitationRoleOptions.value.length > 0)

    const user = computed(() => store.state.user.profile)

    const isPartnerMember = computed<boolean>(() => {
      const currentTeam = teamStore.currentTeam.value
      if (!currentTeam) { return false }

      const currentUser = user.value
      if (!currentUser) { return false }

      // current team is not client, so the whole concept doesn't apply
      if (!(currentTeam.managed_status === 'client' && !!currentTeam.partner_id)) {
        return false
      }

      // current team is client and user it direct member of client
      if (teamStore.currentTeamMemberships.value.some(m => m.user_id === currentUser.id)) {
        return false
      }

      // current team is client and user is direct member of partner
      return teamStore.allRelevantMemberships.value.some(
        m => m.team_id === currentTeam.partner_id && m.user_id === currentUser.id
      )
    })

    const partnerTooltip = computed<string | undefined>(() => {
      if(!isPartnerMember.value) { return }
      return 'You are not allowed to add users directly to this team'
    })

    const newInvitationRole = ref<MembershipRole>('member')
    const newInvitationEmail = ref<string>('')

    const roleLabels = ROLE_LABELS

    onMounted(() => {
      if (invitationRoleOptions.value.length > 0) {
        newInvitationRole.value = invitationRoleOptions.value[0].id
      }
    })

    const error = ref<InvitationError>({})

    const updateErrors = (): void => {
      nextTick(() => {
        if (!error.value.email) { return }
        emailInput.value?.setError(error.value.email)
      })
    }

    const createInvitation = async (): Promise<void> => {
      if (newInvitationEmail.value.length === 0) { return }
      const validationErrors =
        await teamStore.createInvitation(newInvitationEmail.value, newInvitationRole.value)

      if (validationErrors) {
        error.value = validationErrors
        updateErrors()
        return
      }

      newInvitationEmail.value = ''
    }

    return {
      canInvite,
      createInvitation,
      emailInput,
      error,
      invitationRoleOptions,
      isPartnerMember,
      newInvitationEmail,
      newInvitationRole,
      partnerTooltip,
      roleLabels
    }
  }
})
</script>

<style lang="scss" scoped>
.members__new {
  @include row--center;
  margin: 10px 84px 30px 12px;
}

.members__new__input {
  flex: 1;
  margin-right: 15px;
}

.members__new__role {
  @include row--center;
  width: 180px;
  margin-right: 30px;
}

.members__new__send {
  @include row--center;
  width: 35px;
  cursor: pointer;
  background: transparent;

  &--disabled {
    opacity: .3;
  }

  &:not(.members__new__send--disabled) {
    &:hover {
      opacity: .7;
    }

    &:active {
      opacity: .5;
    }
  }
}
</style>
