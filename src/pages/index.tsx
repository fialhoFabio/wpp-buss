import { LoginWithFacebookButton } from 'components/facebook/login-button';

export default async function HomePage() {
  await getData();

  return (
    <div>
      <LoginWithFacebookButton/>
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
