import { fetchJSON } from '../../../http'
import { OnlineAnalyseData } from '../../../lichess/interfaces/analyse'
import { StudyData } from '../../../lichess/interfaces/study'

interface StudyXhrData {
  analysis: OnlineAnalyseData
  study: StudyData
}

export function load(id: string, chapterId?: string): Promise<StudyXhrData> {
  return fetchJSON<StudyXhrData>(`/study/${id}` + (chapterId ? `/${chapterId}` : ''))
}
