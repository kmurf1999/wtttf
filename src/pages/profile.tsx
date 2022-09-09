import type { GetServerSidePropsContext, NextPage } from "next";
import Layout from "../components/Layout";
import { getServerAuthSession } from "../server/common/get-server-auth-session";

const Profile: NextPage = () => {
  return (
    <Layout>
      <div className="p-6 max-w-sm bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700">
        <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Player Profile
        </h5>
        <p className="mb-6 font-normal text-gray-700 dark:text-gray-400">
          {'Edit your personal information here. Or click "CANCEL" to close this page.'}
        </p>

        <div className="flex flex-row gap-2">
          <a href="../" className="btn btn-primary btn-outline">
            cancel
          </a>
          <a href="../" className="btn btn-primary">
            save changes
          </a>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;