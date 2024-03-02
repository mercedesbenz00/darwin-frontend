<template>
  <div class="instructions">
    <div class="instructions__header">
      <h3 class="instructions__header__title">
        {{ title }}
      </h3>
      <tab-selector
        class="instructions__header__tabs"
        :options="options"
        :value="language"
        @change="language = $event"
      />
    </div>
    <h4 class="instructions__subheader">
      API Access
    </h4>
    <pre class="instructions__code">{{ snippet.code }}</pre>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import TabSelector from '@/components/Common/TabSelector/TabSelector.vue'
import { TabSelectorOption } from '@/components/Common/TabSelector/types'

import { AccessCodeExample, SupportedLanguages } from './types'

const DEFAULT_TITLE = 'Using API keys'

const LANGUAGE_LABELS: Record<SupportedLanguages, string> = {
  [SupportedLanguages.cli]: 'CLI',
  [SupportedLanguages.elixir]: 'Elixir',
  [SupportedLanguages.javascript]: 'JavaScript',
  [SupportedLanguages.python]: 'Python',
  [SupportedLanguages.shell]: 'Shell'
}

/**
 * Renders code snippets as examples on how to use an API key
 *
 * Used both in the general UI in the settings dialog, as well as the model specific UI on /models.
 *
 * The two use-cases use different sets of snippets.
 */
@Component({ name: 'api-access-instructions', components: { TabSelector } })
export default class ApiAccessInstructions extends Vue {
  @Prop({ required: false, type: String, default: DEFAULT_TITLE })
  title!: string

  @Prop({ required: true, type: Array })
  snippets!: AccessCodeExample[]

  language: SupportedLanguages = SupportedLanguages.cli

  get options (): TabSelectorOption[] {
    return this.snippets.map(s => ({ value: s.language, label: LANGUAGE_LABELS[s.language] }))
  }

  /**
   * Returns code instructions for accessing the inference API using the selected language
   */
  get snippet (): AccessCodeExample | null {
    return this.snippets.find(s => s.language === this.language) || null
  }
}
</script>

<style lang="scss" scoped>
.instructions__header {
  margin-bottom: 25px;
  @include row--distributed;
  align-items: center;
}

.instructions__header__title {
  @include typography(lg-1, headlines, bold);
}

:deep(.instructions__header__tabs) {
  .tab-select__button {
    width: auto;
  }
}

.instructions__subheader {
  @include typography(lg, headlines, bold);
  margin-bottom: 25px;
}

.instructions__code {
  @include typography(md-2, source);
  line-height: 150%;
  background: $colorAliceShade;
  color: $colorSecondaryLight;
  padding: 8px 0 8px 10px;
  white-space: pre-wrap;
}
</style>
