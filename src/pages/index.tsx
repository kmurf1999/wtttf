import type { GetServerSidePropsContext, NextPage } from "next";
import Layout from "../components/Layout";
import { getServerAuthSession } from "../server/common/get-server-auth-session";

function winProbability(ratingA: number, ratingB: number) {
  return (
    (1.0 * 1.0) / (1 + 1.0 * Math.pow(10, (1.0 * (ratingA - ratingB)) / 400))
  );
}

// 0 = player1 wins, 1 = player2 wins
// 30 is the example k value
function calcElo(ratingA: number, ratingB: number, k: number, winner: 0 | 1) {
  const probA = winProbability(ratingA, ratingB);
  const probB = winProbability(ratingB, ratingA);
  if (winner === 0) {
    return [ratingA + k * (1 - probA), ratingB + k * (0 - probB)];
  }
  return [ratingA + k * (0 - probA), ratingB + k * (1 - probB)];
}

const Home: NextPage = (props) => {
  return (
    <Layout>
      <div className="p-6 max-w-sm bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700">
        <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Play now
        </h5>
        <p className="mb-6 font-normal text-gray-700 dark:text-gray-400">
          Create a game to invite an existing player or join a game to accept an
          invitation.
        </p>

        <div className="flex flex-row gap-2">
          <a href="play/join" className="btn btn-primary btn-outline">
            join game
          </a>
          <a href="play/create" className="btn btn-primary">
            create game
          </a>
        </div>
      </div>
    </Layout>
  );
};

export async function getServerSideProps(context: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
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

export default Home;
