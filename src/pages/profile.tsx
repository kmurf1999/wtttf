import type { NextPage } from 'next';
import Layout from '../components/Layout';
import { trpc } from '../utils/trpc';
import Link from 'next/link';
import Image from 'next/image';

const Profile: NextPage = () => {
  const user = trpc.useQuery(['user.getMe']);

  if (!user.data) {
    // loading state
    return null;
  }

  const formatDate = (date: Date) => {
    return (
      (date.getMonth() > 8
        ? date.getMonth() + 1
        : '0' + (date.getMonth() + 1)) +
      '/' +
      (date.getDate() > 9 ? date.getDate() : '0' + date.getDate()) +
      '/' +
      date.getFullYear()
    );
  };

  return (
    <Layout>
      <div className="p-6 max-w-sm w-full bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700">
        <div className="flex flex-row items-center">
          <h1 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Player Profile
          </h1>
          <div className="flex-grow"></div>
          <Link href="/profile/edit">
            <a className="">Edit</a>
          </Link>
        </div>

        <div className="grid gap-4">
          <div className="avatar">
            <div className="w-10 mask mask-squircle">
              <Image layout="fill" src={user.data.image || ''} alt="Avatar" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              {user.data.name}
            </h3>
            <h5 className="mb-2 text-md tracking-tight text-gray-900 dark:text-white">
              {user.data.email}
            </h5>
          </div>
          <div className="flex h-16 border-t-2 border-b-2 border-slate-500 dark:border-white">
            <div className="flex w-1/3 text-center items-center border-r-2">
              <div className="w-full p-1">
                <p className="text-gray-900 dark:text-white">
                  {'Date Joined:'}
                </p>
                <p>
                  {user.data.emailVerified
                    ? formatDate(user.data.emailVerified)
                    : 'N/A'}
                </p>
              </div>
            </div>
            <div className="flex w-1/3 text-center items-center border-r-2">
              <div className="w-full p-1">
                <p className="text-gray-900 dark:text-white">{'Rating:'}</p>
                <p>{user.data.rating}</p>
              </div>
            </div>
            <div className="flex w-1/3 text-center items-center">
              <div className="w-full p-1">
                <p className="text-gray-900 dark:text-white">{'Wins-Losses'}</p>
                <p>{`${user.data.wins.length} - ${user.data.losses.length}`}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
