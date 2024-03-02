import colors from '@/assets/styles/darwin/variables/colors.module.scss'

/*
* @useContentLoader
* ~ Hook for every ContentLoader component. Will return default fore and background color
* */

export type ContentColors = {
  primaryColor: string
  secondaryColor: string
}

export function useContentLoader (): ContentColors {
  return {
    primaryColor: colors.colorGhostPrimary,
    secondaryColor: colors.colorGhostSecondary
  }
}
