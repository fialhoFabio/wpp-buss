import { WhatsappNumbersTable } from 'components/facebook/numbers-table';

export default async function WhatsappNumbers() {
  return (
    <div className='container mx-auto max-w-7xl space-y-8 p-6'>
      <div>
        <h1 className='text-3xl font-bold text-gray-900'>Números do WhatsApp</h1>
        <p className='mt-2 text-gray-600'>Gerencie seus números do WhatsApp Business.</p>
      </div>
      
      <WhatsappNumbersTable />
    </div>
  );
}

export const getConfig = async () => {
  return {
    render: 'static',
  } as const;
};
