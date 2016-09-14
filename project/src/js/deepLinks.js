import router from './router';
import * as Rlite from 'rlite-router';

const deepRouter = new Rlite();

function analyseCtrl({ params }) {
  router.set(`/analyse/online/${params.id}` + (params.color ? `/${params.color}` : ''));
}

function gameCtrl({ params }) {
  router.set(`/game/${params.id}` + (params.color ? `/${params.color}` : ''));
}

const deepRoutes = {
  'training/:id': ({ params }) => router.set(`/training/${params.id}`),
  'challenge/:id': ({ params }) => router.set(`/challenge/${params.id}`),
  'analyse/:id': analyseCtrl,
  'analyse/:id/:color': analyseCtrl,
  ':id/:color': gameCtrl,
  ':id': gameCtrl
};

for (let dr in deepRoutes) deepRouter.add(dr, deepRoutes[dr]);

export default {
  init() {
    // open games from external links with url scheme
    window.handleOpenURL = function(url) {
      setTimeout(() => deepRouter.run(url.replace(/^lichess:\/\//, '')), 0);
    };
  }
};
