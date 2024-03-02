/** Resolve an environment variable at runtime */
export const resolveVariable =
  (buildTime: string | undefined, deployTime: string): string | null => {
    // build time variable starts with 'VUE_APP_' and is replaced at build time
    // by webpack. We return that variable if available
    if (buildTime && buildTime !== '') { return buildTime }
    // deploy time variable starts with '$' and is replaced by `run.sh` at deploy
    if (deployTime[0] !== '$' && deployTime !== '') { return deployTime }
    return null
  }
