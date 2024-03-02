<template>
  <div class="create-key">
    <h1 class="create-key__header">
      Create new access key
    </h1>
    <div class="create-key__content">
      <input-field
        ref="name"
        placeholder="Key name"
        :disabled="!!key"
        :value="name"
        @change="name = $event"
        @enter="createKey"
      />
    </div>
    <created-key
      v-if="key"
      :value="key"
      class="created-key__info"
    />
    <div class="create-key__footer">
      <secondary-button @click="$emit('close')">
        Close
      </secondary-button>
      <positive-button
        v-if="!key"
        @click="createKey"
      >
        Create
      </positive-button>
      <positive-button
        v-else
        disabled
      >
        Created
      </positive-button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { State } from 'vuex-class'

import CreatedKey from '@/components/ApiKey/CreatedKey.vue'
import CopyToClipboard from '@/components/Common/CopyToClipboard.vue'
import InputField from '@/components/Common/InputField/V1/InputField.vue'
import { isRunningSession } from '@/components/Models/utils'
import { TeamPayload } from '@/store/modules/admin/types'
import { createForModel } from '@/store/modules/apiKey/actions/createForModel'
import {
  RunningSessionPayload,
  TrainedModelPayload,
  ValidationErrors,
  StoreActionPayload
} from '@/store/types'

@Component({ name: 'create-key', components: { CopyToClipboard, CreatedKey, InputField } })
export default class CreateKey extends Vue {
  @Prop({ required: true, type: Object as () => RunningSessionPayload | TrainedModelPayload })
  model!: RunningSessionPayload | TrainedModelPayload

  @State(state => state.team.currentTeam)
  currentTeam!: TeamPayload

  key: null | string = null
  name: string= ''

  $refs!: Vue['$refs'] & {
    name: InputField
  }

  validate (): { valid: boolean, errors: ValidationErrors } {
    const errors: ValidationErrors = {}
    if (!this.name || this.name === '') { errors.name = 'You must type in a name.' }
    return { errors, valid: Object.keys(errors).length === 0 }
  }

  setErrors (errors: ValidationErrors): void {
    if (errors.name) { this.$refs.name.setError(errors.name as string) }
  }

  async createKey () {
    const { valid, errors } = this.validate()

    if (!valid) { return this.setErrors(errors) }

    const { currentTeam: { id: teamId }, model, name } = this

    const payload: StoreActionPayload<typeof createForModel> = isRunningSession(model)
      ? { name, teamId, runningSession: model }
      : { name, teamId, trainedModel: model }

    const { data, error } = await this.$store.dispatch('apiKey/createForModel', payload)

    if (error) {
      return this.$store.dispatch('toast/warning', { content: error.message })
    }

    if (data) {
      this.key = `${data.prefix}.${data.value}`
    }
  }
}
</script>

<style lang="scss" scoped>
.create-key {
  background: $colorWhite;
  border-radius: inherit;
  padding: 25px;
}

.create-key__header {
  @include typography(xl, headlines, bold)
}

.create-key__content {
  margin-top: 25px;
  margin-bottom: 25px;
}

.create-key__footer {
  @include row--distributed;
}

.create-key__info {
  margin: 25px 0;
}
</style>
