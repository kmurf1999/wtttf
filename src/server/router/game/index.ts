import { createRouter } from "../context";
import superjson from "superjson";

import { inviteRouter } from "./invite";
import { playRouter } from "./play";
import { historyRouter } from "./history";

export const gameRouter = createRouter()
  .transformer(superjson)
  .merge("invite.", inviteRouter)
  .merge("play.", playRouter)
  .merge("history.", historyRouter);
