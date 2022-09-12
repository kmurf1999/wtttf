import { GetServerSidePropsContext, NextPage } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import Layout from "../../../components/Layout";
import { getServerAuthSession } from "../../../server/common/get-server-auth-session";
import { trpc } from "../../../utils/trpc";

const Player = ({
  name,
  image,
  rating,
}: {
  name: string;
  image: string;
  rating: number;
}) => {
  return (
    <div className="text-center">
      <div className="avatar">
        <div className="w-12 mask mask-squircle">
          <Image layout="fill" src={image} alt="Avatar" />
        </div>
      </div>
      <div className="text-gray-800">{name}</div>
      <div className="text-gray-400 font-mono">{Math.round(rating)}</div>
    </div>
  );
};

const GameResult = ({ id }: { id: string }) => {
  const gameResult = trpc.useQuery(["game.history.getById", { id }]);

  if (gameResult.error) {
    // error
    return null;
  }

  if (!gameResult.data) {
    // loading
    return null;
  }

  const { winner, loser, winnerScore, loserScore, date } = gameResult.data;

  return (
    <div
      style={{ width: 500 }}
      className="p-6 flex flex-col gap-3 bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700"
    >
      <div className="text-gray-400">{date.toDateString()}</div>
      <div className="mt-4 flex flex-row items-center justify-around">
        <Player
          name={winner.name!}
          image={winner.image!}
          rating={winner.rating}
        />
        <div className="rounded-lg w-16  px-0 py-1  text-center text-4xl">
          {winnerScore}
        </div>
        <div className="text-4xl font-bold text-gray-500 text-center ">-</div>
        <div className="rounded-lg w-16 px-0 py-1 text-center text-4xl">
          {loserScore}
        </div>
        <Player name={loser.name!} image={loser.image!} rating={loser.rating} />
      </div>
    </div>
  );
};

const GameResultPage: NextPage = () => {
  const router = useRouter();
  const { gameResultId } = router.query;

  if (typeof gameResultId !== "string") {
    return null; // TODO
  }

  return (
    <Layout>
      <GameResult id={gameResultId} />
    </Layout>
  );
};

export async function getServerSideProps(context: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
  query: GetServerSidePropsContext["query"];
}) {
  const session = await getServerAuthSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
}

export default GameResultPage;
