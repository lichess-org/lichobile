import { fetchJSON } from '../../../http'
import { AnalyseData } from '../../../lichess/interfaces/analyse'
import { Study } from '../../../lichess/interfaces/study'

interface StudyXhrData {
  analysis: AnalyseData
  study: Study
}

export function load(id: string, chapterId?: string): Promise<StudyXhrData> {
  return fetchJSON<StudyXhrData>(`/study/${id}` + (chapterId ? `/${chapterId}` : ''))
}
