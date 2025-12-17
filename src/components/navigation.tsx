'use client';

import { Link, useRouter } from 'waku';
import { useAuth } from 'lib/useAuth';

export const navigation = [
  { name: 'Link Whatsapp account', href: '/link-whatsapp-account' as const, requireAuth: true },
  { name: 'Whatsapp numbers', href: '/whatsapp-numbers' as const, requireAuth: true },
];

export const Navigation = () => {
  const { isAuthenticated } = useAuth();
  const { path } = useRouter();

  const visibleNav = navigation.filter(item => !item.requireAuth || isAuthenticated);

  if (visibleNav.length === 0) return null;

  return (
    <div className='hidden items-center gap-1 md:flex'>
      {visibleNav.map((item) => {
        const isActive = path === item.href;
        return (
          <Link
            key={item.name}
            to={item.href}
            className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            {item.name}
          </Link>
        );
      })}
    </div>
  );
};
