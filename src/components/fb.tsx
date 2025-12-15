'use client';

export const FacebookLoader = () => {
  const FB = typeof window !== 'undefined' ? window.FB : null;
  console.log(FB)
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
      FB.login(function(response) {
      if (response.authResponse) {
        console.log('Welcome!  Fetching your information.... ');
        FB.api('/me', function(response) {
          console.log('Good to see you, ' + response.name + '.');
        });
        } else {
        console.log('User cancelled login or did not fully authorize.');
        }
    }, {scope: 'whatsapp_business_messaging'});
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
  const btnClass = "px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700";
  
  return (
    <div className="flex gap-3">
      <button onClick={shareOnFacebook} className={btnClass}>
        Share on Facebook
      </button>
      <button onClick={loginOnFacebook} className={btnClass}>
        Login on Facebook
      </button>
      <button onClick={getLoginStatus} className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-700">
        Get Login Status
      </button>
    </div>
  );
};