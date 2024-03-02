export type Login2FAResponsePayload = {
  /* eslint-disable camelcase */
  /**
   * Flag that indicates if 2FA is required or not
   */
  required_2fa: boolean
  /**
   * Flag that indicates if 2FA was already setup or not
   */
  set_up_2fa: boolean
  /* eslint-enable camelcase */
}
