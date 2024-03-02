// allows import (instead of require) of .scss modules
declare module '*.scss' {
  const content: Record<string, string>
  export = content
}

declare module '*.vue' {
  import Vue from 'vue';
  export default Vue;
}

declare module 'vue-dragscroll' {
  export var dragscroll: any
}

declare module 'vuedraggable' {

  export type ChangeEvent<T> = {
    added: { newIndex: number, element: T } | null
    removed: { oldIndex: number, element: T} | null
    moved: { newIndex: number, oldIndex: number, element: T }
  }

  export type EndEvent<T> = {
    item: HTMLElement
    newDraggableIndex: number
    newIndex: number
    oldDraggableIndex: number
    oldIndex: number
  }

  const draggableComponent: ComponentOptions<Vue>

  export default draggableComponent
}

declare module 'portal-vue'
declare module 'vue-virtual-scroller'
declare module 'vue2-circle-progress'
declare module 'vue-croppie'
declare module 'vue-content-loader'
declare module '@johmun/vue-tags-input' {
  export type VueTagsInputProp = {
    index: number
    tag: any
  }
  const value: ComponentOptions<Vue>
  export default value
}
declare module '@chenfengyuan/vue-qrcode'
declare module 'vue-tables-2'
declare module 'vue-resize'
declare module 'vue-draggable-resizable'
declare module 'vue-mention'

declare module '*.json' {
  const value: any
  export default value
}

declare module '*.svg?inline' {
    const content: VueConstructor<Vue>
  export default content
}

declare module 'polybooljs' {
  export type Polygon = {
    regions: number[][][];
    inverted: boolean;
  }

  export type Segment = {
    segments: Segment[],
    inverted: boolean;
  }

  export type GeoJSON = {
    type: string;
    coordinates: MultiPolygon
  }

  /**
   * Getter/setter for buildLog
   */
  export const buildLog: (bl: boolean) => object[] | boolean
  /**
   * Getter/setter for epsilon
   */
  export const epsilon: (value?: number) => number
  export const segments: (poly: Polygon) => Segment
  export const combine: (segment1: Segment, segment2: Segment) => {
    combined: object
    inverted1: boolean
    inverted2: boolean
  }
  export const selectUnion: (combined: object) => Segment
  export const selectIntersect: (combined: object) => Segment
  export const selectDifference: (combined: object) => Segment
  export const selectDifferenceRev: (combined: object) => Segment
  export const selectXor: (combined: object) => Segment
  export const polygon: (segments: Segment) => Polygon
  export const polygonFromGeoJSON: (geojson: GeoJSON) => Polygon
  export const polygonToGeoJSON: (poly: Polygon) => GeoJSON
  export const union: (poly1: Polygon, poly2: Polygon) => Polygon
  export const intersect: (poly1: Polygon, poly2: Polygon) => Polygon
  export const difference: (poly1: Polygon, poly2: Polygon) => Polygon
  export const differenceRev: (poly1: Polygon, poly2: Polygon) => Polygon
  export const xor: (poly1: Polygon, poly2: Polygon) => Polygon
}

// free-email-domains exports string array in json format
declare module 'free-email-domains' {
  const value: string[]
  export default value
}
