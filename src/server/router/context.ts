// src/server/router/context.ts
import * as trpc from '@trpc/server';
import * as trpcNext from '@trpc/server/adapters/next';
import { NodeHTTPCreateContextFnOptions } from '@trpc/server/dist/declarations/src/adapters/node-http';
import { IncomingMessage } from 'http';
import Redis from 'ioredis';
import { getSession } from 'next-auth/react';
import ws from 'ws';
import { prisma } from '../db/client';

// const ee = new EventEmitter();
// const cache = new Map<string, any>();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export const createContext = async ({
  req,
  res,
}:
  | trpcNext.CreateNextContextOptions
  | NodeHTTPCreateContextFnOptions<IncomingMessage, ws>) => {
  const session = await getSession({ req });

  return {
    req,
    res,
    session,
    prisma,
    // ee,
    // cache,
    redis,
  };
};

type Context = trpc.inferAsyncReturnType<typeof createContext>;

export const createRouter = () => trpc.router<Context>();

/**
 * Creates a tRPC router that asserts all queries and mutations are from an authorized user. Will throw an unauthorized error if a user is not signed in.
 **/
export function createProtectedRouter() {
  return createRouter().middleware(({ ctx, next }) => {
    if (!ctx.session || !ctx.session.user) {
      throw new trpc.TRPCError({ code: 'UNAUTHORIZED' });
    }
    return next({
      ctx: {
        ...ctx,
        // infers that `session` is non-nullable to downstream resolvers
        session: { ...ctx.session, user: ctx.session.user },
      },
    });
  });
}
