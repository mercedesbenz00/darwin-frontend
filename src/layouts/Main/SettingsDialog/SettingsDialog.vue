<template>
  <modal
    name="settings"
    translate="pop-out"
    width="80%"
    height="90%"
    :classes="['modal_class-settings']"
    :click-to-close="false"
  >
    <div class="settings__sidebar">
      <div class="settings__sidebar__section-title">
        You
      </div>
      <settings-tab
        class="settings__sidebar__item"
        :active="currentTab === 'profile'"
        :title="userFullName"
        @click="setCurrentTab('profile')"
      >
        <avatar
          v-if="user"
          :id="user.id"
          :name="userFullName"
          :url="user.image && (user.image.thumbnail_url || user.image.url)"
          :size="24"
        />
      </settings-tab>
      <settings-tab
        class="settings__sidebar__item"
        title="Notifications"
        :active="currentTab === 'notifications'"
        @click="setCurrentTab('notifications')"
      >
        <lightbulb-icon />
      </settings-tab>
      <div class="settings__sidebar__divider" />
      <div class="settings__sidebar__section-title">
        Team
      </div>
      <!-- team -->
      <settings-tab
        class="settings__sidebar__item"
        :active="currentTab === 'team'"
        :title="team ? team.name : ''"
        @click="setCurrentTab('team')"
      >
        <avatar
          v-if="team"
          :name="team.name"
          :url="team.image && (team.image.thumbnail_url || team.image.url)"
          :size="24"
        />
      </settings-tab>
      <settings-tab
        v-if="$can('view_team_members')"
        class="settings__sidebar__item"
        title="Members"
        :active="currentTab === 'members'"
        @click="setCurrentTab('members')"
      >
        <peoples-icon />
      </settings-tab>
      <settings-tab
        v-if="$can('view_customer')"
        class="settings__sidebar__item"
        :active="currentTab === 'plans'"
        title="Plans"
        @click="setCurrentTab('plans')"
      >
        <dollar-icon />
      </settings-tab>
      <settings-tab
        class="settings__sidebar__item"
        title="Storage"
        :active="currentTab === 'storage'"
        @click="setCurrentTab('storage')"
      >
        <storage-icon class="settings__sidebar__item__img" />
      </settings-tab>
      <settings-tab
        v-if="$can('create_api_key')"
        class="settings__sidebar__item"
        title="API Keys"
        :active="currentTab === 'api-keys'"
        @click="setCurrentTab('api-keys')"
      >
        <key-icon />
      </settings-tab>
      <settings-tab
        class="settings__sidebar__item"
        title="Performance"
        :active="currentTab === 'performance'"
        @click="setCurrentTab('performance')"
      >
        <gauge-icon />
      </settings-tab>
      <div class="settings__sidebar__spacer" />
      <settings-tab
        class="settings__sidebar__item"
        title="Log Out"
        @click="logout"
      >
        <logout-icon />
      </settings-tab>
    </div>
    <div class="settings__content">
      <profile
        v-if="currentTab === 'profile'"
        @close="close"
      />
      <notifications
        v-if="currentTab === 'notifications'"
        @close="close"
      />
      <team-profile
        v-if="currentTab === 'team'"
        @close="close"
      />
      <team-members
        v-if="currentTab === 'members'"
        @close="close"
      />
      <plans
        v-if="currentTab === 'plans'"
        @close="close"
      />
      <storage
        v-if="currentTab === 'storage'"
        @close="close"
      />
      <api-keys
        v-if="currentTab === 'api-keys'"
        @close="close"
      />
      <performance
        v-if="currentTab === 'performance'"
        @close="close"
      />
    </div>
  </modal>
</template>

<script lang="ts">

import { computed, defineComponent, watch } from 'vue'

