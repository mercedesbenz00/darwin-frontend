import { BottomBarItem } from '@/components/WorkView/BottomBar/types'

/**
 * Default stub for the <feature-guard> component
 *
 * Renders the component in a way that makes it clear which part of the UI
 * is rendered when the feature is enabled and which when it's disabled.
 */
export const FeatureGuard = {
  template: `
    <div class="feature-guard">
      <div class="feature-on"><slot /></div>
      <div class="feature-off"><slot name="else" /></div>
    </div>
  `
}

// stub for gallery component to naively render all given slots and nothing else
export const Gallery = {
  props: { items: Array },
  template: `
    <div class="gallery">
      <template v-for="item of items">
        <slot :item="item" name="card" />
      </template>
      <template v-for="item of items">
        <slot :item="item" name="list-item" />
      </template>
    </div>
  `
}

// stubbed settings pane which renders named slots
// vue-test-utils do not do it with shallowMount, by default
export const SettingsPane = {
  props: { tag: String },
  template: `
    <component :is="tag || 'div'" class="settings-pane">
      <div class="settings-pane__body">
        <slot name="body"/>
      </div>
      <div class="settings-pane__footer">
        <slot name="footer"/>
      </div>
      <slot/>
    </component>
  `
}

// stub for DatasetManagementTab, which serves as the layout for all the tabs
// in the dataset management section
export const DatasetManagementTab = {
  template: `
    <div class="dataset-management">
      <slot name="actions" />
      <slot name="content" />
      <slot name="sidebar" />
      <slot name="dialog" />
    </div>
  `
}

export const DatasetDetailLayout = {
  template: `
    <div class="dataset-details">
      <slot name="header-actions" />
      <slot name="content" />
      <slot name="sidebar" />
    </div>
  `
}

// stub for the base Card component used by all other Card components from the
// DatasetManagement section
export const Card = {
  props: ['to'],
  template: `
  <div class="card-stub">
    <div v-if="$slots['overlay-top-left']" class="overlay-top-left">
      <slot name="overlay-top-left" />
    </div>
    <div v-if="$slots['overlay-top-right']" class="overlay-top-right">
      <slot name="overlay-top-right" />
    </div>
    <div v-if="$slots['overlay-center']" class="overlay-center">
      <slot name="overlay-center" />
    </div>
    <div class="details"><slot name="details" /></div>
  </div>
  `
}

// stub for the base ListItem component used by all other ListItem components
// from DatasetManagement section
export const ListItem = {
  template: `
  <div class="list-item-stub">
    <div v-if="$slots['overlay']" class="overlay"><slot name="overlay" /></div>
    <div class="status"><slot name="status" /></div>
    <slot name="details" />
  </div>
  `
}

// stub for Workview layout component
export const Workview = {
  template: `
    <div class="workview-stub">
      <div class="top"><slot name="top" /></div>
      <div class="bottom"><slot name="bottom" /></div>
      <div class="left"><slot name="left" /></div>
      <div class="right"><slot name="right" /></div>
      <div class="sticky-bars"><slot name="sticky-bars" /></div>
      <div class="main"><slot name="main" /></div>
      <div class="default"><slot /></div>
    </div>
  `,
  methods: {
    showClassDialog (): void {}
  }
}

// stub for the workview LayerBar layout component
export const LayerBar = {
  name: 'layer-bar',
  template: `
    <div class="layer-bar-stub">
      <div v-if="$slots.header" class="header-slot-given">
        <slot name="header" />
      </div>
      <div v-if="$slots.default" class="default-slot-given">
        <slot />
      </div>
      <div v-if="$slots.empty" class="empty-slot-given">
        <slot name="empty" />
      </div>
    </div>
  `
}

// stub for the generic workview BottomBar
export const BottomBar = {
  props: { items: Array as () => BottomBarItem[] },
  template: `
    <div class="bottom-bar">
      <template v-for="item of items">
        <slot v-if="item.data" :item="item" name="item" />
        <div v-else-if="item.loading" class="loading-placeholder"></div>
        <slot v-else name="other" />
      </template>
    </div>
  `
}

// stub for the generic workview TopBar
export const TopBar = {
  template: `
    <div class="top-bar-stub">
      <div v-if="$slots.left" class="top-bar-stub__left-container">
        <slot name="left" />
      </div>
      <div class="top-bar-stub__right-container">
        <div v-if="$slots.center" class="center-slot-given">
          <slot name="center" />
        </div>
        <div v-if="$slots.right" class="right-slot-given">
          <slot name="right" />
        </div>
      </div>
    </div>
  `
}

export const AnnotatorScorePopover = {
  template: `
    <div class="annotator-score-popover">
      <slot />
    </div>
  `
}

export const AnnotationClassSection = {
  template: `
    <div class="annotation-section">
      <div class="annotation-section__labels">
        <slot name="label" />
      </div>
      <slot/>
    </div>
  `
}

export const VPopover = {
  template: `
    <div class="v-popover-stub">
      <div class="main">
        <slot />
      </div>
      <div class="popover">
        <slot name="popover" />
      </div>
    </div>
  `
}

