import '../styles.css';

import type { ReactNode } from 'react';
import { Footer } from '../components/footer';
import { Header } from '../components/header';

type RootLayoutProps = { children: ReactNode };

export default async function RootLayout({ children }: RootLayoutProps) {
  const data = await getData();

  return (
    <div className="font-['Nunito']">
      <meta name="description" content={data.description} />
      <link rel="icon" type="image/png" href={data.icon} />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,400;0,700;1,400;1,700&display=swap"
        precedence="font"
      />

      {/* Facebook SDK Integration */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.fbAsyncInit = function() {
              console.info('Loading Facebook SDK...');
              console.info('FB_APP_ID:', '${process.env.FB_APP_ID}');
              console.info('FB_LANG:', '${process.env.FB_LANG}');
              FB.init({
                appId            : '${process.env.FB_APP_ID}',
                autoLogAppEvents: true,
                xfbml            : false,
                version          : 'v24.0'
              });
            };
          `,
        }}
      />
      {/* <script async defer crossOrigin="anonymous" src={"https://connect.facebook.net/" + process.env.FB_LANG + "/sdk.js"} /> */}
      <script async defer crossOrigin="anonymous" src={"https://connect.facebook.net/" + process.env.FB_LANG + "/sdk/debug.js"} />
      {/* End Facebook SDK Integration */}

      <Header />
      <main className="m-6 flex items-center *:min-h-64 *:min-w-64 lg:m-0 lg:min-h-svh lg:justify-center">
        {children}
      </main>
      <Footer />
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
