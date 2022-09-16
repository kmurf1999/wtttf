import { createRouter } from '../context';
import superjson from 'superjson';

import { inviteRouter } from './invite';
import { playRouter } from './play';
import { historyRouter } from './history';
import { rankingRouter } from './ranking';

export const gameRouter = createRouter()
  .transformer(superjson)
  .merge('invite.', inviteRouter)
  .merge('play.', playRouter)
  .merge('ranking.', rankingRouter)
  .merge('history.', historyRouter);
