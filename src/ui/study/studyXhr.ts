import { fetchJSON, fetchText } from '../../http'
import { Paginator } from '../../lichess/interfaces'
import { AnalyseData } from '../../lichess/interfaces/analyse'
import { Study, PagerOrder, PagerData, PagerCategory } from '../../lichess/interfaces/study'

interface StudyXhrData {
  analysis: AnalyseData
  study: Study
}

interface StudyPager {
  paginator: Paginator<PagerData>
}

export function list(
  category: PagerCategory = 'all',
  order: PagerOrder = 'hot',
  page = 1,
  feedback = false
): Promise<StudyPager> {
  return fetchJSON(`/study/${category}/${order}`, {
    query: {
      page
    }
  }, feedback)
}

export function search(
  q: string,
  page = 1,
  feedback = false
): Promise<StudyPager> {
  return fetchJSON('/study/search', {
    query: {
      q,
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
