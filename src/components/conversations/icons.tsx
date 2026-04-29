export const ClockIcon = () => (
  <svg className='inline h-3 w-3 text-gray-400' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
    <circle cx='12' cy='12' r='10' />
    <polyline points='12 6 12 12 16 14' />
  </svg>
);

export const SingleCheckIcon = () => (
  <svg className='inline h-3 w-3 text-gray-500' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5'>
    <polyline points='20 6 9 17 4 12' />
  </svg>
);

export const TemplateBadge = () => (
  <span className='mb-1 inline-block rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-blue-600'>Template</span>
);

export const ButtonBadge = () => (
  <span className='mb-1 inline-block rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-400'>Resposta de template</span>
);
