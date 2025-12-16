import { FacebookEmbbedSignupButton } from 'components/facebook/embbed-signup-button';

export default async function DashboardPage() {
  return (
    <div className='p-6'>
      <h1 className='text-3xl font-bold'>Dashboard</h1>
      <FacebookEmbbedSignupButton />
    </div>
  );
}

export const getConfig = async () => {
  return {
    render: 'static',
  } as const;
};
