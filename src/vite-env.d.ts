/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PAYPAL_CLIENT_ID: string
  // Add other env variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// PayPal types
declare global {
  interface Window {
    paypal?: {
      Buttons: any;
      FUNDING: any;
      actions: {
        order: {
          create: (data: any) => Promise<any>;
          capture: (orderId: string) => Promise<any>;
        };
      };
    };
    paypalReady?: () => void;
  }
}

export {}; 