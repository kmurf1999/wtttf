import { GetServerSidePropsContext } from "next";
import { signIn, useSession } from "next-auth/react";
import { getServerAuthSession } from "../server/common/get-server-auth-session";

export default function Login() {
  const session = useSession();
  console.log(session);

  return (
    <main className="flex items-center justify-center bg-slate-500 min-h-screen">
      <div className="flex flex-col p-6 gap-6 bg-white rounded-lg">
        <h1 className="text-3xl text-center">Sign In</h1>
        <div className="divider" />
        <button className="btn btn-lg" onClick={() => signIn("github")}>
          Sign in with github
        </button>
      </div>
    </main>
  );
}

export async function getServerSideProps(context: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) {
  const session = await getServerAuthSession(context);

  if (session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}
