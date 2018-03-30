import { AnalyseData } from './analyse'
import { Tree } from '../../ui/shared/tree'

export interface StudyData {
  readonly id: string
  readonly name: string
  readonly members: StudyMemberMap
  readonly position: Position
  readonly ownerId: string
  readonly settings: StudySettings
  readonly visibility: 'public' | 'private' | 'unlisted'
  readonly createdAt: number
  readonly from: string
  readonly likes: number
  readonly isNew?: boolean
  readonly liked: boolean
  readonly features: StudyFeatures
  readonly chapters: ReadonlyArray<StudyChapterMeta>
  readonly chapter: StudyChapter
  readonly secondsSinceUpdate: number
}

type UserSelection = 'nobody' | 'owner' | 'contributor' | 'member' | 'everyone'

export interface StudySettings {
  readonly computer: string
  readonly explorer: string
  readonly cloneable: string
  readonly chat: UserSelection
  readonly sticky: boolean
}

export interface ReloadData {
  readonly analysis: AnalyseData
  readonly study: StudyData
}

interface Position {
  readonly chapterId: string
  readonly path: Tree.Path
}

export interface StudyFeatures {
  readonly cloneable: boolean
  readonly chat: boolean
  readonly sticky: boolean
}

export interface StudyChapterMeta {
  readonly id: string
  readonly name: string
}

export interface StudyChapter {
  readonly id: string
  readonly name: string
  readonly ownerId: string
  readonly setup: StudyChapterSetup
  readonly tags: ReadonlyArray<TagTuple>
  readonly practice: boolean
  readonly conceal?: number
  readonly gamebook: boolean
  readonly features: StudyChapterFeatures
  readonly description?: string
  readonly relay?: StudyChapterRelay
}

export interface StudyChapterRelay {
  readonly path: Tree.Path
  readonly secondsSinceLastMove?: number
  readonly lastMoveAt?: number
}

interface StudyChapterSetup {
  readonly gameId?: string
  readonly variant: {
    readonly key: string
    readonly name: string
  }
  readonly orientation: Color
  readonly fromFen?: string
}

interface StudyChapterFeatures {
  readonly computer: boolean
  readonly explorer: boolean
}

export type StudyMember = any

export interface StudyMemberMap {
  readonly [id: string]: StudyMember | undefined
}

export type TagTypes = ReadonlyArray<string>
export type TagTuple = [string, string]

export interface LocalPaths {
  readonly [chapterId: string]: Tree.Path | undefined
}
