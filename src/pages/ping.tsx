import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Collapse,
  Typography,
} from "@mui/material";
import { useList } from "react-use";
import { useSocket, useSocketIndex } from "../lib/use-socket";
import { useSubscription } from "../lib/use-subscription";
import { post } from "../lib/fetchers";

const Ping = () => {
  const [messages, { push }] = useList<string>();
  const [waiting, setWaiting] = useState<boolean>();
  const [error, setError] = useState<Error>();

  const socketIndex = useSocketIndex();

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
      <Typography>
        Current socket index: {socketIndex || <CircularProgress size={10} />}
      </Typography>
      <Collapse in={!!error}>
        <Alert severity="error">
          {error?.name}: {error?.message}
          <br />
          Try refreshing your browser
        </Alert>
      </Collapse>
      <Button
        disabled={waiting}
        variant="contained"
        onClick={async () => {
          try {
            await post("/api/ping", { socketIndex });
            setWaiting(true);
          } catch (e) {
            setError(e as any);
          }
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
