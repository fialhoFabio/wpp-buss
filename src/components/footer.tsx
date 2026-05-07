import { Link } from 'waku';

export const Footer = () => {
  return (
    <footer className='border-t border-gray-100 bg-white px-6 py-4 lg:fixed lg:bottom-0 lg:left-0 lg:right-0'>
      <div className='mx-auto flex max-w-7xl items-center justify-between text-xs text-gray-400'>
        <span>© {new Date().getFullYear()} Mdmed Alerts</span>
        <Link to='/privacy-policy' className='hover:text-gray-600'>
          Política de Privacidade
        </Link>
      </div>
    </footer>
  );
};
