import React from 'react';
import {
  useMemo,
  useState,
  useEffect,
  useCallback,
  createContext,
  ReactNode
} from 'react';
import { cleanGoogleRecaptcha, injectGoogleReCaptchaScript } from './utils';

enum GoogleRecaptchaError {
  SCRIPT_NOT_AVAILABLE = 'Recaptcha script is not available'
}

interface IGoogleReCaptchaProviderProps {
  reCaptchaKey?: string;
  language?: string;
  useRecaptchaNet?: boolean;
  useEnterprise?: boolean;
  scriptProps?: {
    nonce?: string;
    defer?: boolean;
    async?: boolean;
    appendTo?: 'head' | 'body';
    id?: string;
  };
  autoLoadScript?: boolean;
  children: ReactNode;
}

export interface IGoogleReCaptchaConsumerProps {
  executeRecaptcha?: (action?: string) => Promise<string>;
  loadRecaptcha: () => Promise<void>;
}

const GoogleReCaptchaContext = createContext<IGoogleReCaptchaConsumerProps>({
  executeRecaptcha: () => {
    // This default context function is not supposed to be called
    throw Error(
      'GoogleReCaptcha Context has not yet been implemented, if you are using useGoogleReCaptcha hook, make sure the hook is called inside component wrapped by GoogleRecaptchaProvider'
    );
  },
  loadRecaptcha: async () => {
    return;
  }
});

const { Consumer: GoogleReCaptchaConsumer } = GoogleReCaptchaContext;

export function GoogleReCaptchaProvider({
  reCaptchaKey,
  useEnterprise = false,
  useRecaptchaNet = false,
  autoLoadScript = false,
  scriptProps,
  language,
  children,
}: IGoogleReCaptchaProviderProps) {
  const [greCaptchaInstance, setGreCaptchaInstance] = useState<null | {
    execute: Function;
  }>(null);

  const loadRecaptcha = () => new Promise<void>((resolve, reject) => {
    if (!reCaptchaKey) {
      console.warn('<GoogleReCaptchaProvider /> recaptcha key not provided');

      reject();
    }

    const onLoad = () => {
      if (!window || !(window as any).grecaptcha) {
        console.warn(
          `<GoogleRecaptchaProvider /> ${GoogleRecaptchaError.SCRIPT_NOT_AVAILABLE}`
        );

        reject();
      }

      const grecaptcha = useEnterprise
        ? (window as any).grecaptcha.enterprise
        : (window as any).grecaptcha;

      grecaptcha.ready(() => {
        setGreCaptchaInstance(grecaptcha);
        resolve();
      });
    };

    if (reCaptchaKey) {
      injectGoogleReCaptchaScript({
        reCaptchaKey,
        useEnterprise,
        useRecaptchaNet,
        scriptProps,
        language,
        onLoad
      });
    } else {
      reject();
    }
  });

  useEffect(() => {
    if (!autoLoadScript) {
      return;
    }
    loadRecaptcha().finally();

    return () => {
      const scriptId = scriptProps?.id || 'google-recaptcha-v3';
      cleanGoogleRecaptcha(scriptId);
    };
  }, [useEnterprise, useRecaptchaNet, scriptProps, language]);

  const executeRecaptcha = useCallback(
    async (action?: string) => {
      if (!greCaptchaInstance || !greCaptchaInstance.execute) {
        throw new Error(
          '<GoogleReCaptchaProvider /> Google Recaptcha has not been loaded'
        );
      }

      const result = await greCaptchaInstance.execute(reCaptchaKey, { action });

      return result;
    },
    [greCaptchaInstance]
  );

  const googleReCaptchaContextValue = useMemo(
    () => ({
      executeRecaptcha: greCaptchaInstance ? executeRecaptcha : undefined,
      loadRecaptcha
    }),
    [executeRecaptcha, greCaptchaInstance]
  );

  return (
    <GoogleReCaptchaContext.Provider value={googleReCaptchaContextValue}>
      {children}
    </GoogleReCaptchaContext.Provider>
  );
}

export { GoogleReCaptchaConsumer, GoogleReCaptchaContext };
