import { RedirectClientIfLogged } from 'components/redirect-client-if-logged';

export default async function AuthCallback() {
  return (
    <>
      <RedirectClientIfLogged />
      <div>Finalizando login...</div>
    </>
  );
}

export const getConfig = async () => {
  return {
    render: 'static',
  } as const;
};
