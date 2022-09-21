import { NextPage } from 'next';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import UserProfile from '../../components/profile/UserProfile';

const ProfilePage: NextPage = () => {
  const { userId } = useRouter().query;
  const session = useSession();
  const isMe = session?.data?.user?.id === userId;

  if (!userId) {
    return null;
  }

  return <UserProfile userId={userId as string} isMe={isMe} />;
};

export default ProfilePage;
