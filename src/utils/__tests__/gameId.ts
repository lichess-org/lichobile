import * as gameId from '../gameId'

describe.each([
  {url: 'https://lichess.org/DABBAD00yyya',       id: 'DABBAD00', color: 'black',   ply: undefined},
  {url: 'https://lichess.org/DABBAD00yyy0',       id: 'DABBAD00', color: 'white',   ply: undefined},
  {url: 'https://lichess.org/DABBAD00yyyB#123',   id: 'DABBAD00', color: 'white',   ply: '123'},
  {url: 'https://lichess.org/DABBAD00',           id: 'DABBAD00', color: undefined, ply: undefined},
  {url: 'https://lichess.org/DABBAD00/black',     id: 'DABBAD00', color: 'black',   ply: undefined},
  {url: 'https://lichess.org/DABBAD00/white',     id: 'DABBAD00', color: 'white',   ply: undefined},
  {url: 'https://lichess.org/DABBAD00#123',       id: 'DABBAD00', color: undefined, ply: '123'},
  {url: 'https://lichess.org/DABBAD00/black#123', id: 'DABBAD00', color: 'black',   ply: '123'},
])('extractGameIdParts', ({url, id, color, ply}) => {
  it(`extracts correctly from ${url}`, () => {
    const urlObject = new URL(url)
    const gamePointer = gameId.extractGameReference(urlObject)
    expect(gamePointer).toEqual<gameId.GameReference>({
      gameId: id,
      color: color,
      ply: ply,
    })
  })
})