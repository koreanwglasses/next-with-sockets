import "../styles/globals.css";
import type { AppProps } from "next/app";
import { io, Socket } from "socket.io-client";
import { useEffect, useState, createContext } from "react";

export const SocketIOContext = createContext<{
  socket?: Socket;
  socketIdx?: number;
}>({});

function App({ Component, pageProps }: AppProps) {
  // We only want one socket per client instance, so we
  // provide it at the root component level.

  const [context, setContext] = useState<{
    socket?: Socket;
    socketIdx?: number;
  }>({});

  useEffect(() => {
    const socket = io();
    setContext({ socket });

    socket.on("socket:linked", ({ socketIdx }) => {
      setContext({ socket, socketIdx });
    });

    socket.on("disconnect", () => {
      setContext({});
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <SocketIOContext.Provider value={context}>
      <Component {...pageProps} />;
    </SocketIOContext.Provider>
  );
}

export default App;
