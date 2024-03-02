<template>
  <background>
    <div class="auth header">
      <logo />
    </div>
    <div class="center__content">
      <div class="select-team__header">
        <p>
          Team {{ currentTeamName }} was disabled. Please
          <a
            href="mailto:support@v7labs.com"
          >contact support</a> to re-enable it.
        </p>
        <p
          v-if="availableTeams.length > 0"
        >
          You can alternatively keep using Darwin by selecting another team.
        </p>
      </div>
      <div class="select-team__modal">
        <div
          v-for="teamItem in availableTeams"
          :key="teamItem.id"
          class="select-team__modal__item select-team__modal__user"
          @click="selectTeam(teamItem)"
        >
          <img
            v-if="teamItem.image"
            :src="teamItem.image.url"
            class="select-team__modal__avatar"
          >
          <div
            v-else
            class="select-team__modal__avatar-alternate"
          >
            {{ teamItem.initials }}
          </div>
          <div class="select-team__modal__team">
            <div class="select-team__modal__team-name--other">
              {{ teamItem.name }}
            </div>
          </div>
        </div>
        <div
          class="select-team__modal__item select-team__modal__logout"
          @click="onLogout"
        >
          <power-icon class="select-team__modal__logout__icon" />
          <div class="select-team__modal__logout__text">
            Log Out
          </div>
        </div>
      </div>
    </div>
  </background>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { PowerIcon } from '@/assets/icons/V1'
import Background from '@/components/Common/Background.vue'
import Logo from '@/components/Common/Logo.vue'
import { TeamPayload } from '@/store/types'
import { getShortenedName, notifyErrorByCode } from '@/utils'
import { ErrorCodes } from '@/utils/error/errors'

@Component({
  name: 'team-select',
  components: { Background, Logo, PowerIcon }
})
export default class TeamSelect extends Vue {
  @State(state => state.team.currentTeam)
  currentTeam!: TeamPayload

  @State(state => state.team.teams)
  teams!: TeamPayload[]

  get availableTeams () {
    return this.teams
      .filter(team => !team.disabled)
      .map(team => Object.assign({}, team, { initials: getShortenedName(team.name) }))
  }

  get currentTeamName () {
    return this.currentTeam.name
  }

  async selectTeam (team: TeamPayload) {
    if (team.disabled) {
      return notifyErrorByCode(this.$store, ErrorCodes.TEAM_DISABLED)
    }

    const { error } = await this.$store.dispatch('auth/selectTeam', { team_id: team.id })
    if (error) { return this.$store.dispatch('toast/warning', { content: error.message }) }

    // hack forces vue router to rerun beforeEach if the user was already at `/`
    this.$router.push('/hack')
    this.$router.replace('/')
  }

  async onLogout () {
    await this.$store.dispatch('auth/logout')
    this.$router.replace('/login')
  }
}
</script>

<style lang="scss" scoped>
$borderColor: rgba(203, 209, 222, 0.3);

.select-team__header {
  width: 33vw;
  margin-bottom: 10px;
}

.select-team__header p {
  margin-bottom: 10px;
}

.select-team__modal {
  width: 33vw;
  max-height: 50vh;
  border-radius: 10px;
  background: $colorWhite;
  box-shadow: 0px 10px 20px rgba(20, 5, 60, 0.1), 0px 4px 4px rgba(20, 5, 60, 0.2);
  overflow: auto;
  cursor: pointer;
  z-index: 10;
}

.select-team__modal__item:hover {
  background: #CCF4F0;
  cursor: pointer;
}

.select-team__modal__user {
  @include row;
  align-items: center;
  padding: 10px 16px;
  border-bottom: 1px solid $borderColor;
}
.select-team__modal__avatar {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  overflow: hidden;
  object-fit: cover;
  margin-right: 14px;
}
.select-team__modal__avatar-alternate {
  width: 40px;
  height: 40px;
  border: 2px solid $colorSecondaryLight;
  border-radius: 10px;
  color: $colorSecondaryLight1;
  @include typography(lg-1);
  @include row--center;
  margin-right: 14px;
}

.select-team__modal__team {
  @include col;
  width: calc(100% - 54px);
  justify-content: center;
}
.select-team__modal__team-name {
  @include ellipsis(2, md-1);
  font-family: $fontFamilyDefault;
  color: $colorSecondaryDark1;
}
.select-team__modal__team-name--other {
  @include ellipsis(1, md-1);
  font-family: $fontFamilyDefault;
  color: $colorSecondaryDark1;
}
.select-team__modal__team-members {
  @include typography(md-1, headlines);
  color: $colorSecondaryLight;
}

.select-team__modal__new-team {
  @include row;
  align-items: center;
  padding: 10px 16px;
  border-bottom: 1px solid $borderColor;
}
.select-team__modal__new-team__icon {
  width: 40px;
  height: 40px;
  object-fit: contain;
  margin-right: 14px;
}
.select-team__modal__new-team__text {
  @include typography(md-1, headlines);
  color: $colorSecondaryLight;
}

.select-team__modal__settings {
  @include row;
  align-items: center;
  padding: 12px 16px;
}
.select-team__modal__settings__icon {
  width: 16px;
  height: 16px;
  margin-right: 8px;
}
.select-team__modal__settings__text {
  @include typography(md-1, headlines);
  color: $colorSecondaryLight;
}

.select-team__modal__logout {
  @include row;
  align-items: center;
  padding: 22px 16px;
}
.select-team__modal__logout__icon {
  width: 16px;
  height: 16px;
  margin-right: 8px;
}
.select-team__modal__logout__text {
  @include typography(md-1, headlines);
  color: $colorSecondaryLight;
}
</style>
