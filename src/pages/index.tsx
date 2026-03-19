// import { LoginWithFacebookButton } from 'components/facebook/login-button';
import { LoginWithGoogleButton } from 'components/google/login-button';
import { EmailLoginForm } from 'components/auth/email-login-form';

export default async function HomePage() {
  await getData();

  return (
    <div className='flex w-full flex-col items-center justify-center py-12'>
      <div className='w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl ring-1 ring-gray-900/5 sm:p-10'>
        
        {/* Header Section */}
        <div className='flex flex-col items-center text-center'>
          <div className='rounded-2xl bg-gradient-to-tr from-green-500 to-green-400 p-3 shadow-lg'>
             <svg className='h-8 w-8 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' />
             </svg>
          </div>
          <h1 className='mt-6 text-2xl font-bold tracking-tight text-gray-900'>
            Mdmed Alerts
          </h1>
          <p className='mt-2 text-sm text-gray-500'>
            Entre para gerenciar suas contas.
          </p>
        </div>

        {/* Social Buttons Section */}
        <div className='mt-8 flex flex-col gap-3 [&>button]:w-full [&>button]:rounded-lg [&>button]:py-2.5 [&>button]:font-medium [&>button]:shadow-sm [&>button]:transition-all'>
           {/* <div className='[&>button]:w-full [&>button]:!bg-[#1877F2] [&>button]:hover:!bg-[#166fe5]'>
             <LoginWithFacebookButton/>
           </div> */}
          <div className='[&>button]:w-full [&>button]:!bg-white [&>button]:!text-gray-700 [&>button]:ring-1 [&>button]:ring-inset [&>button]:ring-gray-300 [&>button]:hover:!bg-gray-50'>
             <LoginWithGoogleButton/>
          </div>
        </div>

        {/* Divider */}
        <div className='relative mt-8 mb-8'>
          <div className='absolute inset-0 flex items-center' aria-hidden='true'>
            <div className='w-full border-t border-gray-200'></div>
          </div>
          <div className='relative flex justify-center'>
            <span className='bg-white px-3 text-xs font-semibold uppercase tracking-wider text-gray-400'>
              Ou e-mail
            </span>
          </div>
        </div>

        {/* Email Form */}
        <EmailLoginForm />

        {/* Footer */}
        <p className='mt-8 text-center text-xs text-gray-400'>
          Sistema seguro e integrado com as APIs oficiais.
        </p>
      </div>
    </div>
  );
}

const getData = async () => {
  const data = {
    title: 'Mdmed Alerts Manager',
    headline: 'Centralize sua operação',
    body: 'Hello world!',
  };

  return data;
};

export const getConfig = async () => {
  return {
    render: 'static',
  } as const;
};