export const StageItem = {
  template: `
    <div class="stage-item-stub">
      <div v-if="$slots.main" class="main-slot-given"><slot name="main"/></div>
      <div v-if="$slots.hover" class="main-slot-given"><slot name="hover"/></div>
    </div>
  `
}

export const ProductLayout = {
  template: `
    <div class="product-layout-stub">
      <div v-if="$slots.billed" class="billed-slot-given"><slot name="billed"/></div>
      <div v-if="$slots.remaining" class="remaining-slot-given"><slot name="remaining"/></div>
      <div v-if="$slots.edit" class="edit-slot-given"><slot name="edit"/></div>
    </div>
  `
}

export const EditProductLayout = {
  props: ['disabled'],
  template: `
    <div class="edit-product-layout-stub">
      <div v-if="$slots.title" class="title-slot-given"><slot name="title"/></div>
      <div v-if="$slots.current" class="current-slot-given"><slot name="current"/></div>
      <div v-if="$slots.new" class="new-slot-given"><slot name="new"/></div>
      <div v-if="$slots.issues" class="issues-slot-given"><slot name="issues"/></div>
      <div v-if="$slots.extra" class="extra-slot-given"><slot name="extra"/></div>
    </div>
  `
}

export const Modal = {
  template: '<div class="modal-stub"><slot/></div>'
}

export const Transition = {
  template: '<div class="transition-stub"><slot/></div>'
}

export const TransitionGroup = {
  template: '<div class="transition-group-stub"><slot/></div>'
}

export const ConfirmationDialogLayout = {
  props: ['disabled'],
  template: `
    <div class="confirmation-dialog-layout-stub">
      <div v-if="$slots.title" class="title-slot-given"><slot name="title"/></div>
      <div v-if="$slots.description" class="description-slot-given"><slot name="description"/></div>
      <div v-if="$slots.footer" class="footer-slot-given"><slot name="footer"/></div>
    </div>
  `
}

export const ConfirmationDialog = {
  props: ['disabled'],
  template: `
    <div class="confirmation-dialog-stub">
      <div v-if="$slots.title" class="title-slot-given"><slot name="title"/></div>
      <div v-if="$slots.detail" class="detail-slot-given"><slot name="detail"/></div>
      <div v-if="$slots.footer" class="footer-slot-given"><slot name="footer"/></div>
    </div>
  `
}

export const ImageManipulator = {
  props: ['editor'],
  template: `
    <div class="image-manipulation__item">
      <div class="image-manipulation__item__label">
        <slot name="label" />
      </div>
      <div v-if="$slots['value']" class="image-manipulation__item__value">
        <slot name="value" />
      </div>
      <slot name="others" />
      <div v-if="$slots['slider']" class="image-manipulation__item__slider">
        <slot name="slider" />
      </div>
    </div>
  `
}

export const VueSlider = {
  template: `
    <div class="vue-slider">
      <slot name="dot" :focus="true" :value="5" index="1" />
      <slot name="process" :style="{}" />
      <slot name="tooltip" value="tooltip value" />
    </div>
  `
}

export const PickDatasetModal = {
  template: `
    <div class="pick-dataset-modal-stub">
      <slot name="title" />
      <slot name="description" />
      <slot name="actions" />
    </div>
  `,
  methods: {
    show: jest.fn()
  }
}

export const VueTagsInput = {
  template: `
    <div class="vue-tags-input-stub">
      <input class="ti-new-tag-input" />
      <div class="vue-tags-input-stub__tag-actions">
        <slot name="tag-actions" :tag="{ id: 1 }" />
      </div>
    </div>
  `
}

export const Mentionable = {
  template: `
    <div class="mentionable">
      <slot />
      <slot name="no-result" />
      <template v-for="item of items">
        <slot :item="item" name="item-at" />
      </template>
    </div>
  `,
  props: { items: Array }
}

export const Dropdown = {
  props: ['loading', 'options', 'value'],
  template: `
    <div class="dropdown">
      <slot name="header" />
      <slot name="footer" />
      <slot name="list-header" />
      <slot name="list-footer" />

      <slot name="no-options" search="search" searching="searching" :loading="loading" />
      <slot name="open-indicator" :attributes="{ ref: 'ref' }" />
      <ul class="vs__dropdown-menu">
        <li v-for="(option, index) of options" :key="index">
          <slot name="option" v-bind="option" />
        </li>
      </ul>
      <slot name="search" :attributes="{}" :events="{}" />
      <slot name="selected-option" v-bind="value" />
      <div v-for="(option, index) of value" :key="index" class="selected-option-container">
        <slot
          name="selected-option-container"
          :option="option"
          deselect="deselect"
          multiple="multiple"
          disabled="disabled"
        />
      </div>
      <slot name="spinner" :loading="loading" />
    </div>
  `
}

export const GenericFilterHeader = {
  template: `
    <div class="generic-filter-header">
      <div class="generic-filter-header__title">
        <slot name="title" />
      </div>
      <slot name="content" />
    </div>
  `
}
