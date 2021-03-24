import debounce from 'lodash-es/debounce'
import { fromNow } from '../../i18n'
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
  showSearch: boolean
  canCancelSearch: boolean
  isLoading: boolean
  readonly stateId: string
}

export default class StudyIndexCtrl {
  public state: State

  private cacheAvailable: boolean
  // used to restore scroll position only once from cached state
  private initialized = false

  public constructor(
    public readonly cat: PagerCategory = 'all',
    public readonly order: PagerOrder = 'hot',
    public readonly q?: string
  ) {

    this.state = {
      studies: [],
      paginator: undefined,
      scrollPos: 0,
      showSearch: !!this.q,
      canCancelSearch: !!this.q,
      isLoading: false,
      // a search query has precedence over cat and order
      stateId: this.q || this.cat + this.order,
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
      const req = this.q ? xhr.search(this.q) : xhr.list(this.cat, this.order)
      req.then(data => {
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

  public readonly toggleSearch = (): void => {
    this.state.showSearch = !this.state.showSearch
  }

  public readonly canCancelSearch = (enabled: boolean): void => {
    this.state.canCancelSearch = enabled
  }

  public readonly cancelSearch = (): void => {
    if (this.q) {
      router.setQueryParams({ cat: this.cat, order: this.order }, true)
    } else {
      this.state.showSearch = false
    }
  }

  public readonly onSearch = (e: Event): void => {
    e.preventDefault()
    e.stopPropagation()
    const q = ((e.target as HTMLFormElement)[0] as HTMLInputElement).value.trim()
    router.setQueryParams({ q }, true)
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

  public afterLoad = ({ dom }: Mithril.VnodeDOM<any, any>) => {
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
    const req = this.q ? xhr.search(this.q, page) : xhr.list(this.cat, this.order, page)
    req.then(data => {
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
    date: fromNow(new Date(s.updatedAt))
  }
}
