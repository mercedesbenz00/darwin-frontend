<template>
  <div
    class="sidebar"
    :class="{ 'sidebar--minimized': sidebarMinimized }"
    :style="{ 'zIndex': sidebarZIndex }"
  >
    <sidebar-header />
    <div class="sidebar__menus">
      <custom-button
        v-if="!isLoggedIn"
        class="sidebar__redirect-btn"
        size="medium"
        flair="rounded"
        @click="goToGetStarted"
      >
        Sign up to import
      </custom-button>
      <workflows-menu-item v-if="isV2Enabled" />
      <datasets-menu-item
        v-if="showDatasetsMenuItem"
        :disabled="!isAuthorizedUser"
      />
      <classes-menu-item :disabled="!isLoggedIn" />
      <models-menu-item v-if="isLoggedIn" />
      <annotators-menu-item :disabled="!isLoggedIn" />
    </div>
    <div class="sidebar__bottom">
      <div class="sidebar__menus">
        <feedback-menu-item
          v-if="isLoggedIn"
          class="sidebar__menu--pos-bottom"
        />
        <academy-menu-item
          class="sidebar__menu--pos-bottom"
        />
        <documentation-menu-item
          class="sidebar__menu--pos-bottom"
        />
        <add-a-client-menu-item
          class="sidebar__menu--pos-bottom"
        />
        <settings-menu-item
          v-if="isLoggedIn"
          class="sidebar__menu--pos-bottom"
        />
        <administration-menu-item
          v-if="isSuperUser"
          class="sidebar__menu--pos-bottom"
        />
      </div>
      <div class="sidebar__bottom__footer">
        <a
          href="https://v7labs.com/"
          rel="noreferrer noopener"
          target="_blank"
        >
          <icon-v7-logo
            v-if="!sidebarMinimized"
            class="sidebar__bottom__footer__logo"
          />
        </a>
        <div
          class="sidebar__bottom__footer__collapse"
          @click.stop="toggleSidebar"
        >
          <icon-mono-collapse-left v-if="!sidebarMinimized" />
          <icon-mono-collapse-right v-else />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'

import { IconV7Logo } from '@/assets/icons/V2'
import { IconMonoCollapseLeft, IconMonoCollapseRight } from '@/assets/icons/V2/Mono'
import { CustomButton } from '@/components/Common/Button/V2'
import AcademyMenuItem from '@/components/Layout/Sidebar/AcademyMenuItem.vue'
import AdministrationMenuItem from '@/components/Layout/Sidebar/AdministrationMenuItem.vue'
import AnnotatorsMenuItem from '@/components/Layout/Sidebar/AnnotatorsMenuItem.vue'
import ClassesMenuItem from '@/components/Layout/Sidebar/ClassesMenuItem.vue'
import DatasetsMenuItem from '@/components/Layout/Sidebar/DatasetsMenuItem.vue'
import DocumentationMenuItem from '@/components/Layout/Sidebar/DocumentationMenuItem.vue'
import FeedbackMenuItem from '@/components/Layout/Sidebar/FeedbackMenuItem.vue'
import ModelsMenuItem from '@/components/Layout/Sidebar/ModelsMenuItem.vue'
import SettingsMenuItem from '@/components/Layout/Sidebar/SettingsMenuItem.vue'
import SidebarHeader from '@/components/Layout/Sidebar/SidebarHeader.vue'
import WorkflowsMenuItem from '@/components/Layout/Sidebar/WorkflowsMenuItem.vue'
import AddAClientMenuItem from '@/components/PartnerTeam/AddAClientMenuItem.vue'
import { useAuth, useFeatureFlags, useStore } from '@/composables'

export default defineComponent({
  name: 'Sidebar',
  components: {
    AcademyMenuItem,
    AddAClientMenuItem,
    AdministrationMenuItem,
    AnnotatorsMenuItem,
    ClassesMenuItem,
    CustomButton,
    DatasetsMenuItem,
    DocumentationMenuItem,
    FeedbackMenuItem,
    IconMonoCollapseLeft,
    IconMonoCollapseRight,
    IconV7Logo,
    ModelsMenuItem,
    SettingsMenuItem,
    SidebarHeader,
    WorkflowsMenuItem
  },
  setup () {
    const { dispatch, state } = useStore()

    const sidebarZIndex = computed(() => state.ui.sidebarZIndex)

    const sidebarMinimized = computed<boolean>(() => state.ui.sidebarMinimized)

    const user = computed(()=> state.user.profile)
    const isAuthorizedUser = computed((): boolean => {
      return !!user.value
    })

    const currentTeam = computed(() => state.team.currentTeam)

    const memberships = computed(() => state.team.memberships)

    const isSuperUser = computed<boolean>(() => !!user.value?.superuser)

    const isLoggedIn = computed<boolean>(() =>  !!user.value)

    const membership = computed(() => {
      if (!user.value || !currentTeam.value) { return null }
      const membership = memberships.value
        .find(m =>
          m.team_id === currentTeam.value?.id &&
          m.user_id === user.value?.id
        )
      if (!membership) { return null }

      return membership
    })

    const { featureEnabled } = useFeatureFlags()

    const isV1Disabled = computed((): boolean => {
      return featureEnabled('DARWIN_V1_DISABLED')
    })

    const isV2Enabled = computed((): boolean => {
      return featureEnabled('DARWIN_V2_ENABLED')
    })

    const { isAuthorized } = useAuth()

    const showDatasetsMenuItem = computed((): boolean => {
      // user is team member or higher -> show
      if (isAuthorized('view_full_datasets')) { return true }

      // user is not logged in -> show, but as disabled
      if (!isLoggedIn.value) { return true }

      // user is annotator, in a v1 or a v1 + v2 team -> show
      if (!isAuthorized('view_full_datasets') && !isV1Disabled.value) { return true }

      // user is not team member, viewing open datasets -> show
      if (!membership.value) { return true }

      return false
    })

    const toggleSidebar = (): void => {
      dispatch('ui/setSidebarStatus', !sidebarMinimized.value)
    }

    const goToGetStarted = (): void => {
      window.location.href = 'https://v7labs.com/get-started'
    }

    return {
      goToGetStarted,
      isAuthorizedUser,
      isLoggedIn,
      isSuperUser,
      isV1Disabled,
      isV2Enabled,
      showDatasetsMenuItem,
      sidebarMinimized,
      sidebarZIndex,
      toggleSidebar
    }
  }
})
</script>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style src="./tooltip.scss" lang="scss"></style>

<style lang="scss" scoped>
.sidebar {
  float: left;
  width: $sidebarExpandedWidth;
  height: 100%;
  background: $colorSurfaceElevate;
  position: relative;
  z-index: 850;
  @include col;
}

.sidebar__menus {
  width: 100%;
  flex: 1 1 auto;
  overflow: auto;
}

.sidebar__bottom {
  width: 100%;

  .sidebar__menus {
    width: 100%;
    padding: 10px 0px;
  }
}

.sidebar__menu--pos-bottom {
  height: 40px;
}

.sidebar__bottom__footer {
  @include row--distributed;
  height: 30px;
  margin: 0 20px 10px 20px;
}

.sidebar__bottom__footer__collapse {
  @include noSelect;
  cursor: pointer;
}

.sidebar__bottom__footer__collapse {
  margin: 5px 0;
  height: 20px;
}

.sidebar--minimized {
  width: $sidebarCollapsedWidth;
}

.sidebar__redirect-btn {
  margin: auto;
}
</style>
