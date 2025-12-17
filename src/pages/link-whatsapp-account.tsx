import { WhatsappAccountsTable } from 'components/facebook/accounts-table';

export default async function LinkWhatsappAccount() {
  return (
    <div className='container mx-auto max-w-7xl space-y-6 px-6 pt-4 pb-6'>
      <div>
        <h1 className='text-3xl font-bold text-gray-900'>Vincular Conta do WhatsApp Business</h1>
        <p className='mt-2 text-gray-600'>Conecte sua conta do WhatsApp Business para começar a enviar mensagens.</p>
      </div>

      <div>
        <WhatsappAccountsTable />
      </div>
    </div>
  );
}

export const getConfig = async () => {
  return {
    render: 'static',
  } as const;
};
