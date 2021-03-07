export interface Brush {
  key: string
  color: string
  opacity: number
  lineWidth: number
}

export const brushes: { [key: string]: Brush } = {
  green: { key: 'g', color: '#15781B', opacity: 1, lineWidth: 10 },
  red: { key: 'r', color: '#882020', opacity: 1, lineWidth: 10 },
  blue: { key: 'b', color: '#003088', opacity: 1, lineWidth: 10 },
  yellow: { key: 'y', color: '#e68f00', opacity: 1, lineWidth: 10 },
  paleBlue: { key: 'pb', color: '#003088', opacity: 0.25, lineWidth: 15 },
  paleGreen: { key: 'pg', color: '#15781B', opacity: 0.3, lineWidth: 15 },
  palePurple: { key: 'pp', color: '#4b0082', opacity: 0.3, lineWidth: 10 },
  paleRed: { key: 'pr', color: 'rgb(136, 32, 32)', opacity: 0.3, lineWidth: 8 },
}
