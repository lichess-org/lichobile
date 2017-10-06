export interface Brush {
  key: string
  color: string
  opacity: number
  lineWidth: number
  circleMargin: number
}

export const brushes: { [key: string]: Brush } = {
  paleBlue: {
    key: 'pb',
    color: '#003088',
    opacity: 0.3,
    lineWidth: 15,
    circleMargin: 0
  },
  paleGreen: {
    key: 'pg',
    color: '#15781B',
    opacity: 0.35,
    lineWidth: 15,
    circleMargin: 0
  },
  palePurple: {
    key: 'pp',
    color: '#4b0082',
    opacity: 0.4,
    lineWidth: 15,
    circleMargin: 0
  },
  paleRed: {
    key: 'pr',
    color: 'rgb(136, 32, 32)',
    opacity: 0.4,
    lineWidth: 8,
    circleMargin: 0
  }
}
