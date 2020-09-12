import { Capacitor } from '@capacitor/core'
import h from 'mithril/hyperscript'
import router from '../router'
import socket from '../socket'
import * as helper from './helper'
import layout from './layout'
import { dropShadowHeader, backButton } from './shared/common'
import i18n from '../i18n'

export default {
  oncreate: helper.viewSlideIn,

  oninit() {
    socket.createDefault()
  },

  view() {
    const header = dropShadowHeader(null, backButton(i18n('about')))
    return layout.free(
      header,
      <div class="aboutBody native_scroller">
        <p>lichess.org is a free, open-source chess server powered by volunteers and donations.</p>

        <p>In 2010, Thibault Duplessis began work on Lichess as a hobby project. The site was simple in the beginning, not even checking to see if moves were legal. He made the site {externalLink('open-source', 'https://www.youtube.com/watch?v=Tyd0FO0tko8')}, which means anyone is free to read the source code and make contributions.  Gradually, the site improved and collected users as an enthusiastic volunteer staff assembled to help Thibault build and maintain the site.</p>

        <p>Today, lichess users play more than a million games every day. Lichess is one of the most popular chess websites in the world while remaining 100% free. Most “free” websites subsist by selling ads or selling user data. Others do it by putting all the good stuff behind paywalls. Lichess does none of these things and never will. With no investors demanding profits, Lichess staff can focus on improving the site as their only goal.</p>

        <p>Despite Lichess's humble origins, playing a chess game is far from the only thing you can do on Lichess. After finishing a game, you can request computer analysis using the latest {externalLink('Stockfish', 'https://stockfishchess.org/')} chess engine and learn from your mistakes or compare your game against a {internalLink('massive database', '/analyse/variant/standard?tabId=explorer')} of chess masters’ games. You can watch {internalLink('top players battle it out live', '/tv')} and discuss the game with your friends; {externalLink('even World Champions play on Lichess!', 'https://lichess.org/blog/WjRTPScAAJXo7r5s/magnus-carlsen-wins-the-first-lichess-titled-arena')}</p>

        <p>A site the size of Lichess requires a significant number of people to maintain it. It also requires monetary resources for {externalLink('expenses', 'https://docs.google.com/spreadsheets/d/1CGgu-7aNxlZkjLl9l-OlL00fch06xp0Q7eCVDDakYEE/preview')}, such as servers and other hosting services. The number of people who have contributed to these things is difficult to count precisely but fall into the following categories:</p>

        <ul>

          <li>Lichess would not exist without the thousands of hours of time from volunteers, both from {externalLink('website devs', 'https://github.com/ornicar/lila/graphs/contributors')} and {externalLink('mobile devs', 'https://github.com/veloce/lichobile/graphs/contributors')}, who create new features and/or bugs, as well as our administrative team, who police the site and help with long-term vision.</li>

          <li>{externalLink('Patrons', 'https://lichess.org/patron')} provide a steady stream of income to our site, sufficient to run our servers and handle expenses.</li>

          <li>Finally, the players who come to Lichess to have fun, relax and learn, without whom this would all be pointless!</li>

        </ul>

        <h2>Links</h2>

          <ul className="about_links">
            <li>{externalLink('Github', 'https://github.com/veloce/lichobile')}</li>
            <li>{externalLink('Contribute', 'https://lichess.org/help/contribute')}</li>
            { Capacitor.platform !== 'ios' ?
              <li>{externalLink('Donate', 'https://lichess.org/patron')}</li> :
              null
            }
            <li>{externalLink('Contact', 'https://lichess.org/contact')}</li>
            <li>{externalLink('Terms of Service', 'https://lichess.org/terms-of-service')}</li>
            <li>{externalLink('Privacy Policy', 'https://lichess.org/privacy')}</li>
            <li>{externalLink('Database', 'https://database.lichess.org/')}</li>
            <li>{externalLink('lichess.org/about', 'https://lichess.org/about')}</li>
          </ul>

      </div>
    )
  }
} as Mithril.Component<{}, {}>


function externalLink(text: string, url: string): Mithril.Child {
  return h('a', {
    className: 'external_link',
    onclick: () => window.open(url, '_blank'),
  }, text)
}

function internalLink(text: string, route: string): Mithril.Child {
  return h('a', {
    onclick: () => router.set(route)
  }, text)
}
