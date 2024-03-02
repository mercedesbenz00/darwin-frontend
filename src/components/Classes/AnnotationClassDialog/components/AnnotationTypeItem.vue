<template>
  <div
    v-if="annotationType"
    v-tooltip="disabled ? {
      content: disabledTooltip,
      placement: 'left',
      offset: 10
    } : undefined"
    class="annotation-type-item"
    :class="{
      'annotation-type-item--disabled': disabled,
      'annotation-type-item--selected': selected
    }"
    @click="onClick"
  >
    <type-icon
      class="annotation-type-item__icon"
      :type="typeName"
      :color="iconColor"
    />
    <span class="annotation-type-item__label">{{ typeNameFormatted }}</span>
    <!--
      The v-if here is because there is no tooltip defined for the "link" type,
      so any team which has links enabled will get errors otherwise.
      https://linear.app/v7labs/issue/V7-985/add-design-for-link-tooltip-in-annotation-class-dialog
    -->
    <annotation-type-item-info
      v-if="hasInfo"
      class="annotation-type-item__info"
      :data="annotationType"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import TypeIcon from '@/components/Common/AnnotationType/TypeIcon.vue'
import {
  AnnotationTypeName,
  AnnotationTypePayload,
  FeaturePayload,
  RootState
} from '@/store/types'
import { annotationTypeRichData, AnnotationTypeRichPayload, formatTypeName } from '@/utils'

import AnnotationTypeItemInfo from './AnnotationTypeItemInfo/AnnotationTypeItemInfo.vue'

@Component({
  name: 'annotation-type-item',
  components: { AnnotationTypeItemInfo, TypeIcon }
})
export default class AnnotationTypeItem extends Vue {
  @Prop({ required: true })
  typeName!: AnnotationTypeName

  get typeNameFormatted (): string {
    return formatTypeName(this.typeName)
  }

  @Prop({ type: Boolean, default: false })
  disabled!: boolean

  @Prop({ default: null })
  disabledTooltip!: string | null

  @Prop({ type: Boolean, default: false })
  selected!: boolean

  get iconColor (): string {
    return this.$theme.getColor('colorFeatherLight')
  }

  get hasInfo (): boolean {
    const typesWithNoInfo: AnnotationTypeName[] = ['graph', 'link', 'string', 'table']
    return !typesWithNoInfo.includes(this.typeName)
  }

  onClick (): void {
    if (this.disabled) { return }
    this.$emit('click', this.typeName)
  }

  @State((state: RootState) => state.features.list)
  features!: FeaturePayload[] | null

  @State((state: RootState) => state.aclass.types)
  annotationTypes!: AnnotationTypePayload[]

  /**
   * The following object maps annotation type names to the features
   * name that enables them.
   */
  featureEnabledTypes = {
    graph: 'DOCUMENTS',
    link: 'LINK_TOOL',
    string: 'DOCUMENTS',
    mask: 'RASTERS',
    table: 'DOCUMENTS'
  }

  /**
   * Computed property which is used to figure out with rich annotation types should be included
   * when some annotation types are guarded behind a feature flag.
   *
   * The return type is an object with the hidden annotation type name as key,
   * and the rich annotation type payload to be shown as value.
   */
  get annotationType (): AnnotationTypeRichPayload | null {
    const { annotationTypes, features, typeName } = this

    for (const [featureEnabledTypeName, featureName] of Object.entries(this.featureEnabledTypes)) {
      if (typeName !== featureEnabledTypeName) { continue }

      const feature = features?.find(f => f.name === featureName)
      if (!feature?.enabled) { return null }
    }

    const type = annotationTypes.find(t => t.name === typeName)
    const richType = annotationTypeRichData.find(r => r.name === typeName)

    if (!type || !richType) { return null }

    const richSubs = type.subs.map((sub) => {
      const richSub = annotationTypeRichData.find(r => r.name === typeName) || {}
      if (sub && richSub) {
        return { ...sub, ...richSub }
      }
      return null
    }).filter((sub): sub is AnnotationTypeRichPayload => !!sub)

    if (type && richType) {
      return {
        ...type,
        ...richType,
        richSubs
      }
    }

    return null
  }
}
</script>

<style lang="scss" scoped>
.annotation-type-item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 13px;
  padding: 2px 3px;
  border: 1px solid $colorSecondaryLight3;
  transition: background-color .2s;
  cursor: pointer;
  @include noSelect;

  &:hover:not(.annotation-type-item--disabled),
  &:active:not(.annotation-type-item--disabled) {
    border: 1px solid $colorSecondaryLight2;
    background-color: $colorSecondaryLight2;
    transition: none;
  }
}

.annotation-type-item--selected {
  border: 1px solid $colorSecondaryLight;
  background-color: $colorSecondaryLight1;

  &:hover:not(.annotation-type-item--disabled),
  &:active:not(.annotation-type-item--disabled) {
    border: 1px solid $colorSecondaryLight;
    background-color: $colorSecondaryLight1;
  }
}

.annotation-type-item--disabled {
  .annotation-type-item__icon {
    opacity: .3;
  }
  .annotation-type-item__label {
    opacity: .3;
  }
}

.annotation-type-item__icon {
  @include row--center;
  width: 23px;
  height: 23px;
  margin: 0 8px 0 3px;
  object-fit: contain;
}

.annotation-type-item__label {
  flex: 1;
  @include typography(md, default, normal);
  text-align: left;
  color: $colorSecondaryDark;
  white-space: nowrap;
}
</style>
