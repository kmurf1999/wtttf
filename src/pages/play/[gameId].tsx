import { GetServerSidePropsContext, NextPage } from "next";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import { getServerAuthSession } from "../../server/common/get-server-auth-session";
import { trpc } from "../../utils/trpc";

const CurrentGame = ({ gameId }: { gameId: string }) => {
  const game = trpc.useQuery(["game.play.getGameById", { gameId }]);
  trpc.useSubscription(["game.play.subscribeToGame", { gameId }], {
    onError: (err) => {
      console.log(err);
    },
    onNext: (data) => {
      console.log(data);
    },
  });

  if (game.error) {
    // error state
    return null; // TODO
  }

  if (!game.data) {
    // loading
    return <div></div>;
  }

  return (
    <div
      style={{ width: 500 }}
      className="p-6 flex flex-col gap-3 bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700"
    ></div>
  );
};

const Play: NextPage = () => {
  const router = useRouter();
  const { gameId } = router.query;

  if (typeof gameId !== "string") {
    return null; // TODO
  }

  return (
    <Layout>
      <CurrentGame gameId={gameId} />
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

export default Play;
