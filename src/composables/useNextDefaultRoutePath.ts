import { useFeatureFlags } from './useFeatureFlags'

/**
 * Composable hook used for dealing with next default route path.
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useNextDefaultRoutePath = () => {
  const features = useFeatureFlags()

  const getDefaultNextRoutePath = (fromPath: string | null | undefined ): string => {
    if (!fromPath) { throw new Error('From path is empty') }
    const unauthRouteNames = [
      'Login',
      'Invitations',
      'PasswordReset',
      'Register',
      'LoginSSO',
      'ForgotPassword',
      'LoginTfa'
    ]
    if (unauthRouteNames.includes(fromPath)) {
      if (features.featureEnabled('DARWIN_V2_ENABLED')) {
        return '/workflows'
      }
      return '/datasets'
    }
    throw new Error(`Not defined next route path for ${fromPath}`)
  }

  return {
    getDefaultNextRoutePath
  }
}
