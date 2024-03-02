// @ts-ignore
import cli from '@/components/ApiKey/snippets/cli.sh'
import { SupportedLanguages } from '@/components/ApiKey/types'

// @ts-ignore
import curl from './snippets/curl.sh'
// @ts-ignore
import elixir from './snippets/elixir.exs'
// @ts-ignore
import javascript from './snippets/javascript.js'
// @ts-ignore
import python from './snippets/python.py'

const url = 'https://darwin.v7labs.com/ai/models/{modelId}/infer'

export const ACCESS_CODES: { [language in SupportedLanguages]: string } = {
  cli,
  shell: curl.replace('{url}', url),
  python: python.replace('{url}', url),
  javascript: javascript.replace('{url}', url),
  elixir: elixir.replace('{url}', url)
}
