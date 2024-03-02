<template>
  <form
    class="register-team-form"
    @submit.prevent="onCreateTeam"
  >
    <avatar-upload
      class="register-team__avatar"
      can-upload
      :company-url="companyUrl"
      :disabled="loading"
      :loading="avatarData && loading"
      @change="onAvatarChange"
    />
    <div class="register-team__name">
      <input-field
        v-model="teamName"
        auto-focus
        name="teamName"
        placeholder="Team Name"
        theme="light"
        type="text"
        :error="error.name"
        required="required"
      />
    </div>
    <div class="register-team__buttons">
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
import { Component, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import AvatarUpload from '@/components/Common/AvatarUpload/AvatarUpload.vue'
import { AvatarUploadData } from '@/components/Common/AvatarUpload/types'
import InputField from '@/components/Common/InputField/V1/InputField.vue'
import { RootState, UserPayload } from '@/store/types'
import { getCompanyUrlFromEmail } from '@/utils'

@Component({
  name: 'register-team-form',
  components: { AvatarUpload, InputField }
})
export default class RegisterTeamForm extends Vue {
  @State((state: RootState) => state.user.profile)
  profile!: UserPayload | null

  teamName = ''
  error: { name?: string } = {}
  avatarData: AvatarUploadData | null = null
  loading: boolean = false

  get companyUrl () {
    return this.profile ? getCompanyUrlFromEmail(this.profile.email) : ''
  }

  onAvatarChange (event: AvatarUploadData | null) {
    this.avatarData = event
  }

  async onCreateTeam () {
    this.loading = true
    const params = {
      name: this.teamName,
      hash: this.avatarData && this.avatarData.hash,
      content: this.avatarData && this.avatarData.file,
      type: this.avatarData && this.avatarData.type
    }

    const { data, error } = await this.$store.dispatch('team/register', params)

    if (error) {
      const { status } = error
      this.error = status ? {} : error
      this.$ga.event('create_team', 'submit', 'failure_not_authorized')
      this.loading = false
      return this.$store.dispatch('toast/warning', { content: error.message })
    }
    await this.$store.dispatch('auth/selectTeam', { team_id: data.id })
    await this.$store.dispatch('team/getMemberships')

    this.loading = false
    this.$ga.event('create_team', 'submit', 'success')
    this.$emit('submitted')
  }
}
</script>

<style lang="scss" scoped>
.register-team-form {
  @include col--center;
  width: 820px;
  height: 210px;
  padding: 30px;
  background-color: $colorWhite;
  border-radius: $border-radius-default;
  position: relative;
}

.register-team__avatar {
  // !import is required to override v-loading options
  position: absolute !important;
  top: -30%;
}

.register-team__name {
  width: 100%;
  margin-top: 50px;
  margin-bottom: 26px;
}

.register-team__buttons {
  width: 100%;
  @include row;
  justify-content: flex-end;
}
</style>
