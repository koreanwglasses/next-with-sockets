import "../styles/globals.css";
import type { AppProps } from "next/app";
import { io, Socket } from "socket.io-client";
import { useEffect, useState, createContext } from "react";
import { post } from "../lib/fetchers";

export const SocketIOContext = createContext<Socket | null>(null);

function MyApp({ Component, pageProps }: AppProps) {
  // We only want one socket per client instance, so we
  // provide it at the root component level.

  const [context, setContext] = useState<Socket | null>(null);

  useEffect(() => {
    const socket = io({ path: "/api/socket/io" });

    socket.on("connect", async () => {
      await post("/api/socket/session/link", { socketId: socket.id });
      setContext(socket);
    });
    socket.on("disconnect", () => {
      setContext(null);
    });

    return () => {
      setContext(null);
      socket.disconnect();
    };
  },[]);

  return (
    <SocketIOContext.Provider value={context}>
      <Component {...pageProps} />;
    </SocketIOContext.Provider>
  );
}

export default MyApp;
