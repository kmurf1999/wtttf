import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import { useState } from "react";
import Layout from "../components/Layout";

const Profile: NextPage = () => {
  const session = useSession();
  const user = session.data?.user;
  const [ userName, setUserName ] = useState<string>(user?.name || '');
  
  const submit = (data) => {
    console.log('TEST', data);
    window.alert('Changes Saved!');
  }

  return (
    <Layout>
      <div className="p-6 max-w-sm bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700">
        <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Player Profile
        </h5>
        <p className="mb-6 font-normal text-gray-700 dark:text-gray-400">
          {'Edit your personal information here. Or click "CANCEL" to close this page.'}
        </p>
        
        <form onSubmit={submit} className="flex flex-col gap-8">
          <div className="grid">
            <p>TEST</p>
            <p>{userName}</p>
          </div>

          <div className="flex flex-row gap-2">
            <a href="../" className="btn btn-primary btn-outline">
              cancel
            </a>
            <input type="submit" value="save changes" className="btn btn-primary" />
          </div>
          
        </form>

      </div>
    </Layout>
  );
};

export default Profile;