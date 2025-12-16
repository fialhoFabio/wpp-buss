'use client';
import { getWabaNumbers } from 'lib/facebook';
import { dbSaveWhatsappAccount, dbSaveWhatsappNumber } from 'lib/supabase';
import { useEffect } from 'react';

export function FacebookEmbbedSignupButton() {
  const FB = typeof window !== 'undefined' ? window.FB : null;

  useEffect(() => {
    // Session logging message event listener
    const handleMessage = async (event: MessageEvent) => {
      if (!event.origin.endsWith('facebook.com')) return;
      try {
        const response = JSON.parse(event.data);
        if (response.type === 'WA_EMBEDDED_SIGNUP') {
          console.log('message event: ', response); // remove after testing
          const {data} = response;
          const {insertData, error} = await dbSaveWhatsappAccount({
            business_id: data.business_id,
            waba_id: data.waba_id || '',
            status: 'active',
          });
          console.log('DB Save Result: ', insertData, error);
          if (!insertData) {
            console.error('Error saving WhatsApp account to DB');
            return;
          }
          const nm = await getWabaNumbers(insertData.waba_id);
          nm.data.forEach(async (number) => {
            console.log('WABA Number: ', number.display_phone_number);
            const {insertData: a, error: err} = await dbSaveWhatsappNumber({
              whatsapp_account_id: insertData.id,
              phone_number_id: number.id,
              display_phone_number: number.display_phone_number,
              verified_name: number.verified_name,
              quality_rating: number.quality_rating,
              platform_type: number.platform_type,
            });
            console.log('DB Save Number Result: ', a, err);
          });
        }
      } catch {
        console.log('message event: ', event.data); // remove after testing
        // your code goes here
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  function loginOnFacebook() {
    if (FB) {
      FB.login((res) => {
        console.log('FB login: ', res);
      }, {
        config_id: import.meta.env.WAKU_PUBLIC_FB_CONFIG_ID || '',
        response_type: 'code',
        override_default_response_type: true,
        extras: {
          setup: {
            business: {
              // Business portfolio data goes here
              name: 'Mdmed alerts',
              email: null,
              website: null,
              country: 'BR',
            },
            preVerifiedPhone: {
              // Pre-verified phone number IDs go here
            },
            phone: {
              // Phone number profile data goes here
            },
            whatsAppBusinessAccount: {
              // WABA IDs go here
            }
          },
        },
        // scope: 'whatsapp_business_messaging,whatsapp_business_management',
      });
    } else {
      console.log('Facebook SDK not loaded yet.');
    }
  }
  return <button onClick={loginOnFacebook}>Link your WhatsApp Business Account</button>;
}