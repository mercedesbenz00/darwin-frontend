export type AbilityGroup =
  'manage_comments' |
  'manage_tasks' |
  'manage_datasets' |
  'manage_team' |
  'manage_team_members' |
  'manage_models'

export type Group = { id: AbilityGroup; name: string }
export type GroupOption = Group & { selected: boolean }

export enum SupportedLanguages {
  shell = 'shell',
  python = 'python',
  javascript = 'javascript',
  elixir = 'elixir',
  cli = 'cli'
}

export type AccessCodeExample = { language: SupportedLanguages, code: string }
