import { AnalyseData } from './analyse'
import { LightUser } from './user'
import { ChatData } from './chat'
import { Tree } from '../../ui/shared/tree'

export interface Study {
  readonly id: string
  readonly name: string
  readonly members: StudyMemberMap
  readonly position: Position
  readonly ownerId: string
  readonly settings: StudySettings
  readonly visibility: 'public' | 'private' | 'unlisted'
  readonly createdAt: number
  readonly from: string
  likes: number
  readonly isNew?: boolean
  liked: boolean
  readonly features: StudyFeatures
  readonly chapters: ReadonlyArray<StudyChapterMeta>
  readonly chapter: StudyChapter
  readonly secondsSinceUpdate: number
  readonly chat?: ChatData
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
  readonly study: Study
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
    readonly key: VariantKey
    readonly name: string
  }
  readonly orientation: Color
  readonly fromFen?: string
}

interface StudyChapterFeatures {
  readonly computer: boolean
  readonly explorer: boolean
}

export interface StudyMember {
  addedAt: number
  role: 'r' | 'w'
  user: LightUser | null
}

export interface StudyMemberMap {
  readonly [id: string]: StudyMember | undefined
}

export type TagTypes = ReadonlyArray<string>
export type TagTuple = [string, string]

export interface LocalPaths {
  readonly [chapterId: string]: Tree.Path | undefined
}

export function findTag(study: Study, name: string): string | undefined {
  const t = study.chapter.tags.find(t => t[0].toLowerCase() === name)
  return t && t[1]
}

export function gameResult(study: Study, isWhite: boolean): string | undefined {
  switch (findTag(study, 'result')) {
    case '1-0': return isWhite ? '1' : '0'
    case '0-1': return isWhite ? '0' : '1'
    case '1/2-1/2': return '1/2'
    default: return undefined
  }
}

export type PagerCategory = 'all' | 'mine' | 'member' | 'public' | 'private' | 'likes'
export type PagerOrder = 'hot' | 'newest' | 'oldest' | 'updated' | 'popular'

export interface PagerData {
  readonly id: string
  readonly name: string
  readonly updatedAt: Timestamp
  readonly liked: boolean
  readonly likes: number
  readonly owner: LightUser | null
  readonly chapters: ReadonlyArray<string>
  readonly members: ReadonlyArray<StudyMember>
}
