// Since KeycapSize is an enum, it is both a type and an object after
// compilation. Exporting it from Keycap does not import it here.
import { KeycapSize as ShortcutSize } from '@/components/Common/Keycap'

export type ShortcutProps = {
  alt: boolean,
  cmd: boolean,
  ctrl: boolean,
  inverted: boolean,
  shift: boolean,
  size: ShortcutSize
}

// Since KeycapSize is an enum, it is both a type and an object after
// compilation. To keep the export simple, we export it directly from Keycap.
export { KeycapSize as ShortcutSize } from '@/components/Common/Keycap'
