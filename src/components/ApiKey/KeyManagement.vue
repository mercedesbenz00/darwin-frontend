<template>
  <div class="key-management">
    <access-instructions
      class="key-management__instructions"
      :snippets="snippets"
    />
    <loading-wrapper
      :loading="loading"
      label="Loading your keys"
    >
      <div class="key-management__subheader">
        <span>Your Keys</span>
        <info
          title="Keys you've created"
        >
          {{ `These are for all of your teams, not just ${team.name}` }}
        </info>
      </div>
      <div class="key-management__list">
        <key-list-item
          v-for="apiKey in userKeys"
          :key="apiKey.id"
          class="key-management__list__item"
          :api-key="apiKey"
        >
          <template #icon>
            <key-team-avatar :api-key="apiKey" />
          </template>
          <delete-key-button :api-key="apiKey" />
        </key-list-item>
        <div v-if="userKeys.length == 0">
          You haven't created any keys yet.
        </div>
      </div>
      <template v-if="teamKeys.length > 0">
        <div class="key-management__subheader">
          <span>{{ team.name }} Keys</span>
          <info
            :title="`Keys by other ${team.name} members`"
          >
            {{ `You're seeing this because you're an administrator in ${team.name}` }}
          </info>
        </div>
        <div class="key-management__list">
          <key-list-item
            v-for="apiKey in teamKeys"
            :key="apiKey.id"
            class="key-management__list__item"
            :api-key="apiKey"
          >
            <template #icon>
              <key-owner-avatar :api-key="apiKey" />
            </template>
            <delete-key-button :api-key="apiKey" />
          </key-list-item>
        </div>
      </template>
    </loading-wrapper>
    <div class="key-management__actions">
      <positive-button @click="openCreateKeyModal">
        NEW KEY
      </positive-button>
    </div>
    <modal
      :name="modalName"
      transition="pop-out"
      width="40%"
      height="auto"
      :click-to-close="false"
    >
      <create-key
        :team="team"
        @close="closeCreateKeyModal"
      />
    </modal>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import Info from '@/components/Common/Info.vue'
import LoadingWrapper from '@/components/Common/LoadingWrapper.vue'
import { ApiKeyPayload } from '@/store/modules/apiKey/types'
import { RootState, TeamPayload, UserPayload } from '@/store/types'

import AccessInstructions from './AccessInstructions.vue'
import CreateKey from './CreateKey.vue'
import DeleteKeyButton from './DeleteKeyButton.vue'
import KeyListItem from './KeyListItem.vue'
import KeyOwnerAvatar from './KeyOwnerAvatar.vue'
import KeyTeamAvatar from './KeyTeamAvatar.vue'
import { ACCESS_CODES } from './snippets'
import { AccessCodeExample, SupportedLanguages } from './types'

/**
 * Renders general API key management UI.
 *
 * Lists API keys accessible by user. These can be
 *
 * - keys created by user, in all of the user's teams
 * - keys created by other users, in the current team
 *
 * Allows creation and revoking of keys.
 *
 * Created keys are associated to current team.
 */
@Component({
  name: 'key-management',
  components: {
    AccessInstructions,
    CreateKey,
    DeleteKeyButton,
    Info,
    KeyListItem,
    KeyOwnerAvatar,
    KeyTeamAvatar,
    LoadingWrapper
  }
})
export default class KeyManagement extends Vue {
  private modalName = 'createApiKey'

  snippets: AccessCodeExample[] = [
    { language: SupportedLanguages.cli, code: ACCESS_CODES[SupportedLanguages.cli] },
    { language: SupportedLanguages.python, code: ACCESS_CODES[SupportedLanguages.python] }
  ]

  // key creation logic

  openCreateKeyModal () {
    this.$modal.show(this.modalName)
  }

  closeCreateKeyModal () {
    this.$modal.hide(this.modalName)
  }

  // key listing logic

  @State((state: RootState) => state.apiKey.apiKeys)
  apiKeys!: ApiKeyPayload[]

  @State((state: RootState) => state.team.currentTeam)
  team!: TeamPayload

  @State((state: RootState) => state.user.profile)
  user!: UserPayload

  mounted () {
    this.loadKeys()
  }

  loading: boolean = false

  async loadKeys () {
    this.loading = true
    await this.$store.dispatch('apiKey/getKeys')
    this.loading = false
  }

  get userKeys () {
    return this.apiKeys.filter(a => a.user_id === this.user.id)
  }

  get teamKeys () {
    return this.apiKeys.filter(a => a.user_id !== this.user.id && a.team_id === this.team.id)
  }
}
</script>
<style lang="scss" scoped>
.key-management {
  width: 100%;
}

.key-management__subheader {
   @include typography(lg-1, headlines, bold);
   @include row;
}

.key-management__subheader > :first-child {
  margin-right: 10px;
}

.key-management__subheader,
.key-management__list,
.key-management__actions,
.key-management__instructions {
  margin-bottom: 25px;
}

.key-management__actions {
  @include row--distributed;
}
</style>
