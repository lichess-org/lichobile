import redraw from '../../utils/redraw'
import router from '../../router'
import { Paginator } from '../../lichess/interfaces'
import { PagerData } from '../../lichess/interfaces/study'
import * as xhr from './studyXhr'

export interface PagerDataWithDate extends PagerData {
  date: string
}

interface State {
  studies: ReadonlyArray<PagerDataWithDate>
  paginator: Paginator<PagerData>
}

export default class StudyListCtrl {
  public state: State | undefined

  public constructor() {
    xhr.all()
    .then(data => {
      this.state = {
        studies: data.paginator.currentPageResults.map(s => {
          return {
            ...s,
            date: window.moment(s.updatedAt).calendar()
          }
        }),
        paginator: data.paginator
      }

      redraw()
    })
  }

  public goToStudy(id: string) {
    router.set(`/study/${id}`)
  }
}
