import "../styles/globals.css";
import type { AppProps } from "next/app";
import React from "react";
import { SocketProvider } from "../components/socket-provider";

function App({ Component, pageProps }: AppProps) {
  // We only want one socket per client instance, so we
  // provide it at the root component level.
  return (
    <SocketProvider>
      <Component {...pageProps} />;
    </SocketProvider>
  );
}

export default App;
