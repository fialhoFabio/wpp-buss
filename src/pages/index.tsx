import { LoginWithFacebookButton } from 'components/facebook/login-button';
import { LoginWithGoogleButton } from 'components/google/login-button';

export default async function HomePage() {
  await getData();

  return (
    <div className='p-6 flex flex-col gap-4'>
      <LoginWithFacebookButton/>
      <LoginWithGoogleButton/>
    </div>
  );
}

const getData = async () => {
  const data = {
    title: 'Waku',
    headline: 'Waku',
    body: 'Hello world!',
  };

  return data;
};

export const getConfig = async () => {
  return {
    render: 'static',
  } as const;
};
