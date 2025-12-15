import { Link } from 'waku';
import { Counter } from '../components/counter';
import { FacebookLoader } from '../components/fb';

export default async function HomePage() {
  const data = await getData();

  return (
    <div>
      <FacebookLoader/>
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
