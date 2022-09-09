import ws from "ws";
import { applyWSSHandler } from "@trpc/server/adapters/ws";
import { appRouter } from "./router";
import { createContext } from "./router/context";
import type { RequestInfo, RequestInit } from "node-fetch";

if (!global.fetch) {
  const fetch = (url: RequestInfo, init?: RequestInit) =>
    import("node-fetch").then(({ default: fetch }) => fetch(url, init));
  (global as any).fetch = fetch;
}

const wss = new ws.Server({
  port: 3001,
});

const handler = applyWSSHandler({ wss, router: appRouter, createContext });

wss.on("connection", () => {
  console.log(`Got a connection ${wss.clients.size}`);
  wss.once("close", () => {
    console.log(`Closed connection ${wss.clients.size}`);
  });
});

console.log(`wss server start at ws://localhost:3001`);

process.on("SIGTERM", () => {
  console.log("Got SIGTERM");
  handler.broadcastReconnectNotification();
  wss.close();
});
