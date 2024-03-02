<template>
  <background>
    <div class="auth header">
      <logo />
    </div>
    <div class="center__content">
      <div class="register">
        <register-teaser class="register__teaser" />
        <register-form
          v-if="email"
          :email="email"
          :is-team-invitation="isTeamInvitation"
          :token="$route.query.token"
          @submitted="onSubmitted"
        />
      </div>
    </div>
  </background>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import RegisterForm from '@/components/Auth/Register/RegisterForm.vue'
import RegisterTeaser from '@/components/Auth/Register/RegisterTeaser.vue'
import Background from '@/components/Common/Background.vue'
import Logo from '@/components/Common/Logo.vue'
import {
  InvitationPayload,
  RootState,
  TeamPayload,
  UserPayload
} from '@/store/types'

@Component({
  name: 'register',
  components: {
    Background,
    RegisterForm,
    Logo,
    RegisterTeaser
  }
})
export default class Register extends Vue {
  @State((state: RootState) => state.auth.invitation)
  invitation!: InvitationPayload | null

  @State((state: RootState) => state.user.profile)
  profile!: UserPayload | null

  @State((state: RootState) => state.team.currentTeam)
  currentTeam!: TeamPayload | null

  email: string | null = null
  isTeamInvitation: boolean = false

  async mounted (): Promise<void> {
    // If a user is redirected to the registration page after confirming an
    // invitation, fetch the invitation data from the store
    if (this.invitation) {
      this.email = this.invitation.email
      return
    }

    // Try logging in with the token specified in the URL query
    // If no token is specified, or an invalid token is used,
    // the router will redirect the user to the login page
    const { token } = this.$route.query

    if (!token) {
      this.$store.dispatch('toast/warning', {
        content: 'Cannot register without an invitation. Please contact support.'
      })
      this.$router.replace('/login')
      return
    }

    const {
      data: teamOwnerInvitation,
      error
    } = await this.$store.dispatch('auth/verifyTeamOwnerInvitation', token)

    if (error) {
      this.$store.dispatch('toast/warning', { content: error.message })
      this.$router.replace('/login')
      return
    }

    if (teamOwnerInvitation.fulfilled) {
      this.$store.dispatch('toast/warning', { content: 'Invitation has already been used' })
      this.$router.replace('/login')
      return
    }

    this.email = teamOwnerInvitation.email
    this.isTeamInvitation = true
  }

  onSubmitted (): void {
    const { currentTeam, profile } = this
    if (!profile) { return }
    if (currentTeam && currentTeam.two_factor_auth_enforced) {
      this.$store.dispatch('toast/notify', {
        content: `You need to setup Two Factor Authentication to join this ${currentTeam.name}.`
      })
      this.setup2fa()
    } else {
      this.$router.push('/datasets')
    }
  }

  async setup2fa (): Promise<void> {
    const { error, data } = await this.$store.dispatch('auth/setup2fa')
    if (error) {
      this.$store.dispatch('toast/warning', { content: error.message })
      return
    }

    const secretKey = data.secret_2fa
    this.$router.push(`/setup-2fa?secret_key=${secretKey}`)
  }
}
</script>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.terms-link {
  color: $colorPrimaryDark;
  text-decoration: underline;
  cursor: pointer;
  margin-left: 5px;
}
</style>

<style lang="scss" scoped>
.register {
  @include row;
  align-items: flex-end;
}

.register__teaser {
  z-index: 1;
}
</style>
