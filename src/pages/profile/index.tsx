import {
  ArrowLeftIcon,
  ArrowLeftOnRectangleIcon,
  ChartBarIcon,
  ListBulletIcon,
} from '@heroicons/react/24/solid';
import type { GetServerSidePropsContext, NextPage } from 'next';
import { signOut } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import Layout from '../../components/Layout';
import { getServerAuthSession } from '../../server/common/get-server-auth-session';
import { trpc } from '../../utils/trpc';

const Profile: NextPage = () => {
  const user = trpc.useQuery(['user.getMe']);
  const [selectedTab, setSelectedTab] = useState<'games' | 'rating'>('games');

  if (!user.data) {
    return null;
  }

  return (
    <Layout>
      <Link href="/">
        <a className="mt-2 w-fit btn btn-sm btn-ghost text-gray-400 ">
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to home
        </a>
      </Link>
      <div className="w-full sm:max-w-md sm:mx-auto flex flex-col justify-center items-center pt-6">
        <div className="relative h-20 w-20 rounded-full overflow-hidden ">
          <Image layout="fill" src={user.data.image || ''} alt="Avatar" />
        </div>
        <div>
          <h2 className="text-center mt-2 text-2xl text-gray-900 font-semibold">
            {user.data.name}
          </h2>
          <p className="text-center text-sm text-gray-400">{user.data.email}</p>
        </div>
        <div className="my-4 flex flex-row gap-2 items-center">
          <Link href="/profile/edit">
            <a className="btn btn-sm bg-blue-500 border-none text-white">
              Edit profile
            </a>
          </Link>
          <button
            className="btn btn-sm bg-gray-100 border-none text-gray-500"
            onClick={() => signOut()}
          >
            <ArrowLeftOnRectangleIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="w-full grid grid-cols-3 px-2 py-4 border-t border-b">
          <div className="text-center">
            <h3 className="text-sm text-gray-400">Joined</h3>
            <p className=" text-lg font-mono">
              {user.data.createdAt.toLocaleDateString()}
            </p>
          </div>
          <div className="text-center">
            <h3 className="text-sm text-gray-400">Rating</h3>
            <p className="text-xl font-mono">{Math.round(user.data.rating)}</p>
          </div>
          <div className="text-center">
            <h3 className="text-sm text-gray-400">Record</h3>
            <p className="text-xl font-mono">
              {user.data._count.wins} - {user.data._count.losses}
            </p>
          </div>
        </div>
        <div className="w-full py-4 flex flex-row items-center justify-center gap-6 text-gray-400">
          <button
            onClick={() => setSelectedTab('games')}
            className={[
              'rounded-xl btn btn-ghost btn-primary',
              selectedTab === 'games' && 'bg-gray-100 text-blue-500',
            ].join(' ')}
          >
            <ListBulletIcon className="w-5 h-5 mr-2" />
            Games
          </button>
          <button
            onClick={() => setSelectedTab('rating')}
            className={[
              'rounded-xl btn btn-ghost btn-primary',
              selectedTab === 'rating' && 'bg-gray-100 text-blue-500',
            ].join(' ')}
          >
            <ChartBarIcon className="w-5 h-5 mr-2" />
            Rating
          </button>
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

export default Profile;
