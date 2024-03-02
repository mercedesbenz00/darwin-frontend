<template>
  <div
    :id="id"
    class="mapping-item"
  >
    <div class="mapping-item__wind-class">
      <type-icon :type="modelType" />
      <div class="mappint-item__wind-class__label">
        {{ modelName }}
      </div>
      <div
        v-if="modelSubs.length > 0"
        class="mapping-item__wind-class__subs"
      >
        <type-icon
          v-for="sub in modelSubs"
          :key="sub"
          v-tooltip="sub"
          :type="sub"
        />
      </div>
    </div>
    <div class="mapping-item__next">
      <next-icon />
    </div>
    <dropdown
      :clearable="false"
      :dropdown-parent-selector="`#${id}`"
      :options="dropdownOptions"
      :value="selectedClassOption"
      append-to-body
      theme="light"
      @input="onClassSelect"
    >
      <template #selected-option="{ data, id, label }">
        <div class="mapping-item__option">
          <type-icon
            v-if="id !== NOTHING_ID"
            :color="data.color"
            :type="data.type"
          />
          <div class="mapping-item__option__text">
            {{ label }}
          </div>
        </div>
      </template>
      <template #option="{ data, id, label }">
        <div
          v-tooltip="label"
          class="mapping-item__option"
        >
          <type-icon
            v-if="id !== NOTHING_ID"
            :color="data.color"
            :type="data.type"
          />
          <div class="mapping-item__option__text">
            {{ label }}
          </div>
          <div
            v-if="id !== NOTHING_ID && data.subs.length > 0"
            class="mapping-item__option__subs"
          >
            <type-icon
              v-for="sub in data.subs"
              :key="sub"
              v-tooltip="sub"
              :type="sub"
            />
          </div>
        </div>
      </template>
    </dropdown>
    <div
      v-for="(error, index) of errors"
      :key="index"
      class="mapping-item__error"
    >
      {{ error }}
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { Getter } from 'vuex-class'

import NextIcon from '@/assets/icons/V1/next.svg?inline'
import TypeIcon from '@/components/Common/AnnotationType/TypeIcon.vue'
import TypeIconWithLabel from '@/components/Common/AnnotationType/TypeIconWithLabel.vue'
import Dropdown from '@/components/Common/Dropdown/Dropdown.vue'
import { DropdownOption } from '@/components/Common/Dropdown/types'
import { MappedClass, UnmappedClass } from '@/components/DatasetSettings/ModelStage/types'
import { AnnotationClassPayload, AnnotationTypePayload } from '@/store/types'

import { areTypesCompatible } from './utils'

const NOTHING_ID = 'NOTHING'

@Component({
  name: 'class-mapping-item',
  components: { Dropdown, NextIcon, TypeIcon, TypeIconWithLabel }
})
export default class ClassMappingItem extends Vue {
  @Prop({ required: true, type: Object as () => MappedClass | UnmappedClass })
  mappedClass!: MappedClass | UnmappedClass

  get id (): string {
    const { mappedClass } = this
    return `modelClass-${mappedClass.modelClass.name.replace(' ', '')}`
  }

  get modelType (): string {
    const { mappedClass: { modelClass } } = this
    return modelClass.type
  }

  get modelName (): string {
    const { mappedClass: { modelClass } } = this

    return modelClass.display_name || modelClass.name
  }

  /** Lists all subs on model class, except auto_annotate */
  get modelSubs (): string[] {
    const { mappedClass: { modelClass } } = this
    return modelClass.subs.filter(s => s !== 'auto_annotate' && s !== 'measures')
  }

  get selectedClassId (): string {
    const { mappedClass: { annotationClass } } = this
    return annotationClass ? annotationClass.id.toString() : NOTHING_ID
  }

  get selectedClassOption (): DropdownOption | null {
    const { dropdownOptions, selectedClassId } = this
    return dropdownOptions.find(o => o.id === selectedClassId) || null
  }

  @Prop({ required: true, type: Array as () => AnnotationClassPayload[] })
  annotationClasses!: AnnotationClassPayload[]

  @Getter('mainAnnotationTypeForClass', { namespace: 'aclass' })
  getMainAnnotationType!: (data: AnnotationClassPayload) => AnnotationTypePayload

