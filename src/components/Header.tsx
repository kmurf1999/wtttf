import Image from 'next/image';
import Link from 'next/link';
import { trpc } from '../utils/trpc';

export default function Header() {
  const user = trpc.useQuery(['user.getMe']);

  return (
    <nav className="w-full h-16 min-h-16 bg-white border-b flex flex-row items-center px-4">
      <button className="relative w-9 h-8">
        <Image layout="fill" src="/WTTTF_logo.png" alt="WTTTF logo" />
      </button>
      <div className="grow"></div>
      {user.data && (
        <Link href="/profile">
          <a className="flex flex-row items-center gap-2 pl-3 pr-2 py-2 rounded-full text-gray-600 hover:bg-gray-200 hover:text-blue-500 transition-colors">
            <div className="text-start">{user.data.name}</div>
            <div className="avatar">
              <div className="w-8 mask mask-circle">
                <Image layout="fill" src={user.data.image || ''} alt="Avatar" />
              </div>
            </div>
          </a>
        </Link>
      )}
    </nav>
  );
}
