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
      <div class="register-members">
        <teaser
          class="register-members__teaser"
          title="Invite other users, it's free"
          :description="unlimitedSeatsStatement"
          image="register.png"
          text-align="left"
        />
        <register-members-form @submitted="onSubmitted" />
      </div>
    </div>
  </background>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import RegisterMembersForm from '@/components/Auth/RegisterMembers/RegisterMembersForm.vue'
import Background from '@/components/Common/Background.vue'
import Logo from '@/components/Common/Logo.vue'
import Teaser from '@/components/Common/Teaser.vue'

@Component({
  name: 'register-members',
  components: { Background, Logo, RegisterMembersForm, Teaser }
})
export default class RegisterMembers extends Vue {
  onSubmitted (): void {
    this.$router.push('/datasets')
  }

  async onLogout (): Promise<void> {
    await this.$store.dispatch('auth/logout')
    this.$router.replace('/login')
  }

  readonly unlimitedSeatsStatement =
    'All teams have unlimited user seats, so invite as many collaborators as you’d wish!'
}
</script>

<style lang="scss" scoped>
.register-members {
  @include row;
  align-items: flex-end;
}

.register-members__teaser {
  z-index: 1;
}
</style>
