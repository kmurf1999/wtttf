import type { GetServerSidePropsContext, NextPage } from 'next';
import Layout from '../components/Layout';
import { getServerAuthSession } from '../server/common/get-server-auth-session';

const Home: NextPage = () => {
  return (
    <Layout>
      <div className="w-full p-6 flex flex-col gap-3 bg-white rounded border border-gray-200 shadow-md sm:max-w-md">
        <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 ">
          Play now
        </h5>
        <p className="mb-6 font-normal text-gray-700 ">
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
