import { GetServerSidePropsContext, NextPage } from 'next';
import UserProfile from '../../components/profile/UserProfile';
import { getServerAuthSession } from '../../server/common/get-server-auth-session';

const ProfilePage: NextPage<{ userId?: string }> = ({ userId }) => {
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
    props: { userId: session.user?.id },
  };
}

export default ProfilePage;
