import { GetServerSidePropsContext, NextPage } from 'next';
import { Session } from 'next-auth';
import UserProfile from '../../components/profile/UserProfile';
import { getServerAuthSession } from '../../server/common/get-server-auth-session';

const ProfilePage: NextPage<{ session: Session }> = ({ session }) => {
  const userId = session.user?.id;

  if (!userId) {
    return null;
  }

  return <UserProfile userId={userId} isMe={true} />;
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

export default ProfilePage;
