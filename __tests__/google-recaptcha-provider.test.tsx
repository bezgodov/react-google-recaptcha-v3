import * as React from 'react';
import { GoogleReCaptchaProvider } from 'src/google-recaptcha-provider';
import { render, waitFor } from '@testing-library/react';

describe('<GoogleReCaptchaProvider />', () => {
  it('inject google recaptcha script to the document', () => {
    render(
      <GoogleReCaptchaProvider reCaptchaKey="TESTKEY" useRecaptchaNet autoLoadScript>
        <div />
      </GoogleReCaptchaProvider>
    );

    const scriptElm = document.querySelector('#google-recaptcha-v3');
    expect(scriptElm).not.toBeNull();
  });

  it('remove google recaptcha script from the document when being unmounted', async () => {
    const { unmount } = render(
      <GoogleReCaptchaProvider reCaptchaKey="TESTKEY" useRecaptchaNet autoLoadScript>
        <div />
      </GoogleReCaptchaProvider>
    );

    const scriptElm = document.querySelector('#google-recaptcha-v3');
    expect(scriptElm).not.toBeNull();

    unmount();

    await waitFor(() => {
      const scriptElm = document.querySelector('#google-recaptcha-v3');
      expect(scriptElm).toBeNull();
    });
  });

  it('accept a useRecaptchaNet prop to load recaptcha from recaptcha.net', () => {
    render(
      <GoogleReCaptchaProvider reCaptchaKey="TESTKEY" useRecaptchaNet autoLoadScript>
        <div />
      </GoogleReCaptchaProvider>
    );

    const scriptElm = document.querySelector('#google-recaptcha-v3');

    expect(scriptElm!.getAttribute('src')).toEqual(
      'https://www.recaptcha.net/recaptcha/api.js?render=TESTKEY'
    );
  });

  it('puts a nonce to the script if provided', () => {
    render(
      <GoogleReCaptchaProvider
        reCaptchaKey="TESTKEY"
        scriptProps={{ nonce: 'NONCE' }}
        autoLoadScript
      >
        <div />
      </GoogleReCaptchaProvider>
    );

    const scriptElm = document.getElementById('google-recaptcha-v3');

    expect(scriptElm!.getAttribute('nonce')).toEqual('NONCE');
  });

  it('puts a defer to the script if provided', () => {
    render(
      <GoogleReCaptchaProvider
        reCaptchaKey="TESTKEY"
        scriptProps={{
          nonce: 'NONCE',
          defer: true
        }}
        autoLoadScript
      >
        <div />
      </GoogleReCaptchaProvider>
    );

    const scriptElm = document.getElementById('google-recaptcha-v3');

    expect(scriptElm!.getAttribute('defer')).toEqual('');
  });

  describe('when using enterprise version', () => {
    it('accept an enterprise prop to load recaptcha from enterprise source', () => {
      render(
        <GoogleReCaptchaProvider reCaptchaKey="TESTKEY" useEnterprise autoLoadScript>
          <div />
        </GoogleReCaptchaProvider>
      );

      const scriptElm = document.getElementById('google-recaptcha-v3');

      expect(scriptElm!.getAttribute('src')).toEqual(
        'https://www.google.com/recaptcha/enterprise.js?render=TESTKEY'
      );
    });

    it('should not load recaptcha from recaptcha.net', () => {
      render(
        <GoogleReCaptchaProvider
          reCaptchaKey="TESTKEY"
          useEnterprise
          useRecaptchaNet
          autoLoadScript
        >
          <div />
        </GoogleReCaptchaProvider>
      );

      const scriptElm = document.getElementById('google-recaptcha-v3');

      expect(scriptElm!.getAttribute('src')).toEqual(
        'https://www.google.com/recaptcha/enterprise.js?render=TESTKEY'
      );
    });
  });
});
