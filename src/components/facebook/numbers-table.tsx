'use client';

import { dbGetWhatsappNumbers } from 'lib/supabase';
import { useEffect } from 'react';

export const WhatsappNumbersTable = () => {
  useEffect(() => {
    // Fetch numbers data from API or state management
    const fetchNumbers = async () => {
      const data = await dbGetWhatsappNumbers();
      console.log(data);
    };
    fetchNumbers();
  }, []);

  return (
    <table className='min-w-full table-auto border-collapse border border-gray-300'>
      <thead>
        <tr>
          <th className='border border-gray-300 px-4 py-2'>Number</th>
          <th className='border border-gray-300 px-4 py-2'>Status</th>
          <th className='border border-gray-300 px-4 py-2'>Created At</th>
        </tr>
      </thead>
      <tbody>
        {/* Example row */}
        <tr>
          <td className='border border-gray-300 px-4 py-2'>+1234567890</td>
          <td className='border border-gray-300 px-4 py-2'>Active</td>
          <td className='border border-gray-300 px-4 py-2'>2024-01-01</td>
        </tr>
      </tbody>
    </table>
  );
};