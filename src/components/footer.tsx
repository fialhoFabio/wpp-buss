import { Link } from 'waku';

export const Footer = () => {
  return (
    <footer className='p-6 lg:fixed lg:bottom-0 lg:left-0'>
      <div className='flex flex-col gap-2 text-sm text-gray-600'>
        <span>Under development</span>
        <Link to='/privacy-policy' className='font-medium text-blue-600 hover:text-blue-700'>
          Política de Privacidade
        </Link>
      </div>
    </footer>
  );
};
