import React, { useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Collapse,
  Typography,
} from "@mui/material";
import { useList } from "react-use";
import { useSocket } from "../lib/use-socket";
import { useSubscription } from "../lib/use-subscription";

const Ping = () => {
  const [messages, { push }] = useList<string>();
  const [waiting, setWaiting] = useState<boolean>();

  const { data } = useSubscription("/api/socket/session/link");
  const { socketsLinked } = data ?? {};

  useSocket(
    (socket) => {
      socket.on("message", (message: string) => {
        push(message);
        setWaiting(false);
      });
    },
    [push]
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
      <Typography>
        {data ? socketsLinked : <CircularProgress size={10} />} sockets linked
        to current session
      </Typography>
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
