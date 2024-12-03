import * as React from 'react';

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

function generateHMAC(secretKey: string, message: string) {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secretKey);
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
  });
}

export type AppParams = {
  url: string;
}

interface IProps {
  updateCallback: any;
}
function App({ updateCallback }: IProps) {
  const [state, setState] = React.useState<AppParams>({
    url: '',
  });

  const [url, setUrl] = React.useState<string>('');

  React.useEffect(() => {
    updateCallback(setState);
  }, [updateCallback]);

  React.useEffect(() => {
    const timestamp = Math.floor(Date.now() / 1000);
    const projectId = getQueryParameter(state.url, 'projectID');
    const projectSecretKey = getQueryParameter(state.url, 'secretKey');
    const message = `PowerBI Custom Visual-${projectId}-${timestamp}`;

    if (!projectId || !projectSecretKey) return;

    generateHMAC(projectSecretKey, message).then(signature => {
      setUrl(state.url + '&host=' + signature + "&time=" + timestamp);
    })
  }, [state.url]);

  if (!url) {
    return <></>;
  }

  return <iframe src={url} style={{width: '100vw', height: '100vh', position: 'absolute', top: 0, left: 0, border: 'none'}}></iframe>;
}

export default App
