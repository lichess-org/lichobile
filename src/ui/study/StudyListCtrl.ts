import * as debounce from 'lodash/debounce'
import { handleXhrError } from '../../utils'
import { batchRequestAnimationFrame } from '../../utils/batchRAF'
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
  paginator?: Paginator<PagerData>
  scrollPos: number
  isLoading: boolean
  readonly stateId: string
}

export default class StudyListCtrl {
  public state: State

  private cacheAvailable: boolean
  // used to restore scroll position only once from cached state
  private initialized: boolean = false

  public constructor(
    public readonly cat: PagerCategory = 'all',
    public readonly order: PagerOrder = 'hot'
  ) {

    this.state = {
      studies: [],
      paginator: undefined,
      scrollPos: 0,
      isLoading: false,
      stateId: this.cat + this.order,
    }

    this.cacheAvailable = cachedState ?
      this.state.stateId === cachedState.stateId : false

    // load either from cache (restore previous search) or from server
    if (this.cacheAvailable) {
      setTimeout(() => {
        Object.assign(this.state, cachedState)
        redraw()
      }, 300)
    } else {
      xhr.list(this.cat, this.order)
      .then(data => {
        this.state.studies = data.paginator.currentPageResults.map(addDate)
        this.state.paginator = data.paginator

        redraw()
      })
      .catch(handleXhrError)
    }
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

  public readonly onScroll = (e: Event): void => {
    const target = (e.target as HTMLElement)
    const content = target.firstChild as HTMLElement
    const paginator = this.state.paginator
    const nextPage = paginator && paginator.nextPage
    if ((target.scrollTop + target.offsetHeight + 50) > content.offsetHeight) {
      // lichess doesn't allow for more than 39 pages
      if (!this.state.isLoading && nextPage && nextPage < 40) {
        this.loadNextPage(nextPage)
      }
    }
    this.state.scrollPos = target.scrollTop
    this.saveState()
  }

  public afterLoad = ({ dom }: Mithril.DOMNode) => {
    if (this.cacheAvailable && !this.initialized) {
      batchRequestAnimationFrame(() => {
        if (cachedState) {
          (dom.parentNode as HTMLElement).scrollTop = cachedState.scrollPos
        }
        this.initialized = true
      })
    }
  }

  private readonly loadNextPage = (page: number) => {
    this.state.isLoading = true
    xhr.list(this.cat, this.order, page)
    .then(data => {
      this.state.paginator = data.paginator
      this.state.isLoading = false
      this.state.studies = this.state.studies.concat(data.paginator.currentPageResults.map(addDate))
      this.saveState()
      redraw()
    })
    redraw()
  }

  private saveState = debounce(() => {
    cachedState = this.state
  }, 200)
}

let cachedState: State | undefined

function addDate(s: PagerData): PagerDataWithDate {
  return {
    ...s,
    date: window.moment(s.updatedAt).calendar()
  }
}
