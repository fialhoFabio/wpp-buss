import { Icons } from './icons';

export const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    active: 'bg-green-100 text-green-800 border-green-200',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    inactive: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  const style = styles[status] ?? styles['inactive'] ?? '';

  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${style}`}>
      {status}
    </span>
  );
};

export const VerificationBadge = ({ status }: { status?: 'checking' | 'valid' | 'invalid' | undefined }) => {
  if (status === 'checking') {
    return (
      <span className='inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10'>
        <Icons.Spinner className='h-3 w-3 text-blue-600' />
        Verificando
      </span>
    );
  }

  if (status === 'valid') {
    return (
      <span className='inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20'>
        <Icons.CheckCircle className='h-3.5 w-3.5' />
        Válido
      </span>
    );
  }

  if (status === 'invalid') {
    return (
      <span className='inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10'>
        <Icons.XCircle className='h-3.5 w-3.5' />
        Inválido
      </span>
    );
  }

  return <span className='text-xs text-gray-400'>-</span>;
};
