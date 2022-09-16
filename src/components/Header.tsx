import Image from 'next/image';
import Link from 'next/link';
import { trpc } from '../utils/trpc';

export default function Header() {
  const user = trpc.useQuery(['user.getMe']);

  return (
    <nav className="w-full h-16 bg-white border-b flex flex-row items-center px-4">
      <button className="relative w-9 h-8">
        <Image layout="fill" src="/WTTTF_logo.png" alt="WTTTF logo" />
      </button>
      <div className="grow"></div>
      {user.data && (
        <Link href="/profile">
          <a className="flex flex-row items-center gap-2">
            <div className="avatar">
              <div className="w-10 mask mask-squircle">
                <Image layout="fill" src={user.data.image || ''} alt="Avatar" />
              </div>
            </div>
            <div className="text-start text-black/[0.85] font-bold">
              {user.data.name?.split(' ')[0]}
            </div>
          </a>
        </Link>
      )}
    </nav>
  );
}
