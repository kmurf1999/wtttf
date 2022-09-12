import { GameInvite } from "@prisma/client";
import * as trpc from "@trpc/server";
import superjson from "superjson";
import z from "zod";
import { createGame } from "../../gameState";
import { createProtectedRouter } from "../context";

enum Events {
  SEND_INVITE = "SEND_INVITE",
  ACCEPT_INVITE = "ACCEPT_INVITE",
}

type SendInviteEvent = GameInvite & {
  from: {
    name: string;
    elo: number;
    image: string;
  };
};

type AcceptInviteEvent = { id: string; players: { id: string }[] };

export const inviteRouter = createProtectedRouter()
  .transformer(superjson)
  .subscription("streamAcceptedInvites", {
    resolve: async ({ ctx }) => {
      return new trpc.Subscription<AcceptInviteEvent>((emit) => {
        function onMessage(data: AcceptInviteEvent) {
          if (data.players.some((p) => p.id === ctx.session.user.id)) {
            emit.data(data);
          }
        }

        ctx.ee.on(Events.ACCEPT_INVITE, onMessage);
        return () => {
          ctx.ee.off(Events.ACCEPT_INVITE, onMessage);
        };
      });
    },
  })
  .subscription("streamReceivedInvites", {
    resolve: async ({ ctx }) => {
      return new trpc.Subscription<SendInviteEvent>((emit) => {
        function onMessage(data: SendInviteEvent) {
          if (data.toUserId === ctx.session.user.id) {
            emit.data(data);
          }
        }

        ctx.ee.on(Events.SEND_INVITE, onMessage);

        return () => {
          ctx.ee.off(Events.SEND_INVITE, onMessage);
        };
      });
    },
  })
  .query("getSentInvites", {
    resolve: async ({ ctx }) => {
      return await ctx.prisma.gameInvite.findMany({
        where: {
          fromUserId: ctx.session.user.id,
        },
        include: {
          to: {
            select: {
              name: true,
            },
          },
        },
      });
    },
  })
  .query("getReceivedInvites", {
    resolve: async ({ ctx }) => {
      return await ctx.prisma.gameInvite.findMany({
        where: {
          toUserId: ctx.session.user.id,
        },
        include: {
          from: {
            select: {
              name: true,
              rating: true,
              image: true,
              email: true,
            },
          },
        },
      });
    },
  })
  .mutation("declineInvite", {
    input: z.object({
      inviteId: z.string(),
    }),
    resolve: async ({ ctx, input }) => {
      return await ctx.prisma.gameInvite.delete({
        where: {
          id: input.inviteId,
          // TODO make sure toUserId is context.sewssionuser.id
        },
      });
    },
  })
  .mutation("sendInvite", {
    input: z.object({
      otherPlayerId: z.string(),
    }),
    resolve: async ({ ctx, input }) => {
      const invite = await ctx.prisma.gameInvite.create({
        data: {
          fromUserId: ctx.session.user.id,
          toUserId: input.otherPlayerId,
        },
        include: {
          from: {
            select: {
              name: true,
              image: true,
              rating: true,
            },
          },
        },
      });

      ctx.ee.emit(Events.SEND_INVITE, invite);

      return invite;
    },
  })
  .mutation("acceptInvite", {
    input: z.object({
      inviteId: z.string(),
    }),
    resolve: async ({ ctx, input }) => {
      // TODO make sure invite toId is context.sessionuser.id
      const invite = await ctx.prisma.gameInvite.findUnique({
        where: { id: input.inviteId },
      });
      if (!invite) {
        throw new Error("Invite not found");
      }
      // delete invite
      await ctx.prisma.gameInvite.delete({ where: { id: input.inviteId } });
      // create game in progress

      const game = await ctx.prisma.game.create({
        data: {
          players: {
            connect: [{ id: invite.fromUserId }, { id: invite.toUserId }],
          },
        },
        select: {
          id: true,
          players: {
            select: {
              id: true,
              image: true,
              name: true,
              email: true,
              rating: true,
            },
          },
        },
      });

      const gameState = createGame(
        game.id,
        game.players.map((p) => p.id)
      );

      ctx.cache.set(game.id, gameState);

      // notify other player that game is starting
      ctx.ee.emit(Events.ACCEPT_INVITE, {
        id: game.id,
        players: [{ id: invite.fromUserId }, { id: invite.toUserId }],
      });

      return game;
    },
  });
