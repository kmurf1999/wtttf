import { PlusIcon } from '@heroicons/react/24/solid';
import type { GetServerSidePropsContext, NextPage } from 'next';
import Link from 'next/link';
import Layout from '../components/Layout';
import PlayerRankingTable from '../components/PlayerRankingTable';
import { getServerAuthSession } from '../server/common/get-server-auth-session';

const Home: NextPage = () => {
  return (
    <Layout>
      <div className="w-full sm:max-w-md p-6 flex flex-col gap-3 ">
        <h5 className="text-2xl font-bold tracking-tight text-gray-900 ">
          Play now
        </h5>
        <p className="mb-2 font-normal text-gray-400 ">
          Create a game to invite a player or join a game to accept an
          invitation.
        </p>

        <div className="flex flex-row gap-2">
          <Link href="play/create">
            <a className="btn btn-primary">
              <PlusIcon className="w-4 h-4 mr-2 text-white" />
              create game
            </a>
          </Link>
          <Link href="play/join">
            <a className="btn btn-outline">join game</a>
          </Link>
        </div>
      </div>
      <PlayerRankingTable />
    </Layout>
  );
};

export async function getServerSideProps(context: {
  req: GetServerSidePropsContext['req'];
  res: GetServerSidePropsContext['res'];
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

export default Home;
