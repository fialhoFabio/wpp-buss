// import '../styles.css';

import type { ReactNode } from 'react';
import { Header } from 'components/header';
import { LayoutClient } from 'components/layout-client';

type RootLayoutProps = { children: ReactNode };

export default async function RootLayout({ children }: RootLayoutProps) {
  const data = await getData();

  return (
    <div className="font-['Nunito']">
      <meta name='description' content={data.description} />
      <link rel='icon' type='image/png' href={data.icon} />
      <link rel='preconnect' href='https://fonts.googleapis.com' />
      <link rel='preconnect' href='https://fonts.gstatic.com' crossOrigin='' />
      <link
        rel='stylesheet'
        href='https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,400;0,700;1,400;1,700&display=swap'
        precedence='font'
      />

      {/* Facebook SDK Integration */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.fbSDKReady = false;
            window.fbSDKError = null;
            window.fbAsyncInit = function() {
              try {
                var appId = '${import.meta.env.WAKU_PUBLIC_FB_APP_ID}';
                var version = 'v22.0';
                console.info('[FB SDK] Initializing... appId=' + appId + ' version=' + version);
                FB.init({
                  appId            : appId,
                  autoLogAppEvents : true,
                  xfbml            : false,
                  version          : version
                });
                window.fbSDKReady = true;
                console.info('[FB SDK] Initialized successfully');
              } catch (e) {
                window.fbSDKError = e;
                console.error('[FB SDK] Init failed:', e && e.message ? e.message : e);
              }
            };
          `,
        }}
      />
      <script async defer crossOrigin='anonymous' src={'https://connect.facebook.net/' + import.meta.env.WAKU_PUBLIC_FB_LANG + '/sdk.js'} />
      {/* <script async defer crossOrigin='anonymous' src={'https://connect.facebook.net/' + import.meta.env.WAKU_PUBLIC_FB_LANG + '/sdk/debug.js'} /> */}
      {/* End Facebook SDK Integration */}

      <LayoutClient>
        <Header />
        <main className='m-6 flex items-center *:min-h-64 *:min-w-64 lg:m-0 lg:min-h-svh lg:justify-center lg:pt-20'>
          {children}
        </main>
      </LayoutClient>
    </div>
  );
}

const getData = async () => {
  const data = {
    description: 'An internet website!',
    icon: '/images/favicon.png',
  };

  return data;
};

export const getConfig = async () => {
  return {
    render: 'static',
  } as const;
};
