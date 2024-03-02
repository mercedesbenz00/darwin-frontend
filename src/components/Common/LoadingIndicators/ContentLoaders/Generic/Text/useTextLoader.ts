import { computed, ComputedRef, reactive } from 'vue'

import {
  ContentColors,
  useContentLoader
} from '@/components/Common/LoadingIndicators/ContentLoaders/useContentLoader'

import { TextSize } from './types'

/*
* @useTextLoader
* ~ Will return a fix breakpoint based on the variant the user is passing. The breakpoints
*   mirror the actual typography.export.scss values
* */

interface TextLoader extends ContentColors {
  height: ComputedRef<number>
}

const breakpoints = {
  [TextSize.XS]: 12,
  [TextSize.SM]: 14,
  [TextSize.MD]: 16,
  [TextSize.MD1]: 18,
  [TextSize.MD2]: 17,
  [TextSize.LG]: 20,
  [TextSize.LG1]: 22,
  [TextSize.XL]: 24,
  [TextSize.XL1]: 28,
  [TextSize.XL2]: 32,
  [TextSize.XXL]: 36,
  [TextSize.XXL1]: 40,
  [TextSize.XXL2]: 44,
  [TextSize.XXL3]: 48,
  [TextSize.XXL4]: 58
}

export function useTextLoader (variant: TextSize): TextLoader {
  const { primaryColor, secondaryColor } = useContentLoader()

  const height = reactive(computed(() => {
    return breakpoints[variant]
  }))

  return {
    primaryColor,
    secondaryColor,
    height
  }
}
