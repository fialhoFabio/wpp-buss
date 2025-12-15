'use client';

import { useState, useEffect } from "react";

export const FacebookLoader = () => {
  const FB = typeof window !== 'undefined' ? window.FB : null;
  const [business_account_id, set_business_account_id] = useState<string | undefined>(undefined);
  const [wb_code, set_wb_code] = useState<string | undefined>(undefined);
  console.log(FB)

  useEffect(() => {
    // Session logging message event listener
    const handleMessage = (event: MessageEvent) => {
      if (!event.origin.endsWith('facebook.com')) return;
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'WA_EMBEDDED_SIGNUP') {
          console.log('message event: ', data); // remove after testing
          // your code goes here
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

  function shareOnFacebook() {
    if (FB) {
      FB.ui(
        {
          method: 'share',
          href: 'https://developers.facebook.com/docs/',
        },
        function (response: any) {
          if (response && !response.error_message) {
            console.log('Posting completed.');
          } else {
            console.log('Error while posting.');
          }
        }
      );
    } else {
      console.log('Facebook SDK not loaded yet.');
    }
  }
  function loginOnFacebook() {
    if (FB) {
      FB.login((res) => {
        console.log('FB login: ', res);
        set_wb_code(res.authResponse?.code);
      }, {
        response_type: 'code',
        override_default_response_type: true,
        extras: {
          config_id: process.env.FB_CONFIG_ID || '',
          setup: {},
        },
        scope: 'whatsapp_business_messaging,whatsapp_business_management',
      });
    } else {
      console.log('Facebook SDK not loaded yet.');
    }
  }
  function getAccessToken() {
    if (FB) {
      FB.api(
        '/oauth/access_token',
        'GET',
        {
          client_id: process.env.FB_APP_ID,
          client_secret: process.env.FB_APP_SECRET,
          code: wb_code,
        },
        function(response: any) {
          console.log('Access Token:', response);
        }
      );
    } else {
      console.log('Facebook SDK not loaded yet.');
    }
  }
  function getLoginStatus() {
    if (FB) {
      FB.getLoginStatus(function(response: any) {
        console.log('Login status:', response);
      });
    } else {
      console.log('Facebook SDK not loaded yet.');
    }
  }
  function logoutFromFacebook() {
    if (FB) {
      FB.logout(function(response) {
        console.log('User logged out:', response);
      });
    } else {
      console.log('Facebook SDK not loaded yet.');
    }
  }
  function getWhatsappBusiness(id?: string) {
    if (FB) {
      FB.api(
        `/${id}`,
        'GET',
        {},
        function(response: any) {
          console.log('WhatsApp Business:', response);
        }
      );
    } else {
      console.log('Facebook SDK not loaded yet.');
    }
  }
  function me(){
    if (FB) {
      FB.api(
        '/me',
        'GET',
        {},
        function(response: any) {
          console.log('Me:', response);
        }
      );
    } else {
      console.log('Facebook SDK not loaded yet.');
    }
  }
  function meBusinesses(){
    if (FB) {
      FB.api(
        '/me/businesses',
        'GET',
        {},
        function(response: any) {
          console.log('Me:', response);
        }
      );
    } else {
      console.log('Facebook SDK not loaded yet.');
    }
  }
  function messageOnWhatsapp() {
    if (FB) {
      // FB.api(

      // )
    } else {
      console.log('Facebook SDK not loaded yet.');
    }
  }
  const btnClass = "px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700";
  
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h3>Code: {wb_code}</h3>
      <button disabled={!wb_code} onClick={getAccessToken} className={btnClass}>
        Get Access Token
      </button>
      {/* Facebook Actions */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Facebook</h3>
        <div className="flex flex-wrap gap-3">
          <button onClick={loginOnFacebook} className={btnClass}>
            Login
          </button>
          <button onClick={getLoginStatus} className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-700">
            Check Status
          </button>
          <button onClick={logoutFromFacebook} className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700">
            Logout
          </button>
          <button onClick={shareOnFacebook} className={btnClass}>
            Share on Facebook
          </button>
          <button onClick={me} className={btnClass}>
            Get Me
          </button>
        </div>
      </div>

      {/* WhatsApp Business */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">WhatsApp Business</h3>
        <button onClick={meBusinesses} className={btnClass}>
          Get My Businesses
        </button>
        <div className="flex flex-wrap gap-3 items-center">
          <input 
            type="text" 
            placeholder="Business Account ID" 
            value={business_account_id} 
            onChange={(e) => set_business_account_id(e.target.value)} 
            className="px-3 py-2 border border-gray-300 rounded flex-1 min-w-[200px]"
          />
          <button onClick={() => getWhatsappBusiness(business_account_id)} className={btnClass}>
            Get Business Info
          </button>
          <button onClick={messageOnWhatsapp} className={btnClass}>
            Send Message
          </button>
        </div>
      </div>
    </div>
  );
}
