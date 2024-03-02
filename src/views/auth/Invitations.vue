<template>
  <background>
    <div class="auth header">
      <logo />
    </div>
    <div class="center__content">
      <div
        v-if="loading"
        class="invitations__modal"
      >
        <div class="invitations__modal__title">
          Verifying invitation...
        </div>
        <div class="invitations__modal__text" />
      </div>
      <div
        v-if="!loading && error"
        class="invitations__modal"
      >
        <div class="invitations__modal__title">
          Your invitation is invalid
        </div>
        <div
          class="invitations__modal__text"
        >
          It may have expired, or you might have gotten here by accident.
        </div>
      </div>
      <div
        v-if="!loading && !error && invitation"
        class="invitations__modal"
      >
        <div class="invitations__modal__title">
          Invitation verified
        </div>
        <div class="invitations__modal__text">
          You can join {{ invitation.team.name }} by clicking the button.
        </div>
        <div class="invitations__modal__button__center">
          <positive-button
            class="invitations__modal__submit"
            type="submit"
            @click="onConfirm"
          >
            Join as {{ invitation.user.first_name }}
          </positive-button>
        </div>
      </div>
    </div>
  </background>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import Background from '@/components/Common/Background.vue'
import Logo from '@/components/Common/Logo.vue'
import { InvitationPayload, UserPayload } from '@/store/types'

@Component({ name: 'invitations', components: { Background, Logo } })
export default class Invitations extends Vue {
  error: boolean = false
  invitation: InvitationPayload | null = null
  user: UserPayload | null = null
  loading: boolean = false

  async mounted () {
    const token = this.$route.query.token

    this.error = false
    this.loading = true

    let user

    // if the user is logged in fetch the user, if not ignore the token login error
    const response = await this.$store.dispatch('auth/loginWithToken')
    if (!response.error) { user = response.data }

    const { data: invitation, error } = await this.$store.dispatch('auth/verifyInvitation', token)
    if (error) {
      this.error = true
      this.loading = false
      return
    }

    // invitation is for a new user, so they need to go register
    if (!invitation.user) {
      return this.$router.push({ path: 'register', query: { token } })
    }

    // if we did not return, then invitation is for an existing user

    // user is not logged in. they need to do so
    if (!user) {
      this.$store.dispatch('toast/notify', { content: 'Please login to accept the invite' })
      return this.$router.push({ path: 'login', query: { token } })
    }

    // user is logged in, but invitation is for a different user
    if (invitation.user.id !== user.id) {
      this.$store.dispatch('toast/notify', {
        content: [
          'This invite is not for the currently logged in user.',
          'Please login in with the invited users credentials'
        ].join(' ')
      })
      await this.$store.dispatch('auth/logout')

      // Since logout resets the auth state, we need to manually put back the invitation
      // so we can prepopulate the login with the right user info.
      this.$store.commit('auth/SET_INVITATION', invitation)

      return this.$router.push({ path: 'login', query: { token } })
    }

    this.user = user
    this.invitation = invitation
    this.loading = false
  }

  async onConfirm () {
    const token = this.$route.query.token
    const { error } = await this.$store.dispatch('auth/confirmInvitation', { token })

    if (error) {
      return this.$store.dispatch('toast/warning', { content: error.message })
    }

    this.$router.push('/datasets')
  }
}
</script>

<style lang="scss" scoped>
.invitations__modal {
  width: 520px;
  height: 380px;
  margin-top: 50px;
  margin-bottom: 40px;
  background-color: $colorWhite;
  border-radius: 10px 10px 10px 10px;
  box-shadow: 0px 10px 60px rgba(11, 36, 72, 0.1), 0px 1px 2px rgba(11, 36, 72, 0.05);
}

.invitations__modal__title {
  @include typography(lg, default, bold);
  padding: 50px 50px 25px 70px;
  text-align: left;
  letter-spacing: 0.01em;
  color: $colorSecondaryDark1;
}

.invitations__modal__text {
  padding: 25px 50px 25px 70px;
}

.invitations__modal__button__center {
  @include row--center;
}

.invitations__modal__submit {
  width: 195px;
  text-align: center;
}
</style>
