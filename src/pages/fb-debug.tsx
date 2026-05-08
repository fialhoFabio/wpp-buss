import { FbDebugPanel } from 'components/facebook/fb-debug-panel';

export default async function FbDebugPage() {
  return (
    <div className='w-full max-w-5xl space-y-6 px-6 pt-4 pb-6 self-start'>
      <div>
        <h1 className='text-3xl font-bold text-gray-900'>Facebook Debug</h1>
        <p className='mt-2 text-gray-600'>Inspecionar chamadas à Graph API do Meta.</p>
      </div>

      <FbDebugPanel />
    </div>
  );
}

export const getConfig = async () => {
  return {
    render: 'static',
  } as const;
};
