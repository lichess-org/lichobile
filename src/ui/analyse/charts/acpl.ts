import { select } from 'd3-selection'
import { scaleLinear } from 'd3-scale'
import { area as d3Area } from 'd3-shape'

import * as Tree from '../../shared/tree/interfaces'
import { AnalyseData } from '../../../lichess/interfaces/analyse'

interface Point {
  acpl: number
}

export default function drawAcplChart(
  element: HTMLElement,
  aData: AnalyseData,
  curPly: number
) {
  const division = aData.game.division
  const rect = element.getBoundingClientRect()

  const svg = select(element)
  .append('svg')
  .attr('viewBox', `0 0 ${rect.width} ${rect.height}`)

  const graphData = makeSerieData(aData)
  const margin = {top: 10, right: 10, bottom: 10, left: 10}
  const width = rect.width - margin.left - margin.right
  const height = rect.height - margin.top - margin.bottom
  const g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

  function addDivisionLine(xPos: number, name: string) {
    g.append('line')
    .attr('class', 'division ' + name)
    .attr('x1', xPos)
    .attr('x2', xPos)
    .attr('y1', y(-1))
    .attr('y2', y(1))

    g.append('text')
    .attr('class', 'chart-legend')
    .attr('transform', 'rotate(90)')
    .attr('y', -xPos)
    .attr('dy', '-0.4em')
    .text(name)
  }

  const firstPly = aData.treeParts[0].ply || 0
  function setCurrentPly(ply: number | null) {
    g.selectAll('.dot').remove()
    if (ply !== null) {
      const xply = ply - 1 - firstPly
      const p = graphData[xply]
      if (p) {
        g.append('circle')
        .attr('class', 'dot')
        .attr('cx', x(xply))
        .attr('cy', y(p.acpl))
        .attr('r', 3)
      }
    }
  }

  const x = scaleLinear()
  .domain([0, graphData.length])
  .rangeRound([0, width])

  const y = scaleLinear()
  .domain([-1, 1])
  .rangeRound([height, 0])

  const line = d3Area<Point>()
  .x((_, i) => x(i))
  .y(d => y(d.acpl))

  const area = d3Area<Point>()
  .x((_, i) => x(i))
  .y1(d => d.acpl >= 0 ? y(d.acpl) : y(0))

  g.datum(graphData)

  g.append('line')
  .attr('class', 'zeroline')
  .attr('x1', 0)
  .attr('x2', width)
  .attr('y1', y(0))
  .attr('y2', y(0))

  g.append('clipPath')
  .attr('id', 'clip-below')
  .append('path')
  .attr('d', area.y0(d => y(d.acpl)) as any)

  g.append('clipPath')
  .attr('id', 'clip-above')
  .append('path')
  .attr('d', area.y0(y(0)) as any)

  g.append('path')
  .attr('class', 'area above')
  .attr('clip-path', 'url(#clip-above)')
  .attr('d', area as any)

  g.append('path')
  .attr('class', 'area below')
  .attr('clip-path', 'url(#clip-below)')
  .attr('d', area.y0(d => d.acpl <= 0 ? y(d.acpl) : y(0)) as any)

  g.append('path')
  .attr('class', 'line')
  .attr('d', line as any)

  if (division && (division.middle || division.end)) {
    addDivisionLine(x(0), 'Opening')
    if (division.middle) {
      addDivisionLine(x(division.middle), 'Middlegame')
    }
    if (division.end) {
      addDivisionLine(x(division.end), 'Endgame')
    }
  }

  setCurrentPly(curPly)

  return setCurrentPly
}

function makeSerieData(d: AnalyseData): Point[] {
  return d.treeParts.slice(1).reduce((acc: Point[], node: Partial<Tree.Node>) => {
    const ply = node.ply!
    const color = ply & 1

    let cp: number

    if (node.eval && node.eval.mate) {
      cp = node.eval.mate > 0 ? Infinity : -Infinity
    }
    else if (node.san && node.san.indexOf('#') > 0) {
      cp = color === 1 ? Infinity : -Infinity
      if (d.game.variant.key === 'antichess') cp = -cp
    }
    else if (node.eval && node.eval.cp !== undefined) {
      cp = node.eval.cp
    }
    else return acc

    const point = {
      acpl: 2 / (1 + Math.exp(-0.004 * cp)) - 1
    }
    return acc.concat([point])
  }, [])
}