import Avatar from '@/components/Common/Avatar/V1/Avatar.vue'
import SettingsTab from '@/components/Layout/SettingsDialog/SettingsTab.vue'
import { useModal } from '@/composables/useModal'
import { useRoute, useRouter } from '@/composables/useRouter'
import { useStore } from '@/composables/useStore'
import { getFullName } from '@/utils'

import ApiKeys from './Panes/ApiKeys.vue'
import Notifications from './Panes/Notifications.vue'
import Performance from './Panes/Performance.vue'
import Plans from './Panes/Plans.vue'
import Profile from './Panes/Profile.vue'
import Storage from './Panes/Storage.vue'
import TeamMembers from './Panes/TeamMembers/TeamMembers.vue'
import TeamProfile from './Panes/TeamProfile.vue'
import DollarIcon from './assets/dollar.svg?inline'
import GaugeIcon from './assets/gauge.svg?inline'
import KeyIcon from './assets/key.svg?inline'
import LightbulbIcon from './assets/lightbulb.svg?inline'
import LogoutIcon from './assets/logout.svg?inline'
import PeoplesIcon from './assets/peoples.svg?inline'
import StorageIcon from './assets/storage.svg?inline'

export default defineComponent({
  name: 'SettingsDialog',
  components: {
    ApiKeys,
    Avatar,
    DollarIcon,
    GaugeIcon,
    KeyIcon,
    LightbulbIcon,
    LogoutIcon,
    Notifications,
    PeoplesIcon,
    Performance,
    Plans,
    Profile,
    SettingsTab,
    Storage,
    StorageIcon,
    TeamMembers,
    TeamProfile
  },
  setup () {
    const store = useStore()

    const team = computed(() => store.state.team.currentTeam)

    const user = computed(() => store.state.user.profile)
    const userFullName = computed<string | null>(() => {
      if (!user.value) { return null }
      return getFullName(user.value)
    })

    const close = (): void => {
      store.dispatch('ui/hideSettingsDialog')
    }

    const currentTab = computed(() => store.state.ui.currentSettingsTab)

    const setCurrentTab = (tab: string): void => {
      store.dispatch('ui/showSettingsDialog', { tab })
    }

    const modal = useModal()

    const  onShow = (): void => {
      store.dispatch('user/loadProfile')
      modal.show('settings')
    }
    const router = useRouter()
    const route = useRoute()

    const onHide = (): void => {
      router.push({ query: { ...route.query, settings: undefined } })
      modal.hide('settings')
    }

    watch(() => store.state.ui.showSettings, (value: boolean) => {
      value ? onShow() : onHide()
    })

    watch(() => route.query.settings, (tab) => {
      if (!tab) { return }
      store.dispatch('ui/showSettingsDialog', { tab })
    }, { immediate: true })

    const logout = (): void => {
      store.dispatch('auth/logout')
    }

    return {
      close,
      currentTab,
      logout,
      setCurrentTab,
      team,
      user,
      userFullName
    }
  }
})
</script>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.modal_class-settings {
  @include row;
  border-radius: 10px;
  overflow: hidden;
  background: $colorWhite;
}
</style>

<style lang="scss" scoped>
$sidebarWidth: 200px;

.settings__sidebar {
  width: $sidebarWidth;
  background: $color90Black;
  @include col;
  padding-bottom: 20px;
}

.settings__sidebar__section-title {
  @include noSelect;
  margin: 15px 38px;
  color: $colorAliceNight;
  @include typography(md, default, bold);
  text-transform: uppercase;
}

.settings__sidebar__item__img {
  color: #F1F5F9;
}

.settings__sidebar__divider {
  width: 100%;
  margin-top: 40px;
  height: 1px;
  background: $colorSecondaryLight1;
  opacity: 0.4;
}

.settings__sidebar__spacer {
  flex: 1 1 auto;
}

.settings__content {
  width: calc(100% - #{$sidebarWidth});
  height: 100%;
  box-sizing: border-box;
  overflow-y: auto;
}
</style>
