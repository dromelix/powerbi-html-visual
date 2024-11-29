import * as React from 'react';

import powerbi from "powerbi-visuals-api";
import IVisualHost = powerbi.extensibility.visual.IVisualHost;

export type AppParams = {
  url: string;
}

interface IProps {
  updateCallback: any;
  visualHost: IVisualHost;
}
function App({ updateCallback, visualHost }: IProps) {
  const [state, setState] = React.useState<AppParams>({
    url: '',
  });

  React.useEffect(() => {
    updateCallback(setState);
  }, [updateCallback]);

  if (!state.url) {
    return <></>;
  }

  return <iframe src={state.url} style={{width: '100vw', height: '100vh', position: 'absolute', top: 0, left: 0}}></iframe>;
}

export default App
