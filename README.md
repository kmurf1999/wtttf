# WTTTF

The official match-making system for **Willow-Tree Table Tennis Federation**

[Official Site](#https://pong.kylemerfy.com)

## Features

- :lock: Google and Github Auth
- :watch: Realtime game status & game invites using websockets
- :chart_with_upwards_trend: Elo tracking with Rating history graph
- :trophy: Player rankings
- :bulb: View match in progress

## Technologies

This project uses the _t3_ stack with some additions

- [Next.js](#https://nextjs.org/)
- [TailwindCSS](#https://tailwindcss.com/)
- [TRPC](#https://trpc.io/)
- Websockets
- [DaisyUI](#https://daisyui.com/)
- MySQL
- Redis

For more information on the t3 stack [create-t3-app](#https://github.com/t3-oss/create-t3-app)

For more information on trpc websockets with Next.js [Example application](#https://github.com/trpc/examples-next-prisma-starter-websockets)

## Setup

#### 1. Configure Environment variables

Copy environment variables to the correct location

```bash
cp .env.sample .env
```

To log into the application you'll need to get valid OAuth2 client ID and secret from google, github, or both. Once you have those values, copy them to your `.env`

#### 2. Apply database migrations

First, start the database

```bash
docker compose up db
```

Next, in a seperate terminal window apply all migrations and run the seed command. This may take longer than expected to execute.

```bash
npx prisma migrate reset
```

> The `DATABASE_URL` environment variable must point to the database running on localhost with the correct port. If no configuration has changed, the value in `.env.sample` should work.

#### 3. Start the project

Now you should be able to run the project using docker compose

```bash
docker compose up
```

After the build is complete you should be able to visit the application on `localhost:3000`

#### 4. Add data to be able to create a game and invite player

To be able to create a new game, invite a player, and accept invitations there are a few edits to the database necessary. An easy way to manage data in the database is to use prisma studio: `npx prisma studio`.

After you've authenticated via GitHub, Google, etc., you'll have a `User` record created in the database. To invite another user, add a record to the `User` table. This new user should show up in the invitation list.

After you've sent an invitation, you'll see a new record in the `GameInvite` table. Switch the `from` and `to` column so that the invitation is coming "from" the user you created, and "to" your user that you're logged in with. Now you can join the game that the other user invited you to: http://localhost:3000/play/join by accepting the invitation. You should now have an active game and be able to leave, track scores, and submit results.

## Migrations

After making changes to the database schema, you'll need to create and apply a new migration.

First, start the database

```bash
docker compose up db
```

Next, in a seperate terminal window create the miration. You'll be prompted to add a name for the migration.

```bash
npx prisma migrate dev
```

Finally, you need to rebuild the application and start it

```bash
docker compose up --build app
```
