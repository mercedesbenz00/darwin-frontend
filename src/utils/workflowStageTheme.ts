import { StageType } from '@/store/types/StageType'

export type StageThemes = {
  [key in StageType]: StageTheme
}

export type StageTheme = {
  stageTitle: string
  highlightColorBackground: string
  highlightColor: string
  edgeColor: string
  edgeColorFocus: string
  edges: boolean[],
  stageLimit: number
}

export const isStageType = (type: string): type is StageType =>
  (Object.values(StageType) as string[]).includes(type)

export const stageTheme: StageThemes = {
  [StageType.Archive]: {
    stageTitle: 'Archive',
    highlightColorBackground: 'rgba(138, 161, 229, 0.24)',
    highlightColor: 'hsla(225, 64%, 56%, 1)',
    edgeColor: 'hsla(225, 64%, 56%, 1)',
    edgeColorFocus: 'hsla(225, 64%, 56%, 1)',
    edges: [true, false],
    stageLimit: 1
  },
  [StageType.Annotate]: {
    stageTitle: 'Annotate',
    highlightColorBackground: 'rgba(138, 161, 229, 0.24)',
    highlightColor: 'hsla(225, 64%, 56%, 1)',
    edgeColor: 'hsla(225, 64%, 56%, 1)',
    edgeColorFocus: 'hsla(225, 64%, 56%, 1)',
    edges: [true, true],
    stageLimit: -1
  },
  [StageType.Review]: {
    stageTitle: 'Review',
    highlightColorBackground: 'rgba(245, 184, 0, 0.24)',
    highlightColor: 'rgba(245, 184, 0, 1)',
    edgeColor: 'rgba(245, 184, 0, 1)',
    edgeColorFocus: 'rgba(245, 184, 0, 1)',
    edges: [true, false],
    stageLimit: -1
  },
  [StageType.Complete]: {
    stageTitle: 'Complete',
    highlightColorBackground: 'rgba(59, 186, 59, 0.24)',
    highlightColor: 'rgba(59, 186, 59, 1)',
    edgeColor: 'rgba(59, 186, 59, 1)',
    edgeColorFocus: 'rgba(59, 186, 59, 1)',
    edges: [true, false],
    stageLimit: 1
  },
  [StageType.ConsensusEntrypoint]: {
    stageTitle: 'Consensus',
    highlightColorBackground: 'rgba(245, 184, 0, 0.24)',
    highlightColor: 'rgba(245, 184, 0, 1)',
    edgeColor: 'rgba(245, 184, 0, 1)',
    edgeColorFocus: 'rgba(245, 184, 0, 1)',
    edges: [true, false],
    stageLimit: -1
  },
  [StageType.ConsensusTest]: {
    stageTitle: 'Test',
    highlightColorBackground: 'rgba(245, 122, 0, 0.24)',
    highlightColor: '#25A759',
    edgeColor: '#25A759',
    edgeColorFocus: '#178C46',
    edges: [true, true],
    stageLimit: 0
  },
  [StageType.Discard]: {
    stageTitle: 'Discard',
    highlightColorBackground: '#EFF3FA',
    highlightColor: '#25A759',
    edgeColor: '#25A759',
    edgeColorFocus: '#178C46',
    edges: [true, true],
    stageLimit: 0
  },
  [StageType.Model]: {
    stageTitle: 'Model',
    highlightColorBackground: 'hsla(270, 80%, 48%, 0.24)',
    highlightColor: 'hsla(270, 80%, 48%, 1)',
    edgeColor: 'hsla(270, 80%, 48%, 1)',
    edgeColorFocus: 'hsla(270, 80%, 48%, 1)',
    edges: [true, true],
    stageLimit: -1
  },
  [StageType.Code]: {
    stageTitle: 'Code',
    highlightColorBackground: 'hsla(30, 100%, 48%, 0.24)',
    highlightColor: 'hsla(30, 100%, 48%, 1)',
    edgeColor: 'hsla(30, 100%, 48%, 1)',
    edgeColorFocus: 'hsla(30, 100%, 48%, 1)',
    edges: [true, true],
    stageLimit: 0
  },
  [StageType.Test]: {
    stageTitle: 'Test',
    highlightColorBackground: 'rgba(245, 122, 0, 0.24)',
    highlightColor: '#25A759',
    edgeColor: '#25A759',
    edgeColorFocus: '#178C46',
    edges: [true, true],
    stageLimit: 0
  },
  [StageType.Dataset]: {
    stageTitle: 'Dataset',
    highlightColorBackground: 'hsla(180, 48%, 48%, 0.24)',
    highlightColor: 'hsla(180, 48%, 48%, 1)',
    edgeColor: 'hsla(180, 48%, 48%, 1)',
    edgeColorFocus: 'hsla(180, 48%, 48%, 1)',
    edges: [false, true],
    stageLimit: 1
  },
  [StageType.Logic]: {
    stageTitle: 'Logic',
    highlightColorBackground: 'hsla(300, 56%, 48%, 0.24)',
    highlightColor: 'hsla(300, 56%, 48%, 1)',
    edgeColor: 'hsla(300, 56%, 48%, 1)',
    edgeColorFocus: 'hsla(300, 56%, 48%, 1)',
    edges: [true, true],
    stageLimit: 0
  },
  [StageType.Webhook]: {
    stageTitle: 'Webhook',
    highlightColorBackground: 'hsla(212, 8%, 94%, 1)',
    highlightColor: 'hsla(210, 8%, 40%, 1)',
    edgeColor: 'hsla(210, 8%, 40%, 1)',
    edgeColorFocus: 'hsla(300, 56%, 48%, 1)',
    edges: [true, false],
    stageLimit: -1
  }
}
