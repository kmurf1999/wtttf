import { FlagIcon } from '@heroicons/react/24/solid';
import { inferSubscriptionOutput } from '@trpc/server';
import { GetServerSidePropsContext, NextPage } from 'next';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState } from 'react';
import Layout from '../../components/Layout';
import { getServerAuthSession } from '../../server/common/get-server-auth-session';
import { AppRouter } from '../../server/router';
import { trpc } from '../../utils/trpc';

type GameState = inferSubscriptionOutput<
  AppRouter,
  'game.play.subscribeToGame'
>;

const Player = ({
  name,
  image,
  rating,
  connected,
}: {
  name: string;
  image: string;
  rating: number;
  connected: boolean;
}) => {
  return (
    <div className="text-center">
      <div className={['avatar', connected && 'online'].join(' ')}>
        <div className="w-12 mask mask-squircle">
          <Image layout="fill" src={image} alt="Avatar" />
        </div>
      </div>
      <div className="text-gray-800">{name}</div>
      <div className="text-gray-400 font-mono">{Math.round(rating)}</div>
    </div>
  );
};

const PendingGameResult = ({
  winner,
  loser,
  fromMe,
  gameId,
}: {
  fromMe: boolean;
  gameId: string;
  winner: { name?: string | null; score?: number };
  loser: { name?: string | null; score?: number };
}) => {
  const declineResult = trpc.useMutation(['game.play.rejectGameResult']);
  const acceptResult = trpc.useMutation(['game.play.acceptGameResult']);
  return (
    <div className="h-full flex flex-row items-center">
      <div className="grow border-r p-4">
        <div className="mb-4 flex flex-row text-gray-900">
          <div className="">{winner.name}</div>
          <div className="grow"></div>
          <div className="text-lg">{winner.score}</div>
        </div>
        <div className="flex flex-row text-gray-400">
          <div className="">{loser.name}</div>
          <div className="grow"></div>
          <div className="text-lg">{loser.score}</div>
        </div>
      </div>
      {fromMe ? (
        <div className="flex flex-col p-4 gap-2">
          <div className="text-center wrap">
            Awaiting
            <br /> opponent
          </div>
        </div>
      ) : (
        <div className="flex flex-col p-4 gap-2">
          <button
            className="btn btn-sm btn-primary"
            onClick={() => acceptResult.mutate({ gameId })}
          >
            Accept
          </button>
          <button
            onClick={() => declineResult.mutate({ gameId })}
            className="btn btn-sm btn-ghost "
          >
            Decline
          </button>
        </div>
      )}
    </div>
  );
};

const CurrentGame = ({ gameId }: { gameId: string }) => {
  const session = useSession();
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const game = trpc.useQuery(['game.play.getGameById', { gameId }]);
  const [myScore, setMyScore] = useState<number | null>(null);
  const [theirScore, setTheirScore] = useState<number | null>(null);
  const postGameResult = trpc.useMutation('game.play.postGameResult');
  const resignGame = trpc.useMutation('game.play.resignGame');

  trpc.useSubscription(['game.play.subscribeToGame', { gameId }], {
    onError: (err) => {
      console.log(err);
    },
    onNext: (data) => {
      setGameState(data);
    },
  });

  if (gameState?.data.status === 'finished' && gameState.data.resultId) {
    // redirect to game result page
    router.push(`/play/results/${gameState.data.resultId}`);
  }

  if (game.error) {
    // error state
    return null; // TODO
  }

  if (!game.data || !session.data?.user) {
    // loading
    return <div></div>;
  }

  const me = game.data.players.find((p) => p.id === session.data.user?.id)!;
  const them = game.data.players.find((p) => p.id !== session.data.user?.id)!;

  const parseScore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const score = parseInt(e.target.value);
    if (isNaN(score)) {
      return 0;
    }
    return score;
  };

  const scoreIsValid =
    myScore !== null &&
    theirScore !== null &&
    (myScore > 0 || theirScore > 0) &&
    myScore !== theirScore;

  return (
    <div className="w-full sm:max-w-md flex flex-col bg-white rounded border border-gray-200 shadow-md overflow-hidden">
      <h1 className="mb-4 p-4 w-full text-white bg-gray-900">
        Match with {them.name}
      </h1>

      <div className="mt-4 flex flex-row items-center justify-around">
        <Player
          name={me.name!}
          image={me.image!}
          rating={me.rating}
          connected={
            gameState?.data.players.find((p) => p.id === me.id)?.connected ??
            false
          }
        />
        <input
          className="border-2 border-gray-200 rounded-lg w-16 px-0 py-1 text-center text-4xl"
          type="num"
          value={myScore === null ? '' : myScore}
          onChange={(e) => setMyScore(parseScore(e))}
        />
        <div className="text-4xl font-bold text-gray-500 text-center ">-</div>
        <input
          className="border-2 border-gray-200 rounded-lg w-16 px-0 py-1 text-center text-4xl"
          type="num"
          value={theirScore === null ? '' : theirScore}
          onChange={(e) => setTheirScore(parseScore(e))}
        />
        <Player
          name={them.name!}
          image={them.image!}
          rating={them.rating}
          connected={
            gameState?.data.players.find((p) => p.id === them.id)?.connected ??
            false
          }
        />
      </div>

      <button
        disabled={!scoreIsValid || !!gameState?.data.result}
        className="btn btn-primary  w-fit mx-auto"
        onClick={() => {
          if (scoreIsValid) {
            const winnerId = myScore > theirScore ? me.id : them.id;
            const loserId = myScore > theirScore ? them.id : me.id;
            const winnerScore = winnerId === me.id ? myScore : theirScore;
            const loserScore = winnerId === me.id ? theirScore : myScore;
            postGameResult.mutate({
              gameId,
              winnerId,
              loserId,
              winnerScore,
              loserScore,
            });
          }
        }}
      >
        Submit Result
      </button>

      <div className="ml-4 mt-4 mb-2 text-gray-400">Pending Results</div>
      <div className="px-4">
        <div className="w-full bg-gray-50 border border-gray-200 rounded-lg h-28">
          {gameState?.data.result && (
            <PendingGameResult
              gameId={gameId}
              fromMe={gameState.data.result.submittedBy === me.id}
              // TODO
              winner={{
                name: game.data.players.find(
                  (p) => p.id === gameState.data.result?.winnerId,
                )?.name,
                score: gameState.data.result.winnerScore,
              }}
              // TODO
              loser={{
                name: game.data.players.find(
                  (p) => p.id === gameState.data.result?.loserId,
                )?.name,
                score: gameState.data.result.loserScore,
              }}
            />
          )}
        </div>
      </div>

      <div className="p-4 bg-gray-100 mt-12 flex flex-row">
        <button
          onClick={() => {
            resignGame.mutate({ gameId });
            // TODO - add Are you sure dialog
          }}
          className="btn btn-error btn-outline"
        >
          Leave game
          <FlagIcon className="w-4 h-4 ml-2" />
        </button>
      </div>
    </div>
  );
};

const Play: NextPage = () => {
  const router = useRouter();
  const { gameId } = router.query;

  if (typeof gameId !== 'string') {
    return null; // TODO
  }

  return (
    <Layout>
      <CurrentGame gameId={gameId} />
    </Layout>
  );
};

export async function getServerSideProps(context: {
  req: GetServerSidePropsContext['req'];
  res: GetServerSidePropsContext['res'];
  query: GetServerSidePropsContext['query'];
}) {
  const session = await getServerAuthSession(context);

  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
}

export default Play;
