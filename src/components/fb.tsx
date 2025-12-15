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
      FB.login(function(response: any) {
        if (response.authResponse) {
          console.log('Welcome!  Fetching your information.... ');
          FB.api('/me',function(response: any) {
            console.log('Good to see you, ' + response.name + '.');
          });
        } else {
          console.log('User cancelled login or did not fully authorize.');
        }
      });
    } else {
      console.log('Facebook SDK not loaded yet.');
    }
  }
  return (
    <div className="flex gap-4">
      <button 
        onClick={shareOnFacebook}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
      >
        Share on Facebook
      </button>
      <button 
        onClick={loginOnFacebook}
        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
      >
        Login on Facebook
      </button>
    </div>
  );
};