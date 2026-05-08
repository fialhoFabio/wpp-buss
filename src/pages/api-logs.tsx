import { ApiLogsTable } from 'components/api-logs/logs-table';

export default async function ApiLogsPage() {
  return (
    <div className='container mx-auto max-w-7xl space-y-6 px-6 pt-4 pb-6'>
      <div>
        <h1 className='text-3xl font-bold text-gray-900'>API Logs</h1>
        <p className='mt-2 text-gray-600'>Histórico de chamadas registradas pela API.</p>
      </div>

      <ApiLogsTable />
    </div>
  );
}

export const getConfig = async () => {
  return {
    render: 'static',
  } as const;
};
