import type { NextPage } from 'next';
import { useForm } from 'react-hook-form';
import Layout from '../../components/Layout';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { trpc } from '../../utils/trpc';
import Link from 'next/link';

const schema = z.object({
  name: z.string(),
});

const EditProfile: NextPage = () => {
  const user = trpc.useQuery(['user.getMe']);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  const context = trpc.useContext();
  const updateUserInfo = trpc.useMutation(['user.updateUserInfo'], {
    onSuccess: () => {
      context.invalidateQueries(['user.getMe']);
    },
  });

  if (!user.data) {
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
              <input
                defaultValue={user.data.name || ''}
                {...register('name')}
              />
              <p>{errors.name?.message?.toString()}</p>
            </div>
          </div>

          <div className="flex flex-row gap-2">
            <Link href="/profile">
              <a className="btn btn-primary btn-outline">back</a>
            </Link>
            <input
              type="submit"
              value="save changes"
              className="btn btn-primary"
            />
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default EditProfile;
