import { AnalyseData } from './analyse'
import { Tree } from '../../ui/shared/tree'

export interface StudyData {
  id: string
  name: string
  members: StudyMemberMap
  position: Position
  ownerId: string
  settings: StudySettings
  visibility: 'public' | 'private'
  createdAt: number
  from: string
  likes: number
  isNew?: boolean
  liked: boolean
  features: StudyFeatures
  chapters: StudyChapterMeta[]
  chapter: StudyChapter
  secondsSinceUpdate: number
}

export interface StudySettings {
  computer: string
  explorer: string
  cloneable: string
  chat: string
  sticky: boolean
}

export interface ReloadData {
  analysis: AnalyseData
  study: StudyData
}

interface Position {
  chapterId: string
  path: Tree.Path
}

export interface StudyFeatures {
  cloneable: boolean
  chat: boolean
  sticky: boolean
}

export interface StudyChapterMeta {
  id: string
  name: string
}

export interface StudyChapter {
  id: string
  name: string
  ownerId: string
  setup: StudyChapterSetup
  tags: TagArray[]
  practice: boolean
  conceal?: number
  gamebook: boolean
  features: StudyChapterFeatures
  description?: string
  relay?: StudyChapterRelay
}

export interface StudyChapterRelay {
  path: Tree.Path
  secondsSinceLastMove?: number
  lastMoveAt?: number
}

interface StudyChapterSetup {
  gameId?: string
  variant: {
    key: string
    name: string
  }
  orientation: Color
  fromFen?: string
}

interface StudyChapterFeatures {
  computer: boolean
  explorer: boolean
}

export type StudyMember = any

export interface StudyMemberMap {
  [id: string]: StudyMember
}

export type TagTypes = string[]
export type TagArray = [string, string]

export interface LocalPaths {
  [chapterId: string]: Tree.Path
}
