// Google APIs Types - Unified for Google Sign-In and Google Maps/Places
declare global {
  interface Window {
    google?: {
      // Google Sign-In / One Tap
      accounts?: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            cancel_on_tap_outside?: boolean;
            auto_select?: boolean;
            itp_support?: boolean;
            use_fedcm_for_prompt?: boolean;
          }) => void;
          prompt: (
            notification?: (notification: {
              isNotDisplayed: () => boolean;
              isSkippedMoment: () => boolean;
              isDismissedMoment?: () => boolean;
              getDismissedReason?: () => string;
            }) => void,
          ) => void;
          cancel: () => void;
        };
      };
      // Google Maps / Places API
      maps?: {
        places?: {
          Autocomplete: any;
        };
      };
    };
  }
}

export {};
