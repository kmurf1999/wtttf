import type { NextPage } from 'next';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import Layout from '../../components/Layout';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { trpc } from '../../utils/trpc';
import Link from 'next/link';

const schema = z.object({
  name: z.string(),
  isActive: z.string(),
});

const Profile: NextPage = () => {
  const session = useSession();
  const user = session.data?.user;
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  const context = trpc.useContext();
  const updateUserInfo = trpc.useMutation(['user.updateUserInfo'], {
    onSuccess: () => {
      context.invalidateQueries(['user.get']);
      reloadSession();
    },
  });

  const reloadSession = () => {
    const event = new Event('visibilitychange');
    document.dispatchEvent(event);
  };

  if (!user) {
    // loading state
    return null;
  }

  return (
    <Layout>
      <div className="p-6 max-w-sm bg-white rounded-lg border border-gray-200 shadow-md ">
        <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 ">
          Player Profile
        </h5>
        <p className="mb-6 font-normal text-gray-700 ">
          {'Edit your personal information here.'}
        </p>

        <form
          onSubmit={handleSubmit((formData) => {
            updateUserInfo.mutate(formData);
          })}
          className="flex flex-col gap-8"
        >
          <div className="grid gap-4">
            <div className="flex flex-row gap-2">
              <label htmlFor="name">Name:</label>
              <input defaultValue={user.name || ''} {...register('name')} />
              <p>{errors.name?.message?.toString()}</p>
            </div>
          </div>

          <div className="flex flex-row gap-2">
            <Link href="/">
              <a className="btn btn-primary btn-outline">back</a>
            </Link>
            <input
              type="submit"
              value="save changes"
              className="btn btn-primary"
            />
          </div>
          {user.isActive && (
            <div className="flex flex-row">
              <button
                className="btn btn-md bg-red-500 border-none text-white"
                onClick={(e) => {
                  setValue('isActive', 'false', { shouldDirty: true });
                }}
              >
                De-activate Profile
              </button>
            </div>
          )}
          {!user.isActive && (
            <div className="flex flex-row">
              <button
                className="btn btn-md bg-green-500 border-none text-white"
                onClick={(e) => {
                  setValue('isActive', 'true', { shouldDirty: true });
                }}
              >
                Re-activate Profile
              </button>
            </div>
          )}
        </form>
      </div>
    </Layout>
  );
};

export default Profile;
