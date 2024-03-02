<template>
  <div class="feature-guard">
    <slot v-if="enabled" />
    <slot
      v-else-if="loaded && $slots.else"
      name="else"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { FeaturePayload } from '@/store/types'

/**
 * Used to hide a part of template behind a feature flag
 *
 * The component will render the given default slot if the given feature is enabled.
 *
 * If the given feature is disabled, it will, only once, emit a 'disabled' event.
 * If the given feature is disabled, and the "else" slot is given, it will render it.
 */
@Component({ name: 'feature-guard' })
export default class FeatureGuard extends Vue {
  @Prop({ required: true })
  feature!: string

  @State(state => state.features.list)
  features!: FeaturePayload[]

  get matchedFeature (): FeaturePayload | null {
    return (this.features || []).find(f => f.name === this.feature) || null
  }

  get enabled (): boolean {
    return !!this.matchedFeature && this.matchedFeature.enabled
  }

  get loaded (): boolean {
    return !!this.features
  }
}
</script>
