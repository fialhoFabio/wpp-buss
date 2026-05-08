'use client';

import { useState, useRef, useEffect } from 'react';
import { Link, useRouter } from 'waku';
import { useAuth } from 'lib/useAuth';
import { isDebugUser as checkDebugUser } from 'lib/debug';

const debugLinks = [
  { name: 'API Logs', href: '/api-logs' as const },
  { name: 'Facebook Debug', href: '/fb-debug' as const },
];

export const navigation = [
  { name: 'Link Whatsapp account', href: '/link-whatsapp-account' as const, requireAuth: true },
  { name: 'Conversas', href: '/conversations' as const, requireAuth: true },
];

const externalLinks = [
  { name: 'Números', href: 'https://business.facebook.com/latest/whatsapp_manager/phone_numbers/', requireAuth: true },
  { name: 'Templates', href: 'https://business.facebook.com/latest/whatsapp_manager/message_templates/', requireAuth: true },
  { name: 'Configurações WA', href: 'https://business.facebook.com/latest/settings/whatsapp_account/', requireAuth: true },
];

export const Navigation = () => {
  const { user, isAuthenticated } = useAuth();
  const { path } = useRouter();
  const [debugOpen, setDebugOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isDebugUser = checkDebugUser(user?.id);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDebugOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const visibleNav = navigation.filter(item => !item.requireAuth || isAuthenticated);
  const visibleExternal = externalLinks.filter(item => !item.requireAuth || isAuthenticated);

  if (visibleNav.length === 0 && visibleExternal.length === 0 && !isDebugUser) return null;

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
      {visibleExternal.length > 0 && (
        <div className='mx-1 h-4 w-px bg-gray-200' />
      )}
      {visibleExternal.map((item) => (
        <a
          key={item.name}
          href={item.href}
          target='_blank'
          rel='noopener noreferrer'
          className='inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900'
        >
          {item.name}
          <svg className='h-3 w-3 opacity-50' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
            <path strokeLinecap='round' strokeLinejoin='round' d='M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25' />
          </svg>
        </a>
      ))}
      {isDebugUser && (
        <>
          <div className='mx-1 h-4 w-px bg-gray-200' />
          <div className='relative' ref={dropdownRef}>
            <button
              onClick={() => setDebugOpen(prev => !prev)}
              className='inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-orange-500 transition-colors hover:bg-orange-50'
            >
              🛠 Debug
              <svg className={`h-3.5 w-3.5 transition-transform ${debugOpen ? 'rotate-180' : ''}`} fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
                <path strokeLinecap='round' strokeLinejoin='round' d='M19 9l-7 7-7-7' />
              </svg>
            </button>
            {debugOpen && (
              <div className='absolute right-0 z-50 mt-1 w-44 rounded-lg border border-gray-100 bg-white py-1 shadow-lg'>
                {debugLinks.map(item => {
                  const isActive = path === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setDebugOpen(false)}
                      className={`block px-4 py-2 text-sm transition-colors ${
                        isActive
                          ? 'bg-orange-50 text-orange-600 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
