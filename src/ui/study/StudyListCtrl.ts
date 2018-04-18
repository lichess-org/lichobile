import redraw from '../../utils/redraw'
import router from '../../router'
import { Paginator } from '../../lichess/interfaces'
import { PagerData, PagerCategory, PagerOrder } from '../../lichess/interfaces/study'
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

  public constructor(
    public readonly cat: PagerCategory = 'all',
    public readonly order: PagerOrder = 'hot'
  ) {
    xhr.list(this.cat, this.order)
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

  public goToStudy(id: string): void {
    router.set(`/study/${id}`)
  }

  public readonly onCatChange = (e: Event): void => {
    const cat = (e.target as HTMLSelectElement).value
    router.setQueryParams({ cat }, true)
  }

  public readonly onOrderChange = (e: Event): void => {
    const order = (e.target as HTMLSelectElement).value
    router.setQueryParams({ order }, true)
  }
}
