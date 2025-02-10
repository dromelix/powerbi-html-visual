import * as React from 'react';
import { getDomain } from './utils';

function getQueryParameter(url: string, paramKey: string) {
  if(!url) return;

  const urlParams = new URLSearchParams(new URL(url).search);
  let result = null;
  urlParams.forEach((value: string, key: string) => {
    if (paramKey.toLowerCase() === key.toLowerCase()) {
      result = value;
    }
  })

  return result;
}

function generateHMAC(key: string, message: string) {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key);
  const messageData = encoder.encode(message);

  return window.crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  ).then(key =>
    window.crypto.subtle.sign('HMAC', key, messageData)
  ).then(signatureBuffer => {
    return Array.from(new Uint8Array(signatureBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  }).catch(error => {
    console.error('Error generating HMAC:', error);
    throw new Error('Failed to generate signature');
  });
}

export type AppParams = {
  url: string;
  allowedDomains: string[];
}


interface IProps {
  updateCallback: any;
}
function App({ updateCallback }: IProps) {
  const [state, setState] = React.useState<AppParams>({
    url: '',
    allowedDomains: [],
  });

  const [url, setUrl] = React.useState<string>('');

  React.useEffect(() => {
    updateCallback(setState);
  }, [updateCallback]);

  const isValidUrl = React.useCallback((url: string) => {
    const domain = getDomain(url);
    if (!domain) return false;

    return state.allowedDomains.some(allowedDomain => 
      domain === allowedDomain || domain.endsWith(`.${allowedDomain}`)
    );
  }, [state.allowedDomains]);

  React.useEffect(() => {
    if (!state.url) return;

    if (!isValidUrl(state.url)) {
      console.error('Invalid URL');
      return;
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const projectId = getQueryParameter(state.url, 'projectID');
    const additionalString = getQueryParameter(state.url, 'URLadditionalstring');
    const message = `PowerBI Custom Visual-${projectId}-${timestamp}`;

    if (!projectId || !additionalString) {
      console.error('Invalid URL');
      return;
    }

    let isActive = true;

    generateHMAC(additionalString, message)
      .then(signature => {
        if (isActive) {
          setUrl(state.url + '&host=' + signature + "&time=" + timestamp);
        }
      }).catch(error => {
        console.error('Failed to generate URL:', error);
      });

    return () => {
      isActive = false;
    };
  }, [state.url]);


  if (!url) {
    return <></>;
  }

  return <iframe 
    src={url} 
    style={{
      width: '100vw',
      height: '100vh',
      position: 'absolute',
      top: 0,
      left: 0,
      border: 'none',
    }}
    sandbox='allow-scripts'
  ></iframe>;
}

export default App
