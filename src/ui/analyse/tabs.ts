export interface Tab {
  id: string
  title: string
  className: string
}

export const defaults: Tab[] = [
  {
    id: 'infos',
    title: 'Game informations',
    className: 'fa fa-info-circle'
  },
  {
    id: 'moves',
    title: 'Move list',
    className: 'fa fa-list-alt'
  }
]

export const ceval: Tab = {
  id: 'ceval',
  title: 'Local Stockfish 8',
  className: 'fa fa-cogs'
}

export const explorer: Tab = {
  id: 'explorer',
  title: 'Opening explorer & tablebase',
  className: 'fa fa-book'
}

export const charts: Tab = {
  id: 'analysis',
  title: 'gameAnalysis',
  className: 'fa fa-area-chart'
}
