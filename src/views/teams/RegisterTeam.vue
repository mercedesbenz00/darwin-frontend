<template>
  <background>
    <div class="auth header">
      <logo />
      <div class="logins">
        <div
          class="logins__link"
          @click="onLogout"
        >
          Log out
        </div>
      </div>
    </div>
    <div class="center__content">
      <div class="register-team">
        <h2 class="register-team__title">
          Create your team
        </h2>
        <register-team-form @submitted="onSubmitted" />
      </div>
    </div>
  </background>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import Background from '@/components/Common/Background.vue'
import Logo from '@/components/Common/Logo.vue'
import RegisterTeamForm from '@/components/Teams/RegisterTeamForm.vue'
import { RootState, TeamPayload } from '@/store/types'

@Component({
  name: 'team-create',
  components: { Background, Logo, RegisterTeamForm }
})
export default class TeamCreate extends Vue {
  @State((state: RootState) => state.team.teams)
  teams!: TeamPayload[]

  async mounted (): Promise<void> {
    // Try logging in with the token specified in the URL query
    // If no token is specified, or an invalid token is used, the router will
    // redirect the user to the login page
    const { token } = this.$route.query

    if (!token) {
      if (!this.isFirstTeam) {
        this.$store.dispatch('toast/warning', {
          content: 'Cannot create a team without an invitation. Please contact support.'
        })
      }
      this.$router.replace('/')
      return
    }

    const {
      data: teamOwnerInvitation,
      error
    } = await this.$store.dispatch('auth/verifyTeamOwnerInvitation', token)

    if (error) {
      this.$store.dispatch('toast/warning', { content: error.message })
      this.$router.replace('/')
      return
    }

    if (teamOwnerInvitation.fulfilled) {
      this.$store.dispatch('toast/warning', { content: 'Invitation has already been used' })
      this.$router.replace('/')
    }
  }

  get isFirstTeam (): boolean {
    return this.teams.length === 0
  }

  async onLogout (): Promise<void> {
    await this.$store.dispatch('auth/logout')
    this.$router.replace('/login')
  }

  onSubmitted (): void {
    this.$router.replace('/register-members')
  }
}
</script>

<style lang="scss" scoped>
.register-team {
  @include col--center;
  margin-top: -100px;
}

.register-team__title {
  @include typography(xl-2, mulish, bold);
  text-align: center;
  margin-bottom: 100px;
}
</style>
