import { GetServerSidePropsContext, NextPage } from "next";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import { getServerAuthSession } from "../../server/common/get-server-auth-session";

const Play: NextPage = () => {
  const router = useRouter();
  const { gameId } = router.query;

  return <Layout>TEST</Layout>;
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
