import router from './router';
import * as Rlite from 'rlite-router';
import { isChallenge } from './xhr';

const deepRouter = new Rlite();

interface GameParams {
  id: string
  color: string
}

function analyseCtrl({ params }: Rlite.RouteParams<GameParams>) {
  router.set(`/analyse/online/${params.id}` + (params.color ? `/${params.color}` : ''));
}

function gameCtrl({ params }: Rlite.RouteParams<GameParams>) {
  router.set(`/game/${params.id}` + (params.color ? `/${params.color}` : ''));
}

const deepRoutes = {
  'training/:id': ({ params }: Rlite.RouteParams<{ id: string }>) => router.set(`/training/${params.id}`),
  'challenge/:id': ({ params }: Rlite.RouteParams<{ id: string }>) => router.set(`/challenge/${params.id}`),
  'analyse/:id': analyseCtrl,
  'analyse/:id/:color': analyseCtrl,
  ':id/:color': gameCtrl,
  ':id': gameCtrl
};

for (let dr in deepRoutes) deepRouter.add(dr, deepRoutes[dr]);

export default {
  init() {
    // open games from external links with url scheme
    /*
      window.handleOpenURL = function(url: string) {
      setTimeout(() => deepRouter.run(url.replace(/^lichess:\/\//, '')), 0);
    };
    */
    universalLinks.subscribe('tournamentList', () => router.set('/tournament'));
    universalLinks.subscribe('tournamentDetail', (eventData: EventData) => router.set('/tournament/' + eventData.path.split('/').pop()));
    universalLinks.subscribe('userProfile', (eventData: EventData) => router.set('/@/' + eventData.path.split('/').pop()));
    universalLinks.subscribe('userVariantProfile', handleVariantProfile);
    universalLinks.subscribe('challenge', (eventData: EventData) => router.set('/challenge/' + eventData.path.split('/').pop()));
    universalLinks.subscribe('training', (eventData: EventData) => router.set('/training/' + eventData.path.split('/').pop()));
    universalLinks.subscribe('other', handleOther);
  }
};

interface EventData {
  url: string
  scheme: string
  host: string
  path: string
  params: string
  hash: string
}

function handleVariantProfile (eventData: EventData) {
  const pieces = eventData.path.split('/');
  const uid = pieces[2];
  const variant = pieces[4];
  router.set('/@/' + uid + '/' + variant + '/perf');
}

function handleOther (eventData: EventData) {
  const pieces = eventData.path.split('/');
  if (eventData.path.search('^\/([a-zA-Z0-9]{8})$') !== -1) {
    isChallenge(pieces[1]).then(() => {
      router.set('/challenge/' + pieces[1]);
    }).catch(() => { router.set('/game/' + pieces[1]); });
  }
  else if (eventData.path.search('^\/([a-zA-Z0-9]{8})+\/+(white|black)$') !== -1) {
    router.set('/game/' + pieces[1] + '/' + pieces[2]);
  }
  else if (eventData.path.search('^\/([a-zA-Z0-9]{12})$') !== -1) {
    router.set('/game/' + pieces[1]);
  }
  else {
    window.open(eventData.url, '_system')
  }
}
