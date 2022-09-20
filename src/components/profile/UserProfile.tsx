import {
  ArrowLeftIcon,
  ArrowLeftOnRectangleIcon,
  ChartBarIcon,
  ListBulletIcon,
} from '@heroicons/react/24/solid';
import { signOut } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { lazy, Suspense, useState } from 'react';
import Layout from '../../components/Layout';
import { trpc } from '../../utils/trpc';

const RatingHistory = lazy(
  () => import('../../components/profile/RatingHistory'),
);

const UserProfile = ({ userId, isMe }: { userId: string; isMe: boolean }) => {
  const [selectedTab, setSelectedTab] = useState<'games' | 'rating'>('games');
  const user = trpc.useQuery(['user.get', { userId }]);
  const router = useRouter();

  if (!user.data) {
    return null;
  }

  return (
    <Layout>
      <Link href="/">
        <a className="self-start mt-2 w-fit btn btn-sm btn-ghost text-gray-400 ">
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to home
        </a>
      </Link>
      <div className="w-full sm:max-w-md sm:mx-auto flex flex-col justify-center items-center pt-6">
        <div className="relative h-20 w-20 rounded-full overflow-hidden ">
          <Image layout="fill" src={user.data.image || ''} alt="Avatar" />
        </div>
        <div className="mb-4">
          <h2 className="text-center mt-2 text-2xl text-gray-900 font-semibold">
            {user.data.name}
          </h2>
          <p className="text-center text-sm text-gray-400">{user.data.email}</p>
        </div>
        {isMe && (
          <div className="mb-4 flex flex-row gap-2 items-center">
            <Link href="/profile/edit">
              <a className="btn btn-sm bg-blue-500 border-none text-white">
                Edit profile
              </a>
            </Link>
            <button
              className="btn btn-sm bg-gray-100 border-none text-gray-500"
              onClick={() => signOut().then(() => router.push('/'))}
            >
              <ArrowLeftOnRectangleIcon className="w-5 h-5" />
            </button>
          </div>
        )}
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
        <div className="w-full py-4 flex flex-row items-center justify-center gap-6 text-gray-400 border-b">
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
        {selectedTab === 'rating' && (
          <Suspense fallback={null}>
            <RatingHistory userId={user.data.id} />
          </Suspense>
        )}
      </div>
    </Layout>
  );
};

export default UserProfile;
