# WTTTF

The official match-making system for **Willow-Tree Table Tennis Federation**

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

```
cp .env.sample .env
```

To log into the application you'll need to get valid OAuth2 client ID and secret from google, github, or both. Once you have those values, copy them to your `.env`

#### 2. Apply database migrations

First, start the database

```
docker compose up db
```

Next, apply all migrations and run the seed command. This may take longer than expected to execute.

```
npx prisma migrate reset
```

> The `DATABASE_URL` environment variable must point to the database running on localhost with the correct port. If no configuration has changed, the value in `.env.sample` should work.

#### 3. Start the project

Now you should be able to run the project using docker compose

```
docker compose up
```

After the build is complete you should be able to visit the application on `localhost:3000`
