import { createRouter } from "../context";
import superjson from "superjson";

import { inviteRouter } from "./invite";
import { playRouter } from "./play";

export const gameRouter = createRouter()
  .transformer(superjson)
  .merge("invite.", inviteRouter)
  .merge("play.", playRouter);
