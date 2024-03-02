<template>
  <div class="api-key-management">
    <access-instructions
      class="api-key-management__section"
      title="Use this deployed model"
      :snippets="snippets"
    />
    <h4 class="api-key-management__subheader">
      Using API keys
    </h4>
    <div class="api-key-management__section api-key-management__list">
      <key-list-item
        v-for="apiKey in apiKeys"
        :key="apiKey.id"
        class="api-key-management__list__item"
        :api-key="apiKey"
      >
        <revoke-key-button
          :api-key="apiKey"
          :model="model"
        />
      </key-list-item>
    </div>
    <div class="api-key-management__actions">
      <div class="api-key-management__actions__left">
        <positive-button
          class="api-key-management__new-key"
          @click="openCreateKeyModal"
        >
          NEW KEY
        </positive-button>
        <key-dropdown
          :api-keys="otherApiKeys"
          @select="addKeyToModel"
        />
      </div>
    </div>
    <modal
      :name="modalName"
      transition="pop-out"
      width="40%"
      height="auto"
      :click-to-close="false"
    >
      <create-key
        :model="model"
        @close="closeCreateKeyModal"
      />
    </modal>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { State } from 'vuex-class'

import AccessInstructions from '@/components/ApiKey/AccessInstructions.vue'
import KeyListItem from '@/components/ApiKey/KeyListItem.vue'
import { AccessCodeExample, SupportedLanguages } from '@/components/ApiKey/types'
import { isRunningSession } from '@/components/Models/utils'
import {
  attachPermissionToModel
} from '@/store/modules/apiKey/actions/attachPermissionToModel'
import { ApiKeyPayload } from '@/store/modules/apiKey/types'
import {
  RunningSessionPayload,
  TeamPayload,
  TrainedModelPayload,
  StoreActionPayload,
  RootState
} from '@/store/types'

import CreateKey from './ApiKeyManagement/CreateKey.vue'
import KeyDropdown from './ApiKeyManagement/KeyDropdown.vue'
import RevokeKeyButton from './ApiKeyManagement/RevokeKeyButton.vue'
import { ACCESS_CODES } from './ApiKeyManagement/snippets'

const isKeyForModel = (
  apiKey: ApiKeyPayload,
  model: RunningSessionPayload | TrainedModelPayload
): boolean =>
  apiKey.permissions.some(p => p[1] && p[1] !== 'all' && p[1].split(':')[1] === model.id)

/**
 * Renders model API key management UI
 *
 * Shows code instructions on how to access the inference API
 *
 * Lists API keys attached to current model.
 *
 * Allows detaching of individual keys, attaching of other keys available in team and creation of
 * new keys.
 */
@Component({
  name: 'api-key-management',
  components: {
    AccessInstructions,
    CreateKey,
    KeyDropdown,
    KeyListItem,
    RevokeKeyButton
  }

})

export default class ApiKeyManagement extends Vue {
  @Prop({ required: true, type: Object as () => RunningSessionPayload | TrainedModelPayload })
  model!: TrainedModelPayload | RunningSessionPayload

  private modalName = 'createApiKey'

  get snippets (): AccessCodeExample[] {
    return [
      SupportedLanguages.cli,
      SupportedLanguages.python,
      SupportedLanguages.shell,
      SupportedLanguages.javascript,
      SupportedLanguages.elixir
    ].map(language => ({
      code: ACCESS_CODES[language].replace('{modelId}', this.model.id),
      language
    }))
  }

  // key creation logic

  openCreateKeyModal () {
    this.$modal.show(this.modalName)
  }

  closeCreateKeyModal () {
    this.$modal.hide(this.modalName)
  }

  // key listing logic

  @State((state: RootState) => state.apiKey.apiKeys)
  allApiKeys!: ApiKeyPayload[]

  @State((state: RootState) => state.team.currentTeam)
  team!: TeamPayload

  get apiKeys (): ApiKeyPayload[] {
    return this.allApiKeys.filter(a => isKeyForModel(a, this.model))
  }

  mounted () {
    this.$store.dispatch('apiKey/getKeys')
  }

  // key attaching logic

  get otherApiKeys (): ApiKeyPayload[] {
    return this.allApiKeys.filter(a => !isKeyForModel(a, this.model))
  }

  async addKeyToModel (apiKey: ApiKeyPayload) {
    const { model } = this
    const params: StoreActionPayload<typeof attachPermissionToModel> = isRunningSession(model)
      ? { apiKey, runningSession: model }
      : { apiKey, trainedModel: model }

    const { error } = await this.$store.dispatch('apiKey/attachPermissionToModel', params)

    if (error) {
      this.$store.dispatch('toast/warning', { content: error.message })
    }
  }
}
</script>
<style lang="scss" scoped>
.api-key-management {
  width: 100%;
}

.api-key-management__subheader {
  @include typography(lg, headlines, bold);
  margin-bottom: 25px;
}

.api-key-management__section {
  margin-bottom: 25px;
}

.api-key-management__actions {
  @include row--distributed;
  margin-top: 25px;

}

.api-key-management__actions__left {
  @include row;
}

.api-key-management__new-key {
  margin-right: 10px;
}

.add-key-dropdown__option {
  padding: 5px;
}
</style>
