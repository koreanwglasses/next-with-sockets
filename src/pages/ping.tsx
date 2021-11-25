import React, { useCallback, useState } from "react";
import { Box, Button, CircularProgress, Collapse } from "@mui/material";
import { useList } from "react-use";
import { useSocket } from "../lib/use-socket";

const Ping = () => {
  const [messages, { push }] = useList<string>();
  const [waiting, setWaiting] = useState<boolean>();

  useSocket(
    useCallback(
      (socket) => {
        socket.on("connect", () => {
          console.log("Connected to socket!", socket.id);
        });

        socket.on("message", (message: string) => {
          push(message);
          setWaiting(false);
        });
      },
      [push]
    )
  );

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 1,
      }}
    >
      <Button
        disabled={waiting}
        variant="contained"
        onClick={async () => {
          const res = await fetch("/api/ping", { method: "post" });
          if (res.ok) setWaiting(true);
        }}
      >
        Ping
      </Button>
      {[...messages, ""].map((message, i) => (
        <Collapse key={i} in={message !== ""}>
          {message}
        </Collapse>
      ))}
      {waiting && <CircularProgress />}
    </Box>
  );
};

export default Ping;
