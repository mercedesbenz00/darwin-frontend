<template>
  <div class="sidebar__header-container">
    <div
      class="sidebar__header"
      :class="{ 'sidebar__header--minimized': sidebarMinimized }"
    >
      <div
        v-if="currentTeam"
        class="sidebar__profile"
        @click.stop="toggleOverlay"
      >
        <team-avatar
          id="sidebar-team-avatar"
          class="sidebar__profile__avatar"
          :team="currentTeam"
        />
        <div
          ref="teamNameLabel"
          class="sidebar__profile__name"
        >
          <label class="sidebar__profile__name__label">{{ teamName }}</label>
        </div>
      </div>
      <notification-bell v-if="!sidebarMinimized && authenticated" />
    </div>

    <sidebar-overlay
      v-if="overlay && currentTeam"
      v-click-outside="hideOverlay"
      class="sidebar__overlay"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { State } from 'vuex-class'

import TeamAvatar from '@/components/Common/Avatar/V1/TeamAvatar.vue'
import { DropdownIcon } from '@/components/Common/Button/V2'
import NotificationBell from '@/components/Layout/Notification/NotificationBell.vue'
import SidebarOverlay from '@/components/Layout/Sidebar/SidebarOverlay.vue'
import { TeamPayload } from '@/store/types'

@Component({
  name: 'sidebar-header',
  components: {
    DropdownIcon,
    NotificationBell,
    SidebarOverlay,
    TeamAvatar
  }
})
export default class SidebarHeader extends Vue {
  @State(state => state.auth.authenticated)
  authenticated!: boolean

  @State(state => state.team.currentTeam)
  currentTeam!: TeamPayload

  @State(state => state.ui.sidebarMinimized)
  sidebarMinimized!: boolean

  overlay: boolean = false

  get teamName (): string {
    return this.currentTeam ? this.currentTeam.name : ''
  }

  @Watch('authenticated')
  async onAuthenticated (authenticated: boolean): Promise<void> {
    if (!authenticated) { return }
    const response = await this.$store.dispatch('notification/joinNotificationsChannel')
    if (response && response.error) {
      const message = "We couldn't fetch your notifications. Try refreshing your browser."
      this.$store.dispatch('toast/warning', { content: message })
    }
  }

  mounted (): void {
    this.onAuthenticated(this.authenticated)
  }

  @Watch('$store.state.ui.showSettings')
  onShowSettingsDialog (showSettings: boolean): void {
    if (showSettings) {
      this.overlay = false
    }
  }

  toggleOverlay (): void {
    this.overlay = !this.overlay
  }

  hideOverlay (): void {
    this.overlay = false
  }
}
</script>

<style lang="scss" scoped>
.sidebar__header {
  @include row;
  margin: 13px 15px 18px 15px;
}

.sidebar__header--minimized {
  margin: 13px 15px 18px 15px;

  .sidebar__profile__avatar {
    width: 32px;
    height: 32px;
  }

  .sidebar__profile__name {
    display: none;
  }
}

.sidebar__profile {
  flex: 1 1 auto;
  @include row;
  align-items: center;
  height: 32px;
  cursor: pointer;

  &:hover {
    opacity: 0.7;
  }

  &:active {
    opacity: 0.5;
  }
}

.sidebar__profile__avatar {
  @include noSelect;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  z-index: 2;

  :deep(.avatar__icon) {
    border-radius: 50%
  }

  &.avatar--initials {
    @include noSelect;
    background: transparent !important;
    border: 1px solid $colorSecondaryLight;

    :deep(span) {
      color: $colorSecondaryLight1 !important;
    }
  }
}

.sidebar__profile__name {
  position: absolute;
  left: 60px;
  right: 0;
  @include row;
  align-items: center;
  cursor: pointer;
  @include noSelect;
}

.sidebar__profile__name__label {
  @include typography(md-1, inter, 500);
  color: $colorSecondaryDark;
  cursor: pointer;
  overflow: hidden;
  padding-right: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 110px;
}
</style>
