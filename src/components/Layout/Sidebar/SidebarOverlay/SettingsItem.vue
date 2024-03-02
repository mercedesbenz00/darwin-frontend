<template>
  <router-link
    class="settings-item"
    :to="path"
  >
    <icon-duotone-settings class="settings-item__icon" />
    <div class="settings-item__text">
      {{ label }}
    </div>
  </router-link>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import { IconDuotoneSettings } from '@/assets/icons/V2/Duotone'
import { resolveSettingsRoutePath } from '@/utils/router'

@Component({
  name: 'settings-item', components: { IconDuotoneSettings }
})
export default class SettingsItem extends Vue {
  get path (): string {
    const settingsTab = this.$can('manage_customer') ? 'plans' : 'profile'
    return resolveSettingsRoutePath(this.$router, this.$route, settingsTab)
  }

  get label (): string {
    return this.$can('manage_customer') ? 'Settings & Billing' : 'Settings'
  }
}
</script>

<style lang="scss" scoped>
.settings-item {
  @include row;
  align-items: center;
  padding: 22px 16px;
}

.settings-item__icon {
  width: 16px;
  height: 16px;
  margin-right: 8px;
  color: $colorAliceNight;
}

.settings-item__text {
  @include typography(md-1, headlines);
  color: $colorSecondaryLight;
}
</style>
