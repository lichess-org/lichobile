import { fetchJSON, fetchText } from '../../http'
import { Paginator } from '../../lichess/interfaces'
import { AnalyseData } from '../../lichess/interfaces/analyse'
import { Study, PagerOrder, PagerData } from '../../lichess/interfaces/study'

interface StudyXhrData {
  analysis: AnalyseData
  study: Study
}

interface StudyPager {
  paginator: Paginator<PagerData>
}

export function all(order: PagerOrder = 'hot', page = 1, feedback = true): Promise<StudyPager> {
  return fetchJSON(`/study/all/${order}`, {
    query: {
      page
    }
  }, feedback)
}

export function load(id: string, chapterId?: string): Promise<StudyXhrData> {
  return fetchJSON<StudyXhrData>(`/study/${id}` + (chapterId ? `/${chapterId}` : ''))
}

export function studyPGN(id: string) {
  return fetchText(`/study/${id}.pgn`, undefined, true)
}

export function studyChapterPGN(id: string, chapterId: string) {
  return fetchText(`/study/${id}/${chapterId}.pgn`, undefined, true)
}
