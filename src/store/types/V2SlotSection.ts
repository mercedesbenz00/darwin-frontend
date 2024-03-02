/* eslint-disable camelcase */
export type V2SlotSectionResponse = {
  slot_sections: V2SlotSection[]
  page: any
}
/* eslint-enable camelcase */

/* eslint-disable camelcase */
export type V2SlotSection = {
  hq_url: string
  lq_url: string
  section_index: number
  type: 'frame' | 'simple_image' | 'page' | 'slice' | 'tiled_image',
  tile_urls?: {},
  width?: number,
  height?: number
}
/* eslint-enable camelcase */
