<template>
  <div class="overlay">
    <div
      :style="{ '--max-team-amount': maxTeamAmount, '--el-height': elHeight }"
      class="overlay-wrapper"
    >
      <team-item
        :team="currentTeam"
        class="overlay__team overlay__team--current"
        @click="showSettings"
      />
      <team-item
        v-for="client in currentTeam.clients"
        :key="`client-${client.id}`"
        :team="client"
        class="overlay__team overlay__team--current-client"
        @click="selectTeam(client)"
      />
      <template v-for="team in otherTeams">
        <team-item
          :key="team.id"
          :team="team"
          class="overlay__team overlay__team--other"
          @click="selectTeam(team)"
        />
        <team-item
          v-for="client in team.clients"
          :key="`client-${client.id}`"
          :team="client"
          class="overlay__team overlay__team--other-client"
          @click="selectTeam(client)"
        />
      </template>
    </div>
    <div class="overlay__actions">
      <settings-item class="overlay__settings" />
      <feature-guard feature="WORKER_MODE_TOGGLE">
        <worker-mode-item class="overlay__worker-mode" />
      </feature-guard>
      <div
        class="overlay__logout"
        @click="logout"
      >
        <power-icon class="overlay__logout__icon" />
        <div class="overlay__logout__text">
          Log Out
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { PowerIcon } from '@/assets/icons/V1'
import Avatar from '@/components/Common/Avatar/V1/Avatar.vue'
import FeatureGuard from '@/components/Common/FeatureGuard.vue'
import { TeamPayload } from '@/store/types'
import { notifyErrorByCode } from '@/utils'
import { ErrorCodes } from '@/utils/error/errors'

import SettingsItem from './SidebarOverlay/SettingsItem.vue'
import TeamItem from './SidebarOverlay/TeamItem.vue'
import WorkerModeItem from './SidebarOverlay/WorkerModeItem.vue'

@Component({
  name: 'sidebar-overlay',
  components: { Avatar, FeatureGuard, PowerIcon, SettingsItem, TeamItem, WorkerModeItem }
})

export default class SidebarOverlay extends Vue {
  readonly maxTeamAmount: number = 5
  readonly elHeight: string = '61px'

  @State(state => state.team.currentTeam)
  currentTeam!: TeamPayload

  @State(state => state.team.teams)
  teams!: TeamPayload[]

  get otherTeams (): TeamPayload[] {
    return this.teams.filter(team => team.id !== this.currentTeam.id)
  }

  get teamAmount (): number {
    let length = this.teams.length + this.currentTeam.clients.length
    this.otherTeams.forEach(team => {
      length += team.clients.length
    })

    return length
  }

  showSettings (): void {
    this.$store.dispatch('ui/showSettingsDialog', { tab: 'team' })
  }

  async selectTeam (team: TeamPayload): Promise<void> {
    if (team.disabled) {
      return notifyErrorByCode(this.$store, ErrorCodes.TEAM_DISABLED)
    }

    const { error } = await this.$store.dispatch('auth/selectTeam', { team_id: team.id })
    if (error) { return this.$store.dispatch('toast/warning', { content: error.message }) }

    // hack forces vue router to rerun beforeEach if the user was already at `/`
    this.$router.push('/hack')
    this.$router.replace('/')
  }

  // logout

  logout (): void {
    this.$store.dispatch('auth/logout')
  }
}
</script>

<style lang="scss" scoped>
$borderColor: rgba(203, 209, 222, 0.3);

.overlay {
  background: rgba(203, 209, 222, 0.3);
  position: absolute;
  left: 10px;
  top: 65px;
  width: 260px;
  height: auto;
  border-radius: 10px;
  background: $colorWhite;
  box-shadow: 0px 10px 20px rgba(20, 5, 60, 0.1), 0px 4px 4px rgba(20, 5, 60, 0.2);
  overflow: auto;
  cursor: pointer;
  z-index: 10;
}

.overlay-wrapper {
  @include scrollbar;
  display: block;
  overflow-y: scroll;
  overflow-x: hidden;

  min-height: var(--el-height);
  height: calc((var(--el-height) * var(--max-team-amount)) + (var(--el-height) / 2));
  max-height: 50vh;
  z-index: 1;
}

.overlay__actions {
  background: $colorWhite;
  z-index: 2;
  border-top: 1px solid $borderColor;
}

.overlay__team,
.overlay__settings,
.overlay__worker-mode {
  border-bottom: 1px solid $borderColor;
}

.overlay__team--current-client,
.overlay__team--other-client {
  padding: 10px 28px;
  position: relative;
}

.overlay__team--current-client:before,
.overlay__team--other-client:before {
  content: "";
  display: block;
  width: 3px;
  height: calc(100% - 20px);
  position: absolute;
  left: 16px;
  background: $borderColor;
}

.overlay__logout {
  @include row;
  align-items: center;
  padding: 22px 16px;
}

.overlay__logout__icon {
  width: 16px;
  height: 16px;
  margin-right: 8px;
}

.overlay__logout__text {
  @include typography(md-1, headlines);
  color: $colorSecondaryLight;
}
</style>
