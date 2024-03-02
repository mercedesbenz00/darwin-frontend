// @ts-ignore
import cli from './snippets/cli.sh'
// @ts-ignore
import python from './snippets/python.py'
import { SupportedLanguages } from './types'

type SupportedGeneralLanguages = {
  cli: SupportedLanguages.cli,
  python: SupportedLanguages.python
}

export const ACCESS_CODES: SupportedGeneralLanguages = { cli, python }
