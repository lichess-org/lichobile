import * as helper from '../helper'
import socket from '../../socket'
import layout from '../layout'
import { dropShadowHeader, backButton } from '../shared/common'

export default {
  oncreate: helper.viewSlideIn,

  oninit() {
    socket.createDefault()
  },

  onremove() {},

  view() {
    const header = dropShadowHeader(null, backButton('About'))
    return layout.free(
      header,
      <div class="aboutBody native_scroller">
        <p>lichess.org is a free, open-source chess server powered by volunteers and donations.</p>

        <p>In 2010, Thibault Duplessis began work on Lichess as a hobby project. The site was simple in the beginning, not even checking to see if moves were legal. He made the site {helper.externalLink('open-source', 'https://www.youtube.com/watch?v=Tyd0FO0tko8')}, which means anyone is free to read the source code and make contributions.  Gradually, the site improved and collected users as an enthusiastic volunteer staff assembled to help Thibault build and maintain the site.</p>

        <p>Today, lichess users play more than a million games every day. Lichess is one of the {helper.externalLink('most popular chess websites', 'http://chess-links.org/')} in the world while remaining 100% free. Most “free” websites subsist by selling ads or selling user data. Others do it by putting all the good stuff behind paywalls. Lichess does none of these things and never will. With no investors demanding profits, Lichess staff can focus on improving the site as their only goal.</p>

        <p>Despite Lichess's humble origins, playing a chess game is far from the only thing you can do on Lichess. After finishing a game, you can request computer analysis using the latest {helper.externalLink('Stockfish', 'https://stockfishchess.org/')} chess engine and learn from your mistakes or compare your game against a {helper.internalLink('massive database', '/analyse/variant/standard?tab=2')} of chess masters’ games. You can watch {helper.internalLink('top players battle it out live', '/tv')} and discuss the game with your friends; {helper.externalLink('even World Champions play on Lichess!', 'https://lichess.org/blog/WjRTPScAAJXo7r5s/magnus-carlsen-wins-the-first-lichess-titled-arena')}</p>

        <p>A site the size of Lichess requires a significant number of people to maintain it. It also requires monetary resources for {helper.externalLink('expenses', 'https://docs.google.com/spreadsheets/d/1CGgu-7aNxlZkjLl9l-OlL00fch06xp0Q7eCVDDakYEE/preview')}, such as servers and other hosting services. The number of people who have contributed to these things is difficult to count precisely but fall into the following categories:</p>

        <ul>

          <li>Lichess would not exist without the thousands of hours of time from volunteers, both from {helper.externalLink('website devs', 'https://github.com/ornicar/lila/graphs/contributors')} and {helper.externalLink('mobile devs', 'https://github.com/veloce/lichobile/graphs/contributors')}, who create new features and/or bugs, as well as our administrative team, who police the site and help with long-term vision.</li>

          <li>{helper.externalLink('Patrons', 'https://lichess.org/patron')} provide a steady stream of income to our site, sufficient to run our servers and handle expenses.</li>

          <li>Finally, the players who come to Lichess to have fun, relax and learn, without whom this would all be pointless!</li>

        </ul>

        <h2>Links</h2>

          <ul>
            <li>{helper.externalLink('Github', 'https://github.com/veloce/lichobile')}</li>
            <li>
              {helper.externalLink('lichess.org/about', 'https://lichess.org/about')} for additional information.
            </li>
          </ul>

      </div>
    )
  }
} as Mithril.Component<{}, {}>
