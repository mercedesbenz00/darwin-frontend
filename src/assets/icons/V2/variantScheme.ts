import { IconVariant } from '@/assets/icons/V2/Mono/types'
import colors from '@/assets/styles/darwin/variables/colors.module.scss'

const scheme = {
  [IconVariant.DEFAULT]: {
    a: colors.colorSurfaceDarken,
    b: colors.colorContentSecondary
  },
  [IconVariant.DISABLED]: {
    a: 'rgba(0,0,0,0)',
    b: colors.colorContentDisabled
  },
  [IconVariant.SELECTED]: {
    a: colors.colorOverlayInteractive,
    b: colors.colorInteractivePrimaryDefault
  },
  [IconVariant.NEGATIVE]: {
    a: colors.colorStatusNegativeSurface,
    b: colors.colorStatusNegative
  }
}

export const iconScheme = (variant: IconVariant) => scheme[variant]
