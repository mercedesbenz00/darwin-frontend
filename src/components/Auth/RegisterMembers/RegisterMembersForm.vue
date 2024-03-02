<template>
  <form
    class="register-members-form"
    @submit.prevent="submit"
  >
    <div class="register-members__members">
      <div
        v-for="(invitation, index) in invitations"
        :key="index"
        class="register-members__member"
      >
        <div class="register-members__email">
          <input-field
            :id="index"
            :ref="`member${index}`"
            v-model="invitation.email"
            theme="light"
            type="text"
            placeholder="+ Add email address"
            :error="error.invitations && error.invitations[index]"
            :required="index === invitations.length - 1 ? null : 'required'"
            @change="checkUsers"
            @enter="onEnter"
          />
        </div>
        <div class="register-members__role">
          <role-dropdown
            id="role"
            v-model="invitation.role"
            name="role"
            :options="roleOptions"
          />
        </div>
        <div
          class="register-members__trash"
          :class="{'register-members__trash--hidden': index === invitations.length - 1}"
          @click="trash(index)"
        >
          <trash-icon-old />
        </div>
      </div>
    </div>
    <div class="register-members__buttons">
      <primary-button
        size="medium"
        type="submit"
        :disabled="loading"
      >
        CONTINUE
      </primary-button>
    </div>
  </form>
</template>

<script lang="ts">
import isEmail from 'validator/lib/isEmail'
import { Component, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { TrashIconOld } from '@/assets/icons/V1'
import InputField from '@/components/Common/InputField/V1/InputField.vue'
import RoleDropdown from '@/components/Common/RoleDropdown.vue'
import { RoleDropdownOption } from '@/components/Common/RoleDropdownOption'
import { ROLE_OPTIONS } from '@/layouts/Main/SettingsDialog/Panes/TeamMembers/data'
import { TeamPayload } from '@/store/modules/admin/types'
import { MembershipRole, RootState } from '@/store/types'

const getMemberField = (vm: RegisterMembersForm, index: number): InputField | null => {
  const allRefs = vm.$refs[`member${index}`]
  if (!allRefs) { return null }
  return (allRefs as InputField[])[0] || null
}

@Component({
  name: 'register-members-form',
  components: { InputField, RoleDropdown, TrashIconOld }
})
export default class RegisterMembersForm extends Vue {
  @State((state: RootState) => state.team.currentTeam)
  currentTeam!: TeamPayload | null

  readonly roleOptions: RoleDropdownOption[] = ROLE_OPTIONS.filter(role => role.id !== 'owner')

  invitations: Array<{
    email: string
    role: MembershipRole
  }> = [{ email: '', role: 'member' }]

  error: { [key in string]: any } = {}
  loading: boolean = false

  mounted () {
    if (!this.currentTeam) {
      this.$store.dispatch('toast/warning', { content: 'You need to login first to add members' })
      this.$router.replace('/login')
    }
  }

  checkUsers () {
    const last = this.invitations[this.invitations.length - 1]
    if (last.email && last.email !== '') {
      this.invitations.push({ email: '', role: 'member' })
    }
  }

  trash (index: number) {
    this.invitations.splice(index, 1)
    if (this.error.invitations) {
      this.error.invitations.splice(index, 1)
    }
  }

  validateForm () {
    this.error = { invitations: [] }
    const invitations = [...this.invitations]
    invitations.splice(this.invitations.length - 1, 1)
    // Validate the form
    for (const i in invitations) {
      if (!isEmail(invitations[i].email)) {
        this.error.invitations[i] = 'Should be a valid email'
      }
    }
    return Object.keys(this.error).length === 1 &&
      this.error.invitations.filter((m: any) => !!m).length === 0
  }

  async submit () {
    if (!this.currentTeam) {
      throw new Error('You cannot invite users without loggin into a team')
    }
    if (this.invitations.length === 1) {
      this.$emit('submitted')
      return
    }
    if (!this.validateForm()) {
      this.$ga.event('create_team', 'submit', 'failure_form_invalid')
      return
    }
    const invitations = [...this.invitations]
    invitations.splice(this.invitations.length - 1, 1)

    this.loading = true

    const { error } = await this.$store.dispatch('team/addInvitations', {
      teamId: this.currentTeam.id,
      invitations
    })

    if (error) {
      const { status } = error
      this.error = status ? {} : error
      this.$ga.event('create_team', 'submit', 'failure_not_authorized')
      this.loading = false
      return this.$store.dispatch('toast/warning', { content: error.message })
    }

    await this.$store.dispatch('team/getMemberships')
    this.loading = false
    this.$ga.event('create_team', 'submit', 'success')

    this.$emit('submitted')
  }

  onEnter (e: KeyboardEvent) {
    if (!e.target) { return }
    const target = e.target as HTMLElement
    const index = parseInt(target.id)
    if (index < this.invitations.length - 1) {
      const nextMemberComponent = getMemberField(this, index + 1)
      if (nextMemberComponent) { nextMemberComponent.setFocus() }
    }
  }
}
</script>

<style lang="scss" scoped>
.register-members-form {
  @include col;
  width: 520px;
  height: 488px;
  padding-top: 45px;
  padding-bottom: 25px;
  background-color: $colorWhite;
  border-radius: 0px $border-radius-default $border-radius-default 0px;
  overflow: hidden;
}

.register-members__upload {
  @include row;
  align-items: center;
  padding: 0 50px 23px 70px;
}

.register-members__upload__name {
  width: 285px;
  margin-left: 35px;
}

.register-members__members {
  flex: 1;
  width: 100%;
  overflow-y: auto;
}

.register-members__member {
  @include row--center;
  margin: 0 40px 25px 40px;
}

.register-members__email {
  flex: 1 1 auto;
  min-width: 200px;
  margin-right: 10px;
  position: relative;
}

.register-members__role {
  width: 120px;
  margin-left: 10px;
}

.register-members__trash {
  margin-left: 25px;
  cursor: pointer;
  transition: opacity .2s ease-in-out;

  svg {
    color: $colorCrimsonLight;
  }

  &:hover {
    opacity: 0.7;
  }
  &:active {
    opacity: 0.5;
  }
}

.register-members__trash--hidden {
  opacity: 0;
  pointer-events: none;
}

.register-members__buttons {
  margin-left: 70px;
  margin-right: 50px;
  @include row;
  justify-content: flex-end;

  button.button {
    width: 195px;
    margin-right: 1em;

    &:last-child {
      margin-right: 0;
    }
  }
}
</style>
