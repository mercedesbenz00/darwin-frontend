<template>
  <settings-pane title="Notification Settings">
    <template #body>
      <div class="notifications__content__section">
        <div class="notifications__content__section__field">
          <check-box
            id="showNotifications"
            v-model="showNotifications"
            name="showNotifications"
            label="Receive Email Notifications"
            size="small"
          />
        </div>
        <info
          class="notifications__content__section__info"
          title="Receive Email Notifications"
          svg-overlay-color="rgba(255, 255, 255, 1)"
        >
          If you opt-out, you will only receive in-app notifications.
        </info>
      </div>
    </template>
    <template #footer>
      <positive-button
        :disabled="loading"
        @click="save"
      >
        Save
      </positive-button>
    </template>
  </settings-pane>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { State } from 'vuex-class'

import CheckBox from '@/components/Common/CheckBox/V1/CheckBox.vue'
import Info from '@/components/Common/Info.vue'
import { UserPayload } from '@/store/types'

import SettingsPane from './SettingsPane.vue'

@Component({
  name: 'notifications',
  components: { CheckBox, Info, SettingsPane }
})
export default class Notifications extends Vue {
  loading: boolean = false
  showNotifications: boolean = true

  @State(state => state.user.profile)
  profile!: UserPayload

  mounted () {
    this.$store.dispatch('user/loadProfile')
  }

  @Watch('profile', { immediate: true })
  onProfile (profile?: UserPayload) {
    if (!profile) { return }
    this.showNotifications = profile.show_notifications
  }

  async save () {
    this.loading = true

    const params = {
      show_notifications: this.showNotifications
    }

    const { error } = await this.$store.dispatch('user/updateProfile', params)

    this.loading = false

    if (error) {
      return
    }
    this.$store.dispatch('toast/notify', { content: 'Settings updated' })
  }
}
</script>

<style lang="scss" scoped>
.notifications {
  @include col;
  width: 100%;
  height: 100%;
}

.notifications__title {
  @include typography(md, default, bold);
  color: $colorSecondaryLight;
  padding: 50px;
  padding-bottom: 25px;
  background-color: $colorGriteDark2;
}

.notifications__content {
  @include col;
  flex: 1;
  padding: 50px;
}

.notifications__content__section {
  @include row;
  justify-content: flex-start;
}

.notifications__content__section__field {
  margin-right: 40px;
}
</style>
