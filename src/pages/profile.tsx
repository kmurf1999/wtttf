import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import Layout from "../components/Layout";

export interface FormData {
  email: string;
  name: string;
}

const Profile: NextPage = () => {
  const session = useSession();
  const user = session.data?.user;
  const { register, handleSubmit } = useForm();
  
  const onSubmit = (data: FormData) => {
    window.alert(JSON.stringify(data));
  }
  
  if (!user) {
    // loading state
    return null; 
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
        
        <form onSubmit={handleSubmit((d) => onSubmit(d as FormData))} className="flex flex-col gap-8">
          <div className="grid gap-4">
            <div className="flex flex-row gap-2">
              <label htmlFor="email">Email:</label>
              <input {...register("email"), { required: true, defaultValue: user.email || undefined }} />
            </div>

            <div className="flex flex-row gap-2">
              <label htmlFor="name">Name:</label>
              <input {...register("name"), { required: true, defaultValue: user.name || undefined }} />
            </div>
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