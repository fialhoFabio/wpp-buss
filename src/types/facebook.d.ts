declare global {
  interface Window {
    fbAsyncInit?: () => void;
    FB?: {
      __globalCallbacks: Record<string, any>;
      init: (params: {
        appId: string;
        xfbml?: boolean;
        version: string;
        cookie?: boolean;
        status?: boolean;
      }) => void;
      api: (path: string, method?: string, params?: any, callback?: (response: any) => void) => void;
      ui: (params: any, callback?: (response: any) => void) => void;
      getLoginStatus: (callback: (response: any) => void, roundtrip?: boolean) => void;
      login: (callback: (response: any) => void, options?: { 
        scope?: string; 
        auth_type?: string;
        config_id?: number;
        response_type?: string;
        override_default_response_type?: boolean;
        extras?: {
          config_id?: string;
          setup?: Record<string, any>;
        };
      }) => void;
      logout: (callback: (response: any) => void) => void;
      AppEvents: {
        EventNames: {
          COMPLETED_REGISTRATION: string;
          VIEWED_CONTENT: string;
          SEARCHED: string;
          RATED: string;
          COMPLETED_TUTORIAL: string;
          ADDED_TO_CART: string;
          ADDED_TO_WISHLIST: string;
          INITIATED_CHECKOUT: string;
          ADDED_PAYMENT_INFO: string;
          ACHIEVED_LEVEL: string;
          UNLOCKED_ACHIEVEMENT: string;
          PAGE_VIEW: string;
          SPENT_CREDITS: string;
        };
        ParameterNames: {
          APP_USER_ID: string;
          APP_VERSION: string;
          CURRENCY: string;
          REGISTRATION_METHOD: string;
          CONTENT_TYPE: string;
          CONTENT_ID: string;
          SEARCH_STRING: string;
          SUCCESS: string;
          MAX_RATING_VALUE: string;
          PAYMENT_INFO_AVAILABLE: string;
          NUM_ITEMS: string;
          LEVEL: string;
          DESCRIPTION: string;
        };
        logEvent: (eventName: string, valueToSum?: number, parameters?: Record<string, any>) => void;
        logPageView: () => void;
        logPurchase: (purchaseAmount: number, currency: string, parameters?: Record<string, any>) => void;
      };
      Canvas: {
        Plugin: Record<string, any>;
        Prefetcher: {
          COLLECT_AUTOMATIC: number;
          COLLECT_MANUAL: number;
          addStaticResource: (uri: string) => void;
          setCollectionMode: (mode: number) => void;
        };
      };
      Event: {
        subscribe: (event: string, callback: (response: any) => void) => void;
        unsubscribe: (event: string, callback: (response: any) => void) => void;
      };
      Frictionless: {
        _allowedRecipients: Record<string, any>;
      };
      gamingservices: Record<string, any>;
      XFBML: {
        parse: (element?: HTMLElement, callback?: () => void) => void;
      };
    };
  }
}

export {};
