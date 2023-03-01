import type { AppProps } from 'next/app';
import { ChakraProvider } from '@chakra-ui/react';
import { useNetworkSync } from '../hooks/auth/useNetworkSync';
import { theme } from '../config/chakraTheme';
import "../style/global.css"
import { useEffect, useState } from 'react';

const SmartStackApp = ({ Component, pageProps }: AppProps) => {
  useNetworkSync();
  const [chainState, setChainState] = useState("testnet")
  const [showChild, setShowChild] = useState(false);

  useEffect(() => {
    setShowChild(true);
  }, []);

  if (!showChild) {
    return null;
  }
  if (typeof window === 'undefined') {
    return <></>;
  } else {
    return (
      <ChakraProvider theme={theme}>
        <Component {...pageProps} chainState={chainState} setChainState={setChainState} />
      </ChakraProvider>
    );
  }
};

export default SmartStackApp;