  @Getter('subAnnotationTypesForClass', { namespace: 'aclass' })
  getSubAnnotationTypes!: (data: AnnotationClassPayload) => AnnotationTypePayload[]

  /** Wind and Darwin class are compatible if they have the same main type */
  get compatibleClasses (): AnnotationClassPayload[] {
    const { annotationClasses, mappedClass: { modelClass } } = this
    return annotationClasses
      .filter(c => areTypesCompatible(this.getMainAnnotationType(c).name, modelClass.type))
  }

  readonly NOTHING_ID = NOTHING_ID

  get dropdownOptions (): DropdownOption[] {
    const defaultOption: DropdownOption = {
      id: NOTHING_ID,
      label: 'Nothing'
    }

    const options: DropdownOption[] = this.compatibleClasses.map(c => ({
      id: c.id.toString(),
      label: c.name,
      data: {
        color: c.metadata._color,
        type: this.getMainAnnotationType(c).name,
        /**
         * Subs are rendered on the option item.
         * We generally do not show the auto_annotate sub.
         */
        subs: this.getSubAnnotationTypes(c).map(t => t.name).filter(t =>
          t !== 'auto_annotate' && t !== 'measures')
      }
    }))

    return [defaultOption, ...options]
  }

  onClassSelect (option: DropdownOption): void {
    const { id } = option
    const payload = this.annotationClasses.find(c => c.id.toString() === id) || null
    this.$emit('class-selected', payload)
  }

  /**
   * Checks for any compatibility issues between wind and darwin class and
   * returns a list of them.
   */
  get errors (): string[] {
    const { mappedClass } = this
    const { annotationClass, modelClass } = mappedClass

    if (!annotationClass) { return [] }

    // auto_annotate sub is used differently from other subtypes, so it does not
    // need to be validated. We exclude it from both lists.
    const darwinSubs =
      this.getSubAnnotationTypes(annotationClass)
        .map(t => t.name).filter(t => t !== 'auto_annotate' && t !== 'measures')

    const windSubs = modelClass.subs.filter(s => s !== 'auto_annotate' && s !== 'measures')

    const errors: string[] = []

    // if darwin class is missing a subtype wind class defines -> issue
    windSubs.forEach(s => {
      if (!darwinSubs.includes(s)) {
        errors.push(`Class is missing ${s} support`)
      }
    })

    return errors
  }

  autoselectMatchingClass (): void {
    const payload = this.dropdownOptions.find(({ label }) => label === this.modelName) || null
    if (payload) { this.onClassSelect(payload) }
  }

  public mounted (): void {
    if (this.selectedClassId === NOTHING_ID) { this.autoselectMatchingClass() }
  }
}
</script>

<style lang="scss" scoped>
.mapping-item {
  display: grid;
  column-gap: 10px;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
}

.mapping-item__wind-class {
  display: grid;
  grid-template-columns: auto 1fr;
  justify-content: start;
  align-items: center;
  column-gap: 10px;
}

.mapping-item__wind-class__label {
  @include typography(md, Mulish);
  @include ellipsis(1, md);
  color: $color90Black;
}

.mapping-item__wind-class__subs {
  grid-column: 2;
  display: grid;
  grid-auto-flow: column;
  justify-content: start;
  align-items: center;
  column-gap: 5px;

  @include typography(sm, Mulish);

  svg {
    height: 12px;
    width: 12px;
  }
}

.mapping-item__next {
  color: #91A9C0;
}

.mapping-item__error {
  color: $colorPink;
  grid-column: 3;
  @include typography(sm, Mulish);
}

</style>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.mapping-item__option {
  display: grid;
  grid-template-columns: 20px 1fr;
  column-gap: 10px;
  justify-content: start;
  align-items: center;
  padding: 5px;
}

.mapping-item__option__text {
  grid-column: 2;
  @include ellipsis;
}

.mapping-item__option__subs {
  grid-column: 2;
  display: grid;
  grid-auto-flow: column;
  justify-content: start;
  align-items: center;
  column-gap: 5px;

  @include typography(sm, Mulish);

  svg {
    height: 12px !important;
    width: 12px !important;
  }
}
</style>
