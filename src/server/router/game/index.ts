import { createRouter } from "../context";
import superjson from "superjson";

import { inviteRouter } from "./invite";

export const gameRouter = createRouter()
  .transformer(superjson)
  .merge("invite.", inviteRouter);
