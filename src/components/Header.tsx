import { useSession } from "next-auth/react";
import Image from "next/image";
import { useSession } from "next-auth/react";


export default function Header() {
    const session = useSession();
    const user = session.data?.user;
    return (
        <nav className="w-full h-16 bg-white border-b flex flex-row items-center px-4">
          { 
            user &&
            <a href="/profile" className="w-full flex flex-row items-center gap-2">
              <div className="avatar">
                <div className="w-10 mask mask-squircle">
                  <Image layout="fill" src={user.image || ''} alt="Avatar" />
                </div> 
              </div>
              <div className="text-start text-black/[0.85]">{user.name}</div>
            </a>
          }
        </nav>
    );
}